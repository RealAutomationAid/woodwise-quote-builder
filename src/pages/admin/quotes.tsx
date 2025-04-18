import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { 
  PlusCircle, 
  ShoppingBag, 
  Filter, 
  Search, 
  Mail 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { GenerateQuoteForm } from "@/components/admin/quotes/GenerateQuoteForm";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Types
interface Quote {
  id: string;
  quote_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  total_estimate: number;
  user_id: string;
  simple_customer_id?: string | null;
  discount_code?: string | null;
  discount_percent?: number | null;
  note?: string | null;
}

interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  length: number;
  material: string;
  is_planed: boolean;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ProductData {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  material: string;
  lengths: number[];
  is_planed: boolean;
  price_per_unit: number;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  stock_quantity: number;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

type FilterStatus = 'all' | 'pending' | 'ready' | 'processing' | 'completed' | 'rejected' | 'draft' | 'sent';

export default function AdminQuotes() {
  const { isAdmin, session } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [discountQuote, setDiscountQuote] = useState<{
    id: string;
    amount: number;
    currentTotal: number;
  } | null>(null);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [customers, setCustomers] = useState<{
    id: string;
    name: string;
    email: string;
  }[]>([]);
  const [editQuote, setEditQuote] = useState<{
    id: string;
    status: string;
    customer_id: string | null;
    open: boolean;
  } | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!session) {
      return; // Wait for session check
    }
    
    if (!isAdmin) {
      navigate('/');
      toast.error("Нямате права за достъп до тази страница");
    } else {
      fetchQuotes();
      fetchCustomers();
    }
  }, [isAdmin, session, navigate, filterStatus]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      
      // Get quotes
      let query = supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply status filter if not 'all'
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus === 'ready' ? 'approved' : filterStatus);
      }
      
      const { data: quotesData, error: quotesError } = await query;
      
      if (quotesError) throw quotesError;
      
      if (quotesData && quotesData.length > 0) {
        setQuotes(quotesData.map(q => ({
          ...q,
          total_estimate: q.total_estimate ?? 0
        })));
        
        // Extract non-null user IDs
        const userIds = Array.from(
          new Set(
            quotesData
              .map(q => q.user_id)
              .filter((id): id is string => id !== null)
          )
        );

        // Build a userProfiles map
        const userMap: Record<string, UserProfile> = {};
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, company')
            .in('id', userIds);
          if (userError) throw userError;
          userData?.forEach(profile => {
            userMap[profile.id] = {
              id: profile.id,
              email: '',
              first_name: profile.first_name,
              last_name: profile.last_name,
              company: profile.company,
            };
          });
        }
        setUserProfiles(userMap);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Неуспешно зареждане на офертите');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      // Get profiles with role 'user'
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'user');
      
      if (profileError) throw profileError;
      
      // Get auth emails separately from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      const userEmailMap: Record<string, string> = {};
      
      if (authUsers) {
        authUsers.users.forEach(user => {
          userEmailMap[user.id] = user.email || '';
        });
      }
      
      // Collect user customers
      const profileCustomers = profiles?.map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
        email: userEmailMap[profile.id] || '' // Use email from auth.users
      })) || [];

      // Fetch simple_customers
      const sup = supabase as any;
      const { data: simpleCusts, error: simpleError } = await sup
        .from('simple_customers')
        .select('id, name, email, phone')
        .order('created_at', { ascending: false });

      if (simpleError) throw simpleError;
      const simpleCustomers = (simpleCusts as any[]).map(sc => ({
        id: sc.id,
        name: sc.name,
        email: sc.email || '',
      }));

      // Combine both lists
      setCustomers([...profileCustomers, ...simpleCustomers]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Неуспешно зареждане на клиентите');
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string, notes?: string) => {
    try {
      // 1. Update the quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', quoteId);
      
      if (updateError) throw updateError;
      
      // 2. Create a history record
      const historyEntry = {
        quote_id: quoteId,
        status,
        notes: notes || `Status changed to ${status}`,
        created_by: session?.user?.id
      };
      
      const { error: historyError } = await supabase
        .from('quote_history')
        .insert([historyEntry]);
      
      if (historyError) throw historyError;
      
      // 3. If status is 'completed', update the product stock
      if (status === 'completed') {
        await updateProductStock(quoteId);
      }
      
      // 4. Update the local state
      setQuotes(quotes.map(quote => 
        quote.id === quoteId ? { ...quote, status, total_estimate: quote.total_estimate ?? 0 } : quote
      ));
      
      toast.success(`Офертата е със статус: ${status}`);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Неуспешно обновяване на офертата');
    }
  };

  const updateProductStock = async (quoteId: string) => {
    try {
      // 1. Get quote items
      const { data: quoteItems, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId);
      
      if (itemsError) throw itemsError;
      
      if (!quoteItems || quoteItems.length === 0) {
        console.warn('No items found for this quote');
        return;
      }
      
      // 2. For each item, update the product stock
      for (const item of quoteItems) {
        try {
          // Get current product stock
          const { data, error: productError } = await supabase
            .from('products')
            .select('id, name, stock_quantity')
            .eq('id', item.product_id)
            .single();
          
          if (productError) {
            console.error(`Error fetching product ${item.product_id}:`, productError);
            continue;
          }
          
          // Use any type to bypass TypeScript checks
          const product: any = data;
          
          if (!product) {
            console.error(`Product not found: ${item.product_id}`);
            continue;
          }
          
          // Calculate new stock level (ensure it doesn't go below 0)
          const currentStock = typeof product.stock_quantity === 'number' ? product.stock_quantity : 0;
          const newStockLevel = Math.max(0, currentStock - item.quantity);
          
          // Update product stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStockLevel } as any)
            .eq('id', item.product_id);
          
          if (updateError) {
            console.error(`Error updating stock for product ${product.name}:`, updateError);
            continue;
          }
          
          console.log(`Updated stock for ${product.name}: ${currentStock} → ${newStockLevel}`);
        } catch (itemError) {
          console.error(`Error processing quote item:`, itemError);
          continue;
        }
      }
      
      toast.success('Наличностите са обновени');
    } catch (error) {
      console.error('Error updating product stock:', error);
      toast.error('Неуспешно обновяване на някои наличности');
    }
  };

  const applyDiscount = async () => {
    if (!discountQuote) return;
    
    try {
      const newTotal = discountQuote.currentTotal - discountQuote.amount;
      
      if (newTotal < 0) {
        toast.error('Отстъпката не може да надвишава общата сума');
        return;
      }
      
      // Update the quote total
      const { error } = await supabase
        .from('quotes')
        .update({ 
          total_amount: newTotal,
          status: 'ready' 
        })
        .eq('id', discountQuote.id);
      
      if (error) throw error;
      
      // Add history record for the discount
      const historyEntry = {
        quote_id: discountQuote.id,
        status: 'ready',
        notes: `Discount of $${discountQuote.amount} applied. New total: $${newTotal}`,
        created_by: session?.user?.id
      };
      
      const { error: historyError } = await supabase
        .from('quote_history')
        .insert([historyEntry]);
      
      if (historyError) throw historyError;
      
      // Update the local state
      setQuotes(quotes.map(quote => 
        quote.id === discountQuote.id 
          ? { ...quote, total_amount: newTotal, status: 'ready', total_estimate: quote.total_estimate ?? 0 } 
          : { ...quote, total_estimate: quote.total_estimate ?? 0 }
      ));
      
      setDiscountQuote(null);
      toast.success('Отстъпката е приложена и офертата е одобрена');
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Failed to apply discount');
    }
  };

  const openGenerateQuoteDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsGeneratingQuote(true);
  };

  const handleSendQuote = async (quoteId: string) => {
    toast.success('Офертата ще бъде изпратена до клиента');
    
    await updateQuoteStatus(quoteId, 'sent', 'Quote sent to customer');
    
    fetchQuotes();
  };

  const updateQuoteCustomer = async (quoteId: string, customerId: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ simple_customer_id: customerId })
        .eq('id', quoteId);
      
      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
      
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, simple_customer_id: customerId } : q));
      toast.success('Клиентът е обновен успешно');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Неуспешно обновяване на клиента');
    }
  };

  const handleOpenEditDialog = (quote: any) => {
    setEditQuote({
      id: quote.id,
      status: quote.status,
      customer_id: quote.simple_customer_id,
      open: true
    });
  };
  
  const handleCloseEditDialog = () => {
    setEditQuote(null);
  };
  
  const handleSaveQuote = async () => {
    if (!editQuote) return;
    
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: editQuote.status,
          simple_customer_id: editQuote.customer_id 
        })
        .eq('id', editQuote.id);
      
      if (error) throw error;
      
      // Update local state
      setQuotes(quotes.map(q => q.id === editQuote.id ? {
        ...q,
        status: editQuote.status,
        simple_customer_id: editQuote.customer_id
      } : q));
      
      // Add history record
      await supabase.from('quote_history').insert({
        quote_id: editQuote.id,
        status: editQuote.status,
        notes: 'Quote updated by admin',
        created_by: session.user.id
      });
      
      toast.success('Офертата е обновена успешно');
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Неуспешно обновяване на офертата');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const userProfile = userProfiles[quote.user_id];
    if (!userProfile) return searchTerm === '';
    
    const searchMatch = searchTerm === '' || 
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userProfile.email && userProfile.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (userProfile.company && userProfile.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'draft':
        return 'outline';
      case 'ready':
        return 'default';
      case 'sent':
        return 'blue';
      default:
        return 'outline';
    }
  };

  if (!session) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Управление на оферти</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Всички
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Получени
            </button>
            <button 
              onClick={() => setFilterStatus('ready')}
              className={`px-3 py-1 rounded ${filterStatus === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Готови
            </button>
            <button 
              onClick={() => setFilterStatus('processing')}
              className={`px-3 py-1 rounded ${filterStatus === 'processing' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              Обработва се
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded ${filterStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              Завършени
            </button>
          </div>
          
          <div>
            <Input
              placeholder="Търсене на оферти..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        
        {/* Quotes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Зареждане на оферти...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-6 text-center">Няма намерени оферти</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID на оферта
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Обща цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => {
                  const userProfile = userProfiles[quote.user_id];
                  return (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quote.quote_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Select
                          value={quote.simple_customer_id || ""}
                          onValueChange={(value) => updateQuoteCustomer(quote.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Assign customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(quote.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Badge variant={getStatusBadgeVariant(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Виж
                          </button>
                          <button 
                            onClick={() => handleOpenEditDialog(quote)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Редактирай
                          </button>
                          {quote.status === 'pending' && (
                            <button 
                              onClick={() => setDiscountQuote({
                                id: quote.id,
                                amount: 0,
                                currentTotal: Number(quote.total_amount)
                              })}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Отстъпка
                            </button>
                          )}
                          {quote.status === 'ready' && (
                            <button 
                              onClick={() => handleSendQuote(quote.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Изпрати
                            </button>
                          )}
                          <button 
                            onClick={() => handleOpenEditDialog(quote)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Запази
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Edit Quote Dialog */}
        {editQuote && (
          <Dialog open={editQuote.open} onOpenChange={(open) => !open && handleCloseEditDialog()}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Редактирай оферта</DialogTitle>
                <DialogDescription>
                  Редактирайте и изпратете офертата до клиента.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">
                    Клиент
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={editQuote.customer_id || ""}
                      onValueChange={(value) => setEditQuote({...editQuote, customer_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Избери клиент" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Статус
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={editQuote.status}
                      onValueChange={(value) => setEditQuote({...editQuote, status: value})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Избери статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Получена</SelectItem>
                        <SelectItem value="processing">Обработва се</SelectItem>
                        <SelectItem value="completed">Завършена</SelectItem>
                        <SelectItem value="rejected">Отказана</SelectItem>
                        <SelectItem value="draft">Чернова</SelectItem>
                        <SelectItem value="ready">Готова</SelectItem>
                        <SelectItem value="sent">Изпратена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseEditDialog}>
                  Отказ
                </Button>
                <Button onClick={handleSaveQuote}>
                  Запази промените
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Discount Modal */}
        {discountQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Добави отстъпка</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Текуща сума: {discountQuote.currentTotal.toFixed(2)} лв.</label>
                <label className="block text-gray-700 mb-2">Сума на отстъпката (лв.)</label>
                <input
                  type="number"
                  min="0"
                  max={discountQuote.currentTotal}
                  value={discountQuote.amount}
                  onChange={(e) => setDiscountQuote({
                    ...discountQuote,
                    amount: Number(e.target.value)
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Нова сума: {(discountQuote.currentTotal - discountQuote.amount).toFixed(2)} лв.</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDiscountQuote(null)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Отказ
                </button>
                <button
                  onClick={applyDiscount}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={discountQuote.amount <= 0 || discountQuote.amount > discountQuote.currentTotal}
                >
                  Приложи отстъпка
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <MainFooter />
      
      {/* Generate Quote Dialog */}
      {selectedCustomer && (
        <GenerateQuoteForm
          isOpen={isGeneratingQuote}
          onClose={() => {
            setIsGeneratingQuote(false);
            setSelectedCustomer(null);
            fetchQuotes();
          }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          customerEmail={selectedCustomer.email}
        />
      )}
    </div>
  );
}
