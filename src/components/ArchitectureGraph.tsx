import React from 'react';
import {
  SYSTEM_COMPONENTS,
  DATA_DEPENDENCY_EDGES,
  STAGE_DEFINITIONS,
  STAGE_CALCULATOR_FLOWS,
  POLICY_GOVERNANCE_DISPOSITIONS,
  StageIndex,
  DependencyCategory,
  DataDependencyEdge,
  getComponentDependencies
} from '../lib/runtimeEngine';
import { ArrowDown, ArrowRight, RotateCcw } from 'lucide-react';

interface ArchitectureGraphProps {
  currentStage: StageIndex;
  repaired: boolean;
  clarifiedPlatform: 'web' | 'desktop' | null;
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  dependencyFilter: DependencyCategory | 'all';
  onChangeDependencyFilter: (filter: DependencyCategory | 'all') => void;
  compactMode?: boolean;
}

interface PipelineStepItem {
  compId: string;
  phaseNumber: string;
  stageBadge: string;
  calculatorAction: string;
  dataFlowIn: string;
  dataFlowOut: string;
  dbWrite: string;
}

const CALCULATOR_PIPELINE_STEPS: PipelineStepItem[] = [
  {
    compId: 'comp_intake',
    phaseNumber: '01',
    stageBadge: 'STEP 1 · UNDERSTAND',
    calculatorAction: 'Captures raw prompt «اعمل آلة حاسبة» & detects Node.js workspace.',
    dataFlowIn: 'User Input: "اعمل آلة حاسبة"',
    dataFlowOut: 'TaskRequest Envelope (#TASK-001)',
    dbWrite: 'tasks · workspace_contexts'
  },
  {
    compId: 'comp_policy',
    phaseNumber: '02',
    stageBadge: 'STEPS 1, 2 & 4 · POLICY',
    calculatorAction: 'Enforces mandatory rule (eval() prohibited) vs. preference (TypeScript).',
    dataFlowIn: 'Calculator Security & Quality Rules',
    dataFlowOut: 'PolicyConstraintMatrix (4 Mandatory Rules)',
    dbWrite: 'policy_evaluations'
  },
  {
    compId: 'comp_experience',
    phaseNumber: '03',
    stageBadge: 'STEP 1 (READ) & STEP 5 (WRITE)',
    calculatorAction:
      'Step 1: Finds 0 prior calculator patterns. Step 5: Saves verified calculator + zero-guard.',
    dataFlowIn: 'Calculator Vector + Active Policy Hash',
    dataFlowOut: 'Step 1: 0 Matches · Step 5: EXP-VEC-2026-001',
    dbWrite: 'experience_vectors (pgvector)'
  },
  {
    compId: 'comp_analyzer',
    phaseNumber: '04',
    stageBadge: 'STEP 1 → 2 · CLARIFY & SPEC',
    calculatorAction:
      'Pauses for Web vs. Desktop choice, then locks 7 User Calculator Reqs + 1 Quality Req.',
    dataFlowIn: 'TaskRequest + PolicyMatrix + User Choice ("Web")',
    dataFlowOut: 'Calculator TaskSpec v1 (8 Requirements)',
    dbWrite: 'task_specifications · clarification_events'
  },
  {
    compId: 'comp_planner',
    phaseNumber: '05',
    stageBadge: 'STEP 2 · PLAN',
    calculatorAction:
      'Chooses Vanilla TS + Vite & No Backend for the Calculator; rejects React/Next.js overhead.',
    dataFlowIn: 'Calculator TaskSpec v1 + Guardrails',
    dataFlowOut: '5-Step Calculator Plan + 4 Decisions (Why?)',
    dbWrite: 'execution_plans · architectural_decisions'
  },
  {
    compId: 'comp_orchestrator',
    phaseNumber: '06',
    stageBadge: 'STEPS 3 & 4 · WORK & REPAIR',
    calculatorAction:
      'Generates 5 calculator files across 12 events; retains Checkpoint #S3-01 for 8÷0 repair.',
    dataFlowIn: 'Calculator Plan + TargetedRepairDirective (on fail)',
    dataFlowOut: 'Calculator Artifact v1.0 → v1.1 (Agent=DONE, Task=VERIFYING)',
    dbWrite: 'execution_attempts · state_snapshots'
  },
  {
    compId: 'comp_evidence',
    phaseNumber: '07',
    stageBadge: 'STEPS 3, 4 & 5 · PROVENANCE',
    calculatorAction:
      'Links all 8 calculator requirements to 13 deterministic evidence records (including DIV-ZERO-01).',
    dataFlowIn: 'Build Logs + AST Scan + 8 Calculator Test Traces',
    dataFlowOut: 'EvidenceBundle (13/13 Calculator Records)',
    dbWrite: 'evidence_records (PostgreSQL)'
  },
  {
    compId: 'comp_verifier',
    phaseNumber: '08',
    stageBadge: 'STEPS 4 & 5 · GATE & SEAL',
    calculatorAction:
      'Blocks calculator completion on 8÷0=Infinity (7/8); triggers repair guard; seals 8/8 Verified Complete.',
    dataFlowIn: 'Calculator Artifact + Contract + 13/13 Evidence',
    dataFlowOut: 'Pre-Repair: BLOCKED (7/8) → Post-Repair: SEALED (8/8)',
    dbWrite: 'verification_outcomes · completion_gates'
  }
];

export const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({
  currentStage,
  repaired,
  clarifiedPlatform,
  selectedComponentId,
  onSelectComponent,
  dependencyFilter,
  onChangeDependencyFilter,
  compactMode = false
}) => {
  const stageDef = STAGE_DEFINITIONS[currentStage];
  const stageFlowNodes = STAGE_CALCULATOR_FLOWS[currentStage];
  const { component: activeComp, incoming, outgoing } = getComponentDependencies(selectedComponentId);

  const isComponentActiveInStage = (compId: string) =>
    stageDef.primaryComponents.includes(compId);

  const isEdgeActiveInStage = (edge: DataDependencyEdge) =>
    stageDef.activeEdgeIds.includes(edge.id);

  const visibleEdges = DATA_DEPENDENCY_EDGES.filter((edge) =>
    dependencyFilter === 'all' ? true : edge.category === dependencyFilter
  );

  // =========================================================================
  // COMPACT MODE: Synchronized Right-Hand Live Pipeline for the Calculator Task
  // =========================================================================
  if (compactMode) {
    return (
      <div className="rounded-2xl border border-[#223149] bg-[#071020]/95 p-5 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a2941] pb-3.5">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-wider text-[#ff7015]">
              CALCULATOR RUNTIME ARCHITECTURE FLOW · «اعمل آلة حاسبة»
            </div>
            <h3 className="mt-1 text-base font-bold text-white">
              Step {currentStage + 1}/5 ({stageDef.shortTitle}): How the Runtime Processes the
              Calculator
            </h3>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-[#223149] bg-[#0b1528] text-[#60a5fa]">
            Click any node to inspect
          </span>
        </div>

        {/* Step-Specific Calculator Architectural Execution Diagram (Nodes 1..3 for Current Step) */}
        <div className="rounded-xl border border-[#223149] bg-[#0b1528] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#ff8c42]">
            <span>STEP {currentStage + 1} INTERNAL ARCHITECTURAL & DATA FLOW:</span>
            <span className="text-[#95a3ba]">Input → Runtime Module → Output → DB</span>
          </div>

          <div className="space-y-2">
            {stageFlowNodes.map((node, i) => {
              const isSelected = node.moduleId === selectedComponentId;
              return (
                <React.Fragment key={node.stepCode}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectComponent(node.moduleId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectComponent(node.moduleId);
                      }
                    }}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      node.tone === 'rose' && !repaired
                        ? 'border-[#ff6b72]/60 bg-[#ff6b72]/10'
                        : isSelected
                          ? 'border-[#ff7015] bg-[#0e1b31] ring-1 ring-[#ff7015]'
                          : 'border-[#1f314b] bg-[#071020] hover:border-[#60a5fa]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#ff7015] text-[#050b1a] font-extrabold">
                          {node.stepCode}
                        </span>
                        <span className="font-bold text-white">{node.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-[#ff8c42] font-bold">{node.fromModuleCode}</span>
                        <ArrowRight className="w-3 h-3 text-[#667b9a]" />
                        <span className="text-[#60a5fa] font-bold">{node.toModuleCode}</span>
                      </div>
                    </div>

                    <p className="mt-1.5 text-xs text-[#c8d3e2] leading-relaxed">
                      {node.runtimeOperation}
                    </p>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <div className="rounded bg-[#050b16] border border-[#192840] px-2 py-1 text-[#95a3ba] truncate">
                        <span className="text-[#60a5fa] font-bold">IN:</span> {node.calculatorDataIn}
                      </div>
                      <div className="rounded bg-[#050b16] border border-[#192840] px-2 py-1 text-[#95a3ba] truncate">
                        <span className="text-[#35d39a] font-bold">OUT:</span>{' '}
                        {node.calculatorDataOut}
                      </div>
                    </div>

                    <div className="mt-1.5 font-mono text-[10px] text-[#7d8da5]">
                      DB: <span className="text-[#35d39a]">{node.dbTableAction}</span>
                    </div>
                  </div>

                  {i < stageFlowNodes.length - 1 && (
                    <div className="flex items-center justify-center py-0.5 text-[#ff7015]">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Ordered 01 -> 08 Calculator Runtime Modules (Active Expanded, Standby Compact) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#95a3ba] px-1">
            <span>ALL 8 RUNTIME MODULES FOR CALCULATOR TASK (01 → 08)</span>
            <span>Active in Step {currentStage + 1} highlighted</span>
          </div>

          {CALCULATOR_PIPELINE_STEPS.map((item) => {
            const comp = SYSTEM_COMPONENTS.find((c) => c.id === item.compId)!;
            const active = isComponentActiveInStage(comp.id);
            const selected = comp.id === selectedComponentId;
            const showDetails = selected;

            let badgeText = 'STANDBY';
            let badgeColor = 'text-[#95a3ba] border-[#223149] bg-[#091326]';
            let cardBorder = 'border-[#192840] bg-[#091323]/75 hover:border-[#354c70]';

            if (active) {
              badgeText = `ACTIVE · STEP ${currentStage + 1}`;
              badgeColor = 'text-[#ff7015] border-[#ff7015]/50 bg-[#ff7015]/15';
              cardBorder = 'border-[#ff7015]/70 bg-[#0e1b31]';
            }

            if (comp.id === 'comp_analyzer' && currentStage === 0) {
              if (clarifiedPlatform !== 'web') {
                badgeText = 'WAITING FOR WEB/DESKTOP';
                badgeColor = 'text-[#ff7015] border-[#ff7015] bg-[#ff7015]/15';
              } else {
                badgeText = '✓ CLARIFIED: WEB LOCKED';
                badgeColor = 'text-[#35d39a] border-[#35d39a]/50 bg-[#35d39a]/15';
              }
            }

            if (comp.id === 'comp_verifier' && currentStage === 3) {
              if (!repaired) {
                badgeText = '✕ BLOCKED (7/8 · DIV-ZERO-01)';
                badgeColor = 'text-[#ff6b72] border-[#ff6b72] bg-[#ff6b72]/15';
                cardBorder = 'border-[#ff6b72] bg-[#ff6b72]/10';
              } else {
                badgeText = '✓ RE-VERIFIED (8/8 PASSED)';
                badgeColor = 'text-[#35d39a] border-[#35d39a] bg-[#35d39a]/15';
                cardBorder = 'border-[#35d39a] bg-[#35d39a]/10';
              }
            }

            return (
              <div
                key={comp.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectComponent(comp.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectComponent(comp.id);
                  }
                }}
                className={`rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${cardBorder} ${
                  selected ? 'ring-2 ring-[#60a5fa]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full grid place-items-center font-mono text-xs font-bold shrink-0 ${
                        active
                          ? 'bg-[#ff7015] text-[#050b1a]'
                          : selected
                            ? 'bg-[#60a5fa] text-[#050b1a]'
                            : 'bg-[#142a46] text-[#60a5fa]'
                      }`}
                    >
                      {item.phaseNumber}
                    </span>
                    <div className="min-w-0 truncate">
                      <span className="font-mono text-xs font-bold text-[#60a5fa] mr-1.5">
                        {comp.code}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-white truncate">
                        {comp.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${badgeColor}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {showDetails && (
                  <div className="mt-2.5 pl-8 pt-2 border-t border-[#223149] text-xs space-y-1.5">
                    <p className="text-[#dce3ef]">{item.calculatorAction}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <div className="rounded bg-[#060d1b] border border-[#1b2b43] px-2 py-1 text-[#95a3ba] truncate">
                        <span className="text-[#60a5fa]">IN:</span> {item.dataFlowIn}
                      </div>
                      <div className="rounded bg-[#060d1b] border border-[#1b2b43] px-2 py-1 text-[#95a3ba] truncate">
                        <span className="text-[#35d39a]">OUT:</span> {item.dataFlowOut}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                      <span className="text-[#ff8c42]">Tech: {comp.techStack}</span>
                      <span className="text-[#35d39a]">DB: {item.dbWrite}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // FULL-WIDTH PRESENTATION MODE: Calculator System Architecture & Data Map
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Banner + Directed End-to-End Flow Sequence */}
      <div className="rounded-2xl border border-[#223149] bg-[#0b1528] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1d2e48] pb-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-[#ff7015]">
              CALCULATOR SYSTEM ARCHITECTURE & DATA DEPENDENCIES · TASK-001 «اعمل آلة حاسبة»
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white">
              How the 8 Runtime Components Coordinate to Build & Verify the Calculator
            </h2>
            <p className="mt-1 text-sm text-[#95a3ba] max-w-3xl">
              Every module, arrow, policy disposition, and database table below traces the single
              reference task <strong className="text-white">“اعمل آلة حاسبة”</strong> from raw
              intake through the <code className="font-mono text-[#ff8c42]">DIV-ZERO-01</code>{' '}
              surgical repair loop to the verified Calculator Web Application.
            </p>
          </div>

          {/* Filter Dependency Table */}
          <div
            className="flex flex-wrap items-center gap-1 rounded-xl bg-[#060d1b] p-1.5 border border-[#223149]"
            role="group"
            aria-label="Filter calculator data dependencies by type"
          >
            {(
              [
                { id: 'all', label: 'All Calculator Contracts (14)' },
                { id: 'control_flow', label: 'Control Gates' },
                { id: 'data_payload', label: 'Data Payloads' },
                { id: 'policy_constraint', label: 'Policy Rules' },
                { id: 'feedback_repair', label: '8÷0 Repair Loop' },
                { id: 'audit_provenance', label: '13/13 Provenance' }
              ] as const
            ).map((tab) => {
              const active = dependencyFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeDependencyFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#ff7015] text-[#050b1a]'
                      : 'text-[#95a3ba] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* End-to-End Directed Flow Sequence Strip for the Calculator */}
        <div className="mt-5 rounded-xl border border-[#21354f] bg-[#071020] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#ff8c42] mb-3">
            <span>CALCULATOR DIRECTED EXECUTION & DATA DEPENDENCY PATH (01 → 08):</span>
            <span className="text-[#35d39a]">
              Gate 1: Web vs Desktop (MOD-04) · Gate 2: 8 ÷ 0 Repair Loop (MOD-08 ↺ MOD-06)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CALCULATOR_PIPELINE_STEPS.map((step, i) => {
              const comp = SYSTEM_COMPONENTS.find((c) => c.id === step.compId)!;
              const isSelected = comp.id === selectedComponentId;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => onSelectComponent(comp.id)}
                  className={`text-left rounded-xl border p-2.5 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#ff7015] bg-[#0e1b31] ring-2 ring-[#ff7015]/40'
                      : 'border-[#1d2e48] bg-[#0b1528] hover:border-[#60a5fa]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-extrabold text-[#ff7015]">NODE {step.phaseNumber}</span>
                    <span className="text-[#60a5fa] font-bold">{comp.code}</span>
                  </div>
                  <div className="mt-1 font-bold text-xs text-white truncate">{comp.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-[#35d39a] truncate">
                    → {step.dataFlowOut.split(' ')[0]}
                  </div>
                  {i < 7 && (
                    <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#ff7015] font-mono text-xs font-black">
                      →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Column Structured Architectural Swimlane Diagram for Calculator */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {[
            {
              colTitle: '1. CALCULATOR INTAKE, POLICY & VECTOR MEMORY',
              colSub: 'Prompt «اعمل آلة حاسبة», no-eval() Rule & pgvector',
              compIds: ['comp_intake', 'comp_policy', 'comp_experience']
            },
            {
              colTitle: '2. AMBIGUITY GATE & PROVENANCE LEDGER',
              colSub: 'Web vs. Desktop Gate & 13/13 Calculator Evidence',
              compIds: ['comp_analyzer', 'comp_evidence']
            },
            {
              colTitle: '3. STACK PLANNER & STATEFUL SANDBOX',
              colSub: 'Vanilla TS + Vite Choice & Checkpoint #S3-01',
              compIds: ['comp_planner', 'comp_orchestrator']
            },
            {
              colTitle: '4. INDEPENDENT VERIFIER & COMPLETION GATE',
              colSub: 'DIV-ZERO-01 Block, Surgical Fix & Final Seal',
              compIds: ['comp_verifier']
            }
          ].map((column) => (
            <div
              key={column.colTitle}
              className="rounded-xl border border-[#223149] bg-[#071020] p-4 flex flex-col gap-3"
            >
              <div className="border-b border-[#1b2b43] pb-2.5">
                <div className="font-mono text-xs font-bold text-[#ff7015]">{column.colTitle}</div>
                <div className="text-xs text-[#95a3ba] mt-0.5">{column.colSub}</div>
              </div>

              <div className="flex flex-col justify-start gap-3">
                {column.compIds.map((cid) => {
                  const stepInfo = CALCULATOR_PIPELINE_STEPS.find((s) => s.compId === cid)!;
                  const comp = SYSTEM_COMPONENTS.find((c) => c.id === cid)!;
                  const isSelected = comp.id === selectedComponentId;
                  const isActive = isComponentActiveInStage(comp.id);

                  return (
                    <div
                      key={comp.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectComponent(comp.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectComponent(comp.id);
                        }
                      }}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ff7015] bg-[#0e1b31] ring-2 ring-[#ff7015]/40'
                          : isActive
                            ? 'border-[#60a5fa] bg-[#0b1528]'
                            : 'border-[#1f314b] bg-[#0a1426] hover:border-[#465f84]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold text-[#ff7015]">
                          NODE {stepInfo.phaseNumber} · {comp.code}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isActive
                              ? 'bg-[#35d39a]/15 text-[#35d39a]'
                              : 'bg-[#142a46] text-[#95a3ba]'
                          }`}
                        >
                          {isActive ? `ACTIVE STEP ${currentStage + 1}` : 'CALCULATOR MODULE'}
                        </span>
                      </div>

                      <h4 className="mt-1.5 font-bold text-sm text-white">{comp.name}</h4>
                      <div className="text-xs text-[#95a3ba] mt-0.5">{comp.arabicTitle}</div>

                      <p className="mt-2 text-xs text-[#dce3ef] leading-relaxed">
                        {stepInfo.calculatorAction}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-[#1b2b43] space-y-1 font-mono text-[11px]">
                        <div className="text-[#60a5fa] truncate">IN: {stepInfo.dataFlowIn}</div>
                        <div className="text-[#35d39a] truncate">OUT: {stepInfo.dataFlowOut}</div>
                        <div className="text-[#95a3ba] truncate">DB: {stepInfo.dbWrite}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Policy Governance Dispositions Applied to the Calculator Task */}
        <div className="mt-5 rounded-xl border border-[#223149] bg-[#071020] p-4">
          <div className="text-xs font-mono font-bold text-[#ff7015]">
            4 POLICY GOVERNANCE DISPOSITIONS APPLIED TO «اعمل آلة حاسبة»
          </div>
          <p className="mt-0.5 text-xs text-[#95a3ba]">
            How the Runtime evaluates planned and runtime calculator actions against workspace
            preferences, quality rules, and security constraints:
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {POLICY_GOVERNANCE_DISPOSITIONS.map((item) => (
              <div
                key={item.disposition}
                onClick={() => onSelectComponent(item.moduleId)}
                className="rounded-xl border border-[#1f314b] bg-[#0b1528] p-3.5 cursor-pointer hover:border-[#ff7015] transition-colors"
              >
                <span
                  className={`inline-block font-mono text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    item.badgeColor === 'emerald'
                      ? 'bg-[#35d39a]/15 text-[#35d39a]'
                      : item.badgeColor === 'blue'
                        ? 'bg-[#60a5fa]/15 text-[#60a5fa]'
                        : item.badgeColor === 'orange'
                          ? 'bg-[#ff7015]/15 text-[#ff8c42]'
                          : 'bg-[#ff6b72]/15 text-[#ff6b72]'
                  }`}
                >
                  {item.disposition}
                </span>
                <div className="mt-2 font-bold text-white">{item.calculatorTarget}</div>
                <div className="mt-1 font-mono text-[11px] text-[#60a5fa]">
                  {item.ruleOrContextSource}
                </div>
                <p className="mt-1.5 text-[#95a3ba] leading-relaxed">{item.runtimeAction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Component Deep-Dive Inspector */}
      <div className="rounded-2xl border border-[#223149] bg-[#0b1528] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1d2e48] pb-4">
          <div>
            <div className="text-xs font-mono text-[#ff7015]">
              SELECTED CALCULATOR MODULE DATA CONTRACT INSPECTOR · {activeComp.code}
            </div>
            <h3 className="mt-1 text-xl font-bold text-white">
              {activeComp.name}{' '}
              <span className="text-base font-normal text-[#95a3ba]">
                ({activeComp.arabicTitle})
              </span>
            </h3>
            <p className="mt-1 text-sm text-[#c8d3e2] max-w-3xl">{activeComp.architecturalRole}</p>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="text-[#95a3ba]">PostgreSQL / pgvector Tables</div>
            <div className="mt-1 text-[#35d39a] font-bold">{activeComp.dbTables.join(' · ')}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#223149] bg-[#071020] p-4">
            <div className="text-xs font-mono font-bold text-[#60a5fa] border-b border-[#1b2b43] pb-2">
              UPSTREAM INPUT DEPENDENCIES IN CALCULATOR RUN ({incoming.length} EDGES)
            </div>
            <div className="mt-3 space-y-2.5">
              {incoming.map((edge) => {
                const src = SYSTEM_COMPONENTS.find((c) => c.id === edge.from);
                return (
                  <div
                    key={edge.id}
                    className="rounded-lg border border-[#1d2e48] bg-[#0b1528] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{edge.payloadName}</span>
                      <span className="text-[#ff8c42]">
                        from {src?.code} ({src?.name})
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#60a5fa]">
                      {edge.schemaSummary}
                    </div>
                    <p className="mt-1 text-[#95a3ba]">{edge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#223149] bg-[#071020] p-4">
            <div className="text-xs font-mono font-bold text-[#35d39a] border-b border-[#1b2b43] pb-2">
              DOWNSTREAM OUTPUT CONTRACTS IN CALCULATOR RUN ({outgoing.length} EDGES)
            </div>
            <div className="mt-3 space-y-2.5">
              {outgoing.map((edge) => {
                const dst = SYSTEM_COMPONENTS.find((c) => c.id === edge.to);
                return (
                  <div
                    key={edge.id}
                    className="rounded-lg border border-[#1d2e48] bg-[#0b1528] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">{edge.payloadName}</span>
                      <span className="text-[#35d39a]">
                        to {dst?.code} ({dst?.name})
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#60a5fa]">
                      {edge.schemaSummary}
                    </div>
                    <p className="mt-1 text-[#95a3ba]">{edge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Complete 14 Data Dependency Edges Matrix */}
      <div className="rounded-2xl border border-[#223149] bg-[#0b1528] overflow-hidden">
        <div className="p-5 border-b border-[#1d2e48] flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-[#ff7015]">
              CALCULATOR DATA DEPENDENCY SPECIFICATION TABLE (14 CONTRACTS)
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">
              All {visibleEdges.length} Inter-Module Data Contracts in the «اعمل آلة حاسبة» Run
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1d2e48] bg-[#071020] font-mono text-[#95a3ba]">
                <th className="py-3 px-4">Producer Module</th>
                <th className="py-3 px-4">Consumer Module</th>
                <th className="py-3 px-4">Data Contract / Payload</th>
                <th className="py-3 px-4">Schema & Values in Calculator Task</th>
                <th className="py-3 px-4">Active Steps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172943]">
              {visibleEdges.map((edge) => {
                const fromC = SYSTEM_COMPONENTS.find((c) => c.id === edge.from);
                const toC = SYSTEM_COMPONENTS.find((c) => c.id === edge.to);
                const activeNow = isEdgeActiveInStage(edge);
                return (
                  <tr
                    key={edge.id}
                    className={activeNow ? 'bg-[#ff7015]/10' : 'hover:bg-[#0e1b31]/60'}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#ff8c42] whitespace-nowrap">
                      {fromC?.code} · {fromC?.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#60a5fa] whitespace-nowrap">
                      {toC?.code} · {toC?.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {edge.payloadName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#c8d3e2]">{edge.schemaSummary}</td>
                    <td className="py-3 px-4 font-mono text-[#35d39a] whitespace-nowrap">
                      Steps: {edge.activeInStages.map((s) => s + 1).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
