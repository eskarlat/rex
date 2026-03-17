import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/features/navigation/Sidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
