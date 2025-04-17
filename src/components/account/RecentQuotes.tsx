import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type Quote = {
  id: string;
  created_at: string;
  status: string;
  total_estimate: number;
  item_count: number;
};

export function RecentQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentQuotes() {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get recent quotes with count of quote items
        const { data, error } = await supabase
          .from('quotes')
          .select(`
            id,
            created_at,
            status,
            total_estimate,
            quote_items(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (data) {
          // Transform data to include item count
          const quotesWithItemCount = data.map(quote => ({
            id: quote.id,
            created_at: quote.created_at,
            status: quote.status,
            total_estimate: quote.total_estimate,
            item_count: quote.quote_items[0].count
          }));

          setQuotes(quotesWithItemCount);
        }
      } catch (error: any) {
        console.error('Error fetching recent quotes:', error);
        setError('Failed to load recent quotes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentQuotes();
  }, [user]);

  // Function to get badge variant based on status
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'sent':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>You haven't submitted any quotes yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <div 
          key={quote.id} 
          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md hover:bg-accent/50 transition-colors"
        >
          <div className="space-y-1 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Quote #{quote.id.substring(0, 8)}</h4>
              <Badge variant={getStatusBadgeVariant(quote.status)}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(quote.created_at), 'PPP')} • {quote.item_count} {quote.item_count === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(quote.total_estimate)}</p>
            <a 
              href={`/quotes?id=${quote.id}`} 
              className="text-sm text-primary hover:underline"
            >
              View Details
            </a>
          </div>
        </div>
      ))}
    </div>
  );
} 