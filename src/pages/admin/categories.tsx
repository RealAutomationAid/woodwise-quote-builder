import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tags } from "lucide-react";
import CategoriesTab from "@/components/admin/product-management/CategoriesTab";

export default function AdminCategoriesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Tags className="h-8 w-8" />
            Categories Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and organize product categories.
          </p>
        </div>
        
        <CategoriesTab />
      </div>
    </AdminLayout>
  );
}
