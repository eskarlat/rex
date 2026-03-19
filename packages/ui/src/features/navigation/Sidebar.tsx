import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, Settings, Puzzle, ScrollText, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from './ProjectSwitcher';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMarketplace } from '@/core/hooks/use-extensions';

const navLinks = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/scheduler', icon: Clock, label: 'Scheduler', end: false },
];

const bottomLinks = [
  { to: '/logs', icon: ScrollText, label: 'Logs', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

interface SidebarNavLinkProps {
  to: string;
  end: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
}

function SidebarNavLink({ to, end, icon: Icon, label, collapsed }: SidebarNavLinkProps) {
  const link = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-md text-sm font-medium transition-colors',
          collapsed ? 'h-9 w-9 justify-center' : 'gap-3 px-3 py-2',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: marketplace } = useMarketplace();
  const activeExtensions = marketplace?.active ?? [];

  return (
    <aside className={cn('flex h-full flex-col border-r bg-muted/40 transition-all', collapsed ? 'w-14' : 'w-60')}>
      <div className={cn('flex h-14 items-center', collapsed ? 'justify-center px-0' : 'justify-between px-3')}>
        {!collapsed && <span className="px-1 text-lg font-bold">RenreKit</span>}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((prev) => !prev)}
              className="h-9 w-9 text-muted-foreground"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('space-y-1', collapsed ? 'flex flex-col items-center' : 'px-2')}>
          {navLinks.map((link) => (
            <SidebarNavLink key={link.to} {...link} collapsed={collapsed} />
          ))}
        </nav>

        {activeExtensions.length > 0 && (
          <>
            <Separator className="my-3" />
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extensions
              </p>
            )}
            <nav className={cn('space-y-1', collapsed ? 'flex flex-col items-center' : 'px-0')}>
              {activeExtensions.map((ext) => (
                <SidebarNavLink
                  key={ext.name}
                  to={`/extensions/${ext.name}`}
                  end={false}
                  icon={Puzzle}
                  label={ext.title ?? ext.name}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </>
        )}
      </ScrollArea>
      <Separator />
      <nav className={cn('space-y-1 py-2', collapsed ? 'flex flex-col items-center' : 'px-2')}>
        {bottomLinks.map((link) => (
          <SidebarNavLink key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>
      <Separator />
      {!collapsed && (
        <div className="p-3">
          <ProjectSwitcher />
        </div>
      )}
    </aside>
  );
}
