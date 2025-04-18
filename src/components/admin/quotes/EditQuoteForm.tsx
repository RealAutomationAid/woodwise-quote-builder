import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Trash2, Plus, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductType {
  id: string;
  name: string;
  price_per_unit: number;
  material: string;
  lengths: number[];
  is_planed: boolean;
  category_id?: string | null;
}

interface QuoteItemType {
  id: string;
  quote_id: string;
  product_id: string;
  product_name?: string;
  length: number;
  material: string;
  is_planed: boolean;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount?: number | null;
}

interface CustomerType {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface EditQuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
}

export function EditQuoteForm({ isOpen, onClose, quoteId }: EditQuoteFormProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  
  const [quoteData, setQuoteData] = useState<{
    id: string;
    quote_number: string;
    status: string;
    customerId: string | null;
    total_amount: number;
    discount_code: string | null;
    discount_percent: number | null;
    note: string | null;
  }>({
    id: quoteId,
    quote_number: '',
    status: 'pending',
    customerId: null,
    total_amount: 0,
    discount_code: null,
    discount_percent: null,
    note: null
  });
  
  const [quoteItems, setQuoteItems] = useState<QuoteItemType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  // Fetch all necessary data when the component mounts
  useEffect(() => {
    if (isOpen && quoteId) {
      fetchQuoteDetails();
      fetchProducts();
      fetchCustomers();
    }
  }, [isOpen, quoteId]);
  
  // Calculate total amount whenever items change
  useEffect(() => {
    const total = quoteItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Apply global discount if applicable
    let finalTotal = total;
    if (quoteData.discount_percent && quoteData.discount_percent > 0) {
      finalTotal = total * (1 - quoteData.discount_percent / 100);
    }
    
    setQuoteData(prev => ({
      ...prev,
      total_amount: finalTotal
    }));
  }, [quoteItems, quoteData.discount_percent]);
  
  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (quoteError) throw quoteError;
      
      // Fetch quote items
      const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select(`
          *,
          product:product_id (name)
        `)
        .eq('quote_id', quoteId);
      
      if (itemsError) throw itemsError;
      
      // Map items with product name
      const mappedItems = items.map((item: any) => ({
        ...item,
        product_name: item.product?.name || 'Unknown Product'
      }));
      
      // Use type assertion to avoid type errors
      const quoteData = quote as any;
      
      setQuoteData({
        id: quoteData.id,
        quote_number: quoteData.quote_number,
        status: quoteData.status,
        customerId: quoteData.simple_customer_id,
        total_amount: quoteData.total_amount,
        discount_code: quoteData.discount_code,
        discount_percent: quoteData.discount_percent,
        note: quoteData.note
      });
      
      setQuoteItems(mappedItems);
      
    } catch (error) {
      console.error('Error fetching quote details:', error);
      toast.error('Failed to load quote details');
      onClose();
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_per_unit, material, lengths, is_planed, category_id');
      
      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };
  
  const fetchCustomers = async () => {
    try {
      // Fetch simple customers - use type assertion for table not in types
      const sup = supabase as any;
      const { data, error } = await sup
        .from('simple_customers')
        .select('id, name, email, phone');
      
      if (error) throw error;
      setCustomers(data as CustomerType[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };
  
  const handleSaveQuote = async () => {
    if (!quoteData.customerId) {
      toast.error('Моля, изберете клиент');
      return;
    }
    
    if (quoteItems.length === 0) {
      toast.error('Моля, добавете поне един артикул към офертата');
      return;
    }
    
    try {
      setSaving(true);
      
      // 1. Update the quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          simple_customer_id: quoteData.customerId,
          status: quoteData.status,
          total_amount: quoteData.total_amount,
          discount_code: quoteData.discount_code,
          discount_percent: quoteData.discount_percent,
          note: quoteData.note
        })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;
      
      // 2. Delete existing quote items
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);
      
      if (deleteError) throw deleteError;
      
      // 3. Insert updated quote items
      const quoteItemsData = quoteItems.map(item => ({
        quote_id: quoteId,
        product_id: item.product_id,
        length: item.length,
        material: item.material,
        is_planed: item.is_planed,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        discount: item.discount
      }));
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsData);
      
      if (itemsError) throw itemsError;
      
      // 3. Create history record
      await supabase
        .from('quote_history')
        .insert([{
          quote_id: quoteId,
          status: quoteData.status,
          notes: 'Quote updated by admin',
          created_by: session?.user?.id
        }]);
      
      toast.success('Офертата е обновена успешно');
      onClose();
      navigate(`/quotes/${quoteId}`);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Неуспешно обновяване на офертата');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddProduct = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Default to first length in the array if available
    const defaultLength = product.lengths && product.lengths.length > 0 
      ? product.lengths[0] 
      : 0;
    
    const newItem: QuoteItemType = {
      id: `temp-${Date.now()}`,
      quote_id: quoteId,
      product_id: product.id,
      product_name: product.name,
      length: defaultLength,
      material: product.material,
      is_planed: product.is_planed,
      quantity: 1,
      unit_price: product.price_per_unit,
      total_price: product.price_per_unit,
      discount: null
    };
    
    setQuoteItems([...quoteItems, newItem]);
    setSelectedProduct(null);
  };
  
  const handleRemoveItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };
  
  const updateItemField = (index: number, field: keyof QuoteItemType, value: any) => {
    const updatedItems = [...quoteItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate total price if quantity, unit_price, or discount changes
    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      const item = updatedItems[index];
      const baseTotal = item.quantity * item.unit_price;
      
      updatedItems[index].total_price = item.discount 
        ? baseTotal * (1 - (item.discount / 100))
        : baseTotal;
    }
    
    setQuoteItems(updatedItems);
  };
  
  const applyGlobalDiscount = () => {
    if (!quoteData.discount_percent || quoteData.discount_percent <= 0 || quoteData.discount_percent > 100) {
      toast.error('Моля, въведете валиден процент за отстъпка между 1 и 100');
      return;
    }
    
    // Apply discount to all items
    const updatedItems = quoteItems.map(item => {
      const baseTotal = item.quantity * item.unit_price;
      return {
        ...item,
        discount: quoteData.discount_percent,
        total_price: baseTotal * (1 - (quoteData.discount_percent as number / 100))
      };
    });
    
    setQuoteItems(updatedItems);
    toast.success(`Приложена е ${quoteData.discount_percent}% отстъпка на всички артикули`);
  };
  
  const getProductLengths = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.lengths || [];
  };
  
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading quote details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирай оферта №{quoteData.quote_number}</DialogTitle>
          <DialogDescription>
            Актуализирайте детайлите, артикулите и цените на офертата
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Quote Details Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Клиент</Label>
              <Select 
                value={quoteData.customerId || ""} 
                onValueChange={value => setQuoteData({...quoteData, customerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете клиент" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select
                value={quoteData.status}
                onValueChange={value => setQuoteData({...quoteData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Чернова</SelectItem>
                  <SelectItem value="pending">Получена</SelectItem>
                  <SelectItem value="processing">Обработва се</SelectItem>
                  <SelectItem value="ready">Готова</SelectItem>
                  <SelectItem value="completed">Завършена</SelectItem>
                  <SelectItem value="rejected">Отказана</SelectItem>
                  <SelectItem value="sent">Изпратена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="note">Бележка</Label>
              <Textarea 
                id="note"
                placeholder="Добавете бележка към тази оферта..."
                value={quoteData.note || ''}
                onChange={e => setQuoteData({...quoteData, note: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex items-center mb-2">
                <Tag className="h-4 w-4 mr-2" />
                <h3 className="font-medium">Отстъпка</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="discount_code">Код за отстъпка</Label>
                  <Input
                    id="discount_code"
                    value={quoteData.discount_code || ''}
                    onChange={e => setQuoteData({...quoteData, discount_code: e.target.value})}
                    placeholder="Опционален код"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_percent">Отстъпка %</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={quoteData.discount_percent || ''}
                      onChange={e => setQuoteData({
                        ...quoteData, 
                        discount_percent: e.target.value ? Number(e.target.value) : null
                      })}
                      placeholder="0"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={applyGlobalDiscount}
                      disabled={!quoteData.discount_percent}
                    >
                      Приложи
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Product Section */}
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">Добави продукт</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="product">Продукт</Label>
                  <Select
                    value={selectedProduct || ""}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете продукт" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddProduct} 
                  disabled={!selectedProduct}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добави
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quote Items Column */}
          <div>
            <h3 className="font-medium mb-3">Артикули в офертата</h3>
            {quoteItems.length === 0 ? (
              <div className="border rounded-md p-6 text-center text-gray-500">
                Няма добавени артикули към тази оферта
              </div>
            ) : (
              <div className="space-y-4">
                {quoteItems.map((item, index) => (
                  <div key={item.id} className="border rounded-md p-4 relative">
                    <div className="absolute top-2 right-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="font-medium mb-3">{item.product_name}</div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`item-${index}-length`}>Дължина</Label>
                        <Select
                          value={item.length.toString()}
                          onValueChange={value => updateItemField(index, 'length', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Изберете дължина" />
                          </SelectTrigger>
                          <SelectContent>
                            {getProductLengths(item.product_id).map(length => (
                              <SelectItem key={length} value={length.toString()}>
                                {length}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`item-${index}-material`}>Материал</Label>
                        <Input
                          id={`item-${index}-material`}
                          value={item.material}
                          onChange={e => updateItemField(index, 'material', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`item-${index}-quantity`}>Количество</Label>
                        <Input
                          id={`item-${index}-quantity`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItemField(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`item-${index}-unit-price`}>Единична цена</Label>
                        <Input
                          id={`item-${index}-unit-price`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={e => updateItemField(index, 'unit_price', Number(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`item-${index}-discount`}>Отстъпка за артикул %</Label>
                        <Input
                          id={`item-${index}-discount`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount || ''}
                          onChange={e => updateItemField(
                            index, 
                            'discount', 
                            e.target.value ? Number(e.target.value) : null
                          )}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`item-${index}-is-planed`} className="flex items-center gap-2">
                          <Checkbox 
                            id={`item-${index}-is-planed`}
                            checked={item.is_planed}
                            onCheckedChange={checked => updateItemField(
                              index, 
                              'is_planed', 
                              Boolean(checked)
                            )}
                          />
                          Is Planed
                        </Label>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-right font-medium">
                      Total: ${item.total_price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex justify-between items-center">
              <span className="font-medium">Quote Total:</span>
              <span className="text-lg font-bold">${quoteData.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Отказ
          </Button>
          <Button onClick={handleSaveQuote} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Запазване...
              </>
            ) : (
              <>Запази промените</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 