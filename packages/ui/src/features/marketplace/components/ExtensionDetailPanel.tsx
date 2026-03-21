import { ExternalLink, Puzzle } from 'lucide-react';

import { ExtensionActions, UpdateBadge } from './ExtensionActions';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Extension } from '@/core/hooks/use-extensions';
import { useExtensionChangelog, useExtensionReadme } from '@/core/hooks/use-extensions';

interface ExtensionDetailPanelProps {
  extension: Extension | undefined;
}

interface DetailIconProps {
  extension: Extension;
}

function DetailIcon({ extension }: Readonly<DetailIconProps>) {
  if (!extension.hasIcon) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        <Puzzle className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`/api/extensions/${encodeURIComponent(extension.name)}/icon`}
      alt={`${extension.name} icon`}
      className="h-12 w-12 rounded-lg object-contain"
    />
  );
}

interface MetadataRowProps {
  label: string;
  value: string | undefined;
}

function MetadataRow({ label, value }: Readonly<MetadataRowProps>) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}

interface LinkRowProps {
  label: string;
  url: string | undefined;
}

function LinkRow({ label, url }: Readonly<LinkRowProps>) {
  if (!url) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 break-all text-primary hover:underline"
      >
        {url.replace(/^https?:\/\//, '').replace(/\.git$/, '')}
        <ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}

interface DocContentProps {
  data: string | null | undefined;
  isLoading: boolean;
  testIdPrefix: string;
}

function DocContent({ data, isLoading, testIdPrefix }: Readonly<DocContentProps>) {
  if (isLoading) {
    return (
      <div data-testid={`${testIdPrefix}-loading`} className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (!data) return null;
  return (
    <pre
      data-testid={`${testIdPrefix}-content`}
      className="max-h-[400px] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 font-mono text-sm text-muted-foreground"
    >
      {data}
    </pre>
  );
}

interface DocsTabsProps {
  name: string;
}

function DocsTabs({ name }: Readonly<DocsTabsProps>) {
  const { data: readme, isLoading: readmeLoading } = useExtensionReadme(name);
  const { data: changelog, isLoading: changelogLoading } = useExtensionChangelog(name);

  return (
    <Tabs defaultValue="readme" data-testid="docs-tabs">
      <TabsList>
        <TabsTrigger value="readme">README</TabsTrigger>
        <TabsTrigger value="changelog">Changelog</TabsTrigger>
      </TabsList>
      <TabsContent value="readme">
        <DocContent data={readme} isLoading={readmeLoading} testIdPrefix="readme" />
      </TabsContent>
      <TabsContent value="changelog">
        <DocContent data={changelog} isLoading={changelogLoading} testIdPrefix="changelog" />
      </TabsContent>
    </Tabs>
  );
}

export function ExtensionDetailPanel({ extension }: Readonly<ExtensionDetailPanelProps>) {
  if (!extension) {
    return (
      <div className="flex flex-1 items-center justify-center" data-testid="detail-empty">
        <p className="text-muted-foreground">Select an extension to view details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" data-testid="detail-panel">
      {/* Header */}
      <div className="space-y-3 p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <DetailIcon extension={extension} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              <h2 className="text-lg font-semibold md:text-xl">{extension.name}</h2>
              <Badge variant="outline">{extension.version}</Badge>
              <Badge variant="secondary">{extension.type}</Badge>
            </div>
            <UpdateBadge extension={extension} />
          </div>
        </div>
        <ExtensionActions extension={extension} />
      </div>

      <Separator />

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 md:space-y-6 md:p-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Description</h3>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {extension.description ?? 'No description available.'}
            </p>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Details</h3>
            <div className="space-y-2">
              <MetadataRow label="Version" value={extension.version} />
              <MetadataRow label="Type" value={extension.type} />
              <MetadataRow label="Author" value={extension.author} />
              <LinkRow label="Repository" url={extension.gitUrl} />
              <MetadataRow label="Registry Source" value={extension.registrySource} />
              <MetadataRow label="Install Path" value={extension.installPath} />
              <MetadataRow label="Installed Date" value={extension.installedAt} />
            </div>
          </div>

          {/* Tags */}
          {extension.tags && extension.tags.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {extension.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* README & Changelog */}
          <DocsTabs name={extension.name} />
        </div>
      </ScrollArea>
    </div>
  );
}
