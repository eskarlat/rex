import { useState, useEffect, useRef } from 'react';

import { CdpClient } from '../lib/cdp-client.js';

export function useCdpConnection(cdpUrl: string | null) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<CdpClient | null>(null);

  useEffect(() => {
    if (!cdpUrl) {
      clientRef.current?.close();
      clientRef.current = null;
      setConnected(false);
      return;
    }

    const client = new CdpClient();
    clientRef.current = client;

    client
      .connect(cdpUrl)
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    return () => {
      client.close();
      clientRef.current = null;
      setConnected(false);
    };
  }, [cdpUrl]);

  return { client: clientRef.current, connected };
}
