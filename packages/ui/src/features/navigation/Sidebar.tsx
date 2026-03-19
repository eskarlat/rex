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

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function SidebarHeader({ collapsed, onToggle }: SidebarHeaderProps) {
  return (
    <div className={cn('flex h-14 items-center', collapsed ? 'justify-center px-0' : 'justify-between px-3')}>
      {!collapsed && <span className="px-1 text-lg font-bold">RenreKit</span>}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
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
  );
}

interface ExtensionNavProps {
  extensions: Array<{ name: string; title?: string; hasIcon?: boolean }>;
  collapsed: boolean;
}

function ExtensionIconComponent({ name, hasIcon }: { name: string; hasIcon?: boolean }) {
  if (!hasIcon) return <Puzzle className="h-4 w-4 shrink-0" />;

  return (
    <img
      src={`/api/extensions/${encodeURIComponent(name)}/icon`}
      alt=""
      className="h-4 w-4 shrink-0 rounded object-contain"
    />
  );
}

function ExtensionNav({ extensions, collapsed }: ExtensionNavProps) {
  if (extensions.length === 0) return null;
  return (
    <>
      <Separator className="my-3" />
      {!collapsed && (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Extensions
        </p>
      )}
      <nav className={cn('space-y-1', collapsed ? 'flex flex-col items-center' : 'px-0')}>
        {extensions.map((ext) => {
          const label = ext.title ?? ext.name;
          const link = (
            <NavLink
              key={ext.name}
              to={`/extensions/${ext.name}`}
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
              <ExtensionIconComponent name={ext.name} hasIcon={ext.hasIcon} />
              {!collapsed && label}
            </NavLink>
          );

          if (!collapsed) return <div key={ext.name}>{link}</div>;

          return (
            <Tooltip key={ext.name}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: marketplace } = useMarketplace();
  const activeExtensions = marketplace?.active ?? [];

  return (
    <aside className={cn('flex h-full flex-col border-r bg-muted/40 transition-all', collapsed ? 'w-14' : 'w-60')}>
      <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('space-y-1', collapsed ? 'flex flex-col items-center' : 'px-2')}>
          {navLinks.map((link) => (
            <SidebarNavLink key={link.to} {...link} collapsed={collapsed} />
          ))}
        </nav>
        <ExtensionNav extensions={activeExtensions} collapsed={collapsed} />
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
