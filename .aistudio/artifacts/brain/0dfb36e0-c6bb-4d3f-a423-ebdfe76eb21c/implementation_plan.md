# Dual-Worker Configuration for 4B Local Model (`qwen3:4b`)

Configure ShiftCore to natively run the user's installed 4B local model (`qwen3:4b`) for both Worker A (Coder / Planner) and Worker B (Independent Verifier / Oracle), enabling full 5-stage software engineering pipeline execution on a single 4B model with low VRAM footprint (~2.5 GB).

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed having `qwen3:4b` (2.5 GB, Ollama) installed locally and requested assigning this 4B model to **both** Coder and Verifier worker roles.

- **Confirmed Decision 1**: Set Worker A (Coder) model to `qwen3:4b`.
- **Confirmed Decision 2**: Set Worker B (Verifier) model to `qwen3:4b`.
- **Confirmed Decision 3**: Provide 1-click model presets in the UI drawer (including `qwen3:4b` Single Model mode and standard dual-model setups) plus auto-selection from `ollama list` / `/api/tags`.

---

## 1. Overview & Core Concept

- **What It Does**: Allows developers with single-GPU or lightweight laptop setups (e.g., 8GB–16GB RAM) running compact models like `qwen3:4b` to run ShiftCore's full cognitive software engineering pipeline without needing multiple large 7B models.
- **Worker Allocation**:
  - **Worker A (`qwen3:4b`)**: Handles Stage 1 Intake elicitation, Stage 2 Architecture Plan (R1–R8 + ADRs), Stage 3A Code Synthesis, and Stage 4B Surgical AST Patching.
  - **Worker B (`qwen3:4b`)**: Handles Stage 3B Acceptance Test Oracle Synthesis, Stage 4A Audit & Verification, and Stage 5 Cryptographic Seal stamping.
- **Key Value**: Low memory overhead (only ~2.5 GB VRAM required instead of ~8–12 GB), faster token generation rates, and zero friction setup for developers who already have `qwen3:4b` pulled in Ollama.

---

## 2. User Experience & Visual Design

- **Header Status Indicators**:
  - Worker A Badge: `Coder: qwen3:4b` with live ping status (`ONLINE · <latency>ms` or `OFFLINE`).
  - Worker B Badge: `Verifier: qwen3:4b` with live ping status.
- **Model Configuration Drawer**:
  - Preset Buttons:
    - `[⚡ Single Model: qwen3:4b (4B Lightweight)]` — Instantly assigns `qwen3:4b` to both Coder and Verifier with 1 click.
    - `[Default Dual: qwen2.5-coder:7b + deepseek-coder:6.7b]` — Quick switch back to dual 7B setup if desired.
  - Auto-Detect Installed Tag: When `/api/tags` returns `qwen3:4b`, the UI offers a 1-click prompt to adopt the detected model.
- **Live Role Logs Console**:
  - Shows `qwen3:4b` streaming tokens for Worker A and Worker B streams in chronological order.
  - Dual Split view clearly delineates Worker A (Coder tasks) and Worker B (Verifier tasks) even when sharing the same underlying model weights.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Single Model Weight Re-use (Worker A = Worker B = `qwen3:4b`)**
  - *Chosen Approach*: Allow both workers to invoke `qwen3:4b` while keeping separate system prompts, distinct worker identities (`WORKER-A-CODER` vs `WORKER-B-VERIFIER`), and independent audit boundaries.
  - *Why*: Ollama keeps the model loaded in GPU VRAM once, avoiding model-swapping latency and staying well within 2.5 GB memory limits.
  - *Alternatives Considered*: Forcing the user to download a second 6.7B model (e.g. `deepseek-coder:6.7b`), which would require downloading an additional 4+ GB and cause out-of-memory errors on modest hardware.

- **Decision 2: Seamless Environment & Store Defaults**
  - *Chosen Approach*: Update defaults across `.env.example`, `server.ts`, `data/shiftcore_store.json`, and client state to accept `OLLAMA_MODEL` and `OLLAMA_VERIFIER_MODEL` with fallback to `qwen3:4b`.
  - *Why*: Ensures that restarting or deploying immediately honors `qwen3:4b` without manual typing.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Frontend                      │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ Worker A (Coder)      │       │ Worker B (Verifier)   │  │
│  │ Model: qwen3:4b       │       │ Model: qwen3:4b       │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│                 [Live Role Logs Console]                    │
│             Worker Token Streams & Reduction                │
└──────────────────────────────┼──────────────────────────────┘
                               │
                HTTP /api/chat (NDJSON Stream)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             Local Ollama Daemon (http://localhost:11434)     │
│                                                             │
│                 Model: qwen3:4b (2.5 GB)                    │
│     Single model in VRAM serving both Worker roles          │
└─────────────────────────────────────────────────────────────┘
```

### Components to Update:
1. **`src/App.tsx`**:
   - Default `coderModel` to `qwen3:4b` and `verifierModel` to `qwen3:4b`.
   - Add preset button `⚡ Use qwen3:4b for Both Workers` in the model drawer.
   - When probing Ollama, if `qwen3:4b` is present in `availableModels`, highlight it.
2. **`server.ts`**:
   - Update fallback defaults from `qwen2.5-coder:7b` to `process.env.OLLAMA_MODEL || 'qwen3:4b'` and `process.env.OLLAMA_VERIFIER_MODEL || 'qwen3:4b'`.
3. **`data/shiftcore_store.json`**:
   - Set initial `modelName: "qwen3:4b"`.
4. **`.env.example`**:
   - Document `OLLAMA_MODEL="qwen3:4b"` and `OLLAMA_VERIFIER_MODEL="qwen3:4b"`.
5. **`src/lib/runtimeEngine.test.ts`**:
   - Verify unit test mock server handles `qwen3:4b` and passes all checks.
