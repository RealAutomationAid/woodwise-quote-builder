import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "../ProductForm";
import React from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  material: string;
  lengths: number[];
  is_planed: boolean;
  price_per_unit: number;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  stock_quantity: number;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  categories: Category[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  product?: Product | null;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  categories,
  onSave,
  onCancel,
  product,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product || undefined}
          categories={categories}
          onSave={onSave}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog; 