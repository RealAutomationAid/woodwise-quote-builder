
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

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
  
  return (
    <div className="sticky top-[65px] z-20 bg-white border-b border-border pb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
          
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
        
        <div className="hidden md:flex flex-wrap gap-4 mt-2">
          <div className="flex-1 min-w-[150px]">
            <Select
              value={filters.category || "all-categories"}
              onValueChange={(value) => onFilterChange({ ...filters, category: value === "all-categories" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Select
              value={filters.materialType || "all-materials"}
              onValueChange={(value) => onFilterChange({ ...filters, materialType: value === "all-materials" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Material Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-materials">All Materials</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="planed-desktop"
              checked={filters.isPlaned === true}
              onCheckedChange={(checked) => {
                if (checked === "indeterminate") return;
                onFilterChange({ ...filters, isPlaned: checked || null });
              }}
            />
            <Label htmlFor="planed-desktop">Planed Only</Label>
          </div>
          
          {(filters.search || filters.category || filters.materialType || filters.isPlaned) && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
              onClick={handleReset}
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  materials,
  onReset,
  onApply
}: ProductFiltersProps & { onReset: () => void; onApply: () => void }) {
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-mobile">Category</Label>
          <Select
            value={filters.category || "all-categories"}
            onValueChange={(value) => onFilterChange({ ...filters, category: value === "all-categories" ? null : value })}
          >
            <SelectTrigger id="category-mobile">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="material-mobile">Material Type</Label>
          <Select
            value={filters.materialType || "all-materials"}
            onValueChange={(value) => onFilterChange({ ...filters, materialType: value === "all-materials" ? null : value })}
          >
            <SelectTrigger id="material-mobile">
              <SelectValue placeholder="Material Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-materials">All Materials</SelectItem>
              {materials.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label className="mb-2">Length Range</Label>
          <div className="px-2">
            <Slider
              defaultValue={[filters.minLength, filters.maxLength]}
              min={0}
              max={6000}
              step={100}
              onValueChange={([min, max]) => 
                onFilterChange({ ...filters, minLength: min, maxLength: max })}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{filters.minLength}mm</span>
            <span>{filters.maxLength}mm</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="planed-mobile"
            checked={filters.isPlaned === true}
            onCheckedChange={(checked) => {
              if (checked === "indeterminate") return;
              onFilterChange({ ...filters, isPlaned: checked || null });
            }}
          />
          <Label htmlFor="planed-mobile">Planed Only (Рендосана)</Label>
        </div>
      </div>
      
      <div className="flex gap-4 mt-8">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Reset
        </Button>
        <Button className="flex-1" onClick={onApply}>
          Apply Filters
        </Button>
      </div>
    </>
  );
}
