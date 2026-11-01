# ShiftCore — Cognitive AI Runtime Architecture & Calculator Flow Studio

This specification documents the finalized, presentation-ready architecture and user experience of **ShiftCore — Cognitive AI Runtime Platform for Enterprises**, built around the reference task **«اعمل آلة حاسبة» (Make a Calculator)** to demonstrate end-to-end runtime governance, architectural relationships, and data dependencies for the university defense.

## User Review & Critical Decisions

> [!IMPORTANT]
> Per your confirmed selections, the application will **preserve the current synchronized split-screen interface exactly as it is**, retaining bilingual English and Arabic terms without adding extra panels.

- **Confirmed Language Presentation**: Keep the current split-screen presentation with both English and Arabic terms (`«اعمل آلة حاسبة»` and bilingual module subtitles).
- **Confirmed Interface Scope**: Preserve the current clean interface layout across all 4 tabs (`Calculator Runtime Flow`, `Full Architecture Map`, `Evidence Traceability`, and `Professor Q&A Brief`) without introducing new panels.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an interactive university defense studio that walks through the 5-stage lifecycle of the reference task **«اعمل آلة حاسبة»** (*Understand → Plan → Work → Check & Repair → Verified Result*) while simultaneously visualizing the 8 internal Runtime Modules (`MOD-01` through `MOD-08`) and 14 inter-module data dependency contracts.
- **Target Audience / Persona**: University graduation project committee, professors, and academic evaluators reviewing how an enterprise AI runtime governs AI agents.
- **Key Value**: Demonstrates why *"a relevant AI response does not equal a verified completed task"* by making ambiguity gating, policy vs. preference separation, state-aware execution, independent verification (`DIV-ZERO-01`), surgical repair, and controlled `pgvector` experience reuse visibly verifiable on screen.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Step 1 · Understand**: Inspect the raw Arabic prompt `«اعمل آلة حاسبة»`, review the 5 retrieved context/policy/experience inputs (`TypeScript` preference, `no eval()` mandatory rule, `Node.js` runtime, `0` matched `pgvector` experiences), and resolve the blocking material question (*Where should the calculator run?*) by selecting **`Web`**.
  2. **Step 2 · Plan**: Review the 5-step execution plan, the Completion Contract, the visual separation of **7 User Requirements + 1 Runtime Quality Gate (`Safe invalid division`)**, and the 4 Architectural Decisions (`Web application`, `TypeScript`, `Vanilla TS + Vite` vs. rejected `React/Next.js`, `No backend`) with interactive **`Why?`** drawers.
  3. **Step 3 · Work**: Observe the critical runtime status split where **`Agent Status = IMPLEMENTATION COMPLETE`** while **`Runtime Task Status = VERIFYING`**, retaining `Checkpoint #S3-01` and streaming 13 provenance records to PostgreSQL.
  4. **Step 4 · Check & Targeted Repair**: Inspect the 4 verification summary cards (`8/8 Requirements Covered`, `7/8 Acceptance Checks Passed ✕`, `4/4 Rules Followed`, `13/13 Evidence Collected`), examine the `DIV-ZERO-01` division-by-zero failure (`8 ÷ 0 → Infinity`), and click **`Fix & verify again`** to trigger the surgical repair loop (`MOD-08 → MOD-06 → MOD-08`) and flip the verification status to **`8 / 8 ✓ PASS`**.
  5. **Step 5 · Result**: View the **`✓ VERIFIED COMPLETE`** seal, interact with the live working **Calculator Web Application (`Artifact v1`)** via mouse or physical keyboard (`Test 8 ÷ 0 → Error`, `Test 7 × 6 → 42`), and inspect the **`pgvector` Verified Experience** record and 8-step audit history.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Authoritative enterprise runtime studio matching the signature **ShiftCore** reference identity.
  - *Color Palette & Mood*: Deep navy background canvas (`#050b1a`, `#071020`), structured slate-navy cards (`#0b1528`, `#0e1b31`), crisp hairline borders (`#223149`), signature ShiftCore orange (`#ff7015`), verified emerald (`#35d39a`), runtime blue (`#60a5fa`), and blocked rose (`#ff6b72`).
  - *Typography & Hierarchy*: `Plus Jakarta Sans` for display headings, `DM Sans` for readable prose and Arabic labels, and `JetBrains Mono` (`tabular-nums`) for all metrics, evidence IDs, and data contracts.
  - *Component Styling & Layout*: Strict 3-zone top bar with top orange accent stripe, 5-step horizontal journey bar, and a 12-column split-screen workspace (`7 cols` interactive Calculator lifecycle on the left + `5 cols` synchronized 8-node Runtime Architecture Pipeline on the right).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Side-by-Side Split-Screen Synchronization (`Calculator Runtime Flow`)**
  - *Chosen Approach*: Pair the user-facing 5-stage Calculator workflow on the left with the 8-module Runtime Architecture Pipeline on the right, automatically sorting active stage modules to the top.
  - *Why*: Allows the Professor to see both *what happens to the Calculator task* and *which internal Runtime modules and database tables execute* without scrolling to the bottom of the page.
  - *Alternatives Considered*: Placing the architecture diagram below the fold or only in a separate tab made it harder to connect user actions to internal runtime components during a live talk.
- **Decision 2: Clean Structured Swimlanes Over Overlapping Freeform Graphs (`Full Architecture Map`)**
  - *Chosen Approach*: Organize the 8 Runtime modules into 4 aligned architectural swimlanes (*Intake, Policy & Vector Memory*, *Ambiguity & Provenance Ledger*, *Planning & Stateful Sandbox*, and *Independent Verification Gate*) paired with an interactive Upstream/Downstream Data Contract Inspector and 14-row specification table.
  - *Why*: Guarantees 100% legibility on a university projector with zero overlapping text labels.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                        SHIFTCORE PRESENTATION & SIMULATION SHELL                         │
│     Top Bar: [ShiftCore] ── [4 Workspace View Tabs] ── [Reset Demo / Fast-Forward]       │
└───────────────────────────────┬──────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┴────────────────────────┐
        ▼                                                ▼
┌───────────────────────────────────────────┐    ┌─────────────────────────────────────────┐
│   LEFT: 5-STAGE CALCULATOR TASK JOURNEY   │    │ RIGHT: 8-MODULE RUNTIME DATA PIPELINE   │
│                                           │    │                                         │
│ [1] Understand: «اعمل آلة حاسبة»          │◄──►│ MOD-01 Intake Gateway (TaskRequest)     │
│     • Context + Policy + pgvector check   │    │ MOD-02 Policy Engine (no eval vs TS)    │
│     • Blocking Gate: Web vs. Desktop      │    │ MOD-03 Experience Store (pgvector)      │
│                                           │    │ MOD-04 Ambiguity Analyzer (TaskSpec v1) │
│ [2] Plan: 7 User Reqs + 1 Quality Gate    │◄──►│ MOD-05 Planner & Router (ExecutionDAG)  │
│     • 4 ADRs (Vanilla TS+Vite; No React)  │    │                                         │
│                                           │    │ MOD-06 State-Aware Sandbox              │
│ [3] Work: Agent=DONE vs. Task=VERIFYING   │◄──►│   • Retains Checkpoint #S3-01           │
│                                           │    │                                         │
│ [4] Check: 7/8 Blocked (DIV-ZERO-01)      │◄──►│ MOD-07 Evidence Ledger (13/13 Postgres) │
│     • Targeted Repair Loop (8÷0 → Error)  │    │ MOD-08 Verifier & Completion Gate       │
│                                           │    │   • Surgical Repair Loop ↺ to MOD-06    │
│ [5] Result: 8/8 Sealed + Live Calculator  │◄──►│   • Seals Artifact v1 + pgvector Index  │
└───────────────────────────────────────────┘    └─────────────────────────────────────────┘
```

- **Data Model & State**:
  - `SimulationState`: Tracks `currentStage` (`0..4`), `clarifiedPlatform` (`'web' | 'desktop' | null`), `repaired` (`boolean`), `selectedComponentId` (`MOD-01..MOD-08`), and `dependencyFilter`.
  - `CalculatorState`: Deterministic state machine (`stepCalculator`) supporting digits `0–9`, decimal `.`, operators `+`, `-`, `×`, `÷`, clear `C`, and the zero-denominator guard (`8 ÷ 0 → Error`).
- **Interactive Component & State Mapping**:
  - Selecting **`Web`** in Step 1 transitions `clarifiedPlatform` to `'web'`, unlocking Steps 2–4 and updating `MOD-04` to `✓ CLARIFIED: WEB LOCKED`.
  - Clicking **`Fix & verify again`** in Step 4 sets `repaired = true`, updating acceptance checks from `7/8 ✕` to `8/8 ✓`, flipping `REQ-08` (`DIV-ZERO-01`) from `FAIL` to `PASS`, and unlocking Step 5.
