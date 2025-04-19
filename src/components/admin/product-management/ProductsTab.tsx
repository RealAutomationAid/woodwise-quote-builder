import { useState, useEffect } from "react";
import { 
  Edit, 
  Plus, 
  Trash2, 
  Search,
  ImageIcon,
  Filter,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import ProductTable from "./subcomponents/ProductTable";
import ProductFilterBar from "./subcomponents/ProductFilterBar";
import ProductDialog from "./subcomponents/ProductDialog";
import DeleteProductDialog from "./subcomponents/DeleteProductDialog";

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

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts((data || []).map((product: any) => ({
        ...product,
        stock_quantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : 0,
      })));
    } catch (error) {
      toast.error('Неуспешно зареждане на продуктите');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Неуспешно зареждане на категориите');
      console.error('Error:', error);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Няма';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Неизвестна';
  };

  const deleteProduct = async () => {
    try {
      if (!currentProduct) return;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);
      
      if (error) throw error;
      
      // If product has an image, delete it from storage
      if (currentProduct.image_url) {
        const imagePath = currentProduct.image_url.split('/').pop();
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([imagePath]);
          
          if (storageError) {
            console.error('Failed to delete product image:', storageError);
          }
        }
      }

      toast.success('Продуктът е изтрит успешно');
      setProducts(products.filter(product => product.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Неуспешно изтриване на продукт');
      console.error('Error:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleProductSaved = (savedProduct: Product) => {
    if (isAddDialogOpen) {
      setProducts([...products, savedProduct]);
      setIsAddDialogOpen(false);
    } else if (isEditDialogOpen) {
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
      setIsEditDialogOpen(false);
    }
  };

  const filteredProducts = products.filter(product => {
    let matchesSearch = true;
    let matchesCategory = true;

    if (searchQuery) {
      matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        product.material.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    if (filterCategory) {
      matchesCategory = product.category_id === filterCategory;
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <ProductFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        onClearFilters={() => {
          setSearchQuery("");
          setFilterCategory(null);
        }}
        onAddProduct={() => setIsAddDialogOpen(true)}
      />
      <ProductTable
        products={filteredProducts}
        loading={loading}
        getCategoryName={getCategoryName}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      <ProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Нов продукт"
        description="Попълнете детайлите, за да добавите нов продукт към вашия каталог."
        categories={categories}
        onSave={handleProductSaved}
        onCancel={() => setIsAddDialogOpen(false)}
      />
      <ProductDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Редактирай продукт"
        description="Актуализирайте детайлите на продукта."
        categories={categories}
        product={currentProduct}
        onSave={handleProductSaved}
        onCancel={() => setIsEditDialogOpen(false)}
      />
      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={currentProduct}
        onDelete={deleteProduct}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}

// Missing icon component - add this at the end of the file
function Ellipsis(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

// Missing icon component - add this at the end of the file
function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
} 