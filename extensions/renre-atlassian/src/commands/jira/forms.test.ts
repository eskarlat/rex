vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext } from '../../shared/types.js';
import getIssueForms from './get-issue-forms.js';
import getFormDetails from './get-form-details.js';
import updateFormAnswers from './update-form-answers.js';

const mockJira = {
  getIssueProformaForms: vi.fn(),
  getProformaFormDetails: vi.fn(),
  updateProformaFormAnswers: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClients).mockReturnValue({ jira: mockJira as never, confluence: {} as never });
});

describe('get-issue-forms', () => {
  it('calls jira.getIssueProformaForms with issueKey', async () => {
    const forms = [{ id: 'form-1', name: 'Intake Form' }];
    mockJira.getIssueProformaForms.mockResolvedValue(forms);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueForms(ctx);
    expect(mockJira.getIssueProformaForms).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(forms);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getIssueProformaForms.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssueForms(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-form-details', () => {
  it('calls jira.getProformaFormDetails with issueKey and formId', async () => {
    const details = { id: 'form-1', questions: [] };
    mockJira.getProformaFormDetails.mockResolvedValue(details);
    const ctx = makeContext({ issueKey: 'TEST-1', formId: 'form-1' });
    await getFormDetails(ctx);
    expect(mockJira.getProformaFormDetails).toHaveBeenCalledWith('TEST-1', 'form-1');
    expect(toOutput).toHaveBeenCalledWith(details);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getProformaFormDetails.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', formId: 'form-1' });
    const result = await getFormDetails(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('update-form-answers', () => {
  it('calls jira.updateProformaFormAnswers with issueKey, formId, and answers', async () => {
    mockJira.updateProformaFormAnswers.mockResolvedValue(undefined);
    const answers = { q1: 'Yes', q2: 'No' };
    const ctx = makeContext({ issueKey: 'TEST-1', formId: 'form-1', answers });
    await updateFormAnswers(ctx);
    expect(mockJira.updateProformaFormAnswers).toHaveBeenCalledWith('TEST-1', 'form-1', answers);
    expect(toOutput).toHaveBeenCalledWith({ success: true });
  });

  it('returns errorOutput on error', async () => {
    mockJira.updateProformaFormAnswers.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', formId: 'form-1', answers: {} });
    const result = await updateFormAnswers(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
