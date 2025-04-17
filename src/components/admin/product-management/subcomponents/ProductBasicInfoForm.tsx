import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Product {
  name: string;
  description: string | null;
  material: string;
  is_planed: boolean;
  category_id: string | null;
}

interface ProductBasicInfoFormProps {
  formData: Partial<Product>;
  setFormData: (data: Partial<Product>) => void;
  categories: Category[];
  handleCategoryChange: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (checked: boolean) => void;
}

const ProductBasicInfoForm: React.FC<ProductBasicInfoFormProps> = ({
  formData,
  setFormData,
  categories,
  handleCategoryChange,
  handleChange,
  handleCheckboxChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Enter product name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id || "none"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
        <Input
          id="material"
          name="material"
          value={formData.material || ""}
          onChange={handleChange}
          placeholder="Enter material type"
        />
      </div>
      <div className="space-y-2 flex items-center">
        <div className="flex items-center space-x-2 mt-8">
          <Checkbox
            id="is_planed"
            checked={formData.is_planed}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="is_planed" className="font-normal">
            Planed material
          </Label>
        </div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={4}
        />
      </div>
    </div>
  );
};

export default ProductBasicInfoForm; 