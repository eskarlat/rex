import { useState, useEffect } from 'react';

import { useMarketplaceFilter } from './hooks/use-marketplace-filter';
import { ExtensionSidebar } from './components/ExtensionSidebar';
import { ExtensionDetailPanel } from './components/ExtensionDetailPanel';

import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useIsMobile } from '@/hooks/use-mobile';

export function MarketplacePage() {
  const { data: marketplace, isLoading } = useMarketplace();
  const filter = useMarketplaceFilter(marketplace);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
      <div className="-m-3 flex h-[calc(100%+1.5rem)] md:-m-6 md:h-[calc(100%+3rem)]">
        <Skeleton className="w-full md:w-80 md:shrink-0" />
        <Skeleton className="hidden flex-1 md:block" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="-m-3 flex h-[calc(100%+1.5rem)] flex-col">
        <ExtensionSidebar
          filter={filter}
          selectedName={selectedName}
          onSelect={setSelectedName}
          fullWidth
        />
        <Sheet
          open={!!selectedName}
          onOpenChange={(open) => !open && setSelectedName(null)}
        >
          <SheetContent side="bottom" className="h-[85svh] p-0" aria-describedby={undefined}>
            <SheetHeader className="sr-only">
              <SheetTitle>{selectedExtension?.name ?? 'Extension Details'}</SheetTitle>
            </SheetHeader>
            <ExtensionDetailPanel extension={selectedExtension} />
          </SheetContent>
        </Sheet>
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
