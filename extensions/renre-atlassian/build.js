import { readFileSync, rmSync } from 'node:fs';

import { buildExtension, buildPanel, archiveDist } from '@renre-kit/extension-sdk/node';

rmSync('dist', { recursive: true, force: true });

const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));

// Bundle Node.js entry points (hooks + all CLI commands)
await buildExtension({
  entryPoints: [
    { in: 'src/index.ts', out: 'index' },
    // Status & help
    { in: 'src/commands/status.ts', out: 'commands/status' },
    { in: 'src/commands/jira-help.ts', out: 'commands/jira-help' },
    { in: 'src/commands/confluence-help.ts', out: 'commands/confluence-help' },
    // Jira — Issues
    { in: 'src/commands/jira/get-issue.ts', out: 'commands/jira/get-issue' },
    { in: 'src/commands/jira/search.ts', out: 'commands/jira/search' },
    { in: 'src/commands/jira/get-project-issues.ts', out: 'commands/jira/get-project-issues' },
    { in: 'src/commands/jira/create-issue.ts', out: 'commands/jira/create-issue' },
    { in: 'src/commands/jira/update-issue.ts', out: 'commands/jira/update-issue' },
    { in: 'src/commands/jira/delete-issue.ts', out: 'commands/jira/delete-issue' },
    { in: 'src/commands/jira/batch-create-issues.ts', out: 'commands/jira/batch-create-issues' },
    { in: 'src/commands/jira/get-changelogs.ts', out: 'commands/jira/get-changelogs' },
    // Jira — Fields
    { in: 'src/commands/jira/search-fields.ts', out: 'commands/jira/search-fields' },
    { in: 'src/commands/jira/get-field-options.ts', out: 'commands/jira/get-field-options' },
    // Jira — Comments
    { in: 'src/commands/jira/add-comment.ts', out: 'commands/jira/add-comment' },
    { in: 'src/commands/jira/edit-comment.ts', out: 'commands/jira/edit-comment' },
    // Jira — Transitions
    { in: 'src/commands/jira/get-transitions.ts', out: 'commands/jira/get-transitions' },
    { in: 'src/commands/jira/transition-issue.ts', out: 'commands/jira/transition-issue' },
    // Jira — Projects
    { in: 'src/commands/jira/get-all-projects.ts', out: 'commands/jira/get-all-projects' },
    { in: 'src/commands/jira/get-project-versions.ts', out: 'commands/jira/get-project-versions' },
    { in: 'src/commands/jira/get-project-components.ts', out: 'commands/jira/get-project-components' },
    { in: 'src/commands/jira/create-version.ts', out: 'commands/jira/create-version' },
    { in: 'src/commands/jira/batch-create-versions.ts', out: 'commands/jira/batch-create-versions' },
    // Jira — Agile
    { in: 'src/commands/jira/get-agile-boards.ts', out: 'commands/jira/get-agile-boards' },
    { in: 'src/commands/jira/get-board-issues.ts', out: 'commands/jira/get-board-issues' },
    { in: 'src/commands/jira/get-sprints-from-board.ts', out: 'commands/jira/get-sprints-from-board' },
    { in: 'src/commands/jira/get-sprint-issues.ts', out: 'commands/jira/get-sprint-issues' },
    { in: 'src/commands/jira/create-sprint.ts', out: 'commands/jira/create-sprint' },
    { in: 'src/commands/jira/update-sprint.ts', out: 'commands/jira/update-sprint' },
    { in: 'src/commands/jira/add-issues-to-sprint.ts', out: 'commands/jira/add-issues-to-sprint' },
    // Jira — Links
    { in: 'src/commands/jira/get-link-types.ts', out: 'commands/jira/get-link-types' },
    { in: 'src/commands/jira/link-to-epic.ts', out: 'commands/jira/link-to-epic' },
    { in: 'src/commands/jira/create-issue-link.ts', out: 'commands/jira/create-issue-link' },
    { in: 'src/commands/jira/create-remote-issue-link.ts', out: 'commands/jira/create-remote-issue-link' },
    { in: 'src/commands/jira/remove-issue-link.ts', out: 'commands/jira/remove-issue-link' },
    // Jira — Worklog
    { in: 'src/commands/jira/get-worklog.ts', out: 'commands/jira/get-worklog' },
    { in: 'src/commands/jira/add-worklog.ts', out: 'commands/jira/add-worklog' },
    // Jira — Attachments
    { in: 'src/commands/jira/download-attachment.ts', out: 'commands/jira/download-attachment' },
    { in: 'src/commands/jira/get-issue-images.ts', out: 'commands/jira/get-issue-images' },
    // Jira — Users
    { in: 'src/commands/jira/get-user-profile.ts', out: 'commands/jira/get-user-profile' },
    // Jira — Watchers
    { in: 'src/commands/jira/get-issue-watchers.ts', out: 'commands/jira/get-issue-watchers' },
    { in: 'src/commands/jira/add-watcher.ts', out: 'commands/jira/add-watcher' },
    { in: 'src/commands/jira/remove-watcher.ts', out: 'commands/jira/remove-watcher' },
    // Jira — Service Desk
    { in: 'src/commands/jira/get-service-desks.ts', out: 'commands/jira/get-service-desks' },
    { in: 'src/commands/jira/get-service-desk-queues.ts', out: 'commands/jira/get-service-desk-queues' },
    { in: 'src/commands/jira/get-queue-issues.ts', out: 'commands/jira/get-queue-issues' },
    // Jira — Forms
    { in: 'src/commands/jira/get-issue-forms.ts', out: 'commands/jira/get-issue-forms' },
    { in: 'src/commands/jira/get-form-details.ts', out: 'commands/jira/get-form-details' },
    { in: 'src/commands/jira/update-form-answers.ts', out: 'commands/jira/update-form-answers' },
    // Jira — Metrics
    { in: 'src/commands/jira/get-issue-dates.ts', out: 'commands/jira/get-issue-dates' },
    { in: 'src/commands/jira/get-issue-sla.ts', out: 'commands/jira/get-issue-sla' },
    // Jira — Development
    { in: 'src/commands/jira/get-dev-info.ts', out: 'commands/jira/get-dev-info' },
    { in: 'src/commands/jira/get-dev-summary.ts', out: 'commands/jira/get-dev-summary' },
    { in: 'src/commands/jira/get-batch-dev-info.ts', out: 'commands/jira/get-batch-dev-info' },
    // Confluence — Pages
    { in: 'src/commands/confluence/search.ts', out: 'commands/confluence/search' },
    { in: 'src/commands/confluence/get-page.ts', out: 'commands/confluence/get-page' },
    { in: 'src/commands/confluence/get-page-children.ts', out: 'commands/confluence/get-page-children' },
    { in: 'src/commands/confluence/get-page-history.ts', out: 'commands/confluence/get-page-history' },
    { in: 'src/commands/confluence/create-page.ts', out: 'commands/confluence/create-page' },
    { in: 'src/commands/confluence/update-page.ts', out: 'commands/confluence/update-page' },
    { in: 'src/commands/confluence/delete-page.ts', out: 'commands/confluence/delete-page' },
    { in: 'src/commands/confluence/move-page.ts', out: 'commands/confluence/move-page' },
    { in: 'src/commands/confluence/get-page-diff.ts', out: 'commands/confluence/get-page-diff' },
    // Confluence — Comments
    { in: 'src/commands/confluence/get-comments.ts', out: 'commands/confluence/get-comments' },
    { in: 'src/commands/confluence/add-comment.ts', out: 'commands/confluence/add-comment' },
    { in: 'src/commands/confluence/reply-to-comment.ts', out: 'commands/confluence/reply-to-comment' },
    // Confluence — Labels
    { in: 'src/commands/confluence/get-labels.ts', out: 'commands/confluence/get-labels' },
    { in: 'src/commands/confluence/add-label.ts', out: 'commands/confluence/add-label' },
    // Confluence — Users
    { in: 'src/commands/confluence/search-user.ts', out: 'commands/confluence/search-user' },
    // Confluence — Analytics
    { in: 'src/commands/confluence/get-page-views.ts', out: 'commands/confluence/get-page-views' },
    // Confluence — Attachments
    { in: 'src/commands/confluence/upload-attachment.ts', out: 'commands/confluence/upload-attachment' },
    { in: 'src/commands/confluence/upload-attachments.ts', out: 'commands/confluence/upload-attachments' },
    { in: 'src/commands/confluence/get-attachments.ts', out: 'commands/confluence/get-attachments' },
    { in: 'src/commands/confluence/download-attachment.ts', out: 'commands/confluence/download-attachment' },
    { in: 'src/commands/confluence/download-all-attachments.ts', out: 'commands/confluence/download-all-attachments' },
    { in: 'src/commands/confluence/delete-attachment.ts', out: 'commands/confluence/delete-attachment' },
    { in: 'src/commands/confluence/get-page-images.ts', out: 'commands/confluence/get-page-images' },
  ],
  outdir: 'dist',
  external: [],
  splitting: true,
});

// Bundle UI panels
await buildPanel({
  entryPoints: [
    { in: 'src/ui/panel.tsx', out: 'panel' },
    { in: 'src/ui/my-tasks-widget.tsx', out: 'my-tasks-widget' },
    { in: 'src/ui/comments-widget.tsx', out: 'comments-widget' },
    { in: 'src/ui/confluence-updates-widget.tsx', out: 'confluence-updates-widget' },
  ],
  outdir: 'dist',
});

await archiveDist('dist', manifest.version);
