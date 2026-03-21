import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useMarketplaceFilter } from './hooks/use-marketplace-filter';
import { ExtensionSidebar } from './components/ExtensionSidebar';
import { ExtensionDetailPanel } from './components/ExtensionDetailPanel';

export function MarketplacePage() {
  const { data: marketplace, isLoading } = useMarketplace();
  const filter = useMarketplaceFilter(marketplace);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Auto-select first extension when list changes or selection becomes invalid
  useEffect(() => {
    const allExts = filter.allFiltered;
    const stillExists = selectedName && allExts.some((e) => e.name === selectedName);
    if (!stillExists && allExts.length > 0) {
      setSelectedName(allExts[0]!.name);
    } else if (allExts.length === 0) {
      setSelectedName(null);
    }
  }, [filter.allFiltered, selectedName]);

  const selectedExtension = filter.allFiltered.find((e) => e.name === selectedName);

  if (isLoading) {
    return (
      <div className="-m-6 flex h-[calc(100%+3rem)]">
        <Skeleton className="w-80 shrink-0" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100%+3rem)]">
      <ExtensionSidebar filter={filter} selectedName={selectedName} onSelect={setSelectedName} />
      <Separator orientation="vertical" />
      <ExtensionDetailPanel extension={selectedExtension} />
    </div>
  );
}
