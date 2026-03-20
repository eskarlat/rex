# Developer Workflow — System Interaction Diagrams

How commands, skills, and hooks work together as a feedback loop to coordinate the agent team. These diagrams show the **real system** — what executes, what guides, and what tracks automatically.

See [ADR-005: Prompt-Based Orchestration Constraints](../adr/developer-workflow/ADR-005-prompt-based-orchestration-constraints.md)
See [ADR-006: Extension Manifest and Agent Asset Structure](../adr/developer-workflow/ADR-006-extension-manifest-and-agent-assets.md)
See [ADR-007: Developer Experience and Activation](../adr/developer-workflow/ADR-007-developer-experience-and-activation.md)

---

## 1. The Core Feedback Loop

Commands, skills, and hooks form a continuous cycle. Each tool type feeds the next.

```mermaid
flowchart TD
    subgraph Hooks["HOOKS (Automatic)"]
        H1[SessionStart]
        H2[Stop]
        H3[PreCompact]
        H4[SubagentStart]
        H5[SubagentStop]
        H6[PostToolUse]
        H7[ErrorOccurred]
    end

    subgraph Commands["COMMANDS (Deterministic)"]
        C1["workflow:context"]
        C2["workflow:init"]
        C3["workflow:progress"]
        C4["workflow:validate"]
        C5["workflow:retro"]
        C6["workflow:abort"]
        C7["workflow:status"]
        C8["workflow:commit"]
        C9["workflow:hook"]
    end

    subgraph Skills["SKILLS (LLM Guidance)"]
        S1["orchestrate — when & how to use the workflow"]
        S2["classify — scoring rubric & examples"]
        S3["research — how to investigate a codebase"]
        S4["implement — file ownership & coding standards"]
        S5["review — gap analysis & validation interpretation"]
    end

    subgraph UI["DASHBOARD (Observability)"]
        U1["Active Workflow Widget"]
        U2["Workflow Dashboard Panel"]
        U3["Prompt Stats / Activity Heatmap"]
    end

    %% Hook → Command (automatic triggers)
    H1 -->|fires on session start| C1
    H2 -->|fires on session end| C9
    H3 -->|fires before compaction| C9
    H4 -->|fires on agent spawn| C9
    H5 -->|fires on agent complete| C9
    H6 -->|fires after file write| C9
    H7 -->|fires on error| C9

    %% Command → Skill (command output guides LLM to skill)
    C1 -->|"returns: 'no active workflow' + project learnings"| S1
    C1 -->|"returns: 'active workflow, resume at phase X'"| S3
    C1 -->|"returns: 'active workflow, resume at phase X'"| S4

    %% Skill → Command (LLM follows skill, calls commands)
    S1 -->|"LLM decides to start workflow"| C2
    S2 -->|"LLM provides dimension scores"| C2
    S3 -->|"research complete, record progress"| C3
    S4 -->|"implementation complete, validate"| C4
    S5 -->|"review complete, write retro"| C5

    %% Command → Hook (commands produce state that hooks track)
    C2 -->|"creates plan dir, writes PLAN.md"| H6
    C3 -->|"updates progress.md"| H6
    C4 -->|"writes validation-report.md"| H6

    %% Hook → UI (hooks feed observability data)
    C9 -->|"stores agent stats, errors, file writes"| U1
    C9 -->|"stores agent stats, errors, file writes"| U2
    C9 -->|"stores prompt/token metrics"| U3

    %% Command → UI (commands provide workflow state)
    C7 -->|"workflow list & status"| U2

    style Hooks fill:#e8f5e9,stroke:#2e7d32
    style Commands fill:#e3f2fd,stroke:#1565c0
    style Skills fill:#fff3e0,stroke:#e65100
    style UI fill:#f3e5f5,stroke:#6a1b9a
```

---

## 2. Full Bug Fix Workflow — Tool Type Per Step

Every step annotated with which tool type drives it: **[H]** Hook, **[C]** Command, **[S]** Skill, **[L]** LLM judgment.

```mermaid
sequenceDiagram
    participant Hook as Hooks
    participant Cmd as Commands
    participant LLM as LLM + Skills
    participant Plan as Plan Directory
    participant UI as Dashboard
    participant User as User

    Note over Hook,User: SESSION START

    Hook->>Cmd: [H] SessionStart fires
    Cmd->>Plan: [C] workflow:context reads progress.md
    Cmd->>LLM: [C] Returns project learnings + active workflow state
    LLM->>LLM: [S] orchestrate SKILL.md loaded

    Note over Hook,User: TASK ARRIVES

    User->>LLM: "Users get logged out after 30 minutes"
    LLM->>LLM: [S] classify SKILL.md — score 5 dimensions
    LLM->>LLM: [L] scores: files=1, domain=1, risk=2, deps=1, uncertainty=1
    LLM->>User: [L] "Bug Fix (score: 6/15). I'll research before fixing."
    LLM->>User: [L] "Create a workflow branch?"
    User->>LLM: "Yes" / "No, use current branch"
    LLM->>Cmd: [C] workflow:init --name fix-session-timeout --scores "..."
    Cmd->>Plan: [C] Creates plan dir, PLAN.md, git branch (if approved)
    Cmd->>UI: [C] Active workflow appears in widget

    Note over Hook,User: RESEARCH PHASE — AGENT TEAM

    LLM->>LLM: [S] research SKILL.md — investigation guide
    LLM->>LLM: [L] Spawn 3 research agents

    par Agent A: Reproduce
        Hook->>Cmd: [H] SubagentStart fires
        Cmd->>UI: [C] workflow:hook — agent A tracked (1/3 running)
        LLM->>Plan: [S] Write research/reproduction-analysis.md
        Hook->>Cmd: [H] PostToolUse — file write logged
        Hook->>Cmd: [H] SubagentStop fires
        Cmd->>UI: [C] workflow:hook — agent A done (0/3 running, 1/3 complete)
    and Agent B: Root Cause
        Hook->>Cmd: [H] SubagentStart fires
        Cmd->>UI: [C] workflow:hook — agent B tracked (1/3 running)
        LLM->>Plan: [S] Write research/root-cause-analysis.md
        Hook->>Cmd: [H] SubagentStop fires
        Cmd->>UI: [C] workflow:hook — agent B done
    and Agent C: Related Code
        Hook->>Cmd: [H] SubagentStart fires
        Cmd->>UI: [C] workflow:hook — agent C tracked
        LLM->>Plan: [S] Write research/related-code-analysis.md
        Hook->>Cmd: [H] SubagentStop fires
        Cmd->>UI: [C] workflow:hook — agent C done (3/3 complete)
    end

    LLM->>Cmd: [C] workflow:progress --phase research --status complete --agents 3
    Cmd->>Plan: [C] Append to progress.md
    Cmd->>UI: [C] Phase progress updated

    Note over Hook,User: MERGE PHASE — ORCHESTRATOR SYNTHESIZES

    LLM->>Plan: [L] Read all 3 research files
    LLM->>LLM: [L] Detect contradiction: refresh logic in 2 places
    LLM->>User: [L] "Research found token refresh in auth.ts AND session.ts. Fix both independently or consolidate?"
    User->>LLM: "Fix both, keep separate"
    LLM->>Plan: [S] Write research/merged-findings.md
    LLM->>Cmd: [C] workflow:progress --phase merge --status complete

    Note over Hook,User: PLANNING PHASE

    LLM->>LLM: [S] implement SKILL.md — file ownership rules
    LLM->>Plan: [L] Write implementation/module-breakdown.md
    LLM->>Cmd: [C] workflow:progress --phase plan --status complete

    Note over Hook,User: IMPLEMENTATION PHASE

    LLM->>LLM: [S] implement SKILL.md — coding standards
    LLM->>LLM: [L] Implement changes (single agent for bug fix)
    Hook->>Cmd: [H] PostToolUse — tracks each file edit
    Cmd->>UI: [C] File changes visible in dashboard
    LLM->>Cmd: [C] workflow:progress --phase implement --status complete
    LLM->>Cmd: [C] workflow:commit --phase implement

    Note over Hook,User: VALIDATION PHASE

    LLM->>Cmd: [C] workflow:validate
    Cmd->>Cmd: [C] Run lint + typecheck + tests
    Cmd->>Plan: [C] Write review/validation-report.md (FAIL, retry 1/3)
    Cmd->>UI: [C] Validation status: FAIL
    LLM->>LLM: [S] review SKILL.md — interpret failures
    LLM->>LLM: [L] Fix the failing test
    LLM->>Cmd: [C] workflow:validate
    Cmd->>Plan: [C] Write validation-report.md (PASS, retry 2/3)
    Cmd->>UI: [C] Validation status: PASS

    LLM->>Cmd: [C] workflow:progress --phase validate --status complete

    Note over Hook,User: RETROSPECTIVE PHASE

    LLM->>Plan: [S] Write RETROSPECTIVE.md
    LLM->>Cmd: [C] workflow:retro
    Cmd->>Cmd: [C] Archive to project memory, update LEARNINGS.md
    LLM->>Cmd: [C] workflow:commit --phase complete
    LLM->>User: [L] "Fixed. Token refresh in 2 places, both patched."
```

---

## 3. Interruption and Resume — Hook Safety Net

Shows how hooks preserve workflow state even when the LLM doesn't cooperate.

```mermaid
sequenceDiagram
    participant Hook as Hooks
    participant Cmd as Commands
    participant LLM as LLM
    participant Plan as Plan Directory
    participant User as User

    Note over Hook,User: SESSION 1 — Working on Complex Task

    LLM->>LLM: Implementing module 2 of 3...
    Hook->>Cmd: [H] PostToolUse — file writes tracked

    Note over Hook,User: INTERRUPTION (laptop dies / session timeout)

    Hook->>Cmd: [H] Stop fires automatically
    Cmd->>Plan: [C] workflow:hook session-end
    Note right of Plan: progress.md gets:<br/>"paused | implement | 2/3 modules done | {timestamp}"

    Note over Hook,User: SESSION 2 — New Session, Next Day

    Hook->>Cmd: [H] SessionStart fires automatically
    Cmd->>Plan: [C] workflow:context reads progress.md
    Cmd->>LLM: [C] Returns resume context

    Note right of LLM: "Active Workflow: add-oauth-support<br/>Tier: Complex (12/15)<br/>Phase: implement (paused)<br/>Done: modules 1,2 of 3<br/>Remaining: module 3 (ui-components)<br/><br/>Resume implementation."

    LLM->>LLM: [S] implement SKILL.md — continues module 3
    LLM->>Plan: [L] Complete remaining implementation
    LLM->>Cmd: [C] workflow:progress --phase implement --status complete

    Note over Hook,User: CONTEXT EXHAUSTION (mid-session)

    Hook->>Cmd: [H] PreCompact fires before context compression
    Cmd->>Plan: [C] workflow:hook pre-compact
    Note right of Plan: progress.md gets checkpoint:<br/>"checkpoint | validate | retry 1/3, fixing auth.test.ts | {timestamp}"

    Note over Hook,User: After compaction, LLM memory is fuzzy but plan dir has full state
```

---

## 4. Agent Team Communication Pattern

How agents communicate through files, with hooks tracking the process and commands enforcing structure.

```mermaid
flowchart TD
    subgraph Orchestrator["Orchestrator (LLM + orchestrate SKILL.md)"]
        O1["Classify task"]
        O2["Decide team composition"]
        O3["Spawn agents"]
        O4["Read all outputs at merge"]
        O5["Synthesize findings"]
        O6["Assign implementation"]
    end

    subgraph Team["Agent Team (each agent gets a focused SKILL.md)"]
        subgraph ResearchTeam["Research Team"]
            A1["Scout<br/>research SKILL.md<br/>Writes: codebase-analysis.md"]
            A2["Domain Expert<br/>research SKILL.md<br/>Writes: domain-research.md"]
            A3["Dep Scanner<br/>research SKILL.md<br/>Writes: dependency-analysis.md"]
        end
        subgraph ImplTeam["Implementation Team"]
            B1["Implementer A<br/>implement SKILL.md<br/>Owns: auth.ts, auth.test.ts"]
            B2["Implementer B<br/>implement SKILL.md<br/>Owns: session.ts, session.test.ts"]
        end
        subgraph ReviewTeam["Review Team"]
            C1["Reviewer<br/>review SKILL.md<br/>Reads: everything<br/>Writes: gap-analysis.md"]
        end
    end

    subgraph PlanDir[".renre-kit/plan/{name}/ — shared filesystem"]
        P1["PLAN.md"]
        P2["research/*.md"]
        P3["implementation/*.md"]
        P4["review/*.md"]
        P5["progress.md"]
        P6["RETROSPECTIVE.md"]
    end

    subgraph AutoTracking["Automatic Tracking (Hooks → workflow:hook)"]
        T1["SubagentStart/Stop<br/>→ agent count & duration"]
        T2["PostToolUse<br/>→ file write manifest"]
        T3["ErrorOccurred<br/>→ error log"]
        T4["Stop/PreCompact<br/>→ state checkpoint"]
    end

    subgraph Dashboard["Dashboard UI"]
        D1["Agent Activity<br/>■ Scout ✓ 2.3s<br/>■ Domain ✓ 4.1s<br/>■ DepScan ● running"]
        D2["Phase Progress<br/>classify ✓ → research ● → merge → plan → impl"]
        D3["Prompt Stats<br/>Tokens: 45K in / 12K out<br/>Tool calls: 23"]
    end

    %% Orchestrator controls team
    O2 --> A1 & A2 & A3
    O6 --> B1 & B2
    O4 --> C1

    %% Agents write to plan dir (SKILL.md defines output format)
    A1 --> P2
    A2 --> P2
    A3 --> P2
    B1 --> P3
    B2 --> P3
    C1 --> P4

    %% Orchestrator reads plan dir at merge points
    P2 --> O4
    O5 --> P2

    %% Commands enforce structure
    O1 -->|"workflow:init"| P1 & P5
    O3 -->|"workflow:progress"| P5

    %% Hooks track automatically
    A1 & A2 & A3 & B1 & B2 -.-> T1
    A1 & A2 & A3 & B1 & B2 & C1 -.-> T2
    T1 & T2 & T3 -.-> D1
    P5 -.-> D2
    T1 -.-> D3

    style Orchestrator fill:#e3f2fd,stroke:#1565c0
    style ResearchTeam fill:#e8f5e9,stroke:#2e7d32
    style ImplTeam fill:#fff3e0,stroke:#e65100
    style ReviewTeam fill:#fce4ec,stroke:#c62828
    style PlanDir fill:#f5f5f5,stroke:#616161
    style AutoTracking fill:#e8eaf6,stroke:#283593
    style Dashboard fill:#f3e5f5,stroke:#6a1b9a
```

---

## 5. Tool Type Responsibility Matrix

What each tool type is responsible for at every workflow phase.

```mermaid
flowchart LR
    subgraph Phase1["Session Start"]
        direction TB
        P1H["HOOK: SessionStart<br/>auto-fires"]
        P1C["CMD: workflow:context<br/>reads state, returns learnings"]
        P1S["SKILL: orchestrate<br/>loaded into LLM context"]
        P1H --> P1C --> P1S
    end

    subgraph Phase2["Classification"]
        direction TB
        P2S["SKILL: classify<br/>scoring rubric guides LLM"]
        P2L["LLM: scores dimensions<br/>announces tier to user"]
        P2C["CMD: workflow:init<br/>enforces floor rules,<br/>creates plan dir,<br/>asks about git branch"]
        P2S --> P2L --> P2C
    end

    subgraph Phase3["Research"]
        direction TB
        P3S["SKILL: research<br/>investigation guide"]
        P3L["LLM: spawns agent team"]
        P3H["HOOK: SubagentStart/Stop<br/>tracks agents automatically"]
        P3C["CMD: workflow:progress<br/>records phase completion"]
        P3S --> P3L --> P3H --> P3C
    end

    subgraph Phase4["Implementation"]
        direction TB
        P4S["SKILL: implement<br/>coding standards,<br/>file ownership"]
        P4L["LLM: writes code"]
        P4H["HOOK: PostToolUse<br/>tracks file writes"]
        P4C["CMD: workflow:commit<br/>git commit per phase"]
        P4S --> P4L --> P4H --> P4C
    end

    subgraph Phase5["Validation"]
        direction TB
        P5C["CMD: workflow:validate<br/>runs suite, tracks retries"]
        P5S["SKILL: review<br/>interpret failures"]
        P5L["LLM: fixes issues<br/>or asks user at limit"]
        P5C --> P5S --> P5L
        P5L -.->|retry| P5C
    end

    subgraph Phase6["Completion"]
        direction TB
        P6S["SKILL: orchestrate<br/>retrospective guidance"]
        P6L["LLM: writes RETROSPECTIVE.md"]
        P6C["CMD: workflow:retro<br/>archives + updates memory"]
        P6S --> P6L --> P6C
    end

    Phase1 --> Phase2 --> Phase3 --> Phase4 --> Phase5 --> Phase6

    style Phase1 fill:#e8f5e9,stroke:#2e7d32
    style Phase2 fill:#e3f2fd,stroke:#1565c0
    style Phase3 fill:#fff3e0,stroke:#e65100
    style Phase4 fill:#fff3e0,stroke:#e65100
    style Phase5 fill:#fce4ec,stroke:#c62828
    style Phase6 fill:#f3e5f5,stroke:#6a1b9a
```

---

## 6. Dashboard Data Flow — What Hooks Feed the UI

```mermaid
flowchart TD
    subgraph HookEvents["Hook Events (raw data)"]
        E1["SubagentStart<br/>{agentId, role, phase, timestamp}"]
        E2["SubagentStop<br/>{agentId, role, duration, status}"]
        E3["PostToolUse<br/>{tool, file, action, timestamp}"]
        E4["ErrorOccurred<br/>{error, phase, agent, timestamp}"]
        E5["SessionStart<br/>{sessionId, timestamp}"]
        E6["Stop<br/>{sessionId, duration, timestamp}"]
        E7["PreCompact<br/>{tokensUsed, phase, timestamp}"]
    end

    subgraph Storage["workflow:hook stores to"]
        S1[".renre-kit/plan/{name}/metrics/agents.jsonl"]
        S2[".renre-kit/plan/{name}/metrics/files.jsonl"]
        S3[".renre-kit/plan/{name}/metrics/errors.jsonl"]
        S4[".renre-kit/plan/{name}/metrics/sessions.jsonl"]
        S5[".renre-kit/plan/{name}/progress.md"]
    end

    subgraph DashboardWidgets["Dashboard UI"]
        W1["Active Workflow Widget<br/>━━━━━━━━░░░░ 65%<br/>Phase: implement"]
        W2["Agent Activity Panel<br/>┌──────┐ ┌──────┐<br/>│Scout ✓│ │Domain●│<br/>└──────┘ └──────┘"]
        W3["Prompt Statistics<br/>Tokens: 45K / 12K<br/>Duration: 4m 23s"]
        W4["Activity Heatmap<br/>Mon ░░▓▓░░░▓▓▓<br/>Tue ░▓▓░░░▓▓░░"]
        W5["Error Log<br/>0 errors this workflow<br/>2 validation retries"]
    end

    E1 & E2 --> S1
    E3 --> S2
    E4 --> S3
    E5 & E6 & E7 --> S4
    E1 & E2 & E3 --> S5

    S5 --> W1
    S1 --> W2
    S4 --> W3
    S1 & S4 --> W4
    S3 --> W5

    style HookEvents fill:#e8f5e9,stroke:#2e7d32
    style Storage fill:#f5f5f5,stroke:#616161
    style DashboardWidgets fill:#f3e5f5,stroke:#6a1b9a
```

---

## 7. Concurrent Workflows — Independent Isolation

```mermaid
flowchart TD
    subgraph Session["Current LLM Session"]
        LLM["LLM (orchestrator)"]
    end

    subgraph WF1["Workflow: add-oauth-support (Complex, paused)"]
        W1P[".renre-kit/plan/add-oauth-support/"]
        W1B["git branch: workflow/add-oauth-support"]
        W1M["Phase: research (paused)"]
    end

    subgraph WF2["Workflow: fix-session-timeout (Bug Fix, active)"]
        W2P[".renre-kit/plan/fix-session-timeout/"]
        W2B["git branch: workflow/fix-session-timeout"]
        W2M["Phase: implement (in-progress)"]
    end

    subgraph Context["workflow:context output"]
        CTX["## Active Workflows<br/><br/>1. fix-session-timeout (Bug Fix 6/15)<br/>   Phase: implement ●<br/>   Branch: workflow/fix-session-timeout<br/><br/>2. add-oauth-support (Complex 12/15)<br/>   Phase: research (paused)<br/>   Branch: workflow/add-oauth-support<br/><br/>Currently on: workflow/fix-session-timeout"]
    end

    LLM -->|"working on"| WF2
    LLM -.->|"can resume via git checkout"| WF1

    WF1 --- W1P & W1B & W1M
    WF2 --- W2P & W2B & W2M

    LLM -->|"SessionStart hook"| Context

    style WF1 fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray: 5 5
    style WF2 fill:#e8f5e9,stroke:#2e7d32
    style Context fill:#e3f2fd,stroke:#1565c0
    style Session fill:#fff3e0,stroke:#e65100
```
