import { useState } from 'react';
import { Button, Input } from '@renre-kit/extension-sdk/components';

interface EmptyStateProps {
  onLaunch: (url: string) => void;
  loading: boolean;
}

export function BrowserEmptyState({ onLaunch, loading }: Readonly<EmptyStateProps>) {
  const [url, setUrl] = useState('https://');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onLaunch(url.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 p-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium">No browser session</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a URL to launch a headless browser
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 font-mono text-sm"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? 'Launching...' : 'Launch'}
        </Button>
      </form>
    </div>
  );
}
