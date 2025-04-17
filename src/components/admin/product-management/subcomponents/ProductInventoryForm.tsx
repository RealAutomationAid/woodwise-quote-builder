import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface ProductInventoryFormProps {
  formData: { price_per_unit?: number; stock_quantity?: number };
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

const ProductInventoryForm: React.FC<ProductInventoryFormProps> = ({
  formData,
  handleNumberChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price_per_unit">Base Price (per unit)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5">$</span>
          <Input
            id="price_per_unit"
            type="number"
            min="0"
            step="0.01"
            value={formData.price_per_unit || ""}
            onChange={(e) => handleNumberChange(e, "price_per_unit")}
            className="pl-7"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="stock_quantity">Stock Quantity</Label>
        <Input
          id="stock_quantity"
          type="number"
          min="0"
          value={formData.stock_quantity || ""}
          onChange={(e) => handleNumberChange(e, "stock_quantity")}
        />
      </div>
    </div>
  );
};

export default ProductInventoryForm; 