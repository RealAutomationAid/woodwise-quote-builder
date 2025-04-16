import { useState, useMemo } from "react";
import { ProductType } from "./product-card";
import { FilterType } from "./product-filters";

export function useProductFilters(products: ProductType[]) {
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    category: null,
    materialType: null,
    minLength: 0,
    maxLength: 6000,
    isPlaned: null
  });
  
  // Extract unique categories and materials for filter options
  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))], 
    [products]
  );
  
  const materials = useMemo(() => 
    [...new Set(products.map(p => p.material))], 
    [products]
  );

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Material filter
      if (filters.materialType && product.material !== filters.materialType) {
        return false;
      }
      
      // Length filter (if at least one length is in range)
      const hasLengthInRange = product.lengths.some(
        length => length >= filters.minLength && length <= filters.maxLength
      );
      if (!hasLengthInRange) {
        return false;
      }
      
      // Planed filter
      if (filters.isPlaned !== null && product.isPlaned !== filters.isPlaned) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  return {
    filters,
    setFilters,
    categories,
    materials,
    filteredProducts
  };
} 