import React, { useState } from 'react';
import { SYSTEM_COMPONENTS, StageIndex } from '../lib/runtimeEngine';
import { SECodingScenario, SE_CODING_SCENARIOS } from '../lib/seScenariosAndMetamodel';
import {
  ParallelWorkerTelemetry,
  reduceLiveProvenanceLedgerFromScenario
} from '../lib/localLlmBridge';
import { Activity, Clock, Cpu, Lock, Play } from 'lucide-react';

interface TraceabilityMatrixViewProps {
  isRuntimeIdle?: boolean;
  highestCompletedStage?: number;
  currentStage?: StageIndex;
  repaired: boolean;
  activeScenario?: SECodingScenario;
  checkpointHash?: string;
  sealId?: string;
  activePolicyHash?: string;
  workerTelemetries?: ParallelWorkerTelemetry[];
  onToggleRepairState: (repaired: boolean) => void;
  onJumpToModule: (componentId: string) => void;
  onReturnToRuntime?: () => void;
}

export const TraceabilityMatrixView: React.FC<TraceabilityMatrixViewProps> = ({
  isRuntimeIdle = false,
  highestCompletedStage = 0,
  currentStage = 0,
  repaired,
  activeScenario = SE_CODING_SCENARIOS.feat_refund_api,
  checkpointHash = 'sha256:pending',
  sealId = '#SEAL-PENDING',
  activePolicyHash = 'POL-2026-v1',
  workerTelemetries = [],
  onToggleRepairState,
  onJumpToModule,
  onReturnToRuntime
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>('R8');

  if (isRuntimeIdle || highestCompletedStage < 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#384e6e] bg-[#131b28] p-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ff8a4c]/15 border border-[#ff8a4c]/40 font-mono text-xs font-bold text-[#ffa875]">
          <Activity size={14} />
          <span>STATE S0: NO PROVENANCE OR REQUIREMENTS GENERATED YET</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Provenance & Traceability Matrix populates dynamically as Local Model roles execute
        </h2>
        <p className="text-sm text-[#a2afc3] max-w-2xl mx-auto">
          Nothing is pre-populated statically. Enter a prompt in the Live Runtime tab so{' '}
          <strong className="text-white">Worker A (Coder/Planner Role)</strong> and{' '}
          <strong className="text-white">Worker B (Independent Verifier Role)</strong> can synthesize
          and reduce the 8 requirements, target files, and 13 provenance records step by step.
        </p>
        {onReturnToRuntime && (
          <button
            type="button"
            onClick={onReturnToRuntime}
            className="px-5 py-3 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <Play size={15} />
            <span>Go to Live Runtime (S0) to Enter a Prompt →</span>
          </button>
        )}
      </div>
    );
  }

  const activeMaxStage = Math.max(highestCompletedStage, currentStage);
  const requirementsUnlocked = activeMaxStage >= 1 && activeScenario.requirements.length > 0;
  const filesUnlocked = activeMaxStage >= 2 && activeScenario.files.length > 0;
  const oracleUnlocked = activeMaxStage >= 3;

  const selectedReq =
    activeScenario.requirements.find((r) => r.id === selectedReqId) ||
    activeScenario.requirements[7] ||
    activeScenario.requirements[0];

  const primaryDecision = activeScenario.decisions[0];

  const dynamicEvidenceLedger = reduceLiveProvenanceLedgerFromScenario(
    activeScenario,
    workerTelemetries,
    checkpointHash,
    sealId,
    activePolicyHash
  );

  const capturedEvidenceCount = dynamicEvidenceLedger.filter(
    (ev) => ev.stageCaptured <= activeMaxStage
  ).length;

  return (
    <div className="evidence-workspace space-y-6">
      {/* Header & Role-Gated Stage Status */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-[#ff8a4c]">
            DYNAMIC PROVENANCE & TRACEABILITY LEDGER · {activeScenario.code} ({activeScenario.title})
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Role-Reduced Lineage (Stages Executed: 1 to {activeMaxStage + 1} of 5)
          </h2>
          <p className="mt-1 text-sm text-[#a2afc3] max-w-3xl">
            Checkpoint <code className="font-mono text-[#8caef9]">{checkpointHash}</code> ·{' '}
            <strong className="text-white">
              Evidence Reduced So Far ({capturedEvidenceCount}/13)
            </strong>{' '}
            ·{' '}
            <strong className="text-white">
              Oracle Audit:{' '}
              {!oracleUnlocked
                ? 'Awaiting Stage 4 Verifier Role'
                : repaired
                  ? `8/8 PASS (Sealed ${sealId})`
                  : '7/8 PASS · 1 FAIL (R8 Blocked)'}
            </strong>
          </p>
        </div>

        {/* Toggle Before vs After Targeted Repair (Only enabled once Stage 4 Oracle has run) */}
        {oracleUnlocked ? (
          <div
            className="evidence-gate-toggle"
            role="group"
            aria-label="Simulate Gate State Before or After Repair"
          >
            <button
              type="button"
              onClick={() => onToggleRepairState(false)}
              aria-pressed={!repaired}
              className={`px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !repaired
                  ? 'bg-[#fb8797] text-[#0c1018]'
                  : 'text-[#a2afc3] hover:text-white'
              }`}
            >
              Pre-Repair State (7/8 · Blocked)
            </button>
            <button
              type="button"
              onClick={() => onToggleRepairState(true)}
              aria-pressed={repaired}
              className={`px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                repaired
                  ? 'bg-[#53d6ab] text-[#0c1018]'
                  : 'text-[#a2afc3] hover:text-white'
              }`}
            >
              Post-Repair State (8/8 · Sealed {sealId})
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl border border-[#324665] bg-[#0e131d] font-mono text-xs text-[#ffa875] flex items-center gap-2">
            <Lock size={14} />
            <span>Advance to Stage 4 in Runtime to unlock Oracle Verdicts</span>
          </div>
        )}
      </div>

      {/* Main Relational Trace Table + Deep Lineage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
          {!requirementsUnlocked ? (
            <div className="p-8 text-center space-y-2 font-mono text-xs text-[#a2afc3]">
              <Lock size={20} className="mx-auto text-[#ffa875]" />
              <div className="text-white font-bold text-sm">
                Stage 2 Architect & Planner Role (WORKER-S2-PLANNER) has not executed yet
              </div>
              <p>
                Complete Stage 1 Ambiguity Gate and run the Stage 2 Planner Role to reduce requirements R1–R8 from the Local Model.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2b3546] bg-[#0e131d] font-mono text-[#a2afc3]">
                    <th className="py-3.5 px-4">Req ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Requirement Reduced by WORKER-S2-PLANNER</th>
                    <th className="py-3.5 px-4">Target File (WORKER-S3-A)</th>
                    <th className="py-3.5 px-4 text-right">Oracle Status (WORKER-S4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#273448]">
                  {activeScenario.requirements.map((row) => {
                    const status = repaired ? row.v1_1Status : row.v1Status;
                    const isSelected = selectedReq && row.id === selectedReq.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedReqId(row.id)}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedReqId(row.id);
                          }
                        }}
                        className={`evidence-table-row cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#ff8a4c]/15' : 'hover:bg-[#1b2534]/70'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#ff8a4c] whitespace-nowrap">
                          {row.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#8caef9] whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{row.statement}</td>
                        <td className="py-3.5 px-4 font-mono text-[#c8d3e2] whitespace-nowrap">
                          {filesUnlocked ? (
                            row.targetFile
                          ) : (
                            <span className="text-[#7c8ca5]">Pending Stage 3 Role...</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                          {!oracleUnlocked ? (
                            <span className="text-[#ffa875]">⏳ PENDING S4 ORACLE</span>
                          ) : status === 'PASS' ? (
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

        {/* Selected Chain Deep-Dive Lineage Card */}
        <div className="lg:col-span-4 rounded-2xl border border-[#2b3546] bg-[#151c28] p-5 space-y-4">
          <div className="border-b border-[#283345] pb-3">
            <div className="text-xs font-mono font-bold text-[#ff8a4c]">
              CHAIN LINEAGE INSPECTOR · {requirementsUnlocked && selectedReq ? selectedReq.id : 'LOCKED'}
            </div>
            <h3 className="mt-1 text-base font-bold text-white">
              {requirementsUnlocked && selectedReq
                ? selectedReq.statement
                : 'Awaiting Stage 2 Planner Role execution'}
            </h3>
          </div>

          {requirementsUnlocked && selectedReq && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                <div className="font-mono text-[#a2afc3]">1. REQUIREMENT ORIGIN & MODULE</div>
                <div className="mt-1 font-bold text-white">
                  {selectedReq.source === 'USER_SPEC'
                    ? 'Developer Prompt + Repo Context'
                    : 'ShiftCore Policy & Runtime Quality Gate'}
                </div>
                <div className="mt-0.5 font-mono text-[#8caef9]">
                  Target:{' '}
                  {filesUnlocked
                    ? `${selectedReq.targetFile} (${selectedReq.plannedModule})`
                    : 'Synthesized when Stage 3 Coder Role runs'}
                </div>
              </div>

              {primaryDecision && (
                <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                  <div className="font-mono text-[#a2afc3]">
                    2. LINKED ADR ({primaryDecision.id})
                  </div>
                  <div className="mt-1 font-bold text-white">{primaryDecision.title}</div>
                  <p className="mt-1 text-[#c8d3e2] leading-relaxed">{primaryDecision.rationale}</p>
                </div>
              )}

              <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                <div className="font-mono text-[#a2afc3]">3. INDEPENDENT ORACLE ASSERTION</div>
                {oracleUnlocked ? (
                  <>
                    <div className="mt-1 font-mono text-[#53d6ab]">
                      {selectedReq.verificationAssertion}
                    </div>
                    {selectedReq.failureDiagnostic && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#283345] font-mono">
                        <div className="text-[#fb8797]">
                          v1.0 Defect: {selectedReq.failureDiagnostic}
                        </div>
                        {repaired && (
                          <div className="text-[#53d6ab] mt-1">
                            v1.1 Surgical Patch: Verified PASS on retained Checkpoint #S3-01 ({checkpointHash})
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-1 font-mono text-[#ffa875]">
                    Locked until Stage 4 Independent Verifier Role executes.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete 13-Item Evidence Provenance Ledger (Dynamically Reduced from Active Scenario & Local Model Roles) */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
        <div className="p-5 border-b border-[#2b3546] flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#ff8a4c]">
              IMMUTABLE EVIDENCE LEDGER · MOD-07 ({capturedEvidenceCount} / 13 PROVENANCE RECORDS REDUCED FROM LOCAL MODELS)
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">
              Evidence Records Emitted Step-by-Step by Active Local Model Roles ({activeScenario.code})
            </h3>
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-lg border border-[#53d6ab]/40 bg-[#53d6ab]/15 text-[#53d6ab] font-bold">
            {capturedEvidenceCount} / 13 Records Unlocked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2b3546] bg-[#0e131d] font-mono text-[#a2afc3]">
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Stage & Category</th>
                <th className="py-3 px-4">Reduced Evidence Record & Provenance Detail</th>
                <th className="py-3 px-4">Linked Req / Rule</th>
                <th className="py-3 px-4">Local Model Worker & Timestamp</th>
                <th className="py-3 px-4 text-right">Ledger Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273448]">
              {dynamicEvidenceLedger.map((ev) => {
                const comp = SYSTEM_COMPONENTS.find((c) => c.id === ev.producerComponentId);
                const isUnlocked = ev.stageCaptured <= activeMaxStage;
                const verdict = repaired ? ev.verdictAfterRepair : ev.verdictBeforeRepair;
                return (
                  <tr
                    key={ev.id}
                    className={
                      !isUnlocked
                        ? 'opacity-45 bg-[#0b1018]'
                        : verdict === 'RECORDED_FAIL'
                          ? 'bg-[#fb8797]/10'
                          : 'hover:bg-[#1b2534]/60'
                    }
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#8caef9] whitespace-nowrap">
                      {ev.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#ffa875] whitespace-nowrap">
                      {ev.categoryLabel}
                    </td>
                    <td className="py-3 px-4">
                      {isUnlocked ? (
                        <>
                          <div className="font-bold text-white">{ev.title}</div>
                          <div className="text-[#a2afc3] mt-0.5">{ev.detail}</div>
                        </>
                      ) : (
                        <div className="font-mono text-[#7c8ca5]">
                          Locked — Will be reduced when Stage {ev.stageCaptured + 1} Local Model Role executes
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#c8d3e2] whitespace-nowrap">
                      {isUnlocked ? ev.linkedReqOrRule : 'Pending Role'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#a2afc3] whitespace-nowrap">
                      {isUnlocked ? (
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => comp && onJumpToModule(comp.id)}
                            className="text-[#8caef9] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Cpu size={11} />
                            <span>{ev.producerWorkerLabel}</span>
                          </button>
                          {ev.timestamp && (
                            <div className="text-[10px] text-[#7c8ca5] flex items-center gap-1">
                              <Clock size={10} />
                              <span>
                                {ev.timestamp} ({ev.latencyMs}ms)
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#7c8ca5]">Stage {ev.stageCaptured + 1} Worker</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                      {!isUnlocked ? (
                        <span className="text-[#7c8ca5]">⏳ PENDING S{ev.stageCaptured + 1}</span>
                      ) : verdict === 'RECORDED_PASS' ? (
                        <span className="text-[#53d6ab]">✓ RECORDED (PASS)</span>
                      ) : (
                        <span className="text-[#fb8797]">⚠ RECORDED (FAIL)</span>
                      )}
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

