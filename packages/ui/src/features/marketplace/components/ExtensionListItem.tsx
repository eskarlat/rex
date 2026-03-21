import { Puzzle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Extension } from '@/core/hooks/use-extensions';
import { cn } from '@/lib/utils';

interface ExtensionListItemProps {
  extension: Extension;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

function ListItemIcon({ extension }: { extension: Extension }) {
  if (!extension.hasIcon) {
    return (
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"
        data-testid="default-icon"
      >
        <Puzzle className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`/api/extensions/${encodeURIComponent(extension.name)}/icon`}
      alt={`${extension.name} icon`}
      className="h-9 w-9 shrink-0 rounded-md object-contain"
    />
  );
}

export function ExtensionListItem({ extension, isSelected, onSelect }: ExtensionListItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent',
      )}
      onClick={() => onSelect(extension.name)}
      data-testid={`ext-item-${extension.name}`}
    >
      <ListItemIcon extension={extension} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{extension.name}</div>
        {extension.author && (
          <div className="truncate text-xs text-muted-foreground">{extension.author}</div>
        )}
      </div>
      <Badge variant="outline" className="shrink-0 text-xs">
        {extension.version}
      </Badge>
    </button>
  );
}
