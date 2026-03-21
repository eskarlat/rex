import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { setActiveProjectPath } from '@/core/api/client';

const STORAGE_KEY = 'renre-kit-active-project';

interface ProjectContextValue {
  activeProject: string | null;
  setActiveProject: (path: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  activeProject: null,
  setActiveProject: () => undefined,
});

interface ProjectProviderProps {
  children: ReactNode;
}

function readStoredProject(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Set the header synchronously on module load so the first API call includes it
setActiveProjectPath(readStoredProject());

export function ProjectProvider({ children }: Readonly<ProjectProviderProps>): React.ReactElement {
  const [projectPath, setProjectPath] = useState<string | null>(readStoredProject);

  const handleSetActiveProject = useCallback((path: string | null): void => {
    setProjectPath(path);
    setActiveProjectPath(path);
    try {
      if (path) {
        localStorage.setItem(STORAGE_KEY, path);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* localStorage may not be available */
    }
  }, []);

  const value = useMemo(
    () => ({ activeProject: projectPath, setActiveProject: handleSetActiveProject }),
    [projectPath, handleSetActiveProject],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): ProjectContextValue {
  return useContext(ProjectContext);
}
