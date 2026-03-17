import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryProvider } from '@/core/providers/QueryProvider';
import { ProjectProvider } from '@/core/providers/ProjectProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/core/layouts/DashboardLayout';
import { SettingsLayout } from '@/core/layouts/SettingsLayout';
import { HomePage } from '@/features/home/HomePage';
import { MarketplacePage } from '@/features/marketplace/MarketplacePage';
import { VaultPage } from '@/features/vault/VaultPage';
import { ScheduledTasksPage } from '@/features/scheduler/ScheduledTasksPage';
import { ExtensionPanelPage } from '@/features/extensions/ExtensionPanelPage';
import { GeneralPage } from '@/features/settings/GeneralPage';
import { RegistriesPage } from '@/features/settings/RegistriesPage';
import { VaultSettingsPage } from '@/features/settings/VaultSettingsPage';
import { ExtensionSettingsPage } from '@/features/settings/ExtensionSettingsPage';

export function App() {
  return (
    <QueryProvider>
      <ProjectProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/vault" element={<VaultPage />} />
                <Route path="/scheduler" element={<ScheduledTasksPage />} />
                <Route
                  path="/extensions/:name"
                  element={<ExtensionPanelPage />}
                />
                <Route path="/settings" element={<SettingsLayout />}>
                  <Route index element={<GeneralPage />} />
                  <Route path="registries" element={<RegistriesPage />} />
                  <Route path="vault" element={<VaultSettingsPage />} />
                  <Route
                    path="extensions/:name"
                    element={<ExtensionSettingsPage />}
                  />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </QueryProvider>
  );
}
