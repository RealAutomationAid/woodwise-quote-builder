import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { 
  PlusCircle, 
  ShoppingBag, 
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import our new components
import { QuotesTable } from '@/components/admin/quotes/QuotesTable';
import { QuoteFilters } from '@/components/admin/quotes/QuoteFilters';
import { EditQuoteDialog } from '@/components/admin/quotes/EditQuoteDialog';
import { updateQuoteStatus } from '@/components/admin/quotes/QuoteStatusManager';
import { GenerateQuoteForm } from "@/components/admin/quotes/GenerateQuoteForm";

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
        // Cast to any[] to allow total_estimate augmentation
        setQuotes((quotesData as any[]).map((q: any) => ({
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
        .select('id, first_name, last_name, email')
        .eq('role', 'user');
      if (profileError) throw profileError;
      
      const profileCustomers = profiles?.map(p => ({
        id: `auth_${p.id}`,
        name: `${p.first_name} ${p.last_name}`,
        email: p.email || ''
      })) || [];
      
      // Get simple customers
      const sb = supabase as any;
      const { data: simpleCustomersData, error: simpleError } = await sb
        .from('simple_customers')
        .select('id, name, email');
      if (simpleError) throw simpleError;
      
      const simpleCustomers = (simpleCustomersData || []).map((c: any) => ({
        id: `simple_${c.id}`,
        name: c.name,
        email: c.email || ''
      }));
      
      setCustomers([...profileCustomers, ...simpleCustomers]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Неуспешно зареждане на клиентите');
    }
  };

  // Function to handle quote status updates
  const handleUpdateQuoteStatus = async (quoteId: string, status: string, notes?: string) => {
    if (!session?.user?.id) return;
    
    await updateQuoteStatus(
      quoteId, 
      status, 
      notes, 
      session.user.id,
      (updatedQuoteId, newStatus) => {
        // Update the local state
        setQuotes(quotes.map(quote => 
          quote.id === updatedQuoteId 
            ? { ...quote, status: newStatus, total_estimate: quote.total_estimate ?? 0 } 
            : quote
        ));
      }
    );
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
      
      // Create notification for quote owner
      const quoteRecord = quotes.find(q => q.id === discountQuote.id);
      
      if (quoteRecord?.user_id) {
        await (supabase as any)
          .from('notifications')
          .insert({
            user_id: quoteRecord.user_id,
            type: 'quote_discount',
            message: `Отстъпка ${discountQuote.amount}лв. е приложена към оферта ${quoteRecord.quote_number}`,
            quote_id: discountQuote.id,
          });
      }
      
      // Update the local state
      setQuotes(quotes.map(quote => 
        quote.id === discountQuote.id 
          ? { ...quote, total_amount: newTotal, status: 'ready', total_estimate: quote.total_estimate ?? 0 } 
          : { ...quote, total_estimate: quote.total_estimate ?? 0 }
      ));
      
      setDiscountQuote(null);
      toast.success(`Отстъпка от ${discountQuote.amount}лв. е приложена успешно`);
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Неуспешно прилагане на отстъпка');
    }
  };

  const openGenerateQuoteDialog = (customer: any) => {
    setSelectedCustomer(customer);
    setIsGeneratingQuote(true);
  };

  const handleSendQuote = async (quoteId: string) => {
    await handleUpdateQuoteStatus(quoteId, 'sent', 'Quote sent to customer');
  };

  const updateQuoteCustomer = async (quoteId: string, customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({ 
          customer_id: customerId 
        })
        .eq('id', quoteId);

      if (error) {
        console.error('Error updating quote customer:', error);
        toast.error('Грешка при актуализиране на клиента');
        return false;
      }

      await fetchQuotes();
      toast.success('Клиентът е актуализиран успешно');
      return true;
    } catch (err) {
      console.error('Error updating quote customer:', err);
      toast.error('Грешка при актуализиране на клиента');
      return false;
    }
  };

  const handleOpenEditDialog = (quote: Quote) => {
    setEditQuote({
      id: quote.id,
      status: quote.status,
      customer_id: quote.simple_customer_id ? `simple_${quote.simple_customer_id}` : null,
      open: true
    });
  };
  
  const handleCloseEditDialog = () => {
    setEditQuote(null);
  };
  
  const handleSaveQuote = async () => {
    if (!editQuote) return;
    
    try {
      // Get the actual simple_customer_id (without the 'simple_' prefix)
      const dbCustomerId = editQuote.customer_id?.startsWith('simple_') 
        ? editQuote.customer_id.replace('simple_', '') 
        : editQuote.customer_id;
      
      // Use supabase update
      const { error } = await supabase
        .from('quotes')
        .update({
          status: editQuote.status,
          simple_customer_id: dbCustomerId
        })
        .eq('id', editQuote.id);
      
      if (error) throw error;
      
      // Update local state
      setQuotes(quotes.map(q => q.id === editQuote.id ? {
        ...q,
        status: editQuote.status,
        simple_customer_id: dbCustomerId
      } : q));
      
      // Add history record
      await supabase
        .from('quote_history')
        .insert({
          quote_id: editQuote.id,
          status: editQuote.status,
          notes: 'Quote updated by admin',
          created_by: session?.user?.id
        });
      
      // Notify the quote owner
      const quote = quotes.find(q => q.id === editQuote.id);
      if (quote?.user_id) {
        await (supabase as any)
          .from('notifications')
          .insert({
            user_id: quote.user_id,
            type: 'quote_update',
            message: `Оферта ${quote.quote_number} е актуализирана`,
            quote_id: editQuote.id,
          });
      }
      
      toast.success('Офертата е обновена успешно');
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Неуспешно обновяване на офертата');
    }
  };

  // Delete a quote
  const handleDeleteQuote = async (quoteId: string) => {
    if (!window.confirm('Изтриване на офертата? Това действие е необратимо.')) return;
    try {
      const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
      if (error) throw error;
      setQuotes(quotes.filter(q => q.id !== quoteId));
      toast.success('Офертата е изтрита успешно');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Неуспешно изтриване на офертата');
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
        
        {/* Filters component */}
        <QuoteFilters 
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        {/* Quotes Table component */}
        <QuotesTable 
          quotes={filteredQuotes}
          userProfiles={userProfiles}
          updateQuoteStatus={handleUpdateQuoteStatus}
          handleOpenEditDialog={handleOpenEditDialog}
          handleDeleteQuote={handleDeleteQuote}
          handleSendQuote={handleSendQuote}
          loading={loading}
        />
      </main>
      
      {/* Edit Quote Dialog component */}
      {editQuote && (
        <EditQuoteDialog
          open={editQuote.open}
          onClose={handleCloseEditDialog}
          onSave={handleSaveQuote}
          editQuote={editQuote}
          setEditQuote={setEditQuote}
          customers={customers}
        />
      )}
      
      {/* Generate Quote Dialog */}
      {isGeneratingQuote && selectedCustomer && (
        <Dialog open={isGeneratingQuote} onOpenChange={setIsGeneratingQuote}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Генериране на оферта за {selectedCustomer.name}</DialogTitle>
            </DialogHeader>
            <GenerateQuoteForm 
              customerId={selectedCustomer ? selectedCustomer.id : undefined}
              onSuccess={() => {
                setIsGeneratingQuote(false);
                fetchQuotes();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Discount Dialog */}
      {discountQuote && (
        <Dialog open={!!discountQuote} onOpenChange={() => setDiscountQuote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Прилагане на отстъпка</DialogTitle>
              <DialogDescription>
                Текуща цена: {discountQuote.currentTotal}лв.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Стойност на отстъпката (лв.)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discountQuote.amount}
                  onChange={(e) => setDiscountQuote({
                    ...discountQuote,
                    amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <p>Нова цена: {(discountQuote.currentTotal - discountQuote.amount).toFixed(2)}лв.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDiscountQuote(null)}>
                Отказ
              </Button>
              <Button onClick={applyDiscount}>
                Приложи отстъпка
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <MainFooter />
    </div>
  );
}
