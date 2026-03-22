import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@renre-kit/extension-sdk/components';

import type { ConsoleEntry } from '../hooks/useConsole.js';
import type { NetworkEntry } from '../hooks/useNetwork.js';
import type { ErrorEntry } from '../hooks/useErrors.js';
import type { SelectedElement } from '../hooks/useDevMode.js';

import { ConsolePanel } from './ConsolePanel.js';
import { NetworkPanel } from './NetworkPanel.js';
import { ErrorsPanel } from './ErrorsPanel.js';
import { ElementsPanel } from './ElementsPanel.js';

interface DebugDrawerProps {
  logs: ConsoleEntry[];
  requests: NetworkEntry[];
  errors: ErrorEntry[];
  selectedElement: SelectedElement | null;
  onClearConsole: () => void;
  onClearNetwork: () => void;
  onClearErrors: () => void;
  onClose: () => void;
}

export function DebugDrawer({
  logs,
  requests,
  errors,
  selectedElement,
  onClearConsole,
  onClearNetwork,
  onClearErrors,
  onClose,
}: Readonly<DebugDrawerProps>) {
  const [activeTab, setActiveTab] = useState('console');

  return (
    <div className="border-t bg-background" style={{ height: '30%', minHeight: 120 }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b px-2">
          <TabsList className="bg-transparent h-8">
            <TabsTrigger value="console" className="text-xs h-7 px-2">
              Console {logs.length > 0 && `(${logs.length})`}
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs h-7 px-2">
              Network {requests.length > 0 && `(${requests.length})`}
            </TabsTrigger>
            <TabsTrigger value="errors" className="text-xs h-7 px-2">
              Errors {errors.length > 0 && `(${errors.length})`}
            </TabsTrigger>
            <TabsTrigger value="elements" className="text-xs h-7 px-2">
              Elements
            </TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0" aria-label="Close debug drawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <TabsContent value="console" className="flex-1 mt-0 overflow-hidden">
          <ConsolePanel logs={logs} onClear={onClearConsole} />
        </TabsContent>
        <TabsContent value="network" className="flex-1 mt-0 overflow-hidden">
          <NetworkPanel requests={requests} onClear={onClearNetwork} />
        </TabsContent>
        <TabsContent value="errors" className="flex-1 mt-0 overflow-hidden">
          <ErrorsPanel errors={errors} onClear={onClearErrors} />
        </TabsContent>
        <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
          <ElementsPanel element={selectedElement} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
