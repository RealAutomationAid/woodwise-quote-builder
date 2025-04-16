import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

// Import sub-components
import { SearchBar } from "./filters/search-bar";
import { MobileFilters } from "./filters/mobile-filters";
import { DesktopFilters } from "./filters/desktop-filters";

export type FilterType = {
  search: string;
  category: string | null;
  materialType: string | null;
  minLength: number;
  maxLength: number;
  isPlaned: boolean | null;
};

type ProductFiltersProps = {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  categories: string[];
  materials: string[];
};

export function ProductFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  materials 
}: ProductFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const handleReset = () => {
    onFilterChange({
      search: "",
      category: null,
      materialType: null,
      minLength: 0,
      maxLength: 6000,
      isPlaned: null
    });
    setIsFiltersOpen(false);
  };
  
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };
  
  return (
    <div className="sticky top-[65px] z-20 bg-white border-b border-border pb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <SearchBar 
            value={filters.search} 
            onChange={handleSearchChange} 
          />
          
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
