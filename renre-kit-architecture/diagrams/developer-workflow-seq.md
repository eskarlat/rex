# Developer Workflow — Sequence Diagrams

Sequence diagrams for each workflow tier in the RenRe Developer Workflow extension, showing agent interactions, phase transitions, and file operations.

See [ADR-001: DAG-Based Workflow Orchestration](../adr/developer-workflow/ADR-001-dag-based-workflow-orchestration.md)

---

## 1. Quick Fix Workflow Sequence

Minimal ceremony: single scout agent, direct implementation, validation, and retrospective.

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant S as Scout Agent
    participant FS as .renre-kit/plan/
    participant M as Extension Memory
    participant V as Validation Suite

    U->>O: Task description
    O->>M: Read LEARNINGS.md (if exists)
    M-->>O: Classification insights
    O->>O: Score dimensions (total: 0–3)
    O->>FS: Create plan dir + PLAN.md (tier: quick-fix)

    Note over O,S: Research Phase (1 agent)
    O->>S: Locate relevant code
    S->>FS: Write research/codebase-analysis.md
    S-->>O: Code located, 1 file affected

    Note over O: Implementation Phase (inline)
    O->>O: Implement the change directly
    O->>FS: Update implementation/progress.md

    Note over O,V: Validation Phase
    O->>V: Run full suite (lint + typecheck + test + duplication)
    V->>FS: Write review/validation-report.md
    V-->>O: PASS / FAIL

    alt Validation FAIL
        O->>O: Fix issues
        O->>V: Re-run validation
        V-->>O: PASS
    end

    Note over O: Gap Analysis (quick diff)
    O->>FS: Write review/gap-analysis.md (brief)

    Note over O,M: Retrospective Phase
    O->>FS: Generate RETROSPECTIVE.md
    O->>M: Archive retrospective
    O->>M: Update LEARNINGS.md with insights
    O-->>U: Task complete + summary
```

---

## 2. Bug Fix Workflow Sequence

Parallel investigation with 3 agents, merge findings, plan fix, implement, validate, verify regression.

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant A as Agent A (Reproduce)
    participant B as Agent B (Root Cause)
    participant C as Agent C (Related Code)
    participant FS as .renre-kit/plan/
    participant M as Extension Memory
    participant V as Validation Suite

    U->>O: Bug report / description
    O->>M: Read LEARNINGS.md (if exists)
    M-->>O: Classification insights + known pitfalls
    O->>O: Score dimensions (total: 4–7)
    O->>FS: Create plan dir + PLAN.md (tier: bug-fix)

    Note over O,C: Research Phase (3 parallel agents)
    par Parallel Investigation
        O->>A: Reproduce and isolate the bug
        O->>B: Find root cause
        O->>C: Check related code and similar patterns
    end
    A->>FS: Write research/reproduction-analysis.md
    B->>FS: Write research/root-cause-analysis.md
    C->>FS: Write research/related-code-analysis.md
    A-->>O: Bug reproduced, trigger identified
    B-->>O: Root cause found in module X
    C-->>O: 2 similar patterns found, 1 also affected

    Note over O: Merge Phase
    O->>FS: Read all research/ files
    O->>FS: Write research/merged-findings.md

    Note over O: Planning Phase
    O->>FS: Update PLAN.md with fix approach
    O->>FS: Write implementation/module-breakdown.md

    Note over O: Implementation Phase
    O->>O: Implement fix based on plan
    O->>FS: Write implementation/module-fix.md
    O->>FS: Update implementation/progress.md

    Note over O,V: Validation Phase
    O->>V: Run full suite
    V->>FS: Write review/validation-report.md
    V-->>O: PASS / FAIL

    alt Validation FAIL
        O->>O: Fix issues
        O->>V: Re-run validation
        V-->>O: PASS
    end

    Note over O: Regression Verification
    O->>O: Verify original bug is fixed
    O->>O: Verify related patterns are addressed

    Note over O: Gap Analysis
    O->>FS: Read PLAN.md + implementation files
    O->>FS: Write review/gap-analysis.md

    alt Gaps Found
        O->>O: Address remaining gaps
        O->>V: Re-validate
        V-->>O: PASS
    end

    Note over O,M: Retrospective Phase
    O->>FS: Generate RETROSPECTIVE.md
    O->>M: Archive retrospective
    O->>M: Update LEARNINGS.md
    O->>M: Create pitfalls/ entry if new pitfall discovered
    O-->>U: Bug fixed + summary
```

---

## 3. Complex Task Workflow Sequence

Full DAG with parallel research (4 agents), plan review gate, parallel implementation (3 agents), integration, validation, gap analysis loop, and retrospective.

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant R1 as Researcher
    participant R2 as Scout
    participant R3 as Scout (Deps)
    participant R4 as Architect
    participant FS as .renre-kit/plan/
    participant M as Extension Memory
    participant V as Validation Suite

    U->>O: Feature / complex task description
    O->>M: Read LEARNINGS.md + patterns/ + pitfalls/
    M-->>O: Full knowledge context
    O->>O: Score dimensions (total: 8–15)
    O->>FS: Create plan dir + PLAN.md (tier: complex)

    Note over O,R4: Research Phase (4 parallel agents)
    par Parallel Research
        O->>R1: Domain & API research
        O->>R2: Codebase pattern analysis
        O->>R3: Dependency & impact analysis
        O->>R4: Architecture constraints
    end
    R1->>FS: Write research/domain-research.md
    R2->>FS: Write research/codebase-analysis.md
    R3->>FS: Write research/dependency-analysis.md
    R4->>FS: Write research/architecture-constraints.md
    R1-->>O: Domain findings ready
    R2-->>O: Codebase patterns identified
    R3-->>O: 12 files impacted, 3 external deps
    R4-->>O: Architecture constraints documented

    Note over O: Merge Phase
    O->>FS: Read all research/ files
    O->>FS: Write research/merged-findings.md
    O->>O: Check for contradictions across agents

    alt Contradictions Found
        O-->>U: Flag conflicting findings for resolution
        U-->>O: Resolution guidance
    end

    Note over O,R4: Planning Phase
    O->>R4: Design solution architecture
    R4->>FS: Write implementation/module-breakdown.md
    O->>FS: Update PLAN.md with full implementation plan

    Note over O: Plan Review Gate
    O->>O: Compare plan against original requirements
    O->>FS: Read PLAN.md + research/merged-findings.md

    alt Plan Gaps Found
        O->>O: Revise plan
        O->>FS: Update PLAN.md
    end
```

---

## 4. Complex Task — Implementation & Validation Sequence

Continuation of the complex task workflow after plan approval.

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant I1 as Implementer A
    participant I2 as Implementer B
    participant I3 as Implementer C
    participant RV as Reviewer
    participant FS as .renre-kit/plan/
    participant GM as Global Memory
    participant PM as Project Memory
    participant V as Validation Suite

    Note over O,I3: Implementation Phase (3 parallel agents)
    O->>FS: Read implementation/module-breakdown.md
    par Parallel Implementation
        O->>I1: Implement Module 1 (auth layer)
        O->>I2: Implement Module 2 (API endpoints)
        O->>I3: Implement Module 3 (UI components)
    end
    I1->>FS: Write implementation/module-auth.md
    I2->>FS: Write implementation/module-api.md
    I3->>FS: Write implementation/module-ui.md
    I1-->>O: Module 1 complete
    I2-->>O: Module 2 complete
    I3-->>O: Module 3 complete

    Note over O: Integration Phase
    O->>O: Cross-module integration check
    O->>FS: Write implementation/integration-notes.md
    O->>FS: Update implementation/progress.md

    Note over O,V: Validation Phase
    O->>V: Run full suite (lint + typecheck + test + duplication)
    V->>FS: Write review/validation-report.md
    V-->>O: PASS / FAIL

    alt Validation FAIL
        O->>O: Diagnose failures
        O->>O: Fix validation issues
        O->>V: Re-run validation
        V-->>O: PASS
    end

    Note over O,RV: Gap Analysis Phase
    O->>RV: Compare PLAN.md vs actual implementation
    RV->>FS: Read PLAN.md + all implementation/ files
    RV->>FS: Write review/gap-analysis.md
    RV-->>O: Gap report ready

    alt Gaps Found
        Note over O: Address Gaps Loop
        O->>O: Implement missing items
        O->>V: Final validation
        V-->>O: PASS
        O->>RV: Re-check gaps
        RV-->>O: All gaps addressed
    end

    Note over O,GM: Retrospective Phase (Two-Layer Memory)
    O->>FS: Generate RETROSPECTIVE.md (detailed)
    O->>O: Classify each insight as global or project
    O->>GM: Archive retro to retrospectives/{project}--{name}.retro.md
    O->>GM: Update global LEARNINGS.md (workflow insights)
    O->>PM: Archive retro to retrospectives/{name}.retro.md
    O->>PM: Update project LEARNINGS.md (codebase insights)
```

---

## 5. Reclassification Sequence

How the orchestrator escalates a task mid-workflow when complexity is discovered.

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant A as Active Agent
    participant FS as .renre-kit/plan/

    Note over O,A: Executing Bug Fix Workflow
    A-->>O: Research complete — found 12 files affected + OAuth dependency
    O->>O: Escalation signal: files > expected, external deps found
    O->>O: Recalculate score: was 6 → now 10
    O->>O: New tier: Complex (was Bug Fix)

    Note over O: Reclassification
    O->>FS: Update PLAN.md classification section
    Note right of FS: Tier: Complex (score: 10/15)<br/>Escalated from: Bug Fix (score: 6)
    O->>FS: Preserve existing research/ artifacts
    O->>O: Switch to Complex Task DAG
    O->>O: Resume from Research phase (spawn additional agents)

    Note over O,A: Continue with Complex Task DAG
    O->>A: Additional research agents spawned
```

---

## 6. Two-Layer Knowledge Memory Update Sequence

How retrospective insights are classified, routed to global or project memory, and pruned.

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant FS as .renre-kit/plan/{name}/
    participant GM as Global Memory
    participant PM as Project Memory

    Note over O: Workflow Complete
    O->>O: Compile workflow metrics
    O->>O: Analyze what went well / wrong
    O->>FS: Write RETROSPECTIVE.md

    Note over O: Classify Insights
    O->>O: For each insight: workflow process? → Global
    O->>O: For each insight: general dev technique? → Global
    O->>O: For each insight: codebase-specific? → Project
    O->>O: For each insight: tech stack config? → Project
    O->>O: Ambiguous insights → Both layers

    Note over O,GM: Global Memory Update
    O->>GM: Archive to retrospectives/{project}--{name}.retro.md
    O->>GM: Read existing LEARNINGS.md
    O->>O: Deduplicate global insights
    O->>GM: Merge workflow insights into LEARNINGS.md

    alt New Workflow Pattern
        O->>GM: Write patterns/{pattern-name}.md
    end

    alt New General Pitfall
        O->>GM: Write pitfalls/{pitfall-name}.md
    end

    Note over O,PM: Project Memory Update
    O->>PM: Archive to retrospectives/{name}.retro.md
    O->>PM: Read existing LEARNINGS.md
    O->>O: Deduplicate project insights
    O->>PM: Merge codebase insights into LEARNINGS.md

    alt New Project Pattern
        O->>PM: Write patterns/{pattern-name}.md
    end

    alt New Project Pitfall
        O->>PM: Write pitfalls/{pitfall-name}.md
    end

    Note over O,GM: Global Pruning
    O->>GM: Count retrospectives/
    alt Count > 100
        O->>O: Summarize oldest into LEARNINGS.md
        O->>GM: Remove oldest retrospectives
    end
    O->>GM: Check LEARNINGS.md line count
    alt Lines > 500
        O->>O: Consolidate overlapping insights
        O->>GM: Write consolidated LEARNINGS.md
    end

    Note over O,PM: Project Pruning
    O->>PM: Count retrospectives/
    alt Count > 30
        O->>O: Summarize oldest into LEARNINGS.md
        O->>PM: Remove oldest retrospectives
    end
    O->>PM: Check LEARNINGS.md line count
    alt Lines > 300
        O->>O: Consolidate overlapping insights
        O->>PM: Write consolidated LEARNINGS.md
    end
```
