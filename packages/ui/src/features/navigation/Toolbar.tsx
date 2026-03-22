import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Package, TerminalSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useTerminal } from '@/features/terminal/use-terminal';
import { NotificationCenter } from '@/features/notifications/NotificationCenter';

interface Crumb {
  label: string;
  to?: string;
}

function buildSettingsCrumbs(segments: string[], name?: string): Crumb[] {
  const crumbs: Crumb[] = [
    { label: 'Settings', to: segments.length > 1 ? '/settings' : undefined },
  ];
  const sub = segments[1];
  if (sub === 'registries') crumbs.push({ label: 'Registries' });
  else if (sub === 'vault') crumbs.push({ label: 'Vault' });
  else if (sub === 'extensions' && name) crumbs.push({ label: name });
  return crumbs;
}

function buildExtensionCrumbs(
  name: string,
  panelId: string | undefined,
  active: Array<{ name: string; title?: string; panels?: Array<{ id: string; title: string }> }>,
): Crumb[] {
  const ext = active.find((e) => e.name === name);
  const extLabel = ext?.title ?? name;
  if (panelId) {
    const panel = ext?.panels?.find((p) => p.id === panelId);
    return [{ label: extLabel, to: `/extensions/${name}` }, { label: panel?.title ?? panelId }];
  }
  return [{ label: extLabel }];
}

const simplePaths: Record<string, string> = {
  marketplace: 'Marketplace',
  scheduler: 'Scheduler',
  logs: 'Logs',
  notifications: 'Notifications',
};

function useBreadcrumbs(): Crumb[] {
  const location = useLocation();
  const params = useParams<{ name?: string; panelId?: string }>();
  const { data: marketplace } = useMarketplace();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }];

  if (segments.length === 0) return crumbs;

  const first = segments[0]!;
  const simpleLabel = simplePaths[first];

  if (simpleLabel) {
    crumbs.push({ label: simpleLabel });
  } else if (first === 'settings') {
    crumbs.push(...buildSettingsCrumbs(segments, params.name));
  } else if (first === 'extensions' && params.name) {
    crumbs.push(...buildExtensionCrumbs(params.name, params.panelId, marketplace?.active ?? []));
  }

  return crumbs;
}

interface CrumbItemProps {
  crumb: Crumb;
  isLast: boolean;
}

function CrumbItem({ crumb, isLast }: Readonly<CrumbItemProps>) {
  if (crumb.to && !isLast) {
    return (
      <Link to={crumb.to} className="text-muted-foreground transition-colors hover:text-foreground">
        {crumb.label}
      </Link>
    );
  }
  return (
    <span className={cn(isLast ? 'font-medium text-foreground' : 'text-muted-foreground')}>
      {crumb.label}
    </span>
  );
}

export function Toolbar() {
  const crumbs = useBreadcrumbs();
  const { isOpen, toggle } = useTerminal();

  return (
    <div className="flex h-14 items-center justify-between border-b px-2 md:px-4">
      <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="mr-1 h-4 md:mr-2" />
        <nav
          className="flex min-w-0 items-center gap-1 text-sm"
          aria-label="Breadcrumb"
        >
          {crumbs.map((crumb, i) => (
            <span key={crumb.to ?? crumb.label} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              <span className="truncate">
                <CrumbItem crumb={crumb} isLast={i === crumbs.length - 1} />
              </span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
        <NotificationCenter />
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:gap-2 md:px-3"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Marketplace</span>
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={isOpen ? 'Close terminal' : 'Open terminal'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors md:gap-2 md:px-3',
            isOpen
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <TerminalSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Terminal</span>
        </button>
      </div>
    </div>
  );
}
