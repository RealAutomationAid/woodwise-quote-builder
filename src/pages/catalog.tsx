
import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { ProductCard, ProductType } from "@/components/catalog/product-card";
import { ProductFilters, FilterType } from "@/components/catalog/product-filters";
import { ProductDetailView, ProductConfigType } from "@/components/catalog/product-detail-view";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Grid2X2, LayoutList } from "lucide-react";

// Sample data for demonstration
const SAMPLE_PRODUCTS: ProductType[] = [
  {
    id: "1",
    name: "Pine Timber Beam",
    category: "Structural Timber",
    material: "Pine",
    lengths: [2000, 3000, 4000, 5000],
    isPlaned: true,
    pricePerUnit: 45.99,
    description: "High-quality pine timber beams, perfect for construction projects requiring sturdy, reliable support."
  },
  {
    id: "2",
    name: "Oak Floorboard",
    category: "Flooring",
    material: "Oak",
    lengths: [1000, 1500, 2000],
    isPlaned: true,
    pricePerUnit: 65.50,
    description: "Premium oak floorboards with a smooth finish, ideal for elegant interior flooring solutions."
  },
  {
    id: "3",
    name: "Spruce Wall Panel",
    category: "Wall Paneling",
    material: "Spruce",
    lengths: [1800, 2400, 3000],
    isPlaned: false,
    pricePerUnit: 35.25,
    description: "Natural spruce wall panels for interior and exterior wall applications."
  },
  {
    id: "4",
    name: "Cedar Decking Board",
    category: "Decking",
    material: "Cedar",
    lengths: [3000, 3600, 4200],
    isPlaned: true,
    pricePerUnit: 78.30,
    description: "Weather-resistant cedar decking boards, perfect for outdoor patios and decks."
  },
  {
    id: "5",
    name: "Birch Plywood Sheet",
    category: "Sheet Materials",
    material: "Birch",
    lengths: [1220, 2440],
    isPlaned: true,
    pricePerUnit: 55.75,
    description: "High-grade birch plywood sheets for furniture manufacturing and interior fittings."
  },
  {
    id: "6",
    name: "Pine Roof Batten",
    category: "Roofing",
    material: "Pine",
    lengths: [3000, 3600, 4200, 4800],
    isPlaned: false,
    pricePerUnit: 28.99,
    description: "Untreated pine battens for roof construction and general carpentry."
  }
];

// Simulate fetching items from a server
const fetchProducts = () => {
  return new Promise<ProductType[]>((resolve) => {
    setTimeout(() => resolve(SAMPLE_PRODUCTS), 300);
  });
};

const CatalogPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for the shopping cart/quote
  const [quoteItems, setQuoteItems] = useState<string[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    category: null,
    materialType: null,
    minLength: 0,
    maxLength: 6000,
    isPlaned: null
  });
  
  // Extract unique categories and materials for filter options
  const categories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
  const materials = [...new Set(SAMPLE_PRODUCTS.map(p => p.material))];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
    
    // Check if there are items in localStorage
    const savedQuoteItems = localStorage.getItem("quoteItems");
    if (savedQuoteItems) {
      setQuoteItems(JSON.parse(savedQuoteItems));
    }
  }, []);

  // Handle adding a product to the quote
  const handleAddToQuote = (product: ProductType, config?: ProductConfigType) => {
    const newQuoteItems = [...quoteItems, product.id];
    setQuoteItems(newQuoteItems);
    localStorage.setItem("quoteItems", JSON.stringify(newQuoteItems));
    toast.success(`${product.name} added to quote!`);
  };

  // Filter products based on current filters
  const filteredProducts = products.filter(product => {
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Material filter
    if (filters.materialType && product.material !== filters.materialType) {
      return false;
    }
    
    // Length filter (if at least one length is in range)
    const hasLengthInRange = product.lengths.some(
      length => length >= filters.minLength && length <= filters.maxLength
    );
    if (!hasLengthInRange) {
      return false;
    }
    
    // Planed filter
    if (filters.isPlaned !== null && product.isPlaned !== filters.isPlaned) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader 
        isLoggedIn={true} 
        quoteItemCount={quoteItems.length} 
        onLogout={() => navigate("/")} 
      />
      
      <ProductFilters 
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        materials={materials}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
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
        
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading products...</div>
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      onAddToQuote={handleAddToQuote}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-border rounded-md p-4 bg-white">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-medium">{product.name}</h3>
                          <p className="text-muted-foreground">{product.category}</p>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium">Material:</span> {product.material}</p>
                              <p><span className="font-medium">Planed:</span> {product.isPlaned ? 'Yes' : 'No'}</p>
                              <p>
                                <span className="font-medium">Lengths:</span> {product.lengths.join(', ')}mm
                              </p>
                            </div>
                            
                            {product.pricePerUnit && (
                              <div className="text-right md:block">
                                <p className="font-semibold text-lg">
                                  ${product.pricePerUnit.toFixed(2)} per unit
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 flex justify-end gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleAddToQuote(product)}
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() => handleAddToQuote(product)}
                            >
                              Add to Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>
      
      <MainFooter />
    </div>
  );
};

export default CatalogPage;
