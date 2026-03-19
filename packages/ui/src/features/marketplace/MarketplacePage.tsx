import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useMarketplaceFilter } from './hooks/use-marketplace-filter';
import { ExtensionCard } from './components/ExtensionCard';

export function MarketplacePage() {
  const { data: marketplace, isLoading } = useMarketplace();
  const filter = useMarketplaceFilter(marketplace);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketplace</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse, install, and manage extensions.
        </p>
      </div>

      <Input
        placeholder="Search extensions..."
        value={filter.searchQuery}
        onChange={(e) => filter.setSearchQuery(e.target.value)}
      />

      {filter.allTags.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="tag-filter">
          {filter.allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filter.selectedTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                filter.setSelectedTag(filter.selectedTag === tag ? null : tag)
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({filter.filteredActive.length})
          </TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({filter.filteredInstalled.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({filter.filteredAvailable.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filter.filteredActive.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No active extensions in this project.
              </p>
            ) : (
              filter.filteredActive.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="installed">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filter.filteredInstalled.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No installed extensions.
              </p>
            ) : (
              filter.filteredInstalled.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filter.filteredAvailable.length === 0 ? (
              <p className="col-span-full text-muted-foreground">
                No available extensions in registries.
              </p>
            ) : (
              filter.filteredAvailable.map((ext) => (
                <ExtensionCard key={ext.name} extension={ext} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
