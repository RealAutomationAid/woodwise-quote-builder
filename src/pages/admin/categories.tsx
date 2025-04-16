
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-lg border">
          {/* We'll implement the category list and management UI here */}
          <div className="p-4">
            Coming soon: Category management interface
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
