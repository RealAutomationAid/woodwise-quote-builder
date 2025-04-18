import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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
  submitQuote: (isDraft?: boolean) => Promise<boolean>;
  loading: boolean;
  calculateTotal: () => number;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quoteItems, setQuoteItems] = useState<QuoteItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  // Load quote items from localStorage when component mounts
  useEffect(() => {
    const storedItems = localStorage.getItem('quoteItems');
    if (storedItems) {
      try {
        setQuoteItems(JSON.parse(storedItems));
      } catch (e) {
        console.error('Failed to parse stored quote items:', e);
        localStorage.removeItem('quoteItems');
      }
    }
  }, []);

  // Save quote items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quoteItems', JSON.stringify(quoteItems));
  }, [quoteItems]);

  const addItem = (product: ProductType, config: ProductConfigType) => {
    setQuoteItems(prev => [...prev, { 
      id: uuidv4(),
      product,
      config
    }]);
  };

  const removeItem = (id: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, config: ProductConfigType) => {
    setQuoteItems(prev => prev.map(item => 
      item.id === id ? { ...item, config } : item
    ));
  };

  const clearQuote = () => {
    setQuoteItems([]);
    localStorage.removeItem('quoteItems');
  };

  const calculateTotal = () => {
    return quoteItems.reduce((total, item) => {
      const itemPrice = item.product.pricePerUnit * item.config.quantity;
      return total + itemPrice;
    }, 0);
  };

  const submitQuote = async (isDraft: boolean = false): Promise<boolean> => {
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
          status: isDraft ? 'draft' : 'pending'
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