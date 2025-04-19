import { useState, useEffect } from "react";
import { 
  Edit, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Tag
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
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topLevelCategories, setTopLevelCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parent_id: null as string | null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter top-level categories for parent selection
    const topLevel = categories.filter(
      category => category.parent_id === null
    );
    setTopLevelCategories(topLevel);
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Неуспешно зареждане на категориите');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return 'None';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown';
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  const addCategory = async () => {
    try {
      setLoading(true);
      const { name, parent_id } = newCategory;
      
      const finalParentId = parent_id === 'none' ? null : parent_id;
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, parent_id: finalParentId }])
        .select('*')
        .single();

      if (error) {
        toast.error('Неуспешно добавяне на категория: ' + error.message);
        return;
      }

      // Add the new category to the local state
      setCategories([...categories, data]);
      
      // Reset the form
      setNewCategory({ name: '', parent_id: null });
      setIsAddDialogOpen(false);
      toast.success('Категорията е добавена успешно!');
    } catch (error: any) {
      toast.error(`Грешка при добавяне на категория: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async () => {
    try {
      setLoading(true);
      const { id, name, parent_id } = currentCategory;
      
      const finalParentId = parent_id === 'none' ? null : parent_id;

      const { data, error } = await supabase
        .from('categories')
        .update({ name, parent_id: finalParentId })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        toast.error('Неуспешно обновяване на категория: ' + error.message);
        return;
      }

      // Update the category in the local state
      setCategories(categories.map(cat => cat.id === id ? data : cat));
      
      // Close the dialog
      setIsEditDialogOpen(false);
      toast.success('Категорията е обновена успешно!');
    } catch (error: any) {
      toast.error(`Грешка при обновяване на категория: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    try {
      if (!currentCategory) return;

      // Check if category has children
      const hasChildren = categories.some(cat => cat.parent_id === currentCategory.id);
      if (hasChildren) {
        toast.error('Не може да изтриете категория, която има подкатегории');
        return;
      }

      // Check if category is used by products
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', currentCategory.id);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.error(`Не може да изтриете: ${count} продукта използват тази категория`);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', currentCategory.id);
      
      if (error) throw error;
      
      toast.success('Категорията е изтрита успешно');
      setCategories(categories.filter(category => category.id !== currentCategory.id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Неуспешно изтриване на категория');
      console.error('Error:', error);
    }
  };

  const resetNewCategoryForm = () => {
    setNewCategory({
      name: '',
      parent_id: null
    });
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-full max-w-md">
          <Input
            placeholder="Търсене на категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSearchQuery('')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Изчисти търсенето</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добави категория
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Име на категория</TableHead>
              <TableHead>Родителска категория</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Зареждане на категории...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Няма намерени категории.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => {
                const childCategories = getChildCategories(category.id);
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {category.parent_id ? (
                        <Badge variant="outline">
                          {getParentCategoryName(category.parent_id)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Няма</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {childCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {childCategories.map(child => (
                            <Badge key={child.id} variant="secondary">
                              {child.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Няма</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Ellipsis className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(category)}>
                            <Edit className="mr-2 h-4 w-4" /> Редактирай
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(category)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Изтрий
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Нова категория</DialogTitle>
            <DialogDescription>
              Създайте нова категория или подкатегория за вашите продукти.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Име на категория</Label>
              <Input
                id="new-category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Въведете име на категория"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-parent">Родителска категория (по избор)</Label>
              <Select
                value={newCategory.parent_id || ''}
                onValueChange={(value) => setNewCategory({ ...newCategory, parent_id: value || null })}
              >
                <SelectTrigger id="new-category-parent">
                  <SelectValue placeholder="Изберете родителска категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Няма (основна категория)</SelectItem>
                  {categories
                    .filter(category => {
                      const valid = typeof category.id === 'string' && category.id.trim() !== '';
                      if (!valid) {
                        if (process.env.NODE_ENV !== 'production') {
                          console.warn('Skipping category with invalid id:', category);
                        }
                      }
                      return valid;
                    })
                    .filter(category => category.id !== currentCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {String(category.name)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отказ
            </Button>
            <Button onClick={addCategory}>
              Добави категория
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактирай категория</DialogTitle>
            <DialogDescription>
              Актуализирайте името или родителската връзка на категорията.
            </DialogDescription>
          </DialogHeader>
          {currentCategory && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Име на категория</Label>
                <Input
                  id="edit-category-name"
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category-parent">Родителска категория</Label>
                <Select
                  value={currentCategory.parent_id || ''}
                  onValueChange={(value) => setCurrentCategory({ ...currentCategory, parent_id: value || null })}
                >
                  <SelectTrigger id="edit-category-parent">
                    <SelectValue placeholder="Изберете родителска категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Няма (основна категория)</SelectItem>
                    {categories
                      .filter(category => {
                        const valid = typeof category.id === 'string' && category.id.trim() !== '';
                        if (!valid) {
                          if (process.env.NODE_ENV !== 'production') {
                            console.warn('Skipping category with invalid id:', category);
                          }
                        }
                        return valid;
                      })
                      .filter(category => category.id !== currentCategory?.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {String(category.name)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Забележка: Не можете да изберете тази категория или нейните подкатегории като родител.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отказ
            </Button>
            <Button onClick={updateCategory}>
              Обнови категория
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{currentCategory?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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