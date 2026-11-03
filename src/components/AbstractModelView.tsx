import React, { useState } from 'react';
import {
  FORMAL_METAMODEL_CLASSES,
  FORMAL_STATE_MACHINE_TRANSITIONS,
  FORMAL_SEQUENCE_DIAGRAM_STEPS,
  SE_CODING_SCENARIOS,
  SECodingScenario
} from '../lib/seScenariosAndMetamodel';
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode2,
  GitCommitHorizontal,
  Layers,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Workflow
} from 'lucide-react';

interface AbstractModelViewProps {
  activeScenario: SECodingScenario;
  onSelectScenario: (scenarioId: string) => void;
  onJumpToJourney: () => void;
}

type DiagramSubTab =
  | 'metamodel_uml'
  | 'state_machine'
  | 'sequence_diagram'
  | 'polymorphic_instantiator'
  | 'printable_spec';

export const AbstractModelView: React.FC<AbstractModelViewProps> = ({
  activeScenario,
  onSelectScenario,
  onJumpToJourney
}) => {
  const [subTab, setSubTab] = useState<DiagramSubTab>('metamodel_uml');
  const [selectedClassId, setSelectedClassId] = useState<string>('MM-01');
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>('TR-01');

  const selectedClass =
    FORMAL_METAMODEL_CLASSES.find((c) => c.id === selectedClassId) || FORMAL_METAMODEL_CLASSES[0];
  const selectedTransition =
    FORMAL_STATE_MACHINE_TRANSITIONS.find((t) => t.id === selectedTransitionId) ||
    FORMAL_STATE_MACHINE_TRANSITIONS[0];

  const handlePrintSpec = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining the Abstract SE Model Requirement for the Instructor */}
      <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="font-mono text-xs font-bold tracking-wider text-[#ff8a4c] uppercase">
              FORMAL SOFTWARE ENGINEERING SPECIFICATION · ABSTRACT METAMODEL (M_SE)
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-white">
              Domain-Independent Abstract SE Runtime Model & Formal UML Diagrams
            </h2>
            <p className="mt-2 text-sm text-[#a2afc3] leading-relaxed">
              This specification formalizes ShiftCore as a <strong className="text-white">universal Software Engineering Runtime Metamodel</strong>{' '}
              (<code className="font-mono text-[#8caef9]">M_SE = ⟨I, K, G, P, S, V⟩</code>) that governs{' '}
              <em>any</em> software engineering task—whether Feature Engineering, Distributed Concurrency Bugfixing, SQL Security Refactoring, or Live Custom Prompts—independent of the underlying Local LLM.
            </p>
            <p className="mt-1.5 text-xs text-[#ffa875]" dir="rtl" lang="ar">
              النموذج المجرد العام (Abstract SE Model) المطلوب للتسليم: يثبت أن النظام لا يعتمد على مثال الآلة الحاسبة، بل يطبق عقوداً برمجية وآلة حالة (State Machine) صالحة لأي مهمة هندسة برمجيات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintSpec}
              className="px-4 py-2.5 rounded-xl border border-[#324665] bg-[#121b28] hover:border-[#ff8a4c] text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer size={15} className="text-[#ff8a4c]" />
              <span>Print Formal Spec (PDF)</span>
            </button>
            <button
              type="button"
              onClick={onJumpToJourney}
              className="px-4 py-2.5 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Code2 size={15} />
              <span>Run Active Task in Simulator →</span>
            </button>
          </div>
        </div>

        {/* Formal 6-Tuple Equation Strip */}
        <div className="mt-5 rounded-xl border border-[#28364d] bg-[#0d131d] p-4 font-mono text-xs overflow-x-auto">
          <div className="text-[#8caef9] font-bold mb-1">
            FORMAL ALGEBRAIC DEFINITION OF THE SHIFTCORE SE RUNTIME:
          </div>
          <div className="text-white text-sm">
            𝓜<sub>SE</sub> = ⟨ <span className="text-[#ff8a4c]">ITaskIntent</span>,{' '}
            <span className="text-[#53d6ab]">IRepoKnowledgeContext(Tier 1..3)</span>,{' '}
            <span className="text-[#ffa875]">IAmbiguityGate</span>,{' '}
            <span className="text-[#8caef9]">IExecutionPlan</span>,{' '}
            <span className="text-[#baa3f2]">ISandboxedCheckpoint(#S3-01)</span>,{' '}
            <span className="text-[#53d6ab]">IVerificationSeal(#SEAL)</span> ⟩
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#263244] pt-4">
          {[
            { id: 'metamodel_uml' as const, label: '1. Metamodel Class Diagram (UML)', icon: Boxes },
            { id: 'state_machine' as const, label: '2. Guarded State Machine (S0 → S5)', icon: Workflow },
            { id: 'sequence_diagram' as const, label: '3. End-to-End Sequence Diagram', icon: GitCommitHorizontal },
            { id: 'polymorphic_instantiator' as const, label: '4. Polymorphic SE Task Instantiation', icon: Layers },
            { id: 'printable_spec' as const, label: '5. Full Submission Report', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                subTab === id
                  ? 'bg-[#ff8a4c] text-[#0c1018] border-[#ff8a4c] shadow-md'
                  : 'bg-[#111824] text-[#c8d3e2] border-[#2b374a] hover:border-[#8caef9]'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SUB-VIEW 1: FORMAL METAMODEL CLASS DIAGRAM (UML)
         ===================================================================== */}
      {subTab === 'metamodel_uml' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Interactive 6-Class UML Metamodel Grid */}
          <div className="lg:col-span-7 rounded-2xl border border-[#2b3546] bg-[#151c28] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#263244] pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#ff8a4c]">
                  UML CLASS DIAGRAM · 6 ABSTRACT CONTRACTS
                </span>
                <h3 className="text-lg font-bold text-white">
                  Click any Metamodel Interface to inspect its invariants & methods
                </h3>
              </div>
              <span className="font-mono text-xs text-[#8caef9]">6 Core Interfaces</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {FORMAL_METAMODEL_CLASSES.map((cls) => {
                const isSelected = cls.id === selectedClass.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ff8a4c] bg-[#1b2534] ring-2 ring-[#ff8a4c]/40'
                        : 'border-[#2b374a] bg-[#0e131d] hover:border-[#8caef9]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                      <span className="text-[#ffa875] font-bold">{cls.stereotype}</span>
                      <span className="px-2 py-0.5 rounded bg-[#182334] text-[#8caef9] border border-[#2a3b56]">
                        {cls.id}
                      </span>
                    </div>

                    <div className="mt-1.5 font-mono text-sm font-extrabold text-white">
                      {cls.interfaceName}
                    </div>

                    <p className="mt-1 text-xs text-[#a2afc3] line-clamp-2">{cls.purpose}</p>

                    {/* UML Compartment Preview */}
                    <div className="mt-3 pt-2.5 border-t border-[#233044] font-mono text-[11px] space-y-1">
                      {cls.attributes.slice(0, 2).map((attr) => (
                        <div key={attr.name} className="text-[#c8d3e2] truncate">
                          + {attr.name}: <span className="text-[#53d6ab]">{attr.type}</span>
                        </div>
                      ))}
                      <div className="text-[#8caef9] truncate pt-1 border-t border-[#1c2738]">
                        ƒ {cls.methods[0]?.signature.split('(')[0]}()
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Deep UML Contract Inspector */}
          <div className="lg:col-span-5 rounded-2xl border border-[#2b3546] bg-[#151c28] p-5 space-y-4">
            <div className="border-b border-[#263244] pb-3">
              <div className="font-mono text-xs font-bold text-[#ff8a4c]">
                METAMODEL CONTRACT INSPECTOR · {selectedClass.id}
              </div>
              <h3 className="mt-1 font-mono text-lg font-extrabold text-white">
                {selectedClass.interfaceName}
              </h3>
              <p className="mt-1 text-xs text-[#c8d3e2] leading-relaxed">{selectedClass.purpose}</p>
              <p className="mt-1.5 text-xs text-[#ffa875]" dir="rtl" lang="ar">
                {selectedClass.arabicPurpose}
              </p>
            </div>

            {/* Type Signature */}
            <div className="rounded-xl border border-[#28364d] bg-[#0d131d] p-3 font-mono text-xs text-[#8caef9]">
              {selectedClass.genericTypeSignature}
            </div>

            {/* Attributes & Formal Invariants */}
            <div>
              <h4 className="font-mono text-xs font-bold text-[#a2afc3] uppercase mb-2">
                Attributes & State Invariants
              </h4>
              <div className="space-y-2">
                {selectedClass.attributes.map((attr) => (
                  <div
                    key={attr.name}
                    className="rounded-xl border border-[#263244] bg-[#101723] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white">+ {attr.name}</span>
                      <span className="text-[#53d6ab]">{attr.type}</span>
                    </div>
                    <div className="mt-1 text-[#a2afc3]">
                      <strong className="text-[#ffa875]">Invariant:</strong> {attr.invariant}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarded Methods */}
            <div>
              <h4 className="font-mono text-xs font-bold text-[#a2afc3] uppercase mb-2">
                Operations & Pre-Condition Guards
              </h4>
              <div className="space-y-2">
                {selectedClass.methods.map((m) => (
                  <div
                    key={m.signature}
                    className="rounded-xl border border-[#263244] bg-[#101723] p-3 text-xs font-mono"
                  >
                    <div className="text-[#8caef9] font-bold">{m.signature}</div>
                    <div className="mt-1 text-[#53d6ab]">
                      [Guard]: {m.guardCondition}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Directed Relationships */}
            <div>
              <h4 className="font-mono text-xs font-bold text-[#a2afc3] uppercase mb-2">
                Directed Metamodel Associations
              </h4>
              <div className="space-y-1.5">
                {selectedClass.relationships.map((rel) => (
                  <div
                    key={rel.target}
                    className="rounded-lg border border-[#263244] bg-[#0d131d] px-3 py-2 text-xs font-mono flex items-center justify-between"
                  >
                    <span className="text-[#ff8a4c] font-bold">{rel.type}</span>
                    <span className="text-[#a2afc3]">{rel.label}</span>
                    <span className="text-white font-bold">→ {rel.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 2: FORMAL GUARDED STATE MACHINE (S0 -> S5)
         ===================================================================== */}
      {subTab === 'state_machine' && (
        <div className="space-y-5">
          {/* Interactive SVG Formal State Machine Diagram */}
          <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#ff8a4c]">
                  GUARDED FINITE STATE AUTOMATON (FSA) · DETERMINISTIC EXECUTION LIFECYCLE
                </span>
                <h3 className="text-lg font-bold text-white">
                  Why ShiftCore Never Hallucinates Unverified Completion: Formal Transition Guards (G1–G5)
                </h3>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-lg bg-[#53d6ab]/15 border border-[#53d6ab]/40 text-[#53d6ab]">
                Zero Unguarded Transitions
              </span>
            </div>

            {/* Visual State Nodes Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                { code: 'S0', name: 'Raw Intent', sub: 'Developer Prompt', guard: 'G1: Repo Indexed', tone: 'border-[#8caef9]' },
                { code: 'S1', name: 'Context & Gate', sub: '0-Q Repo Resolve + 1 Gate', guard: 'G2: Entropy == 0', tone: 'border-[#ff8a4c]' },
                { code: 'S2', name: 'Plan Locked', sub: 'R1..R8 + ADRs', guard: 'G3: Test Matrix 1:1', tone: 'border-[#8caef9]' },
                { code: 'S3', name: 'Sandbox #S3-01', sub: 'Multi-File AST Snapshot', guard: 'G4: Oracle Audit', tone: 'border-[#baa3f2]' },
                { code: 'S4', name: 'Surgical Repair', sub: 'Patch AST Node (v1.1)', guard: 'G4b: 8/8 Pass', tone: 'border-[#fb8797]' },
                { code: 'S5', name: 'Sealed & Reused', sub: '#SEAL-402 -> Tier 3 KG', guard: 'G5: Policy Valid', tone: 'border-[#53d6ab]' }
              ].map((st, idx) => (
                <div
                  key={st.code}
                  className={`rounded-xl border-2 ${st.tone} bg-[#0e131d] p-3.5 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#1b2534] text-white font-extrabold">
                        {st.code}
                      </span>
                      <span className="text-[#a2afc3]">Step {idx + 1}</span>
                    </div>
                    <div className="mt-2 font-bold text-sm text-white">{st.name}</div>
                    <div className="text-xs text-[#a2afc3] mt-0.5">{st.sub}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#233044] font-mono text-[11px] text-[#53d6ab]">
                    [{st.guard}]
                  </div>
                </div>
              ))}
            </div>

            {/* Formal Transition Table */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-[#263244]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0d131d] border-b border-[#263244] font-mono text-[#a2afc3]">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Source State</th>
                    <th className="py-3 px-4">Target State</th>
                    <th className="py-3 px-4">Formal Guard Condition [G]</th>
                    <th className="py-3 px-4">Runtime Action / Side Effect</th>
                    <th className="py-3 px-4">If Guard Fails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233044]">
                  {FORMAL_STATE_MACHINE_TRANSITIONS.map((tr) => {
                    const isSelected = tr.id === selectedTransition.id;
                    return (
                      <tr
                        key={tr.id}
                        onClick={() => setSelectedTransitionId(tr.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#ff8a4c]/15' : 'hover:bg-[#1b2534]/60'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#ff8a4c]">{tr.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{tr.fromState}</td>
                        <td className="py-3 px-4 font-bold text-[#8caef9]">{tr.toState}</td>
                        <td className="py-3 px-4 font-mono text-[#53d6ab]">{tr.formalGuard}</td>
                        <td className="py-3 px-4 text-[#c8d3e2]">{tr.actionEffect}</td>
                        <td className="py-3 px-4 text-[#fb8797] font-mono">{tr.onGuardFailure}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 3: END-TO-END FORMAL SEQUENCE DIAGRAM
         ===================================================================== */}
      {subTab === 'sequence_diagram' && (
        <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-xs font-bold text-[#ff8a4c]">
                UML SEQUENCE DIAGRAM · 6 LIFELINE ACTORS Across 8 MESSAGES
              </span>
              <h3 className="text-lg font-bold text-white">
                End-to-End Message Sequence: From Raw Prompt to Tier 3 Knowledge Reuse
              </h3>
            </div>
            <span className="font-mono text-xs text-[#8caef9]">
              Developer ↔ IntakeGate ↔ KnowledgeGraph ↔ LocalLLM ↔ Sandbox ↔ VerifierOracle
            </span>
          </div>

          {/* Actor Lifelines Header */}
          <div className="grid grid-cols-6 gap-2 text-center font-mono text-xs">
            {[
              { name: 'Developer', sub: 'Human Engineer', color: 'border-[#ff8a4c] text-[#ffa875]' },
              { name: 'IntakeGate', sub: 'MOD-01 / MOD-04', color: 'border-[#8caef9] text-[#8caef9]' },
              { name: 'KnowledgeGraph', sub: 'Tier 1-3 Context', color: 'border-[#53d6ab] text-[#53d6ab]' },
              { name: 'LocalLLMPlanner', sub: 'Ollama / vLLM', color: 'border-[#baa3f2] text-[#baa3f2]' },
              { name: 'SandboxExecutor', sub: 'Checkpoint #S3-01', color: 'border-[#ff8a4c] text-[#ffa875]' },
              { name: 'VerifierOracle', sub: 'MOD-08 Gate', color: 'border-[#53d6ab] text-[#53d6ab]' }
            ].map((actor) => (
              <div
                key={actor.name}
                className={`rounded-xl border ${actor.color} bg-[#0d131d] p-2.5`}
              >
                <div className="font-extrabold text-white truncate">{actor.name}</div>
                <div className="text-[10px] text-[#a2afc3] mt-0.5">{actor.sub}</div>
              </div>
            ))}
          </div>

          {/* Sequence Steps Timeline */}
          <div className="space-y-2.5">
            {FORMAL_SEQUENCE_DIAGRAM_STEPS.map((step) => (
              <div
                key={step.order}
                className="rounded-xl border border-[#263244] bg-[#0e131d] p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#ff8a4c] text-[#0c1018] font-mono text-xs font-extrabold grid place-items-center shrink-0">
                    {step.order}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#ffa875]">
                    {step.phase}
                  </span>
                </div>

                <div className="md:col-span-4 font-mono text-xs">
                  <span className="text-white font-bold">{step.sourceActor}</span>
                  <span className="text-[#ff8a4c] mx-2">───▶</span>
                  <span className="text-[#8caef9] font-bold">{step.targetActor}</span>
                  <div className="text-[#53d6ab] font-bold mt-1">{step.message}</div>
                </div>

                <div className="md:col-span-3 font-mono text-xs bg-[#141c28] border border-[#263244] rounded-lg px-2.5 py-1.5 text-[#c8d3e2]">
                  {step.payloadSchema}
                </div>

                <div className="md:col-span-3 text-xs text-[#a2afc3]">
                  <strong className="text-white">Invariant:</strong> {step.formalConstraint}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 4: POLYMORPHIC SE TASK INSTANTIATOR
         ===================================================================== */}
      {subTab === 'polymorphic_instantiator' && (
        <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-[#ff8a4c]">
                PROOF OF GENERALITY · POLYMORPHIC INSTANTIATION OF M_SE
              </span>
              <h3 className="text-lg font-bold text-white">
                How Different Software Engineering Archetypes Instantiate the Exact Same Abstract Model
              </h3>
              <p className="text-xs text-[#a2afc3] mt-1">
                Select any of the 4 SE coding archetypes below to see how its concrete artifacts map 1-to-1 onto the 6 abstract interfaces.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.values(SE_CODING_SCENARIOS).map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => onSelectScenario(scen.id)}
                  className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    activeScenario.id === scen.id
                      ? 'bg-[#ff8a4c] text-[#0c1018] border-[#ff8a4c]'
                      : 'bg-[#0e131d] text-white border-[#2b374a] hover:border-[#ff8a4c]'
                  }`}
                >
                  {scen.code}: {scen.badgeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix of All 4 Archetypes */}
          <div className="overflow-x-auto rounded-xl border border-[#263244]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0d131d] border-b border-[#263244] font-mono text-[#a2afc3]">
                  <th className="py-3 px-4">Abstract Contract (M_SE)</th>
                  <th className="py-3 px-4">SE-TASK-01 (Feature + DB API)</th>
                  <th className="py-3 px-4">SE-TASK-02 (Concurrency Bugfix)</th>
                  <th className="py-3 px-4">SE-TASK-03 (SQLi & N+1 Refactor)</th>
                  <th className="py-3 px-4">SE-TASK-04 (Baseline Calculator)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233044]">
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#ff8a4c]">ITaskIntent</td>
                  <td className="py-3 px-4 text-white">POST /payments/:id/refund</td>
                  <td className="py-3 px-4 text-white">Fix 401 JWT refresh rotation race</td>
                  <td className="py-3 px-4 text-white">Eliminate SQLi & N+1 in OrderRepo</td>
                  <td className="py-3 px-4 text-white">«اعمل آلة حاسبة»</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#53d6ab]">IRepoKnowledgeContext (Auto-Resolved)</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">Prisma PostgreSQL + `amountCents` + RBAC</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">Redis `rt_family:{'{id}'}` + OAuth2 Theft Rule</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">`pg.Pool` + 14 callers expecting DTO</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">TypeScript strict + Zero `eval()` rule</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#ffa875]">IAmbiguityGate (1 Blocking Question)</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">Partial Refund + Pessimistic Row Lock</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">Atomic Lua CAS + 10s Parent Grace Window</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">`ANY($1::uuid[])` Batch + Sort Allowlist</td>
                  <td className="py-3 px-4 text-[#c8d3e2]">Standard 4-Op + `ERR_DIV_BY_ZERO`</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#8caef9]">ISandboxedCheckpoint (#S3-01)</td>
                  <td className="py-3 px-4 font-mono text-white">refundService.ts + schema.prisma + spec</td>
                  <td className="py-3 px-4 font-mono text-white">tokenRotator.ts + race.spec.ts</td>
                  <td className="py-3 px-4 font-mono text-white">orderRepository.ts + security.spec.ts</td>
                  <td className="py-3 px-4 font-mono text-white">arithmeticEngine.ts + spec.ts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#fb8797]">Stage 4 Defect Caught & Patched</td>
                  <td className="py-3 px-4 text-[#fb8797]">Double-refund race → `SELECT FOR UPDATE`</td>
                  <td className="py-3 px-4 text-[#fb8797]">Non-atomic `hGetAll` → Redis Lua CAS</td>
                  <td className="py-3 px-4 text-[#fb8797]">`ORDER BY ${'{sortBy}'}` SQLi → Allowlist</td>
                  <td className="py-3 px-4 text-[#fb8797]">`10 / 0 = Infinity` → `b === 0` guard</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-bold text-[#53d6ab]">Extracted IKnowledgeUnit (Tier 3)</td>
                  <td className="py-3 px-4 font-mono text-[#53d6ab]">KU-201 (Reused in Wallet Withdraw API)</td>
                  <td className="py-3 px-4 font-mono text-[#53d6ab]">KU-202 (Reused in Magic Link OTP)</td>
                  <td className="py-3 px-4 font-mono text-[#53d6ab]">KU-203 (Reused in InvoiceRepo)</td>
                  <td className="py-3 px-4 font-mono text-[#53d6ab]">KU-204 (Reused in Tax Widget)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-VIEW 5: PRINTABLE INSTRUCTOR SUBMISSION REPORT
         ===================================================================== */}
      {subTab === 'printable_spec' && (
        <div className="rounded-2xl border border-[#2b3546] bg-[#151c28] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263244] pb-4">
            <div>
              <div className="font-mono text-xs font-bold text-[#ff8a4c]">
                GRADUATION PROJECT DELIVERABLE · EXECUTIVE ARCHITECTURE BRIEF
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">
                Direct Responses to the 4 Instructor Review Critiques
              </h3>
            </div>
            <button
              type="button"
              onClick={handlePrintSpec}
              className="px-4 py-2 rounded-xl bg-[#ff8a4c] text-[#0c1018] font-extrabold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#2b3a4f] bg-[#0e131d] p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ff8a4c]">
                <ShieldAlert size={15} />
                <span>CRITIQUE 1: HOW ELICITATION DIFFERS FROM NORMAL AI</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Context-Grounded Auto-Resolution + Deterministic Schema Gate
              </h4>
              <p className="text-xs text-[#c8d3e2] leading-relaxed">
                Standard conversational AI asks ungrounded questions in a vacuum (or guesses blindly). ShiftCore first queries{' '}
                <strong>Tier 1 Repo AST</strong>, <strong>Tier 2 Security Policies</strong>, and{' '}
                <strong>Tier 3 Verified Patterns</strong> to auto-resolve known architectural facts with{' '}
                <strong>0 questions asked</strong>. It halts at a formal state-machine gate ONLY when an irreducible domain trade-off is detected, compiling the developer’s choice into a locked JSON Schema constraint (`Entropy = 0.00`).
              </p>
            </div>

            <div className="rounded-xl border border-[#2b3a4f] bg-[#0e131d] p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#53d6ab]">
                <FileCode2 size={15} />
                <span>CRITIQUE 2: FULL SE CODING FLOWS (BEYOND CALCULATOR)</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Multi-File Backend Services, Concurrency Locks, SQLi & Live Local LLM
              </h4>
              <p className="text-xs text-[#c8d3e2] leading-relaxed">
                ShiftCore now executes complete multi-file Software Engineering workflows: (1){' '}
                <strong>Payment Refund API</strong> with Prisma schema & Serializable `SELECT FOR UPDATE` locks, (2){' '}
                <strong>Distributed JWT Refresh Race Bugfix</strong> using atomic Redis Lua scripts, (3){' '}
                <strong>SQL Injection & N+1 Batch Refactoring</strong>, and (4){' '}
                <strong>Any Live Custom Prompt</strong> executed via the Local LLM backend (`server.ts` + Ollama).
              </p>
            </div>

            <div className="rounded-xl border border-[#2b3a4f] bg-[#0e131d] p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#8caef9]">
                <Cpu size={15} />
                <span>CRITIQUE 3: THE ABSTRACT SE MODEL (M_SE)</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                6 Metamodel Interfaces + Guarded Automaton (S0..S5)
              </h4>
              <p className="text-xs text-[#c8d3e2] leading-relaxed">
                The runtime is formalized as the 6-tuple Metamodel{' '}
                <code className="font-mono text-[#8caef9]">M_SE = ⟨ITaskIntent, IRepoKnowledgeContext, IAmbiguityGate, IExecutionPlan, ISandboxedCheckpoint, IVerificationSeal⟩</code>{' '}
                governed by 5 formal transition guards (`G1..G5`). Any SE task polymorphically instantiates this exact contract.
              </p>
            </div>

            <div className="rounded-xl border border-[#2b3a4f] bg-[#0e131d] p-4 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ffa875]">
                <ShieldCheck size={15} />
                <span>CRITIQUE 4: THE 3-TIER KNOWLEDGE ARCHITECTURE</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Seal-Gated Promotion, Cross-Task Reuse (Task N → N+1) & Policy Invalidation
              </h4>
              <p className="text-xs text-[#c8d3e2] leading-relaxed">
                Unlike naive RAG that retrieves unverified code snippets, ShiftCore’s Tier 3 Knowledge Graph only admits patterns signed by an independent verification seal (`#SEAL-402`) and tagged with the active organizational policy hash (`POL-2026-v1`). When `Task N+1` arrives, verified patterns are auto-injected; if security policy upgrades to `POL-2026-v2`, stale patterns are automatically quarantined.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#53d6ab]/40 bg-[#53d6ab]/10 p-4 flex items-center gap-3 text-xs text-[#dce3ef]">
            <CheckCircle2 size={18} className="text-[#53d6ab] shrink-0" />
            <span>
              <strong>Tip for your defense:</strong> You can also open <code className="font-mono text-white">ABSTRACT_SE_MODEL_SPEC.md</code> in the repository root or click <strong>Print / Save as PDF</strong> above to hand a physical copy of the UML Metamodel, Guarded State Machine, and 3-Tier Knowledge specification to your instructor.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
