import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { ProductType } from "@/components/catalog/product-card";
import { ProductFilters } from "@/components/catalog/product-filters";
import { ProductConfigType } from "@/components/catalog/product-detail-view";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  
  // State for the shopping cart/quote
  const [quoteItems, setQuoteItems] = useState<string[]>([]);
  
  // Use the custom hook for filtering
  const { filters, setFilters, categories, materials, filteredProducts } = useProductFilters(products);

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
    
    // Check if there are items in localStorage
    const savedQuoteItems = localStorage.getItem("quoteItems");
    if (savedQuoteItems) {
      setQuoteItems(JSON.parse(savedQuoteItems));
    }
  }, []);

  // Handle adding a product to the quote
  const handleAddToQuote = (product: ProductType, config?: ProductConfigType) => {
    const newQuoteItems = [...quoteItems, product.id];
    setQuoteItems(newQuoteItems);
    localStorage.setItem("quoteItems", JSON.stringify(newQuoteItems));
    toast.success(`${product.name} added to quote!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader 
        quoteItemCount={quoteItems.length} 
      />
      
      <ProductFilters 
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        materials={materials}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <CatalogHeader 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading products...</div>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <EmptyState />
            ) : (
              viewMode === 'grid' ? (
                <CatalogGridView 
                  products={filteredProducts} 
                  onAddToQuote={handleAddToQuote}
                />
              ) : (
                <CatalogListView 
                  products={filteredProducts} 
                  onAddToQuote={handleAddToQuote}
                />
              )
            )}
          </>
        )}
      </main>
      
      <MainFooter />
    </div>
  );
};

export default CatalogPage;
