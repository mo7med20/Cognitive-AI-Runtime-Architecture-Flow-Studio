# ShiftCore — Cognitive AI Runtime (`TASK-001: «اعمل آلة حاسبة»`)

Interactive university defense and architecture studio for **Cognitive AI Runtime Platform for Enterprises**, demonstrating the complete 5-step governed lifecycle, 8 runtime modules (`MOD-01`–`MOD-08`), 14 inter-module data contracts, and 13 provenance evidence records for the reference task **«اعمل آلة حاسبة» (Make a Calculator)**.

---

## 1. Run with Docker (Recommended for Presentation)

### Option A: Using Docker Compose (One Command)
```bash
docker compose up --build -d
```
Then open **http://localhost:8080** in your browser.

To stop the container:
```bash
docker compose down
```

### Option B: Using Docker CLI Directly
```bash
# 1. Build the production Docker image (runs unit tests + TypeScript check + Vite build)
docker build -t shiftcore-calculator-runtime:latest .

# 2. Run the container on port 8080
docker run --rm -p 8080:8080 --name shiftcore-calc shiftcore-calculator-runtime:latest
```
Then open **http://localhost:8080**.

---

## 2. Run Locally with Node.js (Development)

```bash
# Install dependencies
npm install

# Run unit test suite (5/5 tests)
npx tsx --test src/lib/runtimeEngine.test.ts

# Start development server on http://localhost:3000
npm run dev
```

---

## 3. Presentation Demo Flow (`TASK-001: «اعمل آلة حاسبة»`)

1. **Step 1 · Understand**: Inspect the raw Arabic prompt `«اعمل آلة حاسبة»`, workspace context (`TypeScript` preference vs. `eval() prohibited` mandatory rule), and click **`Web`** to resolve the material platform ambiguity.
2. **Step 2 · Plan**: Show the 5-step plan, the separation of **7 User Requirements + 1 Runtime Quality Requirement (`Safe invalid division`)**, and click **`Why?`** on `Vanilla TypeScript + Vite` to show why `React` and `Next.js` were rejected.
3. **Step 3 · Work**: Highlight the authoritative status split: **`Agent status = IMPLEMENTATION COMPLETE`** while **`Task status = VERIFYING`**, with `5` files created across `12` execution events.
4. **Step 4 · Check & Targeted Repair**: Contrast **`13 / 13 ✓ Evidence`** with **`7 / 8 ✕ Acceptance Checks`** blocked by `DIV-ZERO-01` (`8 ÷ 0 → Infinity`), then click **`Fix & verify again`** to apply the surgical zero-denominator guard (`8 / 8 ✓`).
5. **Step 5 · Result**: Show the **`✓ VERIFIED COMPLETE`** seal, the `pgvector` experience record, and test the live **Calculator Web Application** (`Test 8 ÷ 0 (v1.1 → Error)` vs. `Simulate Pre-Repair (8 ÷ 0 → Infinity)`).
