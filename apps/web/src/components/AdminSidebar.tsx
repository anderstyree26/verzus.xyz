'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string | null;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'copper' | 'warning' | 'success';
  exact?: boolean;
}

interface AdminNavSection {
  group: string;
  items: AdminNavItem[];
}

interface AdminSidebarProps {
  onNavClick?: () => void;
  className?: string;
}

export function AdminSidebar({ onNavClick, className = '' }: AdminSidebarProps) {
  const pathname = usePathname();

  // Fetch pending review count for live HITL badge
  const { data: reviewTasks } = useQuery<Array<{ id: string }>>({
    queryKey: ['admin-sidebar-review-count'],
    queryFn: () => apiClient<Array<{ id: string }>>('/review/queue').catch(() => []),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const pendingCount = reviewTasks?.length ?? 0;

  const navSections: AdminNavSection[] = [
    {
      group: 'Core Operations',
      items: [
        {
          href: '/admin',
          label: 'Overview',
          icon: '📊',
          badge: null,
          exact: true,
        },
        {
          href: '/admin/review',
          label: 'HITL Review Queue',
          icon: '🛡️',
          badge: pendingCount > 0 ? `${pendingCount}` : null,
          badgeVariant: 'warning',
        },
      ],
    },
    {
      group: 'Game Registry & OCR',
      items: [
        {
          href: '/admin/profiles',
          label: 'Game Profiles',
          icon: '🕹️',
          badge: null,
        },
        {
          href: '/games/new?mode=admin',
          label: 'Auto-Calibrate OCR',
          icon: '⚡',
          badge: 'NEW',
          badgeVariant: 'copper' as const,
        },
      ],
    },
    {
      group: 'Governance & Liquidity',
      items: [
        {
          href: '/admin/users',
          label: 'Users & Anti-Cheat',
          icon: '👥',
          badge: null,
        },
        {
          href: '/admin/seasons',
          label: 'Seasons & Resets',
          icon: '🏆',
          badge: null,
        },
        {
          href: '/admin/sponsors',
          label: 'Sponsor Liquidity',
          icon: '💎',
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside
      className={`w-64 flex-shrink-0 bg-card border-r border-border flex flex-col justify-between p-4 select-none h-screen sticky top-0 overflow-y-auto scrollbar-none z-30 pb-20 ${className}`}
    >
      <div className="space-y-6">
        {/* Admin Brand & Shield Header */}
        <div className="space-y-2">
          <Link
            href="/admin"
            onClick={onNavClick}
            className="flex items-center gap-3 px-2 py-1 text-foreground hover:opacity-90 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-105">
              🛡️
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-foreground leading-tight">
                  ADMIN CONSOLE
                </span>
              </div>
              <span className="text-[10px] font-mono text-primary uppercase tracking-wider leading-none">
                Operations & Moderation
              </span>
            </div>
          </Link>

          {/* Operational Health Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              OCR Calibration
            </span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>

        <Separator />

        {/* Grouped shadcn Navigation Links */}
        <div className="space-y-5">
          {navSections.map((section) => (
            <div key={section.group} className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider px-3 block">
                {section.group}
              </span>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const baseHref = item.href.split('?')[0] ?? item.href;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(baseHref);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavClick}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm select-none flex-shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || (isActive ? 'secondary' : 'default')}
                          className="text-[9px] px-1.5 py-0 font-mono flex-shrink-0 ml-1.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Return to Player Experience */}
      <div className="pt-6 border-t border-border space-y-3">
        <Link href="/" onClick={onNavClick}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs font-bold gap-2 text-muted-foreground hover:text-foreground"
          >
            <span>🎮</span>
            <span>Return to Arena</span>
          </Button>
        </Link>

        <div className="px-2 text-[10px] text-muted-foreground flex items-center justify-between font-mono">
          <span>Security Level</span>
          <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
            ROOT ADMIN
          </Badge>
        </div>
      </div>
    </aside>
  );
}
