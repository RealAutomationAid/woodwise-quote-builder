import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { QuoteHistoryTable, QuoteHistoryItem } from "@/components/quotes/quote-history-table";
import { Button } from "@/components/ui/button";
import { QuoteItemType } from "@/components/quote/quote-item";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { QuoteItem } from "@/components/quote/quote-item";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const QuotesHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteHistoryItem | null>(null);
  
  useEffect(() => {
    if (!user) return;
    fetchUserQuotes();
  }, [user]);

  const fetchUserQuotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch the quotes for the current user
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (quotesError) throw quotesError;
      
      // Fetch quote items for all quotes
      if (quotesData && quotesData.length > 0) {
        const mappedQuotes: QuoteHistoryItem[] = [];
        
        for (const quote of quotesData) {
          console.log('Processing quote:', quote.id);
          
          // First, get the quote items
          const { data: quoteItems, error: quoteItemsError } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', quote.id);
            
          if (quoteItemsError) {
            console.error('Error fetching quote items:', quoteItemsError);
            continue;
          }
          
          console.log('Quote items:', quoteItems);
          
          if (!quoteItems || quoteItems.length === 0) {
            // No items for this quote, still add it to the list with empty items
            mappedQuotes.push({
              id: String(quote.id),
              date: format(new Date(quote.created_at), 'yyyy-MM-dd'),
              totalPrice: parseFloat(quote.total_amount),
              status: quote.status as "pending" | "processing" | "approved" | "rejected",
              items: []
            });
            continue;
          }
          
          // Fetch all product IDs from quote items
          const productIds = quoteItems.map(item => item.product_id);
          
          // Get product details for these IDs
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
            
          if (productsError) {
            console.error('Error fetching products:', productsError);
            continue;
          }
          
          console.log('Products:', products);
          
          // Create a map of product ID to product details
          const productMap: Record<string, any> = {};
          if (products) {
            products.forEach(product => {
              productMap[product.id] = product;
            });
          }
          
          // Create formatted items with product details
          const formattedItems: QuoteItemType[] = [];
          for (const item of quoteItems) {
            const product = productMap[item.product_id];
            if (!product) {
              console.warn(`Product not found for item ${item.id}, product_id ${item.product_id}`);
              continue;
            }
            
            formattedItems.push({
              id: String(item.id),
              product: {
                id: String(product.id),
                name: product.name,
                category: 'N/A',
                material: product.material,
                lengths: product.lengths || [0],
                isPlaned: product.is_planed,
                pricePerUnit: product.price_per_unit,
                description: product.description || '',
                stock_quantity: product.stock_quantity || 0
              },
              config: {
                length: item.length,
                material: item.material,
                isPlaned: item.is_planed,
                quantity: item.quantity
              }
            });
          }
          
          // Type-safe approach for status
          const quoteStatus = quote.status as string;
          let typedStatus: "pending" | "processing" | "approved" | "rejected" = "pending";
          
          if (quoteStatus === "processing" || quoteStatus === "approved" || quoteStatus === "rejected") {
            typedStatus = quoteStatus;
          }
          
          // Add to mapped quotes with proper typing
          mappedQuotes.push({
            id: String(quote.id),
            date: format(new Date(quote.created_at), 'yyyy-MM-dd'),
            totalPrice: parseFloat(quote.total_amount),
            status: typedStatus,
            items: formattedItems
          });
        }
        
        setQuotes(mappedQuotes);
      } else {
        setQuotes([]);
      }
      
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load your quotes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewQuote = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(quote);
    }
  };
  
  const handleCloseDialog = () => {
    setSelectedQuote(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader 
        quoteItemCount={quotes.length} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quote History</h1>
          <Button onClick={() => navigate("/quote")}>Current Quote</Button>
        </div>
        
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading quote history...</div>
          </div>
        ) : (
          <QuoteHistoryTable 
            quotes={quotes} 
            onViewQuote={handleViewQuote} 
          />
        )}
      </main>
      
      <Dialog open={!!selectedQuote} onOpenChange={handleCloseDialog}>
        {selectedQuote && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Quote Details - {selectedQuote.id.substring(0, 8)}</DialogTitle>
              <DialogDescription>
                Created on {selectedQuote.date}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge className={cn('h-6 w-fit px-2 font-medium', {
                      'bg-yellow-100 text-yellow-800': selectedQuote.status === 'pending',
                      'bg-blue-100 text-blue-800': selectedQuote.status === 'processing',
                      'bg-green-100 text-green-800': selectedQuote.status === 'approved',
                      'bg-red-100 text-red-800': selectedQuote.status === 'rejected',
                    })}>
                      {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {selectedQuote.items.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {selectedQuote.items.map((item) => (
                      <QuoteItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border border-border rounded-md">
                    <p className="text-muted-foreground">
                      Detailed items not available for this quote.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1">
                <QuoteSummary items={selectedQuote.items} />
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      <MainFooter />
    </div>
  );
};

export default QuotesHistoryPage;
