import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'RenreKit',
    description: 'A lightweight, plugin-driven development CLI that gets out of your way.',
    head: [['link', { rel: 'icon', href: '/rex/logo.svg' }]],

    base: '/rex/',

    mermaid: {
      theme: 'dark',
    },

    themeConfig: {
      logo: '/logo.svg',
      siteTitle: 'RenreKit',

      nav: [
        { text: 'Guide', link: '/guide/what-is-renrekit' },
        { text: 'Extensions', link: '/extensions/overview' },
        { text: 'Architecture', link: '/architecture/overview' },
        { text: 'API Reference', link: '/api/cli-commands' },
        {
          text: 'v1.0.0',
          items: [
            { text: 'v1.0.0 (latest)', link: '/' },
          ],
        },
      ],

      sidebar: {
        '/guide/': [
          {
            text: 'Introduction',
            items: [
              { text: 'What Is RenreKit?', link: '/guide/what-is-renrekit' },
              { text: 'Getting Started', link: '/guide/getting-started' },
            ],
          },
          {
            text: 'Core Concepts',
            items: [
              { text: 'Project Management', link: '/guide/project-management' },
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Encrypted Vault', link: '/guide/vault' },
            ],
          },
          {
            text: 'Features',
            items: [
              { text: 'Web Dashboard', link: '/guide/web-dashboard' },
              { text: 'Scheduler', link: '/guide/scheduler' },
              { text: 'LLM Skills', link: '/guide/llm-skills' },
            ],
          },
        ],
        '/extensions/': [
          {
            text: 'Extensions',
            items: [
              { text: 'Overview', link: '/extensions/overview' },
              { text: 'Building a Standard Extension', link: '/extensions/building-standard' },
              { text: 'Building an MCP Extension', link: '/extensions/building-mcp' },
            ],
          },
          {
            text: 'Deep Dive',
            items: [
              { text: 'Manifest Reference', link: '/extensions/manifest-reference' },
              { text: 'Lifecycle Hooks', link: '/extensions/lifecycle-hooks' },
              { text: 'UI Panels & Widgets', link: '/extensions/ui-panels' },
              { text: 'Agent Assets & Skills', link: '/extensions/agent-assets' },
            ],
          },
          {
            text: 'Distribution',
            items: [
              { text: 'Publishing to a Registry', link: '/extensions/publishing' },
              { text: 'Reference Extensions', link: '/extensions/reference-extensions' },
            ],
          },
        ],
        '/architecture/': [
          {
            text: 'Architecture',
            items: [
              { text: 'Overview', link: '/architecture/overview' },
              { text: 'Microkernel Pattern', link: '/architecture/microkernel' },
              { text: 'Monorepo & Packages', link: '/architecture/monorepo' },
              { text: 'Database Design', link: '/architecture/database' },
              { text: 'Data Flow', link: '/architecture/data-flow' },
              { text: 'Architecture Decision Records', link: '/architecture/adrs' },
            ],
          },
        ],
        '/api/': [
          {
            text: 'API Reference',
            items: [
              { text: 'CLI Commands', link: '/api/cli-commands' },
              { text: 'Extension SDK', link: '/api/sdk-reference' },
              { text: 'REST API', link: '/api/rest-api' },
              { text: 'TypeScript Types', link: '/api/extension-types' },
            ],
          },
        ],
        '/contributing/': [
          {
            text: 'Contributing',
            items: [
              { text: 'Development Setup', link: '/contributing/setup' },
              { text: 'Code Standards', link: '/contributing/code-standards' },
              { text: 'Testing Guide', link: '/contributing/testing' },
            ],
          },
        ],
      },

      socialLinks: [{ icon: 'github', link: 'https://github.com/eskarlat/rex' }],

      search: {
        provider: 'local',
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright 2026 RenreKit Contributors',
      },

      editLink: {
        pattern: 'https://github.com/eskarlat/rex/edit/main/doc/:path',
        text: 'Edit this page on GitHub',
      },
    },
  }),
);
