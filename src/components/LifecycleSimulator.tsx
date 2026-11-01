import React, { useState, useEffect } from 'react';
import {
  STAGE_DEFINITIONS,
  REQUIREMENT_TRACE_MATRIX,
  INITIAL_CALCULATOR_STATE,
  stepCalculator,
  canAdvanceToStage,
  StageIndex,
  CalculatorState,
  DependencyCategory
} from '../lib/runtimeEngine';
import { ArchitectureGraph } from './ArchitectureGraph';

interface LifecycleSimulatorProps {
  currentStage: StageIndex;
  clarifiedPlatform: 'web' | 'desktop' | null;
  repaired: boolean;
  selectedComponentId: string;
  dependencyFilter: DependencyCategory | 'all';
  onSelectPlatform: (platform: 'web' | 'desktop') => void;
  onApplyRepair: () => void;
  onToggleRepair: (repaired: boolean) => void;
  onChangeStage: (stage: StageIndex) => void;
  onFocusComponent: (componentId: string) => void;
  onChangeDependencyFilter: (filter: DependencyCategory | 'all') => void;
}

const STEPPER_QUESTIONS: { num: number; title: string; sub: string }[] = [
  { num: 1, title: 'Understand', sub: 'What did you understand?' },
  { num: 2, title: 'Plan', sub: 'What will you do — and why?' },
  { num: 3, title: 'Work', sub: 'What are you doing now?' },
  { num: 4, title: 'Check', sub: 'Did it actually work?' },
  { num: 5, title: 'Result', sub: 'Can I trust the result?' }
];

export const LifecycleSimulator: React.FC<LifecycleSimulatorProps> = ({
  currentStage,
  clarifiedPlatform,
  repaired,
  selectedComponentId,
  dependencyFilter,
  onSelectPlatform,
  onApplyRepair,
  onToggleRepair,
  onChangeStage,
  onFocusComponent,
  onChangeDependencyFilter
}) => {
  const [openWhyIds, setOpenWhyIds] = useState<Record<string, boolean>>({
    whyStack: true
  });
  const [showContextDetails, setShowContextDetails] = useState<boolean>(true);
  const [showPlanDetails, setShowPlanDetails] = useState<boolean>(true);
  const [showExecutionDetails, setShowExecutionDetails] = useState<boolean>(true);
  const [showProofTrace, setShowProofTrace] = useState<boolean>(true);
  const [calcState, setCalcState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);
  const [calcGuardEnabled, setCalcGuardEnabled] = useState<boolean>(true);

  // Real physical keyboard support for Stage 5 Calculator (fulfilling REQ-06 live during presentation)
  useEffect(() => {
    if (currentStage !== 4) return;
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
  }, [currentStage, calcGuardEnabled]);

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

  // Screen Header Title & Status matching ShiftCore Calculator Reference Task
  const screenHeaders: { kicker: string; title: string; status: string }[] = [
    {
      kicker: 'STEP 1 · UNDERSTAND (TASK INTAKE & CONTEXT)',
      title: 'What did the Runtime understand from me?',
      status: clarifiedPlatform === 'web' ? 'UNDERSTOOD · WEB SELECTED' : 'NEEDS 1 DECISION'
    },
    {
      kicker: 'STEP 2 · PLAN (POLICY-AWARE PLANNING)',
      title: 'What will the Runtime do — and why?',
      status: 'PLAN READY'
    },
    {
      kicker: 'STEP 3 · WORK (STATE-AWARE EXECUTION)',
      title: 'What is happening right now?',
      status: 'VERIFYING'
    },
    {
      kicker: 'STEP 4 · CHECK (INDEPENDENT VERIFICATION & REPAIR)',
      title: 'Did the result actually satisfy the task?',
      status: repaired ? 'RE-VERIFIED (8/8)' : '1 REQUIRED FAILURE'
    },
    {
      kicker: 'STEP 5 · RESULT (VERIFIED COMPLETION & EXPERIENCE)',
      title: 'Can I trust the result — and what proves it?',
      status: 'VERIFIED COMPLETE'
    }
  ];

  const activeHeader = screenHeaders[currentStage];

  return (
    <div className="rounded-2xl border border-[#1b2b43] bg-[#060e1c]/90 overflow-hidden shadow-2xl">
      {/* 5-Step Journey Stepper (Exact ShiftCore Reference Flow) */}
      <nav
        aria-label="Task journey"
        className="border-b border-[#1a2941] bg-[#071020] px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-5 gap-3"
      >
        {STEPPER_QUESTIONS.map((step, idx) => {
          const sIdx = idx as StageIndex;
          const isCurrent = sIdx === currentStage;
          const isDone = sIdx < currentStage;
          const access = canAdvanceToStage(sIdx, { clarifiedPlatform, repaired });

          return (
            <button
              key={step.num}
              type="button"
              disabled={!access.allowed}
              onClick={() => access.allowed && onChangeStage(sIdx)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-[#ff7015] bg-[#ff7015]/12 shadow-sm'
                  : isDone
                    ? 'border-[#35d39a]/40 bg-[#0b1528] hover:border-[#35d39a]'
                    : access.allowed
                      ? 'border-[#223149] bg-[#0b1528]/60 hover:border-[#465f84]'
                      : 'border-[#17243a] bg-[#060d1a]/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full grid place-items-center font-mono text-xs font-extrabold shrink-0 ${
                  isCurrent
                    ? 'bg-[#ff7015] text-[#050b1a]'
                    : isDone
                      ? 'bg-[#35d39a]/20 text-[#35d39a] border border-[#35d39a]/50'
                      : 'bg-[#142a46] text-[#95a3ba]'
                }`}
              >
                {isDone ? '✓' : step.num}
              </span>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm text-white truncate">
                  {step.title}
                </div>
                <div className="text-xs text-[#95a3ba] truncate">{step.sub}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Main Split-Screen Workspace: Left = Calculator Task Flow | Right = Live Runtime Pipeline */}
      <div className="p-5 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Interactive Calculator Task Flow */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Workspace Stage Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#182943] pb-4">
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-[#ff7015]">
                {activeHeader.kicker}
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeHeader.title}
              </h2>
            </div>
            <div
              className={`font-mono text-xs font-bold px-3.5 py-2 rounded-xl border whitespace-nowrap shrink-0 ${
                currentStage === 3 && !repaired
                  ? 'border-[#ff6b72]/50 bg-[#ff6b72]/15 text-[#ff6b72]'
                  : (currentStage === 0 && clarifiedPlatform === 'web') ||
                      currentStage === 4 ||
                      (currentStage === 3 && repaired)
                    ? 'border-[#35d39a]/50 bg-[#35d39a]/15 text-[#35d39a]'
                    : 'border-[#ff7015]/50 bg-[#ff7015]/15 text-[#ff8c42]'
              }`}
            >
              {activeHeader.status}
            </div>
          </div>

          {/* =========================================================
              STEP 1: UNDERSTAND
             ========================================================= */}
          {currentStage === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    YOUR TASK (RAW USER REQUEST)
                  </div>
                  <h3 dir="rtl" className="mt-2 text-2xl font-extrabold text-white">
                    اعمل آلة حاسبة
                  </h3>
                  <p className="mt-2 text-sm text-[#95a3ba] leading-relaxed">
                    The Runtime knows this is a software task (“Make a calculator”), but the request
                    is still too broad to plan responsibly without checking context and resolving
                    material ambiguities.
                  </p>
                </article>

                <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    WHAT I UNDERSTOOD
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between border-b border-[#182943] pb-2">
                      <span className="text-[#95a3ba]">Task type</span>
                      <b className="text-white">Software development</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#182943] pb-2">
                      <span className="text-[#95a3ba]">Goal</span>
                      <b className="text-white">Calculator application</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#95a3ba]">Readiness</span>
                      {clarifiedPlatform === 'web' ? (
                        <b className="text-[#35d39a] font-mono">✓ Complete (Web Confirmed)</b>
                      ) : (
                        <b className="text-[#ff7015] font-mono">Incomplete (Needs 1 Decision)</b>
                      )}
                    </div>
                  </div>
                </article>
              </div>

              {/* Material Clarification Question Card */}
              <article className="rounded-2xl border border-[#ff7015]/50 bg-gradient-to-r from-[#ff7015]/10 to-[#0a1426] p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                      I NEED ONE DECISION FROM YOU (MOD-04 AMBIGUITY GATE)
                    </div>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Where should the calculator run?
                    </h3>
                    <p className="mt-1 text-sm text-[#95a3ba]">
                      This changes the product itself, so the Runtime should not guess.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectPlatform('web')}
                      className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                        clarifiedPlatform === 'web'
                          ? 'border-[#ff7015] bg-[#ff7015] text-[#050b1a] shadow-lg'
                          : 'border-[#304665] bg-[#0c1830] text-white hover:border-[#ff7015]'
                      }`}
                    >
                      Web
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPlatform('desktop')}
                      className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                        clarifiedPlatform === 'desktop'
                          ? 'border-[#ff7015] bg-[#ff7015]/20 text-white'
                          : 'border-[#304665] bg-[#0c1830] text-white hover:border-[#ff7015]'
                      }`}
                    >
                      Desktop
                    </button>
                  </div>
                </div>

                {clarifiedPlatform === 'desktop' && (
                  <div className="mt-3 rounded-xl border border-[#ff7015]/40 bg-[#081322] p-3 text-xs text-[#ff8c42]">
                    Desktop is a valid choice, but this reference run demonstrates the{' '}
                    <strong>Web</strong> path. Click <strong>Web</strong> to continue.
                  </div>
                )}
              </article>

              {/* Confirmation Card when Web is selected */}
              {clarifiedPlatform === 'web' && (
                <article className="rounded-2xl border border-[#35d39a]/50 bg-[#35d39a]/10 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#35d39a]/20 border border-[#35d39a] text-[#35d39a] grid place-items-center font-extrabold text-lg shrink-0">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Got it — Web calculator.</h3>
                      <p className="text-xs text-[#c8d3e2] mt-0.5">
                        I can decide the remaining implementation details from the workspace
                        preferences and task requirements.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChangeStage(1)}
                    className="px-4 py-2.5 rounded-xl bg-[#ff7015] hover:bg-[#ff812f] text-[#050b1a] font-extrabold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Next: View Plan (Step 2) →
                  </button>
                </article>
              )}

              {/* Context, Policy & Experience Used */}
              <div className="rounded-2xl border border-[#223149] bg-[#0b1528] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowContextDetails(!showContextDetails)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#0e1b31] transition-colors cursor-pointer"
                >
                  <span>
                    VIEW CONTEXT USED (WORKSPACE PREFERENCES, MANDATORY RULES & PGVECTOR MEMORY)
                  </span>
                  <span>{showContextDetails ? '▲' : '▼'}</span>
                </button>
                {showContextDetails && (
                  <div className="border-t border-[#182943] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[10px] font-mono text-[#95a3ba]">
                        Preferred language
                      </span>
                      <b className="block mt-1 text-sm text-white">TypeScript</b>
                      <small className="block mt-1 text-[11px] text-[#60a5fa]">
                        Preference, not a mandatory rule
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[10px] font-mono text-[#95a3ba]">
                        Available runtime
                      </span>
                      <b className="block mt-1 text-sm text-white">Node.js</b>
                      <small className="block mt-1 text-[11px] text-[#95a3ba]">
                        Available in this workspace
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#ff7015]/40 bg-[#09172a] p-3">
                      <span className="block text-[10px] font-mono text-[#ff8c42]">Safety rule</span>
                      <b className="block mt-1 text-sm text-white font-mono">eval() prohibited</b>
                      <small className="block mt-1 text-[11px] text-[#ff8c42]">
                        Mandatory workspace rule
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[10px] font-mono text-[#95a3ba]">
                        Quality rule
                      </span>
                      <b className="block mt-1 text-sm text-white">Build + critical checks</b>
                      <small className="block mt-1 text-[11px] text-[#35d39a]">
                        Must pass before completion
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[10px] font-mono text-[#95a3ba]">
                        Trusted experience
                      </span>
                      <b className="block mt-1 text-sm text-white">None relevant</b>
                      <small className="block mt-1 text-[11px] text-[#95a3ba]">
                        No prior pattern will be reused
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 2: PLAN
             ========================================================= */}
          {currentStage === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    HERE'S THE PLAN (MOD-05 PLANNER)
                  </div>
                  <ol className="mt-3 space-y-2 text-sm text-white">
                    {[
                      'Create the calculator',
                      'Implement core operations (+, -, ×, ÷)',
                      'Add keyboard support',
                      'Handle invalid operations safely',
                      'Verify every requirement'
                    ].map((item, idx) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 border-b border-[#182943] last:border-0 pb-2 last:pb-0"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#152a47] text-[#60a5fa] font-mono text-xs font-extrabold grid place-items-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    WHAT WILL COUNT AS DONE? (COMPLETION CONTRACT)
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between border-b border-[#182943] pb-2">
                      <span className="text-[#95a3ba]">User requirements covered</span>
                      <b className="text-white font-mono">7 items</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#182943] pb-2">
                      <span className="text-[#95a3ba]">Runtime quality requirement</span>
                      <b className="text-[#60a5fa]">Safe invalid division</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#182943] pb-2">
                      <span className="text-[#95a3ba]">Workspace rules</span>
                      <b className="text-[#ff8c42] font-mono text-xs">Build · checks · no eval()</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#95a3ba]">Completion rule</span>
                      <b className="text-[#35d39a] text-xs">No unresolved required failure</b>
                    </div>
                  </div>
                </article>
              </div>

              {/* Requirements — And Where They Came From */}
              <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                  REQUIREMENTS — AND WHERE THEY CAME FROM
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  <div className="md:col-span-6 rounded-xl border border-[#21354f] bg-[#09172a] p-4">
                    <span className="font-mono text-[10px] font-bold text-[#60a5fa]">
                      USER (7 ITEMS)
                    </span>
                    <h4 className="mt-1 font-bold text-sm text-white">User requirements</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-mono text-[#dce3ef]">
                      {['Add', 'Subtract', 'Multiply', 'Divide', 'Decimal', 'Clear', 'Keyboard'].map(
                        (req) => (
                          <span
                            key={req}
                            className="px-2 py-1 rounded bg-[#142a46] border border-[#263e61]"
                          >
                            {req}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1 text-center font-mono text-2xl font-extrabold text-[#ff7015]">
                    +
                  </div>

                  <div className="md:col-span-4 rounded-xl border border-[#ff7015]/40 bg-[#ff7015]/10 p-4">
                    <span className="font-mono text-[10px] font-bold text-[#ff8c42]">
                      RUNTIME QUALITY (+1 ITEM)
                    </span>
                    <h4 className="mt-1 font-bold text-sm text-white">
                      Added acceptance condition
                    </h4>
                    <p className="mt-1 text-xs text-[#dce3ef] leading-relaxed">
                      Invalid division must fail safely instead of producing an uncontrolled result (
                      <code className="font-mono text-[#ff8c42]">Infinity</code>).
                    </p>
                  </div>
                </div>
              </article>

              {/* Key Decisions with "Why?" toggles */}
              <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5">
                <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                  KEY DECISIONS (CLICK "WHY?" TO INSPECT RECORDED RATIONALE)
                </div>
                <div className="mt-3 space-y-2.5">
                  {[
                    {
                      id: 'whyWeb',
                      title: 'Web application',
                      sub: 'You decided',
                      why: 'Decision source: user clarification. The original request (“اعمل آلة حاسبة”) did not define the target platform, so the Runtime asked instead of guessing.'
                    },
                    {
                      id: 'whyTS',
                      title: 'TypeScript',
                      sub: 'Workspace preference',
                      why: 'Reason: TypeScript is the workspace preference and no task requirement conflicts with it. It is a preference, not a mandatory policy.'
                    },
                    {
                      id: 'whyStack',
                      title: 'Vanilla TypeScript + Vite',
                      sub: 'Runtime decided',
                      why: 'Based on: small interactive app, no routing, no SSR, no backend, no framework-level component complexity. Alternatives considered: React — unnecessary framework overhead for this task. Next.js — no SSR, routing, backend, or SEO need.'
                    },
                    {
                      id: 'whyBackend',
                      title: 'No backend',
                      sub: 'Runtime decided',
                      why: 'Reason: no persistence, authentication, shared state, or server-side workflow is required.'
                    }
                  ].map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-[#1f314b] bg-[#091526] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <b className="text-sm text-white">{d.title}</b>
                          <small className="block text-xs text-[#95a3ba]">{d.sub}</small>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWhy(d.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#2b3d5b] bg-[#0b172a] hover:border-[#ff7015] text-xs font-bold text-[#c8d3e2] transition-colors cursor-pointer"
                        >
                          {openWhyIds[d.id] ? 'Hide Why' : 'Why?'}
                        </button>
                      </div>
                      {openWhyIds[d.id] && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#182943] text-xs text-[#dce3ef] leading-relaxed">
                          {d.why}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>

              {/* Execution & Verification Path Disclosure */}
              <div className="rounded-2xl border border-[#223149] bg-[#0b1528] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPlanDetails(!showPlanDetails)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#0e1b31] cursor-pointer"
                >
                  <span>VIEW EXECUTION & VERIFICATION DETAILS</span>
                  <span>{showPlanDetails ? '▲' : '▼'}</span>
                </button>
                {showPlanDetails && (
                  <div className="border-t border-[#182943] p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3.5">
                      <h4 className="font-bold text-[#60a5fa] font-mono">
                        EXECUTION PATH (MOD-06)
                      </h4>
                      <p className="mt-1.5 text-[#dce3ef] font-mono">
                        Initialize → arithmetic core → UI → keyboard → error handling → tests →
                        build
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3.5">
                      <h4 className="font-bold text-[#35d39a] font-mono">
                        VERIFICATION PATH (MOD-08)
                      </h4>
                      <p className="mt-1.5 text-[#dce3ef] font-mono">
                        Requirements → checks → policy scan → evidence → completion gate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: WORK
             ========================================================= */}
          {currentStage === 2 && (
            <div className="space-y-4">
              {/* Iconic Work Message Card */}
              <article className="rounded-2xl border border-[#35d39a]/40 bg-gradient-to-r from-[#35d39a]/10 to-[#0a1426] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#35d39a]/15 border border-[#35d39a]/50 text-[#35d39a] grid place-items-center text-2xl font-black shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    THE AGENT FINISHED WRITING THE CODE
                  </div>
                  <h3 className="mt-1 text-2xl font-extrabold text-white">
                    But the task isn't done yet.
                  </h3>
                  <p className="mt-1 text-sm text-[#95a3ba]">
                    The Runtime now checks whether the requested outcome was actually achieved
                    before allowing task completion.
                  </p>
                </div>
              </article>

              {/* Progress Card */}
              <div className="rounded-2xl border border-[#223149] bg-[#0b1528] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#182943] pb-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#35d39a]/15 text-[#35d39a] grid place-items-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-white font-medium">Writing code</span>
                  </div>
                  <b className="font-mono text-xs text-[#35d39a]">Done</b>
                </div>
                <div className="flex items-center justify-between border-b border-[#182943] pb-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#35d39a]/15 text-[#35d39a] grid place-items-center text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-white font-medium">Building</span>
                  </div>
                  <b className="font-mono text-xs text-[#35d39a]">Done</b>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff7015]/15 text-[#ff7015] grid place-items-center text-xs font-bold">
                      ●
                    </span>
                    <span className="text-white font-medium">Checking requirements</span>
                  </div>
                  <b className="font-mono text-xs text-[#ff7015]">Running</b>
                </div>
              </div>

              {/* Agent Status vs Task Status Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                <div className="sm:col-span-5 rounded-2xl border border-[#243853] bg-[#0a1528] p-4">
                  <span className="block font-mono text-[10px] text-[#95a3ba]">Agent status</span>
                  <b className="block mt-1.5 font-mono text-sm font-extrabold text-[#35d39a]">
                    IMPLEMENTATION COMPLETE
                  </b>
                </div>
                <div className="sm:col-span-1 text-center font-mono text-xl text-[#667b9a]">
                  →
                </div>
                <div className="sm:col-span-5 rounded-2xl border border-[#ff7015]/50 bg-[#0a1528] p-4">
                  <span className="block font-mono text-[10px] text-[#95a3ba]">Task status</span>
                  <b className="block mt-1.5 font-mono text-sm font-extrabold text-[#ff7015]">
                    VERIFYING
                  </b>
                </div>
              </div>

              {/* Execution Details (Exact 4 Telemetry Metrics from Reference v5) */}
              <div className="rounded-2xl border border-[#223149] bg-[#0b1528] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExecutionDetails(!showExecutionDetails)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#0e1b31] cursor-pointer"
                >
                  <span>SEE EXECUTION DETAILS (SANDBOX & PROVENANCE TELEMETRY)</span>
                  <span>{showExecutionDetails ? '▲' : '▼'}</span>
                </button>
                {showExecutionDetails && (
                  <div className="border-t border-[#182943] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[#95a3ba] font-mono text-[10px]">
                        Files created
                      </span>
                      <b className="block mt-1 text-base text-white font-mono">5</b>
                      <small className="block mt-0.5 text-[#95a3ba] font-mono text-[11px]">
                        index.html · src/* · tests/*
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[#95a3ba] font-mono text-[10px]">
                        Execution events
                      </span>
                      <b className="block mt-1 text-base text-white font-mono">12</b>
                      <small className="block mt-0.5 text-[#95a3ba] text-[11px]">
                        tool calls + state transitions
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[#95a3ba] font-mono text-[10px]">
                        Workspace actions
                      </span>
                      <b className="block mt-1 text-base text-white">Local only</b>
                      <small className="block mt-0.5 text-[#95a3ba] text-[11px]">
                        no external deployment
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-3">
                      <span className="block text-[#95a3ba] font-mono text-[10px]">
                        Policy checks so far
                      </span>
                      <b className="block mt-1 text-base text-[#35d39a] font-mono">5</b>
                      <small className="block mt-0.5 text-[#35d39a] text-[11px]">
                        all passed (no eval())
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 4: CHECK & TARGETED REPAIR
             ========================================================= */}
          {currentStage === 3 && (
            <div className="space-y-4">
              {/* 4 Check Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <article className="rounded-xl border border-[#35d39a]/35 bg-[#0a1528] p-3.5">
                  <span className="block text-[11px] text-[#95a3ba]">
                    Did we cover every requirement?
                  </span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#35d39a]">
                    8 / 8 ✓
                  </b>
                  <small className="block mt-1 text-[11px] text-[#7d8da5]">
                    Every required behavior has a check.
                  </small>
                </article>

                <article
                  className={`rounded-xl border p-3.5 ${
                    repaired
                      ? 'border-[#35d39a]/45 bg-[#0a1528]'
                      : 'border-[#ff6b72]/50 bg-[#ff6b72]/10'
                  }`}
                >
                  <span className="block text-[11px] text-[#dce3ef]">
                    Did the implementation pass?
                  </span>
                  <b
                    className={`block mt-1.5 text-lg font-mono font-extrabold ${
                      repaired ? 'text-[#35d39a]' : 'text-[#ff6b72]'
                    }`}
                  >
                    {repaired ? '8 / 8 ✓' : '7 / 8 ✕'}
                  </b>
                  <small className="block mt-1 text-[11px] text-[#c8d3e2]">
                    {repaired
                      ? 'All required behaviors now pass.'
                      : 'One required behavior failed.'}
                  </small>
                </article>

                <article className="rounded-xl border border-[#35d39a]/35 bg-[#0a1528] p-3.5">
                  <span className="block text-[11px] text-[#95a3ba]">
                    Did it follow your rules?
                  </span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#35d39a]">
                    4 / 4 ✓
                  </b>
                  <small className="block mt-1 text-[11px] text-[#7d8da5]">
                    Build, checks, workspace, and no eval().
                  </small>
                </article>

                <article className="rounded-xl border border-[#35d39a]/35 bg-[#0a1528] p-3.5">
                  <span className="block text-[11px] text-[#95a3ba]">Do we have evidence?</span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#35d39a]">
                    13 / 13 ✓
                  </b>
                  <small className="block mt-1 text-[11px] text-[#7d8da5]">
                    Failing evidence still counts as evidence.
                  </small>
                </article>
              </div>

              {/* Failure Story & Automatic Targeted Repair Offer (Before Repair) */}
              {!repaired ? (
                <>
                  <article className="rounded-2xl border border-[#ff6b72]/50 bg-[#ff6b72]/8 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff6b72]">
                          TASK CANNOT BE COMPLETED YET (COMPLETION GATE BLOCKED)
                        </div>
                        <h3 className="mt-1 text-xl font-extrabold text-white">
                          1 required behavior failed
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-[#ff6b72] border border-[#ff6b72]/40 bg-[#ff6b72]/15 px-3 py-1 rounded-md">
                        BLOCKED
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-[#2a3850] bg-[#081322] p-3">
                        <span className="block text-[10px] text-[#95a3ba]">Behavior</span>
                        <b className="block mt-1 text-xs text-white">Division by zero</b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#081322] p-3">
                        <span className="block text-[10px] text-[#95a3ba]">Expected</span>
                        <b className="block mt-1 text-xs text-[#35d39a] font-mono">
                          Controlled error
                        </b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#081322] p-3">
                        <span className="block text-[10px] text-[#95a3ba]">Actual</span>
                        <b className="block mt-1 text-xs text-[#ff7015] font-mono">Infinity</b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#081322] p-3">
                        <span className="block text-[10px] text-[#95a3ba]">Evidence</span>
                        <b className="block mt-1 text-xs text-[#60a5fa] font-mono">DIV-ZERO-01</b>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-[#ff7015]/50 bg-gradient-to-r from-[#ff7015]/12 to-[#0a1426] p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                        I CAN FIX THIS AUTOMATICALLY (STATE-AWARE TARGETED REPAIR)
                      </div>
                      <h3 className="mt-1 text-lg font-extrabold text-white">
                        Add safe zero-division handling and verify again.
                      </h3>
                      <p className="mt-1 text-xs text-[#dce3ef]">
                        <b>Will change:</b> calculator logic only · <b>Will re-run:</b> division
                        checks + regression checks
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onApplyRepair}
                      className="px-5 py-3 rounded-xl bg-[#ff7015] hover:bg-[#ff812f] text-[#050b1a] font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 shadow-lg cursor-pointer"
                    >
                      Fix & verify again
                    </button>
                  </article>
                </>
              ) : (
                /* Repair History Story + Code Patch Diff (After Repair) */
                <article className="rounded-2xl border border-[#35d39a]/50 bg-[#0b1528] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-[10px] font-bold tracking-widest text-[#35d39a]">
                      WHAT HAPPENED (TARGETED REPAIR AUDIT LOG)
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleRepair(false)}
                        className="px-3 py-2 rounded-xl border border-[#2a3c58] bg-[#081322] hover:border-[#ff6b72] text-[#c8d3e2] font-mono font-bold text-xs transition-colors cursor-pointer"
                      >
                        ↺ Re-inspect Blocked State (7/8)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeStage(4)}
                        className="px-4 py-2 rounded-xl bg-[#35d39a] hover:bg-[#2bc08a] text-[#050b1a] font-extrabold text-xs transition-colors cursor-pointer"
                      >
                        View Verified Result & Calculator (Step 5) →
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#ff6b72]/15 text-[#ff6b72] font-mono text-xs font-black grid place-items-center shrink-0">
                        1
                      </span>
                      <div>
                        <b className="block text-xs text-white">Issue found (DIV-ZERO-01)</b>
                        <small className="block text-xs text-[#95a3ba]">
                          Division by zero returned Infinity.
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#ff7015]/15 text-[#ff7015] font-mono text-xs font-black grid place-items-center shrink-0">
                        2
                      </span>
                      <div>
                        <b className="block text-xs text-white">Repair applied (MOD-06)</b>
                        <small className="block text-xs text-[#95a3ba]">
                          Added a zero-denominator guard in calculator logic on retained Checkpoint
                          #S3-01.
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#35d39a]/15 text-[#35d39a] font-mono text-xs font-black grid place-items-center shrink-0">
                        3
                      </span>
                      <div>
                        <b className="block text-xs text-white">Re-verification passed (8 / 8 ✓)</b>
                        <small className="block text-xs text-[#95a3ba]">
                          Division checks and regression checks passed.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Surgical Code Patch Diff Applied on Checkpoint #S3-01 */}
                  <div className="rounded-xl border border-[#21354f] bg-[#060d1b] p-3.5 font-mono text-xs">
                    <div className="text-[10px] text-[#95a3ba] mb-1.5">
                      SURGICAL PATCH DIFF ON CHECKPOINT #S3-01 (src/calculator.ts):
                    </div>
                    <div className="text-[#ff6b72]">
                      - else display = String(stored / v); // 8 ÷ 0 produced "Infinity"
                    </div>
                    <div className="text-[#35d39a] mt-1">
                      + else if (op === '÷' && v === 0) display = 'Error'; // Controlled guard
                    </div>
                    <div className="text-[#35d39a]">+ else display = String(stored / v);</div>
                  </div>
                </article>
              )}

              {/* Full 8-Row Requirement -> Decision -> Evidence Trace Table */}
              <div className="rounded-2xl border border-[#223149] bg-[#0b1528] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowProofTrace(!showProofTrace)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#0e1b31] cursor-pointer"
                >
                  <span>VIEW REQUIREMENT → DECISION → EVIDENCE TRACE (ALL 8 REQUIREMENTS)</span>
                  <span>{showProofTrace ? '▲' : '▼'}</span>
                </button>
                {showProofTrace && (
                  <div className="border-t border-[#182943] overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0d1b31] font-mono text-[10px] text-[#95a3ba] uppercase">
                          <th className="py-2.5 px-4">Requirement</th>
                          <th className="py-2.5 px-4">Decision / Implementation</th>
                          <th className="py-2.5 px-4">Evidence</th>
                          <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172943]">
                        {REQUIREMENT_TRACE_MATRIX.map((req) => {
                          const isZeroRow = req.id === 'REQ-08';
                          const status = repaired ? req.statusAfterRepair : req.statusBeforeRepair;
                          return (
                            <tr
                              key={req.id}
                              className={
                                isZeroRow
                                  ? repaired
                                    ? 'bg-[#35d39a]/8'
                                    : 'bg-[#ff6b72]/12'
                                  : ''
                              }
                            >
                              <td className="py-2.5 px-4 text-white font-medium">
                                <span className="font-mono text-[11px] text-[#ff8c42] mr-1.5">
                                  {req.code}
                                </span>
                                {req.requirement}
                              </td>
                              <td className="py-2.5 px-4 text-[#c8d3e2]">
                                {isZeroRow
                                  ? repaired
                                    ? 'Division handler + zero guard (v === 0)'
                                    : 'Division handler (unguarded)'
                                  : req.decisionSummary}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-[#60a5fa] whitespace-nowrap">
                                {isZeroRow && repaired
                                  ? 'DIV-ZERO-01 + regression'
                                  : req.evidenceId}
                              </td>
                              <td
                                className={`py-2.5 px-4 text-right font-mono font-extrabold ${
                                  status === 'PASS' ? 'text-[#35d39a]' : 'text-[#ff6b72]'
                                }`}
                              >
                                {status}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 5: RESULT (VERIFIED COMPLETE + WORKING CALCULATOR)
             ========================================================= */}
          {currentStage === 4 && (
            <div className="space-y-4">
              {/* Verified Complete Seal Banner */}
              <article className="rounded-2xl border border-[#35d39a]/50 bg-gradient-to-r from-[#35d39a]/12 to-[#0a1426] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#35d39a]/15 border border-[#35d39a] text-[#35d39a] grid place-items-center text-2xl font-black shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-widest text-[#ff7015]">
                    VERIFIED COMPLETE
                  </div>
                  <h2 className="mt-0.5 text-2xl font-extrabold text-white">
                    Your calculator is ready.
                  </h2>
                  <p className="mt-1 text-sm text-[#c8d3e2]">
                    The Runtime can explain why this task is considered complete.
                  </p>
                </div>
              </article>

              {/* 5 Result Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { val: '8 / 8', label: 'Requirements satisfied' },
                  { val: '8 / 8', label: 'Acceptance checks passed' },
                  { val: '4 / 4', label: 'Workspace rules respected' },
                  { val: '13 / 13', label: 'Evidence records available' },
                  { val: '0', label: 'Unresolved issues' }
                ].map((m) => (
                  <article
                    key={m.label}
                    className="rounded-xl border border-[#243853] bg-[#0a1528] p-3 text-center"
                  >
                    <b className="block font-mono text-lg font-extrabold text-[#35d39a]">
                      {m.val}
                    </b>
                    <span className="block mt-1 text-[10px] text-[#95a3ba]">{m.label}</span>
                  </article>
                ))}
              </div>

              {/* 6-Card Proof Summary Grid from Reference v5 */}
              <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-4">
                <div className="font-mono text-[10px] font-bold text-[#ff7015] mb-2.5">
                  VERIFICATION PROOF SUMMARY (6 AUDIT DIMENSIONS)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                  {[
                    { b: 'Requirements', s: '8 satisfied' },
                    { b: 'Decisions', s: '4 with recorded basis' },
                    { b: 'Tests', s: 'All required checks passed' },
                    { b: 'Policy checks', s: '4 / 4 passed' },
                    { b: 'Evidence', s: '13 linked records' },
                    { b: 'Repair history', s: '1 issue · 1 targeted repair' }
                  ].map((item) => (
                    <div
                      key={item.b}
                      className="rounded-xl border border-[#21354f] bg-[#09172a] p-2.5"
                    >
                      <b className="block text-white">{item.b}</b>
                      <small className="block mt-0.5 text-[11px] text-[#35d39a] font-mono">
                        {item.s}
                      </small>
                    </div>
                  ))}
                </div>
              </article>

              {/* Working Calculator Artifact Preview + Saved Experience */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Interactive Working Calculator */}
                <article className="md:col-span-6 rounded-2xl border border-[#2a3c5b] bg-[#071121] p-4">
                  <div className="flex items-center justify-between border-b border-[#182943] pb-2.5">
                    <div>
                      <div className="font-mono text-[10px] font-bold text-[#ff7015]">
                        RESULT PREVIEW · {calcGuardEnabled ? 'ARTIFACT v1.1' : 'ARTIFACT v1.0'}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        Calculator Web Application
                      </h3>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        calcGuardEnabled
                          ? 'border-[#35d39a]/40 bg-[#35d39a]/15 text-[#35d39a]'
                          : 'border-[#ff6b72]/40 bg-[#ff6b72]/15 text-[#ff6b72]'
                      }`}
                    >
                      {calcGuardEnabled ? 'Guarded (v1.1)' : 'Pre-Repair (v1.0)'}
                    </span>
                  </div>

                  {/* Professor One-Click Demo Tests (Compare Guarded vs Pre-Repair Live) */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => runQuickCalcTest(['8', '÷', '0', '='], true)}
                      className="px-2.5 py-1 rounded-md border border-[#35d39a]/50 bg-[#35d39a]/15 text-[#35d39a] font-mono text-[11px] font-bold hover:bg-[#35d39a]/25 cursor-pointer"
                    >
                      Test 8 ÷ 0 (v1.1 → Error)
                    </button>
                    <button
                      type="button"
                      onClick={() => runQuickCalcTest(['8', '÷', '0', '='], false)}
                      className="px-2.5 py-1 rounded-md border border-[#ff6b72]/50 bg-[#ff6b72]/15 text-[#ff6b72] font-mono text-[11px] font-bold hover:bg-[#ff6b72]/25 cursor-pointer"
                    >
                      Simulate Pre-Repair (8 ÷ 0 → Infinity)
                    </button>
                    <button
                      type="button"
                      onClick={() => runQuickCalcTest(['7', '×', '6', '='], true)}
                      className="px-2.5 py-1 rounded-md border border-[#2b3d5b] bg-[#0d1a2e] text-[#60a5fa] font-mono text-[11px] font-bold hover:border-[#60a5fa] cursor-pointer"
                    >
                      Test 7 × 6 → 42
                    </button>
                  </div>

                  {/* Calculator Display */}
                  <div className="mt-3 rounded-xl bg-[#030914] border border-[#1a2b43] px-4 py-3 text-right font-mono">
                    <div className="text-[11px] text-[#66758f] h-4">
                      {calcState.historyExpression || 'Ready (Click keys or type on keyboard)'}
                    </div>
                    <div
                      data-testid="calc-display"
                      className={`text-2xl font-extrabold tabular-nums ${
                        calcState.display === 'Error'
                          ? 'text-[#ff7015]'
                          : calcState.display === 'Infinity'
                            ? 'text-[#ff6b72]'
                            : 'text-white'
                      }`}
                    >
                      {calcState.display}
                    </div>
                  </div>

                  {/* Calculator Grid */}
                  <div className="mt-2.5 grid grid-cols-4 gap-2">
                    {[
                      '7',
                      '8',
                      '9',
                      '÷',
                      '4',
                      '5',
                      '6',
                      '×',
                      '1',
                      '2',
                      '3',
                      '-',
                      '0',
                      '.',
                      'C',
                      '+',
                      '='
                    ].map((k) => {
                      const isOp = ['+', '-', '×', '÷'].includes(k);
                      const isEq = k === '=';
                      return (
                        <button
                          key={k}
                          type="button"
                          aria-label={`Calculator key ${k}`}
                          onClick={() =>
                            setCalcState((prev) => stepCalculator(prev, k, calcGuardEnabled))
                          }
                          className={`h-10 rounded-lg font-mono text-sm font-extrabold border transition-colors cursor-pointer ${
                            isEq
                              ? 'col-span-4 bg-[#ff7015] hover:bg-[#ff812f] text-[#07101d] border-[#ff7015]'
                              : isOp
                                ? 'bg-[#0d1a2e] hover:bg-[#152844] text-[#ff7015] border-[#213550]'
                                : 'bg-[#0d1a2e] hover:bg-[#152844] text-[#e6edf6] border-[#213550]'
                          }`}
                        >
                          {k}
                        </button>
                      );
                    })}
                  </div>
                </article>

                {/* Right sub-column: Saved Experience + 8-Step History */}
                <div className="md:col-span-6 space-y-3.5">
                  <article className="rounded-2xl border border-[#60a5fa]/40 bg-[#0b1528] p-4">
                    <div className="font-mono text-[10px] font-bold text-[#60a5fa]">
                      SAVED AS VERIFIED EXPERIENCE (MOD-03 PGVECTOR)
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-white">
                      This verified pattern may help with similar future tasks.
                    </h3>
                    <p className="mt-1 text-xs text-[#95a3ba]">
                      The Runtime will reuse it <strong>only</strong> when the future context
                      actually matches and current organizational policies permit.
                    </p>
                    <div className="mt-2.5 rounded-lg border border-[#21354f] bg-[#09172a] p-2.5 font-mono text-[11px] text-[#dce3ef]">
                      Context: small interactive web utility · TypeScript workspace · verified
                      arithmetic implementation · known repaired failure: invalid division handling.
                    </div>
                  </article>

                  {/* 8-Step Chronological History ("What Happened") */}
                  <article className="rounded-2xl border border-[#223149] bg-[#0b1528] p-4">
                    <div className="font-mono text-[10px] font-bold text-[#ff7015] mb-2">
                      WHAT HAPPENED (END-TO-END AUDIT TRAIL)
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { n: '1', b: 'Request', s: '“اعمل آلة حاسبة”', tone: 'normal' },
                        { n: '2', b: 'Clarification', s: 'User selected Web', tone: 'normal' },
                        {
                          n: '3',
                          b: 'Decisions',
                          s: 'TypeScript · Vanilla TS + Vite · no backend',
                          tone: 'normal'
                        },
                        {
                          n: '4',
                          b: 'Implementation',
                          s: 'Agent completed code',
                          tone: 'normal'
                        },
                        {
                          n: '5',
                          b: 'Verification failed',
                          s: 'Division by zero → Infinity',
                          tone: 'bad'
                        },
                        {
                          n: '6',
                          b: 'Repair',
                          s: 'Zero-denominator guard added',
                          tone: 'warn'
                        },
                        { n: '7', b: 'Re-verification', s: 'PASS (8 / 8)', tone: 'good' },
                        { n: '8', b: 'Completed', s: 'Verified complete', tone: 'good' }
                      ].map((h) => (
                        <div
                          key={h.n}
                          className="flex items-center justify-between gap-3 border-b border-[#182943] last:border-0 py-1.5"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-[#142a46] text-[#9db2cf] font-mono text-[10px] grid place-items-center shrink-0">
                              {h.n}
                            </span>
                            <b
                              className={
                                h.tone === 'bad'
                                  ? 'text-[#ff6b72]'
                                  : h.tone === 'good'
                                    ? 'text-[#35d39a]'
                                    : h.tone === 'warn'
                                      ? 'text-[#ff7015]'
                                      : 'text-white'
                              }
                            >
                              {h.b}
                            </b>
                          </div>
                          <small className="text-[#95a3ba] font-mono text-[11px] text-right">
                            {h.s}
                          </small>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </div>
          )}

          {/* Stage Navigation Footer */}
          <footer className="mt-2 flex items-center justify-between border-t border-[#17263d] pt-4">
            <button
              type="button"
              disabled={currentStage === 0}
              onClick={() => currentStage > 0 && onChangeStage((currentStage - 1) as StageIndex)}
              className="px-4 py-2.5 rounded-xl border border-[#263852] bg-[#0a1426] text-xs font-extrabold text-[#dce3ef] hover:border-[#465f84] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Previous
            </button>

            <div className="font-mono text-xs font-bold text-[#95a3ba] text-center px-2">
              {!nextStageCheck.allowed && currentStage < 4 ? (
                <span className="text-[#ff8c42]">{nextStageCheck.reason}</span>
              ) : (
                <span>{currentStage + 1} / 5</span>
              )}
            </div>

            <button
              type="button"
              disabled={!nextStageCheck.allowed || currentStage === 4}
              onClick={() =>
                nextStageCheck.allowed &&
                currentStage < 4 &&
                onChangeStage((currentStage + 1) as StageIndex)
              }
              className="px-5 py-2.5 rounded-xl bg-[#ff7015] hover:bg-[#ff812f] text-[#08101e] text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </footer>
        </div>

        {/* RIGHT COLUMN (5 cols): Live Synchronized 8-Module Runtime Architecture Pipeline */}
        <div className="xl:col-span-5">
          <ArchitectureGraph
            currentStage={currentStage}
            repaired={repaired}
            clarifiedPlatform={clarifiedPlatform}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onFocusComponent}
            dependencyFilter={dependencyFilter}
            onChangeDependencyFilter={onChangeDependencyFilter}
            compactMode={true}
          />
        </div>
      </div>
    </div>
  );
};
