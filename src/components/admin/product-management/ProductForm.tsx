import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ImageIcon, 
  Trash2, 
  Upload, 
  Plus, 
  X,
  Loader2
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ProductBasicInfoForm from "./subcomponents/ProductBasicInfoForm";
import ProductLengthsEditor from "./subcomponents/ProductLengthsEditor";
import ProductImageUpload from "./subcomponents/ProductImageUpload";
import ProductInventoryForm from "./subcomponents/ProductInventoryForm";

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

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      material: "",
      lengths: [1000, 1500, 2000],
      is_planed: true,
      price_per_unit: 0,
      category_id: null,
      image_url: null,
      stock_quantity: 0,
    }
  );
  
  const [lengthInput, setLengthInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image_url || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = parseFloat(e.target.value);
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      is_planed: checked,
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category_id: value === "none" ? null : value,
    });
  };

  const addLength = () => {
    const length = parseInt(lengthInput);
    if (isNaN(length) || length <= 0) {
      toast.error("Please enter a valid length");
      return;
    }

    if (formData.lengths?.includes(length)) {
      toast.error("This length is already added");
      return;
    }

    setFormData({
      ...formData,
      lengths: [...(formData.lengths || []), length].sort((a, b) => a - b),
    });
    setLengthInput("");
  };

  const removeLength = (length: number) => {
    setFormData({
      ...formData,
      lengths: formData.lengths?.filter((l) => l !== length) || [],
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setImageFile(null);
      return;
    }

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    
    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      ...formData,
      image_url: null,
    });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile && !imagePreview) return null;
    
    // If image hasn't changed, return the existing URL
    if (!imageFile && imagePreview === formData.image_url) {
      return formData.image_url;
    }
    
    if (!imageFile) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a unique file name to avoid conflicts
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
      
      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveProduct = async () => {
    if (!formData.name?.trim()) {
      toast.error("Product name cannot be empty");
      return;
    }

    if (!formData.material?.trim()) {
      toast.error("Material cannot be empty");
      return;
    }

    if (!formData.lengths || formData.lengths.length === 0) {
      toast.error("Please add at least one length option");
      return;
    }

    if (
      formData.price_per_unit === undefined ||
      formData.price_per_unit <= 0
    ) {
      toast.error("Price must be greater than zero");
      return;
    }

    setLoading(true);

    try {
      // Upload image first if there's a file
      const imageUrl = await uploadImage();
      
      const updatedProduct = {
        ...formData,
        image_url: imageUrl || formData.image_url,
      };

      if (product) {
        // Update existing product
        const { data, error } = await supabase
          .from("products")
          .update({
            name: updatedProduct.name?.trim(),
            description: updatedProduct.description?.trim() || null,
            material: updatedProduct.material?.trim(),
            lengths: updatedProduct.lengths,
            is_planed: updatedProduct.is_planed || false,
            price_per_unit: updatedProduct.price_per_unit,
            category_id: updatedProduct.category_id || null,
            image_url: updatedProduct.image_url,
            stock_quantity: updatedProduct.stock_quantity || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id)
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Product updated successfully");
        onSave(data as Product);
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              name: updatedProduct.name?.trim(),
              description: updatedProduct.description?.trim() || null,
              material: updatedProduct.material?.trim(),
              lengths: updatedProduct.lengths,
              is_planed: updatedProduct.is_planed || false,
              price_per_unit: updatedProduct.price_per_unit,
              category_id: updatedProduct.category_id || null,
              image_url: updatedProduct.image_url,
              stock_quantity: updatedProduct.stock_quantity || 0,
            },
          ])
          .select();

        if (error) throw error;
        
        toast.success("Product added successfully");
        onSave(data[0] as Product);
      }
    } catch (error) {
      toast.error(product ? "Failed to update product" : "Failed to add product");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="inventory">Inventory & Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <ProductBasicInfoForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            handleCategoryChange={handleCategoryChange}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
          />
          <ProductLengthsEditor
            formData={formData}
            setFormData={setFormData}
            lengthInput={lengthInput}
            setLengthInput={setLengthInput}
            addLength={addLength}
            removeLength={removeLength}
          />
          <ProductImageUpload
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <ProductInventoryForm
            formData={formData}
            handleNumberChange={handleNumberChange}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={saveProduct} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{product ? "Update Product" : "Add Product"}</>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
} 