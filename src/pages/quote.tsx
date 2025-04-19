import React, { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { QuoteItem } from "@/components/quote/quote-item";
import { QuoteSummary } from "@/components/quote/quote-summary";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useQuote, ProductConfigType } from "@/contexts/QuoteContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QuotePage = () => {
  const navigate = useNavigate();
  const { quoteItems, removeItem, updateItem, submitQuote, loading, isLoading } = useQuote();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Артикулът беше премахнат от офертата");
  };

  const handleUpdateItem = (id: string, config: ProductConfigType) => {
    updateItem(id, config);
    toast.success("Артикулът беше обновен");
  };

  const handleSubmitQuote = () => {
    setContactModalOpen(true);
  };
  
  const handleSaveAsDraft = async () => {
    const success = await submitQuote(true);
    if (success) {
      setTimeout(() => {
        navigate("/quotes");
      }, 1500);
    }
  };

  const handleGeneratePdf = () => {
    // This would trigger PDF generation via your backend
    toast.success("PDF е генериран и готов за изтегляне!");
  };

  const handleConfirmContactAndSubmit = async () => {
    const success = await submitQuote(false, { email: contactEmail.trim() || undefined, phone: contactPhone.trim() || undefined });
    if (success) {
      toast.success("Вашата оферта е записана! Ще се свържем с вас скоро.");
      setContactModalOpen(false);
      setContactEmail("");
      setContactPhone("");
      setTimeout(() => navigate("/quotes"), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-woodwise-background">
      <MainHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/catalog")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Вашата оферта</h1>
        </div>
        
        {loading || isLoading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Зареждане на вашата оферта...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {quoteItems.length === 0 ? (
                <div className="py-12 text-center border border-border rounded-md bg-white">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium mt-4">Вашата оферта е празна</h3>
                  <p className="text-muted-foreground mt-1">
                    Разгледайте нашия каталог и добавете артикули към офертата
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => navigate("/catalog")}
                  >
                    Разгледайте продукти
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quoteItems.map((item) => (
                    <QuoteItem 
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdate={handleUpdateItem}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <QuoteSummary 
                items={quoteItems} 
                onSubmitQuote={handleSubmitQuote}
                onSaveAsDraft={handleSaveAsDraft}
                onGeneratePdf={handleGeneratePdf}
              />
            </div>
          </div>
        )}
      </main>
      
      <MainFooter />
      
      {/* Contact Info Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Моля, въведете контактна информация</DialogTitle>
            <DialogDescription>Въведете поне телефон или имейл, за да можем да се свържем с вас относно офертата.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="contactPhone">Телефон</Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+359..." />
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setContactModalOpen(false)}>Откажи</Button>
            <Button disabled={!contactEmail && !contactPhone} onClick={handleConfirmContactAndSubmit}>Изпрати офертата</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotePage;
