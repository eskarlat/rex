import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryProvider } from '@/core/providers/QueryProvider';
import { ProjectProvider } from '@/core/providers/ProjectProvider';
import { ThemeProvider } from '@/core/providers/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/core/layouts/DashboardLayout';
import { SettingsLayout } from '@/core/layouts/SettingsLayout';
import { HomePage } from '@/features/home/HomePage';
import { MarketplacePage } from '@/features/marketplace/MarketplacePage';
import { ScheduledTasksPage } from '@/features/scheduler/ScheduledTasksPage';
import { ExtensionPanelPage } from '@/features/extensions/ExtensionPanelPage';
import { GeneralPage } from '@/features/settings/GeneralPage';
import { RegistriesPage } from '@/features/settings/RegistriesPage';
import { VaultSettingsPage } from '@/features/settings/VaultSettingsPage';
import { ExtensionSettingsPage } from '@/features/settings/ExtensionSettingsPage';
import { LogsPage } from '@/features/logs/LogsPage';
import { AuthGate } from '@/features/auth/AuthGate';

export function App() {
  return (
    <QueryProvider>
      <AuthGate>
        <ProjectProvider>
          <ThemeProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/scheduler" element={<ScheduledTasksPage />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="/extensions/:name" element={<ExtensionPanelPage />} />
                    <Route path="/extensions/:name/:panelId" element={<ExtensionPanelPage />} />
                    <Route path="/settings" element={<SettingsLayout />}>
                      <Route index element={<GeneralPage />} />
                      <Route path="registries" element={<RegistriesPage />} />
                      <Route path="vault" element={<VaultSettingsPage />} />
                      <Route path="extensions/:name" element={<ExtensionSettingsPage />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </ProjectProvider>
      </AuthGate>
    </QueryProvider>
  );
}
