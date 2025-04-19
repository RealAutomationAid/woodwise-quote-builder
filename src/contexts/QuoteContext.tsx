import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProductType {
  id: string;
  name: string;
  category?: string;
  material: string;
  lengths: number[];
  isPlaned: boolean;
  pricePerUnit: number;
  description?: string;
  stock_quantity: number;
}

export interface ProductConfigType {
  length: number;
  width?: number;
  material: string;
  isPlaned: boolean;
  quantity: number;
  note?: string;
}

export interface QuoteItemType {
  id: string;
  product: ProductType;
  config: ProductConfigType;
}

interface QuoteContextType {
  quoteItems: QuoteItemType[];
  addItem: (product: ProductType, config: ProductConfigType) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, config: ProductConfigType) => void;
  clearQuote: () => void;
  submitQuote: (isDraft?: boolean, contact?: { email?: string; phone?: string }) => Promise<boolean>;
  loading: boolean;
  isLoading: boolean;
  calculateTotal: () => number;
}

interface ShoppingBagItem {
  id: string;
  bag_id: string;
  product_id: string;
  length: number;
  material: string;
  is_planed: boolean;
  quantity: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface ShoppingBag {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: ShoppingBagItem[];
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quoteItems, setQuoteItems] = useState<QuoteItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  // Fetch shopping bag and items from Supabase
  const { data: shoppingBag, isLoading, refetch } = useQuery({
    queryKey: ['shoppingBag', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // First, get or create shopping bag
      let bag;
      const { data: existingBag, error: bagError } = await supabase
        .from('shopping_bags')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (bagError && bagError.code !== 'PGRST116') {
        console.error('Error fetching shopping bag:', bagError);
        throw bagError;
      }

      if (!existingBag) {
        // Create a new shopping bag
        const { data: newBag, error: createError } = await supabase
          .from('shopping_bags')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating shopping bag:', createError);
          throw createError;
        }
        bag = newBag;
      } else {
        bag = existingBag;
      }

      // Now fetch the bag items
      const { data: bagItems, error: itemsError } = await supabase
        .from('shopping_bag_items')
        .select('*')
        .eq('bag_id', bag.id);

      if (itemsError) {
        console.error('Error fetching shopping bag items:', itemsError);
        throw itemsError;
      }

      // Fetch product details for each item
      const productIds = bagItems.map(item => item.product_id);
      let products: Record<string, ProductType> = {};

      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
          throw productsError;
        }

        // Create a map of product id to product
        productsData.forEach(product => {
          products[product.id] = {
            id: product.id,
            name: product.name,
            material: product.material,
            lengths: product.lengths,
            isPlaned: product.is_planed,
            pricePerUnit: product.price_per_unit,
            description: product.description,
            stock_quantity: product.stock_quantity
          };
        });
      }

      return {
        ...bag,
        items: bagItems,
        products
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true
  });

  // Mutation to add an item to the bag
  const addItemMutation = useMutation({
    mutationFn: async (payload: { product: ProductType, config: ProductConfigType }) => {
      if (!user || !shoppingBag) throw new Error('User not logged in or bag not initialized');

      const { data, error } = await supabase
        .from('shopping_bag_items')
        .insert([{
          bag_id: shoppingBag.id,
          product_id: payload.product.id,
          length: payload.config.length,
          material: payload.config.material,
          is_planed: payload.config.isPlaned,
          quantity: payload.config.quantity,
          note: payload.config.note
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding item to bag:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation to remove an item from the bag
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase
        .from('shopping_bag_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing item from bag:', error);
        throw error;
      }

      return itemId;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation to update an item in the bag
  const updateItemMutation = useMutation({
    mutationFn: async (payload: { id: string, config: ProductConfigType }) => {
      if (!user) throw new Error('User not logged in');

      const { error } = await supabase
        .from('shopping_bag_items')
        .update({
          length: payload.config.length,
          material: payload.config.material,
          is_planed: payload.config.isPlaned,
          quantity: payload.config.quantity,
          note: payload.config.note,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.id);

      if (error) {
        console.error('Error updating item in bag:', error);
        throw error;
      }

      return payload;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Mutation to clear the bag
  const clearBagMutation = useMutation({
    mutationFn: async () => {
      if (!user || !shoppingBag) throw new Error('User not logged in or bag not initialized');

      const { error } = await supabase
        .from('shopping_bag_items')
        .delete()
        .eq('bag_id', shoppingBag.id);

      if (error) {
        console.error('Error clearing bag:', error);
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Convert shopping bag data to quote items
  useEffect(() => {
    if (shoppingBag && shoppingBag.items && shoppingBag.products) {
      const items: QuoteItemType[] = shoppingBag.items.map(item => ({
        id: item.id,
        product: shoppingBag.products[item.product_id],
        config: {
          length: item.length,
          material: item.material,
          isPlaned: item.is_planed,
          quantity: item.quantity,
          note: item.note
        }
      }));
      setQuoteItems(items);
    } else if (!user) {
      // For non-logged in users, try to get from localStorage
      const storedItems = localStorage.getItem('quoteItems');
      if (storedItems) {
        try {
          setQuoteItems(JSON.parse(storedItems));
        } catch (e) {
          console.error('Failed to parse stored quote items:', e);
          localStorage.removeItem('quoteItems');
        }
      }
    }
  }, [shoppingBag, user]);

  // For non-logged in users, persist to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('quoteItems', JSON.stringify(quoteItems));
    }
  }, [quoteItems, user]);

  const addItem = (product: ProductType, config: ProductConfigType) => {
    if (user) {
      addItemMutation.mutate({ product, config });
    } else {
      // For non-logged in users, use local state
      setQuoteItems(prev => [...prev, { 
        id: uuidv4(),
        product,
        config
      }]);
    }
  };

  const removeItem = (id: string) => {
    if (user) {
      removeItemMutation.mutate(id);
    } else {
      // For non-logged in users, use local state
      setQuoteItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, config: ProductConfigType) => {
    if (user) {
      updateItemMutation.mutate({ id, config });
    } else {
      // For non-logged in users, use local state
      setQuoteItems(prev => prev.map(item => 
        item.id === id ? { ...item, config } : item
      ));
    }
  };

  const clearQuote = () => {
    if (user) {
      clearBagMutation.mutate();
    } else {
      // For non-logged in users, use local state
      setQuoteItems([]);
      localStorage.removeItem('quoteItems');
    }
  };

  const calculateTotal = () => {
    return quoteItems.reduce((total, item) => {
      const itemPrice = item.product.pricePerUnit * item.config.quantity;
      return total + itemPrice;
    }, 0);
  };

  const submitQuote = async (isDraft: boolean = false, contact?: { email?: string; phone?: string }): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to submit a quote');
      return false;
    }

    if (quoteItems.length === 0) {
      toast.error('Your quote is empty');
      return false;
    }

    setLoading(true);
    try {
      // Generate a quote number (simple format for demo)
      const quoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Calculate total amount
      const totalAmount = calculateTotal();
      
      console.log('Submitting quote with items:', quoteItems);
      
      // 1. Create the quote record
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          user_id: user.id,
          quote_number: quoteNumber,
          total_amount: totalAmount,
          total_estimate: totalAmount,
          status: isDraft ? 'draft' : 'pending',
          contact_email: contact?.email || null,
          contact_phone: contact?.phone || null
        }])
        .select()
        .single();
      
      if (quoteError) {
        console.error('Error creating quote:', quoteError);
        throw quoteError;
      }
      
      console.log('Quote created:', quoteData);
      
      // 2. Create quote items for each product in the quote
      const quoteItemsData = quoteItems.map(item => ({
        quote_id: quoteData.id,
        product_id: item.product.id,
        length: item.config.length,
        material: item.config.material,
        is_planed: item.config.isPlaned,
        quantity: item.config.quantity,
        unit_price: item.product.pricePerUnit,
        total_price: item.product.pricePerUnit * item.config.quantity,
        note: item.config.note
      }));
      
      console.log('Adding quote items:', quoteItemsData);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsData)
        .select();
      
      if (itemsError) {
        console.error('Error creating quote items:', itemsError);
        throw itemsError;
      }
      
      console.log('Quote items created:', itemsData);
      
      // 3. Create initial history record
      const { error: historyError } = await supabase
        .from('quote_history')
        .insert([{
          quote_id: quoteData.id,
          status: isDraft ? 'draft' : 'pending',
          notes: isDraft ? 'Quote saved as draft' : 'Quote submitted by customer',
          created_by: user.id
        }]);
      
      if (historyError) {
        console.error('Error creating quote history:', historyError);
        throw historyError;
      }
      
      // 4. Send notification to admins about the new quote
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
        
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await (supabase as any)
            .from('notifications')
            .insert({
              user_id: admin.id,
              type: 'new_quote',
              message: `Нова оферта ${quoteData.quote_number} e предадена`,
              quote_id: quoteData.id,
            });
        }
      }
      
      toast.success(isDraft ? 'Quote saved as draft' : 'Quote submitted successfully!');
      clearQuote();
      return true;
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error(isDraft ? 'Failed to save draft. Please try again.' : 'Failed to submit quote. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <QuoteContext.Provider value={{
      quoteItems,
      addItem,
      removeItem,
      updateItem,
      clearQuote,
      submitQuote,
      loading,
      isLoading,
      calculateTotal
    }}>
      {children}
    </QuoteContext.Provider>
  );
}

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}; 