import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  user_id: string;
  total_estimate: number;
}

export async function updateQuoteStatus(
  quoteId: string, 
  status: string, 
  notes: string | undefined, 
  userId: string,
  onSuccess: (quoteId: string, status: string) => void
) {
  try {
    // 1. Update the quote status using direct update
    const { error: updateError } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId);
    
    if (updateError) throw updateError;
    
    // 2. Create a history record
    const historyEntry = {
      quote_id: quoteId,
      status,
      notes: notes || `Status changed to ${status}`,
      created_by: userId
    };
    
    const { error: historyError } = await supabase
      .from('quote_history')
      .insert([historyEntry]);
    
    if (historyError) throw historyError;
    
    // 3. Get the quote details for notifications
    // Use a simple query without joins to avoid ambiguity
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('quote_number, user_id')
      .eq('id', quoteId)
      .single();
    
    if (quoteError) throw quoteError;
    
    // 4. Create notifications
    const quoteNumber = quoteData?.quote_number;
    const quoteUserId = quoteData?.user_id;
    const sb = supabase as any;
    
    // Notify quote owner
    if (quoteUserId) {
      await sb.from('notifications').insert({
        user_id: quoteUserId,
        type: 'quote_status_change',
        message: `Офертата ${quoteNumber} е със статус: ${status}`,
        quote_id: quoteId,
      });
    }
    
    // Notify admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');
      
    if (admins) {
      for (const admin of admins) {
        // Skip notifying the admin who made the change
        if (admin.id !== userId) {
          await sb.from('notifications').insert({
            user_id: admin.id,
            type: 'quote_status_change',
            message: `Офертата ${quoteNumber} е със статус: ${status}`,
            quote_id: quoteId,
          });
        }
      }
    }
    
    // 5. If status is 'completed', update the product stock
    if (status === 'completed') {
      await updateProductStock(quoteId);
    }
    
    // 6. Call the success callback to update the UI
    onSuccess(quoteId, status);
    
    toast.success(`Офертата е със статус: ${status}`);
  } catch (error) {
    console.error('Error updating quote:', error);
    toast.error('Неуспешно обновяване на офертата');
  }
}

async function updateProductStock(quoteId: string) {
  try {
    // 1. Get quote items
    const { data: quoteItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId);
    
    if (itemsError) throw itemsError;
    
    if (!quoteItems || quoteItems.length === 0) {
      console.warn('No items found for this quote');
      return;
    }
    
    // 2. For each item, update the product stock
    for (const item of quoteItems) {
      try {
        // Get current product stock
        const { data, error: productError } = await supabase
          .from('products')
          .select('id, name, stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          console.error(`Error fetching product ${item.product_id}:`, productError);
          continue;
        }
        
        // Use any type to bypass TypeScript checks
        const product: any = data;
        
        if (!product) {
          console.error(`Product not found: ${item.product_id}`);
          continue;
        }
        
        // Calculate new stock level (ensure it doesn't go below 0)
        const currentStock = typeof product.stock_quantity === 'number' ? product.stock_quantity : 0;
        const newStockLevel = Math.max(0, currentStock - item.quantity);
        
        // Update product stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockLevel } as any)
          .eq('id', item.product_id);
        
        if (updateError) {
          console.error(`Error updating stock for product ${product.name}:`, updateError);
          continue;
        }
        
        console.log(`Updated stock for ${product.name}: ${currentStock} → ${newStockLevel}`);
      } catch (itemError) {
        console.error(`Error processing quote item:`, itemError);
        continue;
      }
    }
    
    toast.success('Наличностите са обновени');
  } catch (error) {
    console.error('Error updating product stock:', error);
    toast.error('Неуспешно обновяване на някои наличности');
  }
} 