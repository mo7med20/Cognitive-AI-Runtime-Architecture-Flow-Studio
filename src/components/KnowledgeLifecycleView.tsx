import React, { useState } from 'react';
import {
  ExtractedKnowledgeUnit,
  SECodingScenario,
  SE_CODING_SCENARIOS
} from '../lib/seScenariosAndMetamodel';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileCode2,
  GitBranch,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

interface KnowledgeLifecycleViewProps {
  isRuntimeIdle?: boolean;
  highestCompletedStage?: number;
  activeScenario: SECodingScenario;
  knowledgeUnits: ExtractedKnowledgeUnit[];
  activePolicyHash: 'POL-2026-v1' | 'POL-2026-v2';
  onTogglePolicyHash: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onReturnToRuntime?: () => void;
}

export const KnowledgeLifecycleView: React.FC<KnowledgeLifecycleViewProps> = ({
  isRuntimeIdle = false,
  highestCompletedStage = -1,
  activeScenario,
  knowledgeUnits,
  activePolicyHash,
  onTogglePolicyHash,
  onSelectScenario,
  onReturnToRuntime
}) => {
  const [simulatedFollowUpRun, setSimulatedFollowUpRun] = useState<boolean>(false);

  const validUnits = knowledgeUnits.filter((u) => u.policyHash === activePolicyHash);
  const quarantinedUnits = knowledgeUnits.filter((u) => u.policyHash !== activePolicyHash);

  const stage1Executed = !isRuntimeIdle && highestCompletedStage >= 0;
  const stage5Executed = !isRuntimeIdle && highestCompletedStage >= 4;

  const followUp = activeScenario.followUpReuse;
  const isCurrentScenarioUnitValid =
    activeScenario.extractedKnowledge.policyHash === activePolicyHash;

  return (
    <div className="space-y-6">
      {/* Header & Policy Hash Governance Switch */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-xs font-bold tracking-wider text-[#ff8a4c] uppercase">
              3-TIER KNOWLEDGE ARCHITECTURE & CROSS-TASK REUSE ENGINE (MOD-03)
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-white">
              How ShiftCore Acquires, Verifies, Reuses, and Governs Engineering Knowledge
            </h2>
            <p className="mt-1.5 text-sm text-[#a2afc3] leading-relaxed">
              Standard AI RAG blindly retrieves unverified code fragments. ShiftCore structures knowledge into{' '}
              <strong className="text-white">3 formal tiers</strong> and enforces{' '}
              <strong className="text-white">Seal-Gated Promotion</strong> +{' '}
              <strong className="text-white">Cryptographic Policy-Hash Binding</strong> (<code className="font-mono text-[#ffa875]">{activePolicyHash}</code>). Zero units are pre-guessed statically—every unit in Tier 3 is reduced from a live Stage 5 Local Model run.
            </p>
            <p className="mt-1.5 text-xs text-[#ffa875]" dir="rtl" lang="ar">
              طبقة المعرفة ثلاثية الطبقات (3-Tier Knowledge Graph): لا يتم تخمين أو تعبئة أي خبرة مسبقاً؛ يتم استخلاص الخبرة فقط بعد تنفيذ المرحلة الخامسة (Stage 5) عبر النموذج المحلي مع ختم التحقق والتاريخ الفعلي.
            </p>
          </div>

          {/* Interactive Policy Hash Switcher */}
          <div className="rounded-xl border border-[#31435d] bg-[#0e131d] p-4 min-w-[280px]">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-[#a2afc3]">ACTIVE ORG POLICY HASH:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  activePolicyHash === 'POL-2026-v1'
                    ? 'bg-[#53d6ab]/15 text-[#53d6ab] border border-[#53d6ab]/40'
                    : 'bg-[#ff8a4c]/20 text-[#ffa875] border border-[#ff8a4c]/50'
                }`}
              >
                {activePolicyHash}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#a2afc3]">
              {activePolicyHash === 'POL-2026-v1'
                ? 'Verified knowledge units matching POL-2026-v1 are eligible for automatic reuse.'
                : 'Policy upgraded to POL-2026-v2! Prior POL-2026-v1 units are automatically quarantined until re-verified.'}
            </p>
            <button
              type="button"
              onClick={onTogglePolicyHash}
              className="mt-3 w-full px-3.5 py-2 rounded-lg bg-[#1b2738] hover:bg-[#24344b] border border-[#384e6e] text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className="text-[#ff8a4c]" />
              <span>
                Simulate Policy Upgrade ({activePolicyHash === 'POL-2026-v1' ? 'Switch to POL-2026-v2' : 'Restore POL-2026-v1'})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Tier Knowledge Architecture Visual Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TIER 1 */}
        <article className="rounded-2xl border border-[#8caef9]/40 bg-[#151c28] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-[#8caef9]/15 text-[#8caef9] font-mono text-xs font-bold">
              TIER 1 · STRUCTURAL REPO AST
            </span>
            <FileCode2 size={18} className="text-[#8caef9]" />
          </div>
          <h3 className="text-base font-bold text-white">Codebase AST & Database Schema Graph</h3>
          <p className="text-xs text-[#a2afc3] leading-relaxed">
            Resolved by <code className="font-mono text-[#8caef9]">WORKER-S1-INTAKE</code> during Stage 1. Eliminates naive chatbot questions about language, ORM, auth middleware, or existing table schemas.
          </p>
          <div className="space-y-1.5 pt-2 border-t border-[#263244] font-mono text-xs">
            {stage1Executed ? (
              activeScenario.elicitation.autoResolvedFacts
                .filter((f) => f.sourceTier === 'TIER_1_REPO_AST')
                .map((fact) => (
                  <div key={fact.id} className="rounded-lg bg-[#0d131d] p-2.5 border border-[#243246]">
                    <div className="text-[#8caef9] font-bold">{fact.dimension}</div>
                    <div className="text-white text-[11px] mt-0.5">{fact.autoResolvedValue}</div>
                    <div className="text-[#a2afc3] text-[10px] mt-1">Source: {fact.sourceArtifact}</div>
                  </div>
                ))
            ) : (
              <div className="rounded-lg bg-[#0d131d] p-3 border border-dashed border-[#344966] text-[#a2afc3]">
                Awaiting Stage 1 Role (<code className="text-[#8caef9]">WORKER-S1-INTAKE</code>) — Start a prompt in Live Runtime to index Tier 1 Repo AST facts.
              </div>
            )}
          </div>
        </article>

        {/* TIER 2 */}
        <article className="rounded-2xl border border-[#ff8a4c]/40 bg-[#151c28] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-[#ff8a4c]/15 text-[#ffa875] font-mono text-xs font-bold">
              TIER 2 · NORMATIVE POLICY RULES
            </span>
            <Lock size={18} className="text-[#ff8a4c]" />
          </div>
          <h3 className="text-base font-bold text-white">
            Immutable Security & Quality Constitution ({activePolicyHash})
          </h3>
          <p className="text-xs text-[#a2afc3] leading-relaxed">
            Non-negotiable enterprise invariants injected into Stage 2 planning and enforced by the Stage 4 Independent Verifier.
          </p>
          <div className="space-y-1.5 pt-2 border-t border-[#263244] font-mono text-xs">
            <div className="rounded-lg bg-[#0d131d] p-2.5 border border-[#243246]">
              <div className="text-[#ffa875] font-bold">§1.1 Zero Dynamic Eval / SQL Interpolation</div>
              <div className="text-[#c8d3e2] text-[11px] mt-0.5">
                All SQL identifiers must use frozen allowlists; `eval()` is strictly banned.
              </div>
            </div>
            <div className="rounded-lg bg-[#0d131d] p-2.5 border border-[#243246]">
              <div className="text-[#ffa875] font-bold">§2.4 Atomic Concurrency & Idempotency</div>
              <div className="text-[#c8d3e2] text-[11px] mt-0.5">
                Financial & session state mutations must hold row locks or atomic Lua CAS locks.
              </div>
            </div>
          </div>
        </article>

        {/* TIER 3 */}
        <article className="rounded-2xl border border-[#53d6ab]/40 bg-[#151c28] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-[#53d6ab]/15 text-[#53d6ab] font-mono text-xs font-bold">
              TIER 3 · VERIFIED EPISODIC MEMORY
            </span>
            <Database size={18} className="text-[#53d6ab]" />
          </div>
          <h3 className="text-base font-bold text-white">
            Seal-Gated Reusable Architectural Patterns
          </h3>
          <p className="text-xs text-[#a2afc3] leading-relaxed">
            Populated <strong>only</strong> when Stage 5 (<code className="font-mono text-[#53d6ab]">WORKER-S5-EXTRACTOR</code>) issues a cryptographic seal. Automatically injected into future tasks when `unit.policyHash === activePolicyHash`.
          </p>
          <div className="rounded-lg bg-[#0d131d] p-3 border border-[#243246] font-mono text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#a2afc3]">Sealed Active Units:</span>
              <span className="text-[#53d6ab] font-extrabold">{validUnits.length} Units</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#a2afc3]">Quarantined (Policy Mismatch):</span>
              <span className="text-[#fb8797] font-extrabold">{quarantinedUnits.length} Units</span>
            </div>
          </div>
        </article>
      </div>

      {/* =====================================================================
          INTERACTIVE CROSS-TASK REUSE SIMULATOR (TASK N -> TASK N+1)
         ===================================================================== */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263244] pb-4">
          <div>
            <div className="font-mono text-xs font-bold text-[#53d6ab] uppercase">
              CLOSED-LOOP LEARNING · CROSS-TASK KNOWLEDGE REUSE (TASK N → TASK N+1)
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {stage5Executed
                ? `Live Sealed Unit ${activeScenario.extractedKnowledge.id} Ready for Task N+1 Reuse`
                : 'Complete Stage 5 (WORKER-S5-EXTRACTOR) in Live Runtime to Seal & Extract a Tier 3 Knowledge Unit'}
            </h3>
          </div>

          {onReturnToRuntime && !stage5Executed && (
            <button
              type="button"
              onClick={onReturnToRuntime}
              className="px-4 py-2 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-mono text-xs font-extrabold cursor-pointer"
            >
              Go to Live Runtime to Execute Roles (S1→S5) →
            </button>
          )}
        </div>

        {!stage5Executed ? (
          <div className="rounded-xl border-2 border-dashed border-[#344966] bg-[#0e131d] p-6 text-center space-y-2 font-mono text-xs text-[#a2afc3]">
            <Lock size={20} className="mx-auto text-[#ffa875]" />
            <div className="text-white font-bold text-sm">
              No Tier 3 Knowledge Unit Sealed for Current Session Yet (Current Stage: {isRuntimeIdle ? 'S0 Idle' : `Stage ${highestCompletedStage + 1} of 5`})
            </div>
            <p className="max-w-2xl mx-auto">
              ShiftCore never guesses or pre-populates unverified knowledge. Run Stages 1 through 5 in the Live Runtime so{' '}
              <code className="text-[#53d6ab]">WORKER-S5-EXTRACTOR</code> can verify 8/8 checks, issue a cryptographic seal, and record the real extraction timestamp.
            </p>
          </div>
        ) : (
          <>
            {/* Task N -> Knowledge Unit -> Task N+1 Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
              {/* Task N (Completed & Sealed) */}
              <div className="lg:col-span-4 rounded-xl border border-[#2b3a4f] bg-[#0e131d] p-4 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#8caef9]">
                    1. COMPLETED & SEALED TASK N ({activeScenario.code})
                  </span>
                  <h4 className="mt-1 font-bold text-white text-sm">{activeScenario.title}</h4>
                  <p className="mt-1 text-xs text-[#a2afc3]">
                    Stage 4 caught defect in <code className="font-mono text-[#ffa875]">{activeScenario.surgicalDiff.targetFile}</code>, applied surgical AST repair (v1.1), and sealed 8/8 PASS.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#233044] font-mono text-xs text-[#53d6ab] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Seal: {activeScenario.extractedKnowledge.sourceSealId}</span>
                    <span>Extracted: {activeScenario.extractedKnowledge.id}</span>
                  </div>
                  {activeScenario.extractedKnowledge.createdAt && (
                    <div className="text-[11px] text-[#8caef9]">
                      Sealed At: {activeScenario.extractedKnowledge.createdAt}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 grid place-items-center text-[#ff8a4c]">
                <ArrowRight size={24} />
              </div>

              {/* Extracted Knowledge Unit Card */}
              <div
                className={`lg:col-span-6 rounded-xl border p-4 space-y-2.5 ${
                  isCurrentScenarioUnitValid
                    ? 'border-[#53d6ab]/50 bg-[#53d6ab]/8'
                    : 'border-[#fb8797]/50 bg-[#fb8797]/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="font-extrabold text-white">
                    2. TIER 3 KNOWLEDGE UNIT · {activeScenario.extractedKnowledge.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded font-bold ${
                      isCurrentScenarioUnitValid
                        ? 'bg-[#53d6ab] text-[#0c1018]'
                        : 'bg-[#fb8797] text-[#0c1018]'
                    }`}
                  >
                    {isCurrentScenarioUnitValid
                      ? `ACTIVE & REUSABLE (${activePolicyHash})`
                      : `QUARANTINED (Stale Policy ${activeScenario.extractedKnowledge.policyHash})`}
                  </span>
                </div>

                <div className="font-bold text-sm text-white">
                  {activeScenario.extractedKnowledge.patternName}
                </div>
                <div className="text-xs text-[#c8d3e2]">
                  <strong>Trigger:</strong> {activeScenario.extractedKnowledge.applicabilityTrigger}
                </div>
                <div className="rounded-lg bg-[#0a0f18] border border-[#233044] p-2.5 font-mono text-xs text-[#8caef9] overflow-x-auto">
                  {activeScenario.extractedKnowledge.reusableAstTemplate}
                </div>
              </div>
            </div>

            {/* Follow-Up Task N+1 Comparison Box */}
            <div className="rounded-xl border border-[#31435d] bg-[#0d131d] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-[#ff8a4c]">
                    3. INCOMING FOLLOW-UP TASK N+1 ({followUp.nextTaskId})
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    Prompt: “{followUp.nextTaskPrompt}”
                  </h4>
                  <p className="text-xs text-[#ffa875] mt-0.5" dir="rtl" lang="ar">
                    {followUp.arabicPromptSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSimulatedFollowUpRun(!simulatedFollowUpRun)}
                  className="px-4 py-2.5 rounded-xl bg-[#53d6ab] hover:bg-[#3bc497] text-[#0c1018] font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Zap size={15} />
                  <span>
                    {simulatedFollowUpRun
                      ? 'Reset Task N+1 Comparison'
                      : `Simulate Task N+1 with ${activeScenario.extractedKnowledge.id} Reuse`}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Without Knowledge Graph */}
                <div className="rounded-xl border border-[#fb8797]/40 bg-[#141c28] p-4 space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#fb8797] font-bold">WITHOUT SHIFTCORE TIER 3 MEMORY</span>
                    <span className="px-2 py-0.5 rounded bg-[#fb8797]/15 text-[#fb8797]">
                      Repeats Past Bug
                    </span>
                  </div>
                  <p className="text-xs text-[#c8d3e2] leading-relaxed">
                    {followUp.withoutKnowledgeGraph.summary}
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs">
                    <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                      <span className="block text-[10px] text-[#a2afc3]">Questions Asked</span>
                      <b className="text-[#fb8797]">{followUp.withoutKnowledgeGraph.questionsAsked} repetitive Qs</b>
                    </div>
                    <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                      <span className="block text-[10px] text-[#a2afc3]">First-Pass Defects</span>
                      <b className="text-[#fb8797]">{followUp.withoutKnowledgeGraph.firstPassDefects} FAIL (7/8)</b>
                    </div>
                    <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                      <span className="block text-[10px] text-[#a2afc3]">Latency</span>
                      <b className="text-white">{followUp.withoutKnowledgeGraph.planningLatencyMs} ms</b>
                    </div>
                  </div>
                </div>

                {/* With ShiftCore Knowledge Reuse */}
                <div
                  className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                    isCurrentScenarioUnitValid
                      ? 'border-[#53d6ab] bg-[#53d6ab]/10'
                      : 'border-[#ff8a4c] bg-[#ff8a4c]/10'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#53d6ab] font-bold flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>WITH SHIFTCORE TIER 3 KNOWLEDGE REUSE</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#53d6ab] text-[#0c1018] font-bold">
                      {isCurrentScenarioUnitValid ? '8/8 First-Pass!' : 'Blocked by Policy v2'}
                    </span>
                  </div>

                  {isCurrentScenarioUnitValid ? (
                    <>
                      <p className="text-xs text-white leading-relaxed">
                        {followUp.withShiftCoreKnowledgeReuse.summary}
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs">
                        <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                          <span className="block text-[10px] text-[#a2afc3]">Questions Asked</span>
                          <b className="text-[#53d6ab]">0 (Auto-Resolved)</b>
                        </div>
                        <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                          <span className="block text-[10px] text-[#a2afc3]">First-Pass Defects</span>
                          <b className="text-[#53d6ab]">0 Defects (8/8 ✓)</b>
                        </div>
                        <div className="rounded bg-[#0d131d] p-2 border border-[#263244]">
                          <span className="block text-[10px] text-[#a2afc3]">Latency</span>
                          <b className="text-[#53d6ab]">{followUp.withShiftCoreKnowledgeReuse.planningLatencyMs} ms</b>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-[#0d131d] border border-[#fb8797]/50 p-3 text-xs text-[#fb8797]">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        <span>POLICY-HASH MISMATCH QUARANTINE TRIGGERED!</span>
                      </div>
                      <p className="mt-1 text-[#dce3ef]">
                        Because active policy was switched to <code className="font-mono">{activePolicyHash}</code>, unit{' '}
                        <code className="font-mono">{activeScenario.extractedKnowledge.id}</code> (signed under{' '}
                        <code className="font-mono">{activeScenario.extractedKnowledge.policyHash}</code>) was blocked from blind injection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Persistent Knowledge Graph Ledger Table */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] overflow-hidden">
        <div className="p-5 border-b border-[#263244] flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-mono text-xs font-bold text-[#ff8a4c]">
              LIVE STAGE-5 SEALED KNOWLEDGE LEDGER (REDUCED FROM LOCAL MODEL WORKERS)
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Verified Experience Units Indexed in Tier 3 Memory During Runtime Execution
            </h3>
          </div>
          <span className="font-mono text-xs text-[#53d6ab]">
            {validUnits.length} Active / {knowledgeUnits.length} Total Sealed Units
          </span>
        </div>

        {knowledgeUnits.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#a2afc3] space-y-2">
            <div className="text-white font-bold text-sm">
              0 Sealed Knowledge Units in Tier 3 Memory Yet
            </div>
            <p className="max-w-xl mx-auto">
              Tier 3 starts empty with zero static or guessed entries. Execute a prompt through Stage 5 (<code className="text-[#53d6ab]">WORKER-S5-EXTRACTOR</code>) to seal and promote your first verified Knowledge Unit with its live execution timestamp.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0d131d] border-b border-[#263244] font-mono text-[#a2afc3]">
                  <th className="py-3 px-4">Unit ID</th>
                  <th className="py-3 px-4">Verified Architectural Pattern</th>
                  <th className="py-3 px-4">Seal & Checkpoint</th>
                  <th className="py-3 px-4">Sealed Timestamp (UTC)</th>
                  <th className="py-3 px-4">Policy Hash</th>
                  <th className="py-3 px-4 text-right">Reuse Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233044]">
                {knowledgeUnits.map((unit) => {
                  const isValid = unit.policyHash === activePolicyHash;
                  return (
                    <tr key={unit.id} className="hover:bg-[#1b2534]/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#ff8a4c]">{unit.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{unit.patternName}</div>
                        <div className="text-[#a2afc3] font-mono text-[11px] mt-0.5 truncate max-w-md">
                          {unit.reusableAstTemplate}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#53d6ab]">
                        {unit.sourceSealId} ({unit.sourceCheckpointId})
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8caef9]">
                        {unit.createdAt || 'Live Session'}
                      </td>
                      <td className="py-3 px-4 font-mono text-white">{unit.policyHash}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {isValid ? (
                          <span className="text-[#53d6ab] inline-flex items-center gap-1">
                            <CheckCircle2 size={13} /> ELIGIBLE ({unit.reuseCount}x)
                          </span>
                        ) : (
                          <span className="text-[#fb8797] inline-flex items-center gap-1">
                            <ShieldAlert size={13} /> QUARANTINED
                          </span>
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
    </div>
  );
};

