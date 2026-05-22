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
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Header 
        sidebarCollapsed={collapsed} 
        onMenuClick={() => setMobileOpen(true)}
      />
      
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          collapsed ? 'lg:pl-16' : 'lg:pl-64',
          'pl-0'
        )}
      >
        <div className="pt-16 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
