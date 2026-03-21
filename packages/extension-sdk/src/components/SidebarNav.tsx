import { cn } from '@/lib/utils';

export interface SidebarNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  className?: string;
}

export function SidebarNav({ items, className }: SidebarNavProps) {
  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
            item.active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
