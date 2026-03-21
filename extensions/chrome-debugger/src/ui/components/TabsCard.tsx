import {
  Card, CardHeader, CardTitle, CardContent,
  Button,
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@renre-kit/extension-sdk/components';

import type { TabInfo } from '../shared/types.js';

interface TabsCardProps {
  tabs: TabInfo[];
  onSwitchTab: (index: number) => void;
}

export function TabsCard({ tabs, onSwitchTab }: Readonly<TabsCardProps>) {
  return (
    <Card>
      <CardHeader><CardTitle>Open Tabs ({tabs.length})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: '48px' }}>#</TableHead>
              <TableHead>URL</TableHead>
              <TableHead style={{ width: '80px' }}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabs.map((tab) => (
              <TableRow key={tab.index}>
                <TableCell>{tab.index}</TableCell>
                <TableCell style={{ fontSize: '13px', wordBreak: 'break-all' }}>{tab.url}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onSwitchTab(tab.index)}>Switch</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
