# ShiftCore — Parallel Local LLM Governance Runtime (`M_SE`)

Interactive full-stack Software Engineering governance runtime and presentation studio for **ShiftCore (`M_SE`)**, demonstrating progressive step-by-step execution (`S0 → S1 → S2 → S3 → S4 → S5`) powered by dual Local Model worker pools (**Worker A · Coder `qwen2.5-coder:7b` ∥ Worker B · Verifier `deepseek-coder:6.7b`**), real-time token streaming (`Live Role Logs`), 8 governance modules (`MOD-01`–`MOD-08`), 14 inter-module data contracts, and 13 dynamic provenance evidence records.

---

## 1. Run with Docker (Recommended for Presentation & Deployment)

### Option A: Using Docker Compose (Full-Stack Runtime + Ollama Daemon)
```bash
# Build and start both shiftcore-runtime (port 3000) and shiftcore-ollama (port 11434)
docker compose up --build -d

# (Optional) Pull the Coder and Verifier models inside the Ollama container
docker exec -it shiftcore-ollama ollama pull qwen2.5-coder:7b
docker exec -it shiftcore-ollama ollama pull deepseek-coder:6.7b
```
Then open **http://localhost:3000** in your browser.
- Health check endpoint: **http://localhost:3000/api/health**
- Independent worker status endpoint: **http://localhost:3000/api/llm/status**

To stop the containers:
```bash
docker compose down
```

### Option B: Using Docker CLI Directly (Standalone Full-Stack Container)
```bash
# 1. Build the production Docker image (runs 8/8 unit tests + TypeScript check + Vite build)
docker build -t shiftcore-runtime:latest .

# 2. Run the full-stack container on port 3000
docker run --rm -p 3000:3000 --name shiftcore-runtime shiftcore-runtime:latest
```
Then open **http://localhost:3000**.

---

## 2. Run Locally with Node.js (Development)

```bash
# Install dependencies
npm install

# Run unit test suite (8/8 tests)
npx tsx --test src/lib/runtimeEngine.test.ts

# Start full-stack Express + Vite server on http://localhost:3000
npm run dev
```
