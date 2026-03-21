---
layout: home

hero:
  name: RenreKit
  text: Plugin-Driven Development CLI
  tagline: A tiny core that becomes powerful through extensions. Think VS Code, but for your terminal and AI workflows.
  image:
    src: /logo.svg
    alt: RenreKit
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What Is RenreKit?
      link: /guide/what-is-renrekit
    - theme: alt
      text: View on GitHub
      link: https://github.com/eskarlat/rex

features:
  - icon: 🔌
    title: Extension-First Architecture
    details: Everything is an extension — commands, UI panels, LLM skills. The core just discovers, loads, and routes.
  - icon: 🖥️
    title: Web Dashboard
    details: A beautiful React dashboard with marketplace, live logs, scheduler, vault management, and extension panels.
  - icon: 🤖
    title: LLM Skills
    details: Extensions ship SKILL.md files that teach AI agents new capabilities. Activate an extension and your AI gets smarter.
  - icon: 🔐
    title: Encrypted Vault
    details: AES-256-GCM encrypted secrets. Extensions reference vault entries in their config — values are decrypted transparently.
  - icon: 📦
    title: Three Extension Types
    details: Standard (in-process), MCP stdio (child process), or MCP SSE (remote HTTP). Pick what fits your use case.
  - icon: ⚡
    title: Zero-Config Scaffolding
    details: Run npx create-renre-extension and you're off. Manifest, lifecycle hooks, UI panel, agent assets — all set up.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}
</style>
