import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import React from "react";

interface ProductLengthsEditorProps {
  formData: { lengths?: number[] };
  setFormData: (data: any) => void;
  lengthInput: string;
  setLengthInput: (val: string) => void;
  addLength: () => void;
  removeLength: (length: number) => void;
}

const ProductLengthsEditor: React.FC<ProductLengthsEditorProps> = ({
  formData,
  lengthInput,
  setLengthInput,
  addLength,
  removeLength,
}) => {
  return (
    <div className="space-y-2">
      <label className="font-medium">Available Lengths</label>
      <div className="flex flex-wrap gap-2 py-2">
        {formData.lengths && formData.lengths.length > 0 ? (
          formData.lengths.map((length) => (
            <Badge
              key={length}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {length}mm
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeLength(length)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No lengths added yet
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter length in mm"
          value={lengthInput}
          onChange={(e) => setLengthInput(e.target.value)}
          type="number"
          min="1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addLength}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductLengthsEditor; 