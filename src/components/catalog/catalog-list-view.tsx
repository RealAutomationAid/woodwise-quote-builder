import { useEffect, useState } from "react";
import { ProductCard, ProductType } from "./product-card";
import { ProductFilters } from "./product-filters";
import { EmptyState } from "./empty-state";
import { useProducts, DEFAULT_FILTER, ProductFilter } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";

type CatalogListViewProps = {
  onAddToQuote?: (product: ProductType) => void;
};

export function CatalogListView({ onAddToQuote }: CatalogListViewProps) {
  const [filters, setFilters] = useState<ProductFilter>(DEFAULT_FILTER);
  const { products, isLoading, totalCount, error, fetchProducts } = useProducts();
  const [categories, setCategories] = useState<{ id: string; name: string; parent_id?: string | null }[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, parent_id');
      
      if (!error && data) {
        setCategories(data);
      } else {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, []);

  // Fetch unique materials
  useEffect(() => {
    async function fetchMaterials() {
      const { data, error } = await supabase
        .from('products')
        .select('material');
      
      if (!error && data) {
        // Extract unique materials
        const uniqueMaterials = [...new Set(data.map(p => p.material))];
        setMaterials(uniqueMaterials);
      } else {
        console.error('Error fetching materials:', error);
      }
    }

    fetchMaterials();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <ProductFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={categories}
        materials={materials}
        totalCount={totalCount}
      />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center my-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 my-16">
            <p>Error loading products: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToQuote={onAddToQuote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 