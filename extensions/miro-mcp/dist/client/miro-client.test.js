// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MiroClient } from './miro-client.js';
describe('MiroClient', () => {
  let client;
  beforeEach(() => {
    client = new MiroClient({ accessToken: 'test-token' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: '1' }), { status: 200 }),
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  // ── Boards ──────────────────────────────────────────────────────────
  it('listBoards sends GET /boards', async () => {
    await client.listBoards();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('listBoards passes query params', async () => {
    await client.listBoards({ limit: '10' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards?limit=10',
      expect.any(Object),
    );
  });
  it('createBoard sends POST /boards', async () => {
    await client.createBoard({ name: 'Test' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Test' }) }),
    );
  });
  it('getBoard sends GET /boards/:id', async () => {
    await client.getBoard('b1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('updateBoard sends PATCH /boards/:id', async () => {
    await client.updateBoard('b1', { name: 'Updated' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
  it('deleteBoard sends DELETE /boards/:id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await client.deleteBoard('b1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
  it('copyBoard sends PUT /boards/:id/copy', async () => {
    await client.copyBoard('b1', { name: 'Copy' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/copy',
      expect.objectContaining({ method: 'PUT' }),
    );
  });
  // ── Items ───────────────────────────────────────────────────────────
  it('getItems sends GET /boards/:id/items', async () => {
    await client.getItems('b1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('getItem sends GET /boards/:id/items/:itemId', async () => {
    await client.getItem('b1', 'i1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items/i1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('updateItemPosition sends PATCH', async () => {
    await client.updateItemPosition('b1', 'i1', { position: { x: 0, y: 0 } });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items/i1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
  it('deleteItem sends DELETE', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await client.deleteItem('b1', 'i1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items/i1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
  // ── Sticky Notes ────────────────────────────────────────────────────
  it('createStickyNote sends POST', async () => {
    await client.createStickyNote('b1', { data: { content: 'Hi' } });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/sticky_notes',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  it('getStickyNote sends GET', async () => {
    await client.getStickyNote('b1', 's1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/sticky_notes/s1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  // ── Connectors ──────────────────────────────────────────────────────
  it('listConnectors sends GET', async () => {
    await client.listConnectors('b1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/connectors',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('createConnector sends POST', async () => {
    await client.createConnector('b1', { startItem: { id: 'i1' } });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/connectors',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  // ── Tags ────────────────────────────────────────────────────────────
  it('createTag sends POST', async () => {
    await client.createTag('b1', { title: 'Important' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/tags',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  it('attachTag sends POST to items/:id/tags/:tagId', async () => {
    await client.attachTag('b1', 'i1', 't1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items/i1/tags/t1',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  it('detachTag sends DELETE to items/:id/tags/:tagId', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await client.detachTag('b1', 'i1', 't1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/items/i1/tags/t1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
  // ── Members ─────────────────────────────────────────────────────────
  it('shareBoard sends POST to /members', async () => {
    await client.shareBoard('b1', { emails: ['a@b.com'] });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/members',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  // ── Groups ──────────────────────────────────────────────────────────
  it('ungroupItems sends DELETE to groups/:id/items', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await client.ungroupItems('b1', 'g1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/groups/g1/items',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
  // ── Mindmaps ────────────────────────────────────────────────────────
  it('createMindmapNode sends POST', async () => {
    await client.createMindmapNode('b1', { nodeView: { content: 'Root' } });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/mindmap_nodes',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  // ── Exports ─────────────────────────────────────────────────────────
  it('createExportJob sends POST', async () => {
    await client.createExportJob('b1', { format: 'pdf' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/export',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  it('getExportJobStatus sends GET', async () => {
    await client.getExportJobStatus('b1', 'j1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/boards/b1/export/j1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  // ── Compliance ──────────────────────────────────────────────────────
  it('listComplianceCases sends GET', async () => {
    await client.listComplianceCases('org1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/orgs/org1/compliance/cases',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('createLegalHold sends POST', async () => {
    await client.createLegalHold('org1', { name: 'Hold 1' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/orgs/org1/compliance/legal-holds',
      expect.objectContaining({ method: 'POST' }),
    );
  });
  // ── Organization ────────────────────────────────────────────────────
  it('getOrganization sends GET', async () => {
    await client.getOrganization('org1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/orgs/org1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  it('getAuditLogs sends GET with query params', async () => {
    await client.getAuditLogs('org1', { from: '2026-01-01' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/orgs/org1/audit-logs?from=2026-01-01',
      expect.objectContaining({ method: 'GET' }),
    );
  });
  // ── Projects ────────────────────────────────────────────────────────
  it('listProjectMembers sends GET', async () => {
    await client.listProjectMembers('org1', 'p1');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.miro.com/v2/orgs/org1/projects/p1/members',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
