import React from 'react';
import { Badge } from "@/components/ui/badge";

type QuoteStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'draft' | 'ready' | 'sent';

interface QuoteStatusBadgeProps {
  status: QuoteStatus | string;
}

export function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'draft':
        return 'outline';
      case 'ready':
        return 'default';
      case 'sent':
        return 'blue';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Получена';
      case 'processing':
        return 'Обработва се';
      case 'completed':
        return 'Завършена';
      case 'rejected':
        return 'Отхвърлена';
      case 'draft':
        return 'Чернова';
      case 'ready':
        return 'Готова';
      case 'sent':
        return 'Изпратена';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
} 