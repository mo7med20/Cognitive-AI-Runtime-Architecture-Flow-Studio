import React from 'react';
import {
  SYSTEM_COMPONENTS,
  STAGE_DEFINITIONS,
  StageIndex,
  DependencyCategory
} from '../lib/runtimeEngine';
import { SECodingScenario, SE_CODING_SCENARIOS } from '../lib/seScenariosAndMetamodel';
import { ArrowDown, ChevronDown, Workflow } from 'lucide-react';
import { RuntimeArchitectureDiagram } from './RuntimeArchitectureDiagram';

interface ArchitectureGraphProps {
  isRuntimeIdle?: boolean;
  currentStage: StageIndex;
  repaired: boolean;
  clarifiedPlatform: 'web' | 'desktop' | null;
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  dependencyFilter: DependencyCategory | 'all';
  onChangeDependencyFilter: (filter: DependencyCategory | 'all') => void;
  activeScenario?: SECodingScenario;
  compactMode?: boolean;
}

export const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({
  isRuntimeIdle = false,
  currentStage,
  repaired,
  clarifiedPlatform,
  selectedComponentId,
  onSelectComponent,
  dependencyFilter,
  onChangeDependencyFilter,
  activeScenario = SE_CODING_SCENARIOS.feat_refund_api,
  compactMode = false
}) => {
  const stageDef = STAGE_DEFINITIONS[currentStage];
  const currentStageFlow = !isRuntimeIdle ? activeScenario.stageFlows[currentStage] : undefined;

  const isComponentActiveInStage = (compId: string) =>
    !isRuntimeIdle && stageDef.primaryComponents.includes(compId);

  if (compactMode) {
    return (
      <div className="runtime-pipeline space-y-4">
        <div className="pipeline-heading">
          <div>
            <h3>
              <Workflow size={17} aria-hidden="true" /> Inside the runtime
            </h3>
            <p>
              {isRuntimeIdle
                ? 'State S0: Idle · Awaiting Prompt'
                : `${activeScenario.code} · Stage ${currentStage + 1}: ${stageDef.shortTitle}`}
            </p>
          </div>
          <span className="pipeline-live">
            <span className="status-dot" />
            {isRuntimeIdle ? 'IDLE' : 'LIVE'}
          </span>
        </div>

        {/* Scenario-Specific Internal Data Flow */}
        <div className="rounded-xl border border-[#2b3546] bg-[#151c28] p-3.5 space-y-2.5">
          <div className="pipeline-caption">
            <span>
              {isRuntimeIdle
                ? 'S0 · STANDBY'
                : `STAGE ${currentStage + 1} · ${activeScenario.code} REDUCED FLOW`}
            </span>
            <span className="text-[#a2afc3]">Module → Artifact</span>
          </div>

          {!currentStageFlow ? (
            <div className="rounded-xl border border-dashed border-[#344966] bg-[#0e131d] p-3 text-xs font-mono text-[#a2afc3]">
              No module transitions reduced yet. Submit a prompt or execute the Stage {currentStage + 1} Local Model role to populate live telemetry steps.
            </div>
          ) : (
            <>
              <p className="text-xs text-[#a2afc3] leading-relaxed">{currentStageFlow.summary}</p>

              <div className="space-y-2">
                {currentStageFlow.steps.map((step, i) => (
                  <React.Fragment key={step.stepOrder}>
                    <div
                      className={`rounded-xl border p-3 transition-all ${
                        step.status === 'DEFECT' && !repaired
                          ? 'border-[#fb8797]/60 bg-[#fb8797]/10'
                          : step.status === 'SEALED'
                            ? 'border-[#53d6ab]/60 bg-[#53d6ab]/10'
                            : 'border-[#2b374a] bg-[#0e131d]'
                      }`}
                    >
                      <div className="pipeline-node-heading">
                        <div className="pipeline-node-title">
                          <span className="px-1.5 py-0.5 rounded bg-[#ff8a4c] text-[#0c1018] font-extrabold font-mono text-xs">
                            0{step.stepOrder}
                          </span>
                          <span className="font-bold text-white text-xs">{step.fromModule}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#8caef9]">
                          → {step.toModule}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-[#c8d3e2] leading-relaxed">{step.action}</p>

                      <div className="mt-2 flex items-center justify-between font-mono text-[11px] pt-1.5 border-t border-[#1e293b]">
                        <span className="text-[#53d6ab] font-bold">{step.artifactOrHash}</span>
                        <span className="text-[#a2afc3]">{step.latencyMs} ms</span>
                      </div>
                    </div>

                    {i < currentStageFlow.steps.length - 1 && (
                      <div className="flex items-center justify-center py-0.5 text-[#ff8a4c]">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        {/* All 8 Runtime Modules */}
        <details className="pipeline-modules" open>
          <summary>
            <span>8 Governance Modules (MOD-01 → MOD-08)</span>
            <ChevronDown size={15} aria-hidden="true" />
          </summary>
          <div className="space-y-2 pt-3">
            {SYSTEM_COMPONENTS.map((comp, idx) => {
              const active = isComponentActiveInStage(comp.id);
              const selected = comp.id === selectedComponentId;

              let badgeText = 'STANDBY';
              let badgeColor = 'text-[#a2afc3] border-[#2b3546] bg-[#111824]';
              let cardBorder = 'border-[#263244] bg-[#131a25]/75 hover:border-[#354c70]';

              if (active) {
                badgeText = `ACTIVE · S${currentStage + 1}`;
                badgeColor = 'text-[#ff8a4c] border-[#ff8a4c]/50 bg-[#ff8a4c]/15';
                cardBorder = 'border-[#ff8a4c]/70 bg-[#1b2534]';
              }

              if (comp.id === 'comp_analyzer' && currentStage === 0) {
                badgeText = clarifiedPlatform === 'web' ? 'SPEC LOCKED' : 'GATE OPEN';
                badgeColor =
                  clarifiedPlatform === 'web'
                    ? 'text-[#53d6ab] border-[#53d6ab]/50 bg-[#53d6ab]/15'
                    : 'text-[#ff8a4c] border-[#ff8a4c] bg-[#ff8a4c]/15';
              }

              if (comp.id === 'comp_verifier' && currentStage === 3) {
                badgeText = repaired ? 'VERIFIED 8/8' : 'BLOCKED 7/8';
                badgeColor = repaired
                  ? 'text-[#53d6ab] border-[#53d6ab] bg-[#53d6ab]/15'
                  : 'text-[#fb8797] border-[#fb8797] bg-[#fb8797]/15';
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
                    selected ? 'ring-2 ring-[#8caef9]' : ''
                  }`}
                >
                  <div className="pipeline-module-heading">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full grid place-items-center font-mono text-xs font-bold shrink-0 ${
                          active
                            ? 'bg-[#ff8a4c] text-[#0c1018]'
                            : 'bg-[#202e42] text-[#8caef9]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <div className="pipeline-module-name">
                        <span className="font-medium">{comp.code}</span>
                        <span className="font-medium text-white">{comp.name}</span>
                      </div>
                    </div>

                    <span className={`pipeline-module-status ${badgeColor}`}>{badgeText}</span>
                  </div>
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
      isRuntimeIdle={isRuntimeIdle}
      activeScenario={activeScenario}
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
