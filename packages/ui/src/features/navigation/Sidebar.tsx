import { NavLink, useMatch } from 'react-router-dom';
import { Home, Clock, Settings, Puzzle, ScrollText } from 'lucide-react';
import { ProjectSwitcher } from './ProjectSwitcher';
import { useMarketplace } from '@/core/hooks/use-extensions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navLinks = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/scheduler', icon: Clock, label: 'Scheduler', end: false },
];

const bottomLinks = [
  { to: '/logs', icon: ScrollText, label: 'Logs', end: false },
  { to: '/settings', icon: Settings, label: 'Settings', end: false },
];

interface NavMenuItemProps {
  to: string;
  end: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function NavMenuItem({ to, end, icon: Icon, label }: NavMenuItemProps) {
  const match = useMatch({ path: to, end });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} tooltip={label}>
        <NavLink to={to} end={end}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ExtensionIcon({ name, hasIcon }: { name: string; hasIcon?: boolean }) {
  if (!hasIcon) return <Puzzle className="h-4 w-4 shrink-0" />;

  return (
    <img
      src={`/api/extensions/${encodeURIComponent(name)}/icon`}
      alt=""
      className="h-4 w-4 shrink-0 rounded object-contain"
    />
  );
}

interface ExtensionMenuItemProps {
  name: string;
  title?: string;
  hasIcon?: boolean;
}

function ExtensionMenuItem({ name, title, hasIcon }: ExtensionMenuItemProps) {
  const label = title ?? name;
  const match = useMatch({ path: `/extensions/${name}`, end: false });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} tooltip={label}>
        <NavLink to={`/extensions/${name}`}>
          <ExtensionIcon name={name} hasIcon={hasIcon} />
          <span>{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { data: marketplace } = useMarketplace();
  const activeExtensions = marketplace?.active ?? [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navLinks.map((link) => (
              <NavMenuItem key={link.to} {...link} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {activeExtensions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Extensions</SidebarGroupLabel>
            <SidebarMenu>
              {activeExtensions.map((ext) => (
                <ExtensionMenuItem key={ext.name} {...ext} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarMenu>
          {bottomLinks.map((link) => (
            <NavMenuItem key={link.to} {...link} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
