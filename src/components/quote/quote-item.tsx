import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash } from "lucide-react";
import { 
  ProductType as ContextProductType,
  ProductConfigType as ContextProductConfigType,
  QuoteItemType as ContextQuoteItemType 
} from "@/contexts/QuoteContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

// Re-export the types to maintain backward compatibility
export type ProductType = ContextProductType;
export type ProductConfigType = ContextProductConfigType;
export type QuoteItemType = ContextQuoteItemType;

type QuoteItemProps = {
  item: QuoteItemType;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, ProductConfigType) => void;
};

export function QuoteItem({ item, onRemove, onUpdate }: QuoteItemProps) {
  const { product, config } = item;
  const [editConfig, setEditConfig] = useState<ProductConfigType>({...config});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Defensive: If product is missing, render a fallback
  if (!product) {
    return (
      <div className="border border-border rounded-md p-4 bg-white text-destructive">
        <div className="font-bold">Product data missing</div>
        <div className="text-sm">This quote item is invalid or corrupted. Please remove it and add the product again.</div>
        {onRemove && (
          <Button variant="destructive" size="sm" className="mt-2" onClick={() => onRemove(item.id)}>
            Remove
          </Button>
        )}
      </div>
    );
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id);
    }
  };
  
  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(item.id, editConfig);
      setIsDialogOpen(false);
    }
  };
  
  const unitPrice = product.pricePerUnit || 0;
  const totalPrice = unitPrice * config.quantity;
  
  return (
    <div className="border border-border rounded-md p-4 bg-white">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-grow">
          <h3 className="font-medium">{product.name}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="font-medium">Material:</span> {config.material}</p>
            <p><span className="font-medium">Length:</span> {config.length}mm</p>
            <p><span className="font-medium">Planed:</span> {config.isPlaned ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Quantity:</span> {config.quantity}</p>
          </div>
        </div>
        
        <div className="flex flex-col justify-between">
          <div className="text-right">
            {product.pricePerUnit && (
              <>
                <p className="text-sm text-muted-foreground">
                  ${product.pricePerUnit.toFixed(2)} per unit
                </p>
                <p className="font-semibold">${totalPrice.toFixed(2)}</p>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Item</DialogTitle>
                  <DialogDescription />
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length</label>
                    <select 
                      className="w-full rounded-md border border-border p-2"
                      value={editConfig.length}
                      onChange={(e) => setEditConfig({...editConfig, length: Number(e.target.value)})}
                    >
                      {product.lengths.map((length) => (
                        <option key={length} value={length}>{length}mm</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Planed</label>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={editConfig.isPlaned}
                        onChange={(e) => setEditConfig({...editConfig, isPlaned: e.target.checked})}
                        className="mr-2 h-4 w-4"
                      />
                      <span>Planed (Рендосана)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input 
                      type="number" 
                      min="1"
                      value={editConfig.quantity}
                      onChange={(e) => setEditConfig({...editConfig, quantity: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="destructive" size="sm" onClick={handleRemove}>
              <Trash className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
