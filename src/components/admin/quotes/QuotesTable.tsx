import React from 'react';
import { formatDate } from "@/lib/utils";
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash2, MoreHorizontal, Mail, PencilIcon, Check, Eye, FileEdit } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Quote {
  id: string;
  quote_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: number;
  total_estimate: number;
  user_id: string;
  simple_customer_id?: string | null;
  discount_code?: string | null;
  discount_percent?: number | null;
  note?: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

interface QuotesTableProps {
  quotes: Quote[];
  userProfiles: Record<string, UserProfile>;
  updateQuoteStatus: (quoteId: string, status: string, notes?: string) => Promise<void>;
  handleOpenEditDialog: (quote: Quote) => void;
  handleDeleteQuote: (quoteId: string) => void;
  handleSendQuote: (quoteId: string) => Promise<void>;
  loading: boolean;
}

export function QuotesTable({ 
  quotes, 
  userProfiles, 
  updateQuoteStatus, 
  handleOpenEditDialog, 
  handleDeleteQuote,
  handleSendQuote,
  loading 
}: QuotesTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-6 text-center">Зареждане на оферти...</div>;
  }
  
  if (quotes.length === 0) {
    return <div className="p-6 text-center">Няма намерени оферти</div>;
  }
  
  const handleViewQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  const handleEditQuoteDetails = (quoteId: string) => {
    navigate(`/admin/edit-quote/${quoteId}`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID на оферта
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Клиент
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Обща цена
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotes.map((quote) => {
            const userProfile = userProfiles[quote.user_id];
            return (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    className="text-primary hover:text-primary/80 hover:underline font-medium"
                    onClick={() => handleViewQuote(quote.id)}
                  >
                    {quote.quote_number}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userProfile ? (
                    <div>
                      <div>{userProfile.first_name} {userProfile.last_name}</div>
                      <div className="text-xs text-gray-400">{userProfile.email}</div>
                      {userProfile.company && (
                        <div className="text-xs text-gray-400">{userProfile.company}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Неизвестен потребител</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quote.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {parseFloat(String(quote.total_amount)).toFixed(2)} лв.
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <QuoteStatusBadge status={quote.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewQuote(quote.id)}
                      className="text-primary hover:bg-primary/10"
                      title="Преглед на офертата"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewQuote(quote.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Преглед
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleEditQuoteDetails(quote.id)}>
                          <FileEdit className="mr-2 h-4 w-4" /> Редактиране на детайли
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(quote)}>
                          <PencilIcon className="mr-2 h-4 w-4" /> Промяна на статус
                        </DropdownMenuItem>
                        
                        {quote.status === 'pending' && (
                          <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, 'processing')}>
                            <Check className="mr-2 h-4 w-4" /> Към обработка
                          </DropdownMenuItem>
                        )}
                        
                        {quote.status === 'processing' && (
                          <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, 'ready')}>
                            <Check className="mr-2 h-4 w-4" /> Маркирай като готова
                          </DropdownMenuItem>
                        )}
                        
                        {quote.status === 'ready' && (
                          <DropdownMenuItem onClick={() => handleSendQuote(quote.id)}>
                            <Mail className="mr-2 h-4 w-4" /> Изпрати на клиента
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Изтриване
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 