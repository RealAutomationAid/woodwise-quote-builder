import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MainHeader } from '@/components/layout/main-header';
import { MainFooter } from '@/components/layout/main-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ProductType {
  id: string;
  name: string;
  category_id: string | null;
  price_per_unit: number;
  material?: string;
  lengths?: number[];
  is_planed?: boolean;
  description?: string;
  image_url?: string;
}

interface CategoryType { id: string; name: string; }

// Define line item shape for use in state and calculations
interface LineItem {
  id?: string; // For existing line items
  product_id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  length: number;
  width?: number;
  material?: string;
  is_planed?: boolean;
  total: number;
  discount?: number;
  note?: string;
}

interface Quote {
  id: string;
  quote_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  user_id: string;
  simple_customer_id?: string | null;
  discount_code?: string | null;
  discount_percent?: number | null;
  note?: string | null;
}

export default function EditQuotePage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { isAdmin, session } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; email?: string; type: 'auth' | 'simple' }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('none');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Discount states
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState<boolean>(false);

  // Redirect if not admin
  useEffect(() => {
    if (!session) {
      return; // Wait for session check
    }
    
    if (!isAdmin) {
      navigate('/');
      toast.error("Нямате права за достъп до тази страница");
    } else {
      fetchQuote();
      fetchProducts();
      fetchCategories();
      fetchAllCustomers();
    }
  }, [isAdmin, session, navigate, quoteId]);

  const fetchQuote = async () => {
    if (!quoteId) return;
    
    try {
      setLoading(true);
      
      // Fetch the quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (quoteError) throw quoteError;
      if (!quoteData) {
        toast.error('Офертата не е намерена');
        navigate('/admin/quotes');
        return;
      }
      
      setQuote(quoteData);
      setNote(quoteData.note || '');
      setDiscountCode(quoteData.discount_code || '');
      setDiscountPercent(quoteData.discount_percent || 0);
      
      if (quoteData.simple_customer_id) {
        setSelectedCustomer(`simple_${quoteData.simple_customer_id}`);
      } else if (quoteData.user_id) {
        setSelectedCustomer(`auth_${quoteData.user_id}`);
      }
      
      // Fetch quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId);
      
      if (itemsError) throw itemsError;
      
      // Transform to LineItem format
      const lineItemsFormatted: LineItem[] = itemsData.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.price_per_unit,
        length: item.length || 0,
        width: item.width,
        material: item.material,
        is_planed: item.is_planed,
        total: item.total_price,
        discount: item.discount_percent || 0,
        note: item.note
      }));
      
      setLineItems(lineItemsFormatted);
    } catch (error) {
      console.error('Error fetching quote:', error);
      toast.error('Неуспешно зареждане на офертата');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, price_per_unit, material, lengths, is_planed, description, image_url');
      if (error) throw error;
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error('Неуспешно зареждане на продуктите');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      if (error) throw error;
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error('Неуспешно зареждане на категориите');
    }
  };

  const fetchAllCustomers = async () => {
    try {
      // Fetch authenticated users
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'user');

      if (authError) throw authError;

      // Fetch simple customers
      const sup = supabase as any;
      const { data: simpleCustomers, error: simpleError } = await sup
        .from('simple_customers')
        .select('id, name, email, phone')
        .order('created_at', { ascending: false });

      if (simpleError) throw simpleError;

      // Combine both customer types with identifiers
      const combinedCustomers = [
        ...authUsers.map(u => ({ 
          id: `auth_${u.id}`, 
          name: `${u.first_name} ${u.last_name}`, 
          email: '', // Auth users' emails are not included in this query
          type: 'auth' as const
        })),
        ...simpleCustomers.map((c: any) => ({ 
          id: `simple_${c.id}`, 
          name: c.name, 
          email: c.email,
          type: 'simple' as const
        }))
      ];

      setCustomers(combinedCustomers);
    } catch (e) {
      console.error(e);
      toast.error('Неуспешно зареждане на клиентите');
    }
  };

  const addLineItem = (p: ProductType) => {
    setLineItems(prev => {
      const defaultLength = p.lengths?.[0] ?? 0;
      const newItem: LineItem = {
        product_id: p.id,
        name: p.name,
        quantity: 1,
        unitPrice: Number(p.price_per_unit),
        length: defaultLength,
        material: p.material,
        is_planed: p.is_planed,
        total: Number(p.price_per_unit),
        discount: 0
      };
      return [...prev, newItem];
    });
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    setLineItems(prevItems => {
      const newItems = [...prevItems];
      const item = { ...newItems[index], ...updates };
      
      // Recalculate the total with discount
      const discountMultiplier = 1 - (item.discount || 0) / 100;
      item.total = item.quantity * item.unitPrice * item.length * discountMultiplier;
      
      newItems[index] = item;
      return newItems;
    });
  };

  const removeLineItem = (index: number) => {
    setLineItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  // Calculate subtotal and total with discount
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const globalDiscountMultiplier = 1 - (discountPercent / 100);
    return subtotal * globalDiscountMultiplier;
  };

  const handleSaveQuote = async () => {
    if (!quoteId || !quote) {
      toast.error('Няма валидна оферта за редактиране');
      return;
    }
    
    if (lineItems.length === 0) {
      toast.error('Офертата трябва да съдържа поне един продукт');
      return;
    }
    
    if (selectedCustomer === 'none') {
      toast.error('Моля, изберете клиент');
      return;
    }
    
    try {
      setSaving(true);
      
      // Parse customer ID
      let user_id = null;
      let simple_customer_id = null;
      
      if (selectedCustomer.startsWith('auth_')) {
        user_id = selectedCustomer.replace('auth_', '');
      } else if (selectedCustomer.startsWith('simple_')) {
        simple_customer_id = selectedCustomer.replace('simple_', '');
      }
      
      // Calculate the total
      const total = calculateTotal();
      
      // Update the quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          user_id,
          simple_customer_id,
          total_amount: total,
          discount_code: discountCode || null,
          discount_percent: discountPercent || null,
          note: note || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;
      
      // Delete existing items to replace with new ones
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);
      
      if (deleteError) throw deleteError;
      
      // Insert new items
      const quoteItems = lineItems.map(item => ({
        quote_id: quoteId,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        price_per_unit: item.unitPrice,
        length: item.length || null,
        width: item.width || null,
        material: item.material || null,
        is_planed: item.is_planed || null,
        discount_percent: item.discount || null,
        note: item.note || null,
        total_price: item.total
      }));
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);
      
      if (itemsError) throw itemsError;
      
      // Add history record
      await supabase
        .from('quote_history')
        .insert({
          quote_id: quoteId,
          status: quote.status,
          notes: 'Quote updated by admin',
          created_by: session?.user?.id
        });
      
      toast.success('Офертата е обновена успешно');
      navigate('/admin/quotes');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Неуспешно записване на офертата');
    } finally {
      setSaving(false);
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-woodwise-background">
        <MainHeader />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="p-8 text-center">Зареждане на офертата...</div>
        </main>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate('/admin/quotes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Обратно
            </Button>
            <h1 className="text-2xl font-bold">Редактиране на оферта: {quote?.quote_number}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/quotes/${quoteId}`)}
            >
              Преглед
            </Button>
            <Button
              onClick={handleSaveQuote}
              disabled={saving}
            >
              {saving ? 'Запазване...' : 'Запази промените'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer selection */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Клиент</h2>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Изберете клиент" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Изберете клиент --</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.email ? `(${customer.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            {/* Line items */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Продукти</h2>
                
                <div className="mb-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Филтриране по категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всички категории</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto py-3 px-4 text-left justify-start flex flex-col items-start"
                      onClick={() => addLineItem(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {product.price_per_unit.toFixed(2)} лв.
                      </div>
                    </Button>
                  ))}
                </div>
                
                {/* Line items table */}
                {lineItems.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Продукт
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Количество
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Дължина
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Единична цена
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Отстъпка %
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Общо
                          </th>
                          <th className="px-4 py-3 text-left"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {lineItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">
                              {item.name}
                              <Input
                                className="mt-1"
                                placeholder="Бележка"
                                value={item.note || ''}
                                onChange={(e) => updateLineItem(index, { note: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={item.length}
                                onChange={(e) => updateLineItem(index, { length: Number(e.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(index, { unitPrice: Number(e.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discount || 0}
                                onChange={(e) => updateLineItem(index, { discount: Number(e.target.value) })}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {item.total.toFixed(2)} лв.
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">Няма добавени продукти. Изберете продукт от списъка по-горе.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Note */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Бележка към офертата</h2>
                <Textarea
                  placeholder="Добавете бележка към офертата..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Quote summary */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Обобщение на офертата</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Междинна сума:</span>
                    <span>{calculateSubtotal().toFixed(2)} лв.</span>
                  </div>
                  
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Отстъпка ({discountPercent}%):</span>
                      <span>-{(calculateSubtotal() * (discountPercent / 100)).toFixed(2)} лв.</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Общо:</span>
                    <span>{calculateTotal().toFixed(2)} лв.</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Код за отстъпка"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="%"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card className="bg-white">
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  onClick={handleSaveQuote}
                  disabled={saving}
                >
                  {saving ? 'Запазване...' : 'Запази промените'}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
} 