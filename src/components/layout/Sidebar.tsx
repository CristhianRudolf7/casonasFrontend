'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  History,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { conversationsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loading, Input, Button } from '@/components/ui';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [chatExpanded, setChatExpanded] = useState(true);

  const queryClient = useQueryClient();
  const router = useRouter();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', 'sidebar'],
    queryFn: () => conversationsApi.getAll(0, 15),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationsApi.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (pathname === `/chat/${deletedId}`) {
        router.push('/chat');
      }
      setMenuOpenId(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => 
      conversationsApi.rename(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setEditingId(null);
      setMenuOpenId(null);
    },
  });

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameMutation.mutate({ id, title: editTitle });
    }
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle || '');
    setMenuOpenId(null);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <span className="text-xl font-bold text-primary-600">Casonas</span>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {/* Dashboard Item */}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              pathname === '/dashboard'
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Dashboard</span>}
          </Link>

          {/* Chat Item with Dropdown */}
          <div className="space-y-1">
            <div className="flex items-center">
              <Link
                href="/chat"
                onClick={() => {
                  onCloseMobile?.();
                  setChatExpanded(true);
                }}
                className={cn(
                  'flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  pathname === '/chat'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <MessageSquare className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">Chat</span>}
              </Link>
              {!collapsed && (
                <button
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className={cn('w-4 h-4 transition-transform', chatExpanded && 'rotate-180')} />
                </button>
              )}
            </div>

            {!collapsed && chatExpanded && (
              <div className="ml-6 space-y-1 pr-2">
                <Link
                  href="/chat"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nuevo Chat</span>
                </Link>
                
                {isLoading ? (
                  <div className="px-3 py-2">
                    <Loading size="sm" className="justify-start min-h-0" />
                  </div>
                ) : conversations?.map((c) => (
                  <div key={c.id} className="group relative">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-1 px-1 py-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename(c.id)}
                          className="h-8 text-xs flex-1"
                          autoFocus
                        />
                        <Button size="sm" className="h-8 px-2" onClick={() => handleRename(c.id)}>
                          Ok
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/chat/${c.id}`}
                          onClick={onCloseMobile}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors truncate pr-8',
                            pathname === `/chat/${c.id}`
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          <MessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{c.title || 'Sin título'}</span>
                        </Link>
                        
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === c.id ? null : c.id);
                            }}
                            className={cn(
                              "p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all",
                              menuOpenId === c.id ? "opacity-100 bg-gray-100" : "opacity-0 group-hover:opacity-100"
                            )}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {menuOpenId === c.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startEditing(c.id, c.title || '');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Renombrar</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteMutation.mutate(c.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
