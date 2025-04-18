import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MainHeader } from '@/components/layout/main-header';
import { MainFooter } from '@/components/layout/main-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  product_id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  length: number;
  width?: number;
  material?: string;
  is_planed?: boolean;
  total: number;
  discount?: number; // New field for discounts
  note?: string; // Notes for the item
}

export default function CreateQuotePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; email?: string; type: 'auth' | 'simple' }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('none');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newCustomerAddress, setNewCustomerAddress] = useState<string>('');
  const [newCustomerCity, setNewCustomerCity] = useState<string>('');
  const [newCustomerState, setNewCustomerState] = useState<string>('');
  const [newCustomerZipCode, setNewCustomerZipCode] = useState<string>('');
  const [newCustomerCountry, setNewCustomerCountry] = useState<string>('');
  const [newCustomerCompanyName, setNewCustomerCompanyName] = useState<string>('');
  const [newCustomerTaxId, setNewCustomerTaxId] = useState<string>('');
  const [newCustomerBillingEmail, setNewCustomerBillingEmail] = useState<string>('');
  const [newCustomerShippingAddress, setNewCustomerShippingAddress] = useState<string>('');
  const [newCustomerShippingCity, setNewCustomerShippingCity] = useState<string>('');
  const [newCustomerShippingState, setNewCustomerShippingState] = useState<string>('');
  const [newCustomerShippingZipCode, setNewCustomerShippingZipCode] = useState<string>('');
  const [newCustomerShippingCountry, setNewCustomerShippingCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [note, setNote] = useState<string>(''); // New state for quote note
  
  // New state for quote-level discount
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, price_per_unit, material, lengths, is_planed, description, image_url');
      if (error) throw error;
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load products');
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
      toast.error('Failed to load categories');
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
      toast.error('Failed to load customers');
    }
  };

  const addLineItem = (p: ProductType) => {
    setLineItems(prev => {
      const exists = prev.find(li => li.product_id === p.id);
      if (exists) {
        return prev.map(li =>
          li.product_id === p.id
            ? { 
                ...li, 
                quantity: li.quantity + 1, 
                total: (li.quantity + 1) * li.unitPrice * (li.discount ? (1 - li.discount / 100) : 1)
              }
            : li
        );
      }
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

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    // use untyped client for new table
    const sup = supabase as any;
    try {
      const { data, error } = await sup
        .from('simple_customers')
        .insert([{ 
          name: newCustomerName.trim(),
          email: newCustomerEmail.trim() || null,
          phone: newCustomerPhone.trim() || null,
          address: newCustomerAddress.trim() || null,
          city: newCustomerCity.trim() || null,
          state: newCustomerState.trim() || null,
          zip_code: newCustomerZipCode.trim() || null,
          country: newCustomerCountry.trim() || null,
          company_name: newCustomerCompanyName.trim() || null,
          tax_id: newCustomerTaxId.trim() || null,
          billing_email: newCustomerBillingEmail.trim() || null,
          shipping_address: newCustomerShippingAddress.trim() || null,
          shipping_city: newCustomerShippingCity.trim() || null,
          shipping_state: newCustomerShippingState.trim() || null,
          shipping_zip_code: newCustomerShippingZipCode.trim() || null,
          shipping_country: newCustomerShippingCountry.trim() || null
        }])
        .select()
        .single();
      if (error) throw error;
      const newCust = data as { 
        id: string; 
        name: string; 
        email?: string; 
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        country?: string;
        company_name?: string;
        tax_id?: string;
        billing_email?: string;
      };
      
      // Add the new customer to the list with the 'simple_' prefix
      const newFormattedCust = { 
        id: `simple_${newCust.id}`, 
        name: newCust.name, 
        email: newCust.email,
        type: 'simple' as const
      };
      
      setCustomers([newFormattedCust, ...customers]);
      setSelectedCustomer(newFormattedCust.id);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setNewCustomerCity('');
      setNewCustomerState('');
      setNewCustomerZipCode('');
      setNewCustomerCountry('');
      setNewCustomerCompanyName('');
      setNewCustomerTaxId('');
      setNewCustomerBillingEmail('');
      setNewCustomerShippingAddress('');
      setNewCustomerShippingCity('');
      setNewCustomerShippingState('');
      setNewCustomerShippingZipCode('');
      setNewCustomerShippingCountry('');
      setIsNewCustomerModalOpen(false);
      toast.success('Customer created');
    } catch (e) {
      console.error(e);
      toast.error('Failed to create customer');
    }
  };

  const handleSaveQuote = async (status: 'draft' | 'pending' | 'processing' | 'ready' | 'completed' | 'rejected' | 'sent') => {
    const sup = supabase as any;
    // Check if customer selection is "none" or if there are no line items
    if (selectedCustomer === "none" || lineItems.length === 0) {
      toast.error('Select customer and add items');
      return;
    }
    
    try {
      const total = lineItems.reduce((sum, li) => sum + li.total, 0);
      const quoteNumber = uuidv4();
      
      // Parse the customer id to get the proper id and type
      const [customerType, customerId] = selectedCustomer.split('_');
      
      const insertObj: any = {
        user_id: customerType === 'auth' ? customerId : null,
        simple_customer_id: customerType === 'simple' ? customerId : null,
        total_amount: total,
        status,
        quote_number: quoteNumber,
        discount_code: discountCode || null,
        discount_percent: discountPercent > 0 ? discountPercent : null,
        note: note || null // Add the note field
      };
      
      const { data: quote, error } = await sup
        .from('quotes')
        .insert([insertObj])
        .select()
        .single();
      if (error) throw error;
      
      const qi = lineItems.map(li => ({
        quote_id: quote.id,
        product_id: li.product_id,
        length: li.length,
        material: li.material,
        is_planed: li.is_planed,
        quantity: li.quantity,
        unit_price: li.unitPrice,
        total_price: li.total,
        discount: li.discount || null
      }));
      const { error: itemsError } = await sup.from('quote_items').insert(qi);
      if (itemsError) throw itemsError;
      if (status === 'pending') {
        const token = uuidv4();
        // Create a public link for sharing
        // @ts-ignore: ignore missing table in supabase types
        const { error: linkErr } = await sup
          .from('public_quote_links')
          .insert([{ quote_id: quote.id, token }]);
        if (linkErr) throw linkErr;
        toast.success('Quote submitted. Link: ' + window.location.origin + '/quotes/public/' + token);
      } else {
        toast.success('Draft saved');
      }
      navigate('/admin/quotes');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save quote');
    }
  };

  // Function to apply discount to all line items
  const applyGlobalDiscount = () => {
    if (discountPercent <= 0 || discountPercent > 100) {
      toast.error('Discount must be between 1 and 100');
      return;
    }
    
    setLineItems(prev => 
      prev.map(item => ({
        ...item,
        discount: discountPercent,
        total: item.quantity * item.unitPrice * (1 - discountPercent / 100)
      }))
    );
    
    setIsApplyingDiscount(false);
    toast.success(`Applied ${discountPercent}% discount to all items`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Quote</h1>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => handleSaveQuote('draft')}>Save as Draft</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSaveQuote('pending')}>Submit Quote</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customer Panel - Smaller, moved to sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Customer</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Select Customer</label>
                  <Select 
                    value={selectedCustomer} 
                    onValueChange={setSelectedCustomer}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.type === 'auth' ? '(Account)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setIsNewCustomerModalOpen(true)}
                >
                  + New Customer
                </Button>
              </div>
            </div>

            {/* Note Field */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Note</h2>
              <Textarea 
                placeholder="Add a note about this quote..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Categories Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Categories</h2>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items - Now the main focus */}
          <div className="lg:col-span-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quote Items</h2>
              
              {/* Global discount controls */}
              {lineItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsApplyingDiscount(true)}
                >
                  Apply Discount
                </Button>
              )}
            </div>
            
            {isApplyingDiscount && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Discount Code</label>
                  <Input
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Optional"
                    className="w-full"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Discount %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={applyGlobalDiscount}
                  >
                    Apply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsApplyingDiscount(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {lineItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-gray-500 mb-3">No items added yet</div>
                <p className="text-sm text-gray-400">Select products from the catalog to add to this quote</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={`${item.product_id}-${index}`} className="p-4 border rounded-lg bg-gray-50 relative hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="font-semibold">${item.total.toFixed(2)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Quantity</label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            setLineItems(prev => 
                              prev.map((li, i) => 
                                i === index 
                                  ? { 
                                      ...li, 
                                      quantity: newQty,
                                      total: newQty * li.unitPrice * (li.discount ? (1 - li.discount / 100) : 1)
                                    } 
                                  : li
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Length</label>
                        <Input 
                          type="number" 
                          value={item.length} 
                          onChange={(e) => {
                            const newLength = parseInt(e.target.value) || 0;
                            setLineItems(prev => 
                              prev.map((li, i) => 
                                i === index ? { ...li, length: newLength } : li
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Width</label>
                        <Input 
                          type="number" 
                          value={item.width || ''} 
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value) || 0;
                            setLineItems(prev => 
                              prev.map((li, i) => 
                                i === index ? { ...li, width: newWidth || undefined } : li
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>
                      
                      {item.material && (
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500">Material</label>
                          <Input 
                            value={item.material} 
                            onChange={(e) => {
                              setLineItems(prev => 
                                prev.map((li, i) => 
                                  i === index ? { ...li, material: e.target.value } : li
                                )
                              );
                            }}
                            className="h-8"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Discount %</label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={item.discount || 0} 
                          onChange={(e) => {
                            const discountPercent = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setLineItems(prev => 
                              prev.map((li, i) => 
                                i === index 
                                  ? { 
                                      ...li, 
                                      discount: discountPercent,
                                      total: li.quantity * li.unitPrice * (1 - discountPercent / 100)
                                    } 
                                  : li
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <label className="text-xs text-gray-500">Notes</label>
                        <Input 
                          value={item.note || ''} 
                          onChange={(e) => {
                            setLineItems(prev => 
                              prev.map((li, i) => 
                                i === index ? { ...li, note: e.target.value } : li
                              )
                            );
                          }}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 h-auto"
                      onClick={() => {
                        setLineItems(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4 border-t mt-6">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">${lineItems.reduce((sum, li) => sum + li.total, 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Products Catalog - Moved to right side */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Products</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {products
                .filter(p => selectedCategory === 'all' || p.category_id === selectedCategory)
                .map(p => (
                  <div 
                    key={p.id} 
                    className="p-3 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => addLineItem(p)}
                  >
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{p.name}</h3>
                        <p className="text-sm text-gray-500 truncate">${p.price_per_unit}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="px-2">
                        +
                      </Button>
                    </div>
                    {p.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {isNewCustomerModalOpen && (
          <Dialog open onOpenChange={setIsNewCustomerModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Customer</DialogTitle>
                <DialogDescription>Enter customer details. Only Name and Email are required.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <fieldset className="border rounded-md p-4">
                  <legend className="text-sm font-semibold px-2">Basic Information</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        placeholder="Name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newCustomerEmail}
                        onChange={e => setNewCustomerEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Phone</label>
                      <Input
                        value={newCustomerPhone}
                        onChange={e => setNewCustomerPhone(e.target.value)}
                        placeholder="Phone"
                        type="tel"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Company Name</label>
                      <Input
                        value={newCustomerCompanyName}
                        onChange={e => setNewCustomerCompanyName(e.target.value)}
                        placeholder="Company Name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Tax ID / VAT Number</label>
                      <Input
                        value={newCustomerTaxId}
                        onChange={e => setNewCustomerTaxId(e.target.value)}
                        placeholder="Tax ID"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Billing Email</label>
                      <Input
                        value={newCustomerBillingEmail}
                        onChange={e => setNewCustomerBillingEmail(e.target.value)}
                        placeholder="Billing Email"
                        type="email"
                        className="w-full"
                      />
                    </div>
                  </div>
                </fieldset>
                
                {/* Billing Address */}
                <fieldset className="border rounded-md p-4">
                  <legend className="text-sm font-semibold px-2">Billing Address</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-1">Address</label>
                      <Input
                        value={newCustomerAddress}
                        onChange={e => setNewCustomerAddress(e.target.value)}
                        placeholder="Address"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">City</label>
                      <Input
                        value={newCustomerCity}
                        onChange={e => setNewCustomerCity(e.target.value)}
                        placeholder="City"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">State/Province</label>
                      <Input
                        value={newCustomerState}
                        onChange={e => setNewCustomerState(e.target.value)}
                        placeholder="State"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Zip/Postal Code</label>
                      <Input
                        value={newCustomerZipCode}
                        onChange={e => setNewCustomerZipCode(e.target.value)}
                        placeholder="Zip Code"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Country</label>
                      <Input
                        value={newCustomerCountry}
                        onChange={e => setNewCustomerCountry(e.target.value)}
                        placeholder="Country"
                        className="w-full"
                      />
                    </div>
                  </div>
                </fieldset>
                
                {/* Shipping Address */}
                <fieldset className="border rounded-md p-4">
                  <legend className="text-sm font-semibold px-2">Shipping Address</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium block mb-1">Address</label>
                      <Input
                        value={newCustomerShippingAddress}
                        onChange={e => setNewCustomerShippingAddress(e.target.value)}
                        placeholder="Shipping Address"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">City</label>
                      <Input
                        value={newCustomerShippingCity}
                        onChange={e => setNewCustomerShippingCity(e.target.value)}
                        placeholder="Shipping City"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">State/Province</label>
                      <Input
                        value={newCustomerShippingState}
                        onChange={e => setNewCustomerShippingState(e.target.value)}
                        placeholder="Shipping State"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Zip/Postal Code</label>
                      <Input
                        value={newCustomerShippingZipCode}
                        onChange={e => setNewCustomerShippingZipCode(e.target.value)}
                        placeholder="Shipping Zip Code"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Country</label>
                      <Input
                        value={newCustomerShippingCountry}
                        onChange={e => setNewCustomerShippingCountry(e.target.value)}
                        placeholder="Shipping Country"
                        className="w-full"
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
                
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewCustomerModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCustomer}>Create Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <MainFooter />
    </div>
  );
} 