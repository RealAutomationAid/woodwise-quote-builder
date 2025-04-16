import { Button } from "@/components/ui/button";
import { Grid2X2, LayoutList } from "lucide-react";

type CatalogHeaderProps = {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
};

export function CatalogHeader({ viewMode, setViewMode }: CatalogHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Product Catalog</h1>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant={viewMode === 'grid' ? 'default' : 'outline'} 
          size="icon"
          onClick={() => setViewMode('grid')}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button 
          variant={viewMode === 'list' ? 'default' : 'outline'} 
          size="icon"
          onClick={() => setViewMode('list')}
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 