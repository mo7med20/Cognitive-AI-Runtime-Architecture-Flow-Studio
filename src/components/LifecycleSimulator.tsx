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
import { Check, ChevronDown, Globe, Monitor, Network } from 'lucide-react';

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
  const [openWhyIds, setOpenWhyIds] = useState<Record<string, boolean>>({});
  const [showContextDetails, setShowContextDetails] = useState<boolean>(false);
  const [showPlanDetails, setShowPlanDetails] = useState<boolean>(false);
  const [showExecutionDetails, setShowExecutionDetails] = useState<boolean>(false);
  const [showProofTrace, setShowProofTrace] = useState<boolean>(false);
  const [showRuntimeMap, setShowRuntimeMap] = useState<boolean>(false);
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
      kicker: 'STEP 01 / UNDERSTAND',
      title: 'What did the system understand?',
      status: clarifiedPlatform === 'web' ? 'WEB SELECTED' : 'CHOOSE A PLATFORM'
    },
    {
      kicker: 'STEP 02 / PLAN',
      title: 'What is the plan?',
      status: 'PLAN READY'
    },
    {
      kicker: 'STEP 03 / WORK',
      title: 'What has been built?',
      status: 'CHECKING THE WORK'
    },
    {
      kicker: 'STEP 04 / CHECK',
      title: 'Does the result actually work?',
      status: repaired ? 'ALL CHECKS PASSED' : '1 CHECK FAILED'
    },
    {
      kicker: 'STEP 05 / RESULT',
      title: 'Try the verified result',
      status: 'VERIFIED COMPLETE'
    }
  ];

  const activeHeader = screenHeaders[currentStage];
  const stageGuidance = [
    clarifiedPlatform === 'web'
      ? 'Web selected. Continue to the plan when you are ready.'
      : 'Choose Web to continue this example. Desktop is shown as an option, but this demo follows the Web path.',
    'Review the plan and its main decision, then go to Work.',
    'The code is written. Continue to Check to see whether the result actually works.',
    repaired
      ? 'The failed check was repaired. Continue to Result to try the calculator.'
      : 'One check failed. Use “Fix & verify again” to continue.',
    'Try the calculator. You can inspect the proof and system map when you want more detail.'
  ];

  return (
    <div className="lifecycle-workspace">
      {/* 5-Step Journey Stepper (Exact ShiftCore Reference Flow) */}
      <nav aria-label="Task journey" className="journey-stepper">
        {STEPPER_QUESTIONS.map((step, index) => {
          const stageIndex = index as StageIndex;
          const isCurrent = stageIndex === currentStage;
          const isDone = stageIndex < currentStage;
          const access = canAdvanceToStage(stageIndex, { clarifiedPlatform, repaired });

          return (
            <button
              key={step.num}
              type="button"
              disabled={!access.allowed}
              aria-current={isCurrent ? 'step' : undefined}
              title={access.allowed ? step.sub : access.reason}
              onClick={() => access.allowed && onChangeStage(stageIndex)}
              className={`journey-step ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
            >
              <span className="journey-number" aria-hidden="true">{isDone ? <Check size={14} /> : step.num}</span>
              <span>
                <span className="journey-title block">{step.title}</span>
                <span className="journey-subtitle block">{step.sub}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Split-Screen Workspace: Left = Calculator Task Flow | Right = Live Runtime Pipeline */}
      <div className="lifecycle-grid">
        {/* LEFT COLUMN (7 cols): Interactive Calculator Task Flow */}
        <div className="lifecycle-main">
          {/* Workspace Stage Header */}
          <div className="stage-heading">
            <div>
              <div className="stage-heading-kicker">
                {activeHeader.kicker}
              </div>
              <h2 className="text-white">
                {activeHeader.title}
              </h2>
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

          <div className="stage-guidance" role="status">
            <span className="stage-guidance-label">What to do now</span>
            <p>{stageGuidance[currentStage]}</p>
          </div>

          {/* =========================================================
              STEP 1: UNDERSTAND
             ========================================================= */}
          {currentStage === 0 && (
            <div className="space-y-4">
              {/* Material Clarification Question Card */}
              <article className="rounded-2xl border border-[#ff8a4c]/50 bg-gradient-to-r from-[#ff8a4c]/10 to-[#141c29] p-5">
                <div className="platform-decision flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">ONE DECISION NEEDED</div>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Where should the calculator run?
                    </h3>
                    <p className="mt-1 text-sm text-[#a2afc3]">
                      You asked for a calculator. The system needs to know where you want to use it.
                    </p>
                  </div>

                  <div className="platform-options flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectPlatform('web')}
                      aria-pressed={clarifiedPlatform === 'web'}
                      className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                        clarifiedPlatform === 'web'
                          ? 'border-[#ff8a4c] bg-[#ff8a4c] text-[#0c1018] shadow-lg'
                          : 'border-[#304665] bg-[#172230] text-white hover:border-[#ff8a4c]'
                      }`}
                    >
                      <Globe size={16} className="inline-block mr-2" aria-hidden="true" />Web
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPlatform('desktop')}
                      aria-pressed={clarifiedPlatform === 'desktop'}
                      className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                        clarifiedPlatform === 'desktop'
                          ? 'border-[#ff8a4c] bg-[#ff8a4c]/20 text-white'
                          : 'border-[#304665] bg-[#172230] text-white hover:border-[#ff8a4c]'
                      }`}
                    >
                      <Monitor size={16} className="inline-block mr-2" aria-hidden="true" />Desktop
                    </button>
                  </div>
                </div>

                {clarifiedPlatform === 'desktop' && (
                  <div className="mt-3 rounded-xl border border-[#ff8a4c]/40 bg-[#141c28] p-3 text-xs text-[#ffa875]">
                    Desktop is a valid choice, but this reference run demonstrates the{' '}
                    <strong>Web</strong> path. Click <strong>Web</strong> to continue.
                  </div>
                )}
              </article>

              {/* Context, Policy & Experience Used */}
              <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowContextDetails(!showContextDetails)}
                  aria-expanded={showContextDetails}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#1b2534] transition-colors cursor-pointer"
                >
                  <span>Why this question? See workspace rules</span>
                  <span>{showContextDetails ? '▲' : '▼'}</span>
                </button>
                {showContextDetails && (
                  <div className="context-grid">
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-xs font-mono text-[#a2afc3]">
                        Preferred language
                      </span>
                      <b className="block mt-1 text-sm text-white">TypeScript</b>
                      <small className="block mt-1 text-xs text-[#8caef9]">
                        Preference, not a mandatory rule
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-xs font-mono text-[#a2afc3]">
                        Available runtime
                      </span>
                      <b className="block mt-1 text-sm text-white">Node.js</b>
                      <small className="block mt-1 text-xs text-[#a2afc3]">
                        Available in this workspace
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#ff8a4c]/40 bg-[#121b28] p-3">
                      <span className="block text-xs font-mono text-[#ffa875]">Safety rule</span>
                      <b className="block mt-1 text-sm text-white font-mono">eval() prohibited</b>
                      <small className="block mt-1 text-xs text-[#ffa875]">
                        Mandatory workspace rule
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-xs font-mono text-[#a2afc3]">
                        Quality rule
                      </span>
                      <b className="block mt-1 text-sm text-white">Build + critical checks</b>
                      <small className="block mt-1 text-xs text-[#53d6ab]">
                        Must pass before completion
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-xs font-mono text-[#a2afc3]">
                        Trusted experience
                      </span>
                      <b className="block mt-1 text-sm text-white">None relevant</b>
                      <small className="block mt-1 text-xs text-[#a2afc3]">
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
              <div className="adaptive-pair grid grid-cols-1 md:grid-cols-2 gap-4">
                <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                    HERE'S THE PLAN
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
                        className="flex items-center gap-3 border-b border-[#283345] last:border-0 pb-2 last:pb-0"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#152a47] text-[#8caef9] font-mono text-xs font-extrabold grid place-items-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </article>

                <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                    WHAT WILL COUNT AS DONE?
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm">
                    <div className="stage-detail-row flex items-center justify-between border-b border-[#283345] pb-2">
                      <span className="text-[#a2afc3]">User requirements covered</span>
                      <b className="text-white font-mono">7 items</b>
                    </div>
                    <div className="stage-detail-row flex items-center justify-between border-b border-[#283345] pb-2">
                      <span className="text-[#a2afc3]">Runtime quality requirement</span>
                      <b className="text-[#8caef9]">Safe invalid division</b>
                    </div>
                    <div className="stage-detail-row flex items-center justify-between border-b border-[#283345] pb-2">
                      <span className="text-[#a2afc3]">Workspace rules</span>
                      <b className="text-[#ffa875] font-mono text-xs">Build · checks · no eval()</b>
                    </div>
                    <div className="stage-detail-row flex items-center justify-between">
                      <span className="text-[#a2afc3]">Completion rule</span>
                      <b className="text-[#53d6ab] text-xs">No unresolved required failure</b>
                    </div>
                  </div>
                </article>
              </div>

              <details className="stage-extra">
                <summary>Explore requirements and decisions <ChevronDown size={17} aria-hidden="true" /></summary>
                <div className="stage-extra-content">
              {/* Requirements — And Where They Came From */}
              <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                  REQUIREMENTS — AND WHERE THEY CAME FROM
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  <div className="md:col-span-6 rounded-xl border border-[#2b3a4f] bg-[#121b28] p-4">
                    <span className="font-mono text-xs font-bold text-[#8caef9]">
                      USER (7 ITEMS)
                    </span>
                    <h4 className="mt-1 font-bold text-sm text-white">User requirements</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-mono text-[#dce3ef]">
                      {['Add', 'Subtract', 'Multiply', 'Divide', 'Decimal', 'Clear', 'Keyboard'].map(
                        (req) => (
                          <span
                            key={req}
                            className="px-2 py-1 rounded bg-[#202e42] border border-[#263e61]"
                          >
                            {req}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-1 text-center font-mono text-2xl font-extrabold text-[#ff8a4c]">
                    +
                  </div>

                  <div className="md:col-span-4 rounded-xl border border-[#ff8a4c]/40 bg-[#ff8a4c]/10 p-4">
                    <span className="font-mono text-xs font-bold text-[#ffa875]">
                      RUNTIME QUALITY (+1 ITEM)
                    </span>
                    <h4 className="mt-1 font-bold text-sm text-white">
                      Added acceptance condition
                    </h4>
                    <p className="mt-1 text-sm text-[#dce3ef] leading-relaxed">
                      Invalid division must fail safely instead of producing an uncontrolled result (
                      <code className="font-mono text-[#ffa875]">Infinity</code>).
                    </p>
                  </div>
                </div>
              </article>

              {/* Key Decisions with "Why?" toggles */}
              <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
                <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
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
                      className="rounded-xl border border-[#2b374a] bg-[#121a26] p-3.5"
                    >
                      <div className="stage-detail-row flex items-center justify-between gap-2">
                        <div>
                          <b className="text-sm text-white">{d.title}</b>
                          <small className="block text-xs text-[#a2afc3]">{d.sub}</small>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWhy(d.id)}
                          aria-expanded={!!openWhyIds[d.id]}
                          className="px-3 py-1.5 rounded-lg border border-[#2b3d5b] bg-[#0b172a] hover:border-[#ff8a4c] text-xs font-bold text-[#c8d3e2] transition-colors cursor-pointer"
                        >
                          {openWhyIds[d.id] ? 'Hide Why' : 'Why?'}
                        </button>
                      </div>
                      {openWhyIds[d.id] && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#283345] text-sm text-[#dce3ef] leading-relaxed">
                          {d.why}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>

                </div>
              </details>

              {/* Execution & Verification Path Disclosure */}
              <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowPlanDetails(!showPlanDetails)}
                  aria-expanded={showPlanDetails}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#1b2534] cursor-pointer"
                >
                  <span>How will the plan be checked?</span>
                  <span>{showPlanDetails ? '▲' : '▼'}</span>
                </button>
                {showPlanDetails && (
                  <div className="border-t border-[#283345] p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                      <h4 className="font-bold text-[#8caef9] font-mono">
                        EXECUTION PATH (MOD-06)
                      </h4>
                      <p className="mt-1.5 text-[#dce3ef] font-mono">
                        Initialize → arithmetic core → UI → keyboard → error handling → tests →
                        build
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                      <h4 className="font-bold text-[#53d6ab] font-mono">
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
              <article className="rounded-2xl border border-[#53d6ab]/40 bg-gradient-to-r from-[#53d6ab]/10 to-[#141c29] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#53d6ab]/15 border border-[#53d6ab]/50 text-[#53d6ab] grid place-items-center text-2xl font-black shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                    THE AGENT FINISHED WRITING THE CODE
                  </div>
                  <h3 className="mt-1 text-2xl font-extrabold text-white">
                    But the task isn't done yet.
                  </h3>
                  <p className="mt-1 text-sm text-[#a2afc3]">
                    The Runtime now checks whether the requested outcome was actually achieved
                    before allowing task completion.
                  </p>
                </div>
              </article>

              {/* Agent Status vs Task Status Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                <div className="sm:col-span-5 rounded-2xl border border-[#354359] bg-[#131b28] p-4">
                  <span className="block font-mono text-xs text-[#a2afc3]">Agent status</span>
                  <b className="block mt-1.5 font-mono text-sm font-extrabold text-[#53d6ab]">
                    IMPLEMENTATION COMPLETE
                  </b>
                </div>
                <div className="sm:col-span-1 text-center font-mono text-xl text-[#8b9ab1]">
                  →
                </div>
                <div className="sm:col-span-5 rounded-2xl border border-[#ff8a4c]/50 bg-[#131b28] p-4">
                  <span className="block font-mono text-xs text-[#a2afc3]">Task status</span>
                  <b className="block mt-1.5 font-mono text-sm font-extrabold text-[#ff8a4c]">
                    VERIFYING
                  </b>
                </div>
              </div>

              {/* Execution Details (Exact 4 Telemetry Metrics from Reference v5) */}
              <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowExecutionDetails(!showExecutionDetails)}
                  aria-expanded={showExecutionDetails}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#1b2534] cursor-pointer"
                >
                  <span>See execution details</span>
                  <span>{showExecutionDetails ? '▲' : '▼'}</span>
                </button>
                {showExecutionDetails && (
                  <div className="adaptive-four border-t border-[#283345] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-[#a2afc3] font-mono text-xs">
                        Files created
                      </span>
                      <b className="block mt-1 text-base text-white font-mono">5</b>
                      <small className="block mt-0.5 text-[#a2afc3] font-mono text-xs">
                        index.html · src/* · tests/*
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-[#a2afc3] font-mono text-xs">
                        Execution events
                      </span>
                      <b className="block mt-1 text-base text-white font-mono">12</b>
                      <small className="block mt-0.5 text-[#a2afc3] text-xs">
                        tool calls + state transitions
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-[#a2afc3] font-mono text-xs">
                        Workspace actions
                      </span>
                      <b className="block mt-1 text-base text-white">Local only</b>
                      <small className="block mt-0.5 text-[#a2afc3] text-xs">
                        no external deployment
                      </small>
                    </div>
                    <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3">
                      <span className="block text-[#a2afc3] font-mono text-xs">
                        Policy checks so far
                      </span>
                      <b className="block mt-1 text-base text-[#53d6ab] font-mono">5</b>
                      <small className="block mt-0.5 text-[#53d6ab] text-xs">
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
              <div className="adaptive-four grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                  <span className="block text-xs text-[#a2afc3]">
                    Did we cover every requirement?
                  </span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#53d6ab]">
                    8 / 8 ✓
                  </b>
                  <small className="block mt-1 text-xs text-[#94a3ba]">
                    Every required behavior has a check.
                  </small>
                </article>

                <article
                  className={`rounded-xl border p-3.5 ${
                    repaired
                      ? 'border-[#53d6ab]/45 bg-[#131b28]'
                      : 'border-[#fb8797]/50 bg-[#fb8797]/10'
                  }`}
                >
                  <span className="block text-sm text-[#dce3ef]">
                    Did the implementation pass?
                  </span>
                  <b
                    className={`block mt-1.5 text-lg font-mono font-extrabold ${
                      repaired ? 'text-[#53d6ab]' : 'text-[#fb8797]'
                    }`}
                  >
                    {repaired ? '8 / 8 ✓' : '7 / 8 ✕'}
                  </b>
                  <small className="block mt-1 text-sm text-[#c8d3e2]">
                    {repaired
                      ? 'All required behaviors now pass.'
                      : 'One required behavior failed.'}
                  </small>
                </article>

                <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                  <span className="block text-xs text-[#a2afc3]">
                    Did it follow your rules?
                  </span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#53d6ab]">
                    4 / 4 ✓
                  </b>
                  <small className="block mt-1 text-xs text-[#94a3ba]">
                    Build, checks, workspace, and no eval().
                  </small>
                </article>

                <article className="rounded-xl border border-[#53d6ab]/35 bg-[#131b28] p-3.5">
                  <span className="block text-xs text-[#a2afc3]">Do we have evidence?</span>
                  <b className="block mt-1.5 text-lg font-mono font-extrabold text-[#53d6ab]">
                    13 / 13 ✓
                  </b>
                  <small className="block mt-1 text-xs text-[#94a3ba]">
                    Failing evidence still counts as evidence.
                  </small>
                </article>
              </div>

              {/* Failure Story & Automatic Targeted Repair Offer (Before Repair) */}
              {!repaired ? (
                <>
                  <article className="rounded-2xl border border-[#fb8797]/50 bg-[#fb8797]/8 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs font-bold tracking-widest text-[#fb8797]">
                          TASK CANNOT BE COMPLETED YET (COMPLETION GATE BLOCKED)
                        </div>
                        <h3 className="mt-1 text-xl font-extrabold text-white">
                          1 required behavior failed
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-[#fb8797] border border-[#fb8797]/40 bg-[#fb8797]/15 px-3 py-1 rounded-md">
                        BLOCKED
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-[#2a3850] bg-[#141c28] p-3">
                        <span className="block text-xs text-[#a2afc3]">Behavior</span>
                        <b className="block mt-1 text-xs text-white">Division by zero</b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#141c28] p-3">
                        <span className="block text-xs text-[#a2afc3]">Expected</span>
                        <b className="block mt-1 text-xs text-[#53d6ab] font-mono">
                          Controlled error
                        </b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#141c28] p-3">
                        <span className="block text-xs text-[#a2afc3]">Actual</span>
                        <b className="block mt-1 text-xs text-[#ff8a4c] font-mono">Infinity</b>
                      </div>
                      <div className="rounded-xl border border-[#2a3850] bg-[#141c28] p-3">
                        <span className="block text-xs text-[#a2afc3]">Evidence</span>
                        <b className="block mt-1 text-xs text-[#8caef9] font-mono">DIV-ZERO-01</b>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-[#ff8a4c]/50 bg-gradient-to-r from-[#ff8a4c]/12 to-[#141c29] p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
                        I CAN FIX THIS AUTOMATICALLY (STATE-AWARE TARGETED REPAIR)
                      </div>
                      <h3 className="mt-1 text-lg font-extrabold text-white">
                        Add safe zero-division handling and verify again.
                      </h3>
                      <p className="mt-1 text-sm text-[#dce3ef]">
                        <b>Will change:</b> calculator logic only · <b>Will re-run:</b> division
                        checks + regression checks
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onApplyRepair}
                      className="px-5 py-3 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 shadow-lg cursor-pointer"
                    >
                      Fix & verify again
                    </button>
                  </article>
                </>
              ) : (
                /* Repair History Story + Code Patch Diff (After Repair) */
                <article className="rounded-2xl border border-[#53d6ab]/50 bg-[#151c28] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-xs font-bold tracking-widest text-[#53d6ab]">
                      WHAT HAPPENED (TARGETED REPAIR AUDIT LOG)
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleRepair(false)}
                        className="px-3 py-2 rounded-xl border border-[#2a3c58] bg-[#141c28] hover:border-[#fb8797] text-[#c8d3e2] font-mono font-bold text-xs transition-colors cursor-pointer"
                      >
                        ↺ Re-inspect Blocked State (7/8)
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeStage(4)}
                        className="px-4 py-2 rounded-xl bg-[#53d6ab] hover:bg-[#2bc08a] text-[#0c1018] font-extrabold text-xs transition-colors cursor-pointer"
                      >
                        View Verified Result & Calculator (Step 5) →
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#fb8797]/15 text-[#fb8797] font-mono text-xs font-black grid place-items-center shrink-0">
                        1
                      </span>
                      <div>
                        <b className="block text-xs text-white">Issue found (DIV-ZERO-01)</b>
                        <small className="block text-xs text-[#a2afc3]">
                          Division by zero returned Infinity.
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#ff8a4c]/15 text-[#ff8a4c] font-mono text-xs font-black grid place-items-center shrink-0">
                        2
                      </span>
                      <div>
                        <b className="block text-xs text-white">Repair applied (MOD-06)</b>
                        <small className="block text-xs text-[#a2afc3]">
                          Added a zero-denominator guard in calculator logic on retained Checkpoint
                          #S3-01.
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-xs font-black grid place-items-center shrink-0">
                        3
                      </span>
                      <div>
                        <b className="block text-xs text-white">Re-verification passed (8 / 8 ✓)</b>
                        <small className="block text-xs text-[#a2afc3]">
                          Division checks and regression checks passed.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Surgical Code Patch Diff Applied on Checkpoint #S3-01 */}
                  <div className="rounded-xl border border-[#2b3a4f] bg-[#0d131d] p-3.5 font-mono text-xs">
                    <div className="text-xs text-[#a2afc3] mb-1.5">
                      SURGICAL PATCH DIFF ON CHECKPOINT #S3-01 (src/calculator.ts):
                    </div>
                    <div className="text-[#fb8797]">
                      - else display = String(stored / v); // 8 ÷ 0 produced "Infinity"
                    </div>
                    <div className="text-[#53d6ab] mt-1">
                      + else if (op === '÷' && v === 0) display = 'Error'; // Controlled guard
                    </div>
                    <div className="text-[#53d6ab]">+ else display = String(stored / v);</div>
                  </div>
                </article>
              )}

              {/* Full 8-Row Requirement -> Decision -> Evidence Trace Table */}
              <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowProofTrace(!showProofTrace)}
                  aria-expanded={showProofTrace}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-mono font-bold text-[#c8d3e2] hover:bg-[#1b2534] cursor-pointer"
                >
                  <span>See all eight requirement checks</span>
                  <span>{showProofTrace ? '▲' : '▼'}</span>
                </button>
                {showProofTrace && (
                  <div className="border-t border-[#283345] overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0d1b31] font-mono text-xs text-[#a2afc3] uppercase">
                          <th className="py-2.5 px-4">Requirement</th>
                          <th className="py-2.5 px-4">Decision / Implementation</th>
                          <th className="py-2.5 px-4">Evidence</th>
                          <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#273448]">
                        {REQUIREMENT_TRACE_MATRIX.map((req) => {
                          const isZeroRow = req.id === 'REQ-08';
                          const status = repaired ? req.statusAfterRepair : req.statusBeforeRepair;
                          return (
                            <tr
                              key={req.id}
                              className={
                                isZeroRow
                                  ? repaired
                                    ? 'bg-[#53d6ab]/8'
                                    : 'bg-[#fb8797]/12'
                                  : ''
                              }
                            >
                              <td className="py-2.5 px-4 text-white font-medium">
                                <span className="font-mono text-xs text-[#ffa875] mr-1.5">
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
                              <td className="py-2.5 px-4 font-mono text-[#8caef9] whitespace-nowrap">
                                {isZeroRow && repaired
                                  ? 'DIV-ZERO-01 + regression'
                                  : req.evidenceId}
                              </td>
                              <td
                                className={`py-2.5 px-4 text-right font-mono font-extrabold ${
                                  status === 'PASS' ? 'text-[#53d6ab]' : 'text-[#fb8797]'
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
              <article className="rounded-2xl border border-[#53d6ab]/50 bg-gradient-to-r from-[#53d6ab]/12 to-[#141c29] p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#53d6ab]/15 border border-[#53d6ab] text-[#53d6ab] grid place-items-center text-2xl font-black shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-mono text-xs font-bold tracking-widest text-[#ff8a4c]">
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

              {/* The three signals a new user needs first. */}
              <div className="adaptive-result grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { val: '8 / 8', label: 'Acceptance checks passed' },
                  { val: '13 / 13', label: 'Evidence records available' },
                  { val: '0', label: 'Unresolved issues' }
                ].map((m) => (
                  <article
                    key={m.label}
                    className="rounded-xl border border-[#354359] bg-[#131b28] p-3 text-center"
                  >
                    <b className="block font-mono text-lg font-extrabold text-[#53d6ab]">
                      {m.val}
                    </b>
                    <span className="block mt-1 text-xs text-[#a2afc3]">{m.label}</span>
                  </article>
                ))}
              </div>

              {/* Working Calculator Artifact Preview + Saved Experience */}
              <div className="result-artifact">
                {/* Interactive Working Calculator */}
                <article className="result-calculator rounded-2xl border border-[#2a3c5b] bg-[#071121] p-4">
                  <div className="stage-detail-row flex items-center justify-between border-b border-[#283345] pb-2.5">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#ff8a4c]">
                        RESULT PREVIEW · {calcGuardEnabled ? 'ARTIFACT v1.1' : 'ARTIFACT v1.0'}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        Calculator Web Application
                      </h3>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        calcGuardEnabled
                          ? 'border-[#53d6ab]/40 bg-[#53d6ab]/15 text-[#53d6ab]'
                          : 'border-[#fb8797]/40 bg-[#fb8797]/15 text-[#fb8797]'
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
                      className="px-2.5 py-1 rounded-md border border-[#53d6ab]/50 bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-xs font-bold hover:bg-[#53d6ab]/25 cursor-pointer"
                    >
                      Test 8 ÷ 0 (v1.1 → Error)
                    </button>
                    <button
                      type="button"
                      onClick={() => runQuickCalcTest(['8', '÷', '0', '='], false)}
                      className="px-2.5 py-1 rounded-md border border-[#fb8797]/50 bg-[#fb8797]/15 text-[#fb8797] font-mono text-xs font-bold hover:bg-[#fb8797]/25 cursor-pointer"
                    >
                      Simulate Pre-Repair (8 ÷ 0 → Infinity)
                    </button>
                    <button
                      type="button"
                      onClick={() => runQuickCalcTest(['7', '×', '6', '='], true)}
                      className="px-2.5 py-1 rounded-md border border-[#2b3d5b] bg-[#0d1a2e] text-[#8caef9] font-mono text-xs font-bold hover:border-[#8caef9] cursor-pointer"
                    >
                      Test 7 × 6 → 42
                    </button>
                  </div>

                  {/* Calculator Display */}
                  <div className="mt-3 rounded-xl bg-[#030914] border border-[#1a2b43] px-4 py-3 text-right font-mono">
                    <div className="text-xs text-[#a2afc3] min-h-5">
                      {calcState.historyExpression || 'Ready (Click keys or type on keyboard)'}
                    </div>
                    <div
                      data-testid="calc-display"
                      className={`text-3xl break-all font-semibold tabular-nums ${
                        calcState.display === 'Error'
                          ? 'text-[#ff8a4c]'
                          : calcState.display === 'Infinity'
                            ? 'text-[#fb8797]'
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
                          className={`h-12 rounded-lg font-mono text-base font-semibold border transition-colors cursor-pointer ${
                            isEq
                              ? 'col-span-4 bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#07101d] border-[#ff8a4c]'
                              : isOp
                                ? 'bg-[#0d1a2e] hover:bg-[#152844] text-[#ff8a4c] border-[#213550]'
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
                <details className="stage-extra result-history">
                  <summary>See what happened and what was saved <ChevronDown size={17} aria-hidden="true" /></summary>
                  <div className="stage-extra-content">
                  <article className="rounded-2xl border border-[#8caef9]/40 bg-[#151c28] p-4">
                    <div className="font-mono text-xs font-bold text-[#8caef9]">
                      SAVED AS VERIFIED EXPERIENCE (MOD-03 PGVECTOR)
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-white">
                      This verified pattern may help with similar future tasks.
                    </h3>
                    <p className="mt-1 text-xs text-[#a2afc3]">
                      The Runtime will reuse it <strong>only</strong> when the future context
                      actually matches and current organizational policies permit.
                    </p>
                    <div className="mt-2.5 rounded-lg border border-[#2b3a4f] bg-[#121b28] p-2.5 font-mono text-sm text-[#dce3ef]">
                      Context: small interactive web utility · TypeScript workspace · verified
                      arithmetic implementation · known repaired failure: invalid division handling.
                    </div>
                  </article>

                  {/* 8-Step Chronological History ("What Happened") */}
                  <article className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-4">
                    <div className="font-mono text-xs font-bold text-[#ff8a4c] mb-2">
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
                          className="stage-detail-row flex items-center justify-between gap-3 border-b border-[#283345] last:border-0 py-1.5"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-[#202e42] text-[#9db2cf] font-mono text-xs grid place-items-center shrink-0">
                              {h.n}
                            </span>
                            <b
                              className={
                                h.tone === 'bad'
                                  ? 'text-[#fb8797]'
                                  : h.tone === 'good'
                                    ? 'text-[#53d6ab]'
                                    : h.tone === 'warn'
                                      ? 'text-[#ff8a4c]'
                                      : 'text-white'
                              }
                            >
                              {h.b}
                            </b>
                          </div>
                          <small className="text-[#a2afc3] font-mono text-xs text-right">
                            {h.s}
                          </small>
                        </div>
                      ))}
                    </div>
                  </article>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Stage Navigation Footer */}
          <footer className="stage-navigation">
            <button
              type="button"
              disabled={currentStage === 0}
              onClick={() => currentStage > 0 && onChangeStage((currentStage - 1) as StageIndex)}
              className="px-4 py-2.5 rounded-xl border border-[#354359] bg-[#141c29] text-xs font-extrabold text-[#dce3ef] hover:border-[#465f84] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← Previous
            </button>

            <div className="font-mono text-xs font-bold text-[#a2afc3] text-center px-2">
              {!nextStageCheck.allowed && currentStage < 4 ? (
                <span className="text-[#ffa875]">{nextStageCheck.reason}</span>
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
              className="px-5 py-2.5 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#10151e] text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next →
            </button>
          </footer>
        </div>

      </div>
      <div className="runtime-map-disclosure">
        <button type="button" className="runtime-map-button" aria-expanded={showRuntimeMap} onClick={() => setShowRuntimeMap(!showRuntimeMap)}>
          <span><Network size={18} aria-hidden="true" /> Explore what happened inside the system</span>
          <ChevronDown size={18} className={showRuntimeMap ? 'is-open' : ''} aria-hidden="true" />
        </button>
        {showRuntimeMap && (
          <div className="lifecycle-side">
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
        )}
      </div>
    </div>
  );
};
