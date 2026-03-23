import { useEffect, useRef } from 'react';

interface InlineInputProps {
  defaultValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  depth: number;
}

export function InlineInput({
  defaultValue,
  onSubmit,
  onCancel,
  depth,
}: Readonly<InlineInputProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = inputRef.current?.value.trim();
      if (value) onSubmit(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={{ paddingLeft: `${depth * 16 + 8}px`, height: '28px' }} className="flex items-center">
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className="h-6 w-full bg-background border border-primary rounded px-1 text-sm focus:outline-none"
      />
    </div>
  );
}
