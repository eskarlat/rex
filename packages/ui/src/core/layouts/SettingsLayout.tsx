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
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  );

export function SettingsLayout() {
  const { data: marketplace } = useMarketplace();
  const activeExtensions = (marketplace?.active ?? []).filter((ext) => ext.hasConfig);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Manage your RenreKit configuration.
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <nav className="flex gap-1 overflow-x-auto md:w-48 md:flex-col md:gap-0 md:space-y-1">
          {settingsLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClass}
            >
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
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
