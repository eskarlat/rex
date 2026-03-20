import { describe, it, expect, vi } from 'vitest';
import { createProjectsToolset } from './projects.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createProjectsToolset', () => {
  function createMockClient(): MiroClient {
    return {
      listProjectMembers: vi.fn().mockResolvedValue([{ id: 'm1' }]),
      getProjectMember: vi.fn().mockResolvedValue({ id: 'm1' }),
      updateProjectMember: vi.fn().mockResolvedValue({ id: 'm1' }),
    } as unknown as MiroClient;
  }

  it('creates 3 tools', () => {
    const toolset = createProjectsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(3);
    expect(toolset.name).toBe('miro_projects');
  });

  it('list project members handler calls client', async () => {
    const client = createMockClient();
    const toolset = createProjectsToolset(client);
    await toolset.handlers['miro_list_project_members']!({ orgId: 'o1', projectId: 'p1' });
    expect(client.listProjectMembers).toHaveBeenCalledWith('o1', 'p1');
  });

  it('get project member handler calls client', async () => {
    const client = createMockClient();
    const toolset = createProjectsToolset(client);
    await toolset.handlers['miro_get_project_member']!({
      orgId: 'o1',
      projectId: 'p1',
      memberId: 'm1',
    });
    expect(client.getProjectMember).toHaveBeenCalledWith('o1', 'p1', 'm1');
  });

  it('update project member handler calls client', async () => {
    const client = createMockClient();
    const toolset = createProjectsToolset(client);
    await toolset.handlers['miro_update_project_member']!({
      orgId: 'o1',
      projectId: 'p1',
      memberId: 'm1',
      data: { role: 'admin' },
    });
    expect(client.updateProjectMember).toHaveBeenCalledWith('o1', 'p1', 'm1', { role: 'admin' });
  });

  it('returns error result on failure', async () => {
    const client = createMockClient();
    (client.listProjectMembers as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Forbidden'),
    );
    const toolset = createProjectsToolset(client);
    const result = await toolset.handlers['miro_list_project_members']!({
      orgId: 'o1',
      projectId: 'p1',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('Forbidden');
  });
});
