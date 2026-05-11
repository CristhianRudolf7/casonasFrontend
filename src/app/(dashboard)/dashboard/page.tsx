'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { StatsCard, ConsultationsChart, ConsultationsTable } from '@/components/dashboard';
import { conversationsApi } from '@/lib/api';
import { Loading } from '@/components/ui';
import type { Stats, ConversationListItem } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, conversationsData] = await Promise.all([
        conversationsApi.getStats(),
        conversationsApi.getAll(0, 20),
      ]);
      setStats(statsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Cargando estadísticas..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tus conversaciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Conversaciones"
          value={stats?.total_consultations || 0}
          icon={MessageSquare}
        />
        <StatsCard
          title="Este Mes"
          value={stats?.consultations_this_month || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Esta Semana"
          value={stats?.consultations_this_week || 0}
          icon={BarChart3}
        />
        <StatsCard
          title="Promedio/Día"
          value={stats?.avg_consultations_per_day || 0}
          icon={TrendingUp}
        />
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationsChart consultations={conversations} />
        <ConsultationsTable consultations={conversations} />
      </div>
    </div>
  );
}
