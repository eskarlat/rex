import { useState, useMemo } from 'react';
import type { Extension, MarketplaceResult } from '@/core/hooks/use-extensions';

export interface MarketplaceFilter {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  filteredActive: Extension[];
  filteredInstalled: Extension[];
  filteredAvailable: Extension[];
  allFiltered: Extension[];
}

function matchesQuery(ext: Extension, query: string): boolean {
  const q = query.toLowerCase();
  return (
    ext.name.toLowerCase().includes(q) || (ext.description?.toLowerCase().includes(q) ?? false)
  );
}

export function useMarketplaceFilter(
  marketplace: MarketplaceResult | undefined,
): MarketplaceFilter {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const active = marketplace?.active ?? [];
  const installed = marketplace?.installed ?? [];
  const available = marketplace?.available ?? [];

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const ext of [...active, ...installed, ...available]) {
      if (ext.tags) {
        for (const tag of ext.tags) {
          tagSet.add(tag);
        }
      }
    }
    return [...tagSet].sort((a, b) => a.localeCompare(b));
  }, [active, installed, available]);

  const filteredActive = useMemo(() => {
    if (!searchQuery) return active;
    return active.filter((ext) => matchesQuery(ext, searchQuery));
  }, [active, searchQuery]);

  const filteredInstalled = useMemo(() => {
    if (!searchQuery) return installed;
    return installed.filter((ext) => matchesQuery(ext, searchQuery));
  }, [installed, searchQuery]);

  const filteredAvailable = useMemo(() => {
    let result = available;
    if (searchQuery) {
      result = result.filter((ext) => matchesQuery(ext, searchQuery));
    }
    if (selectedTag) {
      result = result.filter((ext) => ext.tags?.some((t) => t === selectedTag) ?? false);
    }
    return result;
  }, [available, searchQuery, selectedTag]);

  const allFiltered = useMemo(
    () => [...filteredActive, ...filteredInstalled, ...filteredAvailable],
    [filteredActive, filteredInstalled, filteredAvailable],
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    allTags,
    filteredActive,
    filteredInstalled,
    filteredAvailable,
    allFiltered,
  };
}
