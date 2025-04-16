import { ProductCard, ProductType } from "@/components/catalog/product-card";
import { ProductConfigType } from "@/components/catalog/product-detail-view";

type CatalogGridViewProps = {
  products: ProductType[];
  onAddToQuote: (product: ProductType, config?: ProductConfigType) => void;
};

export function CatalogGridView({ products, onAddToQuote }: CatalogGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          onAddToQuote={onAddToQuote}
        />
      ))}
    </div>
  );
} 