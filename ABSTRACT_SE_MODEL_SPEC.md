# ShiftCore: Formal Abstract Software Engineering Runtime Specification ($\mathcal{M}_{\text{SE}}$)

## 1. Algebraic Definition of the Abstract SE Model

ShiftCore defines a domain-independent Software Engineering Runtime Metamodel:

$$\mathcal{M}_{\text{SE}} = \langle \mathcal{I}, \mathcal{K}, \mathcal{G}, \mathcal{P}, \mathcal{S}, \mathcal{V} \rangle$$

Where:
1. **$\mathcal{I}$ (`ITaskIntent<TDomain>`)**: Encapsulates the developer's raw prompt and binds it to the active repository AST snapshot before any LLM token generation occurs.
2. **$\mathcal{K}$ (`IRepoKnowledgeContext`)**: The 3-Tier Knowledge Architecture:
   - **Tier 1 (Structural Repo AST)**: Database schemas (`prisma/schema.prisma`), middleware, and call-graph contracts.
   - **Tier 2 (Normative Policy Constitution)**: Immutable security and concurrency rules (`POL-2026-v1`).
   - **Tier 3 (Verified Episodic Memory)**: Reusable `IKnowledgeUnit` patterns admitted *only* after independent verification seal (`#SEAL-402`) and bound to `activePolicyHash`.
3. **$\mathcal{G}$ (`IAmbiguityGate`)**: Deterministic state-machine gate that auto-resolves known repo/policy facts with **0 questions asked** and blocks execution *only* when residual architectural entropy $> 0$.
4. **$\mathcal{P}$ (`IExecutionPlan`)**: Bipartite traceability matrix mapping $R_1 \dots R_8$ and ADRs 1-to-1 to target files and executable test assertions.
5. **$\mathcal{S}$ (`ISandboxedCheckpoint`)**: Content-addressable multi-file AST snapshot (`#S3-01`) with a SHA-256 Merkle digest, enabling localized surgical AST repair (`v1.0 -> v1.1`) without regenerating passing files.
6. **$\mathcal{V}$ (`IVerificationSeal`)**: Independent verification oracle that blocks task completion on any failed assertion and signs `#SEAL-402` only when $8/8$ checks pass.

---

## 2. How ShiftCore Addresses the 4 Instructor Review Critiques

### Critique 1: Why Requirement Elicitation Differs from Normal Conversational AI
- **Normal AI**: Asks ungrounded boilerplate questions ("Which database? Which framework?") or silently guesses.
- **ShiftCore Runtime**: Queries Tier 1 Repo AST + Tier 2 Policy + Tier 3 Knowledge Graph first to auto-resolve known engineering facts with **0 user questions**, halting at a deterministic gate *only* for irreducible domain trade-offs and compiling the choice into a formal JSON Schema contract (`Entropy = 0.00 bits`).

### Critique 2: Full Software Engineering Coding Workflows (Beyond a Calculator)
- **SE-TASK-01 (`feat_refund_api`)**: Multi-file Idempotent Payment Refund API (`refundService.ts`, `schema.prisma`, `refundService.concurrency.spec.ts`) catching and patching a double-refund concurrency race via `SELECT ... FOR UPDATE` under `Serializable` isolation.
- **SE-TASK-02 (`bugfix_auth_race`)**: Distributed JWT Refresh Token Rotation Race bugfix (`tokenRotator.ts`) replacing non-atomic `HGETALL + HSET` with an atomic Redis Lua Compare-And-Swap script and 10s parent grace window.
- **SE-TASK-03 (`refactor_sql_repo`)**: SQL Injection & $N+1$ Query Batch Refactoring (`orderRepository.ts`), reducing 51 queries to 2 via `ANY($1::uuid[])` and patching dynamic `ORDER BY` SQL injection via a frozen compile-time identifier allowlist.
- **Live Custom Prompt Execution**: Connected via Express (`server.ts`) to Ollama (`localhost:11434`) & OpenAI-compatible Local APIs (`qwen2.5-coder`, `deepseek-coder`, `llama3`).

### Critique 3: Polymorphic Abstract Model ($\mathcal{M}_{\text{SE}}$)
- Includes formal UML Class Diagrams, a 6-state Guarded Finite State Automaton ($S_0 \to S_5$ with guards $G_1 \dots G_5$), and a 6-actor End-to-End Sequence Diagram.

### Critique 4: 3-Tier Knowledge Lifecycle, Cross-Task Reuse & Policy Invalidation
- Demonstrates **Task $N \to$ Task $N+1$ Reuse** (e.g., reusing `KU-201` from Payment Refund API in Wallet Withdrawal API to achieve 0-question, 0-defect first-pass execution) and **Policy-Hash Quarantine** (`POL-2026-v1` $\to$ `POL-2026-v2`).
