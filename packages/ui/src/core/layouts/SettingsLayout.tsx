import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { Separator } from '@/components/ui/separator';

const settingsLinks = [
  { to: '/settings', label: 'General', end: true },
  { to: '/settings/registries', label: 'Registries', end: false },
  { to: '/settings/vault', label: 'Vault', end: false },
];

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'block rounded-md px-3 py-2 text-sm font-medium',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

const mobileLinkClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

export function SettingsLayout() {
  const { data: marketplace } = useMarketplace();
  const activeExtensions = (marketplace?.active ?? []).filter((ext) => ext.hasConfig);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your RenreKit configuration.
        </p>
      </div>

      {/* Mobile: horizontal scrollable tabs */}
      <nav className="flex gap-1 overflow-x-auto pb-2 md:hidden" aria-label="Settings navigation">
        {settingsLinks.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass}>
            {link.label}
          </NavLink>
        ))}
        {activeExtensions.map((ext) => (
          <NavLink
            key={ext.name}
            to={`/settings/extensions/${ext.name}`}
            className={mobileLinkClass}
          >
            {ext.name}
          </NavLink>
        ))}
      </nav>

      {/* Desktop: side-by-side layout */}
      <div className="flex gap-8">
        <nav className="hidden w-48 space-y-1 md:block">
          {settingsLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {activeExtensions.length > 0 && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Extensions
              </p>
              {activeExtensions.map((ext) => (
                <NavLink
                  key={ext.name}
                  to={`/settings/extensions/${ext.name}`}
                  className={linkClass}
                >
                  {ext.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
