import React, { useState } from 'react';
import {
  REQUIREMENT_TRACE_MATRIX,
  EVIDENCE_RECORDS_LEDGER,
  ARCHITECTURAL_DECISIONS,
  SYSTEM_COMPONENTS,
  RequirementTraceItem
} from '../lib/runtimeEngine';

interface TraceabilityMatrixViewProps {
  repaired: boolean;
  onToggleRepairState: (repaired: boolean) => void;
  onJumpToModule: (componentId: string) => void;
}

export const TraceabilityMatrixView: React.FC<TraceabilityMatrixViewProps> = ({
  repaired,
  onToggleRepairState,
  onJumpToModule
}) => {
  const [originFilter, setOriginFilter] = useState<string>('ALL');
  const [selectedReqId, setSelectedReqId] = useState<string>('REQ-08');

  const filteredRows = REQUIREMENT_TRACE_MATRIX.filter((row) =>
    originFilter === 'ALL' ? true : row.origin === originFilter
  );

  const selectedReq: RequirementTraceItem =
    REQUIREMENT_TRACE_MATRIX.find((r) => r.id === selectedReqId) || REQUIREMENT_TRACE_MATRIX[7];

  const linkedDecision = ARCHITECTURAL_DECISIONS.find((d) => d.id === selectedReq.decisionId);
  const linkedComponent = SYSTEM_COMPONENTS.find((c) => c.id === selectedReq.componentId);

  return (
    <div className="evidence-workspace space-y-6">
      {/* Header & Interactive Gate State Toggle */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-[#ff8a4c]">
            CALCULATOR PROVENANCE & TRACEABILITY LEDGER · TASK-001 «اعمل آلة حاسبة»
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Calculator Requirement → Decision → Evidence Lineage (8 Requirements · 5 Decisions · 13
            Evidence Records)
          </h2>
          <p className="mt-1 text-sm text-[#a2afc3] max-w-3xl">
            For <strong className="text-white">“اعمل آلة حاسبة”</strong>,{' '}
            <strong className="text-white">Evidence Coverage (13/13)</strong> is tracked
            independently from{' '}
            <strong className="text-white">
              Acceptance Pass Rate ({repaired ? '8/8' : '7/8'})
            </strong>
            : failing calculator test <code className="font-mono text-[#ffa875]">DIV-ZERO-01</code>{' '}
            (<code className="font-mono">8 ÷ 0 → Infinity</code>) still counts as recorded
            provenance evidence while blocking the Completion Gate.
          </p>
        </div>

        {/* Toggle Before vs After Targeted Repair */}
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
            Post-Repair State (8/8 · Sealed)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#151c28] p-1.5 border border-[#2b3546]"
          role="group"
          aria-label="Filter requirements by origin"
        >
          {[
            { id: 'ALL', label: 'All Requirements (8)' },
            { id: 'USER_EXPLICIT', label: 'User Explicit (5)' },
            { id: 'USER_CLARIFIED', label: 'User Clarified (1)' },
            { id: 'RUNTIME_QUALITY', label: 'Runtime Quality Gate (1)' },
            { id: 'WORKSPACE_POLICY', label: 'Workspace Policy (1)' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOriginFilter(tab.id)}
              aria-pressed={originFilter === tab.id}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                originFilter === tab.id
                  ? 'bg-[#ff8a4c] text-[#0c1018]'
                  : 'text-[#a2afc3] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-[#a2afc3]">
          Showing <strong className="text-white tabular-nums">{filteredRows.length}</strong> of 8
          linked requirement chains
        </div>
      </div>

      {/* Main Relational Trace Table + Deep Lineage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2b3546] bg-[#0e131d] font-mono text-[#a2afc3]">
                  <th className="py-3.5 px-4">Req ID</th>
                  <th className="py-3.5 px-4">Requirement Specification</th>
                  <th className="py-3.5 px-4">Origin</th>
                  <th className="py-3.5 px-4">Linked Decision</th>
                  <th className="py-3.5 px-4">Provenance Evidence</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273448]">
                {filteredRows.map((row) => {
                  const status = repaired ? row.statusAfterRepair : row.statusBeforeRepair;
                  const isSelected = row.id === selectedReq.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedReqId(row.id)}
                      tabIndex={0}
                      aria-label={`${row.code}: ${row.requirement}. Inspect lineage`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedReqId(row.id);
                        }
                      }}
                      className={`evidence-table-row cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#ff8a4c]/15'
                          : 'hover:bg-[#1b2534]/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#ff8a4c] whitespace-nowrap">
                        {row.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{row.requirement}</td>
                      <td className="py-3.5 px-4 text-[#a2afc3] whitespace-nowrap">
                        {row.originLabel}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#c8d3e2] whitespace-nowrap">
                        {row.decisionId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#8caef9] whitespace-nowrap">
                        {row.evidenceId}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold whitespace-nowrap">
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
        </div>

        {/* Selected Chain Deep-Dive Lineage Card */}
        <div className="lg:col-span-4 rounded-2xl border border-[#2b3546] bg-[#151c28] p-5 space-y-4">
          <div className="border-b border-[#283345] pb-3">
            <div className="text-xs font-mono font-bold text-[#ff8a4c]">
              CHAIN LINEAGE INSPECTOR · {selectedReq.code}
            </div>
            <h3 className="mt-1 text-base font-bold text-white">{selectedReq.requirement}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
              <div className="font-mono text-[#a2afc3]">1. REQUIREMENT ORIGIN</div>
              <div className="mt-1 font-bold text-white">{selectedReq.originLabel}</div>
              <div className="mt-0.5 text-[#a2afc3]">
                Locked inside <code className="font-mono text-[#8caef9]">TaskSpec v1</code>
              </div>
            </div>

            {linkedDecision && (
              <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
                <div className="font-mono text-[#a2afc3]">
                  2. ARCHITECTURAL DECISION ({linkedDecision.id})
                </div>
                <div className="mt-1 font-bold text-white">{linkedDecision.title}</div>
                <p className="mt-1 text-[#c8d3e2] leading-relaxed">{linkedDecision.rationale}</p>
              </div>
            )}

            <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5">
              <div className="font-mono text-[#a2afc3]">
                3. PROVENANCE EVIDENCE ({selectedReq.evidenceId})
              </div>
              <div className="mt-1 font-bold text-white">{selectedReq.evidenceType}</div>
              <p className="mt-1 text-[#c8d3e2] leading-relaxed">{selectedReq.evidenceDetail}</p>
              {selectedReq.failureOutput && (
                <div className="mt-2.5 pt-2.5 border-t border-[#283345] font-mono">
                  <div className="text-[#fb8797]">Pre-Repair: {selectedReq.failureOutput}</div>
                  <div className="text-[#53d6ab] mt-1">
                    Post-Repair: {selectedReq.repairedOutput}
                  </div>
                </div>
              )}
            </div>

            {linkedComponent && (
              <div className="rounded-xl border border-[#2b3a4f] bg-[#121b28] p-3.5 flex items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-[#a2afc3]">4. VERIFYING RUNTIME MODULE</div>
                  <div className="mt-0.5 font-bold text-white">
                    {linkedComponent.code} · {linkedComponent.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToModule(linkedComponent.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Inspect →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete 13-Item Evidence Provenance Ledger (EVID-01 through EVID-13) */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
        <div className="p-5 border-b border-[#2b3546] flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#ff8a4c]">
              IMMUTABLE POSTGRESQL EVIDENCE LEDGER · MOD-07 (ALL 13 / 13 PROVENANCE RECORDS)
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">
              Complete Breakdown of the 13 Evidence Records Collected Across Stages 1–4
            </h3>
          </div>
          <span className="font-mono text-xs px-3 py-1 rounded-lg border border-[#53d6ab]/40 bg-[#53d6ab]/15 text-[#53d6ab] font-bold">
            13 / 13 Provenance Records Captured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2b3546] bg-[#0e131d] font-mono text-[#a2afc3]">
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Evidence Record & Provenance Detail</th>
                <th className="py-3 px-4">Linked Req / Rule</th>
                <th className="py-3 px-4">Producer Module</th>
                <th className="py-3 px-4 text-right">Ledger Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#273448]">
              {EVIDENCE_RECORDS_LEDGER.map((ev) => {
                const comp = SYSTEM_COMPONENTS.find((c) => c.id === ev.producerComponentId);
                const verdict = repaired ? ev.verdictAfterRepair : ev.verdictBeforeRepair;
                return (
                  <tr
                    key={ev.id}
                    className={
                      verdict === 'RECORDED_FAIL'
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
                      <div className="font-bold text-white">{ev.title}</div>
                      <div className="text-[#a2afc3] mt-0.5">{ev.detail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#c8d3e2] whitespace-nowrap">
                      {ev.linkedReqOrRule}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#a2afc3] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => comp && onJumpToModule(comp.id)}
                        className="text-[#8caef9] hover:underline cursor-pointer"
                      >
                        {comp?.code} · Stage {ev.stageCaptured + 1}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold whitespace-nowrap">
                      {verdict === 'RECORDED_PASS' ? (
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
