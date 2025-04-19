import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X, Plus, Save, FileDown, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";

interface QuoteProduct {
  id: string;
  name: string;
  material: string;
  price_per_unit: number;
  lengths: number[];
  is_planed: boolean;
  stock_quantity: number;
}

interface DbProduct {
  id: string;
  name: string;
  material: string;
  price_per_unit: number;
  lengths: number[];
  is_planed: boolean;
  category_id?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  stock_quantity?: number;
}

interface QuoteItem {
  product: QuoteProduct;
  quantity: number;
  length: number;
  material: string;
  is_planed: boolean;
  unit_price: number;
  total_price: number;
}

interface GenerateQuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
}

export function GenerateQuoteForm({
  isOpen,
  onClose,
  customerId,
  customerName,
  customerEmail,
}: GenerateQuoteFormProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [subject, setSubject] = useState(`Quote for ${customerName || "Customer"}`);
  const [message, setMessage] = useState(`Dear ${customerName || "Customer"},\n\nThank you for your interest in our products. Please find your quotation attached.\n\nBest regards,\nThe Woodwise Team`);
  
  // New item form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<QuoteProduct | null>(null);
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [isPlaned, setIsPlaned] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Calculate total
  const totalAmount = items.reduce((total, item) => total + item.total_price, 0);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId) || null;
      setSelectedProduct(product);
      
      if (product) {
        setSelectedMaterial(product.material);
        setIsPlaned(product.is_planed);
        if (product.lengths.length > 0) {
          setSelectedLength(product.lengths[0]);
        } else {
          setSelectedLength(null);
        }
      }
    } else {
      setSelectedProduct(null);
      setSelectedLength(null);
      setSelectedMaterial("");
    }
  }, [selectedProductId, products]);
  
  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Transform the data to match the QuoteProduct interface
      const transformedProducts: QuoteProduct[] = (data as DbProduct[] || []).map(product => ({
        id: product.id,
        name: product.name,
        material: product.material,
        price_per_unit: product.price_per_unit,
        lengths: product.lengths,
        is_planed: product.is_planed,
        stock_quantity: product.stock_quantity || 0
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Моля, изберете продукт и дължина');
    } finally {
      setLoading(false);
    }
  }
  
  function addItem() {
    if (!selectedProduct || !selectedLength) {
      toast.error('Моля, изберете продукт и дължина');
      return;
    }
    
    const unitPrice = selectedProduct.price_per_unit;
    const totalPrice = unitPrice * quantity;
    
    const newItem: QuoteItem = {
      product: selectedProduct,
      quantity,
      length: selectedLength,
      material: selectedMaterial,
      is_planed: isPlaned,
      unit_price: unitPrice,
      total_price: totalPrice
    };
    
    setItems([...items, newItem]);
    
    // Reset form
    setSelectedProductId("");
    setSelectedProduct(null);
    setSelectedLength(null);
    setSelectedMaterial("");
    setQuantity(1);
  }
  
  function removeItem(index: number) {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  }
  
  async function handleSubmit(saveAsDraft = false) {
    if (!customerId) {
      toast.error('ID на клиента е задължителен');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Трябва да добавите поне един артикул към офертата');
      return;
    }
    
    try {
      setSending(true);
      
      // Generate a quote number
      const quoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // 1. Create the quote record
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert([{
          user_id: customerId,
          quote_number: quoteNumber,
          total_amount: totalAmount,
          total_estimate: totalAmount,
          status: saveAsDraft ? 'draft' : 'ready' // 'ready' status means quote is ready to be sent
        }])
        .select()
        .single();
      
      if (quoteError) throw quoteError;
      
      // 2. Create quote items
      const quoteItemsData = items.map(item => ({
        quote_id: quoteData.id,
        product_id: item.product.id,
        length: item.length,
        material: item.material,
        is_planed: item.is_planed,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsData);
      
      if (itemsError) throw itemsError;
      
      // 3. Create history record
      const { error: historyError } = await supabase
        .from('quote_history')
        .insert([{
          quote_id: quoteData.id,
          status: saveAsDraft ? 'draft' : 'ready',
          notes: saveAsDraft 
            ? 'Quote saved as draft by admin' 
            : 'Quote generated by admin and ready to send',
          created_by: session?.user?.id
        }]);
      
      if (historyError) throw historyError;
      
      // 4. If not saving as draft, send email with quote
      if (!saveAsDraft && customerEmail) {
        // In a real app, you would call your email sending service here
        // For demo purposes, we'll just show a success message
        toast.success(`Quote would be emailed to ${customerEmail}`);
      }
      
      toast.success(saveAsDraft ? 'Quote saved as draft' : 'Quote generated successfully');
      onClose();
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Грешка при създаване на офертата');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Generate Quote for Customer</DialogTitle>
          <DialogDescription>
            Create and send a new quote to {customerName || 'the customer'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Quote Details */}
        <div className="space-y-4 pt-4">
          <h3 className="font-medium text-lg">Quote Details</h3>
          
          {/* Add product form */}
          <div className="border rounded-md p-4 bg-background">
            <h4 className="font-medium mb-3">Add Product</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select 
                  value={selectedLength?.toString() || ""} 
                  onValueChange={(val) => setSelectedLength(Number(val))}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger id="length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct?.lengths.map((length) => (
                      <SelectItem key={length} value={length.toString()}>
                        {length} cm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input 
                  id="material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  disabled={!selectedProduct}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!selectedProduct}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="isPlaned" className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    id="isPlaned"
                    className="rounded text-primary focus:ring-primary"
                    checked={isPlaned}
                    onChange={(e) => setIsPlaned(e.target.checked)}
                    disabled={!selectedProduct}
                  />
                  Planed
                </Label>
              </div>
              
              <Button 
                type="button" 
                onClick={addItem}
                disabled={!selectedProduct || !selectedLength}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="border rounded-md mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Planed</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No items added yet. Add items above.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.length} cm</TableCell>
                      <TableCell>{item.material}</TableCell>
                      <TableCell>{item.is_planed ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-bold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Email details */}
          <div className="border rounded-md p-4 bg-background mt-4">
            <h4 className="font-medium mb-3">Email Details</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Customer Email</Label>
                <Input 
                  id="email"
                  value={customerEmail || ""}
                  disabled={true}
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Email Message</Label>
                <Textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSubmit(true)}
              disabled={sending || items.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={sending || items.length === 0 || !customerEmail}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Generate & Send Quote
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 