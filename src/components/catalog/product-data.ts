import { ProductType } from "./product-card";
import { supabase } from "@/integrations/supabase/client";

// Sample data for demonstration - keeping as fallback
export const SAMPLE_PRODUCTS: ProductType[] = [
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

// Fetch products from Supabase
export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)');
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    // Transform data to expected format
    return data.map(product => ({
      id: product.id,
      name: product.name,
      category: product.categories?.name || 'Uncategorized',
      categoryId: product.category_id,
      category_id: product.category_id,
      material: product.material,
      lengths: product.lengths || [2000, 3000, 4000],
      isPlaned: product.is_planed,
      pricePerUnit: product.price_per_unit,
      price_per_unit: product.price_per_unit,
      description: product.description,
      image: product.image_url,
      imageUrl: product.image_url,
      stock_quantity: product.stock_quantity,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch products from Supabase:', error);
    return SAMPLE_PRODUCTS; // Fallback to sample data
  }
}; 