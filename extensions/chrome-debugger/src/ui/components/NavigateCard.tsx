import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input,
} from '@renre-kit/extension-sdk/components';

interface NavigateCardProps {
  onNavigate: (url: string) => void;
  actionLoading: boolean;
}

export function NavigateCard({ onNavigate, actionLoading }: Readonly<NavigateCardProps>) {
  const [url, setUrl] = useState('');

  const submit = (): void => {
    if (url.trim()) onNavigate(url.trim());
  };

  return (
    <Card>
      <CardHeader><CardTitle>Navigate</CardTitle></CardHeader>
      <CardContent>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            type="text" placeholder="https://example.com" value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter') submit(); }}
            style={{ flex: 1 }}
          />
          <Button onClick={submit} disabled={actionLoading || !url.trim()}>Go</Button>
        </div>
      </CardContent>
    </Card>
  );
}
