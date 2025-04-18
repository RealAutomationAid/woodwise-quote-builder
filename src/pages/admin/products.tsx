import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package } from "lucide-react";
import ProductsTab from "@/components/admin/product-management/ProductsTab";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Управление на продукти
          </h1>
          <p className="text-muted-foreground">
            Добавяне, редактиране и управление на продуктовия каталог.
          </p>
        </div>
        
        <ProductsTab />
      </div>
    </AdminLayout>
  );
} 