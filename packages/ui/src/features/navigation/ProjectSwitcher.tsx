import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects, useSetActiveProject } from '@/core/hooks/use-projects';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectSwitcher() {
  const { data: projects, isLoading } = useProjects();
  const { activeProject, setActiveProject } = useProjectContext();
  const setActive = useSetActiveProject();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  function handleChange(value: string) {
    setActiveProject(value);
    setActive.mutate(value);
  }

  return (
    <Select value={activeProject ?? ''} onValueChange={handleChange}>
      <SelectTrigger className="w-full" aria-label="Select project">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects?.map((project) => (
          <SelectItem key={project.path} value={project.path}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
