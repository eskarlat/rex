import { Check, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useProjects, useSetActiveProject } from '@/core/hooks/use-projects';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import logoSvg from '@/assets/logo.svg';

export function ProjectSwitcher() {
  const { data: projects, isLoading } = useProjects();
  const { activeProject, setActiveProject } = useProjectContext();
  const setActive = useSetActiveProject();
  const { isMobile } = useSidebar();

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  const currentName = projects?.find((p) => p.path === activeProject)?.name ?? 'Select project';

  function handleChange(value: string) {
    setActiveProject(value);
    setActive.mutate(value);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Select project"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <img src={logoSvg} alt="RenreKit" className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">RenreKit</span>
                <span className="truncate text-xs">{currentName}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            {projects?.map((project) => (
              <DropdownMenuItem
                key={project.path}
                onClick={() => handleChange(project.path)}
                className="gap-2 p-2"
              >
                <Check
                  className={cn(
                    'h-4 w-4',
                    activeProject === project.path ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span>{project.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
