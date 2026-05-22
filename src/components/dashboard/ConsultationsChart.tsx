'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Consultation } from '@/types';

interface ConsultationsChartProps {
  consultations: any[]; // Usar any o ConversationListItem para compatibilidad
}

export default function ConsultationsChart({ consultations }: ConsultationsChartProps) {
  // Agrupar consultas por día
  const data = (consultations || []).reduce((acc: { [key: string]: number }, item) => {
    const date = new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(data)
    .map(([date, count]) => ({ date, consultas: count }))
    .reverse() // Voltear porque la API devuelve los más recientes primero
    .slice(-7);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Conversaciones por día
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="consultas"
              stroke="#9333ea"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsultas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
