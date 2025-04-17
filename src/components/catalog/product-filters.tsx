import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ProductFilter, DEFAULT_FILTER } from "@/hooks/use-products";

// Import sub-components
import { SearchBar } from "./filters/search-bar";
import { MobileFilters } from "./filters/mobile-filters";
import { DesktopFilters } from "./filters/desktop-filters";
import { AdvancedFilters } from "./filters/advanced-filters";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-mobile";

type ProductFiltersProps = {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  categories: { id: string; name: string; parent_id?: string | null }[];
  materials: string[];
  totalCount: number;
};

export function ProductFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  materials,
  totalCount
}: ProductFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const handleReset = () => {
    onFilterChange(DEFAULT_FILTER);
    setIsFiltersOpen(false);
    setIsAdvancedFiltersOpen(false);
  };
  
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  // Count active filters (excluding search and default sort)
  const activeFilterCount = [
    filters.category,
    filters.categoryIds?.length,
    filters.materialType,
    filters.materials?.length,
    filters.isPlaned !== null,
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.minLength > 0,
    filters.maxLength < 6000,
    filters.inStock,
    filters.sortBy !== DEFAULT_FILTER.sortBy
  ].filter(Boolean).length;
  
  return (
    <div className="sticky top-[65px] z-20 bg-white border-b border-border pb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1">
            <SearchBar 
              value={filters.search} 
              onChange={handleSearchChange} 
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Show result count */}
            <Badge variant="outline" className="hidden md:flex">
              {totalCount} {totalCount === 1 ? 'result' : 'results'}
            </Badge>

            {/* Show active filter count */}
            {activeFilterCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleReset}
              >
                <FilterX className="h-4 w-4" />
                Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
              </Button>
            )}

            {/* Desktop: Advanced Filter Drawer */}
            {!isMobile && (
              <Drawer open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-w-2xl min-w-[600px] w-full mx-auto md:p-8 p-4">
                  <AdvancedFilters 
                    filters={filters}
                    onFilterChange={onFilterChange}
                    categories={categories}
                    materials={materials}
                    onClose={() => setIsAdvancedFiltersOpen(false)}
                  />
                </DrawerContent>
              </Drawer>
            )}

            {/* Mobile: Filter Sheet */}
            <div className="md:hidden">
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <MobileFilters 
                      filters={filters} 
                      onFilterChange={onFilterChange}
                      categories={categories}
                      materials={materials}
                      onReset={handleReset}
                      onApply={() => setIsFiltersOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        <DesktopFilters 
          filters={filters}
          onFilterChange={onFilterChange}
          categories={categories}
          materials={materials}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
