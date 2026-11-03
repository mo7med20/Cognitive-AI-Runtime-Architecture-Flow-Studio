# ShiftCore — Role-Driven Progressive Local LLM Runtime Execution

Transform ShiftCore so that zero prototype results are pre-populated as static data; instead, the runtime begins in a clean `S0: Runtime Idle` state and progressively reveals every prototype artifact (`S1 → S5`) in chronological order strictly as each assigned Local Model role executes its live step.

## User Review & Critical Decisions

> [!IMPORTANT]
> Review the confirmed Phase 1 execution and visualization decisions below before proceeding to implementation.

- **Confirmed Decision 1 (Progressive Role-Driven Execution)**: The runtime starts completely empty (`S0 Idle`) before a prompt is submitted. Each stage (`S1` through `S5`) starts empty when entered and reveals its prototype artifacts one by one in chronological order only as its assigned Local Model role runs.
- **Confirmed Decision 2 (Live Role Progress & Streaming Visualization)**: While a Local Model role is actively generating a step, the UI displays a live role progress bar and streaming role output console, and then progressively reveals the stage cards (`Auto-Resolved Facts`, `Requirements R1..R8 & ADRs`, `Parallel Code & Spec Files`, `Verification Audit Matrix & Surgical AST Diff`, and `Cryptographic Seal & Tier-3 Knowledge Unit`).
- **Default Stage & Tab Gating Policy**: Secondary workspace tabs (`System Architecture`, `R1..R8 Proof Matrix`, `3-Tier Knowledge`) and future stage stepper buttons remain locked to the highest stage actually completed by the Local Model roles in the current run (`highestCompletedStage`), ensuring future prototype outputs never leak statically ahead of their execution turn.

---

## 1. Overview & Core Concept

- **What It Does**: ShiftCore governs two collaborating local language models (`Worker A: Implementation Coder Role` on `qwen2.5-coder:7b` and `Worker B: Independent Verification Oracle Role` on `deepseek-coder:6.7b`) across a 5-stage deterministic Software Engineering lifecycle. Nothing appears statically: entering a prompt triggers a live, role-by-role execution sequence where every artifact from the prototype emerges dynamically as its responsible model role completes its task.
- **Target Audience / Persona**: Software engineering researchers, AI runtime architects, and thesis evaluators examining how a governed parallel local model runtime eliminates conversational ambiguity, prevents reward hacking via independent test synthesis, and performs surgical AST repair.
- **Key Value**: Demonstrates an authentic, time-ordered execution lifecycle where every engineering artifact is visibly produced by a specific local model role at the exact moment its stage is reached.

---

## 2. User Experience & Visual Design

- **Key User Flows (Zero-State to Completion)**:
  1. **State `S0` (Clean Idle Runtime)**: On launch or reset, no prototype results exist. The user enters any custom prompt or selects one of the four reference Software Engineering tasks (`Refund API`, `Auth Token Race`, `SQL Injection Refactor`, `Guarded Calculator`) and clicks **Dispatch Prompt to Runtime**.
  2. **Stage 1 Role (`WORKER-S1-INTAKE` — Context & Ambiguity Elicitation Role)**:
     - Displays the live role progress bar and streaming output banner for `qwen2.5-coder:7b`.
     - Progressively reveals: **(Step 1a)** Tier 1 Repository AST Scan Fact → **(Step 1b)** Tier 2 Organizational Policy Fact → **(Step 1c)** Tier 3 Historical Knowledge Fact → **(Step 1d)** The single blocking Ambiguity Gate (`Web Service vs Desktop`) → **(Step 1e)** The compiled `TaskSpec` JSON once the gate is resolved.
  3. **Stage 2 Role (`WORKER-S2-ARCHITECT` — Requirements & ADR Planner Role)**:
     - Unlocked only after Stage 1 is resolved. Clicking **Proceed to Step 2** triggers `WORKER-S2-ARCHITECT`.
     - Progressively streams and reveals the 8 formal verifiable requirements (`R1` through `R8`) and the Architectural Decision Records (`ADR-101`, `ADR-102`) in sequence.
  4. **Stage 3 Parallel Roles (`WORKER-S3A-CODER` ∥ `WORKER-S3B-TEST-ORACLE`)**:
     - Unlocked only after Stage 2 completes. Clicking **Proceed to Step 3** launches both local models in parallel.
     - Dual parallel progress bars track `Worker A (qwen2.5-coder:7b)` synthesizing the implementation files (`Service/Controller` + `prisma/schema.prisma`) alongside `Worker B (deepseek-coder:6.7b)` independently synthesizing the verification test suite (`*.spec.ts`), culminating in immutable Checkpoint `#S3-01`.
  5. **Stage 4 Roles (`WORKER-S4A-VERIFIER` → `WORKER-S4B-PATCHER`)**:
     - Unlocked only after Stage 3 completes. Entering Stage 4 runs `WORKER-S4A-VERIFIER` (`deepseek-coder:6.7b`), which audits `R1..R8` sequentially and reveals the `7/8 PASS, 1 FAIL` verdict (`R8` concurrency/guard failure blocking release).
     - Clicking **Apply Surgical AST Repair** dispatches `WORKER-S4B-PATCHER` (`qwen2.5-coder:7b`), which streams the pinpoint AST patch (`v1.0 → v1.1`), re-runs the verifier oracle, and updates the audit matrix to `8/8 PASS`.
  6. **Stage 5 Role (`WORKER-S5-EXTRACTOR` — Cryptographic Sealer & Tier-3 Knowledge Role)**:
     - Unlocked only after Stage 4 reaches `8/8 PASS`. Runs `WORKER-S5-EXTRACTOR` to sign `#SEAL-402`, promote the newly extracted Knowledge Unit (`KU`) into the persistent Tier-3 store, and unlock the live interactive sandbox runner.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-contrast technical dark slate console (`#0c1018` primary canvas, `#131b28` structural surfaces, `1px` subtle `#263244` borders) engineered for scannable telemetry and zero visual clutter.
  - *Color Palette & Mood*: 60% deep slate neutral canvas, 30% structured steel containers, and 10% semantic accents (`#ff8a4c` active role execution accent, `#53d6ab` verified pass state, `#fb7185` deterministic gate block / failed invariant).
  - *Typography & Hierarchy*: Clean sans headings paired with `JetBrains Mono` / `tabular-nums` for all token counters, latency metrics, SHA-256 checkpoint hashes, and requirement indices (`R1..R8`).
  - *Interactive Feedback & Motion*: Live role execution progress bar (`0% → 100%`), streaming role log lines during stage transitions, and progressive card reveal transitions (`150ms` compositor fade/slide) as each sub-step completes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Chronological Sub-Step Reveal Inside Every Stage**
  - *Chosen Approach*: Combine live local model execution with a deterministic progressive reveal timeline (`stageRevealStep`) inside each stage so sub-artifacts appear in the exact logical order the model role produces them.
  - *Why*: Even when a local model responds quickly (or via fast local fallback), dumping an entire stage's cards onto the screen at once feels static. Revealing each sub-step sequentially with a live role progress bar makes the workflow cycle visibly driven by the active model role.
  - *Alternatives Considered*: Instantaneous full-stage rendering after an async spinner, which was rejected because the user explicitly requested that prototype results appear step-by-step according to the role's workflow cycle rather than as a static dump.

- **Decision 2: Strict Stage & Cross-Tab Gating (`highestCompletedStage`)**
  - *Chosen Approach*: Track the highest stage completed by the local model roles in the active session and gate both the stage stepper and secondary tabs (`R1..R8 Proof Matrix`, `System Architecture`) to only display artifacts produced up to that point.
  - *Why*: Prevents users or evaluators from seeing Stage 3 code or Stage 4 test results before the Stage 2 Planner Role and Stage 3 Parallel Synthesis Roles have actually run.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                TOP RUNTIME BAR & LOCAL LLM CONNECTION CONTROLLER             │
│  [Prompt Dispatch Input]  [Task Switcher]  [Ollama / LM Studio Probe & Config]│
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ Dispatches Prompt (S0 -> S1)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│             PROGRESSIVE ROLE EXECUTION ORCHESTRATOR (State Engine)           │
│  • isRuntimeIdle (true on start/reset; zero static prototype data shown)     │
│  • highestCompletedStage (-1 in S0, advances 0 -> 1 -> 2 -> 3 -> 4 in order) │
│  • activeRoleStream { roleId, modelName, progressPct, streamLines, stepIdx } │
└───────┬──────────────────────────────┼───────────────────────────────┬───────┘
        │                              │                               │
        ▼                              ▼                               ▼
┌───────────────────────┐  ┌───────────────────────────┐  ┌────────────────────┐
│  LOCAL MODEL BRIDGE   │  │   STAGE 1–5 PROGRESSIVE   │  │ SYNCHRONIZED VIEWS │
│  • Browser Localhost  │  │      WORKFLOW STUDIO      │  │ • Architecture Map │
│    (11434 / 1234)     │  │ • Live Role Progress Bar  │  │ • R1..R8 Matrix    │
│  • Express Proxy      │  │ • Streaming Role Console  │  │   (Gated by Stage) │
│    (/api/llm/*)       │  │ • Step-by-Step Card Reveal│  │ • 3-Tier Knowledge │
└───────────────────────┘  └───────────────────────────┘  └────────────────────┘
```

- **Data Model & State**:
  - `isRuntimeIdle`: Defaults to `true` so the application always opens in a clean `S0` state awaiting a prompt.
  - `highestCompletedStage`: Tracks which stages (`0..4`) have actually been executed by their Local Model roles in the current run.
  - `stageSubStepProgress`: Tracks the progressive sub-step reveal index within the currently active stage (`0..N`) along with live role streaming status text and percentage (`0..100%`), plus a **Skip Animation / Reveal Stage Immediately** affordance for fast inspection after watching the role stream.

- **Interactive Component & State Mapping**:
  - **Prompt Submission (`S0 → S1`)**: Resets `highestCompletedStage` to `0`, starts `WORKER-S1-INTAKE`, streams role progress from `0% → 100%`, and sequentially reveals Tier 1 Fact → Tier 2 Fact → Tier 3 Fact → Ambiguity Gate.
  - **Ambiguity Gate Selection (`S1`)**: Resolves the platform target (`Web` or `Desktop`), reveals the compiled `TaskSpec` JSON, and unlocks the **Proceed to Step 2** button.
  - **Stage Advancement (`S1 → S2 → S3 → S4 → S5`)**: Each transition button invokes the corresponding live Local Model worker (`WORKER-S2-ARCHITECT`, `WORKER-S3A-CODER ∥ WORKER-S3B-TEST`, `WORKER-S4A-VERIFIER`, `WORKER-S4B-PATCHER`, `WORKER-S5-EXTRACTOR`), streams the role's progress bar and execution log, and reveals that stage's prototype cards in chronological order.
