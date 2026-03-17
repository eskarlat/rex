import { NavLink } from 'react-router-dom';
import { Home, Package, KeyRound, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/marketplace', icon: Package, label: 'Marketplace', end: false },
  { to: '/vault', icon: KeyRound, label: 'Vault', end: false },
  { to: '/scheduler', icon: Clock, label: 'Scheduler', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center px-4">
        <span className="text-lg font-bold">RenreKit</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }): string =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3">
        <ProjectSwitcher />
      </div>
    </aside>
  );
}
