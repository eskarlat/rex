import { Outlet } from 'react-router-dom';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/features/navigation/Sidebar';
import { Toolbar } from '@/features/navigation/Toolbar';
import { Toaster } from '@/core/components/Toaster';
import { TerminalProvider } from '@/features/terminal/use-terminal';
import { TerminalDrawer } from '@/features/terminal/TerminalDrawer';

export function DashboardLayout() {
  return (
    <TerminalProvider>
      <SidebarProvider defaultOpen={true} className="!h-svh !max-h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset>
          <Toolbar />
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </SidebarInset>
        <TerminalDrawer />
        <Toaster />
      </SidebarProvider>
    </TerminalProvider>
  );
}
