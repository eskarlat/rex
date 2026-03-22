import { Badge } from '@/components/ui/badge';
import type { Extension } from '@/core/hooks/use-extensions';

interface UpdateBadgeProps {
  extension: Extension;
}

export function UpdateBadge({ extension }: Readonly<UpdateBadgeProps>) {
  if (!extension.updateAvailable) return null;

  if (extension.engineCompatible === false) {
    return (
      <Badge variant="destructive" className="text-xs">
        {extension.updateAvailable} (incompatible)
      </Badge>
    );
  }

  return <Badge className="text-xs bg-blue-600">{extension.updateAvailable} available</Badge>;
}
