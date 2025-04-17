import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFilter, ProductSortOption } from "@/hooks/use-products";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdvancedFiltersProps {
  filters: ProductFilter;
  onFilterChange: (filters: ProductFilter) => void;
  categories: { id: string; name: string; parent_id?: string | null }[];
  materials: string[];
  onClose?: () => void;
}

export function AdvancedFilters({
  filters,
  onFilterChange,
  categories,
  materials,
  onClose,
}: AdvancedFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000,
  ]);
  const [lengthRange, setLengthRange] = useState<[number, number]>([
    filters.minLength || 0,
    filters.maxLength || 6000,
  ]);

  // For multiple category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categoryIds || []
  );

  // For multiple material selection
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    filters.materials || []
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleLengthChange = (value: number[]) => {
    setLengthRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    onFilterChange({
      ...filters,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
      materials: selectedMaterials.length > 0 ? selectedMaterials : null,
      minPrice: priceRange[0] > 0 ? priceRange[0] : null,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : null,
      minLength: lengthRange[0],
      maxLength: lengthRange[1],
    });
    if (onClose) onClose();
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceRange([0, 1000]);
    setLengthRange([0, 6000]);
    onFilterChange({
      ...filters,
      categoryIds: null,
      materials: null,
      minPrice: null,
      maxPrice: null,
      minLength: 0,
      maxLength: 6000,
      isPlaned: null,
      inStock: null,
    });
  };

  return (
    <div
      className="relative flex flex-col max-w-full md:max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg border border-border min-w-[350px] md:min-w-[600px] h-[80vh] md:h-[80vh]"
      style={{ maxHeight: '90vh' }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
        aria-label="Затвори"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <h2 className="text-xl font-bold mb-4 text-center">Разширени филтри</h2>
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-32">
        <div>
          <h3 className="font-medium mb-2">Сортирай по</h3>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              onFilterChange({ ...filters, sortBy: value as ProductSortOption })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Сортирай по..." />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "name:asc", label: "Име (A-Я)" },
                { value: "name:desc", label: "Име (Я-A)" },
                { value: "price:asc", label: "Цена (Ниска към Висока)" },
                { value: "price:desc", label: "Цена (Висока към Ниска)" },
                { value: "created_at:desc", label: "Най-нови" },
                { value: "created_at:asc", label: "Най-стари" },
              ].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h3 className="font-medium mb-2">Категории</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Няма налични категории</p>
            )}
          </div>
          {selectedCategories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedCategories.map((catId) => (
                <Badge
                  key={catId}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {categories.find(c => c.id === catId)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryToggle(catId)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium mb-2">Материали</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={() => handleMaterialToggle(material)}
                />
                <Label
                  htmlFor={`material-${material}`}
                  className="cursor-pointer"
                >
                  {material}
                </Label>
              </div>
            ))}
          </div>
          {selectedMaterials.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedMaterials.map((material) => (
                <Badge
                  key={material}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {material}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleMaterialToggle(material)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium mb-2">Ценови диапазон</h3>
          <div className="px-2">
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              max={1000}
              step={10}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm">
              <span>{priceRange[0]} лв.</span>
              <span>{priceRange[1]} лв.</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Дължина (мм)</h3>
          <div className="px-2">
            <Slider
              defaultValue={[lengthRange[0], lengthRange[1]]}
              max={6000}
              step={100}
              value={[lengthRange[0], lengthRange[1]]}
              onValueChange={handleLengthChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm">
              <span>{lengthRange[0]} мм</span>
              <span>{lengthRange[1]} мм</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Обработка</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-planed"
                checked={filters.isPlaned === true}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") return;
                  onFilterChange({
                    ...filters,
                    isPlaned: checked === true ? true : null,
                  });
                }}
              />
              <Label htmlFor="filter-planed" className="cursor-pointer">
                Само рендосани
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-unplaned"
                checked={filters.isPlaned === false}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") return;
                  onFilterChange({
                    ...filters,
                    isPlaned: checked === true ? false : null,
                  });
                }}
              />
              <Label htmlFor="filter-unplaned" className="cursor-pointer">
                Само не рендосани
              </Label>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Наличност</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-instock"
              checked={filters.inStock === true}
              onCheckedChange={(checked) => {
                if (checked === "indeterminate") return;
                onFilterChange({
                  ...filters,
                  inStock: checked === true ? true : null,
                });
              }}
            />
            <Label htmlFor="filter-instock" className="cursor-pointer">
              Само налични
            </Label>
          </div>
        </div>
        <Separator />
      </div>
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-4 bg-white border-t flex flex-col md:flex-row justify-between items-center mt-4 gap-2 z-10 shadow-lg">
        <Button variant="outline" onClick={resetFilters} className="flex-1 md:mr-2">
          Нулирай
        </Button>
        <Button onClick={applyFilters} className="flex-1 bg-primary">
          Приложи филтрите
        </Button>
      </div>
    </div>
  );
} 