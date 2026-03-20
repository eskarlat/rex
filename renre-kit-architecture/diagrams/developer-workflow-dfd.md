# Developer Workflow — Data Flow Diagrams

Data flow diagrams for the RenRe Developer Workflow extension, covering task classification, DAG orchestration, agent communication, and knowledge memory.

See [ADR-001: DAG-Based Workflow Orchestration](../adr/developer-workflow/ADR-001-dag-based-workflow-orchestration.md)

---

## 1. Task Classification and Routing Flow

How an incoming task is analyzed, scored, and routed to the appropriate workflow tier.

```mermaid
flowchart TD
    A[User Task Description] --> B[Orchestrator Skill]
    B --> C{Read Knowledge Memory}
    C --> |LEARNINGS.md exists| D[Load Classification Insights]
    C --> |No memory yet| E[Use Default Scoring]
    D --> F[Score 5 Dimensions]
    E --> F
    F --> G{Total Score}
    G --> |0–3| H[Quick Fix Workflow]
    G --> |4–7| I[Bug Fix Workflow]
    G --> |8–15| J[Complex Task Workflow]
    H --> K[Create Plan Directory]
    I --> K
    J --> K
    K --> L[Write PLAN.md with Classification]
    L --> M[Begin DAG Execution]

    style A fill:#e8f5e9,stroke:#2e7d32
    style H fill:#e3f2fd,stroke:#1565c0
    style I fill:#fff3e0,stroke:#e65100
    style J fill:#fce4ec,stroke:#c62828
```

---

## 2. DAG Orchestration Flow — Complex Task

The full DAG for a complex task showing parallel branches, merge points, and gate nodes.

```mermaid
flowchart TD
    CLS[Classify & Scope] --> R1[Agent A: Domain Research]
    CLS --> R2[Agent B: Codebase Analysis]
    CLS --> R3[Agent C: Dependency Analysis]
    CLS --> R4[Agent D: Architecture Constraints]

    R1 --> MRG[Merge: Synthesize Findings]
    R2 --> MRG
    R3 --> MRG
    R4 --> MRG

    MRG --> PLN[Plan: Write PLAN.md]
    PLN --> REV{Gate: Review Plan vs Requirements}
    REV --> |Gaps found| PLN
    REV --> |Approved| IMP1[Agent A: Implement Module 1]
    REV --> |Approved| IMP2[Agent B: Implement Module 2]
    REV --> |Approved| IMP3[Agent C: Implement Module 3]

    IMP1 --> INT[Integrate: Cross-Module Check]
    IMP2 --> INT
    IMP3 --> INT

    INT --> VAL{Gate: Validate}
    VAL --> |lint/type/test/dup pass| GAP[Gap Analysis: Plan vs Implementation]
    VAL --> |Failures| FIX[Fix Validation Issues]
    FIX --> VAL

    GAP --> |Gaps found| ADDR[Address Gaps]
    ADDR --> VAL2{Gate: Final Validate}
    GAP --> |No gaps| RETRO[Retrospective]
    VAL2 --> |Pass| RETRO
    VAL2 --> |Fail| ADDR

    RETRO --> MEM[Update Knowledge Memory]

    style CLS fill:#e8f5e9,stroke:#2e7d32
    style MRG fill:#f3e5f5,stroke:#6a1b9a
    style REV fill:#fff3e0,stroke:#e65100
    style VAL fill:#fff3e0,stroke:#e65100
    style VAL2 fill:#fff3e0,stroke:#e65100
    style RETRO fill:#e3f2fd,stroke:#1565c0
    style MEM fill:#e3f2fd,stroke:#1565c0
    style FIX fill:#fce4ec,stroke:#c62828
```

---

## 3. Agent Communication Flow

How agents write to and read from the shared plan directory during a workflow.

```mermaid
flowchart TD
    subgraph Orchestrator
        O1[Create plan directory]
        O2[Write PLAN.md]
        O3[Read all agent outputs]
        O4[Write merged-findings.md]
        O5[Update progress.md]
        O6[Generate RETROSPECTIVE.md]
    end

    subgraph ResearchAgents["Research Agents (Parallel)"]
        RA[Scout → codebase-analysis.md]
        RB[Researcher → domain-research.md]
        RC[Architect → architecture-constraints.md]
    end

    subgraph ImplAgents["Implementation Agents (Parallel)"]
        IA[Implementer A → module-auth.md]
        IB[Implementer B → module-api.md]
    end

    subgraph ReviewAgent["Review Agent"]
        VA[Reviewer → gap-analysis.md]
        VB[Reviewer → validation-report.md]
    end

    subgraph PlanDir[".renre-kit/plan/{name}/"]
        PM[PLAN.md]
        RD[research/]
        IM[implementation/]
        RV[review/]
        RT[RETROSPECTIVE.md]
    end

    O1 --> PM
    O2 --> PM
    RA --> RD
    RB --> RD
    RC --> RD
    O3 --> |reads| RD
    O4 --> RD
    IA --> IM
    IB --> IM
    O5 --> IM
    VA --> RV
    VB --> RV
    O6 --> RT

    style PlanDir fill:#f5f5f5,stroke:#616161
    style Orchestrator fill:#e3f2fd,stroke:#1565c0
    style ResearchAgents fill:#e8f5e9,stroke:#2e7d32
    style ImplAgents fill:#fff3e0,stroke:#e65100
    style ReviewAgent fill:#fce4ec,stroke:#c62828
```

---

## 4. Knowledge Memory Flow

How retrospective insights flow from completed workflows into memory and back into future workflows.

```mermaid
flowchart TD
    subgraph CurrentWorkflow["Current Workflow"]
        W1[Execute DAG Phases]
        W2[Generate RETROSPECTIVE.md]
    end

    subgraph MemorySystem[".renre-kit/memory/"]
        M1[retrospectives/]
        M2[LEARNINGS.md]
        M3[patterns/]
        M4[pitfalls/]
    end

    subgraph FutureWorkflow["Future Workflow"]
        F1[Classification Phase]
        F2[Research Phase]
        F3[Planning Phase]
        F4[Validation Phase]
    end

    W1 --> W2
    W2 --> |Archive| M1
    W2 --> |Extract insights| M2
    W2 --> |Discover patterns| M3
    W2 --> |Identify pitfalls| M4

    M2 --> |Classification Insights| F1
    M2 --> |Research Patterns| F2
    M3 --> |Proven approaches| F2
    M4 --> |Known dead ends| F2
    M2 --> |Implementation Patterns| F3
    M2 --> |Validation Insights| F4

    style CurrentWorkflow fill:#e8f5e9,stroke:#2e7d32
    style MemorySystem fill:#f3e5f5,stroke:#6a1b9a
    style FutureWorkflow fill:#e3f2fd,stroke:#1565c0
```

---

## 5. Reclassification Flow

How the orchestrator detects and handles task escalation mid-workflow.

```mermaid
flowchart TD
    A[Executing Current Tier DAG] --> B{Escalation Signal Detected?}
    B --> |No| C[Continue Current DAG]
    B --> |Yes: More files than expected| D[Recalculate Score]
    B --> |Yes: External deps found| D
    B --> |Yes: Repeated validation failures| D

    D --> E{New Tier Higher?}
    E --> |Same or lower| C
    E --> |Higher| F[Pause Current DAG]
    F --> G[Migrate Plan Artifacts]
    G --> H[Update PLAN.md Classification]
    H --> I[Resume at New Tier DAG]
    I --> J[Continue from Current Phase]

    style B fill:#fff3e0,stroke:#e65100
    style E fill:#fff3e0,stroke:#e65100
    style F fill:#fce4ec,stroke:#c62828
    style I fill:#e8f5e9,stroke:#2e7d32
```

---

## 6. Validation Suite Flow

The full validation pipeline that runs as a gate node in every workflow tier.

```mermaid
flowchart TD
    A[Validation Phase Triggered] --> B[Run ESLint]
    B --> C{Lint Pass?}
    C --> |Yes| D[Run TypeCheck]
    C --> |No| E[Write lint errors to validation-report.md]
    E --> F[Report: FAIL]

    D --> G{TypeCheck Pass?}
    G --> |Yes| H[Run Tests with Coverage]
    G --> |No| I[Write type errors to validation-report.md]
    I --> F

    H --> J{Tests Pass & Coverage >= 86%?}
    J --> |Yes| K[Run Duplication Check]
    J --> |No| L[Write test failures to validation-report.md]
    L --> F

    K --> M{Duplication Threshold <= 5?}
    M --> |Yes| N[Write: ALL CHECKS PASSED]
    N --> O[Report: PASS]
    M --> |No| P[Write duplication report to validation-report.md]
    P --> F

    F --> Q[Return to Orchestrator: Fix Required]
    O --> R[Return to Orchestrator: Proceed to Next Phase]

    style O fill:#e8f5e9,stroke:#2e7d32
    style F fill:#fce4ec,stroke:#c62828
    style Q fill:#fce4ec,stroke:#c62828
    style R fill:#e8f5e9,stroke:#2e7d32
```
