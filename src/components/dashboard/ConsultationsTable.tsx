'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ConversationListItem } from '@/types';

interface ConsultationsTableProps {
  consultations: ConversationListItem[];
}

export default function ConsultationsTable({ consultations }: ConsultationsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Conversaciones
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {consultations.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                  No hay conversaciones registradas
                </td>
              </tr>
            ) : (
              consultations.slice(0, 5).map((conversation) => (
                <tr key={conversation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(conversation.updated_at), "d MMM yyyy, HH:mm", { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                    {conversation.title || 'Sin título'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
