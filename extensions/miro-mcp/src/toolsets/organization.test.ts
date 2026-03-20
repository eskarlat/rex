import { describe, it, expect, vi } from 'vitest';
import { createOrganizationToolset } from './organization.js';
import type { MiroClient } from '../client/miro-client.js';

describe('createOrganizationToolset', () => {
  function createMockClient(): MiroClient {
    return {
      getOrganization: vi.fn().mockResolvedValue({ id: 'o1', name: 'Acme' }),
      listOrgMembers: vi.fn().mockResolvedValue([{ id: 'm1' }]),
      getOrgMember: vi.fn().mockResolvedValue({ id: 'm1' }),
      getAuditLogs: vi.fn().mockResolvedValue([{ event: 'login' }]),
    } as unknown as MiroClient;
  }

  it('creates 4 tools', () => {
    const toolset = createOrganizationToolset(createMockClient());
    expect(toolset.tools).toHaveLength(4);
    expect(toolset.name).toBe('miro_organization');
  });

  it('get organization handler calls client', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_get_organization']!({ orgId: 'o1' });
    expect(client.getOrganization).toHaveBeenCalledWith('o1');
  });

  it('list org members handler calls client with optional query', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_list_org_members']!({ orgId: 'o1', query: { limit: '5' } });
    expect(client.listOrgMembers).toHaveBeenCalledWith('o1', { limit: '5' });
  });

  it('list org members handler calls client without query', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_list_org_members']!({ orgId: 'o1' });
    expect(client.listOrgMembers).toHaveBeenCalledWith('o1', undefined);
  });

  it('get org member handler calls client', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_get_org_member']!({ orgId: 'o1', memberId: 'm1' });
    expect(client.getOrgMember).toHaveBeenCalledWith('o1', 'm1');
  });

  it('get audit logs handler calls client with optional query', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_get_audit_logs']!({ orgId: 'o1', query: { from: '2024-01-01' } });
    expect(client.getAuditLogs).toHaveBeenCalledWith('o1', { from: '2024-01-01' });
  });

  it('get audit logs handler calls client without query', async () => {
    const client = createMockClient();
    const toolset = createOrganizationToolset(client);
    await toolset.handlers['miro_get_audit_logs']!({ orgId: 'o1' });
    expect(client.getAuditLogs).toHaveBeenCalledWith('o1', undefined);
  });

  it('returns error result on failure', async () => {
    const client = createMockClient();
    (client.getOrganization as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Not found'),
    );
    const toolset = createOrganizationToolset(client);
    const result = await toolset.handlers['miro_get_organization']!({ orgId: 'bad' });
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toBe('Not found');
  });
});
