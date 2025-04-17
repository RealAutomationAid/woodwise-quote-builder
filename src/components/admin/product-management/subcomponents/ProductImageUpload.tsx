import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Trash2, Loader2 } from "lucide-react";
import React from "react";

interface ProductImageUploadProps {
  imagePreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  isUploading: boolean;
  uploadProgress: number;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  imagePreview,
  handleImageChange,
  removeImage,
  isUploading,
  uploadProgress,
}) => {
  return (
    <div className="space-y-3">
      <label className="font-medium">Product Image</label>
      <div className="flex items-center gap-6">
        <div className="h-40 w-40 border rounded-md overflow-hidden flex items-center justify-center bg-muted/50">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Recommended size: 800x800px. Max file size: 5MB.
          </p>
          {imagePreview && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="mt-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Image
            </Button>
          )}
          {isUploading && (
            <div className="w-full max-w-xs mt-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading: {uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductImageUpload; 