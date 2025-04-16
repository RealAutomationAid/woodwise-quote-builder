
import { Button } from "@/components/ui/button";
import { QuoteItemType } from "@/components/quote/quote-item";
import { FileDown, Send } from "lucide-react";

type QuoteSummaryProps = {
  items: QuoteItemType[];
  onSubmitQuote?: () => void;
  onGeneratePdf?: () => void;
};

export function QuoteSummary({ items, onSubmitQuote, onGeneratePdf }: QuoteSummaryProps) {
  // Calculate total price
  const totalPrice = items.reduce((total, item) => {
    const price = (item.product.pricePerUnit || 0) * item.config.quantity;
    return total + price;
  }, 0);
  
  const isEmpty = items.length === 0;

  return (
    <div className="border border-border rounded-md p-4 bg-white">
      <h2 className="text-lg font-medium mb-4">Quote Summary</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between py-1">
          <span>Items:</span>
          <span>{items.length}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Total Quantity:</span>
          <span>
            {items.reduce((total, item) => total + item.config.quantity, 0)} units
          </span>
        </div>
        <div className="border-t border-border my-2"></div>
        <div className="flex justify-between py-1 font-medium text-lg">
          <span>Total Price:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="space-y-3 pt-2">
        <Button 
          className="w-full" 
          disabled={isEmpty}
          onClick={onSubmitQuote}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Quote Request
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={isEmpty}
          onClick={onGeneratePdf}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Generate PDF/Link
        </Button>
      </div>
      
      {isEmpty && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Your quote is empty. Add some products to get started.
        </p>
      )}
    </div>
  );
}
