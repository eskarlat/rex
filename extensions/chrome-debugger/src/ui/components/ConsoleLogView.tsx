import type { ConsoleEntry } from '../shared/types.js';

function levelColor(level: string): string {
  if (level === 'error') return '#ef4444';
  if (level === 'warning' || level === 'warn') return '#eab308';
  if (level === 'info') return '#3b82f6';
  return 'inherit';
}

interface ConsoleLogViewProps {
  entries: ConsoleEntry[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function ConsoleLogView({ entries, scrollRef }: Readonly<ConsoleLogViewProps>) {
  return (
    <div ref={scrollRef} style={{ maxHeight: '500px', overflow: 'auto', fontFamily: 'monospace', fontSize: '12px', background: 'var(--muted, #1e1e1e)', borderRadius: '6px', padding: '8px' }}>
      {entries.length === 0 ? (
        <div style={{ color: 'var(--muted-foreground, #94a3b8)', padding: '16px', textAlign: 'center' }}>
          No console messages yet
        </div>
      ) : entries.map((entry, i) => (
        <div key={i} style={{ padding: '2px 4px', borderBottom: '1px solid var(--border, #333)', color: levelColor(entry.level) }}>
          <span style={{ color: 'var(--muted-foreground, #94a3b8)', marginRight: '8px' }}>
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
          <span style={{ marginRight: '8px', fontWeight: 600 }}>[{entry.level.toUpperCase()}]</span>
          <span>{entry.text}</span>
        </div>
      ))}
    </div>
  );
}
