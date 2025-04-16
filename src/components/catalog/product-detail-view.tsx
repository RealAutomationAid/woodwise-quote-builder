
import { useState } from "react";
import { ProductType } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type ProductDetailViewProps = {
  product: ProductType;
  onAddToQuote?: (product: ProductType, config: ProductConfigType) => void;
  inModal?: boolean;
};

export type ProductConfigType = {
  length: number;
  material: string;
  isPlaned: boolean;
  quantity: number;
};

export function ProductDetailView({ product, onAddToQuote, inModal = true }: ProductDetailViewProps) {
  const [config, setConfig] = useState<ProductConfigType>({
    length: product.lengths[0],
    material: product.material,
    isPlaned: product.isPlaned,
    quantity: 1,
  });
  
  const defaultImage = "/placeholder.svg";
  
  const handleAddToQuote = () => {
    if (onAddToQuote) {
      onAddToQuote(product, config);
    }
  };
  
  return (
    <div className={`grid ${inModal ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
      <div>
        <div className={`aspect-video bg-muted rounded-md overflow-hidden ${inModal ? '' : 'max-h-[300px]'}`}>
          <img
            src={product.imageUrl || defaultImage}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="mt-4">
          <h3 className="text-2xl font-semibold">{product.name}</h3>
          <p className="text-muted-foreground">{product.category}</p>
          
          {product.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
          
          {product.pricePerUnit && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Price</h4>
              <p className="text-lg font-semibold">${product.pricePerUnit.toFixed(2)} per unit</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Configure Your Product</h3>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="length">Length (Дължина)</Label>
            <Select 
              onValueChange={(value) => setConfig({...config, length: Number(value)})}
              defaultValue={String(config.length)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {product.lengths.map((length) => (
                  <SelectItem key={length} value={String(length)}>
                    {length} mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="material">Material (Материал)</Label>
            <Select 
              onValueChange={(value) => setConfig({...config, material: value})}
              defaultValue={config.material}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={product.material}>
                  {product.material}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="planed" 
              checked={config.isPlaned}
              onCheckedChange={(checked) => 
                setConfig({...config, isPlaned: checked === true})
              }
            />
            <Label htmlFor="planed">Planed (Рендосана)</Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity (Количество)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={config.quantity}
              onChange={(e) => setConfig({...config, quantity: Number(e.target.value)})}
            />
          </div>
        </div>
        
        <Button className="w-full" onClick={handleAddToQuote}>
          Add to Quote (Добави към оферта)
        </Button>
      </div>
    </div>
  );
}
