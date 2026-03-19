import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Menu, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useMobileSidebar } from '@/core/providers/MobileSidebarProvider';

interface Crumb {
  label: string;
  to?: string;
}

function useBreadcrumbs(): Crumb[] {
  const location = useLocation();
  const params = useParams<{ name?: string; panelId?: string }>();
  const { data: marketplace } = useMarketplace();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs: Crumb[] = [{ label: 'Home', to: '/' }];

  if (segments.length === 0) return crumbs;

  const first = segments[0];

  if (first === 'marketplace') {
    crumbs.push({ label: 'Marketplace' });
  } else if (first === 'scheduler') {
    crumbs.push({ label: 'Scheduler' });
  } else if (first === 'logs') {
    crumbs.push({ label: 'Logs' });
  } else if (first === 'settings') {
    crumbs.push({ label: 'Settings', to: segments.length > 1 ? '/settings' : undefined });
    if (segments[1] === 'registries') {
      crumbs.push({ label: 'Registries' });
    } else if (segments[1] === 'vault') {
      crumbs.push({ label: 'Vault' });
    } else if (segments[1] === 'extensions' && params.name) {
      crumbs.push({ label: params.name });
    }
  } else if (first === 'extensions' && params.name) {
    const ext = marketplace?.active.find((e) => e.name === params.name);
    const extLabel = ext?.title ?? params.name;
    if (params.panelId) {
      crumbs.push({ label: extLabel, to: `/extensions/${params.name}` });
      const panel = ext?.panels?.find((p) => p.id === params.panelId);
      crumbs.push({ label: panel?.title ?? params.panelId });
    } else {
      crumbs.push({ label: extLabel });
    }
  }

  return crumbs;
}

export function Toolbar() {
  const crumbs = useBreadcrumbs();
  const { toggle } = useMobileSidebar();

  return (
    <div className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={toggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav className="flex items-center gap-1 text-sm min-w-0 overflow-hidden" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1 shrink-0 last:shrink">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn(
                    isLast ? 'font-medium text-foreground truncate' : 'text-muted-foreground'
                  )}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shrink-0"
      >
        <Package className="h-4 w-4" />
        <span className="hidden sm:inline">Marketplace</span>
      </Link>
    </div>
  );
}
