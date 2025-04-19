import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProductSortOption = 
  | 'name:asc' 
  | 'name:desc' 
  | 'price:asc' 
  | 'price:desc' 
  | 'created_at:desc' 
  | 'created_at:asc';

export type ProductFilter = {
  search: string;
  category: string | null;
  categoryIds: string[] | null; // Support multiple category selection
  materialType: string | null;
  materials: string[] | null; // Support multiple material selection
  minLength: number;
  maxLength: number;
  isPlaned: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: ProductSortOption;
  inStock: boolean | null; // Optional filter for in-stock products
};

export const DEFAULT_FILTER: ProductFilter = {
  search: '',
  category: null,
  categoryIds: null,
  materialType: null,
  materials: null,
  minLength: 0,
  maxLength: 6000,
  isPlaned: null,
  minPrice: null,
  maxPrice: null,
  sortBy: 'created_at:desc',
  inStock: null,
};

export function useProducts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async (filters: ProductFilter) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the parameters for the advanced search edge function
      const [sortField, sortDirection] = filters.sortBy.split(':');
      
      const params = {
        searchTerm: filters.search.trim() || null,
        categoryIds: filters.categoryIds || null,
        materialTypes: filters.materials || (filters.materialType ? [filters.materialType] : null),
        minLength: filters.minLength > 0 ? filters.minLength : null,
        maxLength: filters.maxLength < 6000 ? filters.maxLength : null,
        isPlaned: filters.isPlaned,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        sortField,
        sortDirection
      };

      // Call the edge function for advanced search
      const { data, error } = await supabase.functions.invoke('advanced-search-products', {
        body: JSON.stringify(params)
      });

      if (error) throw error;

      setProducts(data?.data || []);
      setTotalCount(data?.count || 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      
      // Fallback to basic query if the edge function fails
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            categories:category_id (id, name, parent_id)
          `, { count: 'exact' });

        if (filters.search && filters.search.trim() !== '') {
          query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error, count } = await query;
        
        if (error) throw error;
        
        setProducts(data || []);
        setTotalCount(count || 0);
      } catch (fallbackErr: any) {
        console.error('Fallback query also failed:', fallbackErr);
        setProducts([]);
        setTotalCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    totalCount,
    isLoading,
    error,
    fetchProducts,
  };
} 