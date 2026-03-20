import { AtlassianBaseClient } from './base-client.js';
import type { AtlassianClientConfig } from './base-client.js';

export class JiraClient extends AtlassianBaseClient {
  constructor(config: AtlassianClientConfig) {
    super(config);
  }

  // --- Issues ---
  async getIssue(issueKey: string, expand?: string): Promise<unknown> {
    const query = expand ? `?expand=${encodeURIComponent(expand)}` : '';
    return this.request('GET', `/rest/api/3/issue/${issueKey}${query}`);
  }

  async search(jql: string, startAt = 0, maxResults = 50, fields?: string[]): Promise<unknown> {
    return this.request('POST', '/rest/api/3/search', {
      jql,
      startAt,
      maxResults,
      fields: fields ?? ['summary', 'status', 'assignee', 'priority', 'issuetype', 'updated'],
    });
  }

  async createIssue(fields: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/rest/api/3/issue', { fields });
  }

  async updateIssue(issueKey: string, fields: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/rest/api/3/issue/${issueKey}`, { fields });
  }

  async deleteIssue(issueKey: string): Promise<unknown> {
    return this.request('DELETE', `/rest/api/3/issue/${issueKey}`);
  }

  async bulkCreateIssues(issues: Array<{ fields: Record<string, unknown> }>): Promise<unknown> {
    return this.request('POST', '/rest/api/3/issue/bulk', { issueUpdates: issues });
  }

  async getChangelogs(issueKey: string, startAt = 0, maxResults = 100): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/api/3/issue/${issueKey}/changelog?startAt=${startAt}&maxResults=${maxResults}`,
    );
  }

  // --- Fields ---
  async getFields(): Promise<unknown> {
    return this.request('GET', '/rest/api/3/field');
  }

  async getFieldOptions(fieldId: string, contextId: string): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/api/3/field/${fieldId}/context/${contextId}/option`,
    );
  }

  // --- Comments ---
  async addComment(issueKey: string, body: unknown): Promise<unknown> {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/comment`, { body });
  }

  async editComment(issueKey: string, commentId: string, body: unknown): Promise<unknown> {
    return this.request('PUT', `/rest/api/3/issue/${issueKey}/comment/${commentId}`, { body });
  }

  // --- Transitions ---
  async getTransitions(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/issue/${issueKey}/transitions`);
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<unknown> {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
      transition: { id: transitionId },
    });
  }

  // --- Projects ---
  async getAllProjects(): Promise<unknown> {
    return this.request('GET', '/rest/api/3/project');
  }

  async getProjectVersions(projectKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/project/${projectKey}/versions`);
  }

  async getProjectComponents(projectKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/project/${projectKey}/components`);
  }

  async createVersion(version: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/rest/api/3/version', version);
  }

  // --- Agile ---
  async getBoards(startAt = 0, maxResults = 50): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/agile/1.0/board?startAt=${startAt}&maxResults=${maxResults}`,
    );
  }

  async getBoardIssues(boardId: number, startAt = 0, maxResults = 50): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/agile/1.0/board/${boardId}/issue?startAt=${startAt}&maxResults=${maxResults}`,
    );
  }

  async getSprintsFromBoard(boardId: number, startAt = 0, maxResults = 50): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt}&maxResults=${maxResults}`,
    );
  }

  async getSprintIssues(sprintId: number, startAt = 0, maxResults = 50): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/agile/1.0/sprint/${sprintId}/issue?startAt=${startAt}&maxResults=${maxResults}`,
    );
  }

  async createSprint(sprint: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/rest/agile/1.0/sprint', sprint);
  }

  async updateSprint(sprintId: number, sprint: Record<string, unknown>): Promise<unknown> {
    return this.request('PUT', `/rest/agile/1.0/sprint/${sprintId}`, sprint);
  }

  async addIssuesToSprint(sprintId: number, issueKeys: string[]): Promise<unknown> {
    return this.request('POST', `/rest/agile/1.0/sprint/${sprintId}/issue`, {
      issues: issueKeys,
    });
  }

  // --- Links ---
  async getLinkTypes(): Promise<unknown> {
    return this.request('GET', '/rest/api/3/issueLinkType');
  }

  async linkToEpic(epicKey: string, issueKeys: string[]): Promise<unknown> {
    return this.request('PUT', `/rest/agile/1.0/epic/${epicKey}/issue`, {
      issues: issueKeys,
    });
  }

  async createIssueLink(link: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', '/rest/api/3/issueLink', link);
  }

  async createRemoteIssueLink(issueKey: string, remoteLink: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/remotelink`, remoteLink);
  }

  async removeIssueLink(linkId: string): Promise<unknown> {
    return this.request('DELETE', `/rest/api/3/issueLink/${linkId}`);
  }

  // --- Worklog ---
  async getWorklog(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/issue/${issueKey}/worklog`);
  }

  async addWorklog(issueKey: string, worklog: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/worklog`, worklog);
  }

  // --- Attachments ---
  async downloadAttachment(attachmentId: string): Promise<Response> {
    return this.requestRaw('GET', `/rest/api/3/attachment/content/${attachmentId}`);
  }

  async getIssueForAttachments(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/issue/${issueKey}?fields=attachment`);
  }

  // --- Users ---
  async getMyself(): Promise<unknown> {
    return this.request('GET', '/rest/api/3/myself');
  }

  async getUser(accountId: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/user?accountId=${encodeURIComponent(accountId)}`);
  }

  // --- Watchers ---
  async getWatchers(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/issue/${issueKey}/watchers`);
  }

  async addWatcher(issueKey: string, accountId: string): Promise<unknown> {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/watchers`, JSON.stringify(accountId));
  }

  async removeWatcher(issueKey: string, accountId: string): Promise<unknown> {
    return this.request(
      'DELETE',
      `/rest/api/3/issue/${issueKey}/watchers?accountId=${encodeURIComponent(accountId)}`,
    );
  }

  // --- Service Desk ---
  async getServiceDesks(): Promise<unknown> {
    return this.request('GET', '/rest/servicedeskapi/servicedesk');
  }

  async getServiceDeskQueues(serviceDeskId: number): Promise<unknown> {
    return this.request('GET', `/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue`);
  }

  async getQueueIssues(serviceDeskId: number, queueId: number): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/servicedeskapi/servicedesk/${serviceDeskId}/queue/${queueId}/issue`,
    );
  }

  // --- Forms (Proforma) ---
  async getIssueProformaForms(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/api/3/issue/${issueKey}/properties/proforma.forms`);
  }

  async getProformaFormDetails(issueKey: string, formId: string): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/api/3/issue/${issueKey}/properties/proforma.forms.${formId}`,
    );
  }

  async updateProformaFormAnswers(
    issueKey: string,
    formId: string,
    answers: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request(
      'PUT',
      `/rest/api/3/issue/${issueKey}/properties/proforma.forms.${formId}`,
      answers,
    );
  }

  // --- Metrics ---
  async getIssueDateFields(issueKey: string): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/api/3/issue/${issueKey}?fields=created,updated,resolutiondate,duedate`,
    );
  }

  async getIssueSla(issueKey: string): Promise<unknown> {
    return this.request('GET', `/rest/servicedeskapi/request/${issueKey}/sla`);
  }

  // --- Development ---
  async getDevelopmentInfo(issueId: string): Promise<unknown> {
    return this.request(
      'GET',
      `/rest/dev-status/latest/issue/detail?issueId=${issueId}&applicationType=stash&dataType=repository`,
    );
  }

  async getBatchDevelopmentInfo(issueIds: string[]): Promise<unknown> {
    return this.request('POST', '/rest/dev-status/latest/issue/detail', {
      issueIds,
      applicationType: 'stash',
      dataType: 'repository',
    });
  }
}
