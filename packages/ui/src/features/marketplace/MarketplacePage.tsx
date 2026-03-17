import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { ExtensionCard } from './components/ExtensionCard';

export function MarketplacePage() {
  const { data: marketplace, isLoading } = useMarketplace();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const active = marketplace?.active ?? [];
  const installed = marketplace?.installed ?? [];
  const available = marketplace?.available ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse, install, and manage extensions.
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({installed.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({available.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {active.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No active extensions in this project.
              </p>
            ) : (
              active.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="installed">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {installed.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No installed extensions.
              </p>
            ) : (
              installed.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {available.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No available extensions in registries.
              </p>
            ) : (
              available.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
