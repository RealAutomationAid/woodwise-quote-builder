import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, RefreshCw, Search } from "lucide-react";
import React from "react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string | null;
  setFilterCategory: (c: string | null) => void;
  categories: Category[];
  onClearFilters: () => void;
  onAddProduct: () => void;
}

const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  categories,
  onClearFilters,
  onAddProduct,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 w-full max-w-md">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Търсене на продукти..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Select value={filterCategory || 'all'} onValueChange={(value) => setFilterCategory(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Всички категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички категории</SelectItem>
            {categories.filter(category => {
              const valid = typeof category.id === 'string' && category.id.trim() !== '';
              if (!valid) {
                if (process.env.NODE_ENV !== 'production') {
                  console.warn('Skipping category with invalid id:', category);
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onClearFilters}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Изчисти филтрите</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button onClick={onAddProduct}>
        <Plus className="mr-2 h-4 w-4" /> Добави продукт
      </Button>
    </div>
  );
};

export default ProductFilterBar; 