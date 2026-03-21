import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import type { MarketplaceFilter } from '../hooks/use-marketplace-filter';

import { ExtensionListItem } from './ExtensionListItem';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtensionSidebarProps {
  filter: MarketplaceFilter;
  selectedName: string | null;
  onSelect: (name: string) => void;
}

function SectionHeader({ label, count }: Readonly<{ label: string; count: number }>) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}

export function ExtensionSidebar({ filter, selectedName, onSelect }: Readonly<ExtensionSidebarProps>) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilter = !!filter.selectedTag;

  return (
    <div className="flex w-80 shrink-0 flex-col border-r" data-testid="extension-sidebar">
      <div className="space-y-2 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search extensions..."
            value={filter.searchQuery}
            onChange={(e) => filter.setSearchQuery(e.target.value)}
          />
          {filter.allTags.length > 0 && (
            <Button
              variant={showFilters || hasActiveFilter ? 'secondary' : 'outline'}
              size="icon"
              className="shrink-0"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
              data-testid="filter-toggle"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showFilters && filter.allTags.length > 0 && (
          <div className="flex flex-wrap gap-1" data-testid="tag-filter">
            {filter.allTags.map((tag) => (
              <Badge
                key={tag}
                variant={filter.selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => filter.setSelectedTag(filter.selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filter.filteredActive.length > 0 && (
            <div>
              <SectionHeader label="Active" count={filter.filteredActive.length} />
              {filter.filteredActive.map((ext) => (
                <ExtensionListItem
                  key={ext.name}
                  extension={ext}
                  isSelected={selectedName === ext.name}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}

          {filter.filteredInstalled.length > 0 && (
            <div>
              <SectionHeader label="Installed" count={filter.filteredInstalled.length} />
              {filter.filteredInstalled.map((ext) => (
                <ExtensionListItem
                  key={ext.name}
                  extension={ext}
                  isSelected={selectedName === ext.name}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}

          {filter.filteredAvailable.length > 0 && (
            <div>
              <SectionHeader label="Available" count={filter.filteredAvailable.length} />
              {filter.filteredAvailable.map((ext) => (
                <ExtensionListItem
                  key={ext.name}
                  extension={ext}
                  isSelected={selectedName === ext.name}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}

          {filter.allFiltered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No extensions found.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
