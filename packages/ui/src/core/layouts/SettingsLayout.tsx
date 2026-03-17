import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const settingsLinks = [
  { to: '/settings', label: 'General', end: true },
  { to: '/settings/registries', label: 'Registries', end: false },
  { to: '/settings/vault', label: 'Vault', end: false },
];

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your RenreKit configuration.
        </p>
      </div>
      <div className="flex gap-8">
        <nav className="w-48 space-y-1">
          {settingsLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }): string =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
