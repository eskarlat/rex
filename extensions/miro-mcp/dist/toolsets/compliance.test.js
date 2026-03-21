import { describe, it, expect, vi } from 'vitest';
import { createComplianceToolset } from './compliance.js';
describe('createComplianceToolset', () => {
  function createMockClient() {
    return {
      listComplianceCases: vi.fn().mockResolvedValue([{ id: 'c1' }]),
      getComplianceCase: vi.fn().mockResolvedValue({ id: 'c1' }),
      createComplianceCase: vi.fn().mockResolvedValue({ id: 'c2' }),
      updateComplianceCase: vi.fn().mockResolvedValue({ id: 'c1' }),
      listLegalHolds: vi.fn().mockResolvedValue([{ id: 'lh1' }]),
      createLegalHold: vi.fn().mockResolvedValue({ id: 'lh2' }),
      getContentLogs: vi.fn().mockResolvedValue([{ action: 'create' }]),
      getContentClassification: vi.fn().mockResolvedValue({ classification: 'internal' }),
    };
  }
  it('creates 8 tools', () => {
    const toolset = createComplianceToolset(createMockClient());
    expect(toolset.tools).toHaveLength(8);
    expect(toolset.name).toBe('miro_compliance');
  });
  it('list compliance cases handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_list_compliance_cases']({ orgId: 'o1' });
    expect(client.listComplianceCases).toHaveBeenCalledWith('o1');
  });
  it('get compliance case handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_get_compliance_case']({ orgId: 'o1', caseId: 'c1' });
    expect(client.getComplianceCase).toHaveBeenCalledWith('o1', 'c1');
  });
  it('create compliance case handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_create_compliance_case']({
      orgId: 'o1',
      data: { name: 'case1' },
    });
    expect(client.createComplianceCase).toHaveBeenCalledWith('o1', { name: 'case1' });
  });
  it('update compliance case handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_update_compliance_case']({
      orgId: 'o1',
      caseId: 'c1',
      data: { status: 'closed' },
    });
    expect(client.updateComplianceCase).toHaveBeenCalledWith('o1', 'c1', { status: 'closed' });
  });
  it('list legal holds handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_list_legal_holds']({ orgId: 'o1' });
    expect(client.listLegalHolds).toHaveBeenCalledWith('o1');
  });
  it('create legal hold handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_create_legal_hold']({
      orgId: 'o1',
      data: { name: 'hold1' },
    });
    expect(client.createLegalHold).toHaveBeenCalledWith('o1', { name: 'hold1' });
  });
  it('get content logs handler calls client with optional query', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_get_content_logs']({ orgId: 'o1', query: { limit: '10' } });
    expect(client.getContentLogs).toHaveBeenCalledWith('o1', { limit: '10' });
  });
  it('get content logs handler calls client without query', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_get_content_logs']({ orgId: 'o1' });
    expect(client.getContentLogs).toHaveBeenCalledWith('o1', undefined);
  });
  it('get content classification handler calls client', async () => {
    const client = createMockClient();
    const toolset = createComplianceToolset(client);
    await toolset.handlers['miro_get_content_classification']({ orgId: 'o1', boardId: 'b1' });
    expect(client.getContentClassification).toHaveBeenCalledWith('o1', 'b1');
  });
  it('returns error result on failure', async () => {
    const client = createMockClient();
    client.listComplianceCases.mockRejectedValue(new Error('Unauthorized'));
    const toolset = createComplianceToolset(client);
    const result = await toolset.handlers['miro_list_compliance_cases']({ orgId: 'o1' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Unauthorized');
  });
});
