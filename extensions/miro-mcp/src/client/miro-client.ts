import { MiroBaseClient } from './base-client.js';

export class MiroClient extends MiroBaseClient {
  // ── Boards ──────────────────────────────────────────────────────────
  listBoards(query?: Record<string, unknown>): Promise<unknown> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    return this.request('GET', `/boards${params}`);
  }

  createBoard(data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/boards', data);
  }

  getBoard(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}`);
  }

  updateBoard(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}`, data);
  }

  deleteBoard(boardId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}`);
  }

  copyBoard(boardId: string, data?: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/boards/${boardId}/copy`, data);
  }

  // ── Items (generic) ────────────────────────────────────────────────
  getItems(boardId: string, query?: Record<string, unknown>): Promise<unknown> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    return this.request('GET', `/boards/${boardId}/items${params}`);
  }

  getItem(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/items/${itemId}`);
  }

  updateItemPosition(
    boardId: string,
    itemId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/items/${itemId}`, data);
  }

  deleteItem(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/items/${itemId}`);
  }

  // ── Bulk ────────────────────────────────────────────────────────────
  createItemsInBulk(boardId: string, items: unknown[]): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/items/bulk`, items);
  }

  createItemsInBulkUsingFile(boardId: string, formData: FormData): Promise<unknown> {
    return this.requestMultipart('POST', `/boards/${boardId}/items/bulk/file`, formData);
  }

  // ── App Cards ───────────────────────────────────────────────────────
  createAppCard(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/app_cards`, data);
  }

  getAppCard(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/app_cards/${itemId}`);
  }

  updateAppCard(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/app_cards/${itemId}`, data);
  }

  deleteAppCard(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/app_cards/${itemId}`);
  }

  // ── Cards ───────────────────────────────────────────────────────────
  createCard(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/cards`, data);
  }

  getCard(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/cards/${itemId}`);
  }

  updateCard(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/cards/${itemId}`, data);
  }

  deleteCard(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/cards/${itemId}`);
  }

  // ── Connectors ──────────────────────────────────────────────────────
  listConnectors(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/connectors`);
  }

  createConnector(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/connectors`, data);
  }

  getConnector(boardId: string, connectorId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/connectors/${connectorId}`);
  }

  updateConnector(
    boardId: string,
    connectorId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/connectors/${connectorId}`, data);
  }

  deleteConnector(boardId: string, connectorId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/connectors/${connectorId}`);
  }

  // ── Sticky Notes ────────────────────────────────────────────────────
  createStickyNote(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/sticky_notes`, data);
  }

  getStickyNote(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/sticky_notes/${itemId}`);
  }

  updateStickyNote(
    boardId: string,
    itemId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/sticky_notes/${itemId}`, data);
  }

  deleteStickyNote(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/sticky_notes/${itemId}`);
  }

  // ── Frames ──────────────────────────────────────────────────────────
  createFrame(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/frames`, data);
  }

  getFrame(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/frames/${itemId}`);
  }

  updateFrame(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/frames/${itemId}`, data);
  }

  deleteFrame(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/frames/${itemId}`);
  }

  // ── Documents ───────────────────────────────────────────────────────
  createDocument(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/documents`, data);
  }

  getDocument(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/documents/${itemId}`);
  }

  updateDocument(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/documents/${itemId}`, data);
  }

  deleteDocument(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/documents/${itemId}`);
  }

  // ── Text ────────────────────────────────────────────────────────────
  createText(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/texts`, data);
  }

  getText(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/texts/${itemId}`);
  }

  updateText(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/texts/${itemId}`, data);
  }

  deleteText(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/texts/${itemId}`);
  }

  // ── Images ──────────────────────────────────────────────────────────
  createImageFromUrl(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/images`, data);
  }

  createImageFromFile(boardId: string, formData: FormData): Promise<unknown> {
    return this.requestMultipart('POST', `/boards/${boardId}/images`, formData);
  }

  getImage(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/images/${itemId}`);
  }

  updateImage(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/images/${itemId}`, data);
  }

  updateImageFromFile(boardId: string, itemId: string, formData: FormData): Promise<unknown> {
    return this.requestMultipart('PATCH', `/boards/${boardId}/images/${itemId}`, formData);
  }

  deleteImage(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/images/${itemId}`);
  }

  listImagesByBoard(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/images`);
  }

  // ── Shapes ──────────────────────────────────────────────────────────
  createShape(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/shapes`, data);
  }

  getShape(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/shapes/${itemId}`);
  }

  updateShape(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/shapes/${itemId}`, data);
  }

  deleteShape(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/shapes/${itemId}`);
  }

  // ── Embeds ──────────────────────────────────────────────────────────
  createEmbed(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/embeds`, data);
  }

  getEmbed(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/embeds/${itemId}`);
  }

  updateEmbed(boardId: string, itemId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/embeds/${itemId}`, data);
  }

  deleteEmbed(boardId: string, itemId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/embeds/${itemId}`);
  }

  // ── Tags ────────────────────────────────────────────────────────────
  listTags(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/tags`);
  }

  createTag(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/tags`, data);
  }

  getTag(boardId: string, tagId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/tags/${tagId}`);
  }

  updateTag(boardId: string, tagId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/tags/${tagId}`, data);
  }

  deleteTag(boardId: string, tagId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/tags/${tagId}`);
  }

  attachTag(boardId: string, itemId: string, tagId: string): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/items/${itemId}/tags/${tagId}`);
  }

  detachTag(boardId: string, itemId: string, tagId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/items/${itemId}/tags/${tagId}`);
  }

  getItemTags(boardId: string, itemId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/items/${itemId}/tags`);
  }

  // ── Members ─────────────────────────────────────────────────────────
  listBoardMembers(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/members`);
  }

  getBoardMember(boardId: string, memberId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/members/${memberId}`);
  }

  updateBoardMember(
    boardId: string,
    memberId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/members/${memberId}`, data);
  }

  removeBoardMember(boardId: string, memberId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/members/${memberId}`);
  }

  shareBoard(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/members`, data);
  }

  // ── Groups ──────────────────────────────────────────────────────────
  listGroups(boardId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/groups`);
  }

  getGroup(boardId: string, groupId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/groups/${groupId}`);
  }

  createGroup(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/groups`, data);
  }

  updateGroup(boardId: string, groupId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/groups/${groupId}`, data);
  }

  deleteGroup(boardId: string, groupId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/groups/${groupId}`);
  }

  getGroupItems(boardId: string, groupId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/groups/${groupId}/items`);
  }

  ungroupItems(boardId: string, groupId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/groups/${groupId}/items`);
  }

  // ── Mindmaps ────────────────────────────────────────────────────────
  createMindmapNode(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/mindmap_nodes`, data);
  }

  getMindmapNode(boardId: string, nodeId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/mindmap_nodes/${nodeId}`);
  }

  updateMindmapNode(
    boardId: string,
    nodeId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/boards/${boardId}/mindmap_nodes/${nodeId}`, data);
  }

  deleteMindmapNode(boardId: string, nodeId: string): Promise<unknown> {
    return this.request('DELETE', `/boards/${boardId}/mindmap_nodes/${nodeId}`);
  }

  // ── Projects ────────────────────────────────────────────────────────
  listProjectMembers(orgId: string, projectId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/projects/${projectId}/members`);
  }

  getProjectMember(orgId: string, projectId: string, memberId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/projects/${projectId}/members/${memberId}`);
  }

  updateProjectMember(
    orgId: string,
    projectId: string,
    memberId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/orgs/${orgId}/projects/${projectId}/members/${memberId}`, data);
  }

  // ── Exports ─────────────────────────────────────────────────────────
  createExportJob(boardId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/boards/${boardId}/export`, data);
  }

  getExportJobStatus(boardId: string, jobId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/export/${jobId}`);
  }

  getExportJobResults(boardId: string, jobId: string): Promise<unknown> {
    return this.request('GET', `/boards/${boardId}/export/${jobId}/results`);
  }

  // ── Compliance ──────────────────────────────────────────────────────
  listComplianceCases(orgId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/compliance/cases`);
  }

  getComplianceCase(orgId: string, caseId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/compliance/cases/${caseId}`);
  }

  createComplianceCase(orgId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/orgs/${orgId}/compliance/cases`, data);
  }

  updateComplianceCase(
    orgId: string,
    caseId: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request('PATCH', `/orgs/${orgId}/compliance/cases/${caseId}`, data);
  }

  listLegalHolds(orgId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/compliance/legal-holds`);
  }

  createLegalHold(orgId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/orgs/${orgId}/compliance/legal-holds`, data);
  }

  getContentLogs(orgId: string, query?: Record<string, unknown>): Promise<unknown> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    return this.request('GET', `/orgs/${orgId}/compliance/content-logs${params}`);
  }

  getContentClassification(orgId: string, boardId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/compliance/boards/${boardId}/classification`);
  }

  // ── Organization ────────────────────────────────────────────────────
  getOrganization(orgId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}`);
  }

  listOrgMembers(orgId: string, query?: Record<string, unknown>): Promise<unknown> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    return this.request('GET', `/orgs/${orgId}/members${params}`);
  }

  getOrgMember(orgId: string, memberId: string): Promise<unknown> {
    return this.request('GET', `/orgs/${orgId}/members/${memberId}`);
  }

  getAuditLogs(orgId: string, query?: Record<string, unknown>): Promise<unknown> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : '';
    return this.request('GET', `/orgs/${orgId}/audit-logs${params}`);
  }
}
