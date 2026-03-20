import { AtlassianBaseClient } from './base-client.js';
export class JiraClient extends AtlassianBaseClient {
    constructor(config) {
        super(config);
    }
    // --- Issues ---
    async getIssue(issueKey, expand) {
        const query = expand ? `?expand=${encodeURIComponent(expand)}` : '';
        return this.request('GET', `/rest/api/3/issue/${issueKey}${query}`);
    }
    async search(jql, startAt = 0, maxResults = 50, fields) {
        return this.request('POST', '/rest/api/3/search', {
            jql,
            startAt,
            maxResults,
            fields: fields ?? ['summary', 'status', 'assignee', 'priority', 'issuetype', 'updated'],
        });
    }
    async createIssue(fields) {
        return this.request('POST', '/rest/api/3/issue', { fields });
    }
    async updateIssue(issueKey, fields) {
        return this.request('PUT', `/rest/api/3/issue/${issueKey}`, { fields });
    }
    async deleteIssue(issueKey) {
        return this.request('DELETE', `/rest/api/3/issue/${issueKey}`);
    }
    async bulkCreateIssues(issues) {
        return this.request('POST', '/rest/api/3/issue/bulk', { issueUpdates: issues });
    }
    async getChangelogs(issueKey, startAt = 0, maxResults = 100) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/changelog?startAt=${startAt}&maxResults=${maxResults}`);
    }
    // --- Fields ---
    async getFields() {
        return this.request('GET', '/rest/api/3/field');
    }
    async getFieldOptions(fieldId, contextId) {
        return this.request('GET', `/rest/api/3/field/${fieldId}/context/${contextId}/option`);
    }
    // --- Comments ---
    async addComment(issueKey, body) {
        return this.request('POST', `/rest/api/3/issue/${issueKey}/comment`, { body });
    }
    async editComment(issueKey, commentId, body) {
        return this.request('PUT', `/rest/api/3/issue/${issueKey}/comment/${commentId}`, { body });
    }
    // --- Transitions ---
    async getTransitions(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/transitions`);
    }
    async transitionIssue(issueKey, transitionId) {
        return this.request('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
            transition: { id: transitionId },
        });
    }
    // --- Projects ---
    async getAllProjects() {
        return this.request('GET', '/rest/api/3/project');
    }
    async getProjectVersions(projectKey) {
        return this.request('GET', `/rest/api/3/project/${projectKey}/versions`);
    }
    async getProjectComponents(projectKey) {
        return this.request('GET', `/rest/api/3/project/${projectKey}/components`);
    }
    async createVersion(version) {
        return this.request('POST', '/rest/api/3/version', version);
    }
    // --- Agile ---
    async getBoards(startAt = 0, maxResults = 50) {
        return this.request('GET', `/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`);
    }
    async getBoardIssues(boardId, startAt = 0, maxResults = 50) {
        return this.request('GET', `/rest/agile/1.0/board/${boardId}/issue?startAt=${startAt}&maxResults=${maxResults}`);
    }
    async getSprintsFromBoard(boardId, startAt = 0, maxResults = 50) {
        return this.request('GET', `/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt}&maxResults=${maxResults}`);
    }
    async getSprintIssues(sprintId, startAt = 0, maxResults = 50) {
        return this.request('GET', `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&maxResults=${maxResults}`);
    }
    async createSprint(sprint) {
        return this.request('POST', '/rest/agile/1.0/sprint', sprint);
    }
    async updateSprint(sprintId, sprint) {
        return this.request('PUT', `/rest/agile/1.0/sprint/${sprintId}`, sprint);
    }
    async addIssuesToSprint(sprintId, issueKeys) {
        return this.request('POST', `/rest/agile/1.0/sprint/${sprintId}/issue`, {
            issues: issueKeys,
        });
    }
    // --- Links ---
    async getLinkTypes() {
        return this.request('GET', '/rest/api/3/issueLinkType');
    }
    async linkToEpic(epicKey, issueKeys) {
        return this.request('PUT', `/rest/agile/1.0/epic/${epicKey}/issue`, {
            issues: issueKeys,
        });
    }
    async createIssueLink(link) {
        return this.request('POST', '/rest/api/3/issueLink', link);
    }
    async createRemoteIssueLink(issueKey, remoteLink) {
        return this.request('POST', `/rest/api/3/issue/${issueKey}/remotelink`, remoteLink);
    }
    async removeIssueLink(linkId) {
        return this.request('DELETE', `/rest/api/3/issueLink/${linkId}`);
    }
    // --- Worklog ---
    async getWorklog(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/worklog`);
    }
    async addWorklog(issueKey, worklog) {
        return this.request('POST', `/rest/api/3/issue/${issueKey}/worklog`, worklog);
    }
    // --- Attachments ---
    async downloadAttachment(attachmentId) {
        return this.requestRaw('GET', `/rest/api/3/attachment/content/${attachmentId}`);
    }
    async getIssueForAttachments(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}?fields=attachment`);
    }
    // --- Users ---
    async getMyself() {
        return this.request('GET', '/rest/api/3/myself');
    }
    async getUser(accountId) {
        return this.request('GET', `/rest/api/3/user?accountId=${encodeURIComponent(accountId)}`);
    }
    // --- Watchers ---
    async getWatchers(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/watchers`);
    }
    async addWatcher(issueKey, accountId) {
        return this.request('POST', `/rest/api/3/issue/${issueKey}/watchers`, JSON.stringify(accountId));
    }
    async removeWatcher(issueKey, accountId) {
        return this.request('DELETE', `/rest/api/3/issue/${issueKey}/watchers?accountId=${encodeURIComponent(accountId)}`);
    }
    // --- Service Desk ---
    async getServiceDesks() {
        return this.request('GET', '/rest/servicedeskapi/servicedesk');
    }
    async getServiceDeskQueues(serviceDeskId) {
        return this.request('GET', `/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue`);
    }
    async getQueueIssues(serviceDeskId, queueId) {
        return this.request('GET', `/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue/${queueId}/issue`);
    }
    // --- Forms (Proforma) ---
    async getIssueProformaForms(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/properties/proforma.forms`);
    }
    async getProformaFormDetails(issueKey, formId) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}/properties/proforma.forms.${formId}`);
    }
    async updateProformaFormAnswers(issueKey, formId, answers) {
        return this.request('PUT', `/rest/api/3/issue/${issueKey}/properties/proforma.forms.${formId}`, answers);
    }
    // --- Metrics ---
    async getIssueDateFields(issueKey) {
        return this.request('GET', `/rest/api/3/issue/${issueKey}?fields=created,updated,resolutiondate,duedate`);
    }
    async getIssueSla(issueKey) {
        return this.request('GET', `/rest/servicedeskapi/request/${issueKey}/sla`);
    }
    // --- Development ---
    async getDevelopmentInfo(issueId) {
        return this.request('GET', `/rest/dev-status/latest/issue/detail?issueId=${issueId}&applicationType=stash&dataType=repository`);
    }
    async getBatchDevelopmentInfo(issueIds) {
        return this.request('POST', '/rest/dev-status/latest/issue/detail', {
            issueIds,
            applicationType: 'stash',
            dataType: 'repository',
        });
    }
}
