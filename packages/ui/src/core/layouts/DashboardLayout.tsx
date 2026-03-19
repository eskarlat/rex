import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/features/navigation/Sidebar';
import { Toolbar } from '@/features/navigation/Toolbar';
import { Toaster } from '@/core/components/Toaster';
import { MobileSidebarProvider, useMobileSidebar } from '@/core/providers/MobileSidebarProvider';

function MobileOverlay() {
  const { isOpen, close } = useMobileSidebar();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 md:hidden"
      onClick={close}
      aria-hidden="true"
    />
  );
}

function DashboardContent() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MobileOverlay />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <MobileSidebarProvider>
      <DashboardContent />
    </MobileSidebarProvider>
  );
}
