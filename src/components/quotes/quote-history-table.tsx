import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { QuoteItemType } from "@/components/quote/quote-item";

export type QuoteHistoryItem = {
  id: string;
  date: string;
  totalPrice: number;
  status: "pending" | "processing" | "approved" | "rejected";
  items: QuoteItemType[];
};

type QuoteHistoryTableProps = {
  quotes: QuoteHistoryItem[];
  onViewQuote?: (quoteId: string) => void;
};

export function QuoteHistoryTable({ quotes, onViewQuote }: QuoteHistoryTableProps) {
  const statusLabel = {
    pending: "Получена",
    processing: "Обработва се",
    approved: "Одобрена",
    rejected: "Отказана",
  };
  
  const statusColor = {
    pending: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  
  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-white">
        <p className="text-muted-foreground">Няма намерени оферти.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto border rounded-md bg-white">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-sm">ID на оферта</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Дата</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Обща цена</th>
            <th className="px-4 py-3 text-left font-medium text-sm">Статус</th>
            <th className="px-4 py-3 text-right font-medium text-sm">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {quotes.map((quote) => (
            <tr key={quote.id}>
              <td className="px-4 py-3">{quote.id}</td>
              <td className="px-4 py-3">{quote.date}</td>
              <td className="px-4 py-3">{quote.totalPrice.toFixed(2)} лв.</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[quote.status]}`}>
                  {statusLabel[quote.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewQuote && onViewQuote(quote.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Виж
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
