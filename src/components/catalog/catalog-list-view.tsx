import { Button } from "@/components/ui/button";
import { ProductType } from "@/components/catalog/product-card";
import { ProductConfigType } from "@/components/catalog/product-detail-view";

type CatalogListViewProps = {
  products: ProductType[];
  onAddToQuote: (product: ProductType, config?: ProductConfigType) => void;
};

export function CatalogListView({ products, onAddToQuote }: CatalogListViewProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="border border-border rounded-md p-4 bg-white">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-medium">{product.name}</h3>
              <p className="text-muted-foreground">{product.category}</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Material:</span> {product.material}</p>
                  <p><span className="font-medium">Planed:</span> {product.isPlaned ? 'Yes' : 'No'}</p>
                  <p>
                    <span className="font-medium">Available Lengths:</span>{' '}
                    {product.lengths.join('mm, ')}mm
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">£{product.pricePerUnit.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">Per unit</p>
                  
                  <Button 
                    className="mt-4" 
                    onClick={() => onAddToQuote(product)}
                  >
                    Add to Quote
                  </Button>
                </div>
              </div>
              
              <p className="mt-4 text-muted-foreground">{product.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 