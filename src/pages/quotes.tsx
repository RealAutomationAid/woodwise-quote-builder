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
} from "@/components/ui/dialog";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { QuoteItem } from "@/components/quote/quote-item";
import { useNavigate } from "react-router-dom";

// Sample quote history data
const SAMPLE_QUOTE_HISTORY: QuoteHistoryItem[] = [
  {
    id: "Q-2023-001",
    date: "2023-04-15",
    totalPrice: 239.98,
    status: "approved",
    items: [
      {
        id: "past-item-1",
        product: {
          id: "1",
          name: "Pine Timber Beam",
          category: "Structural Timber",
          material: "Pine",
          lengths: [2000, 3000, 4000, 5000],
          isPlaned: true,
          pricePerUnit: 45.99
        },
        config: {
          length: 4000,
          material: "Pine",
          isPlaned: true,
          quantity: 3
        }
      },
      {
        id: "past-item-2",
        product: {
          id: "4",
          name: "Cedar Decking Board",
          category: "Decking",
          material: "Cedar",
          lengths: [3000, 3600, 4200],
          isPlaned: true,
          pricePerUnit: 78.30
        },
        config: {
          length: 3600,
          material: "Cedar",
          isPlaned: true,
          quantity: 2
        }
      }
    ]
  },
  {
    id: "Q-2023-002",
    date: "2023-05-20",
    totalPrice: 456.75,
    status: "processing",
    items: [
      {
        id: "past-item-3",
        product: {
          id: "2",
          name: "Oak Floorboard",
          category: "Flooring",
          material: "Oak",
          lengths: [1000, 1500, 2000],
          isPlaned: true,
          pricePerUnit: 65.50
        },
        config: {
          length: 2000,
          material: "Oak",
          isPlaned: true,
          quantity: 5
        }
      }
    ]
  },
  {
    id: "Q-2023-003",
    date: "2023-06-10",
    totalPrice: 123.45,
    status: "rejected",
    items: []
  },
  {
    id: "Q-2023-004",
    date: "2023-07-05",
    totalPrice: 789.00,
    status: "pending",
    items: []
  }
];

const QuotesHistoryPage = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteHistoryItem | null>(null);
  
  useEffect(() => {
    // Simulate API call to fetch quote history
    setLoading(true);
    setTimeout(() => {
      setQuotes(SAMPLE_QUOTE_HISTORY);
      setLoading(false);
    }, 300);
  }, []);
  
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
              <DialogTitle>Quote Details - {selectedQuote.id}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{selectedQuote.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedQuote.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedQuote.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      selectedQuote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedQuote.status === 'approved' ? 'Одобрена' :
                       selectedQuote.status === 'processing' ? 'Обработва се' :
                       selectedQuote.status === 'rejected' ? 'Отказана' :
                       'Получена'}
                    </span>
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
