'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Header } from '@/components/layout';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <Loading fullPage text="Verificando sesión..." />;
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Header sidebarCollapsed={collapsed} />
      <main
        className={cn(
          'pt-16 h-full transition-all duration-300 flex flex-col overflow-hidden',
          collapsed ? 'pl-16' : 'pl-64',
          'pl-0 lg:pl-64'
        )}
        style={{ paddingLeft: collapsed ? '4rem' : '16rem' }}
      >
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
