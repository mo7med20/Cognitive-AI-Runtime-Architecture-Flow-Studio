import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_CALCULATOR_STATE,
  stepCalculator,
  canAdvanceToStage,
  StageIndex,
  CalculatorState,
  DependencyCategory
} from '../lib/runtimeEngine';
import { SECodingScenario } from '../lib/seScenariosAndMetamodel';
import {
  ParallelWorkerTelemetry,
  QUICK_PROMPT_SUGGESTIONS
} from '../lib/localLlmBridge';
import { ArchitectureGraph } from './ArchitectureGraph';
import {
  Activity,
  AlertTriangle,
  Check,
  Code2,
  Cpu,
  Eye,
  FastForward,
  FileCode2,
  GitCompare,
  Layers,
  Loader2,
  Lock,
  Network,
  Pause,
  Play,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';

interface LifecycleSimulatorProps {
  isRuntimeIdle: boolean;
  isStageExecuting: boolean;
  executingStageLabel: string;
  currentStage: StageIndex;
  highestCompletedStage: number;
  clarifiedPlatform: 'web' | 'desktop' | null;
  repaired: boolean;
  selectedComponentId: string;
  dependencyFilter: DependencyCategory | 'all';
  activeScenario: SECodingScenario;
  checkpointHash: string;
  sealId: string;
  coderModel: string;
  verifierModel: string;
  workerTelemetries: ParallelWorkerTelemetry[];
  onStartRuntimeWithPrompt: (prompt: string) => void;
  onSelectPlatformAndCompileStage2: (platform: 'web' | 'desktop') => void;
  onAdvanceToStageWithLiveWorker: (nextStage: StageIndex) => void;
  onApplySurgicalRepairWithLiveWorker: () => void;
  onAutoAdvanceToStage3?: () => void;
  onAutoRunFullPipelineLive?: (promptToRun?: string) => void;
  onOpenResultPreview?: (promptToRun?: string) => void;
  onToggleRepair: (repaired: boolean) => void;
  onFocusComponent: (componentId: string) => void;
  onChangeDependencyFilter: (filter: DependencyCategory | 'all') => void;
  onOpenKnowledgeTab: () => void;
}

const STEPPER_QUESTIONS: { num: number; title: string; sub: string }[] = [
  { num: 1, title: 'Understand', sub: 'Intake Role (S1)' },
  { num: 2, title: 'Plan', sub: 'Architect Role (S2)' },
  { num: 3, title: 'Parallel Synth', sub: 'Coder ∥ Test (S3)' },
  { num: 4, title: 'Verify & Patch', sub: 'Oracle & Patch (S4)' },
  { num: 5, title: 'Seal & Reuse', sub: 'Extractor Role (S5)' }
];

export const LifecycleSimulator: React.FC<LifecycleSimulatorProps> = ({
  isRuntimeIdle,
  isStageExecuting,
  executingStageLabel,
  currentStage,
  highestCompletedStage,
  clarifiedPlatform,
  repaired,
  selectedComponentId,
  dependencyFilter,
  activeScenario,
  checkpointHash,
  sealId,
  coderModel,
  verifierModel,
  workerTelemetries,
  onStartRuntimeWithPrompt,
  onSelectPlatformAndCompileStage2,
  onAdvanceToStageWithLiveWorker,
  onApplySurgicalRepairWithLiveWorker,
  onAutoAdvanceToStage3,
  onAutoRunFullPipelineLive,
  onOpenResultPreview,
  onToggleRepair,
  onFocusComponent,
  onChangeDependencyFilter,
  onOpenKnowledgeTab
}) => {
  const [idlePromptInput, setIdlePromptInput] = useState<string>('i need landing-page for my site');
  const [openWhyIds, setOpenWhyIds] = useState<Record<string, boolean>>({
    'ADR-101': true,
    'ADR-LIVE-MODEL': true
  });
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [codeViewVersion, setCodeViewVersion] = useState<'v1' | 'v1_1'>('v1');
  const [showProofTrace, setShowProofTrace] = useState<boolean>(true);
  const [showRuntimeMap, setShowRuntimeMap] = useState<boolean>(false);
  const [showLiveRoleLogs, setShowLiveRoleLogs] = useState<boolean>(true);
  const [showSystemPromptInLogs, setShowSystemPromptInLogs] = useState<boolean>(false);
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('ACTIVE_STAGE');
  const [layerFilter, setLayerFilter] = useState<'ALL' | 'DYNAMIC_ONLY' | 'STATIC_ONLY'>('ALL');
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [streamProgress, setStreamProgress] = useState<number>(0);
  const logViewportRef = useRef<HTMLPreElement | null>(null);
  const parallelLogBViewportRef = useRef<HTMLPreElement | null>(null);

  const [calcState, setCalcState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);
  const [calcGuardEnabled, setCalcGuardEnabled] = useState<boolean>(true);
  const [customPayloadJson, setCustomPayloadJson] = useState<string>(
    activeScenario.interactiveSandboxPreview.testCases[0]?.inputPayload ||
      '{ "requestId": "req_1001", "actorId": "usr_admin", "operationValue": 250 }'
  );
  const [simulateConcurrentRace, setSimulateConcurrentRace] = useState<boolean>(false);
  const [customExecutionLog, setCustomExecutionLog] = useState<{
    timestamp: string;
    v1Result: string;
    v1Passed: boolean;
    v1_1Result: string;
    v1_1Passed: boolean;
  } | null>(null);

  /**
   * =========================================================================
   * LIVE RAW MODEL STREAMING & PROGRESSIVE STAGE REVEAL ENGINE
   * Streams raw model output token-by-token in the Live Role Logs Console
   * and unlocks stage result cards (revealStep 0 -> 1 -> 2 -> 3 -> 4) as
   * the worker's raw output crosses each generation milestone.
   * =========================================================================
   */
  const [roleStreamTrigger, setRoleStreamTrigger] = useState<number>(0);

  // Reset stream to 0 whenever stage, repair state, scenario, or replay trigger changes
  useEffect(() => {
    setSelectedWorkerFilter('ACTIVE_STAGE');
    setIsStreamPaused(false);
    if (isRuntimeIdle || isStageExecuting) {
      setStreamProgress(0);
      return;
    }
    setStreamProgress(4);
  }, [
    isRuntimeIdle,
    isStageExecuting,
    currentStage,
    repaired,
    activeScenario.id,
    roleStreamTrigger
  ]);

  // Continuous token-by-token ticker that advances streamProgress -> 100%
  useEffect(() => {
    if (isRuntimeIdle || isStageExecuting || isStreamPaused || streamProgress >= 100) {
      return;
    }

    const timer = window.setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 100) return 100;
        const next = prev + 4;
        return next >= 100 ? 100 : next;
      });
    }, 65);

    return () => window.clearInterval(timer);
  }, [isRuntimeIdle, isStageExecuting, isStreamPaused, streamProgress]);

  // Auto-scroll Live Role Logs terminal viewports as raw tokens stream in
  useEffect(() => {
    if (streamProgress > 0 && streamProgress < 100) {
      if (logViewportRef.current) {
        logViewportRef.current.scrollTop = logViewportRef.current.scrollHeight;
      }
      if (parallelLogBViewportRef.current) {
        parallelLogBViewportRef.current.scrollTop =
          parallelLogBViewportRef.current.scrollHeight;
      }
    }
  }, [streamProgress]);

  // Synchronize progressive stage card reveal directly with the live raw model stream
  const revealStep = isRuntimeIdle || isStageExecuting
    ? 0
    : streamProgress >= 100
      ? 4
      : streamProgress >= 75
        ? 3
        : streamProgress >= 45
          ? 2
          : streamProgress >= 18
            ? 1
            : 0;

  useEffect(() => {
    setSelectedFileIndex(0);
    setCodeViewVersion(repaired ? 'v1_1' : 'v1');
    setCustomPayloadJson(
      activeScenario.interactiveSandboxPreview.testCases[0]?.inputPayload ||
        '{ "requestId": "req_1001", "actorId": "usr_admin", "operationValue": 250 }'
    );
    setCustomExecutionLog(null);
  }, [activeScenario.id, repaired]);

  const executeLiveCustomPayload = () => {
    const raw = customPayloadJson.trim();
    const isNegativeOrZeroDiv =
      raw.includes('-50') ||
      raw.includes('"-') ||
      raw.includes('÷ 0') ||
      raw.includes('/ 0') ||
      raw.includes('OR 1=1') ||
      raw.includes('DROP TABLE');

    if (simulateConcurrentRace) {
      setCustomExecutionLog({
        timestamp: new Date().toLocaleTimeString(),
        v1Result: `✕ RACE CONDITION DETECTED: 2 parallel calls with payload (${raw.slice(0, 48)}...) bypassed deduplication in v1.0 and executed duplicate side effects!`,
        v1Passed: false,
        v1_1Result: `✓ ATOMIC LOCK ENFORCED: Call #1 EXECUTED (200 OK), Call #2 blocked by in-flight mutex (409 ERR_CONCURRENT_MUTATION_CONFLICT). Zero duplicate side effects.`,
        v1_1Passed: true
      });
      return;
    }

    if (isNegativeOrZeroDiv) {
      setCustomExecutionLog({
        timestamp: new Date().toLocaleTimeString(),
        v1Result: `✕ BOUNDARY / INJECTION FAILURE: v1.0 failed to block hazardous input (${raw.slice(0, 48)}...).`,
        v1Passed: false,
        v1_1Result: `✓ FAIL-CLOSED GUARD TRIGGERED: v1.1 deterministic validator rejected hazardous payload before state mutation.`,
        v1_1Passed: true
      });
      return;
    }

    setCustomExecutionLog({
      timestamp: new Date().toLocaleTimeString(),
      v1Result: `200 OK -> Executed on v1.0 (${raw.slice(0, 55)})`,
      v1Passed: true,
      v1_1Result: `200 OK -> Executed on v1.1 with Atomic Lock & Audit Trail (${raw.slice(0, 55)})`,
      v1_1Passed: true
    });
  };

  // Physical keyboard support when Baseline Calculator scenario is in Stage 5
  useEffect(() => {
    if (isRuntimeIdle || currentStage !== 4 || activeScenario.id !== 'baseline_calculator') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key;
      if (/^[0-9.]$/.test(k)) {
        setCalcState((prev) => stepCalculator(prev, k, calcGuardEnabled));
      } else if (k === '+' || k === '-') {
        setCalcState((prev) => stepCalculator(prev, k, calcGuardEnabled));
      } else if (k === '*' || k === 'x' || k === 'X') {
        setCalcState((prev) => stepCalculator(prev, '×', calcGuardEnabled));
      } else if (k === '/') {
        e.preventDefault();
        setCalcState((prev) => stepCalculator(prev, '÷', calcGuardEnabled));
      } else if (k === 'Enter' || k === '=') {
        e.preventDefault();
        setCalcState((prev) => stepCalculator(prev, '=', calcGuardEnabled));
      } else if (k === 'Escape' || k === 'c' || k === 'C' || k === 'Backspace') {
        setCalcState(INITIAL_CALCULATOR_STATE);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRuntimeIdle, currentStage, calcGuardEnabled, activeScenario.id]);

  // =========================================================================
  // S0: EMPTY / IDLE RUNTIME STATE (ZERO PROTOTYPE RESULTS SHOWN STATICALLY!)
  // =========================================================================
  if (isRuntimeIdle) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-dashed border-[#384e6e] bg-[#131b28] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ff8a4c]/15 border border-[#ff8a4c]/40 font-mono text-xs font-bold text-[#ffa875]">
                <Activity size={14} />
                <span>STATE S0: RUNTIME IDLE · ZERO STATIC RESULTS PRE-LOADED</span>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                Enter a prompt to watch each Local Model Role generate the workflow step by step.
              </h2>
              <p className="mt-2 text-sm text-[#a2afc3] leading-relaxed">
                No prototype artifacts exist until your prompt is dispatched. Once entered, ShiftCore runs each{' '}
                <strong className="text-white">Local Model Role</strong> in chronological order — revealing{' '}
                <strong className="text-[#53d6ab]">Step 1 Intake Facts & Gate</strong> →{' '}
                <strong className="text-[#8caef9]">Step 2 R1..R8 & ADRs</strong> →{' '}
                <strong className="text-[#ffa875]">Step 3 Parallel Code ∥ Tests</strong> →{' '}
                <strong className="text-[#fb8797]">Step 4 Oracle Audit & Surgical AST Patch</strong> →{' '}
                <strong className="text-[#53d6ab]">Step 5 Cryptographic Seal</strong>.
              </p>
              <p className="mt-1.5 text-xs text-[#ffa875]" dir="rtl" lang="ar">
                لا توجد أي نتائج ثابتة مسبقاً (State S0). بمجرد إدخال الطلب بالأسفل، ستظهر النتائج تدريجياً بالترتيب الزمني حسب الدور الذي يقوم به النموذج المحلي في كل مرحلة من المراحل الخمس.
              </p>
            </div>

            {/* Parallel Architecture Role Status Box */}
            <div className="rounded-xl border border-[#2b3a4f] bg-[#0d131d] p-4 font-mono text-xs space-y-2 min-w-[285px]">
              <div className="text-[#8caef9] font-bold">ASSIGNED LOCAL MODEL ROLES:</div>
              <div className="flex items-center justify-between text-[#c8d3e2]">
                <span>S1 Intake / S2 Architect:</span>
                <span className="text-[#53d6ab] font-bold">{coderModel}</span>
              </div>
              <div className="flex items-center justify-between text-[#c8d3e2]">
                <span>S3 Parallel Coder (A):</span>
                <span className="text-[#53d6ab] font-bold">{coderModel}</span>
              </div>
              <div className="flex items-center justify-between text-[#c8d3e2]">
                <span>S3 Test ∥ S4 Oracle (B):</span>
                <span className="text-[#ffa875] font-bold">{verifierModel}</span>
              </div>
              <div className="pt-1.5 border-t border-[#1e293b] text-[11px] text-[#a2afc3]">
                Stages 1–5 Locked until S0 → S1 Intake Role runs
              </div>
            </div>
          </div>

          {/* Live Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (idlePromptInput.trim()) {
                onStartRuntimeWithPrompt(idlePromptInput.trim());
              }
            }}
            className="space-y-3"
          >
            <label htmlFor="s0-prompt-input" className="block font-mono text-xs font-bold text-[#8caef9]">
              ENTER ANY SOFTWARE ENGINEERING PROMPT (ENGLISH OR ARABIC) TO START STEP 1 ROLE:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="s0-prompt-input"
                type="text"
                value={idlePromptInput}
                onChange={(e) => setIdlePromptInput(e.target.value)}
                placeholder="e.g., Add a POST /api/v1/payments/:id/refund endpoint with DB transaction & concurrency lock..."
                className="flex-1 rounded-xl border border-[#384e6e] bg-[#0a0f18] px-4 py-3.5 text-sm text-white placeholder-[#7c8ca5] focus:border-[#ff8a4c] focus:outline-none font-mono"
              />
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="submit"
                  disabled={isStageExecuting || !idlePromptInput.trim()}
                  className="px-5 py-3.5 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] disabled:opacity-50 text-[#0c1018] font-mono text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg"
                  title="Dispatch prompt to start Stage 1 Intake & Ambiguity Role"
                >
                  {isStageExecuting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Running Stage 1 Role on {coderModel}...</span>
                    </>
                  ) : (
                    <>
                      <Play size={17} />
                      <span>Start Step 1 Role →</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isStageExecuting || !idlePromptInput.trim()}
                  onClick={() => {
                    if (idlePromptInput.trim()) {
                      onAutoRunFullPipelineLive?.(idlePromptInput.trim());
                    }
                  }}
                  className="px-5 py-3.5 rounded-xl bg-[#53d6ab] hover:bg-[#3cc498] disabled:opacity-50 text-[#0c1018] font-mono text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg"
                  title="Execute all 5 stages end-to-end and jump straight to generated code and verification"
                >
                  <Zap size={17} />
                  <span>Auto-Run All 5 Steps to Code ⚡</span>
                </button>
                <button
                  type="button"
                  data-testid="s0-open-result-btn"
                  disabled={isStageExecuting}
                  onClick={() => {
                    onOpenResultPreview?.(idlePromptInput.trim() || 'i need landing-page for my site');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-[#8caef9] hover:bg-[#a6c1fa] disabled:opacity-50 text-[#0c1018] font-mono text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 shadow-lg"
                  title="Immediately open the rendered live preview and download standalone HTML or ZIP"
                >
                  <Eye size={17} />
                  <span>Open Live Result &amp; Download (HTML / ZIP) ➔</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick-Fill Prompt Chips for Fast Live Demonstration */}
          <div className="space-y-2 pt-2 border-t border-[#253246]">
            <div className="font-mono text-xs text-[#a2afc3]">
              Or click any reference Software Engineering prompt to start the progressive workflow on{' '}
              <strong className="text-white">{coderModel}</strong>:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {QUICK_PROMPT_SUGGESTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isStageExecuting}
                  onClick={() => {
                    setIdlePromptInput(item.prompt);
                    onStartRuntimeWithPrompt(item.prompt);
                  }}
                  className="text-left rounded-xl border border-[#2b3a4f] bg-[#0e131d] hover:border-[#ff8a4c] p-3.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#ff8a4c] group-hover:underline">
                      {item.label}
                    </span>
                    <Send size={12} className="text-[#8caef9]" />
                  </div>
                  <div className="mt-1 text-xs text-[#ffa875]" dir="rtl" lang="ar">
                    {item.arabicLabel}
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] text-[#a2afc3] line-clamp-2">
                    “{item.prompt}”
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Locked 5-Stage Preview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {STEPPER_QUESTIONS.map((s) => (
              <div
                key={s.num}
                className="rounded-xl border border-[#233044] bg-[#0c111a] p-3 opacity-65 font-mono text-xs"
              >
                <div className="text-[#8caef9] font-bold flex items-center gap-1">
                  <Lock size={11} />
                  <span>STAGE 0{s.num} · LOCKED</span>
                </div>
                <div className="text-white font-bold mt-0.5">{s.title}</div>
                <div className="text-[11px] text-[#a2afc3]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const nextStageCheck =
    currentStage < 4
      ? canAdvanceToStage((currentStage + 1) as StageIndex, { clarifiedPlatform, repaired })
      : { allowed: false, reason: 'Completed all 5 stages.' };

  const toggleWhy = (id: string) => {
    setOpenWhyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runQuickCalcTest = (sequence: string[], useGuard = calcGuardEnabled) => {
    setCalcGuardEnabled(useGuard);
    let next = INITIAL_CALCULATOR_STATE;
    for (const k of sequence) {
      next = stepCalculator(next, k, useGuard);
    }
    setCalcState(next);
  };

  const activeFile = activeScenario.files[selectedFileIndex] ||
    activeScenario.files[0] || {
      path: 'pending_stage3_synthesis.ts',
      language: 'typescript' as const,
      role: 'PRIMARY_IMPLEMENTATION' as const,
      summary: 'Pending Stage 3 Parallel Synthesis Role',
      v1Code: '// Pending Stage 3 Parallel Synthesis Role...',
      v1_1Code: '// Pending Stage 4B Surgical AST Repair Role...'
    };
  const gate = activeScenario.elicitation.blockingGate;
  const failedReq =
    activeScenario.requirements.find((r) => r.v1Status === 'FAIL') ||
    activeScenario.requirements[7] || {
      id: 'R8',
      category: 'CONCURRENCY' as const,
      statement: 'Pending Stage 2 Architect & Policy Injection Role',
      source: 'Policy Engine' as const,
      verificationAssertion: 'Pending Stage 2 synthesis',
      targetFile: 'pending',
      v1Status: 'FAIL' as const,
      v1_1Status: 'PASS' as const,
      failureDiagnostic: 'Pending Stage 4 Oracle Audit'
    };

  /**
   * Role Timeline Definitions for the Live Role Progress Bar & Streaming Console
   */
  const roleTimelineMeta: Record<
    StageIndex,
    {
      roleId: string;
      roleTitle: string;
      modelAssigned: string;
      steps: string[];
    }
  > = {
    0: {
      roleId: 'WORKER-S1-INTAKE',
      roleTitle: 'Context Grounding & Ambiguity Elicitation Role',
      modelAssigned: coderModel,
      steps: [
        `Scanning Tier 1 Repo AST (${activeScenario.elicitation.autoResolvedFacts[0]?.sourceArtifact || 'package.json'})...`,
        `Binding Tier 2 Organizational Policy & Tier 3 Historical Knowledge...`,
        `Computing residual architectural entropy & isolating 1 blocking gate (${gate.gateId})...`,
        clarifiedPlatform === 'web'
          ? `Gate resolved → TaskSpec Contract compiled with 0.00 bits entropy.`
          : `Awaiting developer selection on ${gate.gateId} to compile TaskSpec...`
      ]
    },
    1: {
      roleId: 'WORKER-S2-ARCHITECT',
      roleTitle: 'Requirements & ADR Planner Role',
      modelAssigned: coderModel,
      steps: [
        `Synthesizing functional & schema requirements R1–R4 from locked TaskSpec...`,
        `Injecting boundary & concurrency policy invariant ${failedReq.id} (${failedReq.category})...`,
        `Locking Architectural Decision Records (${activeScenario.decisions.map((d) => d.id).join(', ')})...`,
        `Stage 2 Plan & Verification Matrix locked (8/8 verifiable requirements ready).`
      ]
    },
    2: {
      roleId: 'WORKER-S3A-CODER ∥ WORKER-S3B-TEST',
      roleTitle: 'Parallel Implementation Coder ∥ Independent Test Oracle Roles',
      modelAssigned: `${coderModel} ∥ ${verifierModel}`,
      steps: [
        `[Worker A · ${coderModel}] Synthesizing primary implementation (${activeScenario.files[0]?.path})...`,
        `[Worker A · ${coderModel}] Synthesizing schema/model (${activeScenario.files[1]?.path})...`,
        `[Worker B · ${verifierModel}] Synthesizing independent verification spec (${activeScenario.files[2]?.path}) in parallel...`,
        `Immutable Sandbox Checkpoint #S3-01 (${checkpointHash.slice(0, 15)}) locked for Stage 4 audit.`
      ]
    },
    3: {
      roleId: repaired ? 'WORKER-S4B-PATCHER → WORKER-S4A-ORACLE' : 'WORKER-S4A-ORACLE',
      roleTitle: repaired
        ? 'Surgical AST Patcher Role & Re-Verification Oracle'
        : 'Independent Verification Critic Role',
      modelAssigned: repaired ? `${coderModel} → ${verifierModel}` : verifierModel,
      steps: repaired
        ? [
            `[Worker A · ${coderModel}] Targeting failing AST node in ${activeScenario.surgicalDiff.targetFile} on retained #S3-01...`,
            `[Worker A · ${coderModel}] Applying surgical AST patch (preserving ${activeScenario.surgicalDiff.untouchedFilesCount} passing file(s))...`,
            `[Worker B · ${verifierModel}] Re-running all 8 independent verification assertions on #S3-01-v1.1...`,
            `All 8/8 assertions PASS (${failedReq.id} verified). Ready for Stage 5 cryptographic seal.`
          ]
        : [
            `[Worker B · ${verifierModel}] Executing assertions R1–R4 against Checkpoint #S3-01 (4/4 PASS)...`,
            `[Worker B · ${verifierModel}] Executing assertions R5–R7 against Checkpoint #S3-01 (7/7 PASS)...`,
            `[Worker B · ${verifierModel}] Auditing policy invariant ${failedReq.id} (${failedReq.category})...`,
            `✕ CRITICAL DEFECT CAUGHT ON ${failedReq.id}: Release blocked (7/8 PASS, 1 FAIL). Surgical AST repair required.`
          ]
    },
    4: {
      roleId: 'WORKER-S5-EXTRACTOR',
      roleTitle: 'Cryptographic Sealer & Tier-3 Knowledge Extractor Role',
      modelAssigned: verifierModel,
      steps: [
        `Signing verified Checkpoint #S3-01-v1.1 with cryptographic seal ${sealId}...`,
        `Extracting reusable Knowledge Unit (${activeScenario.extractedKnowledge.id}) into Tier 3 store...`,
        `Initializing live interactive sandbox harness (${activeScenario.interactiveSandboxPreview.endpointOrTarget})...`,
        `Lifecycle complete: Verified build sealed & Task N+1 knowledge pattern promoted.`
      ]
    }
  };

  const activeRoleMeta = roleTimelineMeta[currentStage];
  const progressPct = isStageExecuting ? 12 : streamProgress;

  // Map currentStage to the primary worker telemetry (and parallel Worker B in Stage 3)
  const findTelemetryByRole = (role: ParallelWorkerTelemetry['workerRole']) =>
    workerTelemetries.find((w) => w.workerRole === role);

  const stagePrimaryRoleMap: Record<StageIndex, ParallelWorkerTelemetry['workerRole']> = {
    0: 'STAGE1_INTAKE_ANALYZER',
    1: 'STAGE2_ARCHITECT_PLANNER',
    2: 'STAGE3_WORKER_A_CODER',
    3: repaired ? 'STAGE4_SURGICAL_PATCHER' : 'STAGE4_VERIFIER_CRITIC',
    4: 'STAGE5_KNOWLEDGE_EXTRACTOR'
  };

  const activePrimaryTelemetry =
    selectedWorkerFilter === 'ACTIVE_STAGE'
      ? findTelemetryByRole(stagePrimaryRoleMap[currentStage]) || workerTelemetries[0]
      : selectedWorkerFilter === 'ALL_WORKERS'
        ? workerTelemetries[0]
        : workerTelemetries.find((w) => w.workerId === selectedWorkerFilter) ||
          findTelemetryByRole(stagePrimaryRoleMap[currentStage]) ||
          workerTelemetries[0];

  const stage3WorkerATelemetry = findTelemetryByRole('STAGE3_WORKER_A_CODER');
  const stage3WorkerBTelemetry = findTelemetryByRole('STAGE3_WORKER_B_TEST_SYNTH');
  const isParallelDualStreamView =
    selectedWorkerFilter === 'ACTIVE_STAGE' &&
    currentStage === 2 &&
    Boolean(stage3WorkerATelemetry && stage3WorkerBTelemetry);

  const sliceRawStream = (fullText: string | undefined): { visible: string; tokens: number; totalTokens: number } => {
    const safe = fullText || '// Waiting for Local Model role output stream...';
    const totalTokens = Math.max(1, Math.ceil(safe.length / 4));
    if (isStageExecuting) {
      return {
        visible: `>>> DISPATCHING ROLE REQUEST TO LOCAL MODEL ENGINE...\n>>> ${executingStageLabel || activeRoleMeta.roleTitle}\n>>> Establishing stream buffer & awaiting first token...`,
        tokens: 0,
        totalTokens
      };
    }
    const charLimit = Math.max(1, Math.floor((safe.length * streamProgress) / 100));
    const visible = safe.slice(0, charLimit);
    return {
      visible,
      tokens: Math.ceil(visible.length / 4),
      totalTokens
    };
  };

  const primaryStream = sliceRawStream(activePrimaryTelemetry?.rawModelOutput);
  const parallelStreamA = sliceRawStream(stage3WorkerATelemetry?.rawModelOutput);
  const parallelStreamB = sliceRawStream(stage3WorkerBTelemetry?.rawModelOutput);

  const screenHeaders: { kicker: string; title: string; status: string }[] = [
    {
      kicker: `STEP 01 / LIVE INTAKE ANALYZER ROLE (${coderModel})`,
      title: 'Context-Grounded Auto-Resolution & Dynamic Ambiguity Gate',
      status:
        clarifiedPlatform === 'web'
          ? 'TASKSPEC LOCKED (ENTROPY 0.00)'
          : 'AWAITING AMBIGUITY GATE SELECTION'
    },
    {
      kicker: `STEP 02 / LIVE ARCHITECT & PLANNER ROLE (${coderModel})`,
      title: 'Synthesized Requirements (7 Spec + 1 Policy) & ADR Locks',
      status: revealStep >= 3 ? 'PLAN & TEST MATRIX LOCKED' : 'ROLE STREAMING R1..R8 & ADRs...'
    },
    {
      kicker: `STEP 03 / PARALLEL DUAL-MODEL SYNTHESIS (${coderModel} ∥ ${verifierModel})`,
      title: 'Worker A (Implementation Code) ∥ Worker B (Independent Test Suite)',
      status:
        revealStep >= 3
          ? `AGENT=DONE · TASK=VERIFYING (${checkpointHash.slice(0, 13)})`
          : 'PARALLEL ROLES SYNTHESIZING FILES...'
    },
    {
      kicker: `STEP 04 / INDEPENDENT VERIFIER (${verifierModel}) & SURGICAL PATCHER (${coderModel})`,
      title: 'Independent Oracle Audit & Pinpoint AST Patch on #S3-01',
      status: repaired ? '8 / 8 CHECKS PASSED (v1.1)' : '7 / 8 PASSED · 1 CRITICAL FAIL (v1.0)'
    },
    {
      kicker: `STEP 05 / CRYPTOGRAPHIC SEAL & TIER 3 KNOWLEDGE EXTRACTOR`,
      title: 'Verified Delivery & Automatic Pattern Promotion for Task N+1',
      status: `SEALED (${sealId}) · PROMOTED TO TIER 3`
    }
  ];

  const activeHeader = screenHeaders[currentStage];

  return (
    <div className="lifecycle-workspace">
      {/* Persistent Deliverable Result Banner across all stages */}
      <div className="mb-4 rounded-2xl border-2 border-[#ff8a4c]/60 bg-gradient-to-r from-[#ff8a4c]/15 via-[#131c2b] to-[#53d6ab]/15 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#ff8a4c]">
            <Eye size={15} className="text-[#53d6ab]" />
            <span>FINAL DELIVERABLE RESULT READY FOR: &ldquo;{activeScenario.rawPrompt}&rdquo;</span>
          </div>
          <p className="text-xs text-[#c8d3e2]">
            View the <strong>Live Interactive Landing Page Preview</strong>, copy the verified React/TypeScript files, or download a ready-to-use <strong>standalone index.html</strong> &amp; <strong>project .zip</strong>:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="banner-open-result-btn"
            onClick={() => onOpenResultPreview?.(activeScenario.rawPrompt)}
            className="px-4 py-2.5 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg transition-all"
          >
            <Eye size={15} />
            <span>Open Live Result Preview &amp; Download (HTML / ZIP) ➔</span>
          </button>
          {currentStage !== 2 && (
            <button
              type="button"
              onClick={() => onAutoAdvanceToStage3?.()}
              className="px-3.5 py-2.5 rounded-xl bg-[#151c28] hover:bg-[#1e293b] text-[#53d6ab] border border-[#53d6ab]/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Code2 size={14} />
              <span>Inspect Step 3 Source Code</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Step Journey Stepper (Strictly Gated by Role Execution Order) */}
      <nav aria-label="Task journey" className="journey-stepper">
        {STEPPER_QUESTIONS.map((step, index) => {
          const stageIndex = index as StageIndex;
          const isCurrent = stageIndex === currentStage;
          const isDone = stageIndex <= highestCompletedStage && stageIndex !== currentStage;
          const gateAccess = canAdvanceToStage(stageIndex, { clarifiedPlatform, repaired });
          const isSequentialUnlock = stageIndex <= highestCompletedStage + 1;
          const allowed = gateAccess.allowed && isSequentialUnlock;

          return (
            <button
              key={step.num}
              type="button"
              disabled={!allowed || isStageExecuting}
              aria-current={isCurrent ? 'step' : undefined}
              title={
                allowed
                  ? step.sub
                  : !isSequentialUnlock
                    ? `Complete Step ${stageIndex} Role first`
                    : gateAccess.reason
              }
              onClick={() => allowed && onAdvanceToStageWithLiveWorker(stageIndex)}
              className={`journey-step ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
            >
              <span className="journey-number" aria-hidden="true">
                {isDone ? <Check size={14} /> : step.num}
              </span>
              <span>
                <span className="journey-title block">{step.title}</span>
                <span className="journey-subtitle block">{step.sub}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Split-Screen Workspace */}
      <div className="lifecycle-grid">
        {/* LEFT COLUMN */}
        <div className="lifecycle-main">
          {/* Workspace Stage Header */}
          <div className="stage-heading">
            <div>
              <div className="stage-heading-kicker">{activeHeader.kicker}</div>
              <h2 className="text-white">{activeHeader.title}</h2>
            </div>
            <div
              className={`stage-status font-mono font-medium border ${
                currentStage === 3 && !repaired
                  ? 'border-[#fb8797]/50 bg-[#fb8797]/15 text-[#fb8797]'
                  : (currentStage === 0 && clarifiedPlatform === 'web') ||
                      currentStage === 4 ||
                      (currentStage === 3 && repaired)
                    ? 'border-[#53d6ab]/50 bg-[#53d6ab]/15 text-[#53d6ab]'
                    : 'border-[#ff8a4c]/50 bg-[#ff8a4c]/15 text-[#ffa875]'
              }`}
            >
              {activeHeader.status}
            </div>
          </div>

          {/* =========================================================
              DYNAMIC LIVE VS STATIC GOVERNANCE LAYER SELECTOR & LEGEND
             ========================================================= */}
          <div className="mb-4 rounded-2xl border border-[#26374d] bg-[#0c121d] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#a2afc3] flex items-center gap-1.5">
                <Layers size={14} className="text-[#8caef9]" />
                Layer Separation:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#53d6ab]/15 border border-[#53d6ab]/40 text-[#53d6ab] font-mono text-[11px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-[#53d6ab] animate-pulse" />
                ⚡ DYNAMIC (Live Local Model Output)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8caef9]/15 border border-[#8caef9]/40 text-[#8caef9] font-mono text-[11px] font-extrabold">
                🔒 STATIC (Governance Policy & Metamodel)
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-[#7c8ca5] text-[11px] mr-1 hidden sm:inline">Highlight Filter:</span>
              <button
                type="button"
                onClick={() => setLayerFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  layerFilter === 'ALL'
                    ? 'bg-[#ff8a4c] text-[#0c1018] border-[#ff8a4c]'
                    : 'bg-[#151c28] text-[#c8d3e2] border-[#2b3a4f] hover:border-[#ff8a4c]'
                }`}
              >
                All Layers
              </button>
              <button
                type="button"
                onClick={() => setLayerFilter('DYNAMIC_ONLY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  layerFilter === 'DYNAMIC_ONLY'
                    ? 'bg-[#53d6ab] text-[#0c1018] border-[#53d6ab]'
                    : 'bg-[#151c28] text-[#c8d3e2] border-[#2b3a4f] hover:border-[#53d6ab]'
                }`}
              >
                ⚡ Live Model Only
              </button>
              <button
                type="button"
                onClick={() => setLayerFilter('STATIC_ONLY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  layerFilter === 'STATIC_ONLY'
                    ? 'bg-[#8caef9] text-[#0c1018] border-[#8caef9]'
                    : 'bg-[#151c28] text-[#c8d3e2] border-[#2b3a4f] hover:border-[#8caef9]'
                }`}
              >
                🔒 Static Policy Only
              </button>
            </div>
          </div>

          {/* =========================================================
              LIVE LOCAL MODEL ROLE PROGRESS BAR & SUB-STEP TRACKER
             ========================================================= */}
          <div className="mb-4 rounded-2xl border border-[#ff8a4c]/55 bg-[#101826] p-4 space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#ff8a4c] text-[#0c1018] font-extrabold">
                  {activeRoleMeta.roleId}
                </span>
                <span className="text-white font-bold">{activeRoleMeta.roleTitle}</span>
                <span className="px-2 py-0.5 rounded bg-[#162234] text-[#53d6ab] border border-[#293d5c]">
                  Model: {activeRoleMeta.modelAssigned}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {streamProgress < 100 && !isStageExecuting && (
                  <button
                    type="button"
                    onClick={() => setIsStreamPaused((p) => !p)}
                    className="px-2.5 py-1 rounded-lg border border-[#354b6d] bg-[#162133] hover:border-[#ffa875] text-[#ffa875] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isStreamPaused ? <Play size={12} /> : <Pause size={12} />}
                    <span>{isStreamPaused ? 'Resume Stream' : 'Pause Stream'}</span>
                  </button>
                )}
                {streamProgress < 100 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsStreamPaused(false);
                      setStreamProgress(100);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#354b6d] bg-[#162133] hover:border-[#53d6ab] text-[#53d6ab] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FastForward size={12} />
                    <span>Complete Stream (100%)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRoleStreamTrigger((c) => c + 1)}
                    className="px-2.5 py-1 rounded-lg border border-[#354b6d] bg-[#162133] hover:border-[#ff8a4c] text-[#ffa875] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw size={12} />
                    <span>Replay Live Stream</span>
                  </button>
                )}
                <span className="font-extrabold text-[#53d6ab] tabular-nums">{progressPct}%</span>
              </div>
            </div>

            {/* Live Progress Bar with Milestone Markers (18%, 45%, 75%, 100%) */}
            <div className="w-full h-2.5 rounded-full bg-[#090d14] overflow-hidden border border-[#223046]">
              <div
                className="h-full bg-gradient-to-r from-[#ff8a4c] to-[#53d6ab] transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Streaming Sub-Step Execution Log */}
            <div className="rounded-xl bg-[#090e17] border border-[#1f2c40] p-3 font-mono text-xs space-y-1.5">
              {isStageExecuting ? (
                <div className="flex items-center gap-2 text-[#ffa875]">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{executingStageLabel || `Executing ${activeRoleMeta.roleId}...`}</span>
                </div>
              ) : (
                activeRoleMeta.steps.map((line, idx) => {
                  const isVisible = revealStep >= idx + 1;
                  const isCurrentStep = revealStep === idx;
                  if (!isVisible && !isCurrentStep) return null;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${
                        isVisible ? 'text-[#dce3ef]' : 'text-[#ffa875]'
                      }`}
                    >
                      <span className="text-[#53d6ab] font-bold shrink-0">
                        {isVisible ? '✓' : '▸'} [Step {currentStage + 1}.{idx + 1}]
                      </span>
                      <span>{line}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =========================================================
              LIVE ROLE LOGS CONSOLE PANE (REAL-TIME RAW MODEL STREAM)
              Streams raw model output token-by-token from each worker
              as it happens, synchronized with progressive stage cards!
             ========================================================= */}
          <div className="mb-4 rounded-2xl border border-[#385176] bg-[#0b1019] overflow-hidden shadow-xl">
            {/* Console Header Bar */}
            <div className="px-4 py-2.5 bg-[#121c2c] border-b border-[#25354d] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#53d6ab]/15 border border-[#53d6ab]/45 text-[#53d6ab] font-extrabold">
                  <Terminal size={13} />
                  <span>LIVE ROLE LOGS</span>
                </span>
                <span className="text-white font-bold">
                  Real-Time Raw Model Stream ({workerTelemetries.length} Active Worker Logs)
                </span>
                {streamProgress < 100 || isStageExecuting ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff8a4c]/20 text-[#ffa875] border border-[#ff8a4c]/40 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#ff8a4c] animate-ping" />
                    <span>STREAMING RAW TOKENS...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#162336] text-[#8caef9] text-[11px] tabular-nums">
                    <span>✓ STREAM COMPLETE ({primaryStream.totalTokens} tokens)</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowSystemPromptInLogs((s) => !s)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    showSystemPromptInLogs
                      ? 'border-[#8caef9] bg-[#8caef9]/20 text-[#8caef9]'
                      : 'border-[#2c3e5a] bg-[#0e1624] text-[#a2afc3] hover:text-white'
                  }`}
                >
                  <Eye size={12} />
                  <span>{showSystemPromptInLogs ? 'Hide System Prompt' : 'Show System Prompt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLiveRoleLogs((s) => !s)}
                  className="px-2.5 py-1 rounded-lg border border-[#2c3e5a] bg-[#0e1624] hover:border-[#8caef9] text-[#c8d3e2] text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0"
                >
                  {showLiveRoleLogs ? 'Collapse Console ▲' : 'Expand Live Console ▼'}
                </button>
              </div>
            </div>

            {showLiveRoleLogs && (
              <div className="p-3.5 space-y-3">
                {/* Worker Role Stream Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1d2a3f] pb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedWorkerFilter('ACTIVE_STAGE')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedWorkerFilter === 'ACTIVE_STAGE'
                          ? 'bg-[#ff8a4c] text-[#0c1018]'
                          : 'bg-[#141f31] text-[#a2afc3] hover:text-white'
                      }`}
                    >
                      Active Stage ({activeRoleMeta.roleId})
                    </button>

                    {workerTelemetries.map((wt) => (
                      <button
                        key={wt.workerId}
                        type="button"
                        onClick={() => setSelectedWorkerFilter(wt.workerId)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          selectedWorkerFilter === wt.workerId
                            ? 'bg-[#53d6ab] text-[#0c1018]'
                            : 'bg-[#141f31] text-[#c8d3e2] hover:text-white border border-[#25354f]'
                        }`}
                      >
                        {wt.workerId} · {wt.modelName}
                      </button>
                    ))}

                    {workerTelemetries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkerFilter('ALL_WORKERS')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          selectedWorkerFilter === 'ALL_WORKERS'
                            ? 'bg-[#8caef9] text-[#0c1018]'
                            : 'bg-[#141f31] text-[#8caef9] hover:text-white border border-[#2a3c59]'
                        }`}
                      >
                        All Worker Streams ({workerTelemetries.length})
                      </button>
                    )}
                  </div>

                  {activePrimaryTelemetry && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#a2afc3] tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-[#141e2f] text-[#8caef9]">
                        {activePrimaryTelemetry.connectionSource}
                      </span>
                      <span className="text-[#53d6ab] font-bold">
                        {primaryStream.tokens} / {primaryStream.totalTokens} tokens
                      </span>
                      <span className="text-[#ffa875]">
                        {activePrimaryTelemetry.latencyMs} ms
                      </span>
                    </div>
                  )}
                </div>

                {/* CASE A: STAGE 3 PARALLEL DUAL-WORKER SPLIT STREAM (CODER A ∥ TEST ORACLE B) */}
                {isParallelDualStreamView && stage3WorkerATelemetry && stage3WorkerBTelemetry ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Left Terminal: Worker A (Coder) */}
                    <div className="rounded-xl border border-[#53d6ab]/45 bg-[#070b12] overflow-hidden flex flex-col">
                      <div className="px-3 py-2 bg-[#0f1928] border-b border-[#1f3047] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#53d6ab] text-[#0c1018] font-extrabold">
                            {stage3WorkerATelemetry.workerId}
                          </span>
                          <span className="text-[#53d6ab] font-bold">
                            {stage3WorkerATelemetry.modelName}
                          </span>
                        </div>
                        <span className="text-[#a2afc3] tabular-nums">
                          {parallelStreamA.tokens}/{parallelStreamA.totalTokens} tok ·{' '}
                          {stage3WorkerATelemetry.latencyMs}ms
                        </span>
                      </div>
                      {showSystemPromptInLogs && (
                        <div className="px-3 py-2 bg-[#0c1422] border-b border-[#1d2b40] font-mono text-[11px] text-[#8caef9]">
                          <div className="font-bold text-[10px] uppercase tracking-wider text-[#ffa875]">
                            System Prompt Dispatched to Worker A:
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap text-[#a2afc3]">
                            {stage3WorkerATelemetry.systemPromptSent}
                          </pre>
                        </div>
                      )}
                      <pre
                        ref={logViewportRef}
                        className="p-3 font-mono text-xs text-[#dce3ef] whitespace-pre-wrap overflow-y-auto max-h-[230px] leading-relaxed"
                      >
                        {parallelStreamA.visible}
                        {(streamProgress < 100 || isStageExecuting) && (
                          <span className="inline-block ml-1 text-[#53d6ab] animate-pulse font-extrabold">
                            ▋
                          </span>
                        )}
                      </pre>
                    </div>

                    {/* Right Terminal: Worker B (Independent Test Oracle) */}
                    <div className="rounded-xl border border-[#8caef9]/45 bg-[#070b12] overflow-hidden flex flex-col">
                      <div className="px-3 py-2 bg-[#0f1928] border-b border-[#1f3047] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#8caef9] text-[#0c1018] font-extrabold">
                            {stage3WorkerBTelemetry.workerId}
                          </span>
                          <span className="text-[#8caef9] font-bold">
                            {stage3WorkerBTelemetry.modelName}
                          </span>
                        </div>
                        <span className="text-[#a2afc3] tabular-nums">
                          {parallelStreamB.tokens}/{parallelStreamB.totalTokens} tok ·{' '}
                          {stage3WorkerBTelemetry.latencyMs}ms
                        </span>
                      </div>
                      {showSystemPromptInLogs && (
                        <div className="px-3 py-2 bg-[#0c1422] border-b border-[#1d2b40] font-mono text-[11px] text-[#8caef9]">
                          <div className="font-bold text-[10px] uppercase tracking-wider text-[#ffa875]">
                            System Prompt Dispatched to Worker B (Isolated from Worker A):
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap text-[#a2afc3]">
                            {stage3WorkerBTelemetry.systemPromptSent}
                          </pre>
                        </div>
                      )}
                      <pre
                        ref={parallelLogBViewportRef}
                        className="p-3 font-mono text-xs text-[#dce3ef] whitespace-pre-wrap overflow-y-auto max-h-[230px] leading-relaxed"
                      >
                        {parallelStreamB.visible}
                        {(streamProgress < 100 || isStageExecuting) && (
                          <span className="inline-block ml-1 text-[#8caef9] animate-pulse font-extrabold">
                            ▋
                          </span>
                        )}
                      </pre>
                    </div>
                  </div>
                ) : selectedWorkerFilter === 'ALL_WORKERS' ? (
                  /* CASE B: ALL EXECUTED WORKERS CHRONOLOGICAL RAW FEED */
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {workerTelemetries.map((wt, idx) => (
                      <div
                        key={`${wt.workerId}-${idx}`}
                        className="rounded-xl border border-[#26364e] bg-[#070b12] p-3 font-mono text-xs space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#ff8a4c] text-[#0c1018] font-extrabold">
                              {wt.workerId}
                            </span>
                            <span className="text-[#53d6ab] font-bold">{wt.modelName}</span>
                            <span className="text-[#a2afc3] text-[11px]">{wt.producedSummary}</span>
                          </div>
                          <span className="text-[#ffa875] tabular-nums text-[11px]">
                            {wt.latencyMs} ms
                          </span>
                        </div>
                        {showSystemPromptInLogs && (
                          <div className="rounded bg-[#0d1522] p-2 text-[11px] text-[#8caef9] border border-[#1e2d44]">
                            <strong>System Prompt:</strong> {wt.systemPromptSent}
                          </div>
                        )}
                        <pre className="text-[#dce3ef] whitespace-pre-wrap max-h-40 overflow-y-auto bg-[#05080e] p-2.5 rounded border border-[#192538]">
                          {wt.rawModelOutput}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* CASE C: SINGLE ACTIVE WORKER REAL-TIME STREAMING TERMINAL */
                  <div className="rounded-xl border border-[#283a54] bg-[#070b12] overflow-hidden">
                    {activePrimaryTelemetry && (
                      <div className="px-3.5 py-2 bg-[#0e1624] border-b border-[#1e2d44] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#ff8a4c] text-[#0c1018] font-extrabold">
                            {activePrimaryTelemetry.workerId}
                          </span>
                          <span className="text-[#53d6ab] font-bold">
                            Model: {activePrimaryTelemetry.modelName}
                          </span>
                          <span className="text-[#c8d3e2]">
                            {activePrimaryTelemetry.producedSummary}
                          </span>
                        </div>
                        <span className="text-[#8caef9] tabular-nums">
                          Stream Unlock Step: {revealStep}/4
                        </span>
                      </div>
                    )}

                    {showSystemPromptInLogs && activePrimaryTelemetry && (
                      <div className="px-3.5 py-2.5 bg-[#0b121e] border-b border-[#1e2c42] font-mono text-[11px]">
                        <div className="text-[#ffa875] font-bold uppercase tracking-wider text-[10px]">
                          System Prompt Sent by ShiftCore Runtime:
                        </div>
                        <pre className="mt-1 text-[#8caef9] whitespace-pre-wrap">
                          {activePrimaryTelemetry.systemPromptSent}
                        </pre>
                      </div>
                    )}

                    <pre
                      ref={logViewportRef}
                      className="p-3.5 font-mono text-xs text-[#dce3ef] whitespace-pre-wrap overflow-y-auto max-h-[240px] leading-relaxed"
                    >
                      {primaryStream.visible}
                      {(streamProgress < 100 || isStageExecuting) && (
                        <span className="inline-block ml-1 text-[#53d6ab] animate-pulse font-extrabold">
                          ▋
                        </span>
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Initial Stream Handshake Banner when revealStep === 0 */}
          {revealStep === 0 && (
            <div className="mb-4 rounded-2xl border border-dashed border-[#ff8a4c]/50 bg-[#111927] p-5 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-[#ff8a4c] shrink-0" />
                <div>
                  <div className="text-white font-bold">
                    Streaming raw model tokens from {activeRoleMeta.roleId} ({activeRoleMeta.modelAssigned})...
                  </div>
                  <div className="text-[#a2afc3] mt-0.5">
                    Stage result cards below unlock progressively as the Live Role Logs stream crosses each generation milestone.
                  </div>
                </div>
              </div>
              <span className="text-[#ffa875] font-extrabold tabular-nums">{progressPct}%</span>
            </div>
          )}

          {/* =========================================================
              STEP 1: UNDERSTAND (PROGRESSIVE REVEAL BY WORKER-S1-INTAKE)
             ========================================================= */}
          {currentStage === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Naive AI Column */}
                  <article className="md:col-span-5 rounded-2xl border border-[#fb8797]/40 bg-[#151c28] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#fb8797] uppercase">
                        ✕ Unmanaged Local LLM Alone
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#fb8797]/15 text-[#fb8797] font-mono text-[10px] font-bold">
                        No Runtime Context
                      </span>
                    </div>
                    <p className="text-xs text-[#a2afc3]">
                      Without ShiftCore’s Runtime, a raw LLM asks redundant boilerplate questions or guesses blindly:
                    </p>
                    <div className="space-y-1.5 font-mono text-xs">
                      {activeScenario.elicitation.naiveChatbotTranscript.map((line, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-[#0d131d] border border-[#2b3546] p-2.5 text-[#dce3ef]"
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </article>

                  {/* ShiftCore Auto-Resolution Column (Facts reveal progressively: Step 1 -> Fact 1, Step 2 -> All Facts) */}
                  <article className={`md:col-span-7 rounded-2xl border border-[#53d6ab]/50 bg-[#151c28] p-4 space-y-3 ${layerFilter === 'STATIC_ONLY' ? 'opacity-30' : ''}`}>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] text-[10px] font-mono font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                      ⚡ DYNAMIC · LIVE LOCAL MODEL REDUCTION ({coderModel})
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#53d6ab] uppercase">
                        ✓ WORKER-S1-INTAKE ({coderModel}) Auto-Resolution
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-[10px] font-bold">
                        {activeScenario.elicitation.autoResolvedFacts.length} Repo Facts Resolved
                      </span>
                    </div>
                    <p className="text-xs text-[#a2afc3]">
                      <code className="font-mono text-white">WORKER-S1-INTAKE</code> bound your prompt to{' '}
                      <strong>Tier 1 Repo AST</strong>, <strong>Tier 2 Policy</strong>, and{' '}
                      <strong>Tier 3 Knowledge</strong>:
                    </p>
                    <div className="space-y-2">
                      {activeScenario.elicitation.autoResolvedFacts.map((fact, fIdx) => (
                        <div
                          key={fact.id}
                          className="rounded-xl bg-[#0e131d] border border-[#26364d] p-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                            <span className="font-bold text-[#8caef9]">
                              [Fact #{fIdx + 1}] {fact.dimension}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#162234] text-[#53d6ab] text-[10px]">
                              {fact.sourceTier.replaceAll('_', ' ')} · {fact.sourceArtifact}
                            </span>
                          </div>
                          <div className="mt-1 font-bold text-white">{fact.autoResolvedValue}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                {/* Fast-Track to Step 3 Code Callout */}
                <div className="rounded-xl border border-[#53d6ab]/45 bg-[#0e1724] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#53d6ab]">
                      <Zap size={14} className="text-[#ff8a4c]" />
                      <span>LOOKING FOR THE GENERATED CODE?</span>
                    </div>
                    <p className="text-xs text-[#c8d3e2]">
                      Code synthesis is performed by Worker A & B in <strong>Step 3</strong>. Select an option below or auto-advance directly to the code:
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isStageExecuting}
                    onClick={() => onAutoAdvanceToStage3?.()}
                    className="px-4 py-2 rounded-lg bg-[#53d6ab] hover:bg-[#3cc498] text-[#0c1018] font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                  >
                    <Zap size={14} />
                    <span>Auto-Advance to Step 3 (Inspect Code) ➔</span>
                  </button>
                </div>

                {/* Single Blocking Architectural Gate Card */}
                <article className="rounded-2xl border border-[#ff8a4c]/60 bg-gradient-to-r from-[#ff8a4c]/12 to-[#141c29] p-5 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-[10px]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                        ⚡ DYNAMIC ELICITATION ({coderModel})
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#8caef9]/20 text-[#8caef9] font-extrabold">
                        <Lock size={11} />
                        🔒 STATIC ENTROPY CONTRACT (0.00 BITS REQUIRED FOR STAGE 2)
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                      DETERMINISTIC AMBIGUITY GATE ({gate.gateId}) · GENERATED BY WORKER-S1 ({coderModel})
                    </div>
                    <h3 className="mt-1 text-lg font-extrabold text-white">{gate.question}</h3>
                    <p className="mt-1 text-xs text-[#ffa875]" dir="rtl" lang="ar">
                      {gate.arabicHint}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {gate.options.map((opt, idx) => {
                      const isPrimaryOption = idx === 0;
                      const isSelected =
                        (isPrimaryOption && clarifiedPlatform === 'web') ||
                        (!isPrimaryOption && clarifiedPlatform === 'desktop');

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={isStageExecuting}
                          onClick={() =>
                            onSelectPlatformAndCompileStage2(isPrimaryOption ? 'web' : 'desktop')
                          }
                          aria-pressed={isSelected}
                          className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#ff8a4c] bg-[#ff8a4c]/20 ring-2 ring-[#ff8a4c]'
                              : 'border-[#304665] bg-[#131b28] hover:border-[#ff8a4c]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-mono text-xs">
                            <span className="font-bold text-[#ffa875]">{opt.id}</span>
                            {opt.recommended && (
                              <span className="px-2 py-0.5 rounded bg-[#53d6ab] text-[#0c1018] font-extrabold text-[10px]">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 font-bold text-sm text-white">{opt.label}</div>
                          <div className="mt-1 text-xs text-[#a2afc3]" dir="rtl" lang="ar">
                            {opt.arabicLabel}
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-[#26354a] font-mono text-[11px] text-[#53d6ab]">
                            Constraint: {opt.compiledConstraint}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {clarifiedPlatform === 'web' ? (
                    <div className="rounded-xl border border-[#53d6ab]/40 bg-[#0d131d] p-4 font-mono text-xs space-y-3">
                      <div className="flex items-center justify-between text-[#53d6ab] font-bold">
                        <span>✓ COMPILED TASKSPEC CONTRACT (READY FOR STAGE 2 ARCHITECT ROLE)</span>
                        <span>AMBIGUITY ENTROPY = 0.00 BITS</span>
                      </div>
                      <pre className="text-[#dce3ef] overflow-x-auto text-[11px] leading-relaxed max-h-[160px]">
                        {JSON.stringify(gate.compiledTaskSpecPreview, null, 2)}
                      </pre>
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1e2a3b]">
                        <span className="text-xs text-[#53d6ab] font-bold">
                          TaskSpec locked. Proceed to generate Plan or Code:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isStageExecuting}
                            onClick={() => onAdvanceToStageWithLiveWorker(1)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#223348] hover:bg-[#2c4059] text-white font-mono text-xs font-bold cursor-pointer"
                          >
                            <span>Next: Step 2 Plan →</span>
                          </button>
                          <button
                            type="button"
                            disabled={isStageExecuting}
                            onClick={() => onAutoAdvanceToStage3?.()}
                            className="px-4 py-1.5 rounded-lg bg-[#53d6ab] hover:bg-[#3cc498] text-[#0c1018] font-mono text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <Zap size={13} />
                            <span>Jump to Step 3 Code ➔</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#ff8a4c]/40 bg-[#0d131d] p-3 font-mono text-xs text-[#ffa875] flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Select option <strong>{gate.options[0]?.id}</strong> above to compile the locked{' '}
                        <code>TaskSpec</code>.
                      </span>
                      <button
                        type="button"
                        disabled={isStageExecuting}
                        onClick={() => onAutoAdvanceToStage3?.()}
                        className="px-3 py-1 rounded-lg bg-[#53d6ab] hover:bg-[#3cc498] text-[#0c1018] font-mono text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap size={12} />
                        <span>Auto-Advance to Step 3 Code ➔</span>
                      </button>
                    </div>
                  )}
                </article>
            </div>
          )}

          {/* =========================================================
              STEP 2: PLAN (PROGRESSIVE REVEAL BY WORKER-S2-ARCHITECT)
             ========================================================= */}
          {currentStage === 1 && (
            <div className="space-y-4">
              {revealStep >= 1 && (
                <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                      ⚡ DYNAMIC REQUIREMENT REDUCTION ({coderModel})
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#8caef9]/20 text-[#8caef9] font-extrabold">
                      <Shield size={11} />
                      🔒 STATIC POLICY INJECTION (POL-2026-v1)
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                    WORKER-S2-ARCHITECT ({coderModel}) · PROGRESSIVE REQUIREMENT SYNTHESIS (R1–R8)
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                    <div className={`md:col-span-6 rounded-xl border border-[#2b3a4f] bg-[#121b28] p-4 ${layerFilter === 'STATIC_ONLY' ? 'opacity-30' : ''}`}>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-[9px] font-bold mb-1">
                        ⚡ DYNAMIC SYNTHESIS
                      </div>
                      <span className="font-mono text-xs font-bold text-[#8caef9] block">
                        DEVELOPER & REPO SPEC (R1–R7)
                      </span>
                      <h4 className="mt-1 font-bold text-sm text-white">
                        {activeScenario.title} Functional & Schema Contracts
                      </h4>
                      <div className="mt-2 space-y-1.5 text-xs text-[#dce3ef]">
                        {activeScenario.requirements
                          .slice(0, revealStep >= 2 ? 7 : 4)
                          .map((r) => (
                            <div key={r.id} className="truncate">
                              <strong className="font-mono text-[#8caef9]">{r.id}:</strong>{' '}
                              {r.statement}
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="md:col-span-1 text-center font-mono text-2xl font-extrabold text-[#ff8a4c]">
                      +
                    </div>

                    <div className={`md:col-span-4 rounded-xl border border-[#ff8a4c]/50 bg-[#ff8a4c]/10 p-4 ${layerFilter === 'DYNAMIC_ONLY' ? 'opacity-30' : ''}`}>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#8caef9]/20 text-[#8caef9] font-mono text-[9px] font-bold mb-1">
                        🔒 STATIC POLICY CONTRACT
                      </div>
                      <span className="font-mono text-xs font-bold text-[#ffa875] block">
                        RUNTIME POLICY INJECTION ({failedReq.id})
                      </span>
                      {revealStep >= 2 ? (
                        <>
                          <h4 className="mt-1 font-bold text-sm text-white">
                            Mandatory {failedReq.category} Gate
                          </h4>
                          <p className="mt-1 text-xs text-[#dce3ef] leading-relaxed">
                            {failedReq.statement}
                          </p>
                        </>
                      ) : (
                        <div className="mt-2 font-mono text-xs text-[#ffa875] flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Injecting Tier 2 Policy Gate (R8)...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )}

              {revealStep >= 3 && (
                <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                    ARCHITECTURAL DECISION RECORDS (ADRs) SYNTHESIZED BY WORKER-S2-ARCHITECT ({coderModel})
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {activeScenario.decisions.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-xl border border-[#2b374a] bg-[#121a26] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs text-[#8caef9]">
                              {d.id} · {d.stage}
                            </div>
                            <b className="text-sm text-white block mt-0.5">{d.title}</b>
                            <span className="text-xs text-[#53d6ab] font-mono">
                              Chosen: {d.chosenOption}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWhy(d.id)}
                            aria-expanded={!!openWhyIds[d.id]}
                            className="px-3 py-1.5 rounded-lg border border-[#2b3d5b] bg-[#0b172a] hover:border-[#ff8a4c] text-xs font-bold text-[#c8d3e2] transition-colors cursor-pointer"
                          >
                            {openWhyIds[d.id] ? 'Hide Rationale' : 'Why? (Rationale)'}
                          </button>
                        </div>
                        {openWhyIds[d.id] && (
                          <div className="mt-3 pt-3 border-t border-[#283345] text-xs space-y-1.5">
                            <div className="text-[#fb8797] font-mono">
                              <strong>Rejected Alternative:</strong> {d.rejectedAlternative}
                            </div>
                            <p className="text-[#dce3ef] leading-relaxed">
                              <strong>Engineering Rationale:</strong> {d.rationale}
                            </p>
                            <div className="text-[#ffa875] font-mono">
                              <strong>Locked AST Constraint:</strong> {d.constraintLocked}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* Direct Action to Generate Step 3 Code */}
              <div className="rounded-xl border border-[#ff8a4c]/50 bg-[#121c2c] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="text-xs text-[#c8d3e2] font-mono">
                  <strong className="text-[#53d6ab]">Step 2 Ready:</strong> Requirements & ADRs locked. Synthesize Step 3 parallel implementation & test files:
                </div>
                <button
                  type="button"
                  disabled={isStageExecuting}
                  onClick={() => onAdvanceToStageWithLiveWorker(2)}
                  className="px-4 py-2 rounded-lg bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <Code2 size={15} />
                  <span>Generate Step 3 Code Now ({coderModel} ∥ {verifierModel}) ➔</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: WORK (PROGRESSIVE PARALLEL SYNTHESIS BY WORKER A ∥ WORKER B)
             ========================================================= */}
          {currentStage === 2 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#53d6ab]/20 text-[#53d6ab] font-mono text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                ⚡ DYNAMIC · LIVE PARALLEL WORKER SYNTHESIS ({coderModel} ∥ {verifierModel})
              </div>
              {/* Parallel Dual-Model Role Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <article className="rounded-2xl border border-[#53d6ab]/45 bg-[#131b28] p-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#53d6ab] font-extrabold">
                      ROLE 3A · IMPLEMENTATION CODER
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#53d6ab]/15 text-[#53d6ab]">
                      {coderModel}
                    </span>
                  </div>
                  <p className="text-xs text-[#c8d3e2]">
                    ✓ Synthesized {activeScenario.files[0]?.path} & {activeScenario.files[1]?.path}
                  </p>
                </article>

                <article className="rounded-2xl border border-[#8caef9]/45 bg-[#131b28] p-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#8caef9] font-extrabold">
                      ROLE 3B · INDEPENDENT TEST ORACLE SYNTHESIZER
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#8caef9]/15 text-[#8caef9]">
                      {verifierModel}
                    </span>
                  </div>
                  <p className="text-xs text-[#c8d3e2]">
                    ✓ Synthesized independent verification suite ({activeScenario.files[2]?.path})
                  </p>
                </article>
              </div>

              {/* Multi-File Code Explorer inside Checkpoint #S3-01 (All files immediately accessible) */}
              {activeScenario.files && activeScenario.files.length > 0 && (
                <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                  <div className="border-b border-[#263244] bg-[#0e131d] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeScenario.files.map((file, idx) => (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => setSelectedFileIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            selectedFileIndex === idx
                              ? 'bg-[#ff8a4c] text-[#0c1018]'
                              : 'bg-[#162030] text-[#c8d3e2] hover:text-white'
                          }`}
                        >
                          <FileCode2 size={13} />
                          <span>{file.path}</span>
                          <span className="text-[10px] opacity-80">
                            ({file.role === 'VERIFICATION_TEST_SUITE' ? 'Role 3B' : 'Role 3A'})
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setCodeViewVersion('v1')}
                        className={`px-2.5 py-1 rounded ${
                          codeViewVersion === 'v1'
                            ? 'bg-[#fb8797]/20 text-[#fb8797] border border-[#fb8797]/40 font-bold'
                            : 'text-[#a2afc3]'
                        }`}
                      >
                        #S3-01 (v1.0 Candidate)
                      </button>
                      {repaired && (
                        <button
                          type="button"
                          onClick={() => setCodeViewVersion('v1_1')}
                          className={`px-2.5 py-1 rounded ${
                            codeViewVersion === 'v1_1'
                              ? 'bg-[#53d6ab]/20 text-[#53d6ab] border border-[#53d6ab]/40 font-bold'
                              : 'text-[#a2afc3]'
                          }`}
                        >
                          #S3-01-v1.1 (Patched)
                        </button>
                      )}
                    </div>
                  </div>

                  {activeFile.defectExplanation && codeViewVersion === 'v1' && (
                    <div className="bg-[#fb8797]/12 border-b border-[#fb8797]/30 px-4 py-2.5 text-xs text-[#fb8797] flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0" />
                      <span>
                        <strong>Latent Defect in Role 3A’s v1.0 Output (To be audited in Stage 4):</strong>{' '}
                        {activeFile.defectExplanation}
                      </span>
                    </div>
                  )}

                  <pre className="p-4 font-mono text-xs text-[#dce3ef] bg-[#0a0f18] overflow-x-auto leading-relaxed max-h-[380px]">
                    {codeViewVersion === 'v1_1' ? activeFile.v1_1Code : activeFile.v1Code}
                  </pre>

                  <div className="border-t border-[#263244] bg-[#0c121c] p-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    <span className="text-[#a2afc3]">
                      Viewing <strong className="text-white">{activeFile.path}</strong> ({codeViewVersion === 'v1_1' ? 'v1.1 Patched' : 'v1.0 Candidate'})
                    </span>
                    <button
                      type="button"
                      disabled={isStageExecuting}
                      onClick={() => onAdvanceToStageWithLiveWorker(3)}
                      className="px-4 py-2 rounded-lg bg-[#53d6ab] hover:bg-[#3cc498] text-[#0c1018] font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Proceed to Step 4 (Oracle Audit & AST Patch) →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              STEP 4: CHECK & SURGICAL AST REPAIR (PROGRESSIVE ORACLE & PATCHER ROLES)
             ========================================================= */}
          {currentStage === 3 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#53d6ab]/20 text-[#53d6ab] font-mono text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                ⚡ DYNAMIC · LIVE VERIFICATION ORACLE & SURGICAL AST PATCH ({verifierModel} → {coderModel})
              </div>
              {revealStep >= 1 && (
                <div className="adaptive-four grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                    <span className="block text-xs text-[#a2afc3]">Role 3B Test Suite</span>
                    <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#53d6ab]">
                      8 / 8 ✓
                    </b>
                    <small className="block mt-1 text-xs text-[#94a3ba]">
                      Independent test suite active.
                    </small>
                  </article>

                  <article
                    className={`rounded-xl border p-3.5 ${
                      repaired
                        ? 'border-[#53d6ab]/45 bg-[#131b28]'
                        : 'border-[#fb8797]/50 bg-[#fb8797]/10'
                    }`}
                  >
                    <span className="block text-xs text-[#dce3ef]">
                      Role 4A Oracle ({verifierModel})
                    </span>
                    <b
                      className={`block mt-1.5 text-lg font-mono font-extrabold ${
                        repaired ? 'text-[#53d6ab]' : 'text-[#fb8797]'
                      }`}
                    >
                      {repaired ? '8 / 8 ✓' : revealStep >= 3 ? '7 / 8 ✕' : 'Auditing...'}
                    </b>
                    <small className="block mt-1 text-xs text-[#c8d3e2]">
                      {repaired
                        ? 'All 8 assertions pass on v1.1.'
                        : `Blocked on ${failedReq.id} (${failedReq.category}).`}
                    </small>
                  </article>

                  <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                    <span className="block text-xs text-[#a2afc3]">Retained Checkpoint</span>
                    <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#8caef9]">
                      {repaired ? '#S3-01-v1.1' : '#S3-01'}
                    </b>
                    <small className="block mt-1 text-xs text-[#94a3ba]">
                      {activeScenario.surgicalDiff.untouchedFilesCount} file(s) untouched.
                    </small>
                  </article>

                  <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                    <span className="block text-xs text-[#a2afc3]">Provenance Evidence</span>
                    <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#53d6ab]">
                      {repaired ? '11 / 13 ✓' : '9 / 13 ✓'}
                    </b>
                    <small className="block mt-1 text-xs text-[#94a3ba]">
                      Recorded in persistent ledger.
                    </small>
                  </article>
                </div>
              )}

              {/* Full 8-Row Requirement Verification Table (Reveals rows progressively as Oracle Role audits R1..R8) */}
              {revealStep >= 1 && (
                <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowProofTrace(!showProofTrace)}
                    aria-expanded={showProofTrace}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#1b2534] cursor-pointer"
                  >
                    <span>
                      Live Role 4A ({verifierModel}) Requirement Verification Matrix ({activeScenario.code})
                    </span>
                    <span>{showProofTrace ? '▲' : '▼'}</span>
                  </button>
                  {showProofTrace && (
                    <div className="border-t border-[#283345] overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#0d1b31] font-mono text-xs text-[#a2afc3] uppercase">
                            <th className="py-2.5 px-4">ID</th>
                            <th className="py-2.5 px-4">Category</th>
                            <th className="py-2.5 px-4">Requirement & Verification Assertion</th>
                            <th className="py-2.5 px-4">Target File</th>
                            <th className="py-2.5 px-4 text-right">Oracle Verdict</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#273448]">
                          {activeScenario.requirements.map((req) => {
                              const status = repaired ? req.v1_1Status : req.v1Status;
                              return (
                                <tr
                                  key={req.id}
                                  className={
                                    req.v1Status === 'FAIL'
                                      ? repaired
                                        ? 'bg-[#53d6ab]/8'
                                        : 'bg-[#fb8797]/12'
                                      : ''
                                  }
                                >
                                  <td className="py-2.5 px-4 font-mono font-bold text-[#ff8a4c]">
                                    {req.id}
                                  </td>
                                  <td className="py-2.5 px-4 font-mono text-[#8caef9]">
                                    {req.category}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <div className="font-bold text-white">{req.statement}</div>
                                    <div className="font-mono text-[11px] text-[#a2afc3] mt-0.5">
                                      Assertion: {req.verificationAssertion}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-4 font-mono text-[#c8d3e2]">
                                    {req.targetFile}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                                    {status === 'PASS' ? (
                                      <span className="text-[#53d6ab]">✓ PASS</span>
                                    ) : (
                                      <span className="text-[#fb8797]">✕ FAIL</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Gate Failure Diagnostic OR Verified Surgical AST Diff */}
              <>
                {!repaired ? (
                    <>
                      <article className="rounded-2xl border border-[#fb8797]/50 bg-[#fb8797]/8 p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-mono text-xs font-bold tracking-widest text-[#fb8797]">
                              COMPLETION GATE BLOCKED BY ROLE 4A ORACLE ({verifierModel})
                            </div>
                            <h3 className="mt-1 text-lg font-extrabold text-white">
                              {failedReq.id} Failed: {failedReq.statement}
                            </h3>
                          </div>
                          <span className="font-mono text-xs font-extrabold text-[#fb8797] border border-[#fb8797]/40 bg-[#fb8797]/15 px-3 py-1 rounded-md">
                            RELEASE BLOCKED
                          </span>
                        </div>

                        <div className="rounded-xl border border-[#2a3850] bg-[#0e131d] p-3.5 font-mono text-xs text-[#fb8797]">
                          {failedReq.failureDiagnostic}
                        </div>
                      </article>

                      <article className="rounded-2xl border border-[#ff8a4c]/50 bg-gradient-to-r from-[#ff8a4c]/12 to-[#141c29] p-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="max-w-2xl">
                          <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                            DISPATCH ROLE 4B: SURGICAL AST REPAIR WORKER ({coderModel}) ON #S3-01
                          </div>
                          <h3 className="mt-1 text-lg font-extrabold text-white">
                            Patch only the defective AST block in{' '}
                            <code className="font-mono text-[#ffa875]">
                              {activeScenario.surgicalDiff.targetFile}
                            </code>
                          </h3>
                          <p className="mt-1 text-xs text-[#dce3ef]">
                            Preserves{' '}
                            <strong>
                              {activeScenario.surgicalDiff.untouchedFilesCount} passing file(s)
                            </strong>{' '}
                            on Checkpoint #S3-01 and invokes{' '}
                            <code className="font-mono">{coderModel}</code> to patch only the failing AST node.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isStageExecuting}
                          onClick={onApplySurgicalRepairWithLiveWorker}
                          className="px-5 py-3 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-extrabold text-sm flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 shadow-lg cursor-pointer"
                        >
                          <Zap size={16} />
                          <span>Run Role 4B Surgical Repair ({coderModel}) →</span>
                        </button>
                      </article>
                    </>
                  ) : (
                    <article className="rounded-2xl border border-[#53d6ab]/50 bg-[#151c28] p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-mono text-xs font-bold tracking-widest text-[#53d6ab]">
                            ✓ ROLE 4B SURGICAL AST PATCH VERIFIED BY {verifierModel} (8/8 PASS)
                          </div>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            Target File Patched: {activeScenario.surgicalDiff.targetFile} (
                            {activeScenario.surgicalDiff.untouchedFilesCount} Other File(s) Untouched)
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleRepair(false)}
                            className="px-3 py-2 rounded-xl border border-[#2a3c58] bg-[#141c28] hover:border-[#fb8797] text-[#c8d3e2] font-mono font-bold text-xs transition-colors cursor-pointer"
                          >
                            ↺ Inspect Pre-Repair Failure (7/8)
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdvanceToStageWithLiveWorker(4)}
                            className="px-4 py-2 rounded-xl bg-[#53d6ab] hover:bg-[#2bc08a] text-[#0c1018] font-extrabold text-xs transition-colors cursor-pointer"
                          >
                            Run Stage 5 Sealer & Extractor Role →
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#2b3a4f] bg-[#0a0f18] p-4 font-mono text-xs space-y-2 overflow-x-auto">
                        <div className="text-[#8caef9] font-bold flex items-center gap-2">
                          <GitCompare size={14} />
                          <span>
                            AST DIFF ON RETAINED CHECKPOINT #S3-01 (
                            {activeScenario.surgicalDiff.targetFile}):
                          </span>
                        </div>
                        <pre className="text-[#fb8797] whitespace-pre-wrap">
                          {activeScenario.surgicalDiff.beforeSnippet}
                        </pre>
                        <pre className="text-[#53d6ab] whitespace-pre-wrap pt-1 border-t border-[#1e293b]">
                          {activeScenario.surgicalDiff.afterSnippet}
                        </pre>
                      </div>
                    </article>
                  )}
                </>
            </div>
          )}

          {/* =========================================================
              STEP 5: SEALED RESULT & TIER 3 KNOWLEDGE REUSE (WORKER-S5-EXTRACTOR)
             ========================================================= */}
          {currentStage === 4 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ff8a4c]/20 text-[#ffa875] font-mono text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff8a4c] animate-pulse" />
                ⚡ DYNAMIC · LIVE WEBCRYPTO SHA-256 SEAL & KNOWLEDGE EXTRACTOR
              </div>
              {revealStep >= 1 && (
                <article className="rounded-2xl border border-[#53d6ab]/50 bg-gradient-to-r from-[#53d6ab]/15 to-[#151c28] p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-xs font-bold tracking-widest text-[#53d6ab]">
                      CRYPTOGRAPHIC VERIFICATION SEAL ISSUED BY WORKER-S5 ({sealId})
                    </div>
                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      {activeScenario.title} — Verified Complete (8/8 Checks · 13/13 Evidence)
                    </h3>
                    <p className="mt-1 text-xs text-[#c8d3e2]">
                      Checkpoint <code className="font-mono text-[#53d6ab]">#S3-01-v1.1</code> (
                      {checkpointHash}) signed and pattern{' '}
                      <code className="font-mono text-[#ffa875]">
                        {activeScenario.extractedKnowledge.id}
                      </code>{' '}
                      promoted to Tier 3 Knowledge Graph.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenKnowledgeTab}
                    className="px-4 py-2.5 rounded-xl bg-[#53d6ab] hover:bg-[#3bc497] text-[#0c1018] font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles size={15} />
                    <span>Inspect Promoted Tier 3 Knowledge Unit →</span>
                  </button>
                </article>
              )}

              {/* Interactive Sandbox Execution Probe */}
              <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#ff8a4c]">
                        LIVE SANDBOX VERIFICATION HARNESS ·{' '}
                        {activeScenario.interactiveSandboxPreview.type}
                      </div>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        Target:{' '}
                        <code className="font-mono text-[#8caef9]">
                          {activeScenario.interactiveSandboxPreview.endpointOrTarget}
                        </code>
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-[#0e131d] p-1 border border-[#2b3546]">
                      <button
                        type="button"
                        onClick={() => setCalcGuardEnabled(true)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                          calcGuardEnabled
                            ? 'bg-[#53d6ab] text-[#0c1018]'
                            : 'text-[#a2afc3] hover:text-white'
                        }`}
                      >
                        v1.1 Sealed Build (Guarded)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcGuardEnabled(false)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                          !calcGuardEnabled
                            ? 'bg-[#fb8797] text-[#0c1018]'
                            : 'text-[#a2afc3] hover:text-white'
                        }`}
                      >
                        v1.0 Pre-Repair (Vulnerable)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {activeScenario.interactiveSandboxPreview.testCases.map((tc) => {
                      const output = calcGuardEnabled ? tc.v1_1Output : tc.v1Output;
                      const passed = calcGuardEnabled ? tc.v1_1Passed : tc.v1Passed;
                      return (
                        <div
                          key={tc.id}
                          className={`rounded-xl border p-3.5 text-xs ${
                            passed
                              ? 'border-[#2b3a4f] bg-[#0e131d]'
                              : 'border-[#fb8797]/60 bg-[#fb8797]/10'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-white">
                              {tc.id}: {tc.name}
                            </span>
                            <span
                              className={`font-mono font-extrabold px-2 py-0.5 rounded ${
                                passed
                                  ? 'bg-[#53d6ab]/15 text-[#53d6ab]'
                                  : 'bg-[#fb8797]/20 text-[#fb8797]'
                              }`}
                            >
                              {passed ? '✓ PASS' : '✕ FAIL (BLOCKED BY ORACLE)'}
                            </span>
                          </div>
                          <div className="mt-1.5 font-mono text-[11px] text-[#8caef9]">
                            Input: {tc.inputPayload}
                          </div>
                          <div
                            className={`mt-1 font-mono text-xs font-bold ${
                              passed ? 'text-[#53d6ab]' : 'text-[#fb8797]'
                            }`}
                          >
                            Output: {output}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Interactive Custom Payload Runner (Revealed at revealStep >= 3) */}
                  {revealStep >= 3 && (
                    <div className="pt-4 border-t border-[#263449] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#8caef9] flex items-center gap-1.5">
                          <Terminal size={14} className="text-[#53d6ab]" />
                          <span>EXECUTE CUSTOM LIVE PAYLOAD AGAINST GENERATED SERVICE:</span>
                        </span>
                        <label className="inline-flex items-center gap-2 font-mono text-xs text-[#ffa875] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={simulateConcurrentRace}
                            onChange={(e) => setSimulateConcurrentRace(e.target.checked)}
                            className="rounded border-[#384e6e]"
                          />
                          <span>Simulate 2x Parallel Race Probe (R8)</span>
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          value={customPayloadJson}
                          onChange={(e) => setCustomPayloadJson(e.target.value)}
                          className="flex-1 rounded-xl border border-[#324665] bg-[#0a0f18] px-3.5 py-2.5 font-mono text-xs text-white focus:border-[#ff8a4c] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={executeLiveCustomPayload}
                          className="px-4 py-2.5 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Play size={14} />
                          <span>Execute Live Payload</span>
                        </button>
                      </div>

                      {customExecutionLog && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono text-xs">
                          <div
                            className={`rounded-xl border p-3 ${
                              customExecutionLog.v1Passed
                                ? 'border-[#2b3a4f] bg-[#0c121c]'
                                : 'border-[#fb8797]/60 bg-[#fb8797]/10'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-[#a2afc3]">v1.0 Candidate Output:</span>
                              <span
                                className={
                                  customExecutionLog.v1Passed
                                    ? 'text-[#53d6ab]'
                                    : 'text-[#fb8797] font-bold'
                                }
                              >
                                {customExecutionLog.v1Passed ? 'PASS' : 'DEFECT TRIGGERED'}
                              </span>
                            </div>
                            <div className="text-white">{customExecutionLog.v1Result}</div>
                          </div>

                          <div className="rounded-xl border border-[#53d6ab]/50 bg-[#53d6ab]/10 p-3">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-[#a2afc3]">v1.1 Sealed Build Output:</span>
                              <span className="text-[#53d6ab] font-bold">✓ VERIFIED PASS</span>
                            </div>
                            <div className="text-white">{customExecutionLog.v1_1Result}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>

              {revealStep >= 3 && activeScenario.id === 'baseline_calculator' && (
                <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-[#ff8a4c]">
                      INTERACTIVE CALCULATOR WIDGET (SE-TASK-04)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => runQuickCalcTest(['8', '÷', '0', '='], true)}
                        className="px-2.5 py-1 rounded bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-xs font-bold cursor-pointer"
                      >
                        Test 8 ÷ 0 (v1.1 Guarded)
                      </button>
                      <button
                        type="button"
                        onClick={() => runQuickCalcTest(['8', '÷', '0', '='], false)}
                        className="px-2.5 py-1 rounded bg-[#fb8797]/15 text-[#fb8797] font-mono text-xs font-bold cursor-pointer"
                      >
                        Test 8 ÷ 0 (v1.0 Infinity)
                      </button>
                    </div>
                  </div>
                  <div className="max-w-xs mx-auto rounded-xl border border-[#2b3a4f] bg-[#0d131d] p-4">
                    <div className="text-right font-mono text-2xl font-extrabold text-white py-2 px-3 rounded bg-[#141c28] mb-3">
                      {calcState.display}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'].map(
                        (k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              setCalcState((prev) => stepCalculator(prev, k, calcGuardEnabled))
                            }
                            className="py-2.5 rounded-lg bg-[#1b2534] hover:bg-[#253347] text-white font-mono font-bold text-sm cursor-pointer"
                          >
                            {k}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </article>
              )}
            </div>
          )}

          {/* Stage Footer Navigation */}
          <div className="stage-footer">
            <button
              type="button"
              disabled={currentStage === 0 || isStageExecuting}
              onClick={() =>
                currentStage > 0 && onAdvanceToStageWithLiveWorker((currentStage - 1) as StageIndex)
              }
              className="stage-back-button"
            >
              ← Previous Step
            </button>

            <button
              type="button"
              className="runtime-drawer-toggle"
              aria-expanded={showRuntimeMap}
              onClick={() => setShowRuntimeMap(!showRuntimeMap)}
            >
              <Network size={16} aria-hidden="true" />
              <span>{showRuntimeMap ? 'Hide runtime pipeline' : 'Inside the runtime'}</span>
            </button>

            <div className="stage-footer-status">
              Step {currentStage + 1} of 5 · {activeScenario.code}
            </div>

            {currentStage < 4 ? (
              <button
                type="button"
                disabled={!nextStageCheck.allowed || isStageExecuting}
                onClick={() =>
                  nextStageCheck.allowed &&
                  onAdvanceToStageWithLiveWorker((currentStage + 1) as StageIndex)
                }
                title={nextStageCheck.reason}
                className="stage-next-button"
              >
                {currentStage === 0
                  ? `Run Step 2 Architect Role (${coderModel}) →`
                  : currentStage === 1
                    ? `Run Step 3 Parallel Roles (${coderModel} ∥ ${verifierModel}) →`
                    : currentStage === 2
                      ? `Run Step 4 Verifier Oracle Role (${verifierModel}) →`
                      : `Run Step 5 Sealer & Extractor Role →`}
              </button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-[#53d6ab]/15 border border-[#53d6ab]/40 text-[#53d6ab] font-mono text-xs font-bold">
                ✓ Cycle Sealed ({sealId})
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Synchronized Live Runtime Pipeline */}
        <aside className={`lifecycle-sidebar ${showRuntimeMap ? 'is-open' : ''}`}>
          <ArchitectureGraph
            isRuntimeIdle={isRuntimeIdle}
            currentStage={currentStage}
            repaired={repaired}
            clarifiedPlatform={clarifiedPlatform}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onFocusComponent}
            dependencyFilter={dependencyFilter}
            onChangeDependencyFilter={onChangeDependencyFilter}
            activeScenario={activeScenario}
            compactMode={true}
          />
        </aside>
      </div>
    </div>
  );
};
