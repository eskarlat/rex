import { useState, useEffect } from 'react';
import { Button, Input, Separator, Switch } from '@renre-kit/extension-sdk/components';

interface AddressBarProps {
  url: string | null;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  devMode: boolean;
  onDevModeToggle: () => void;
}

export function AddressBar({
  url,
  onNavigate,
  onBack,
  onForward,
  onReload,
  devMode,
  onDevModeToggle,
}: Readonly<AddressBarProps>) {
  const [inputValue, setInputValue] = useState(url ?? '');

  useEffect(() => {
    if (url) setInputValue(url);
  }, [url]);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (inputValue.trim()) onNavigate(inputValue.trim());
  };

  const isHttps = url?.startsWith('https://') ?? false;

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/20">
      <div className="flex items-center gap-0.5">
        <NavButton onClick={onBack} title="Back" icon="M15 18l-6-6 6-6" />
        <NavButton onClick={onForward} title="Forward" icon="M9 18l6-6-6-6" />
        <NavButton onClick={onReload} title="Reload" icon="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 1 0 21 12" />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1">
        <span className="text-muted-foreground flex-shrink-0">
          {isHttps ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          )}
        </span>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-7 text-xs font-mono border-0 bg-transparent focus-visible:ring-0 shadow-none"
          placeholder="Enter URL..."
        />
      </form>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="text-xs text-muted-foreground">Dev</span>
          <Switch checked={devMode} onCheckedChange={onDevModeToggle} className="scale-75" />
        </div>
      </div>
    </div>
  );
}

function NavButton({ onClick, title, icon }: Readonly<{ onClick: () => void; title: string; icon: string }>) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} title={title} className="h-7 w-7 p-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
    </Button>
  );
}
