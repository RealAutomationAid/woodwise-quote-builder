import { useState, useMemo } from "react";
import { ProductType } from "./product-card";
import { ProductFilter } from "@/hooks/use-products";

export function useProductFilters(products: ProductType[]) {
  const [filters, setFilters] = useState<ProductFilter>({
    search: "",
    category: null,
    categoryIds: null,
    materialType: null,
    materials: null,
    minLength: 0,
    maxLength: 6000,
    isPlaned: null,
    inStock: null,
    minPrice: null,
    maxPrice: null,
    sortBy: "created_at:desc"
  });
  
  // Extract unique categories for filter options
  const categories = useMemo(() => {
    // Get unique categories with their IDs
    const uniqueCategories: { id: string; name: string; parent_id?: string | null }[] = [];
    products.forEach(p => {
      if (p.category && p.categoryId && !uniqueCategories.some(c => c.id === p.categoryId)) {
        uniqueCategories.push({ 
          id: p.categoryId, 
          name: p.category,
          parent_id: null // We don't have this info from the product, would need to fetch from API
        });
      }
    });
    return uniqueCategories;
  }, [products]);
  
  // Extract unique materials for filter options
  const materials = useMemo(() => 
    [...new Set(products.map(p => p.material).filter(Boolean))], 
    [products]
  );

  // Total count of products
  const totalCount = products.length;

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter - either by name or by ID
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      if (filters.categoryIds && filters.categoryIds.length > 0 && 
          product.categoryId && !filters.categoryIds.includes(product.categoryId)) {
        return false;
      }
      
      // Material filter - single or multiple
      if (filters.materialType && product.material !== filters.materialType) {
        return false;
      }
      
      if (filters.materials && filters.materials.length > 0 && 
          !filters.materials.includes(product.material)) {
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
      
      // In stock filter
      if (filters.inStock === true && (!product.stock_quantity || product.stock_quantity <= 0)) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    if (!filters.sortBy) return filteredProducts;
    
    const [field, direction] = filters.sortBy.split(':');
    const multiplier = direction === 'desc' ? -1 : 1;
    
    return [...filteredProducts].sort((a, b) => {
      if (field === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      } else if (field === 'price') {
        return multiplier * (a.pricePerUnit - b.pricePerUnit);
      } else if (field === 'created_at') {
        // Assume there's a createdAt field, or fallback to comparison by ID
        return multiplier * (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      }
      return 0;
    });
  }, [filteredProducts, filters.sortBy]);

  return {
    filters,
    setFilters,
    categories,
    materials,
    filteredProducts: sortedProducts,
    totalCount
  };
} 