import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clock, Settings, Puzzle, ScrollText, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectSwitcher } from './ProjectSwitcher';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useMobileSidebar } from '@/core/providers/MobileSidebarProvider';

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
  onClick?: () => void;
}

function SidebarNavLink({ to, end, icon: Icon, label, collapsed, onClick }: SidebarNavLinkProps) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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

function SidebarHeader({
  isCompact,
  onToggle,
  toggleLabel,
  showExpand,
}: {
  isCompact: boolean;
  onToggle: () => void;
  toggleLabel: string;
  showExpand: boolean;
}) {
  return (
    <div className={cn('flex h-14 items-center', isCompact ? 'justify-center px-0' : 'justify-between px-3')}>
      {!isCompact && <span className="px-1 text-lg font-bold">RenreKit</span>}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-9 w-9 text-muted-foreground"
            aria-label={toggleLabel}
          >
            {showExpand ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{toggleLabel}</TooltipContent>
      </Tooltip>
    </div>
  );
}

interface ExtensionInfo {
  name: string;
  title?: string;
}

function SidebarExtensions({
  extensions,
  isCompact,
  onClick,
}: {
  extensions: ExtensionInfo[];
  isCompact: boolean;
  onClick?: () => void;
}) {
  if (extensions.length === 0) return null;

  return (
    <>
      <Separator className="my-3" />
      {!isCompact && (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Extensions
        </p>
      )}
      <nav className={cn('space-y-1', isCompact ? 'flex flex-col items-center' : 'px-0')}>
        {extensions.map((ext) => (
          <SidebarNavLink
            key={ext.name}
            to={`/extensions/${ext.name}`}
            end={false}
            icon={Puzzle}
            label={ext.title ?? ext.name}
            collapsed={isCompact}
            onClick={onClick}
          />
        ))}
      </nav>
    </>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: marketplace } = useMarketplace();
  const activeExtensions = marketplace?.active ?? [];
  const { isOpen, close } = useMobileSidebar();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  // On mobile, always show expanded; on desktop, respect collapsed state
  const isCompact = collapsed && !isOpen;
  const mobileCloseHandler = isOpen ? close : undefined;

  function handleToggle() {
    if (isOpen) {
      close();
    } else {
      setCollapsed((prev) => !prev);
    }
  }

  function getToggleLabel(): string {
    if (isOpen) return 'Close menu';
    if (collapsed) return 'Expand sidebar';
    return 'Collapse sidebar';
  }
  const toggleLabel = getToggleLabel();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-muted/40 transition-all',
        // Desktop: normal sidebar behavior
        'hidden md:flex',
        isCompact ? 'md:w-14' : 'md:w-60',
        // Mobile: fixed overlay when open
        isOpen && 'fixed inset-y-0 left-0 z-50 flex w-60'
      )}
    >
      <SidebarHeader
        isCompact={isCompact}
        onToggle={handleToggle}
        toggleLabel={toggleLabel}
        showExpand={isCompact}
      />
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('space-y-1', isCompact ? 'flex flex-col items-center' : 'px-2')}>
          {navLinks.map((link) => (
            <SidebarNavLink key={link.to} {...link} collapsed={isCompact} onClick={mobileCloseHandler} />
          ))}
        </nav>

        <SidebarExtensions
          extensions={activeExtensions}
          isCompact={isCompact}
          onClick={mobileCloseHandler}
        />
      </ScrollArea>
      <Separator />
      <nav className={cn('space-y-1 py-2', isCompact ? 'flex flex-col items-center' : 'px-2')}>
        {bottomLinks.map((link) => (
          <SidebarNavLink key={link.to} {...link} collapsed={isCompact} onClick={mobileCloseHandler} />
        ))}
      </nav>
      <Separator />
      {!isCompact && (
        <div className="p-3">
          <ProjectSwitcher />
        </div>
      )}
    </aside>
  );
}
