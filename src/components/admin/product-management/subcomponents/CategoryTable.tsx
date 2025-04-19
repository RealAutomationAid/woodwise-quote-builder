import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import React from "react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  getParentCategoryName: (parentId: string | null) => string;
  getChildCategories: (parentId: string) => Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  loading,
  getParentCategoryName,
  getChildCategories,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Име</TableHead>
            <TableHead>Родител</TableHead>
            <TableHead>Подкатегории</TableHead>
            <TableHead>Обновена</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                Зареждане на категории...
              </TableCell>
            </TableRow>
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                Няма намерени категории
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
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
                  <TableCell>
                    {format(new Date(category.updated_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Редактирай
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(category)} className="text-red-600">
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
  );
};

export default CategoryTable; 