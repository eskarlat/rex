import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const { mockSetActiveProjectPath } = vi.hoisted(() => ({
  mockSetActiveProjectPath: vi.fn(),
}));

vi.mock('@/core/api/client', () => ({
  setActiveProjectPath: (...args: unknown[]) => mockSetActiveProjectPath(...args),
}));

import { ProjectProvider, useProjectContext } from './ProjectProvider';

function TestConsumer() {
  const { activeProject, setActiveProject } = useProjectContext();
  return (
    <div>
      <span data-testid="project">{activeProject ?? 'none'}</span>
      <button onClick={() => setActiveProject('/new/path')}>set</button>
      <button onClick={() => setActiveProject(null)}>clear</button>
    </div>
  );
}

describe('ProjectProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetActiveProjectPath.mockClear();
  });

  it('renders children', () => {
    render(
      <ProjectProvider>
        <span>child content</span>
      </ProjectProvider>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('reads initial value from localStorage', () => {
    localStorage.setItem('renre-kit-active-project', '/stored/path');
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    expect(screen.getByTestId('project').textContent).toBe('/stored/path');
  });

  it('setActiveProject updates context and localStorage', () => {
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    act(() => {
      screen.getByText('set').click();
    });
    expect(screen.getByTestId('project').textContent).toBe('/new/path');
    expect(localStorage.getItem('renre-kit-active-project')).toBe('/new/path');
  });

  it('setActiveProject(null) removes from localStorage', () => {
    localStorage.setItem('renre-kit-active-project', '/some/path');
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    act(() => {
      screen.getByText('clear').click();
    });
    expect(screen.getByTestId('project').textContent).toBe('none');
    expect(localStorage.getItem('renre-kit-active-project')).toBeNull();
  });

  it('calls setActiveProjectPath from client module', () => {
    render(
      <ProjectProvider>
        <TestConsumer />
      </ProjectProvider>
    );
    act(() => {
      screen.getByText('set').click();
    });
    expect(mockSetActiveProjectPath).toHaveBeenCalledWith('/new/path');
  });
});

describe('useProjectContext', () => {
  it('returns default values outside provider', () => {
    function Defaults() {
      const { activeProject, setActiveProject } = useProjectContext();
      return (
        <div>
          <span data-testid="default-project">{activeProject ?? 'none'}</span>
          <span data-testid="default-setter">{typeof setActiveProject}</span>
        </div>
      );
    }
    render(<Defaults />);
    expect(screen.getByTestId('default-project').textContent).toBe('none');
    expect(screen.getByTestId('default-setter').textContent).toBe('function');
  });
});
