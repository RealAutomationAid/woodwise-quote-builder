import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageIcon, Edit, Trash2, Package } from "lucide-react";
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

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  getCategoryName: (categoryId: string | null) => string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, loading, getCategoryName, onEdit, onDelete }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Изображение</TableHead>
            <TableHead>Име</TableHead>
            <TableHead>Материал</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Дължини</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead className="w-[100px]">Наличност</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Package className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Зареждане на продукти...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Няма намерени продукти</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image_url ? (
                    <div className="h-12 w-12 relative rounded-md overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-md">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  {product.description && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <p className="text-sm text-muted-foreground cursor-help truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">Описание</h4>
                          <p className="text-sm">{product.description}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </TableCell>
                <TableCell>{product.material}</TableCell>
                <TableCell>
                  {product.category_id ? (
                    <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Няма</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {product.lengths.map((length) => (
                      <Badge variant="secondary" key={length}>
                        {length}mm
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  ${product.price_per_unit.toFixed(2)}
                  <div className="text-xs text-muted-foreground">
                    {product.is_planed ? 'Рендосан' : 'Нерендиран'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={product.stock_quantity > 10 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'}>
                    {product.stock_quantity}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактирай</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" /> Редактирай
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Изтрий
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable; 