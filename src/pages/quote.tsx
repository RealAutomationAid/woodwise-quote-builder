import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { QuoteItem } from "@/components/quote/quote-item";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useQuote, ProductConfigType } from "@/contexts/QuoteContext";

const QuotePage = () => {
  const navigate = useNavigate();
  const { quoteItems, removeItem, updateItem, submitQuote, loading } = useQuote();
  
  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Item removed from quote");
  };

  const handleUpdateItem = (id: string, config: ProductConfigType) => {
    updateItem(id, config);
    toast.success("Item updated");
  };

  const handleSubmitQuote = async () => {
    const success = await submitQuote(false);
    if (success) {
      setTimeout(() => {
        navigate("/quotes");
      }, 1500);
    }
  };
  
  const handleSaveAsDraft = async () => {
    const success = await submitQuote(true);
    if (success) {
      setTimeout(() => {
        navigate("/quotes");
      }, 1500);
    }
  };

  const handleGeneratePdf = () => {
    // This would trigger PDF generation via your backend
    toast.success("PDF generated and ready for download!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader quoteItemCount={quoteItems.length} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/catalog")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Your Quote</h1>
        </div>
        
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading your quote...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {quoteItems.length === 0 ? (
                <div className="py-12 text-center border border-border rounded-md bg-white">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-4">Your quote is empty</h3>
                  <p className="text-muted-foreground mt-1">
                    Browse our catalog and add items to your quote
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => navigate("/catalog")}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quoteItems.map((item) => (
                    <QuoteItem 
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdate={handleUpdateItem}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <QuoteSummary 
                items={quoteItems} 
                onSubmitQuote={handleSubmitQuote}
                onSaveAsDraft={handleSaveAsDraft}
                onGeneratePdf={handleGeneratePdf}
              />
            </div>
          </div>
        )}
      </main>
      
      <MainFooter />
    </div>
  );
};

export default QuotePage;
