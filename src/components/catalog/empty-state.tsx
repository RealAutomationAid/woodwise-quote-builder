import { SearchX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No products found</h3>
      <p className="text-muted-foreground max-w-md">
        No products match your search criteria. Try adjusting your filters or search term.
      </p>
    </div>
  );
} 