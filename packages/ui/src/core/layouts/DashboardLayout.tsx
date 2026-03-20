import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/features/navigation/Sidebar';
import { Toolbar } from '@/features/navigation/Toolbar';
import { Toaster } from '@/core/components/Toaster';
import { TerminalProvider } from '@/features/terminal/use-terminal';
import { TerminalDrawer } from '@/features/terminal/TerminalDrawer';

export function DashboardLayout() {
  return (
    <TerminalProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Toolbar />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
        <TerminalDrawer />
        <Toaster />
      </div>
    </TerminalProvider>
  );
}
