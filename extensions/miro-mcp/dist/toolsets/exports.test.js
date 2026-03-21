import { describe, it, expect, vi } from 'vitest';
import { createExportsToolset } from './exports.js';
describe('createExportsToolset', () => {
  function createMockClient() {
    return {
      createExportJob: vi.fn().mockResolvedValue({ jobId: 'j1', status: 'pending' }),
      getExportJobStatus: vi.fn().mockResolvedValue({ jobId: 'j1', status: 'completed' }),
      getExportJobResults: vi.fn().mockResolvedValue({ url: 'https://example.com/export.pdf' }),
    };
  }
  it('creates 3 tools', () => {
    const toolset = createExportsToolset(createMockClient());
    expect(toolset.tools).toHaveLength(3);
    expect(toolset.name).toBe('miro_exports');
  });
  it('create export job handler calls client', async () => {
    const client = createMockClient();
    const toolset = createExportsToolset(client);
    await toolset.handlers['miro_create_export_job']({
      boardId: 'b1',
      data: { format: 'pdf' },
    });
    expect(client.createExportJob).toHaveBeenCalledWith('b1', { format: 'pdf' });
  });
  it('get export job status handler calls client', async () => {
    const client = createMockClient();
    const toolset = createExportsToolset(client);
    await toolset.handlers['miro_get_export_job_status']({ boardId: 'b1', jobId: 'j1' });
    expect(client.getExportJobStatus).toHaveBeenCalledWith('b1', 'j1');
  });
  it('get export job results handler calls client', async () => {
    const client = createMockClient();
    const toolset = createExportsToolset(client);
    await toolset.handlers['miro_get_export_job_results']({ boardId: 'b1', jobId: 'j1' });
    expect(client.getExportJobResults).toHaveBeenCalledWith('b1', 'j1');
  });
  it('returns error result on failure', async () => {
    const client = createMockClient();
    client.createExportJob.mockRejectedValue(new Error('Export failed'));
    const toolset = createExportsToolset(client);
    const result = await toolset.handlers['miro_create_export_job']({
      boardId: 'b1',
      data: { format: 'pdf' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Export failed');
  });
});
