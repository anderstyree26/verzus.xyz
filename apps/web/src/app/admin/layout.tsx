'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ShieldAlert,
  Gamepad2,
  Users,
  Trophy,
  Gem,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const mobileTabs = [
    { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
    { href: '/admin/review', label: 'Review', icon: ShieldAlert },
    { href: '/admin/profiles', label: 'Profiles', icon: Gamepad2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/seasons', label: 'Seasons', icon: Trophy },
    { href: '/admin/sponsors', label: 'Sponsors', icon: Gem },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Mobile-Only Responsive Admin Nav Bar */}
      <div className="lg:hidden bg-card border border-border rounded-2xl p-2.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-tight text-foreground">
              Admin Console
            </span>
          </div>
          <Badge variant="copper" className="text-[9px] font-mono">
            OPERATIONS
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {mobileTabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Workspace */}
      <div className="w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
