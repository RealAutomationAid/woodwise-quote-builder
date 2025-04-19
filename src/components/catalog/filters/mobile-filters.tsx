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
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { ProductFilter } from "@/hooks/use-products";

type MobileFiltersProps = {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  categories: { id: string; name: string; parent_id?: string | null }[];
  materials: string[];
  onReset: () => void;
  onApply: () => void;
};

export function MobileFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  materials,
  onReset,
  onApply
}: MobileFiltersProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="mobile-category-trigger">Category</Label>
        <Select
          value={filters.category || "all-categories"}
          onValueChange={(value) => onFilterChange({ ...filters, category: value === "all-categories" ? null : value })}
        >
          <SelectTrigger id="mobile-category-trigger" className="mt-1">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="mobile-material-trigger">Material</Label>
        <Select
          value={filters.materialType || "all-materials"}
          onValueChange={(value) => onFilterChange({ ...filters, materialType: value === "all-materials" ? null : value })}
        >
          <SelectTrigger id="mobile-material-trigger" className="mt-1">
            <SelectValue placeholder="All Materials" />
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
      
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="planed-mobile"
            checked={filters.isPlaned === true}
            onCheckedChange={(checked) => {
              if (checked === "indeterminate") return;
              onFilterChange({ ...filters, isPlaned: checked || null });
            }}
          />
          <Label htmlFor="planed-mobile">Planed Only</Label>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => {
            onApply();
          }}
        >
          <Check className="h-4 w-4 mr-1" />
          Apply Filters
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onReset}
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
} 