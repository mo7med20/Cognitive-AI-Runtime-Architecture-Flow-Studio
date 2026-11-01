export type StageIndex = 0 | 1 | 2 | 3 | 4;

export type DependencyCategory =
  | 'control_flow'
  | 'data_payload'
  | 'policy_constraint'
  | 'feedback_repair'
  | 'audit_provenance';

export type ArchitectureLayer =
  | 'presentation_intake'
  | 'cognitive_control'
  | 'execution_verification'
  | 'persistence_memory';

export interface SystemComponentNode {
  id: string;
  code: string;
  name: string;
  arabicTitle: string;
  layer: ArchitectureLayer;
  layerLabel: string;
  techStack: string;
  summary: string;
  architecturalRole: string;
  inputs: string[];
  outputs: string[];
  dbTables: string[];
  activeInStages: StageIndex[];
  x: number;
  y: number;
}

export interface DataDependencyEdge {
  id: string;
  from: string;
  to: string;
  payloadName: string;
  schemaSummary: string;
  category: DependencyCategory;
  activeInStages: StageIndex[];
  isRepairLoop?: boolean;
  description: string;
}

export interface RequirementTraceItem {
  id: string;
  code: string;
  requirement: string;
  origin: 'USER_EXPLICIT' | 'USER_CLARIFIED' | 'RUNTIME_QUALITY' | 'WORKSPACE_POLICY';
  originLabel: string;
  decisionId: string;
  decisionSummary: string;
  evidenceId: string;
  evidenceType: string;
  evidenceDetail: string;
  componentId: string;
  statusBeforeRepair: 'PASS' | 'FAIL';
  statusAfterRepair: 'PASS';
  failureOutput?: string;
  repairedOutput?: string;
}

export interface EvidenceRecordItem {
  id: string;
  index: number;
  category: 'SPEC_AND_DECISION' | 'BUILD_AND_POLICY' | 'ACCEPTANCE_TEST' | 'BOUNDARY_GATE';
  categoryLabel: string;
  title: string;
  linkedReqOrRule: string;
  producerComponentId: string;
  stageCaptured: StageIndex;
  provenanceSource: string;
  verdictBeforeRepair: 'RECORDED_PASS' | 'RECORDED_FAIL';
  verdictAfterRepair: 'RECORDED_PASS';
  detail: string;
}

export interface PolicyDispositionItem {
  disposition: 'ALLOWED' | 'MODIFIED' | 'HELD_FOR_HUMAN' | 'PROHIBITED';
  badgeColor: 'emerald' | 'blue' | 'orange' | 'rose';
  calculatorTarget: string;
  ruleOrContextSource: string;
  runtimeAction: string;
  moduleId: string;
}

export interface ArchitecturalDecision {
  id: string;
  title: string;
  authority: 'USER_CLARIFICATION' | 'WORKSPACE_PREFERENCE' | 'RUNTIME_ARCHITECT' | 'MANDATORY_POLICY';
  authorityLabel: string;
  rationale: string;
  alternativesRejected: string;
  dependedOnContext: string[];
  producedArtifact: string;
}

export interface StageArchitectureStepNode {
  stepCode: string;
  fromModuleCode: string;
  toModuleCode: string;
  moduleId: string;
  title: string;
  calculatorDataIn: string;
  runtimeOperation: string;
  calculatorDataOut: string;
  dbTableAction: string;
  tone: 'orange' | 'blue' | 'emerald' | 'rose';
}

export interface SimulationState {
  scenarioId: string;
  currentStage: StageIndex;
  clarifiedPlatform: 'web' | 'desktop' | null;
  repaired: boolean;
  selectedComponentId: string;
  selectedDependencyFilter: DependencyCategory | 'all';
}

export interface StageDefinition {
  index: StageIndex;
  stepNumber: number;
  id: string;
  shortTitle: string;
  arabicTitle: string;
  kicker: string;
  questionTitle: string;
  defaultStatus: string;
  resolvedStatus: string;
  abstractPhaseMapping: string;
  primaryComponents: string[];
  activeEdgeIds: string[];
  keyTakeaway: string;
}

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    index: 0,
    stepNumber: 1,
    id: 'screenUnderstand',
    shortTitle: 'Understand',
    arabicTitle: '١. الفهم وتحليل السياق',
    kicker: 'STEP 1 · UNDERSTAND (CALCULATOR INTAKE, CONTEXT & AMBIGUITY GATE)',
    questionTitle: 'What did the Runtime understand — and what requires human clarification?',
    defaultStatus: 'NEEDS 1 DECISION',
    resolvedStatus: 'CLARIFIED · TASK SPEC v1 LOCKED',
    abstractPhaseMapping: 'Task Intake → Context, Policy & Experience Retrieval → Requirement Analysis',
    primaryComponents: ['comp_intake', 'comp_policy', 'comp_experience', 'comp_analyzer'],
    activeEdgeIds: ['edge_prompt_intake', 'edge_policy_analyzer', 'edge_exp_analyzer', 'edge_intake_analyzer', 'edge_clarify_loop'],
    keyTakeaway:
      'For «اعمل آلة حاسبة», the Runtime retrieves TypeScript preference, no-eval() security policy, and 0 pgvector matches, then halts on the material Web vs. Desktop decision.'
  },
  {
    index: 1,
    stepNumber: 2,
    id: 'screenPlan',
    shortTitle: 'Plan',
    arabicTitle: '٢. التخطيط الواعي بالسياسات',
    kicker: 'STEP 2 · PLAN (CALCULATOR STACK SELECTION & COMPLETION CONTRACT)',
    questionTitle: 'What will the Runtime execute — and what data dependencies justify each choice?',
    defaultStatus: 'PLAN READY',
    resolvedStatus: 'PLAN READY',
    abstractPhaseMapping: 'Policy-Aware Planning → Capability Selection → Completion Contract Synthesis',
    primaryComponents: ['comp_analyzer', 'comp_policy', 'comp_planner'],
    activeEdgeIds: ['edge_analyzer_planner', 'edge_policy_planner', 'edge_planner_orchestrator'],
    keyTakeaway:
      'Combines the 7 user calculator requirements with 1 Runtime-injected quality requirement (safe zero-division) and selects Vanilla TS + Vite over React/Next.js.'
  },
  {
    index: 2,
    stepNumber: 3,
    id: 'screenWork',
    shortTitle: 'Work',
    arabicTitle: '٣. التنفيذ الواعي بالحالة',
    kicker: 'STEP 3 · WORK (CALCULATOR SANDBOX EXECUTION & STATUS SPLIT)',
    questionTitle: 'Why does Task Status remain VERIFYING when the AI Agent reports COMPLETE?',
    defaultStatus: 'VERIFYING',
    resolvedStatus: 'VERIFYING',
    abstractPhaseMapping: 'Controlled State-Aware Execution → Provenance & Evidence Collection',
    primaryComponents: ['comp_planner', 'comp_orchestrator', 'comp_evidence', 'comp_verifier'],
    activeEdgeIds: ['edge_planner_orchestrator', 'edge_orch_evidence', 'edge_orch_verifier'],
    keyTakeaway:
      'Agent finishes creating 5 calculator files across 12 events (Agent = IMPLEMENTATION COMPLETE), while the Runtime retains Checkpoint #S3-01 and holds Task Status at VERIFYING.'
  },
  {
    index: 3,
    stepNumber: 4,
    id: 'screenCheck',
    shortTitle: 'Check',
    arabicTitle: '٤. التحقق المستقل والإصلاح الموجّه',
    kicker: 'STEP 4 · CHECK (CALCULATOR VERIFICATION GATE & SURGICAL REPAIR)',
    questionTitle: 'Did the calculator pass deterministic checks — or must the Gate block & repair?',
    defaultStatus: '1 REQUIRED FAILURE',
    resolvedStatus: 'RE-VERIFIED (8/8)',
    abstractPhaseMapping: 'Deterministic Verification → Targeted State-Aware Repair → Re-Verification Gate',
    primaryComponents: ['comp_verifier', 'comp_evidence', 'comp_orchestrator', 'comp_policy'],
    activeEdgeIds: ['edge_evidence_verifier', 'edge_repair_loop', 'edge_orch_verifier', 'edge_verifier_gate'],
    keyTakeaway:
      'Collects 13/13 calculator evidence records but blocks completion on 7/8 acceptance checks when 8 ÷ 0 returns Infinity (DIV-ZERO-01), then applies a surgical zero-guard fix.'
  },
  {
    index: 4,
    stepNumber: 5,
    id: 'screenResult',
    shortTitle: 'Result',
    arabicTitle: '٥. الاعتماد وحفظ الخبرة الموثّقة',
    kicker: 'STEP 5 · RESULT (VERIFIED CALCULATOR RELEASE & PGVECTOR EXPERIENCE)',
    questionTitle: 'Can I trust the calculator result — and what proves it?',
    defaultStatus: 'VERIFIED COMPLETE',
    resolvedStatus: 'VERIFIED COMPLETE',
    abstractPhaseMapping: 'Completion Evaluation → Audit Ledger Sealing → Controlled Experience Indexing (pgvector)',
    primaryComponents: ['comp_verifier', 'comp_evidence', 'comp_experience'],
    activeEdgeIds: ['edge_verifier_gate', 'edge_gate_experience', 'edge_evidence_verifier'],
    keyTakeaway:
      'Delivers the verified Calculator Web Application (Artifact v1.1) with 8/8 checks and 13/13 evidence records, and indexes the verified pattern + division-guard into pgvector.'
  }
];

export const SYSTEM_COMPONENTS: SystemComponentNode[] = [
  {
    id: 'comp_intake',
    code: 'MOD-01',
    name: 'Task Intake & Context Gateway',
    arabicTitle: 'بوابة استقبال مهمة الآلة الحاسبة والسياق',
    layer: 'presentation_intake',
    layerLabel: 'Layer 1 · Interaction & Context Gateway',
    techStack: 'React 19 + TypeScript · FastAPI Ingress',
    summary: 'Captures raw user prompt («اعمل آلة حاسبة»), detects Node.js in workspace, and receives the user’s Web platform choice.',
    architecturalRole:
      'Normalizes the Arabic prompt «اعمل آلة حاسبة» into TaskRequest #TASK-001 and binds the local Node.js workspace descriptor.',
    inputs: ['Raw Prompt: “اعمل آلة حاسبة”', 'Workspace Runtime: Node.js', 'User Platform Choice: “Web”'],
    outputs: ['TaskRequest Envelope (#TASK-001)', 'ClarificationDelta (platform="Web")'],
    dbTables: ['tasks', 'workspace_contexts'],
    activeInStages: [0],
    x: 28,
    y: 62
  },
  {
    id: 'comp_policy',
    code: 'MOD-02',
    name: 'Policy & Constraint Engine',
    arabicTitle: 'محرك السياسات والقيود المؤسسية',
    layer: 'cognitive_control',
    layerLabel: 'Layer 2 · Cognitive Analysis & Governance',
    techStack: 'Python / FastAPI · Static AST Policy Scanner',
    summary: 'Separates non-binding preference (TypeScript) from mandatory calculator rules (eval() prohibited, build + checks, local scope).',
    architecturalRole:
      'Evaluates calculator planning and code actions against workspace rules: Allowed (TS/Vite), Modified (+1 Div-Zero rule), Held (Web vs Desktop), Prohibited (eval()).',
    inputs: ['Preference: TypeScript', 'Safety Rule: eval() prohibited', 'Quality Rule: Build + critical checks'],
    outputs: ['PolicyConstraintMatrix (4 Mandatory Rules)', 'Static AST Scan Certificate (EVID-04: 0 eval())'],
    dbTables: ['policy_definitions', 'policy_evaluations'],
    activeInStages: [0, 1, 3],
    x: 28,
    y: 215
  },
  {
    id: 'comp_experience',
    code: 'MOD-03',
    name: 'Controlled Experience Store',
    arabicTitle: 'مخزن الخبرات المحكوم (pgvector)',
    layer: 'persistence_memory',
    layerLabel: 'Layer 4 · Audit Ledger & Vector Memory',
    techStack: 'PostgreSQL 16 + pgvector',
    summary: 'Step 1: Reports 0 relevant prior patterns for calculator. Step 5: Stores the verified TS Web Calculator + zero-division guard.',
    architecturalRole:
      'Prevents blind snippet reuse in Step 1 when no trusted pattern matches; in Step 5 indexes the verified calculator pattern under strict context and policy guards.',
    inputs: ['Calculator Task Embedding Vector', 'Active Policy Hash', 'Verified Calculator Seal (Step 5)'],
    outputs: ['Step 1: None relevant (0 reused)', 'Step 5: Saved Experience EXP-VEC-2026-001'],
    dbTables: ['experience_vectors', 'experience_reuse_audit'],
    activeInStages: [0, 4],
    x: 28,
    y: 368
  },
  {
    id: 'comp_analyzer',
    code: 'MOD-04',
    name: 'Requirement & Ambiguity Analyzer',
    arabicTitle: 'محلل متطلبات الآلة الحاسبة وحسم الغموض',
    layer: 'cognitive_control',
    layerLabel: 'Layer 2 · Cognitive Analysis & Governance',
    techStack: 'Python / FastAPI · Ambiguity Classifier',
    summary: 'Detects that “اعمل آلة حاسبة” lacks a target platform (Web vs Desktop), asks the user, and locks 7 User Reqs + 1 Quality Req.',
    architecturalRole:
      'Halts calculator planning until the user selects Web, then synthesizes TaskSpec v1 combining 7 user arithmetic/UI requirements with 1 Runtime quality condition (Safe invalid division).',
    inputs: ['TaskRequest (“اعمل آلة حاسبة”)', 'PolicyConstraintMatrix', 'User Clarification (“Web”)'],
    outputs: ['Blocking Question: “Where should the calculator run?”', 'TaskSpec v1 (8 Calculator Requirements)'],
    dbTables: ['task_specifications', 'clarification_events'],
    activeInStages: [0, 1],
    x: 302,
    y: 130
  },
  {
    id: 'comp_planner',
    code: 'MOD-05',
    name: 'Policy-Aware Planner & Router',
    arabicTitle: 'مخطط الآلة الحاسبة وموجّه التقنيات',
    layer: 'cognitive_control',
    layerLabel: 'Layer 2 · Cognitive Analysis & Governance',
    techStack: 'Python / FastAPI · Capability Router',
    summary: 'Builds the 5-step Calculator Plan, selects Vanilla TS + Vite & No Backend, and records why React and Next.js were rejected.',
    architecturalRole:
      'Matches calculator complexity (small single-view app, no routing/SSR/DB) to the minimal safe stack and constructs the Calculator Completion Contract.',
    inputs: ['TaskSpec v1 (8 Calculator Reqs)', 'ExecutionGuardrails (Local only, no eval())'],
    outputs: ['5-Step Calculator Plan', '4 Recorded Decisions (Why?)', 'Calculator Completion Contract'],
    dbTables: ['execution_plans', 'architectural_decisions'],
    activeInStages: [1, 2],
    x: 576,
    y: 130
  },
  {
    id: 'comp_orchestrator',
    code: 'MOD-06',
    name: 'State-Aware Execution Orchestrator',
    arabicTitle: 'منسق تنفيذ الآلة الحاسبة الواعي بالحالة',
    layer: 'execution_verification',
    layerLabel: 'Layer 3 · Execution, Verification & Gate',
    techStack: 'Python / FastAPI · Local Node.js Sandbox',
    summary: 'Generates 5 calculator files across 12 execution events, holds Task Status at VERIFYING, and applies the surgical 8÷0 guard on Checkpoint #S3-01.',
    architecturalRole:
      'Separates Agent Status (IMPLEMENTATION COMPLETE) from Task Status (VERIFYING) and retains Checkpoint #S3-01 so DIV-ZERO-01 is fixed surgically without restarting.',
    inputs: ['Calculator ExecutionDAG', 'TargetedRepairDirective (add v === 0 guard)'],
    outputs: ['Calculator Artifact v1.0 (5 files) → v1.1 (Guarded)', 'Retained Checkpoint #S3-01'],
    dbTables: ['execution_attempts', 'state_snapshots'],
    activeInStages: [2, 3],
    x: 576,
    y: 325
  },
  {
    id: 'comp_evidence',
    code: 'MOD-07',
    name: 'Evidence & Provenance Ledger',
    arabicTitle: 'سجل أدلة الآلة الحاسبة (13/13 Provenance)',
    layer: 'persistence_memory',
    layerLabel: 'Layer 4 · Audit Ledger & Vector Memory',
    techStack: 'PostgreSQL 16 Immutable Ledger',
    summary: 'Captures all 13 calculator provenance records (Spec, 4 ADRs, Build, AST no-eval scan, Scope check, and 8 Calculator test traces).',
    architecturalRole:
      'Proves that Evidence Coverage (13/13) is separate from Acceptance Pass Rate (7/8): failing test DIV-ZERO-01 (8÷0 → Infinity) is preserved as immutable audit evidence.',
    inputs: ['Vite/TSC Build Logs (5 files)', 'AST Scan (0 eval())', '8 Calculator Test Traces (including DIV-ZERO-01)'],
    outputs: ['EvidenceBundle (13/13 Linked Calculator Records)', 'Requirement → Decision → Evidence Lineage'],
    dbTables: ['evidence_records', 'claim_provenance_links'],
    activeInStages: [2, 3, 4],
    x: 302,
    y: 368
  },
  {
    id: 'comp_verifier',
    code: 'MOD-08',
    name: 'Independent Verifier & Gate',
    arabicTitle: 'المتحقق المستقل وبوابة اعتماد الآلة الحاسبة',
    layer: 'execution_verification',
    layerLabel: 'Layer 3 · Execution, Verification & Gate',
    techStack: 'Deterministic Calculator Test Runner · Completion Gate',
    summary: 'Tests all 8 calculator behaviors; blocks completion on 8 ÷ 0 = Infinity (7/8); triggers surgical repair; seals 8/8 Verified Complete.',
    architecturalRole:
      'Enforces the Completion Rule (“No unresolved required failure”): blocks Artifact v1.0 on DIV-ZERO-01, verifies repaired Artifact v1.1 (8÷0 → Error), and unlocks Step 5.',
    inputs: ['Calculator Artifact v1.0 / v1.1', 'Calculator Completion Contract', '13/13 Evidence Records'],
    outputs: ['Pre-Repair: BLOCKED (7/8 ✕)', 'TargetedRepairDirective (to MOD-06)', 'Post-Repair: VERIFIED COMPLETE (8/8 ✓)'],
    dbTables: ['verification_outcomes', 'completion_gates'],
    activeInStages: [2, 3, 4],
    x: 850,
    y: 225
  }
];

/**
 * Stage-by-Stage Architectural Execution Flow for the Calculator Task («اعمل آلة حاسبة»).
 * Maps each of the 5 user steps directly to the exact internal runtime modules, data payloads, and DB writes.
 */
export const STAGE_CALCULATOR_FLOWS: Record<StageIndex, StageArchitectureStepNode[]> = {
  0: [
    {
      stepCode: '1.1',
      fromModuleCode: 'USER',
      toModuleCode: 'MOD-01',
      moduleId: 'comp_intake',
      title: 'Calculator Prompt Intake & Workspace Detection',
      calculatorDataIn: 'Raw Prompt: «اعمل آلة حاسبة»',
      runtimeOperation: 'Normalizes prompt into software_dev task & detects Node.js in workspace.',
      calculatorDataOut: 'TaskRequest Envelope (#TASK-001)',
      dbTableAction: 'INSERT INTO tasks, workspace_contexts',
      tone: 'orange'
    },
    {
      stepCode: '1.2',
      fromModuleCode: 'MOD-02 + MOD-03',
      toModuleCode: 'MOD-04',
      moduleId: 'comp_policy',
      title: 'Policy vs. Preference & pgvector Experience Check',
      calculatorDataIn: 'Workspace Rules + pgvector Query',
      runtimeOperation:
        'Loads TypeScript (preference), eval() prohibited (mandatory rule), and checks pgvector (0 prior calculator matches).',
      calculatorDataOut: 'PolicyConstraintMatrix + ExperienceMatch(0)',
      dbTableAction: 'SELECT policy_definitions, experience_vectors',
      tone: 'blue'
    },
    {
      stepCode: '1.3',
      fromModuleCode: 'MOD-04',
      toModuleCode: 'USER GATE',
      moduleId: 'comp_analyzer',
      title: 'Material Ambiguity Gate: Web vs. Desktop Calculator',
      calculatorDataIn: 'Goal: Calculator application (Platform missing)',
      runtimeOperation:
        'Halts planning because Web vs. Desktop changes the product itself; once user selects Web, locks TaskSpec v1.',
      calculatorDataOut: 'TaskSpec v1 (7 User Reqs + 1 Safe Division Req)',
      dbTableAction: 'INSERT INTO clarification_events, task_specifications',
      tone: 'emerald'
    }
  ],
  1: [
    {
      stepCode: '2.1',
      fromModuleCode: 'MOD-04',
      toModuleCode: 'MOD-05',
      moduleId: 'comp_analyzer',
      title: 'Requirement Origin Synthesis (7 User + 1 Runtime Quality)',
      calculatorDataIn: '7 User Reqs (Add, Sub, Mul, Div, Dec, Clear, Kbd)',
      runtimeOperation:
        'Appends Runtime Quality Requirement REQ-08 (Invalid division must fail safely instead of Infinity).',
      calculatorDataOut: 'Locked 8-Requirement Specification',
      dbTableAction: 'UPDATE task_specifications SET req_count = 8',
      tone: 'blue'
    },
    {
      stepCode: '2.2',
      fromModuleCode: 'MOD-05',
      toModuleCode: 'MOD-05',
      moduleId: 'comp_planner',
      title: 'Calculator Stack Selection & Rejected Alternatives',
      calculatorDataIn: 'Scope: Small single-screen calculator, no SSR/DB',
      runtimeOperation:
        'Selects Vanilla TypeScript + Vite & No Backend; explicitly rejects React and Next.js as unnecessary overhead.',
      calculatorDataOut: '4 Recorded Decisions (ADR-01..04 with "Why?")',
      dbTableAction: 'INSERT INTO architectural_decisions (4 rows)',
      tone: 'orange'
    },
    {
      stepCode: '2.3',
      fromModuleCode: 'MOD-05 + MOD-02',
      toModuleCode: 'MOD-06',
      moduleId: 'comp_planner',
      title: 'Calculator Completion Contract & Execution DAG',
      calculatorDataIn: '5-Step Plan + 4 Workspace Rules',
      runtimeOperation:
        'Binds execution path (Init → Core → UI → Kbd → Error guard → Tests → Build) to verification path.',
      calculatorDataOut: 'Calculator ExecutionDAG + CompletionContract',
      dbTableAction: 'INSERT INTO execution_plans',
      tone: 'emerald'
    }
  ],
  2: [
    {
      stepCode: '3.1',
      fromModuleCode: 'MOD-05',
      toModuleCode: 'MOD-06',
      moduleId: 'comp_orchestrator',
      title: 'Local Sandbox Code Generation & Vite Build',
      calculatorDataIn: 'ExecutionDAG (Vanilla TS + Vite Calculator)',
      runtimeOperation:
        'Creates 5 calculator files (index.html, src/*, tests/*) across 12 execution events; retains Checkpoint #S3-01.',
      calculatorDataOut: 'Candidate Calculator Artifact v1.0',
      dbTableAction: 'INSERT INTO execution_attempts, state_snapshots',
      tone: 'blue'
    },
    {
      stepCode: '3.2',
      fromModuleCode: 'MOD-06',
      toModuleCode: 'MOD-08',
      moduleId: 'comp_orchestrator',
      title: 'Authoritative Status Split (Agent vs. Runtime)',
      calculatorDataIn: 'Agent Signal: "IMPLEMENTATION COMPLETE"',
      runtimeOperation:
        'Prevents premature completion: keeps TASK-001 status at VERIFYING while MOD-08 checks all 8 calculator requirements.',
      calculatorDataOut: 'Agent = COMPLETE · Runtime Task = VERIFYING',
      dbTableAction: 'UPDATE tasks SET status = "VERIFYING"',
      tone: 'orange'
    },
    {
      stepCode: '3.3',
      fromModuleCode: 'MOD-06 + MOD-02',
      toModuleCode: 'MOD-07',
      moduleId: 'comp_evidence',
      title: 'Provenance Capture & Static AST Policy Scan',
      calculatorDataIn: 'Build Logs + AST Scan (0 eval()) + 8 Test Traces',
      runtimeOperation:
        'Verifies 5/5 runtime policy checks (local scope, no eval()) and records all 13 provenance items in PostgreSQL.',
      calculatorDataOut: 'EvidenceBundle (13/13 Provenance Records)',
      dbTableAction: 'INSERT INTO evidence_records (13 rows)',
      tone: 'emerald'
    }
  ],
  3: [
    {
      stepCode: '4.1',
      fromModuleCode: 'MOD-07',
      toModuleCode: 'MOD-08',
      moduleId: 'comp_verifier',
      title: 'Independent Deterministic Check of 8 Calculator Behaviors',
      calculatorDataIn: 'Artifact v1.0 + 13/13 Evidence Records',
      runtimeOperation:
        '7 user checks PASS, but boundary check DIV-ZERO-01 (8 ÷ 0) returns raw "Infinity" instead of controlled "Error".',
      calculatorDataOut: '7/8 Acceptance Passed ✕ · Gate BLOCKED',
      dbTableAction: 'INSERT INTO verification_outcomes (status="BLOCKED")',
      tone: 'rose'
    },
    {
      stepCode: '4.2',
      fromModuleCode: 'MOD-08',
      toModuleCode: 'MOD-06',
      moduleId: 'comp_orchestrator',
      title: 'Surgical State-Aware Repair on Checkpoint #S3-01',
      calculatorDataIn: 'TargetedRepairDirective (DIV-ZERO-01)',
      runtimeOperation:
        'Patches only calculator division logic: adds `if (op === "÷" && v === 0) display = "Error"` without full restart.',
      calculatorDataOut: 'Patched Calculator Artifact v1.1',
      dbTableAction: 'UPDATE state_snapshots (#S3-01 -> #S3-02)',
      tone: 'orange'
    },
    {
      stepCode: '4.3',
      fromModuleCode: 'MOD-06',
      toModuleCode: 'MOD-08',
      moduleId: 'comp_verifier',
      title: 'Targeted Re-Verification & Regression Suite',
      calculatorDataIn: 'Patched Artifact v1.1 + Regression Tests',
      runtimeOperation:
        'Re-evaluates 8 ÷ 0 → "Error" (PASS) and confirms all 7 arithmetic/UI/keyboard checks remain 100% passing.',
      calculatorDataOut: '8/8 Acceptance Checks Passed ✓ · Gate UNLOCKED',
      dbTableAction: 'UPDATE completion_gates SET status = "PASSED"',
      tone: 'emerald'
    }
  ],
  4: [
    {
      stepCode: '5.1',
      fromModuleCode: 'MOD-08',
      toModuleCode: 'MOD-07',
      moduleId: 'comp_verifier',
      title: 'Verified Completion Seal & Provenance Certificate',
      calculatorDataIn: '8/8 Reqs · 8/8 Checks · 4/4 Rules · 13/13 Evidence',
      runtimeOperation:
        'Seals immutable audit certificate proving why the Calculator task is verified complete with 0 unresolved issues.',
      calculatorDataOut: 'VerifiedCompletionSeal (#SEAL-CALC-001)',
      dbTableAction: 'INSERT INTO completion_gates (sealed=true)',
      tone: 'emerald'
    },
    {
      stepCode: '5.2',
      fromModuleCode: 'MOD-08',
      toModuleCode: 'MOD-03',
      moduleId: 'comp_experience',
      title: 'Controlled Experience Indexing in pgvector',
      calculatorDataIn: 'Verified TS Web Calculator + DIV-ZERO-01 Guard',
      runtimeOperation:
        'Saves pattern to pgvector; future tasks will reuse it ONLY when context, quality, and active policies match.',
      calculatorDataOut: 'Experience Record EXP-VEC-2026-001',
      dbTableAction: 'INSERT INTO experience_vectors (pgvector)',
      tone: 'blue'
    },
    {
      stepCode: '5.3',
      fromModuleCode: 'MOD-08',
      toModuleCode: 'USER',
      moduleId: 'comp_verifier',
      title: 'Release of Interactive Calculator Web Application',
      calculatorDataIn: 'Verified Calculator Artifact v1.1',
      runtimeOperation:
        'Delivers the working Calculator Web App with guarded division (8 ÷ 0 → Error), keyboard input, and full audit proof.',
      calculatorDataOut: 'Live Calculator Artifact Ready for Use',
      dbTableAction: 'UPDATE tasks SET status = "VERIFIED_COMPLETE"',
      tone: 'orange'
    }
  ]
};

export const DATA_DEPENDENCY_EDGES: DataDependencyEdge[] = [
  {
    id: 'edge_prompt_intake',
    from: 'comp_intake',
    to: 'comp_analyzer',
    payloadName: 'TaskRequest Envelope',
    schemaSummary: '{ prompt: "اعمل آلة حاسبة", domain: "software_dev", env: "Node.js" }',
    category: 'data_payload',
    activeInStages: [0],
    description: 'Delivers raw Arabic calculator prompt and detected Node.js workspace capability to the Requirement Analyzer.'
  },
  {
    id: 'edge_policy_analyzer',
    from: 'comp_policy',
    to: 'comp_analyzer',
    payloadName: 'PolicyConstraintMatrix',
    schemaSummary: '{ mandatory: ["NO_EVAL", "BUILD_AND_CHECK"], preferences: ["TYPESCRIPT"] }',
    category: 'policy_constraint',
    activeInStages: [0, 1],
    description: 'Injects mandatory security constraints (no eval()) and non-binding preferences (TypeScript) into calculator analysis.'
  },
  {
    id: 'edge_exp_analyzer',
    from: 'comp_experience',
    to: 'comp_analyzer',
    payloadName: 'ExperienceQueryResponse',
    schemaSummary: '{ matchedVectors: 0, reason: "No prior verified calculator pattern matches context" }',
    category: 'data_payload',
    activeInStages: [0],
    description: 'Queries pgvector for prior calculator experiences; returns 0 trusted matches so the Runtime does not hallucinate reuse.'
  },
  {
    id: 'edge_intake_analyzer',
    from: 'comp_analyzer',
    to: 'comp_intake',
    payloadName: 'ClarificationGate (Web vs Desktop)',
    schemaSummary: '{ blockingQuestion: "Where should the calculator run?", options: ["Web", "Desktop"] }',
    category: 'control_flow',
    activeInStages: [0],
    description: 'Halts calculator planning until the user resolves the material platform ambiguity.'
  },
  {
    id: 'edge_clarify_loop',
    from: 'comp_intake',
    to: 'comp_analyzer',
    payloadName: 'ClarificationDelta',
    schemaSummary: '{ selectedPlatform: "Web", clarifiedBy: "USER", timestamp: "T+02s" }',
    category: 'control_flow',
    activeInStages: [0, 1],
    description: 'Supplies the user-confirmed target platform ("Web") to unlock Calculator TaskSpec v1.'
  },
  {
    id: 'edge_analyzer_planner',
    from: 'comp_analyzer',
    to: 'comp_planner',
    payloadName: 'TaskSpec v1 (8 Calculator Reqs)',
    schemaSummary: '{ userReqs: 7, runtimeQualityReqs: ["SAFE_DIV_BY_ZERO"], status: "LOCKED" }',
    category: 'data_payload',
    activeInStages: [1],
    description: 'Passes the 7 user calculator requirements plus the 1 Runtime-injected safe-division requirement to the Planner.'
  },
  {
    id: 'edge_policy_planner',
    from: 'comp_policy',
    to: 'comp_planner',
    payloadName: 'ExecutionGuardrails',
    schemaSummary: '{ sandbox: "LOCAL_ONLY", externalDeploy: false, forbidDynamicCode: true }',
    category: 'policy_constraint',
    activeInStages: [1],
    description: 'Binds workspace guardrails into the Calculator Execution Plan and Completion Contract.'
  },
  {
    id: 'edge_planner_orchestrator',
    from: 'comp_planner',
    to: 'comp_orchestrator',
    payloadName: 'ExecutionDAG & Stack Decisions',
    schemaSummary: '{ stack: "Vanilla TS + Vite", rejected: ["React", "Next.js"], backend: "NONE" }',
    category: 'control_flow',
    activeInStages: [1, 2],
    description: 'Dispatches the calculator build plan and justified architectural decisions to the State-Aware Orchestrator.'
  },
  {
    id: 'edge_orch_evidence',
    from: 'comp_orchestrator',
    to: 'comp_evidence',
    payloadName: 'ExecutionTelemetry & Provenance (13 items)',
    schemaSummary: '{ filesCreated: 5, executionEvents: 12, policyChecks: 5, testTraces: 8 }',
    category: 'audit_provenance',
    activeInStages: [2, 3],
    description: 'Streams immutable calculator build logs, AST scan results, and test evidence records into PostgreSQL.'
  },
  {
    id: 'edge_orch_verifier',
    from: 'comp_orchestrator',
    to: 'comp_verifier',
    payloadName: 'CandidateArtifact & AgentState',
    schemaSummary: '{ agentReported: "COMPLETE", runtimeState: "VERIFYING", artifactVer: "v1.0" }',
    category: 'data_payload',
    activeInStages: [2, 3],
    description: 'Hands off the compiled calculator artifact for independent deterministic verification.'
  },
  {
    id: 'edge_evidence_verifier',
    from: 'comp_evidence',
    to: 'comp_verifier',
    payloadName: 'EvidenceBundle (13/13 Provenance)',
    schemaSummary: '{ coverage: "13/13", failingEvidenceIds: ["DIV-ZERO-01"] }',
    category: 'audit_provenance',
    activeInStages: [3, 4],
    description: 'Supplies linked calculator evidence records to the Completion Gate so every claim is backed by deterministic proof.'
  },
  {
    id: 'edge_repair_loop',
    from: 'comp_verifier',
    to: 'comp_orchestrator',
    payloadName: 'TargetedRepairDirective (DIV-ZERO-01)',
    schemaSummary: '{ failedCheck: "8 ÷ 0 -> Infinity", targetScope: "calc_division_guard_only", preserveState: true }',
    category: 'feedback_repair',
    activeInStages: [3],
    isRepairLoop: true,
    description: 'Triggers surgical state-aware repair on the calculator division handler without losing execution state or restarting.'
  },
  {
    id: 'edge_verifier_gate',
    from: 'comp_verifier',
    to: 'comp_evidence',
    payloadName: 'VerifiedCompletionSeal',
    schemaSummary: '{ requirements: "8/8", checks: "8/8", policies: "4/4", evidence: "13/13", issues: 0 }',
    category: 'audit_provenance',
    activeInStages: [4],
    description: 'Seals the final calculator audit trace in PostgreSQL once all 8 acceptance checks and 4 policy checks pass.'
  },
  {
    id: 'edge_gate_experience',
    from: 'comp_verifier',
    to: 'comp_experience',
    payloadName: 'VerifiedExperienceVector',
    schemaSummary: '{ context: "TS Web Calculator", repairedTrap: "DIV-ZERO-01 Guard", reusePolicy: "STRICT_CONTEXT_MATCH" }',
    category: 'data_payload',
    activeInStages: [4],
    description: 'Indexes the verified calculator pattern and repaired division guard into pgvector for controlled future reuse.'
  }
];

export const POLICY_GOVERNANCE_DISPOSITIONS: PolicyDispositionItem[] = [
  {
    disposition: 'ALLOWED',
    badgeColor: 'emerald',
    calculatorTarget: 'TypeScript + Vanilla Vite Calculator Stack & Local Build',
    ruleOrContextSource: 'Workspace Preference + Node.js Capability',
    runtimeAction: 'Permitted without human interruption; recorded as a workspace preference (not a mandatory rule).',
    moduleId: 'comp_policy'
  },
  {
    disposition: 'MODIFIED',
    badgeColor: 'blue',
    calculatorTarget: 'Calculator TaskSpec v1 (+1 Safe Division Rule)',
    ruleOrContextSource: 'Runtime Quality Rule (QUAL-POL-02)',
    runtimeAction: 'Automatically injects REQ-08 (8 ÷ 0 must return controlled "Error" instead of Infinity) alongside the 7 user items.',
    moduleId: 'comp_analyzer'
  },
  {
    disposition: 'HELD_FOR_HUMAN',
    badgeColor: 'orange',
    calculatorTarget: 'Calculator Target Platform (Web vs. Desktop)',
    ruleOrContextSource: 'Material Ambiguity Gate (MOD-04)',
    runtimeAction: 'Halts planning in Step 1 and asks the user because Web vs. Desktop changes the calculator product itself.',
    moduleId: 'comp_analyzer'
  },
  {
    disposition: 'PROHIBITED',
    badgeColor: 'rose',
    calculatorTarget: 'Dynamic Expression Evaluation (eval() / new Function())',
    ruleOrContextSource: 'Mandatory Security Policy (SEC-POL-01)',
    runtimeAction: 'Strictly forbidden in calculator code and verified by static AST scan (EVID-04) before completion.',
    moduleId: 'comp_policy'
  }
];

export const ARCHITECTURAL_DECISIONS: ArchitecturalDecision[] = [
  {
    id: 'DEC-01',
    title: 'Target Platform: Web Calculator Application',
    authority: 'USER_CLARIFICATION',
    authorityLabel: 'User Clarification (Blocking Gate)',
    rationale:
      'The initial prompt (“اعمل آلة حاسبة”) did not specify where the calculator runs. Because Web vs. Desktop changes the deliverable product itself, the Runtime paused and requested explicit user confirmation rather than guessing.',
    alternativesRejected: 'Desktop Native Calculator — valid path, but not selected for this run.',
    dependedOnContext: ['User Prompt Ambiguity Scan', 'Clarification Event #1'],
    producedArtifact: 'TaskSpec v1 · Target = Web Calculator'
  },
  {
    id: 'DEC-02',
    title: 'Implementation Language: TypeScript',
    authority: 'WORKSPACE_PREFERENCE',
    authorityLabel: 'Workspace Preference (Non-Mandatory)',
    rationale:
      'TypeScript is configured as the workspace preferred language and does not conflict with any calculator requirement or security constraint. The Runtime explicitly records this as a preference rather than a hard policy rule.',
    alternativesRejected: 'Un-typed Vanilla JavaScript — lacks compile-time arithmetic state safety.',
    dependedOnContext: ['Workspace Context Descriptor', 'Node.js Runtime Availability'],
    producedArtifact: 'tsconfig.json + Strict Calculator State Types'
  },
  {
    id: 'DEC-03',
    title: 'Calculator Stack: Vanilla TypeScript + Vite',
    authority: 'RUNTIME_ARCHITECT',
    authorityLabel: 'Runtime Architectural Selection',
    rationale:
      'Selected based on calculator complexity analysis: small interactive single-screen app with no routing, no SSR, no backend, and no framework-level component complexity.',
    alternativesRejected:
      'React — unnecessary framework overhead for this calculator task. Next.js — no SSR, routing, backend, or SEO need.',
    dependedOnContext: ['TaskSpec v1 Scope Analysis', 'Minimal Footprint Heuristic'],
    producedArtifact: 'Vite Build Pipeline + Deterministic Calculator DOM Controller'
  },
  {
    id: 'DEC-04',
    title: 'Backend Topology: No Backend (Client-Only Calculator)',
    authority: 'RUNTIME_ARCHITECT',
    authorityLabel: 'Runtime Architectural Selection',
    rationale:
      'No persistence, authentication, shared state, or server-side workflow is required for the calculator.',
    alternativesRejected: 'Express / FastAPI Backend Service — rejected as unnecessary complexity.',
    dependedOnContext: ['Calculator Persistence Audit', 'Workspace Local-Only Execution Rule'],
    producedArtifact: 'Self-Contained Static Bundle (Calculator Artifact v1)'
  },
  {
    id: 'DEC-05',
    title: 'Calculator Arithmetic Engine: Explicit Operator State Machine (No eval())',
    authority: 'MANDATORY_POLICY',
    authorityLabel: 'Mandatory Security Policy (SEC-POL-01)',
    rationale:
      'Mandatory workspace security rule strictly prohibits eval() and new Function(). Calculator operations (+, -, ×, ÷) use an explicit deterministic state machine.',
    alternativesRejected: 'eval(displayExpression) — prohibited by mandatory workspace security rule.',
    dependedOnContext: ['Policy Constraint SEC-POL-01', 'Static AST Policy Scanner'],
    producedArtifact: 'Deterministic press(k) Engine + AST Clean Certificate (EVID-04)'
  }
];

export const REQUIREMENT_TRACE_MATRIX: RequirementTraceItem[] = [
  {
    id: 'REQ-01',
    code: 'REQ-01',
    requirement: 'Web-based interactive calculator interface',
    origin: 'USER_CLARIFIED',
    originLabel: 'User Clarification',
    decisionId: 'DEC-01',
    decisionSummary: 'Web Application (Vanilla TS + Vite)',
    evidenceId: 'EVID-01 · EVID-06',
    evidenceType: 'TaskSpec Lock + DOM Mount Check',
    evidenceDetail: 'User confirmed Web in TaskSpec v1 (EVID-01) and calculator grid mounted in DOM (EVID-06).',
    componentId: 'comp_analyzer',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-02',
    code: 'REQ-02',
    requirement: 'Calculator addition & subtraction operations (+, -)',
    origin: 'USER_EXPLICIT',
    originLabel: 'User Requirement',
    decisionId: 'DEC-05',
    decisionSummary: 'Explicit deterministic arithmetic switch',
    evidenceId: 'EVID-07 · EVID-08',
    evidenceType: 'Deterministic Unit Checks',
    evidenceDetail: '14 + 28 = 42 (EVID-07) and 50 - 18 = 32 (EVID-08) verified deterministically.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-03',
    code: 'REQ-03',
    requirement: 'Calculator multiplication & standard division (×, ÷)',
    origin: 'USER_EXPLICIT',
    originLabel: 'User Requirement',
    decisionId: 'DEC-05',
    decisionSummary: 'Explicit deterministic arithmetic switch',
    evidenceId: 'EVID-09 · EVID-10',
    evidenceType: 'Deterministic Unit Checks',
    evidenceDetail: '7 × 6 = 42 (EVID-09) and 84 ÷ 7 = 12 (EVID-10) verified deterministically.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-04',
    code: 'REQ-04',
    requirement: 'Calculator decimal point input (.)',
    origin: 'USER_EXPLICIT',
    originLabel: 'User Requirement',
    decisionId: 'DEC-03',
    decisionSummary: 'Token input regex /^[0-9.]$/ handler',
    evidenceId: 'EVID-11 · TEST-DEC-01',
    evidenceType: 'Deterministic Unit Check',
    evidenceDetail: '3.5 × 2 = 7 verified with accurate decimal token parsing.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-05',
    code: 'REQ-05',
    requirement: 'Calculator clear / reset state control (C)',
    origin: 'USER_EXPLICIT',
    originLabel: 'User Requirement',
    decisionId: 'DEC-03',
    decisionSummary: 'State reset handler (display="0", stored=null, op=null)',
    evidenceId: 'EVID-12 · TEST-CLR-01',
    evidenceType: 'State Transition Check',
    evidenceDetail: 'Pressing C resets accumulator, operator register, and display to 0.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-06',
    code: 'REQ-06',
    requirement: 'Calculator keyboard input support (0–9, +, -, ×, ÷, Enter, C)',
    origin: 'USER_EXPLICIT',
    originLabel: 'User Requirement',
    decisionId: 'DEC-03',
    decisionSummary: 'Keydown event listener mapped to press(k)',
    evidenceId: 'EVID-12 · TEST-KBD-01',
    evidenceType: 'DOM Event Simulation',
    evidenceDetail: 'Keyboard digits 0-9, Enter (=), Escape (C), and operators verified.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-07',
    code: 'REQ-07',
    requirement: 'TypeScript compilation & zero eval() workspace policy adherence',
    origin: 'WORKSPACE_POLICY',
    originLabel: 'Workspace Policy & Preference',
    decisionId: 'DEC-02',
    decisionSummary: 'TypeScript strict build + static AST policy scan',
    evidenceId: 'EVID-02..EVID-05',
    evidenceType: 'Build + Static AST Policy Scanner',
    evidenceDetail: '4 recorded ADRs (EVID-02), tsc build exit 0 (EVID-03), 0 eval() tokens (EVID-04), local scope (EVID-05).',
    componentId: 'comp_policy',
    statusBeforeRepair: 'PASS',
    statusAfterRepair: 'PASS'
  },
  {
    id: 'REQ-08',
    code: 'REQ-08',
    requirement: 'Safe invalid division handling (Division by Zero Guard: 8 ÷ 0)',
    origin: 'RUNTIME_QUALITY',
    originLabel: 'Runtime-Injected Quality Gate',
    decisionId: 'DEC-05',
    decisionSummary: 'Zero-denominator guard in calculator division handler',
    evidenceId: 'EVID-13 · DIV-ZERO-01',
    evidenceType: 'Negative Boundary Check',
    evidenceDetail: 'Evaluates 8 ÷ 0 on the calculator. Expected controlled "Error" instead of raw IEEE-754 Infinity.',
    componentId: 'comp_verifier',
    statusBeforeRepair: 'FAIL',
    statusAfterRepair: 'PASS',
    failureOutput: 'Actual output: "Infinity" (Uncontrolled IEEE-754 float overflow)',
    repairedOutput: 'Actual output: "Error" (Controlled denominator guard v === 0)'
  }
];

export const EVIDENCE_RECORDS_LEDGER: EvidenceRecordItem[] = [
  {
    id: 'EVID-01',
    index: 1,
    category: 'SPEC_AND_DECISION',
    categoryLabel: 'Spec & Clarification',
    title: 'Calculator TaskSpec v1 & Human Clarification Record',
    linkedReqOrRule: 'REQ-01 (Web Calculator)',
    producerComponentId: 'comp_analyzer',
    stageCaptured: 0,
    provenanceSource: 'task_specifications #TS-001',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Records user selection of "Web" over "Desktop" for «اعمل آلة حاسبة» and locks 7 user + 1 runtime quality requirements.'
  },
  {
    id: 'EVID-02',
    index: 2,
    category: 'SPEC_AND_DECISION',
    categoryLabel: 'Architectural Decision',
    title: 'Calculator Stack & Topology Justification Log (4 ADRs)',
    linkedReqOrRule: 'DEC-01..DEC-04',
    producerComponentId: 'comp_planner',
    stageCaptured: 1,
    provenanceSource: 'architectural_decisions #ADR-01..04',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Logs selection of Vanilla TS + Vite and No Backend for the calculator, with explicit rejection of React/Next.js overhead.'
  },
  {
    id: 'EVID-03',
    index: 3,
    category: 'BUILD_AND_POLICY',
    categoryLabel: 'Build & Policy',
    title: 'Calculator TypeScript + Vite Bundle Compilation Log',
    linkedReqOrRule: 'Workspace Rule #1 (Clean Build)',
    producerComponentId: 'comp_orchestrator',
    stageCaptured: 2,
    provenanceSource: 'tsc --noEmit && vite build (5 files)',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Created 5 calculator workspace files (index.html, src/*, tests/*) across 12 execution events; exited with code 0.'
  },
  {
    id: 'EVID-04',
    index: 4,
    category: 'BUILD_AND_POLICY',
    categoryLabel: 'Build & Policy',
    title: 'Calculator Static AST Security Scan (Prohibit eval())',
    linkedReqOrRule: 'Workspace Rule #2 (SEC-POL-01)',
    producerComponentId: 'comp_policy',
    stageCaptured: 2,
    provenanceSource: 'ast_policy_scanner v2.1',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Scanned all calculator AST nodes; confirmed 0 calls to eval(), Function(), or dynamic expression execution.'
  },
  {
    id: 'EVID-05',
    index: 5,
    category: 'BUILD_AND_POLICY',
    categoryLabel: 'Build & Policy',
    title: 'Calculator Sandbox Containment & Scope Audit',
    linkedReqOrRule: 'Workspace Rule #3 (Local Only)',
    producerComponentId: 'comp_orchestrator',
    stageCaptured: 2,
    provenanceSource: 'sandbox_guard #SBX-001',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Verified all 12 calculator build/test events remained inside the local workspace with 0 external deployment calls.'
  },
  {
    id: 'EVID-06',
    index: 6,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Web Calculator DOM & Display Mount Check',
    linkedReqOrRule: 'REQ-01 (Web UI)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: mount_check',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Confirmed #calcDisplay and 17 calculator keypad buttons render inside the Web DOM container.'
  },
  {
    id: 'EVID-07',
    index: 7,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Addition Check (14 + 28 = 42)',
    linkedReqOrRule: 'REQ-02 (Add)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: arith_add',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Calculator input sequence ["1","4","+","2","8","="] produced exact display output "42".'
  },
  {
    id: 'EVID-08',
    index: 8,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Subtraction Check (50 - 18 = 32)',
    linkedReqOrRule: 'REQ-02 (Subtract)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: arith_sub',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Calculator input sequence ["5","0","-","1","8","="] produced exact display output "32".'
  },
  {
    id: 'EVID-09',
    index: 9,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Multiplication Check (7 × 6 = 42)',
    linkedReqOrRule: 'REQ-03 (Multiply)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: arith_mul',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Calculator input sequence ["7","×","6","="] produced exact display output "42".'
  },
  {
    id: 'EVID-10',
    index: 10,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Standard Division Check (84 ÷ 7 = 12)',
    linkedReqOrRule: 'REQ-03 (Divide)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: arith_div',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Calculator input sequence ["8","4","÷","7","="] produced exact display output "12".'
  },
  {
    id: 'EVID-11',
    index: 11,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Decimal Precision Check (3.5 × 2 = 7)',
    linkedReqOrRule: 'REQ-04 (Decimal)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: decimal_check',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Verified decimal point entry and repeated-dot prevention on calculator operands.'
  },
  {
    id: 'EVID-12',
    index: 12,
    category: 'ACCEPTANCE_TEST',
    categoryLabel: 'Acceptance Check',
    title: 'Calculator Clear (C) Reset & Keyboard Input Check',
    linkedReqOrRule: 'REQ-05 & REQ-06 (Clear + Keyboard)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: kbd_and_clear',
    verdictBeforeRepair: 'RECORDED_PASS',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Confirmed keydown events (digits, operators, Enter, Escape/C) reset and compute deterministically on the calculator.'
  },
  {
    id: 'EVID-13',
    index: 13,
    category: 'BOUNDARY_GATE',
    categoryLabel: 'Boundary Quality Gate',
    title: 'DIV-ZERO-01: Calculator Division by Zero Check (8 ÷ 0)',
    linkedReqOrRule: 'REQ-08 (Runtime Quality Gate)',
    producerComponentId: 'comp_verifier',
    stageCaptured: 3,
    provenanceSource: 'test_runner :: DIV-ZERO-01',
    verdictBeforeRepair: 'RECORDED_FAIL',
    verdictAfterRepair: 'RECORDED_PASS',
    detail: 'Pre-Repair: calculator returned raw "Infinity" (blocked completion gate). Post-Repair: calculator returned controlled "Error" (unlocked gate).'
  }
];

export function canAdvanceToStage(
  targetStage: StageIndex,
  state: Pick<SimulationState, 'clarifiedPlatform' | 'repaired'>
): { allowed: boolean; reason?: string } {
  if (targetStage === 0) {
    return { allowed: true };
  }
  if (state.clarifiedPlatform !== 'web') {
    return {
      allowed: false,
      reason: 'Step 1 requires resolving the Calculator platform question (select "Web") before planning.'
    };
  }
  if (targetStage === 4 && !state.repaired) {
    return {
      allowed: false,
      reason: 'Completion Gate is BLOCKED in Step 4 by failing check DIV-ZERO-01 (7/8 passed). Click "Fix & verify again" first.'
    };
  }
  return { allowed: true };
}

export function computeRuntimeMetrics(state: Pick<SimulationState, 'currentStage' | 'clarifiedPlatform' | 'repaired'>) {
  const requirementsTotal = 8;
  const requirementsPassed = state.repaired ? 8 : 7;
  const policyChecksPassed = 4;
  const policyChecksTotal = 4;
  const evidenceCollected = 13;
  const evidenceTotal = 13;
  const unresolvedIssues = state.repaired ? 0 : 1;

  let globalStatusLabel = 'WAITING FOR INPUT';
  let globalStatusTone: 'amber' | 'sky' | 'rose' | 'emerald' = 'amber';

  if (state.currentStage === 0) {
    if (state.clarifiedPlatform === 'web') {
      globalStatusLabel = 'UNDERSTOOD';
      globalStatusTone = 'sky';
    } else {
      globalStatusLabel = 'WAITING FOR INPUT';
      globalStatusTone = 'amber';
    }
  } else if (state.currentStage === 1) {
    globalStatusLabel = 'PLANNED';
    globalStatusTone = 'sky';
  } else if (state.currentStage === 2) {
    globalStatusLabel = 'VERIFYING';
    globalStatusTone = 'amber';
  } else if (state.currentStage === 3) {
    if (!state.repaired) {
      globalStatusLabel = 'CHECK FAILED';
      globalStatusTone = 'rose';
    } else {
      globalStatusLabel = 'RE-VERIFIED';
      globalStatusTone = 'emerald';
    }
  } else if (state.currentStage === 4) {
    globalStatusLabel = 'VERIFIED COMPLETE';
    globalStatusTone = 'emerald';
  }

  return {
    requirementsTotal,
    requirementsPassed,
    policyChecksPassed,
    policyChecksTotal,
    evidenceCollected,
    evidenceTotal,
    unresolvedIssues,
    globalStatusLabel,
    globalStatusTone
  };
}

export function getComponentDependencies(componentId: string) {
  const component = SYSTEM_COMPONENTS.find((c) => c.id === componentId) || SYSTEM_COMPONENTS[0];
  const incoming = DATA_DEPENDENCY_EDGES.filter((edge) => edge.to === component.id);
  const outgoing = DATA_DEPENDENCY_EDGES.filter((edge) => edge.from === component.id);
  return { component, incoming, outgoing };
}

export interface CalculatorState {
  display: string;
  stored: number | null;
  op: '+' | '-' | '×' | '÷' | null;
  waitingForOperand?: boolean;
  historyExpression: string;
}

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  display: '0',
  stored: null,
  op: null,
  waitingForOperand: false,
  historyExpression: ''
};

function computeBinaryOp(lhs: number, rhs: number, op: '+' | '-' | '×' | '÷', includeZeroGuard: boolean): string {
  if (op === '÷' && rhs === 0) {
    return includeZeroGuard ? 'Error' : 'Infinity';
  }
  if (op === '+') {
    return String(Number((lhs + rhs).toPrecision(12)));
  }
  if (op === '-') {
    return String(Number((lhs - rhs).toPrecision(12)));
  }
  if (op === '×') {
    return String(Number((lhs * rhs).toPrecision(12)));
  }
  return String(Number((lhs / rhs).toPrecision(12)));
}

export function stepCalculator(state: CalculatorState, key: string, includeZeroGuard = true): CalculatorState {
  if (key === 'C') {
    return { ...INITIAL_CALCULATOR_STATE };
  }

  if (/^[0-9]$/.test(key)) {
    const isFresh =
      state.waitingForOperand ||
      state.display === '0' ||
      state.display === 'Error' ||
      state.display === 'Infinity';

    return {
      ...state,
      display: isFresh ? key : state.display + key,
      waitingForOperand: false
    };
  }

  if (key === '.') {
    if (state.waitingForOperand || state.display === 'Error' || state.display === 'Infinity') {
      return {
        ...state,
        display: '0.',
        waitingForOperand: false
      };
    }
    if (state.display.includes('.')) {
      return state;
    }
    return {
      ...state,
      display: state.display + '.',
      waitingForOperand: false
    };
  }

  if (key === '+' || key === '-' || key === '×' || key === '÷') {
    if (state.display === 'Error' || state.display === 'Infinity') {
      return {
        display: '0',
        stored: 0,
        op: key,
        waitingForOperand: true,
        historyExpression: `0 ${key}`
      };
    }

    if (state.waitingForOperand && state.stored !== null) {
      return {
        ...state,
        op: key,
        historyExpression: `${state.stored} ${key}`
      };
    }

    const currentVal = Number(state.display);

    if (state.stored !== null && state.op !== null && !state.waitingForOperand) {
      const intermediate = computeBinaryOp(state.stored, currentVal, state.op, includeZeroGuard);
      if (intermediate === 'Error' || intermediate === 'Infinity') {
        return {
          display: intermediate,
          stored: null,
          op: null,
          waitingForOperand: true,
          historyExpression: `${state.stored} ${state.op} ${currentVal} =`
        };
      }
      const nextStored = Number(intermediate);
      return {
        display: intermediate,
        stored: nextStored,
        op: key,
        waitingForOperand: true,
        historyExpression: `${nextStored} ${key}`
      };
    }

    return {
      display: state.display,
      stored: currentVal,
      op: key,
      waitingForOperand: true,
      historyExpression: `${currentVal} ${key}`
    };
  }

  if (key === '=' && state.stored !== null && state.op !== null) {
    const rhs = Number(state.display);
    const resultDisplay = computeBinaryOp(state.stored, rhs, state.op, includeZeroGuard);

    return {
      display: resultDisplay,
      stored: null,
      op: null,
      waitingForOperand: true,
      historyExpression: `${state.stored} ${state.op} ${rhs} =`
    };
  }

  return state;
}
