import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface EditQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  editQuote: {
    id: string;
    status: string;
    customer_id: string | null;
  } | null;
  setEditQuote: (quote: any) => void;
  customers: Customer[];
}

export function EditQuoteDialog({
  open,
  onClose,
  onSave,
  editQuote,
  setEditQuote,
  customers
}: EditQuoteDialogProps) {
  if (!editQuote) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактиране на оферта</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select 
              value={editQuote.status} 
              onValueChange={(value) => setEditQuote({...editQuote, status: value})}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Изберете статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Чернова</SelectItem>
                <SelectItem value="pending">Получена</SelectItem>
                <SelectItem value="processing">Обработва се</SelectItem>
                <SelectItem value="ready">Готова</SelectItem>
                <SelectItem value="sent">Изпратена</SelectItem>
                <SelectItem value="completed">Завършена</SelectItem>
                <SelectItem value="rejected">Отхвърлена</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer">Клиент</Label>
            <Select 
              value={editQuote.customer_id || ''} 
              onValueChange={(value) => setEditQuote({...editQuote, customer_id: value || null})}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Изберете клиент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без клиент</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button type="submit" onClick={onSave}>
            Запази
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 