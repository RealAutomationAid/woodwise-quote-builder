import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText, Edit, Printer } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QuoteItem } from "@/components/quote/quote-item";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { EditQuoteForm } from "@/components/admin/quotes/EditQuoteForm";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface QuoteItemType {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  length: number;
  material: string;
  is_planed: boolean;
  discount?: number | null;
  note?: string | null;
}

interface CustomerType {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Quote {
  id: string;
  quote_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  user_id: string;
  simple_customer_id?: string;
  discount_code?: string;
  discount_percent?: number;
}

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (quoteError) throw quoteError;
      
      // Fetch quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select(`
          *,
          products (name)
        `)
        .eq('quote_id', id);
        
      if (itemsError) throw itemsError;
      
      // Map items for display
      const mappedItems = itemsData.map((item: any) => ({
        ...item,
        product_name: item.products?.name || 'Unknown Product'
      }));
      
      // Fetch customer if available
      let customerData = null;
      if (quoteData.simple_customer_id) {
        const { data, error: customerError } = await supabase
          .from('simple_customers')
          .select('*')
          .eq('id', quoteData.simple_customer_id)
          .single();
          
        if (!customerError && data) {
          customerData = data;
        }
      }
      
      // Set the quote state with all necessary data
      setQuote(quoteData as Quote);
      setCustomer(customerData);
      setQuoteItems(mappedItems);
      
    } catch (error: any) {
      console.error('Error fetching quote details:', error);
      setError(error.message);
      toast.error('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string): "default" | "destructive" | "outline" | "secondary" | "blue" | "warning" | "success" => {
    switch (status) {
      case 'pending': return "warning";
      case 'processing': return "secondary";
      case 'ready': return "success";
      case 'completed': return "success";
      case 'rejected': return "destructive";
      case 'sent': return "secondary";
      default: return "default";
    }
  };

  // Check if user has access to this quote
  const hasAccess = () => {
    if (!user || !quote) return false;
    return isAdmin || quote.user_id === user.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-woodwise-background">
        <MainHeader />
        <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Зареждане на детайли за офертата...</p>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Грешка</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Не е намерено</AlertTitle>
          <AlertDescription>
            Заявената оферта не беше намерена.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="min-h-screen flex flex-col bg-woodwise-background">
        <MainHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Достъпът е отказан</h1>
            <p className="mb-6">Нямате права да видите тази оферта.</p>
            <Button onClick={() => navigate('/quotes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад към офертите
            </Button>
          </div>
        </main>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Оферта №{quote.quote_number}</h1>
            <Badge className="ml-3" variant={getStatusBadgeColor(quote.status)}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Принтирай
            </Button>
            <Button
              onClick={() => setIsEditFormOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Редактирай оферта
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Информация за клиента
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-1">
                  <p className="font-medium">{customer.name}</p>
                  {customer.email && <p className="text-sm">{customer.email}</p>}
                  {customer.phone && <p className="text-sm">{customer.phone}</p>}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Няма избран клиент</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Детайли за офертата
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Създадена на:</span>
                  <span>{formatDate(quote.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Последна промяна:</span>
                  <span>{formatDate(quote.updated_at)}</span>
                </div>
                {quote.discount_percent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Отстъпка:</span>
                    <span>{quote.discount_percent}%</span>
                  </div>
                )}
                {quote.discount_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Код за отстъпка:</span>
                    <span>{quote.discount_code}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Обща сума
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(quote.total_amount).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {quoteItems.length} артикула
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Артикули в офертата
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quoteItems.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground italic">
                Няма артикули в тази оферта
              </p>
            ) : (
              <div className="divide-y">
                {quoteItems.map((item) => (
                  <div key={item.id} className="py-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Дължина: {item.length}мм • 
                          Материал: {item.material} • 
                          {item.is_planed ? 'Рендосан' : 'Нерендиран'}
                        </p>
                        {item.note && (
                          <p className="text-sm mt-1 italic">
                            Бележка: {item.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.unit_price.toFixed(2)}
                          {item.discount && item.discount > 0 && (
                            <span className="ml-1 text-green-600">(-{item.discount}%)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/20 flex justify-between">
            <span className="font-medium">Общо</span>
            <span className="font-bold">{Number(quote.total_amount).toFixed(2)} лв.</span>
          </CardFooter>
        </Card>
        
        {/* Quote History - Simplified version */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">История на офертата</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4 text-muted-foreground italic">
              Тук ще се показват промените по статуса на офертата
            </p>
          </CardContent>
        </Card>
      </main>
      <MainFooter />
      
      {/* Edit Quote Modal */}
      <EditQuoteForm 
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          fetchQuoteDetails(); // Refresh data after edit
        }}
        quoteId={id || ''}
      />
    </div>
  );
};

export default QuoteDetailPage; 