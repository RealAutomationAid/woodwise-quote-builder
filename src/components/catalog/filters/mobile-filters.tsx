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
import { FilterType } from "../product-filters";

type MobileFiltersProps = {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  categories: string[];
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
          <Label htmlFor="planed-mobile">Planed Only</Label>
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