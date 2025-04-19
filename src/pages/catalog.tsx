import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { ProductType, convertToQuoteProduct } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import { ProductConfigType } from "@/components/catalog/product-detail-view";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuote } from "@/contexts/QuoteContext";

// New component imports
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { CatalogGridView } from "@/components/catalog/catalog-grid-view";
import { CatalogListView } from "@/components/catalog/catalog-list-view";
import { EmptyState } from "@/components/catalog/empty-state";
import { fetchProducts } from "@/components/catalog/product-data";
import { useProductFilters } from "@/components/catalog/use-product-filters";

const CatalogPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use the quote context instead of local state
  const { addItem } = useQuote();
  
  // Use the custom hook for filtering
  const { filters, setFilters, categories, materials, filteredProducts, totalCount } = useProductFilters(products);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Handle adding a product to the quote
  const handleAddToQuote = (product: ProductType, config?: ProductConfigType) => {
    // Convert the product to the format expected by the quote context
    const quoteProduct = convertToQuoteProduct(product);
    
    // Use the addItem function from the context
    addItem(quoteProduct, config || {
      length: product.lengths[0],
      material: product.material,
      isPlaned: product.isPlaned,
      quantity: 1
    });
    toast.success(`${product.name} беше добавен към офертата!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <ProductFilters 
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        materials={materials}
        totalCount={totalCount}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <CatalogHeader 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Зареждане на продукти...</div>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <EmptyState />
            ) : viewMode === 'grid' ? (
              <CatalogGridView 
                products={filteredProducts} 
                onAddToQuote={handleAddToQuote}
              />
            ) : (
              <CatalogListView 
                onAddToQuote={handleAddToQuote}
              />
            )}
          </>
        )}
      </main>
      
      <MainFooter />
    </div>
  );
};

export default CatalogPage;
