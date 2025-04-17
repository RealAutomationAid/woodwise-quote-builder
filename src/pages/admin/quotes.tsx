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

// Types
interface Quote {
  id: string;
  user_id: string;
  quote_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
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

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'completed' | 'draft' | 'ready' | 'sent';

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

  // Redirect if not admin
  useEffect(() => {
    if (!session) {
      return; // Wait for session check
    }
    
    if (!isAdmin) {
      navigate('/');
      toast.error("You don't have permission to access this page");
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
        query = query.eq('status', filterStatus);
      }
      
      const { data: quotesData, error: quotesError } = await query;
      
      if (quotesError) throw quotesError;
      
      if (quotesData && quotesData.length > 0) {
        setQuotes(quotesData);
        
        // Get the unique user IDs
        const userIds = [...new Set(quotesData.map(quote => quote.user_id))];
        
        // Fetch user profiles in a separate query
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            company
          `)
          .in('id', userIds);
        
        if (userError) throw userError;
        
        // Create a map of user_id to profile data
        const userMap: Record<string, UserProfile> = {};
        
        if (userData) {
          userData.forEach(profile => {
            userMap[profile.id] = {
              id: profile.id,
              email: '', // Email not available from profiles table
              first_name: profile.first_name,
              last_name: profile.last_name,
              company: profile.company
            };
          });
        }
        
        setUserProfiles(userMap);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
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
      
      if (profiles && profiles.length > 0) {
        // Get emails from auth.users table (if accessible)
        // Note: This might not work in all environments due to RLS
        const userIds = profiles.map(profile => profile.id);
        
        // For each user, try to get their email
        const formattedCustomers = profiles.map(profile => {
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
            email: 'customer@example.com' // Fallback email
          };
        });
        
        setCustomers(formattedCustomers);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
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
        quote.id === quoteId ? { ...quote, status } : quote
      ));
      
      toast.success(`Quote ${status}`);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
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
      
      toast.success('Stock levels updated');
    } catch (error) {
      console.error('Error updating product stock:', error);
      toast.error('Failed to update some product stock levels');
    }
  };

  const applyDiscount = async () => {
    if (!discountQuote) return;
    
    try {
      const newTotal = discountQuote.currentTotal - discountQuote.amount;
      
      if (newTotal < 0) {
        toast.error('Discount cannot exceed total amount');
        return;
      }
      
      // Update the quote total
      const { error } = await supabase
        .from('quotes')
        .update({ 
          total_amount: newTotal,
          status: 'approved' 
        })
        .eq('id', discountQuote.id);
      
      if (error) throw error;
      
      // Add history record for the discount
      const historyEntry = {
        quote_id: discountQuote.id,
        status: 'approved',
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
          ? { ...quote, total_amount: newTotal, status: 'approved' } 
          : quote
      ));
      
      setDiscountQuote(null);
      toast.success('Discount applied and quote approved');
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
    toast.success('Quote would be sent to the customer');
    
    await updateQuoteStatus(quoteId, 'sent', 'Quote sent to customer');
    
    fetchQuotes();
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
        <h1 className="text-2xl font-bold mb-6">Quote Management</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1 rounded ${filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1 rounded ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              Rejected
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded ${filterStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              Completed
            </button>
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Search quotes..."
              className="px-3 py-1 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Quotes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading quotes...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-6 text-center">No quotes found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userProfile ? (
                          <>
                            <div className="text-sm text-gray-900">
                              {userProfile.first_name} {userProfile.last_name}
                            </div>
                            {userProfile.company && (
                              <div className="text-xs text-gray-500">{userProfile.company}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">User not found</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(quote.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''} 
                          ${quote.status === 'approved' ? 'bg-green-100 text-green-800' : ''} 
                          ${quote.status === 'rejected' ? 'bg-red-100 text-red-800' : ''} 
                          ${quote.status === 'completed' ? 'bg-purple-100 text-purple-800' : ''}`}
                        >
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          
                          {quote.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateQuoteStatus(quote.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => setDiscountQuote({
                                  id: quote.id,
                                  amount: 0,
                                  currentTotal: Number(quote.total_amount)
                                })}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Discount
                              </button>
                            </>
                          )}
                          
                          {quote.status === 'approved' && (
                            <button 
                              onClick={() => updateQuoteStatus(quote.id, 'completed')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Discount Modal */}
        {discountQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Apply Discount</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Current Total: ${discountQuote.currentTotal.toFixed(2)}</label>
                <label className="block text-gray-700 mb-2">Discount Amount ($)</label>
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
                <label className="block text-gray-700 mb-2">New Total: ${(discountQuote.currentTotal - discountQuote.amount).toFixed(2)}</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDiscountQuote(null)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={applyDiscount}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={discountQuote.amount <= 0 || discountQuote.amount > discountQuote.currentTotal}
                >
                  Apply Discount
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
