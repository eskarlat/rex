export interface LogFooterProps {
  filteredCount: number;
  totalCount: number;
  unit: string;
  unitPlural: string;
}

export function LogFooter({ filteredCount, totalCount, unit, unitPlural }: Readonly<LogFooterProps>) {
  return (
    <div className="flex items-center justify-between border-t px-3 py-1.5 text-xs text-muted-foreground">
      <span>
        {filteredCount} {filteredCount !== 1 ? unitPlural : unit}
        {filteredCount !== totalCount && ` (${totalCount} total)`}
      </span>
      <span>Max 1 000 entries</span>
    </div>
  );
}
