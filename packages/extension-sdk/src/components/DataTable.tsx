import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableColumn {
  key: string;
  label: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, unknown>[];
  className?: string;
}

export function DataTable({ columns, data, className }: Readonly<DataTableProps>) {
  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => {
          const rowKey = columns
            .map((col) => {
              const v = row[col.key];
              if (v == null) return '';
              return typeof v === 'object' ? JSON.stringify(v) : String(v as string | number | boolean);
            })
            .join('|');
          return (
            <TableRow key={`${rowIndex}-${rowKey}`}>
              {columns.map((col) => {
                const cellValue = row[col.key];
                let display = '';
                if (cellValue != null) {
                  display =
                    typeof cellValue === 'object'
                      ? JSON.stringify(cellValue)
                      : `${cellValue as string | number | boolean}`;
                }
                return <TableCell key={col.key}>{display}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
