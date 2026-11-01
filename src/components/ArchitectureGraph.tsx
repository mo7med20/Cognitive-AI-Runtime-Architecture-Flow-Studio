import React from 'react';
import {
  SYSTEM_COMPONENTS,
  STAGE_DEFINITIONS,
  STAGE_CALCULATOR_FLOWS,
  StageIndex,
  DependencyCategory,
} from '../lib/runtimeEngine';
import { ArrowDown, ArrowRight, ChevronDown, Workflow } from 'lucide-react';
import { RuntimeArchitectureDiagram } from './RuntimeArchitectureDiagram';

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

  const isComponentActiveInStage = (compId: string) =>
    stageDef.primaryComponents.includes(compId);

  // =========================================================================
  // COMPACT MODE: Synchronized Right-Hand Live Pipeline for the Calculator Task
  // =========================================================================
  if (compactMode) {
    return (
      <div className="runtime-pipeline space-y-4">
        <div className="pipeline-heading">
          <div>
            <h3><Workflow size={17} aria-hidden="true" /> Inside the runtime</h3>
            <p>Stage {currentStage + 1}: {stageDef.shortTitle} · Select a node to inspect</p>
          </div>
          <span className="pipeline-live"><span className="status-dot" />LIVE</span>
        </div>

        {/* Step-Specific Calculator Architectural Execution Diagram (Nodes 1..3 for Current Step) */}
        <div className="rounded-xl border border-[#2b3546] bg-[#151c28] p-3.5 space-y-2.5">
          <div className="pipeline-caption">
            <span>STAGE {currentStage + 1} · DATA FLOW</span>
            <span className="text-[#a2afc3]">Input → Module → Output</span>
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
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectComponent(node.moduleId);
                      }
                    }}
                    className={`rounded-xl border p-3 transition-all cursor-pointer ${
                      node.tone === 'rose' && !repaired
                        ? 'border-[#fb8797]/60 bg-[#fb8797]/10'
                        : isSelected
                          ? 'border-[#ff8a4c] bg-[#1b2534] ring-1 ring-[#ff8a4c]'
                          : 'border-[#2b374a] bg-[#0e131d] hover:border-[#8caef9]'
                    }`}
                  >
                    <div className="pipeline-node-heading">
                      <div className="pipeline-node-title">
                        <span className="px-1.5 py-0.5 rounded bg-[#ff8a4c] text-[#0c1018] font-extrabold">
                          {node.stepCode}
                        </span>
                        <span className="font-bold text-white">{node.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[#ffa875] font-bold">{node.fromModuleCode}</span>
                        <ArrowRight className="w-3 h-3 text-[#8b9ab1]" />
                        <span className="text-[#8caef9] font-bold">{node.toModuleCode}</span>
                      </div>
                    </div>

                    <p className="mt-1.5 text-sm text-[#c8d3e2] leading-relaxed">
                      {node.runtimeOperation}
                    </p>

                    <div className="pipeline-data-grid mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="rounded bg-[#0c1018] border border-[#263244] px-2 py-1 text-[#a2afc3] pipeline-node-data">
                        <span className="text-[#8caef9] font-bold">IN:</span> {node.calculatorDataIn}
                      </div>
                      <div className="rounded bg-[#0c1018] border border-[#263244] px-2 py-1 text-[#a2afc3] pipeline-node-data">
                        <span className="text-[#53d6ab] font-bold">OUT:</span>{' '}
                        {node.calculatorDataOut}
                      </div>
                    </div>

                    <div className="mt-1.5 font-mono text-xs text-[#94a3ba]">
                      DB: <span className="text-[#53d6ab]">{node.dbTableAction}</span>
                    </div>
                  </div>

                  {i < stageFlowNodes.length - 1 && (
                    <div className="flex items-center justify-center py-0.5 text-[#ff8a4c]">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Ordered 01 -> 08 Calculator Runtime Modules (Active Expanded, Standby Compact) */}
        <details className="pipeline-modules">
          <summary><span>Explore all 8 runtime modules</span><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className="space-y-2 pt-3">

          {CALCULATOR_PIPELINE_STEPS.map((item) => {
            const comp = SYSTEM_COMPONENTS.find((c) => c.id === item.compId)!;
            const active = isComponentActiveInStage(comp.id);
            const selected = comp.id === selectedComponentId;
            const showDetails = selected;

            let badgeText = 'STANDBY';
            let badgeColor = 'text-[#a2afc3] border-[#2b3546] bg-[#111824]';
            let cardBorder = 'border-[#263244] bg-[#131a25]/75 hover:border-[#354c70]';

            if (active) {
              badgeText = `ACTIVE · STEP ${currentStage + 1}`;
              badgeColor = 'text-[#ff8a4c] border-[#ff8a4c]/50 bg-[#ff8a4c]/15';
              cardBorder = 'border-[#ff8a4c]/70 bg-[#1b2534]';
            }

            if (comp.id === 'comp_analyzer' && currentStage === 0) {
              if (clarifiedPlatform !== 'web') {
                badgeText = 'NEEDS INPUT';
                badgeColor = 'text-[#ff8a4c] border-[#ff8a4c] bg-[#ff8a4c]/15';
              } else {
                badgeText = 'WEB CONFIRMED';
                badgeColor = 'text-[#53d6ab] border-[#53d6ab]/50 bg-[#53d6ab]/15';
              }
            }

            if (comp.id === 'comp_verifier' && currentStage === 3) {
              if (!repaired) {
                badgeText = 'BLOCKED · 7/8';
                badgeColor = 'text-[#fb8797] border-[#fb8797] bg-[#fb8797]/15';
                cardBorder = 'border-[#fb8797] bg-[#fb8797]/10';
              } else {
                badgeText = 'VERIFIED · 8/8';
                badgeColor = 'text-[#53d6ab] border-[#53d6ab] bg-[#53d6ab]/15';
                cardBorder = 'border-[#53d6ab] bg-[#53d6ab]/10';
              }
            }

            return (
              <div
                key={comp.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectComponent(comp.id)}
                aria-pressed={selectedComponentId === comp.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectComponent(comp.id);
                  }
                }}
                className={`rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${cardBorder} ${
                  selected ? 'ring-2 ring-[#8caef9]' : ''
                }`}
              >
                <div className="pipeline-module-heading">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full grid place-items-center font-mono text-xs font-bold shrink-0 ${
                        active
                          ? 'bg-[#ff8a4c] text-[#0c1018]'
                          : selected
                            ? 'bg-[#8caef9] text-[#0c1018]'
                            : 'bg-[#202e42] text-[#8caef9]'
                      }`}
                    >
                      {item.phaseNumber}
                    </span>
                    <div className="pipeline-module-name">
                      <span className="font-medium">
                        {comp.code}
                      </span>
                      <span className="font-medium text-white">
                        {comp.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`pipeline-module-status ${badgeColor}`}
                  >
                    {badgeText}
                  </span>
                </div>

                {showDetails && (
                  <div className="mt-2.5 pl-8 pt-2 border-t border-[#2b3546] text-xs space-y-1.5">
                    <p className="text-[#dce3ef]">{item.calculatorAction}</p>
                    <div className="pipeline-data-grid grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="rounded bg-[#0d131d] border border-[#29364a] px-2 py-1 text-[#a2afc3] pipeline-node-data">
                        <span className="text-[#8caef9]">IN:</span> {item.dataFlowIn}
                      </div>
                      <div className="rounded bg-[#0d131d] border border-[#29364a] px-2 py-1 text-[#a2afc3] pipeline-node-data">
                        <span className="text-[#53d6ab]">OUT:</span> {item.dataFlowOut}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <span className="text-[#ffa875]">Tech: {comp.techStack}</span>
                      <span className="text-[#53d6ab]">DB: {item.dbWrite}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </details>
      </div>
    );
  }

  return (
    <RuntimeArchitectureDiagram
      currentStage={currentStage}
      repaired={repaired}
      clarifiedPlatform={clarifiedPlatform}
      selectedComponentId={selectedComponentId}
      onSelectComponent={onSelectComponent}
      dependencyFilter={dependencyFilter}
      onChangeDependencyFilter={onChangeDependencyFilter}
    />
  );
};
