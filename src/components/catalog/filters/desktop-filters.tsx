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
import { X } from "lucide-react";
import { ProductFilter } from "@/hooks/use-products";

type DesktopFiltersProps = {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  categories: { id: string; name: string; parent_id?: string | null }[];
  materials: string[];
  onReset: () => void;
};

export function DesktopFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  materials,
  onReset
}: DesktopFiltersProps) {
  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.category || filters.materialType || filters.isPlaned;
  
  return (
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
            {categories.filter(category => {
              const valid = typeof category.id === 'string' && category.id.trim() !== '' && typeof category.name === 'string' && category.name.trim() !== '';
              if (!valid) {
                if (process.env.NODE_ENV !== 'production') {
                  console.warn('[DesktopFilters] Skipping category with invalid id or name:', category);
                }
              }
              return valid;
            }).map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {String(category.name)}
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
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground"
          onClick={onReset}
        >
          <X className="h-3 w-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
} 