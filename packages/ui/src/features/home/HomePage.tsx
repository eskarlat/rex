import { Package, KeyRound, Clock, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useProjectContext } from '@/core/providers/ProjectProvider';

const quickActions = [
  {
    to: '/marketplace',
    icon: Package,
    title: 'Extensions',
    description: 'Browse and manage extensions',
  },
  {
    to: '/vault',
    icon: KeyRound,
    title: 'Vault',
    description: 'Manage secrets and keys',
  },
  {
    to: '/scheduler',
    icon: Clock,
    title: 'Scheduler',
    description: 'Manage scheduled tasks',
  },
  {
    to: '/settings',
    icon: Settings,
    title: 'Settings',
    description: 'Configure RenreKit',
  },
];

export function HomePage() {
  const { activeProject } = useProjectContext();
  const { data: marketplace, isLoading } = useMarketplace();

  const activeCount = marketplace?.active.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {activeProject
            ? `Project: ${activeProject}`
            : 'No project selected'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Extensions
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{activeCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <action.icon className="mb-2 h-6 w-6 text-muted-foreground" />
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
