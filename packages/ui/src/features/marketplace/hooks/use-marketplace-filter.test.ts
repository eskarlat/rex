import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMarketplaceFilter } from './use-marketplace-filter';
import type { MarketplaceResult } from '@/core/hooks/use-extensions';

const marketplace: MarketplaceResult = {
  active: [
    { name: 'figma', version: '1.0.0', type: 'standard', status: 'active', description: 'Figma integration' },
  ],
  installed: [
    { name: 'slack', version: '2.0.0', type: 'standard', status: 'installed', description: 'Slack integration' },
  ],
  available: [
    { name: 'hello-world', version: '1.0.0', type: 'standard', status: 'available', description: 'A hello extension', tags: ['example', 'greeting'] },
    { name: 'weather-mcp', version: '1.0.0', type: 'mcp-stdio', status: 'available', description: 'A weather server', tags: ['example', 'mcp'] },
    { name: 'analytics', version: '2.0.0', type: 'standard', status: 'available', description: 'Track usage' },
  ],
};

describe('useMarketplaceFilter', () => {
  it('returns all items unfiltered by default', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    expect(result.current.filteredActive).toHaveLength(1);
    expect(result.current.filteredInstalled).toHaveLength(1);
    expect(result.current.filteredAvailable).toHaveLength(3);
  });

  it('extracts and sorts unique tags from available extensions', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    expect(result.current.allTags).toEqual(['example', 'greeting', 'mcp']);
  });

  it('filters active by search query', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSearchQuery('figma'));
    expect(result.current.filteredActive).toHaveLength(1);
    act(() => result.current.setSearchQuery('nonexistent'));
    expect(result.current.filteredActive).toHaveLength(0);
  });

  it('filters installed by search query', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSearchQuery('slack'));
    expect(result.current.filteredInstalled).toHaveLength(1);
    act(() => result.current.setSearchQuery('xyz'));
    expect(result.current.filteredInstalled).toHaveLength(0);
  });

  it('filters available by search query', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSearchQuery('hello'));
    expect(result.current.filteredAvailable).toHaveLength(1);
    expect(result.current.filteredAvailable[0]?.name).toBe('hello-world');
  });

  it('search query is case-insensitive', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSearchQuery('WEATHER'));
    expect(result.current.filteredAvailable).toHaveLength(1);
  });

  it('filters available by tag', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSelectedTag('greeting'));
    expect(result.current.filteredAvailable).toHaveLength(1);
    expect(result.current.filteredAvailable[0]?.name).toBe('hello-world');
  });

  it('tag filter excludes extensions without tags', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSelectedTag('example'));
    expect(result.current.filteredAvailable).toHaveLength(2);
    expect(result.current.filteredAvailable.find((e) => e.name === 'analytics')).toBeUndefined();
  });

  it('tag filter does NOT affect active or installed tabs', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSelectedTag('greeting'));
    expect(result.current.filteredActive).toHaveLength(1);
    expect(result.current.filteredInstalled).toHaveLength(1);
  });

  it('combines search query and tag filter', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => {
      result.current.setSearchQuery('weather');
      result.current.setSelectedTag('example');
    });
    expect(result.current.filteredAvailable).toHaveLength(1);
    expect(result.current.filteredAvailable[0]?.name).toBe('weather-mcp');
  });

  it('handles undefined marketplace', () => {
    const { result } = renderHook(() => useMarketplaceFilter(undefined));
    expect(result.current.filteredActive).toEqual([]);
    expect(result.current.filteredInstalled).toEqual([]);
    expect(result.current.filteredAvailable).toEqual([]);
    expect(result.current.allTags).toEqual([]);
  });

  it('clears tag filter when set to null', () => {
    const { result } = renderHook(() => useMarketplaceFilter(marketplace));
    act(() => result.current.setSelectedTag('greeting'));
    expect(result.current.filteredAvailable).toHaveLength(1);
    act(() => result.current.setSelectedTag(null));
    expect(result.current.filteredAvailable).toHaveLength(3);
  });
});
