import { MiroBaseClient } from './base-client.js';
export class MiroClient extends MiroBaseClient {
    // ── Boards ──────────────────────────────────────────────────────────
    listBoards(query) {
        const params = query ? `?${new URLSearchParams(query)}` : '';
        return this.request('GET', `/boards${params}`);
    }
    createBoard(data) {
        return this.request('POST', '/boards', data);
    }
    getBoard(boardId) {
        return this.request('GET', `/boards/${boardId}`);
    }
    updateBoard(boardId, data) {
        return this.request('PATCH', `/boards/${boardId}`, data);
    }
    deleteBoard(boardId) {
        return this.request('DELETE', `/boards/${boardId}`);
    }
    copyBoard(boardId, data) {
        return this.request('PUT', `/boards/${boardId}/copy`, data);
    }
    // ── Items (generic) ────────────────────────────────────────────────
    getItems(boardId, query) {
        const params = query ? `?${new URLSearchParams(query)}` : '';
        return this.request('GET', `/boards/${boardId}/items${params}`);
    }
    getItem(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/items/${itemId}`);
    }
    updateItemPosition(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/items/${itemId}`, data);
    }
    deleteItem(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/items/${itemId}`);
    }
    // ── Bulk ────────────────────────────────────────────────────────────
    createItemsInBulk(boardId, items) {
        return this.request('POST', `/boards/${boardId}/items/bulk`, items);
    }
    createItemsInBulkUsingFile(boardId, formData) {
        return this.requestMultipart('POST', `/boards/${boardId}/items/bulk/file`, formData);
    }
    // ── App Cards ───────────────────────────────────────────────────────
    createAppCard(boardId, data) {
        return this.request('POST', `/boards/${boardId}/app_cards`, data);
    }
    getAppCard(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/app_cards/${itemId}`);
    }
    updateAppCard(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/app_cards/${itemId}`, data);
    }
    deleteAppCard(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/app_cards/${itemId}`);
    }
    // ── Cards ───────────────────────────────────────────────────────────
    createCard(boardId, data) {
        return this.request('POST', `/boards/${boardId}/cards`, data);
    }
    getCard(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/cards/${itemId}`);
    }
    updateCard(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/cards/${itemId}`, data);
    }
    deleteCard(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/cards/${itemId}`);
    }
    // ── Connectors ──────────────────────────────────────────────────────
    listConnectors(boardId) {
        return this.request('GET', `/boards/${boardId}/connectors`);
    }
    createConnector(boardId, data) {
        return this.request('POST', `/boards/${boardId}/connectors`, data);
    }
    getConnector(boardId, connectorId) {
        return this.request('GET', `/boards/${boardId}/connectors/${connectorId}`);
    }
    updateConnector(boardId, connectorId, data) {
        return this.request('PATCH', `/boards/${boardId}/connectors/${connectorId}`, data);
    }
    deleteConnector(boardId, connectorId) {
        return this.request('DELETE', `/boards/${boardId}/connectors/${connectorId}`);
    }
    // ── Sticky Notes ────────────────────────────────────────────────────
    createStickyNote(boardId, data) {
        return this.request('POST', `/boards/${boardId}/sticky_notes`, data);
    }
    getStickyNote(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/sticky_notes/${itemId}`);
    }
    updateStickyNote(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/sticky_notes/${itemId}`, data);
    }
    deleteStickyNote(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/sticky_notes/${itemId}`);
    }
    // ── Frames ──────────────────────────────────────────────────────────
    createFrame(boardId, data) {
        return this.request('POST', `/boards/${boardId}/frames`, data);
    }
    getFrame(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/frames/${itemId}`);
    }
    updateFrame(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/frames/${itemId}`, data);
    }
    deleteFrame(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/frames/${itemId}`);
    }
    // ── Documents ───────────────────────────────────────────────────────
    createDocument(boardId, data) {
        return this.request('POST', `/boards/${boardId}/documents`, data);
    }
    getDocument(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/documents/${itemId}`);
    }
    updateDocument(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/documents/${itemId}`, data);
    }
    deleteDocument(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/documents/${itemId}`);
    }
    // ── Text ────────────────────────────────────────────────────────────
    createText(boardId, data) {
        return this.request('POST', `/boards/${boardId}/texts`, data);
    }
    getText(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/texts/${itemId}`);
    }
    updateText(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/texts/${itemId}`, data);
    }
    deleteText(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/texts/${itemId}`);
    }
    // ── Images ──────────────────────────────────────────────────────────
    createImageFromUrl(boardId, data) {
        return this.request('POST', `/boards/${boardId}/images`, data);
    }
    createImageFromFile(boardId, formData) {
        return this.requestMultipart('POST', `/boards/${boardId}/images`, formData);
    }
    getImage(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/images/${itemId}`);
    }
    updateImage(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/images/${itemId}`, data);
    }
    updateImageFromFile(boardId, itemId, formData) {
        return this.requestMultipart('PATCH', `/boards/${boardId}/images/${itemId}`, formData);
    }
    deleteImage(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/images/${itemId}`);
    }
    listImagesByBoard(boardId) {
        return this.request('GET', `/boards/${boardId}/images`);
    }
    // ── Shapes ──────────────────────────────────────────────────────────
    createShape(boardId, data) {
        return this.request('POST', `/boards/${boardId}/shapes`, data);
    }
    getShape(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/shapes/${itemId}`);
    }
    updateShape(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/shapes/${itemId}`, data);
    }
    deleteShape(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/shapes/${itemId}`);
    }
    // ── Embeds ──────────────────────────────────────────────────────────
    createEmbed(boardId, data) {
        return this.request('POST', `/boards/${boardId}/embeds`, data);
    }
    getEmbed(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/embeds/${itemId}`);
    }
    updateEmbed(boardId, itemId, data) {
        return this.request('PATCH', `/boards/${boardId}/embeds/${itemId}`, data);
    }
    deleteEmbed(boardId, itemId) {
        return this.request('DELETE', `/boards/${boardId}/embeds/${itemId}`);
    }
    // ── Tags ────────────────────────────────────────────────────────────
    listTags(boardId) {
        return this.request('GET', `/boards/${boardId}/tags`);
    }
    createTag(boardId, data) {
        return this.request('POST', `/boards/${boardId}/tags`, data);
    }
    getTag(boardId, tagId) {
        return this.request('GET', `/boards/${boardId}/tags/${tagId}`);
    }
    updateTag(boardId, tagId, data) {
        return this.request('PATCH', `/boards/${boardId}/tags/${tagId}`, data);
    }
    deleteTag(boardId, tagId) {
        return this.request('DELETE', `/boards/${boardId}/tags/${tagId}`);
    }
    attachTag(boardId, itemId, tagId) {
        return this.request('POST', `/boards/${boardId}/items/${itemId}/tags/${tagId}`);
    }
    detachTag(boardId, itemId, tagId) {
        return this.request('DELETE', `/boards/${boardId}/items/${itemId}/tags/${tagId}`);
    }
    getItemTags(boardId, itemId) {
        return this.request('GET', `/boards/${boardId}/items/${itemId}/tags`);
    }
    // ── Members ─────────────────────────────────────────────────────────
    listBoardMembers(boardId) {
        return this.request('GET', `/boards/${boardId}/members`);
    }
    getBoardMember(boardId, memberId) {
        return this.request('GET', `/boards/${boardId}/members/${memberId}`);
    }
    updateBoardMember(boardId, memberId, data) {
        return this.request('PATCH', `/boards/${boardId}/members/${memberId}`, data);
    }
    removeBoardMember(boardId, memberId) {
        return this.request('DELETE', `/boards/${boardId}/members/${memberId}`);
    }
    shareBoard(boardId, data) {
        return this.request('POST', `/boards/${boardId}/members`, data);
    }
    // ── Groups ──────────────────────────────────────────────────────────
    listGroups(boardId) {
        return this.request('GET', `/boards/${boardId}/groups`);
    }
    getGroup(boardId, groupId) {
        return this.request('GET', `/boards/${boardId}/groups/${groupId}`);
    }
    createGroup(boardId, data) {
        return this.request('POST', `/boards/${boardId}/groups`, data);
    }
    updateGroup(boardId, groupId, data) {
        return this.request('PATCH', `/boards/${boardId}/groups/${groupId}`, data);
    }
    deleteGroup(boardId, groupId) {
        return this.request('DELETE', `/boards/${boardId}/groups/${groupId}`);
    }
    getGroupItems(boardId, groupId) {
        return this.request('GET', `/boards/${boardId}/groups/${groupId}/items`);
    }
    ungroupItems(boardId, groupId) {
        return this.request('DELETE', `/boards/${boardId}/groups/${groupId}/items`);
    }
    // ── Mindmaps ────────────────────────────────────────────────────────
    createMindmapNode(boardId, data) {
        return this.request('POST', `/boards/${boardId}/mindmap_nodes`, data);
    }
    getMindmapNode(boardId, nodeId) {
        return this.request('GET', `/boards/${boardId}/mindmap_nodes/${nodeId}`);
    }
    updateMindmapNode(boardId, nodeId, data) {
        return this.request('PATCH', `/boards/${boardId}/mindmap_nodes/${nodeId}`, data);
    }
    deleteMindmapNode(boardId, nodeId) {
        return this.request('DELETE', `/boards/${boardId}/mindmap_nodes/${nodeId}`);
    }
    // ── Projects ────────────────────────────────────────────────────────
    listProjectMembers(orgId, projectId) {
        return this.request('GET', `/orgs/${orgId}/projects/${projectId}/members`);
    }
    getProjectMember(orgId, projectId, memberId) {
        return this.request('GET', `/orgs/${orgId}/projects/${projectId}/members/${memberId}`);
    }
    updateProjectMember(orgId, projectId, memberId, data) {
        return this.request('PATCH', `/orgs/${orgId}/projects/${projectId}/members/${memberId}`, data);
    }
    // ── Exports ─────────────────────────────────────────────────────────
    createExportJob(boardId, data) {
        return this.request('POST', `/boards/${boardId}/export`, data);
    }
    getExportJobStatus(boardId, jobId) {
        return this.request('GET', `/boards/${boardId}/export/${jobId}`);
    }
    getExportJobResults(boardId, jobId) {
        return this.request('GET', `/boards/${boardId}/export/${jobId}/results`);
    }
    // ── Compliance ──────────────────────────────────────────────────────
    listComplianceCases(orgId) {
        return this.request('GET', `/orgs/${orgId}/compliance/cases`);
    }
    getComplianceCase(orgId, caseId) {
        return this.request('GET', `/orgs/${orgId}/compliance/cases/${caseId}`);
    }
    createComplianceCase(orgId, data) {
        return this.request('POST', `/orgs/${orgId}/compliance/cases`, data);
    }
    updateComplianceCase(orgId, caseId, data) {
        return this.request('PATCH', `/orgs/${orgId}/compliance/cases/${caseId}`, data);
    }
    listLegalHolds(orgId) {
        return this.request('GET', `/orgs/${orgId}/compliance/legal-holds`);
    }
    createLegalHold(orgId, data) {
        return this.request('POST', `/orgs/${orgId}/compliance/legal-holds`, data);
    }
    getContentLogs(orgId, query) {
        const params = query ? `?${new URLSearchParams(query)}` : '';
        return this.request('GET', `/orgs/${orgId}/compliance/content-logs${params}`);
    }
    getContentClassification(orgId, boardId) {
        return this.request('GET', `/orgs/${orgId}/compliance/boards/${boardId}/classification`);
    }
    // ── Organization ────────────────────────────────────────────────────
    getOrganization(orgId) {
        return this.request('GET', `/orgs/${orgId}`);
    }
    listOrgMembers(orgId, query) {
        const params = query ? `?${new URLSearchParams(query)}` : '';
        return this.request('GET', `/orgs/${orgId}/members${params}`);
    }
    getOrgMember(orgId, memberId) {
        return this.request('GET', `/orgs/${orgId}/members/${memberId}`);
    }
    getAuditLogs(orgId, query) {
        const params = query ? `?${new URLSearchParams(query)}` : '';
        return this.request('GET', `/orgs/${orgId}/audit-logs${params}`);
    }
}
