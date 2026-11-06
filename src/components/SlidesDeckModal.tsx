import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { StageIndex } from '../lib/runtimeEngine';

export type WorkspaceTabId =
  | 'flow_studio'
  | 'result_preview'
  | 'abstract_model'
  | 'architecture'
  | 'knowledge_graph'
  | 'traceability';

interface SlidesDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStage: (stage: StageIndex) => void;
  onJumpToTab: (tab: WorkspaceTabId) => void;
}

interface SlideItem {
  number: number;
  title: string;
  subtitle: string;
  category: string;
  correspondingStage?: StageIndex;
  correspondingTab?: WorkspaceTabId;
  bulletPoints: string[];
  visualCue: string;
  speakerScript: string;
  professorQuestion?: {
    q: string;
    a: string;
  };
}

const SLIDES_DATA: SlideItem[] = [
  {
    number: 1,
    category: '1. THESIS & INSTRUCTOR REVIEW RESPONSE',
    title: 'ShiftCore: Formal Software Engineering Runtime & Abstract Metamodel',
    subtitle: 'Addressing All 4 Committee Review Points with Full-Stack Local LLM Execution',
    correspondingStage: 0,
    bulletPoints: [
      'Core Thesis: "A plausible Local LLM code output does not equal a verified Software Engineering delivery."',
      'Review Point 1 (Elicitation): Context-Grounded Auto-Resolution (0 questions for Repo AST/Policy facts) + Deterministic Schema Gate.',
      'Review Point 2 (Real SE Coding): Multi-file Payment Refund API, Distributed JWT Race Bugfix, SQLi & N+1 Refactor, + Live Custom Prompts.',
      'Review Point 3 (Abstract Model): Formal 6-Tuple Metamodel M_SE = ⟨I, K, G, P, S, V⟩ & Guarded Automaton (S0..S5).',
      'Review Point 4 (Knowledge): 3-Tier Knowledge Graph with Seal-Gated Promotion (#SEAL-402), Task N→N+1 Reuse, and Policy-Hash Invalidation.'
    ],
    visualCue: 'Point to the Live Local LLM Bar at the top and the 4 SE Coding Scenarios.',
    speakerScript:
      'Hello Doctor. Following your valuable feedback from our last review, we completely upgraded ShiftCore from a single-widget prototype into a formal, full-stack Software Engineering Runtime connected to a Local LLM backend (Ollama / vLLM). Today I will show you how ShiftCore solves all four points you raised: why our requirement elicitation is fundamentally different from normal AI, how it executes multi-file coding workflows, our formal Abstract SE Metamodel, and our 3-Tier Knowledge Graph.'
  },
  {
    number: 2,
    category: '2. CRITIQUE #1 · REQUIREMENT ELICITATION',
    title: 'Why ShiftCore Elicitation is NOT Normal Conversational AI',
    subtitle: 'Context-Grounded Auto-Resolution (Tier 1–3) vs. Unconstrained Chat',
    correspondingStage: 0,
    bulletPoints: [
      'Why Normal AI Fails: Chatbots operate in a vacuum—either asking repetitive boilerplate questions ("What DB? What auth?") or guessing blindly.',
      'ShiftCore Step 1A (Auto-Resolution): Queries Tier 1 Repo AST (`schema.prisma`, middleware), Tier 2 Policy (`POL-2026-v1`), and Tier 3 Knowledge Graph.',
      'Result: 4 critical architectural facts are resolved automatically with ZERO questions asked to the developer.',
      'ShiftCore Step 1B (Blocking Gate): Halts the state machine ONLY when an irreducible domain trade-off is detected (`Entropy > 0`).',
      'Compiles the human decision into a formal JSON Schema constraint (`Entropy = 0.00 bits`) before any LLM code generation is allowed.'
    ],
    visualCue: 'In Step 1 of Coding Journey, point to the left red card (Naive AI) vs right green card (4 Auto-Resolved Repo Facts).',
    speakerScript:
      'You rightly noted last time that simply asking a user questions looks like normal AI. Look at Step 1 now: before asking a single question, ShiftCore scans the repository AST, the security policy engine, and prior verified patterns. It resolves the database ORM, integer cents schema, and RBAC middleware automatically with zero questions asked! It only halts execution at a formal state-machine gate when it encounters a genuine architectural trade-off—like pessimistic row locking—and compiles your choice into a strict schema contract.'
  },
  {
    number: 3,
    category: '3. CRITIQUE #3 · THE ABSTRACT SE MODEL',
    title: 'Formalizing the Domain-Independent SE Metamodel (M_SE)',
    subtitle: '6 Abstract Contracts Governing Any Software Engineering Task',
    correspondingTab: 'abstract_model',
    bulletPoints: [
      'Algebraic Definition: M_SE = ⟨ITaskIntent, IRepoKnowledgeContext, IAmbiguityGate, IExecutionPlan, ISandboxedCheckpoint, IVerificationSeal⟩.',
      'ITaskIntent<TDomain>: Binds raw prompt to repository AST hash and computes ambiguity entropy.',
      'IRepoKnowledgeContext: Encapsulates Tier 1 (AST), Tier 2 (Normative Policy), and Tier 3 (Verified Patterns).',
      'ISandboxedCheckpoint (#S3-01): Immutable Merkle-hashed multi-file code snapshot enabling localized surgical patches.',
      'IVerificationSeal (#SEAL-402): Cryptographic proof issued by an independent oracle before knowledge promotion.'
    ],
    visualCue: 'Switch to Tab 2 (Abstract SE Model) and click through the 6 UML Metamodel Class cards.',
    speakerScript:
      'To satisfy your requirement for an Abstract Model applicable to any Software Engineering task, we formalized ShiftCore as a 6-tuple Metamodel M_SE. In Tab 2, you can inspect the UML Class Diagram for all 6 abstract interfaces, their state invariants, and their pre-condition guards.',
    professorQuestion: {
      q: 'How do you prove this Abstract Model works for any Software Engineering task, not just one example?',
      a: 'In Sub-tab 4 ("Polymorphic SE Task Instantiation"), we prove generality by instantiating the exact same 6 abstract interfaces across four completely different SE archetypes: a REST API + DB Transaction feature, a distributed Redis JWT race bugfix, an OWASP SQL Injection & N+1 refactoring task, and any free-form live prompt.'
    }
  },
  {
    number: 4,
    category: '4. FORMAL STATE MACHINE & SEQUENCE DIAGRAM',
    title: 'Guarded Finite State Automaton (S0 → S5) & Sequence Lifelines',
    subtitle: 'Mathematical Proof That Unverified Code Cannot Escape the Runtime',
    correspondingTab: 'abstract_model',
    bulletPoints: [
      'State S0 → S1 [Guard G1]: Repo AST indexed & Policy Engine active.',
      'State S1 → S2 [Guard G2]: AmbiguityEntropy(TaskSpec) == 0.00.',
      'State S2 → S3 [Guard G3]: Bijective 1:1 mapping between Requirements (R1..R8) and executable Test Assertions.',
      'State S3 → S4_Repair [Guard G4a]: Independent Verifier detects failure -> retains #S3-01 and isolates failing AST node.',
      'State S4 → S5 [Guard G5]: 8/8 Assertions PASS ∧ 0 Regressions -> Issues #SEAL-402 and promotes to Tier 3 Knowledge.'
    ],
    visualCue: 'In Tab 2 (Abstract SE Model), click Sub-tab 2 (Guarded State Machine) and Sub-tab 3 (Sequence Diagram).',
    speakerScript:
      'Here is our formal Guarded Finite State Automaton. Unlike standard LLM wrappers where the model decides when it is done, ShiftCore enforces five formal transition guards G1 through G5. A task cannot transition from S3 to S5 unless the Independent Verifier Oracle confirms 100% test and policy compliance.'
  },
  {
    number: 5,
    category: '5. CRITIQUE #2 · REAL SE CODING WORKFLOWS',
    title: 'Multi-File Software Engineering Tasks & Live Local LLM Execution',
    subtitle: 'Payment Refund API, Distributed Auth Race Bugfix, and SQLi Refactoring',
    correspondingStage: 1,
    bulletPoints: [
      'SE-TASK-01 (Feature): Idempotent Payment Refund API (`refundService.ts`, `schema.prisma`, `concurrency.spec.ts`).',
      'SE-TASK-02 (Bugfix): Distributed JWT Refresh Token Rotation Race (`tokenRotator.ts` with Atomic Redis Lua CAS).',
      'SE-TASK-03 (Refactor): SQL Injection & N+1 Query Batch Refactoring (`orderRepository.ts` reducing 51 queries to 2).',
      'Live Local LLM Integration: Connected via Express backend (`server.ts`) to Ollama (`localhost:11434`) & OpenAI-compatible local APIs (`qwen2.5-coder`, `deepseek-coder`, `llama3`).'
    ],
    visualCue: 'Show the Scenario Switcher and Live Prompt Input bar at the top of the app.',
    speakerScript:
      'Instead of only a calculator, ShiftCore now runs full multi-file software engineering workflows—and you can also type any custom coding prompt live into the bar at the top, which executes through our Node.js backend and Local LLM runtime.'
  },
  {
    number: 6,
    category: '6. STEP 3 · MULTI-FILE SANDBOX CHECKPOINT (#S3-01)',
    title: 'Decoupling Local Model Generation from Runtime Governance',
    subtitle: 'Inspecting Multi-File Code Artifacts & Merkle Checkpoint Hashing',
    correspondingStage: 2,
    bulletPoints: [
      'Local Model generates multi-file TypeScript, Prisma schema, and Vitest test suites inside an isolated sandbox.',
      'Backend computes a SHA-256 Merkle hash over all generated files and commits immutable Checkpoint #S3-01.',
      'Crucial Governance Split: Local LLM Worker Status = CODE SYNTHESIS COMPLETE vs. Runtime Task Status = VERIFYING.',
      'Latent Defect in v1.0: In SE-TASK-01, `refundService.ts` reads `refundedCents` via `findUnique` outside a lock, creating a parallel double-refund race condition.'
    ],
    visualCue: 'In Step 3, click through the generated files (`refundService.ts`, `schema.prisma`, `spec.ts`).',
    speakerScript:
      'In Step 3, the Local Model finishes writing the multi-file TypeScript and Prisma code. Look at the status split: the model reports "Synthesis Complete", but ShiftCore holds the task in "VERIFYING" and locks Checkpoint #S3-01 with a SHA-256 digest.'
  },
  {
    number: 7,
    category: '7. STEP 4 · INDEPENDENT ORACLE & SURGICAL AST REPAIR',
    title: 'Catching Concurrency / Security Bugs & Patching Without Restarting',
    subtitle: 'Pinpoint AST Diff (v1.0 → v1.1) on Retained Checkpoint #S3-01',
    correspondingStage: 3,
    bulletPoints: [
      'Independent Verification Oracle runs R1–R7 functional checks (PASS) and R8 Concurrency/Security probe (FAIL: 7/8).',
      'In SE-TASK-01, two parallel $70 refund requests against a $100 charge both succeed in v1.0 ($140 refunded!).',
      'Surgical AST Repair: Instead of regenerating all 3 files from scratch, ShiftCore patches ONLY `refundService.ts` Line 39 to use `SELECT ... FOR UPDATE` inside a `Serializable` transaction.',
      '2 other files (`schema.prisma` and `spec.ts`) remain 100% untouched, guaranteeing zero regressions and 8/8 PASS.'
    ],
    visualCue: 'In Step 4, click "Apply Surgical AST Patch & Verify" to show the green/red AST diff.',
    speakerScript:
      'When Step 4 runs the parallel concurrency probe, v1.0 fails requirement R8 because two simultaneous requests over-refund the payment. Instead of wiping the workspace and re-prompting the LLM from scratch, ShiftCore retains Checkpoint #S3-01, surgically patches only the transaction block in `refundService.ts` to add `SELECT FOR UPDATE`, leaves the other files untouched, and re-verifies 8 out of 8!'
  },
  {
    number: 8,
    category: '8. CRITIQUE #4 · THE 3-TIER KNOWLEDGE GRAPH',
    title: 'How ShiftCore Learns, Reuses (Task N → N+1), and Invalidates Stale Memory',
    subtitle: 'Tier 1 (Repo AST) · Tier 2 (Normative Policy) · Tier 3 (Verified Episodic Units)',
    correspondingTab: 'knowledge_graph',
    bulletPoints: [
      'Why Standard RAG Fails: Vector databases retrieve unverified or outdated code snippets that violate new security policies.',
      'Seal-Gated Admission: A pattern enters Tier 3 ONLY after passing 8/8 verification and receiving cryptographic seal `#SEAL-402`.',
      'Cross-Task Reuse (`Task N → Task N+1`): Completing `Payment Refund API` extracts `KU-201` (Serializable Row Lock). When `Wallet Withdrawal API` arrives next, `KU-201` is auto-injected—achieving 8/8 on the first pass with 0 questions!',
      'Policy-Hash Invalidation: Every Knowledge Unit is bound to `POL-2026-v1`. Upgrading org policy to `POL-2026-v2` automatically quarantines stale units.'
    ],
    visualCue: 'Switch to Tab 4 (Knowledge Graph) and click "Simulate Policy Upgrade (Switch to POL-2026-v2)".',
    speakerScript:
      'Regarding your question on Knowledge: Tab 4 demonstrates our 3-Tier Knowledge Architecture. First, no pattern can enter Tier 3 unless it holds a cryptographic verification seal (#SEAL-402). Second, when a follow-up task like Wallet Withdrawal arrives, ShiftCore reuses KU-201 automatically so the model does not repeat the concurrency bug. Third, if the company upgrades its security policy from POL-2026-v1 to v2, watch what happens when I click this button—all v1 knowledge units are automatically quarantined so stale patterns are never blindly reused!'
  },
  {
    number: 9,
    category: '9. FULL-STACK BACKEND & DOCKER ARCHITECTURE',
    title: 'Production-Ready Node.js + Express Backend & Ollama Docker Stack',
    subtitle: 'Real API Endpoints, SHA-256 Checkpoints, and Persistent JSON/SQLite Ledger',
    correspondingTab: 'architecture',
    bulletPoints: [
      'Full-Stack Express Server (`server.ts`): Exposes `/api/llm/status`, `/api/runtime/execute-prompt`, `/api/runtime/repair-and-seal`, and `/api/knowledge`.',
      'Local LLM Connector: Connects directly to local Ollama (`http://localhost:11434`) or LM Studio/vLLM (`http://localhost:1234/v1`) with smart deterministic fallback.',
      'Persistent Ledger (`/data/shiftcore_store.json`): Persists extracted Knowledge Units, policy hashes, and execution runs across restarts.',
      'Containerized Deployment: `docker-compose.yml` orchestrates both `shiftcore-runtime` (port 3000) and `ollama` (port 11434).'
    ],
    visualCue: 'Show the System Map (Tab 3) and the Local LLM Status indicator in the top bar.',
    speakerScript:
      'We also implemented a full Node.js Express backend (`server.ts`) and a multi-container `docker-compose.yml` with Ollama. Every prompt execution, AST audit, SHA-256 checkpoint hash, and Tier 3 knowledge unit is processed and persisted by the backend.'
  },
  {
    number: 10,
    category: '10. SUMMARY & DEFENSE Q&A',
    title: 'Complete Traceability Matrix (13/13 Provenance Records)',
    subtitle: 'Every Requirement Linked to an ADR, Target File, and Independent Test Proof',
    correspondingTab: 'traceability',
    bulletPoints: [
      '100% Traceability: 8 Requirements ↔ ADRs ↔ Multi-File AST Checkpoints ↔ 13 Provenance Records.',
      'Separation of Evidence Coverage (13/13) from Acceptance Pass Rate (7/8 pre-repair → 8/8 post-repair).',
      'Printable Formal Specification: Complete UML Metamodel, State Machine, and Sequence Diagram ready for PDF export.',
      'Ready for Live Demonstration: Ask me to run any preset SE scenario or type a custom coding prompt live!'
    ],
    visualCue: 'Show Tab 5 (Proof 13/13) and toggle between Pre-Repair (7/8) and Post-Repair (8/8).',
    speakerScript:
      'In conclusion, ShiftCore now provides the formal Abstract Software Engineering Model, real multi-file coding workflows, context-grounded elicitation, 3-Tier Knowledge reuse with policy invalidation, and a live Local LLM backend. I am happy to run any live prompt or inspect any diagram you would like.',
    professorQuestion: {
      q: 'What happens if the Local LLM server (Ollama) is offline during a demonstration or generates broken syntax?',
      a: 'Our backend (`server.ts`) implements a dual-mode connector: it probes Ollama/vLLM first, and if the local GPU daemon is unreachable or times out, it seamlessly routes through ShiftCore’s deterministic AST synthesis & verification engine so the governance state machine, checkpoints, and verification gates never fail silently.'
    }
  }
];

export const SlidesDeckModal: React.FC<SlidesDeckModalProps> = ({
  isOpen,
  onClose,
  onJumpToStage,
  onJumpToTab
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showSpeakerScript, setShowSpeakerScript] = useState<boolean>(true);

  const slide = SLIDES_DATA[currentSlideIndex];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => Math.min(SLIDES_DATA.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleJump = () => {
    if (slide.correspondingTab) {
      onJumpToTab(slide.correspondingTab);
    } else if (slide.correspondingStage !== undefined) {
      onJumpToTab('flow_studio');
      onJumpToStage(slide.correspondingStage);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-[#223149] bg-[#071020] shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="border-b border-[#1b2b43] bg-[#091528] px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-[#ff7015]/15 border border-[#ff7015]/40 text-[#ff8c42] font-mono text-xs font-bold">
              SLIDE {slide.number} OF 10
            </span>
            <div className="font-mono text-xs text-[#95a3ba] hidden sm:block">
              {slide.category}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSpeakerScript(!showSpeakerScript)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showSpeakerScript
                  ? 'bg-[#35d39a]/15 text-[#35d39a] border-[#35d39a]/40'
                  : 'bg-[#0d1c31] text-[#95a3ba] border-[#223149]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{showSpeakerScript ? 'Speaker Notes Visible' : 'Show Speaker Notes'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#95a3ba] hover:text-white hover:bg-[#14233a] transition-colors cursor-pointer"
              aria-label="Close presentation deck"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Numbers Strip */}
        <div className="bg-[#050b16] px-4 py-2 border-b border-[#182943] flex items-center gap-1.5 overflow-x-auto shrink-0">
          {SLIDES_DATA.map((s, idx) => (
            <button
              key={s.number}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                idx === currentSlideIndex
                  ? 'bg-[#ff7015] text-[#050b1a] shadow-sm'
                  : 'bg-[#0b1528] text-[#95a3ba] hover:text-white border border-[#1b2b43]'
              }`}
            >
              Slide {s.number}
            </button>
          ))}
        </div>

        {/* Slide Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <div className="font-mono text-xs font-bold text-[#ff7015] tracking-widest uppercase">
              {slide.category}
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="mt-1 text-sm text-[#95a3ba]">{slide.subtitle}</p>
          </div>

          <div className="rounded-xl border border-[#21354f] bg-[#09172a] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#c8d3e2]">
              <span className="w-2 h-2 rounded-full bg-[#ff7015] shrink-0" />
              <strong className="text-white">What to show the instructor live:</strong>
              <span>{slide.visualCue}</span>
            </div>
            {(slide.correspondingStage !== undefined || slide.correspondingTab) && (
              <button
                type="button"
                onClick={handleJump}
                className="px-3 py-1.5 rounded-lg bg-[#ff7015]/15 border border-[#ff7015]/40 text-[#ff8c42] font-mono font-bold hover:bg-[#ff7015]/25 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Jump to this view in live app</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-[#1d2e48] bg-[#0b1528] p-5 space-y-3">
            <div className="font-mono text-[11px] font-bold text-[#60a5fa] uppercase">
              Key Defense Points
            </div>
            <ul className="space-y-2 text-sm text-[#e2e8f0]">
              {slide.bulletPoints.map((bp) => (
                <li key={bp} className="flex items-start gap-2.5">
                  <span className="text-[#ff7015] font-bold text-base leading-tight">•</span>
                  <span className="leading-relaxed">{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          {showSpeakerScript && (
            <div className="rounded-2xl border border-[#35d39a]/40 bg-gradient-to-r from-[#35d39a]/10 to-[#0a1426] p-5 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#35d39a]">
                <Volume2 className="w-4 h-4" />
                <span>WHAT TO SAY TO YOUR INSTRUCTOR (DEFENSE SCRIPT):</span>
              </div>
              <p className="text-sm text-[#f1f5f9] leading-relaxed italic bg-[#060e1c]/60 p-4 rounded-xl border border-[#20364f]">
                "{slide.speakerScript}"
              </p>
            </div>
          )}

          {slide.professorQuestion && (
            <div className="rounded-2xl border border-[#ff7015]/40 bg-[#ff7015]/8 p-5 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ff8c42]">
                <HelpCircle className="w-4 h-4" />
                <span>EXPECTED INSTRUCTOR QUESTION & ANSWER:</span>
              </div>
              <div className="text-xs text-white font-bold">
                Q: "{slide.professorQuestion.q}"
              </div>
              <div className="text-xs text-[#c8d3e2] leading-relaxed pl-4 border-l-2 border-[#ff7015]">
                A: {slide.professorQuestion.a}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-[#1b2b43] bg-[#071020] px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            disabled={currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl border border-[#223149] bg-[#0b1528] text-xs font-bold text-white hover:border-[#60a5fa] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          <div className="font-mono text-xs text-[#95a3ba]">
            Use <kbd className="px-1.5 py-0.5 rounded bg-[#13233a] text-white">←</kbd> and{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#13233a] text-white">→</kbd> arrow keys
          </div>

          <button
            type="button"
            disabled={currentSlideIndex === SLIDES_DATA.length - 1}
            onClick={() => setCurrentSlideIndex((prev) => Math.min(SLIDES_DATA.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl bg-[#ff7015] hover:bg-[#ff812f] text-[#050b1a] text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
