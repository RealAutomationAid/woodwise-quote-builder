import { Button } from "@/components/ui/button";
import { QuoteItemType } from "@/components/quote/quote-item";
import { FileDown, Save, Send } from "lucide-react";

type QuoteSummaryProps = {
  items: QuoteItemType[];
  onSubmitQuote?: () => void;
  onSaveAsDraft?: () => void;
  onGeneratePdf?: () => void;
};

export function QuoteSummary({ items, onSubmitQuote, onSaveAsDraft, onGeneratePdf }: QuoteSummaryProps) {
  // Defensive: Filter out items with missing product
  const validItems = items.filter(item => item.product);
  // Calculate total price
  const totalPrice = validItems.reduce((total, item) => {
    const price = (item.product.pricePerUnit || 0) * item.config.quantity;
    return total + price;
  }, 0);
  
  const isEmpty = validItems.length === 0;

  return (
    <div className="border border-border rounded-md p-4 bg-white">
      <h2 className="text-lg font-medium mb-4">Обобщение на офертата</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between py-1">
          <span>Артикули:</span>
          <span>{validItems.length}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Общо количество:</span>
          <span>
            {validItems.reduce((total, item) => total + item.config.quantity, 0)} бр.
          </span>
        </div>
        <div className="border-t border-border my-2"></div>
        <div className="flex justify-between py-1 font-medium text-lg">
          <span>Обща цена:</span>
          <span>{totalPrice.toFixed(2)} лв.</span>
        </div>
      </div>
      
      <div className="space-y-3 pt-2">
        <Button 
          className="w-full" 
          disabled={isEmpty}
          onClick={onSubmitQuote}
        >
          <Send className="h-4 w-4 mr-2" />
          Изпрати заявка за оферта
        </Button>
        
        <Button 
          variant="secondary" 
          className="w-full" 
          disabled={isEmpty}
          onClick={onSaveAsDraft}
        >
          <Save className="h-4 w-4 mr-2" />
          Запази като чернова
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={isEmpty}
          onClick={onGeneratePdf}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Генерирай PDF/линк
        </Button>
      </div>
      
      <div className="mt-6 text-xs text-muted-foreground border-t pt-4">
        <div>ВАЛЕКС ГРУП - 2 ЕООД</div>
        <div>Телефон: +359894417881</div>
        <div>Email: vgwoodcarving@gmail.com</div>
        <div>Адрес: ул.ВОЙНИШКА №3, Разлог, BG, 2760</div>
      </div>
      
      {isEmpty && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Вашата оферта е празна или съдържа невалидни артикули. Добавете продукти, за да започнете.
        </p>
      )}
    </div>
  );
}
