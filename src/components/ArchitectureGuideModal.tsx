import React from 'react';
import { X, Cpu, ShieldCheck, Zap, Lock, BookOpen, GitMerge, FileCode, Layers, Scale } from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelName: string;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose,
  activeModelName
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#3a4f6e] bg-[#0c121d] p-6 sm:p-8 text-[#dce3ef] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#223147] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff8a4c]/15 text-[#ff8a4c] font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
              <Scale size={13} />
              Formal Architecture Specification
            </div>
            <h2 id="guide-title" className="text-xl sm:text-2xl font-black text-white">
              Demystifying the Architecture: <span className="text-[#53d6ab]">Live Dynamic Engine</span> vs.{' '}
              <span className="text-[#8caef9]">Static Metamodel</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#a2afc3]">
              Why ShiftCore separates immutable mathematical governance from probabilistic local model execution.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#162234] hover:bg-[#203048] text-[#a2afc3] hover:text-white transition-colors cursor-pointer"
            aria-label="Close Architecture Guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Mathematical Duality Banner */}
        <div className="rounded-2xl border border-[#2b3a4f] bg-[#121a28] p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#ffa875] font-bold">
            <Layers size={16} />
            <span>THE CORE PRINCIPLE OF COGNITIVE SOFTWARE ENGINEERING RUNTIMES</span>
          </div>
          <p className="text-[#c8d3e2] leading-relaxed font-sans text-sm">
            In enterprise software engineering, <strong>an LLM alone cannot be trusted blindly</strong> because neural models are probabilistic and prone to hallucination. Conversely, <strong>static code alone cannot adapt</strong> to arbitrary natural language tasks. ShiftCore solves this by strictly separating the system into two distinct architectural layers:
          </p>
        </div>

        {/* Split Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column A: Dynamic Live Engine */}
          <div className="rounded-2xl border border-[#53d6ab]/50 bg-[#0d1622] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#53d6ab]/20 text-[#53d6ab] font-mono text-xs font-black">
                <Zap size={14} />
                ⚡ DYNAMIC · LIVE ENGINE
              </span>
              <span className="font-mono text-[10px] text-[#53d6ab] font-bold">
                PROBABILISTIC / RUNTIME
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white">
              Local Model Execution ({activeModelName})
            </h3>
            <p className="text-xs text-[#a2afc3] leading-relaxed">
              Everything in this layer is executed <strong>on the fly</strong> by your local model workers as prompts are dispatched:
            </p>

            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[#53d6ab] font-bold">▶</span>
                <div>
                  <strong className="text-white">Raw Token Streaming:</strong> Worker A (Coder) and Worker B (Verifier) stream NDJSON tokens live into the Live Role Logs console.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#53d6ab] font-bold">▶</span>
                <div>
                  <strong className="text-white">TaskSpec Elicitation:</strong> Extracting ambiguous platform choices and contextual facts from the developer prompt.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#53d6ab] font-bold">▶</span>
                <div>
                  <strong className="text-white">Multi-File Code Synthesis:</strong> Generating controller, service, and test ASTs in parallel across Worker A and Worker B.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#53d6ab] font-bold">▶</span>
                <div>
                  <strong className="text-white">Surgical AST Repair:</strong> Discovering test failures in Stage 4 and patching the defect dynamically.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#53d6ab] font-bold">▶</span>
                <div>
                  <strong className="text-white">Zero Static Results:</strong> When the local daemon is offline, 0 tokens and 0 stage artifacts are produced.
                </div>
              </li>
            </ul>
          </div>

          {/* Column B: Static Metamodel & Policy Contracts */}
          <div className="rounded-2xl border border-[#8caef9]/50 bg-[#0e1420] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#8caef9]/20 text-[#8caef9] font-mono text-xs font-black">
                <Lock size={14} />
                🔒 STATIC · FORMAL METAMODEL
              </span>
              <span className="font-mono text-[10px] text-[#8caef9] font-bold">
                DETERMINISTIC / IMMUTABLE
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white">
              Enterprise Governance Contracts ($\Phi$, $R$)
            </h3>
            <p className="text-xs text-[#a2afc3] leading-relaxed">
              This layer represents <strong>company security, compliance, and architectural laws</strong>. They must NEVER be generated by an LLM:
            </p>

            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[#8caef9] font-bold">■</span>
                <div>
                  <strong className="text-white">Policy Invariants ($\Phi$):</strong> Policies like <code className="text-[#ffa875]">POL-2026-v1</code> (mandatory zero-division guards, concurrency row-locks, token expiration).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8caef9] font-bold">■</span>
                <div>
                  <strong className="text-white">System Topology (MOD-01..08):</strong> The 8 core system components and 14 data contract edges in the System Map.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8caef9] font-bold">■</span>
                <div>
                  <strong className="text-white">Entropy Gate Thresholds:</strong> The mathematical requirement that residual ambiguity $H(A)$ must equal 0.00 bits before advancing to Stage 2.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8caef9] font-bold">■</span>
                <div>
                  <strong className="text-white">Audit Criteria:</strong> The strict verification assertions that test whether code satisfies requirements before release.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8caef9] font-bold">■</span>
                <div>
                  <strong className="text-white">Immutable Constitution:</strong> An LLM cannot edit or bypass company policy rules; it must obey them.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Detailed Side-by-Side Architectural Mapping Table */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#a2afc3]">
            Comprehensive Artifact Classification Matrix
          </h4>
          <div className="overflow-x-auto rounded-xl border border-[#233146]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121a28] text-[#8caef9] border-b border-[#233146]">
                <tr>
                  <th className="p-3">Platform Artifact</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Responsible Subsystem</th>
                  <th className="p-3">Behavior & Source of Truth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a3c] bg-[#0c121d]">
                <tr>
                  <td className="p-3 font-bold text-white">Live Role Logs & Tokens</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-extrabold text-[10px]">
                      ⚡ DYNAMIC LIVE
                    </span>
                  </td>
                  <td className="p-3 text-[#53d6ab]">Worker A / B ({activeModelName})</td>
                  <td className="p-3 text-[#a2afc3]">Streamed character by character in real-time from Ollama.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Organizational Policy (POL-2026-v1)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#8caef9]/20 text-[#8caef9] font-extrabold text-[10px]">
                      🔒 STATIC CONTRACT
                    </span>
                  </td>
                  <td className="p-3 text-[#8caef9]">Metamodel Policy Engine ($\Phi$)</td>
                  <td className="p-3 text-[#a2afc3]">Fixed enterprise governance rules (must not hallucinate).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Stage 3 Multi-File Code Synthesis</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-extrabold text-[10px]">
                      ⚡ DYNAMIC LIVE
                    </span>
                  </td>
                  <td className="p-3 text-[#53d6ab]">Worker A (Coder)</td>
                  <td className="p-3 text-[#a2afc3]">Synthesized dynamically based on developer task prompt.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">System Component Map (MOD-01..08)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#8caef9]/20 text-[#8caef9] font-extrabold text-[10px]">
                      🔒 STATIC CONTRACT
                    </span>
                  </td>
                  <td className="p-3 text-[#8caef9]">System Architecture Graph</td>
                  <td className="p-3 text-[#a2afc3]">Formal 8-component micro-architecture with data edges.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Stage 4 Surgical AST Patch</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-extrabold text-[10px]">
                      ⚡ DYNAMIC LIVE
                    </span>
                  </td>
                  <td className="p-3 text-[#53d6ab]">Worker B / Patch AST Engine</td>
                  <td className="p-3 text-[#a2afc3]">Generated to fix failing tests without human intervention.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Cryptographic Seal & Checkpoint Hash</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#ff8a4c]/20 text-[#ffa875] font-extrabold text-[10px]">
                      ⚡ LIVE HASH
                    </span>
                  </td>
                  <td className="p-3 text-[#ffa875]">WebCrypto SHA-256 Runtime</td>
                  <td className="p-3 text-[#a2afc3]">Computed live from the verified codebase content bytes.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Baseline Pedagogical Proof (P_arith)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#8caef9]/20 text-[#8caef9] font-extrabold text-[10px]">
                      🔒 STATIC PROOF
                    </span>
                  </td>
                  <td className="p-3 text-[#8caef9]">Reference Benchmark (SE-TASK-04)</td>
                  <td className="p-3 text-[#a2afc3]">Formal proof verifying guarded zero-division edge cases.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#223147] text-xs font-mono">
          <span className="text-[#7c8ca5]">
            ShiftCore Cognitive AI Runtime · Mathematical Governance Model $M_{'{'}SE{'}'}$
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-extrabold cursor-pointer transition-colors"
          >
            Got it, Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
