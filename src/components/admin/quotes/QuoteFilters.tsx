import React from 'react';
import { Input } from "@/components/ui/input";

type FilterStatus = 'all' | 'pending' | 'ready' | 'processing' | 'completed' | 'rejected' | 'draft' | 'sent';

interface QuoteFiltersProps {
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function QuoteFilters({ 
  filterStatus, 
  setFilterStatus, 
  searchTerm, 
  setSearchTerm 
}: QuoteFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 justify-between">
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Всички
        </button>
        <button 
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1 rounded ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Получени
        </button>
        <button 
          onClick={() => setFilterStatus('ready')}
          className={`px-3 py-1 rounded ${filterStatus === 'ready' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Готови
        </button>
        <button 
          onClick={() => setFilterStatus('processing')}
          className={`px-3 py-1 rounded ${filterStatus === 'processing' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          Обработва се
        </button>
        <button 
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1 rounded ${filterStatus === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          Завършени
        </button>
      </div>
      
      <div>
        <Input
          placeholder="Търсене на оферти..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
    </div>
  );
} 