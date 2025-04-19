import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ProductDetailView } from "@/components/catalog/product-detail-view";
import { ProductType as QuoteProductType } from "@/contexts/QuoteContext";

export type ProductType = {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  category: string;
  categoryId?: string;
  category_id?: string;
  material: string;
  lengths: number[];
  isPlaned: boolean;
  pricePerUnit: number;
  price_per_unit?: number;
  description?: string;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
};

// Helper function to convert between different product type formats
export function convertToQuoteProduct(product: ProductType): QuoteProductType {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    material: product.material,
    lengths: product.lengths,
    isPlaned: product.isPlaned,
    pricePerUnit: product.pricePerUnit || (product.price_per_unit as number),
    description: product.description,
    stock_quantity: product.stock_quantity
  };
}

type ProductCardProps = {
  product: ProductType;
  onAddToQuote?: (product: ProductType) => void;
};

export function ProductCard({ product, onAddToQuote }: ProductCardProps) {
  const defaultImage = "/placeholder.svg";
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative bg-muted">
        <img
          src={product.imageUrl || product.image || defaultImage}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-medium text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p><span className="font-medium">Material:</span> {product.material}</p>
          <p>
            <span className="font-medium">Planed:</span> {product.isPlaned ? 'Yes' : 'No'}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <ProductDetailView 
              product={product} 
              onAddToQuote={onAddToQuote} 
            />
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onAddToQuote && onAddToQuote(product)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
