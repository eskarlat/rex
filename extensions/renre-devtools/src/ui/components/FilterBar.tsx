import { Button } from '@renre-kit/extension-sdk/components';

interface FilterBarProps {
  options: string[];
  active: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterBar({ options, active, onSelect }: Readonly<FilterBarProps>) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
      {options.map((opt) => {
        const isActive = (active === null && opt === 'all') || active === opt;
        return (
          <Button
            key={opt} size="sm"
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSelect(opt === 'all' ? null : opt)}
          >
            {opt}
          </Button>
        );
      })}
    </div>
  );
}
