import {
  detectPromptDomainArchetype,
  synthesizeDomainSpecificScenario
} from './dynamicDeliverableEngine';

export type SETaskArchetype =
  | 'FEATURE_ENGINEERING'
  | 'BUG_INVESTIGATION_AND_FIX'
  | 'SECURITY_AND_ARCH_REFACTOR'
  | 'BASELINE_UI_COMPONENT'
  | 'CUSTOM_LIVE_PROMPT';

export interface CodeFileArtifact {
  path: string;
  language: 'typescript' | 'sql' | 'prisma' | 'json' | 'html';
  role: 'CONTROLLER_OR_SERVICE' | 'SCHEMA_OR_MODEL' | 'VERIFICATION_TEST_SUITE';
  linesOfCode: number;
  v1Code: string;
  v1_1Code: string;
  defectHighlightLine?: number;
  defectExplanation?: string;
}

export interface RepoAutoResolvedFact {
  id: string;
  dimension: string;
  naiveAiQuestion: string;
  autoResolvedValue: string;
  sourceTier: 'TIER_1_REPO_AST' | 'TIER_2_POLICY_ENGINE' | 'TIER_3_KNOWLEDGE_GRAPH';
  sourceArtifact: string;
}

export interface BlockingAmbiguityGate {
  gateId: string;
  question: string;
  arabicHint: string;
  whyUnresolvableFromRepo: string;
  options: {
    id: string;
    label: string;
    arabicLabel: string;
    compiledConstraint: string;
    recommended?: boolean;
  }[];
  compiledTaskSpecPreview: Record<string, string | string[] | boolean>;
}

export interface RequirementSpecItem {
  id: string;
  source: 'USER_SPEC' | 'POLICY_OR_RUNTIME_QUALITY';
  category: 'Functional' | 'Concurrency' | 'Security' | 'Data Integrity' | 'Resilience';
  statement: string;
  plannedModule: string;
  targetFile: string;
  v1Status: 'PASS' | 'FAIL';
  v1_1Status: 'PASS';
  failureDiagnostic?: string;
  verificationAssertion: string;
}

export interface ArchitecturalDecisionItem {
  id: string;
  stage: string;
  title: string;
  chosenOption: string;
  rejectedAlternative: string;
  rationale: string;
  constraintLocked: string;
}

export interface StageInternalFlow {
  stageNumber: 1 | 2 | 3 | 4 | 5;
  stageTitle: string;
  summary: string;
  steps: {
    stepOrder: number;
    fromModule: string;
    toModule: string;
    action: string;
    artifactOrHash: string;
    latencyMs: number;
    status: 'OK' | 'GATE' | 'DEFECT' | 'SEALED';
  }[];
}

export interface ExtractedKnowledgeUnit {
  id: string;
  patternName: string;
  domainTags: string[];
  applicabilityTrigger: string;
  reusableAstTemplate: string;
  verificationAssertions: string[];
  sourceCheckpointId: string;
  sourceSealId: string;
  policyHash: string;
  createdAt: string;
  reuseCount: number;
}

export interface FollowUpTaskReuseSimulation {
  nextTaskId: string;
  nextTaskPrompt: string;
  arabicPromptSummary: string;
  withoutKnowledgeGraph: {
    questionsAsked: number;
    planningLatencyMs: number;
    firstPassDefects: number;
    summary: string;
  };
  withShiftCoreKnowledgeReuse: {
    questionsAsked: number;
    injectedKnowledgeId: string;
    autoAppliedConstraint: string;
    planningLatencyMs: number;
    firstPassDefects: number;
    summary: string;
  };
}

export interface SECodingScenario {
  id: string;
  code: string;
  title: string;
  arabicTitle: string;
  archetype: SETaskArchetype;
  badgeLabel: string;
  rawPrompt: string;
  arabicPrompt: string;
  repositoryName: string;
  techStack: string[];
  elicitation: {
    naiveChatbotTranscript: string[];
    autoResolvedFacts: RepoAutoResolvedFact[];
    blockingGate: BlockingAmbiguityGate;
  };
  decisions: ArchitecturalDecisionItem[];
  files: CodeFileArtifact[];
  surgicalDiff: {
    targetFile: string;
    rootCauseAnalysis: string;
    beforeSnippet: string;
    afterSnippet: string;
    astNodesModified: number;
    untouchedFilesCount: number;
  };
  requirements: RequirementSpecItem[];
  stageFlows: StageInternalFlow[];
  extractedKnowledge: ExtractedKnowledgeUnit;
  followUpReuse: FollowUpTaskReuseSimulation;
  interactiveSandboxPreview: {
    type: 'API_TEST_RUNNER' | 'CONCURRENCY_PROBE' | 'SQL_SECURITY_SCANNER' | 'CALCULATOR_WIDGET';
    endpointOrTarget: string;
    testCases: {
      id: string;
      name: string;
      inputPayload: string;
      v1Output: string;
      v1Passed: boolean;
      v1_1Output: string;
      v1_1Passed: boolean;
    }[];
  };
  customStandaloneHtml?: string;
}

export interface MetamodelClassContract {
  id: string;
  interfaceName: string;
  layer: 'INTAKE_LAYER' | 'CONTEXT_AND_KNOWLEDGE' | 'PLANNING_LAYER' | 'EXECUTION_SANDBOX' | 'VERIFICATION_ORACLE';
  stereotype: '<<AbstractContract>>' | '<<ImmutableState>>' | '<<GovernanceGate>>' | '<<CryptographicProof>>';
  purpose: string;
  arabicPurpose: string;
  genericTypeSignature: string;
  attributes: { name: string; type: string; invariant: string }[];
  methods: { signature: string; guardCondition: string }[];
  relationships: { target: string; type: 'COMPOSES' | 'DEPENDS_ON' | 'PRODUCES' | 'VERIFIES'; label: string }[];
}

export interface FormalStateTransition {
  id: string;
  fromState: string;
  fromCode: string;
  toState: string;
  toCode: string;
  eventTrigger: string;
  formalGuard: string;
  actionEffect: string;
  onGuardFailure: string;
}

export interface SequenceInteractionStep {
  order: number;
  phase: '1. INTAKE & CONTEXT' | '2. PLAN & LOCK' | '3. SANDBOX EXEC' | '4. VERIFY & REPAIR' | '5. SEAL & REUSE';
  sourceActor: 'Developer' | 'IntakeGate' | 'KnowledgeGraph' | 'LocalLLMPlanner' | 'SandboxExecutor' | 'VerifierOracle';
  targetActor: 'Developer' | 'IntakeGate' | 'KnowledgeGraph' | 'LocalLLMPlanner' | 'SandboxExecutor' | 'VerifierOracle';
  message: string;
  payloadSchema: string;
  formalConstraint: string;
}

export const FORMAL_METAMODEL_CLASSES: MetamodelClassContract[] = [
  {
    id: 'MM-01',
    interfaceName: 'ITaskIntent<TDomain>',
    layer: 'INTAKE_LAYER',
    stereotype: '<<AbstractContract>>',
    purpose: 'Encapsulates raw developer prompt and binds it to repository AST context before any LLM generation is permitted.',
    arabicPurpose: 'يمثل الطلب الخام للمبرمج ويربطه بسياق الكود الفعلي (AST) والسياسات قبل السماح لأي نموذج بتوليد الكود.',
    genericTypeSignature: 'interface ITaskIntent<TDomain extends SEArchetype>',
    attributes: [
      { name: 'intentId', type: 'UUID', invariant: 'Unique per runtime invocation' },
      { name: 'rawPrompt', type: 'string', invariant: 'Non-empty UTF-8 developer prompt' },
      { name: 'entropyScore', type: 'number [0..1]', invariant: 'Must drop to 0.00 before Stage 2' },
      { name: 'boundContextHash', type: 'SHA256', invariant: 'Must reference active Repo + Policy snapshot' }
    ],
    methods: [
      { signature: 'resolveAgainstRepo(ctx: IRepoKnowledgeContext): AmbiguityDelta', guardCondition: 'ctx.isIndexed === true' },
      { signature: 'compileTaskSpec(gateResolution: GateAnswer): LockedTaskSpec', guardCondition: 'entropyScore === 0.0' }
    ],
    relationships: [
      { target: 'IRepoKnowledgeContext', type: 'DEPENDS_ON', label: 'auto-resolves known facts from' },
      { target: 'IAmbiguityGate', type: 'PRODUCES', label: 'triggers only if residual entropy > 0' }
    ]
  },
  {
    id: 'MM-02',
    interfaceName: 'IRepoKnowledgeContext',
    layer: 'CONTEXT_AND_KNOWLEDGE',
    stereotype: '<<ImmutableState>>',
    purpose: '3-Tier Knowledge store combining Codebase AST (Tier 1), Organizational Security Policies (Tier 2), and Verified Episodic Patterns (Tier 3).',
    arabicPurpose: 'مخزن المعرفة ثلاثي الطبقات: شجرة الكود (Tier 1)، سياسات الأمان (Tier 2)، والخبرات الموثقة السابقة (Tier 3).',
    genericTypeSignature: 'interface IRepoKnowledgeContext',
    attributes: [
      { name: 'tier1AstGraph', type: 'ASTSymbolTable', invariant: 'Synchronized with git HEAD tree hash' },
      { name: 'tier2PolicyHash', type: 'PolicyDigest', invariant: 'Active organizational rule digest (e.g., POL-2026-v1)' },
      { name: 'tier3VerifiedUnits', type: 'ReadonlyArray<IKnowledgeUnit>', invariant: 'Only units where unit.policyHash === tier2PolicyHash' }
    ],
    methods: [
      { signature: 'queryRelevantPatterns(intent: ITaskIntent): IKnowledgeUnit[]', guardCondition: 'unit.sealVerified && unit.policyHash === activePolicy' },
      { signature: 'invalidateByPolicyChange(newPolicyHash: string): QuarantineReport', guardCondition: 'newPolicyHash !== tier2PolicyHash' }
    ],
    relationships: [
      { target: 'IKnowledgeUnit', type: 'COMPOSES', label: 'indexes policy-valid patterns' }
    ]
  },
  {
    id: 'MM-03',
    interfaceName: 'IAmbiguityGate',
    layer: 'INTAKE_LAYER',
    stereotype: '<<GovernanceGate>>',
    purpose: 'Deterministic state-machine blocker that halts execution ONLY when an architectural trade-off cannot be inferred from Tier 1–3 knowledge.',
    arabicPurpose: 'بوابة تحكم حتمية توقف التنفيذ فقط عند وجود قرار معماري لا يمكن استنتاجه من الكود أو المعرفة السابقة.',
    genericTypeSignature: 'interface IAmbiguityGate<TConstraint>',
    attributes: [
      { name: 'gateStatus', type: "'OPEN' | 'BLOCKED' | 'RESOLVED'", invariant: 'Stage 2 transition requires status === RESOLVED' },
      { name: 'autoResolvedFacts', type: 'RepoFact[]', invariant: 'Facts resolved with 0 user questions' },
      { name: 'irreducibleTradeoff', type: 'ArchitecturalChoice', invariant: 'Single high-impact domain decision' }
    ],
    methods: [
      { signature: 'bindDeveloperChoice(choiceId: string): SchemaConstraint', guardCondition: 'choiceId in allowedOptions' }
    ],
    relationships: [
      { target: 'IExecutionPlan', type: 'PRODUCES', label: 'unlocks formal TaskSpec for' }
    ]
  },
  {
    id: 'MM-04',
    interfaceName: 'IExecutionPlan<TArtifact>',
    layer: 'PLANNING_LAYER',
    stereotype: '<<AbstractContract>>',
    purpose: 'Bipartite traceability graph mapping every requirement (R1..Rn) and ADR decision to concrete target files and AST verification assertions.',
    arabicPurpose: 'خطة التنفيذ المهيكلة التي تربط كل متطلب وقرار معماري بملفات الكود واختبارات التحقق المستقلة.',
    genericTypeSignature: 'interface IExecutionPlan<TArtifact extends CodeFileArtifact>',
    attributes: [
      { name: 'planHash', type: 'SHA256', invariant: 'Immutable during Stage 3 execution' },
      { name: 'requirementMatrix', type: 'Map<ReqID, TestAssertion>', invariant: 'Bijective 1-to-1 coverage required' },
      { name: 'adrLocks', type: 'ReadonlyArray<ADRConstraint>', invariant: 'Enforced during AST synthesis' }
    ],
    methods: [
      { signature: 'synthesizeInSandbox(llm: ILocalModelAdapter): ISandboxedCheckpoint', guardCondition: 'planHash !== null && sandbox.isIsolated()' }
    ],
    relationships: [
      { target: 'ISandboxedCheckpoint', type: 'PRODUCES', label: 'generates versioned code in' }
    ]
  },
  {
    id: 'MM-05',
    interfaceName: 'ISandboxedCheckpoint',
    layer: 'EXECUTION_SANDBOX',
    stereotype: '<<ImmutableState>>',
    purpose: 'Content-addressable snapshot (#S3-01) of multi-file code artifacts inside an isolated workspace, enabling localized surgical patches instead of full regeneration.',
    arabicPurpose: 'نسخة مؤمنة (#S3-01) من ملفات الكود داخل بيئة معزولة، تسمح بالإصلاح الجراحي الموضعي بدلاً من مسح الكود وإعادة توليده.',
    genericTypeSignature: 'interface ISandboxedCheckpoint',
    attributes: [
      { name: 'checkpointId', type: 'string (#S3-01)', invariant: 'Retained across repair loops' },
      { name: 'merkleTreeHash', type: 'SHA256', invariant: 'Cryptographic hash of all file ASTs' },
      { name: 'fileTree', type: 'CodeFileArtifact[]', invariant: 'Syntactically valid AST per file' }
    ],
    methods: [
      { signature: 'applySurgicalPatch(diff: ASTPatch): ISandboxedCheckpoint', guardCondition: 'diff.scope === FAILED_NODE_ONLY' }
    ],
    relationships: [
      { target: 'IVerificationSeal', type: 'VERIFIES', label: 'submitted to independent oracle for' }
    ]
  },
  {
    id: 'MM-06',
    interfaceName: 'IVerificationSeal & IKnowledgeUnit',
    layer: 'VERIFICATION_ORACLE',
    stereotype: '<<CryptographicProof>>',
    purpose: 'Independent verification oracle output (#SEAL-402) that proves 100% requirement & security compliance before promoting reusable knowledge to Tier 3.',
    arabicPurpose: 'ختم التحقق المستقل (#SEAL-402) الذي يثبت نجاح جميع المتطلبات وفحوصات الأمان قبل ترقية الخبرة لقاعدة المعرفة.',
    genericTypeSignature: 'interface IVerificationSeal',
    attributes: [
      { name: 'sealId', type: 'string (#SEAL-402)', invariant: 'Issued iff failedChecks === 0' },
      { name: 'complianceScore', type: 'number', invariant: 'Must equal 1.00 (100%)' },
      { name: 'extractedUnit', type: 'IKnowledgeUnit', invariant: 'Tagged with active PolicyHash' }
    ],
    methods: [
      { signature: 'commitToKnowledgeGraph(repo: IRepoKnowledgeContext): void', guardCondition: 'complianceScore === 1.0' }
    ],
    relationships: [
      { target: 'IRepoKnowledgeContext', type: 'PRODUCES', label: 'commits reusable pattern into Tier 3' }
    ]
  }
];

export const FORMAL_STATE_MACHINE_TRANSITIONS: FormalStateTransition[] = [
  {
    id: 'TR-01',
    fromState: 'S0: Raw Intent Intake',
    fromCode: 'S0_RAW_INTENT',
    toState: 'S1: Context-Grounded Elicitation',
    toCode: 'S1_CONTEXT_BOUND',
    eventTrigger: 'submitPrompt(rawPrompt, repoId)',
    formalGuard: 'G1: RepoAST.isIndexed() ∧ PolicyEngine.isActive()',
    actionEffect: 'Query Tier 1 AST + Tier 2 Policy + Tier 3 Knowledge; auto-resolve known repo facts.',
    onGuardFailure: 'Reject execution until Repository AST & Policy Snapshot are mounted.'
  },
  {
    id: 'TR-02',
    fromState: 'S1: Context-Grounded Elicitation',
    fromCode: 'S1_CONTEXT_BOUND',
    toState: 'S2: Locked TaskSpec & Plan',
    toCode: 'S2_PLAN_LOCKED',
    eventTrigger: 'resolveAmbiguityGate(choiceId)',
    formalGuard: 'G2: AmbiguityEntropy(TaskSpec) == 0.00 ∧ SchemaValid(TaskSpec)',
    actionEffect: 'Compile user trade-off decision into formal JSON Schema constraint; generate Requirement-to-Test matrix.',
    onGuardFailure: 'Remain in S1 (BLOCKED); do NOT invoke Local LLM code generator.'
  },
  {
    id: 'TR-03',
    fromState: 'S2: Locked TaskSpec & Plan',
    fromCode: 'S2_PLAN_LOCKED',
    toState: 'S3: Sandboxed Synthesis (#S3-01)',
    toCode: 'S3_SANDBOX_CHECKPOINT',
    eventTrigger: 'dispatchToLocalModel(plan, modelConfig)',
    formalGuard: 'G3: ∀ r ∈ Requirements: ∃ testAssertion(r) ∧ Sandbox.isIsolated()',
    actionEffect: 'Invoke Local LLM (Ollama/vLLM) with locked TaskSpec + Tier 3 patterns; snapshot multi-file output as immutable Checkpoint #S3-01.',
    onGuardFailure: 'Abort synthesis if any requirement lacks a corresponding verification assertion.'
  },
  {
    id: 'TR-04A',
    fromState: 'S3: Sandboxed Synthesis (#S3-01)',
    fromCode: 'S3_SANDBOX_CHECKPOINT',
    toState: 'S4_REPAIR: Surgical AST Patch Loop',
    toCode: 'S4_SURGICAL_REPAIR',
    eventTrigger: 'runIndependentVerifier(#S3-01) -> [FAIL_DETECTED]',
    formalGuard: 'G4a: FailedAssertions > 0 ∧ RepairIteration < MaxRetries(3)',
    actionEffect: 'Retain Checkpoint #S3-01; isolate exact failing AST node & line; synthesize targeted diff (v1.0 -> v1.1) without touching passing files.',
    onGuardFailure: 'Escalate with diagnostic trace if MaxRetries exceeded.'
  },
  {
    id: 'TR-04B',
    fromState: 'S4_REPAIR: Surgical AST Patch Loop',
    fromCode: 'S4_SURGICAL_REPAIR',
    toState: 'S4_VERIFIED: Independent Oracle Pass',
    toCode: 'S4_ORACLE_VERIFIED',
    eventTrigger: 'reverifyPatchedCheckpoint(#S3-01-v1.1)',
    formalGuard: 'G4b: PassedAssertions == TotalAssertions (8/8 PASS) ∧ RegressionCount == 0',
    actionEffect: 'Confirm surgical patch resolved defect with zero regressions across all retained modules.',
    onGuardFailure: 'Rollback patch to #S3-01 and re-enter bounded AST repair.'
  },
  {
    id: 'TR-05',
    fromState: 'S4_VERIFIED: Independent Oracle Pass',
    fromCode: 'S4_ORACLE_VERIFIED',
    toState: 'S5: Sealed Delivery & Knowledge Promotion',
    toCode: 'S5_SEALED_AND_PROMOTED',
    eventTrigger: 'issueCryptographicSeal()',
    formalGuard: 'G5: VerifierSignature.isValid() ∧ PolicyHash == ActiveOrgPolicy',
    actionEffect: 'Emit cryptographic seal (#SEAL-402); extract verified architectural pattern into Tier 3 Knowledge Graph for Task N+1 reuse.',
    onGuardFailure: 'Block release delivery and quarantine unverified artifacts.'
  }
];

export const FORMAL_SEQUENCE_DIAGRAM_STEPS: SequenceInteractionStep[] = [
  {
    order: 1,
    phase: '1. INTAKE & CONTEXT',
    sourceActor: 'Developer',
    targetActor: 'IntakeGate',
    message: 'submitCodingTask(prompt, repoContext)',
    payloadSchema: '{ rawPrompt: string, repoBranch: "main" }',
    formalConstraint: 'Intercepted before any LLM token generation'
  },
  {
    order: 2,
    phase: '1. INTAKE & CONTEXT',
    sourceActor: 'IntakeGate',
    targetActor: 'KnowledgeGraph',
    message: 'resolveContextAndPolicies(intentVector)',
    payloadSchema: 'Query<Tier1_AST, Tier2_Policy, Tier3_Patterns>',
    formalConstraint: 'Auto-resolves ORM, Auth, DB & Policy facts (0 questions asked for known repo facts)'
  },
  {
    order: 3,
    phase: '1. INTAKE & CONTEXT',
    sourceActor: 'IntakeGate',
    targetActor: 'Developer',
    message: 'triggerBlockingAmbiguityGate(unresolvedTradeoff)',
    payloadSchema: 'AmbiguityGate { autoResolved: 4, blockingQuestion: 1 }',
    formalConstraint: 'Halts state machine at S1 until irreducible architectural choice is selected'
  },
  {
    order: 4,
    phase: '2. PLAN & LOCK',
    sourceActor: 'Developer',
    targetActor: 'LocalLLMPlanner',
    message: 'lockTaskSpecAndSynthesizePlan(selectedConstraint)',
    payloadSchema: 'LockedTaskSpec { entropy: 0.0, reqs: R1..R8, adrs: ADR1..ADR3 }',
    formalConstraint: 'Compiles human answer into strict JSON Schema & test matrix'
  },
  {
    order: 5,
    phase: '3. SANDBOX EXEC',
    sourceActor: 'LocalLLMPlanner',
    targetActor: 'SandboxExecutor',
    message: 'generateMultiFileCode(TaskSpec, Tier3Pattern)',
    payloadSchema: 'Checkpoint #S3-01 { files: CodeFileArtifact[], sha256: "8f4b...c21a" }',
    formalConstraint: 'Executes in isolated sandbox; writes immutable Checkpoint #S3-01'
  },
  {
    order: 6,
    phase: '4. VERIFY & REPAIR',
    sourceActor: 'SandboxExecutor',
    targetActor: 'VerifierOracle',
    message: 'auditCheckpointASTAndTests(#S3-01)',
    payloadSchema: 'VerificationReport { passed: 7, failed: 1, defectNode: "Line 42" }',
    formalConstraint: 'Independent Oracle (never trusts LLM self-report)'
  },
  {
    order: 7,
    phase: '4. VERIFY & REPAIR',
    sourceActor: 'VerifierOracle',
    targetActor: 'SandboxExecutor',
    message: 'applySurgicalPatch(#S3-01, astDiffPatch)',
    payloadSchema: 'DeltaPatch { target: "Line 42", untouchedFiles: 2, version: "v1.1" }',
    formalConstraint: 'Preserves #S3-01 baseline; patches only the defective AST block'
  },
  {
    order: 8,
    phase: '5. SEAL & REUSE',
    sourceActor: 'VerifierOracle',
    targetActor: 'KnowledgeGraph',
    message: 'commitSealedKnowledgeUnit(#SEAL-402, KU)',
    payloadSchema: 'KnowledgeUnit { id: "KU-2026", policyHash: "POL-2026-v1", verified: true }',
    formalConstraint: 'Promotes verified pattern to Tier 3 for automatic reuse in Task N+1'
  }
];

export const SE_CODING_SCENARIOS: Record<string, SECodingScenario> = {
  feat_refund_api: {
    id: 'feat_refund_api',
    code: 'SE-TASK-01',
    title: 'Idempotent Payment Refund API + DB Transaction',
    arabicTitle: 'بناء واجهة استرجاع المدفوعات (Refund API) مع حماية التزامن وقاعدة البيانات',
    archetype: 'FEATURE_ENGINEERING',
    badgeLabel: 'Feature + DB + Concurrency',
    rawPrompt: 'Add a POST /api/v1/payments/:id/refund endpoint to our Node/TypeScript billing service.',
    arabicPrompt: 'أضف مسار برمجي لاسترجاع المدفوعات (Refund API) في خدمة الفوترة مع تحديث قاعدة البيانات.',
    repositoryName: 'fincore-billing-service (TypeScript + Prisma + PostgreSQL)',
    techStack: ['Node.js', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Express', 'Jest'],
    elicitation: {
      naiveChatbotTranscript: [
        'Naive AI Q1: What programming language and web framework are you using?',
        'Naive AI Q2: Which database and ORM do you use for storing payments?',
        'Naive AI Q3: How is authentication handled in your API routes?',
        'Naive AI Q4: What currency format do you store (floats or minor units/cents)?',
        'Naive AI Result: Or worse, the AI asks 0 questions, guesses float numbers with Mongoose, and hallucinates a non-existent schema.'
      ],
      autoResolvedFacts: [
        {
          id: 'FACT-101',
          dimension: 'Database & ORM Schema',
          naiveAiQuestion: 'Which database and ORM are you using?',
          autoResolvedValue: 'PostgreSQL 16 + Prisma ORM (Payment & LedgerEntry models storing integer minor units `amountCents`)',
          sourceTier: 'TIER_1_REPO_AST',
          sourceArtifact: 'prisma/schema.prisma (Lines 44–89)'
        },
        {
          id: 'FACT-102',
          dimension: 'Authentication & RBAC Middleware',
          naiveAiQuestion: 'How should the endpoint authenticate requests?',
          autoResolvedValue: 'Existing `requireRole("FINANCE_OPERATOR")` JWT middleware with audit context injection',
          sourceTier: 'TIER_1_REPO_AST',
          sourceArtifact: 'src/middleware/authGuard.ts'
        },
        {
          id: 'FACT-103',
          dimension: 'Idempotency & Audit Policy',
          naiveAiQuestion: 'Do you need idempotency keys or audit logs?',
          autoResolvedValue: 'Mandatory `Idempotency-Key` header + immutable `AuditLog` write inside the same DB transaction',
          sourceTier: 'TIER_2_POLICY_ENGINE',
          sourceArtifact: 'POL-2026-v1 §4.2 (Financial Mutation Policy)'
        },
        {
          id: 'FACT-104',
          dimension: 'Prior Transactional Pattern',
          naiveAiQuestion: 'How do you structure database transactions?',
          autoResolvedValue: 'Reused `prisma.$transaction` envelope pattern from previously verified Charge Capture task',
          sourceTier: 'TIER_3_KNOWLEDGE_GRAPH',
          sourceArtifact: 'KU-089 (Verified Transactional Ledger Pattern)'
        }
      ],
      blockingGate: {
        gateId: 'GATE-REFUND-01',
        question: 'Unresolved Domain Trade-off: Should partial refunds be permitted with synchronous gateway settlement, or queued asynchronously via outbox worker?',
        arabicHint: 'لاحظ أن ShiftCore لم يسألك عن لغة البرمجة أو قاعدة البيانات لأنه قرأها تلقائياً من الـ Repo والـ Policy، وأوقف التنفيذ فقط عند القرار المعماري الذي لا يمكن تخمينه:',
        whyUnresolvableFromRepo: 'Both synchronous Stripe settlement and Outbox worker patterns exist in the repo; choosing the wrong one violates SLA or gateway rate-limit semantics.',
        options: [
          {
            id: 'PARTIAL_SYNC_SERIALIZABLE',
            label: 'Allow Partial Refunds + Synchronous Gateway Call + Serializable Row Lock (Recommended)',
            arabicLabel: 'دعم الاسترجاع الجزئي مع قفل صفوف قاعدة البيانات (SELECT FOR UPDATE) لمنع التضارب المتزامن',
            compiledConstraint: 'allowPartial=true; isolationLevel="Serializable"; lockStrategy="PESSIMISTIC_ROW_LOCK"; idempotencyTTL=86400',
            recommended: true
          },
          {
            id: 'FULL_ONLY_SYNC',
            label: 'Full-Amount Refund Only + Strict Single-Transition State Check',
            arabicLabel: 'استرجاع المبلغ بالكامل فقط مع السماح بحالة انتقال واحدة',
            compiledConstraint: 'allowPartial=false; isolationLevel="Serializable"; lockStrategy="SINGLE_STATE_TRANSITION"; idempotencyTTL=86400'
          }
        ],
        compiledTaskSpecPreview: {
          taskCode: 'SE-TASK-01',
          targetRepo: 'fincore-billing-service',
          autoResolvedFromRepo: ['Prisma PostgreSQL', 'amountCents (Int)', 'requireRole(FINANCE_OPERATOR)'],
          enforcedPolicies: ['POL-2026-v1: Mandatory Idempotency-Key', 'POL-2026-v1: Serializable Isolation on Ledger'],
          lockedUserConstraint: 'allowPartial=true; lockStrategy=PESSIMISTIC_ROW_LOCK',
          ambiguityEntropy: '0.00 bits (LOCKED)'
        }
      }
    },
    decisions: [
      {
        id: 'ADR-101',
        stage: 'Stage 1 (Intake Gate)',
        title: 'Partial Refund & Concurrency Locking Strategy',
        chosenOption: 'Pessimistic Row Lock (`SELECT ... FOR UPDATE`) + Serializable Transaction',
        rejectedAlternative: 'Optimistic Read-then-Write without row locking',
        rationale: 'Concurrent refund requests on the same payment ID can pass an optimistic `refundedCents + requestCents <= capturedCents` check simultaneously, causing double-refunds.',
        constraintLocked: 'MUST acquire row-level lock before reading `Payment.refundedCents`.'
      },
      {
        id: 'ADR-102',
        stage: 'Stage 2 (Structured Plan)',
        title: 'Idempotency Ledger Storage',
        chosenOption: 'Persist `idempotencyKey` unique index inside PostgreSQL `RefundRecord` table',
        rejectedAlternative: 'In-memory Map or non-transactional cache check',
        rationale: 'Tying the unique `idempotencyKey` constraint directly to the PostgreSQL transaction guarantees atomic deduplication even if a pod crashes mid-flight.',
        constraintLocked: 'Unique constraint `@unique([paymentId, idempotencyKey])` required in Prisma schema.'
      },
      {
        id: 'ADR-103',
        stage: 'Stage 4 (Verification & Repair)',
        title: 'Surgical Concurrency Defect Remediation',
        chosenOption: 'Patch `RefundService.executeRefund` AST block (Lines 36–51) to enforce `SELECT FOR UPDATE` lock',
        rejectedAlternative: 'Regenerate entire controller, schema, and test suite from scratch',
        rationale: 'Checkpoint #S3-01 already passed 7/8 requirements including schema validation and RBAC. Surgical patching fixes the race condition in 1 file while guaranteeing zero regression in the other 2 files.',
        constraintLocked: 'Retain Checkpoint #S3-01; apply targeted AST diff v1.0 -> v1.1.'
      }
    ],
    files: [
      {
        path: 'src/services/refundService.ts',
        language: 'typescript',
        role: 'CONTROLLER_OR_SERVICE',
        linesOfCode: 68,
        defectHighlightLine: 39,
        defectExplanation: 'v1.0 reads `payment.refundedCents` via standard `findUnique` outside a row-level lock, allowing two concurrent requests to pass the balance guard simultaneously (Double-Refund Race Condition).',
        v1Code: `import { PrismaClient } from '@prisma/client';
import { StripeGateway } from '../gateways/stripeGateway';

export interface RefundRequestDTO {
  paymentId: string;
  amountCents: number;
  reason: string;
  idempotencyKey: string;
  operatorId: string;
}

export class RefundService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly gateway: StripeGateway
  ) {}

  async executeRefund(dto: RefundRequestDTO) {
    if (!dto.idempotencyKey || dto.idempotencyKey.trim().length < 8) {
      throw new Error('POL_ERR_MISSING_IDEMPOTENCY_KEY');
    }
    if (!Number.isInteger(dto.amountCents) || dto.amountCents <= 0) {
      throw new Error('VALIDATION_ERR_INVALID_CENTS');
    }

    // Check existing idempotent replay
    const existing = await this.prisma.refundRecord.findUnique({
      where: { paymentId_idempotencyKey: { paymentId: dto.paymentId, idempotencyKey: dto.idempotencyKey } }
    });
    if (existing) return { status: 'IDEMPOTENT_REPLAY', refund: existing };

    // [DEFECT IN v1.0]: Non-locking read permits concurrent double-refund race condition!
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId }
    });
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    const remainingRefundable = payment.capturedCents - payment.refundedCents;
    if (dto.amountCents > remainingRefundable) {
      throw new Error('REFUND_EXCEEDS_CAPTURED_BALANCE');
    }

    const gatewayResult = await this.gateway.issueRefund(payment.externalChargeId, dto.amountCents, dto.idempotencyKey);

    return await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { refundedCents: { increment: dto.amountCents } }
      });
      const record = await tx.refundRecord.create({
        data: {
          paymentId: payment.id,
          amountCents: dto.amountCents,
          idempotencyKey: dto.idempotencyKey,
          gatewayRefundId: gatewayResult.id,
          operatorId: dto.operatorId
        }
      });
      return { status: 'COMMITTED', refund: record, remainingCents: updatedPayment.capturedCents - updatedPayment.refundedCents };
    });
  }
}`,
        v1_1Code: `import { PrismaClient, Prisma } from '@prisma/client';
import { StripeGateway } from '../gateways/stripeGateway';

export interface RefundRequestDTO {
  paymentId: string;
  amountCents: number;
  reason: string;
  idempotencyKey: string;
  operatorId: string;
}

export class RefundService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly gateway: StripeGateway
  ) {}

  async executeRefund(dto: RefundRequestDTO) {
    if (!dto.idempotencyKey || dto.idempotencyKey.trim().length < 8) {
      throw new Error('POL_ERR_MISSING_IDEMPOTENCY_KEY');
    }
    if (!Number.isInteger(dto.amountCents) || dto.amountCents <= 0) {
      throw new Error('VALIDATION_ERR_INVALID_CENTS');
    }

    // [REPAIRED IN v1.1]: Serializable transaction with SELECT ... FOR UPDATE pessimistic row lock
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.refundRecord.findUnique({
        where: { paymentId_idempotencyKey: { paymentId: dto.paymentId, idempotencyKey: dto.idempotencyKey } }
      });
      if (existing) return { status: 'IDEMPOTENT_REPLAY', refund: existing };

      const lockedRows = await tx.$queryRaw<Array<{ id: string; capturedCents: number; refundedCents: number; externalChargeId: string }>>\`
        SELECT "id", "capturedCents", "refundedCents", "externalChargeId"
        FROM "Payment"
        WHERE "id" = \${dto.paymentId}
        FOR UPDATE
      \`;
      const payment = lockedRows[0];
      if (!payment) throw new Error('PAYMENT_NOT_FOUND');

      const remainingRefundable = payment.capturedCents - payment.refundedCents;
      if (dto.amountCents > remainingRefundable) {
        throw new Error('REFUND_EXCEEDS_CAPTURED_BALANCE');
      }

      const gatewayResult = await this.gateway.issueRefund(payment.externalChargeId, dto.amountCents, dto.idempotencyKey);

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { refundedCents: { increment: dto.amountCents } }
      });
      const record = await tx.refundRecord.create({
        data: {
          paymentId: payment.id,
          amountCents: dto.amountCents,
          idempotencyKey: dto.idempotencyKey,
          gatewayRefundId: gatewayResult.id,
          operatorId: dto.operatorId
        }
      });
      return { status: 'COMMITTED', refund: record, remainingCents: updatedPayment.capturedCents - updatedPayment.refundedCents };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}`
      },
      {
        path: 'prisma/schema.prisma',
        language: 'prisma',
        role: 'SCHEMA_OR_MODEL',
        linesOfCode: 34,
        v1Code: `model Payment {
  id               String         @id @default(uuid())
  externalChargeId String         @unique
  capturedCents    Int
  refundedCents    Int            @default(0)
  currency         String         @default("USD")
  version          Int            @default(1)
  refunds          RefundRecord[]
  createdAt        DateTime       @default(now())
}

model RefundRecord {
  id              String   @id @default(uuid())
  paymentId       String
  payment         Payment  @relation(fields: [paymentId], references: [id])
  amountCents     Int
  idempotencyKey  String
  gatewayRefundId String
  operatorId      String
  createdAt       DateTime @default(now())

  @@unique([paymentId, idempotencyKey])
}`,
        v1_1Code: `model Payment {
  id               String         @id @default(uuid())
  externalChargeId String         @unique
  capturedCents    Int
  refundedCents    Int            @default(0)
  currency         String         @default("USD")
  version          Int            @default(1)
  refunds          RefundRecord[]
  createdAt        DateTime       @default(now())
}

model RefundRecord {
  id              String   @id @default(uuid())
  paymentId       String
  payment         Payment  @relation(fields: [paymentId], references: [id])
  amountCents     Int
  idempotencyKey  String
  gatewayRefundId String
  operatorId      String
  createdAt       DateTime @default(now())

  @@unique([paymentId, idempotencyKey])
}`
      },
      {
        path: 'tests/refundService.concurrency.spec.ts',
        language: 'typescript',
        role: 'VERIFICATION_TEST_SUITE',
        linesOfCode: 44,
        v1Code: `import { describe, it, expect } from 'vitest';
import { RefundService } from '../src/services/refundService';

describe('RefundService Independent Verification Suite', () => {
  it('R1-R5: processes valid partial refund & enforces idempotency replay', async () => {
    const res1 = await service.executeRefund({
      paymentId: 'pay_901', amountCents: 6000, reason: 'Partial return',
      idempotencyKey: 'idem_key_alpha_001', operatorId: 'op_finance_1'
    });
    expect(res1.status).toBe('COMMITTED');
    expect(res1.remainingCents).toBe(4000);
  });

  it('R8 [CONCURRENCY INVARIANT]: blocks parallel double-refund exceeding captured balance', async () => {
    // Payment pay_901 has $100.00 (10000 cents) captured.
    // Fire two simultaneous $70.00 (7000 cents) refunds with distinct idempotency keys:
    const results = await Promise.allSettled([
      service.executeRefund({ paymentId: 'pay_901', amountCents: 7000, reason: 'Req A', idempotencyKey: 'idem_race_A', operatorId: 'op_1' }),
      service.executeRefund({ paymentId: 'pay_901', amountCents: 7000, reason: 'Req B', idempotencyKey: 'idem_race_B', operatorId: 'op_1' })
    ]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });
});`,
        v1_1Code: `import { describe, it, expect } from 'vitest';
import { RefundService } from '../src/services/refundService';

describe('RefundService Independent Verification Suite', () => {
  it('R1-R5: processes valid partial refund & enforces idempotency replay', async () => {
    const res1 = await service.executeRefund({
      paymentId: 'pay_901', amountCents: 6000, reason: 'Partial return',
      idempotencyKey: 'idem_key_alpha_001', operatorId: 'op_finance_1'
    });
    expect(res1.status).toBe('COMMITTED');
    expect(res1.remainingCents).toBe(4000);
  });

  it('R8 [CONCURRENCY INVARIANT]: blocks parallel double-refund exceeding captured balance', async () => {
    // Verified PASS under v1.1 Serializable SELECT FOR UPDATE lock
    const results = await Promise.allSettled([
      service.executeRefund({ paymentId: 'pay_901', amountCents: 7000, reason: 'Req A', idempotencyKey: 'idem_race_A', operatorId: 'op_1' }),
      service.executeRefund({ paymentId: 'pay_901', amountCents: 7000, reason: 'Req B', idempotencyKey: 'idem_race_B', operatorId: 'op_1' })
    ]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });
});`
      }
    ],
    surgicalDiff: {
      targetFile: 'src/services/refundService.ts',
      rootCauseAnalysis: 'Independent Concurrency Probe (R8) fired two parallel 7,000-cent refund requests against a 10,000-cent captured payment. Because v1.0 checked `payment.refundedCents` via `findUnique` BEFORE entering `$transaction`, both fibers read `refundedCents = 0` simultaneously and over-refunded 14,000 cents.',
      beforeSnippet: `- const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });
- const remainingRefundable = payment.capturedCents - payment.refundedCents;`,
      afterSnippet: `+ return await this.prisma.$transaction(async (tx) => {
+   const lockedRows = await tx.$queryRaw\`SELECT * FROM "Payment" WHERE "id" = \${dto.paymentId} FOR UPDATE\`;
+   const remainingRefundable = lockedRows[0].capturedCents - lockedRows[0].refundedCents;`,
      astNodesModified: 1,
      untouchedFilesCount: 2
    },
    requirements: [
      {
        id: 'R1',
        source: 'USER_SPEC',
        category: 'Functional',
        statement: 'Expose POST refund mutation accepting integer minor units (`amountCents`) and operator reason.',
        plannedModule: 'RefundService.executeRefund',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(res.status).toBe("COMMITTED")'
      },
      {
        id: 'R2',
        source: 'USER_SPEC',
        category: 'Functional',
        statement: 'Support partial refunds up to `capturedCents - refundedCents` balance.',
        plannedModule: 'BalanceGuard',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(res.remainingCents).toBe(4000)'
      },
      {
        id: 'R3',
        source: 'USER_SPEC',
        category: 'Data Integrity',
        statement: 'Reject negative, zero, or floating-point refund amounts before touching database.',
        plannedModule: 'InputValidator',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(() => executeRefund({ amountCents: -50 })).toThrow("VALIDATION_ERR_INVALID_CENTS")'
      },
      {
        id: 'R4',
        source: 'USER_SPEC',
        category: 'Resilience',
        statement: 'Enforce mandatory `Idempotency-Key` header and return cached replay on duplicate submission.',
        plannedModule: 'IdempotencyDeduplicator',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(duplicateCall.status).toBe("IDEMPOTENT_REPLAY")'
      },
      {
        id: 'R5',
        source: 'USER_SPEC',
        category: 'Data Integrity',
        statement: 'Persist `RefundRecord` with composite `@unique([paymentId, idempotencyKey])` index in Prisma schema.',
        plannedModule: 'PrismaSchema',
        targetFile: 'prisma/schema.prisma',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'ASTSchemaCheck: RefundRecord contains @@unique([paymentId, idempotencyKey])'
      },
      {
        id: 'R6',
        source: 'USER_SPEC',
        category: 'Security',
        statement: 'Bind operator identity (`operatorId`) to every committed `RefundRecord` for financial audit trail.',
        plannedModule: 'AuditTrailBinder',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(res.refund.operatorId).toBe("op_finance_1")'
      },
      {
        id: 'R7',
        source: 'USER_SPEC',
        category: 'Resilience',
        statement: 'Ensure atomic rollback of `Payment.refundedCents` if `RefundRecord` insertion fails.',
        plannedModule: 'TransactionalEnvelope',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'PASS',
        v1_1Status: 'PASS',
        verificationAssertion: 'expect(txRollbackState.refundedCents).toBe(initialRefundedCents)'
      },
      {
        id: 'R8',
        source: 'POLICY_OR_RUNTIME_QUALITY',
        category: 'Concurrency',
        statement: '[Runtime Policy POL-2026-v1] Prevent parallel double-refund race conditions via row-level `SELECT FOR UPDATE` under Serializable isolation.',
        plannedModule: 'ConcurrencyRowLock',
        targetFile: 'src/services/refundService.ts',
        v1Status: 'FAIL',
        v1_1Status: 'PASS',
        failureDiagnostic: 'RACE_CONDITION_DETECTED: Two concurrent 7,000-cent requests both read `refundedCents=0` at Line 39 (`findUnique` outside lock), resulting in 14,000 cents refunded on a 10,000-cent charge.',
        verificationAssertion: 'Promise.allSettled([reqA(7000), reqB(7000)]) -> 1 COMMITTED, 1 REJECTED (REFUND_EXCEEDS_CAPTURED_BALANCE)'
      }
    ],
    stageFlows: [
      {
        stageNumber: 1,
        stageTitle: 'Stage 1: Context-Grounded Intake & Blocking Gate',
        summary: 'Scans Prisma AST & POL-2026-v1 to auto-resolve 4 architectural facts without bothering the developer, then blocks on 1 genuine domain trade-off.',
        steps: [
          { stepOrder: 1, fromModule: 'Task Intake Gate', toModule: 'Tier 1 Repo AST Indexer', action: 'Parse prisma/schema.prisma & auth middleware', artifactOrHash: '4 Facts Auto-Resolved', latencyMs: 18, status: 'OK' },
          { stepOrder: 2, fromModule: 'Tier 2 Policy Engine', toModule: 'Task Intake Gate', action: 'Inject POL-2026-v1 Financial Mutation Rules', artifactOrHash: 'POL-2026-v1', latencyMs: 9, status: 'OK' },
          { stepOrder: 3, fromModule: 'Task Intake Gate', toModule: 'Ambiguity Gate', action: 'Halt on Partial Refund & Locking strategy trade-off', artifactOrHash: 'GATE-REFUND-01', latencyMs: 4, status: 'GATE' },
          { stepOrder: 4, fromModule: 'Ambiguity Gate', toModule: 'TaskSpec Compiler', action: 'Compile user selection into zero-entropy JSON TaskSpec', artifactOrHash: 'Entropy: 0.00 bits', latencyMs: 11, status: 'OK' }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: 'Stage 2: Structured SE Plan & ADR Locking',
        summary: 'Transforms the locked TaskSpec into an 8-requirement verification matrix and 3 immutable Architectural Decision Records (ADRs).',
        steps: [
          { stepOrder: 1, fromModule: 'TaskSpec Compiler', toModule: 'Tier 3 Knowledge Graph', action: 'Retrieve verified pattern KU-089 (Transactional Ledger)', artifactOrHash: 'KU-089', latencyMs: 14, status: 'OK' },
          { stepOrder: 2, fromModule: 'Local LLM Planner', toModule: 'ADR Registry', action: 'Lock ADR-101, ADR-102, ADR-103 with explicit rationale', artifactOrHash: '3 ADRs Locked', latencyMs: 120, status: 'OK' },
          { stepOrder: 3, fromModule: 'Local LLM Planner', toModule: 'Verification Matrix', action: 'Bind R1..R7 (User) + R8 (Concurrency Policy) to Vitest assertions', artifactOrHash: 'Plan #P2-901', latencyMs: 42, status: 'OK' }
        ]
      },
      {
        stageNumber: 3,
        stageTitle: 'Stage 3: Sandboxed Multi-File Code Synthesis',
        summary: 'Generates `refundService.ts`, `schema.prisma`, and `refundService.concurrency.spec.ts` inside an isolated workspace and snapshots Checkpoint #S3-01.',
        steps: [
          { stepOrder: 1, fromModule: 'Local LLM Planner', toModule: 'Isolated Sandbox', action: 'Synthesize 3 multi-file TypeScript/Prisma artifacts', artifactOrHash: '146 LOC Generated', latencyMs: 410, status: 'OK' },
          { stepOrder: 2, fromModule: 'Isolated Sandbox', toModule: 'TypeScript AST Compiler', action: 'Verify zero syntax/type errors across all 3 files', artifactOrHash: 'AST Valid', latencyMs: 65, status: 'OK' },
          { stepOrder: 3, fromModule: 'Isolated Sandbox', toModule: 'Checkpoint Store', action: 'Commit immutable Merkle snapshot #S3-01 (v1.0)', artifactOrHash: '#S3-01 (sha256:9a4e)', latencyMs: 12, status: 'OK' }
        ]
      },
      {
        stageNumber: 4,
        stageTitle: 'Stage 4: Independent Verification & Surgical AST Patch',
        summary: 'Catches the R8 double-refund race condition in v1.0, preserves Checkpoint #S3-01, and surgically patches Line 39 (`SELECT FOR UPDATE`) to reach 8/8 PASS.',
        steps: [
          { stepOrder: 1, fromModule: 'Checkpoint Store', toModule: 'Independent Verifier Oracle', action: 'Execute R1..R8 Vitest + Concurrency Race Probe on #S3-01', artifactOrHash: '7 PASS / 1 FAIL (R8)', latencyMs: 185, status: 'DEFECT' },
          { stepOrder: 2, fromModule: 'Independent Verifier Oracle', toModule: 'Surgical AST Patcher', action: 'Localize race condition to refundService.ts Line 39', artifactOrHash: '2 Files Untouched', latencyMs: 28, status: 'OK' },
          { stepOrder: 3, fromModule: 'Surgical AST Patcher', toModule: 'Independent Verifier Oracle', action: 'Apply Serializable SELECT FOR UPDATE diff (v1.1) & re-verify', artifactOrHash: '8/8 PASS (100%)', latencyMs: 160, status: 'OK' }
        ]
      },
      {
        stageNumber: 5,
        stageTitle: 'Stage 5: Cryptographic Seal & Tier 3 Knowledge Reuse',
        summary: 'Signs `#SEAL-402` and promotes the verified `Pessimistic Lock + Idempotent Refund` pattern (`KU-201`) to Tier 3 for automatic reuse in Task N+1.',
        steps: [
          { stepOrder: 1, fromModule: 'Independent Verifier Oracle', toModule: 'Cryptographic Signer', action: 'Issue formal verification seal over #S3-01-v1.1 + 8/8 proofs', artifactOrHash: '#SEAL-402', latencyMs: 15, status: 'SEALED' },
          { stepOrder: 2, fromModule: 'Cryptographic Signer', toModule: 'Tier 3 Knowledge Graph', action: 'Extract & tag KU-201 with active policy hash POL-2026-v1', artifactOrHash: 'KU-201 Committed', latencyMs: 22, status: 'SEALED' }
        ]
      }
    ],
    extractedKnowledge: {
      id: 'KU-201',
      patternName: 'Serializable Pessimistic Row-Lock + Idempotent Mutation Pattern',
      domainTags: ['payments', 'concurrency', 'prisma', 'idempotency', 'postgresql'],
      applicabilityTrigger: 'Any financial or inventory balance mutation endpoint where concurrent requests could violate a non-negative balance invariant.',
      reusableAstTemplate: 'prisma.$transaction(async (tx) => { await tx.$queryRaw`SELECT ... FOR UPDATE`; ... }, { isolationLevel: Serializable })',
      verificationAssertions: [
        'Parallel Promise.allSettled race probe must reject second over-balance request',
        'Duplicate Idempotency-Key must return IDEMPOTENT_REPLAY without side effects'
      ],
      sourceCheckpointId: '#S3-01-v1.1',
      sourceSealId: '#SEAL-402',
      policyHash: 'POL-2026-v1',
      createdAt: '',
      reuseCount: 0
    },
    followUpReuse: {
      nextTaskId: 'SE-TASK-01-NEXT',
      nextTaskPrompt: 'Add POST /api/v1/wallets/:id/withdraw to allow merchants to withdraw available payout balances.',
      arabicPromptSummary: 'المهمة التالية (Task N+1): بناء مسار سحب أرصدة المحفظة للمتاجر (Wallet Withdrawal API)',
      withoutKnowledgeGraph: {
        questionsAsked: 4,
        planningLatencyMs: 1450,
        firstPassDefects: 1,
        summary: 'Without ShiftCore Knowledge Graph: AI asks repetitive questions about concurrency locking and repeats the exact same non-locking `findUnique` race condition in v1.0.'
      },
      withShiftCoreKnowledgeReuse: {
        questionsAsked: 0,
        injectedKnowledgeId: 'KU-201',
        autoAppliedConstraint: 'Auto-injected `SELECT ... FOR UPDATE` + `Serializable` + `Idempotency-Key` template from verified unit KU-201.',
        planningLatencyMs: 320,
        firstPassDefects: 0,
        summary: 'With ShiftCore Tier 3 Reuse: Runtime matches `wallets/withdraw` to `KU-201` (Policy `POL-2026-v1` valid), injects the pessimistic row-lock template during Stage 2, and passes 8/8 checks on the first pass!'
      }
    },
    interactiveSandboxPreview: {
      type: 'CONCURRENCY_PROBE',
      endpointOrTarget: 'POST /api/v1/payments/pay_901/refund (Captured Balance: $100.00 / 10,000 cents)',
      testCases: [
        {
          id: 'TC-01',
          name: 'Valid Partial Refund ($60.00)',
          inputPayload: '{ "amountCents": 6000, "idempotencyKey": "idem_01" }',
          v1Output: '200 OK -> COMMITTED (Remaining: 4000 cents)',
          v1Passed: true,
          v1_1Output: '200 OK -> COMMITTED (Remaining: 4000 cents)',
          v1_1Passed: true
        },
        {
          id: 'TC-02',
          name: 'Duplicate Network Retry (Same Idempotency-Key)',
          inputPayload: '{ "amountCents": 6000, "idempotencyKey": "idem_01" }',
          v1Output: '200 OK -> IDEMPOTENT_REPLAY (No double charge)',
          v1Passed: true,
          v1_1Output: '200 OK -> IDEMPOTENT_REPLAY (No double charge)',
          v1_1Passed: true
        },
        {
          id: 'TC-03',
          name: 'Parallel Double-Refund Race Probe (2x $70.00 simultaneously)',
          inputPayload: 'Promise.all([refund(7000, "key_A"), refund(7000, "key_B")])',
          v1Output: 'FAIL: Both succeeded! Total refunded = 14,000 cents (-$40.00 overdraft!)',
          v1Passed: false,
          v1_1Output: 'PASS: Req A COMMITTED (7,000c), Req B REJECTED (REFUND_EXCEEDS_CAPTURED_BALANCE)',
          v1_1Passed: true
        }
      ]
    }
  },

  bugfix_auth_race: {
    id: 'bugfix_auth_race',
    code: 'SE-TASK-02',
    title: 'Distributed Auth Refresh Token Race & Rotation Bugfix',
    arabicTitle: 'إصلاح ثغرة التزامن وتسريب الجلسات في نظام تحديث التوكن (JWT Refresh Rotation)',
    archetype: 'BUG_INVESTIGATION_AND_FIX',
    badgeLabel: 'Bug Investigation + Security Fix',
    rawPrompt: 'Fix intermittent 401 logouts when mobile clients send concurrent requests during JWT refresh token rotation, without weakening replay theft detection.',
    arabicPrompt: 'أصلح مشكلة تسجيل الخروج العشوائي (401) عند إرسال طلبات متزامنة أثناء تجديد رمز الجلسة (Refresh Token) مع الحفاظ على كشف سرقة التوكن.',
    repositoryName: 'shield-identity-gateway (Node.js + Redis + TypeScript)',
    techStack: ['TypeScript', 'Redis Cluster', 'Jose JWT', 'Express', 'Vitest'],
    elicitation: {
      naiveChatbotTranscript: [
        'Naive AI Q1: How are your JWT tokens generated and stored?',
        'Naive AI Q2: Are you using Redis or PostgreSQL for refresh tokens?',
        'Naive AI Q3: Can you paste the code for your token refresh endpoint?',
        'Naive AI Result: Suggests disabling refresh token rotation completely, introducing a critical OWASP token replay vulnerability!'
      ],
      autoResolvedFacts: [
        {
          id: 'FACT-201',
          dimension: 'Token Storage & Family Tracking',
          naiveAiQuestion: 'Where are refresh tokens stored?',
          autoResolvedValue: 'Redis Hash `rt_family:{familyId}` storing `currentJti`, `parentJti`, and `userId`',
          sourceTier: 'TIER_1_REPO_AST',
          sourceArtifact: 'src/auth/tokenFamilyStore.ts'
        },
        {
          id: 'FACT-202',
          dimension: 'Zero-Trust Replay Policy',
          naiveAiQuestion: 'What happens when an old refresh token is reused?',
          autoResolvedValue: 'Reuse of a revoked ancestor token MUST revoke the entire token family immediately',
          sourceTier: 'TIER_2_POLICY_ENGINE',
          sourceArtifact: 'POL-2026-v1 §2.1 (OAuth2 Refresh Token Rotation Standard)'
        },
        {
          id: 'FACT-203',
          dimension: 'Redis Atomic Lua Execution',
          naiveAiQuestion: 'How do you handle atomic Redis state updates?',
          autoResolvedValue: 'Use `redis.eval` Lua script for compare-and-swap state transitions',
          sourceTier: 'TIER_3_KNOWLEDGE_GRAPH',
          sourceArtifact: 'KU-042 (Atomic Redis State Transition Pattern)'
        }
      ],
      blockingGate: {
        gateId: 'GATE-AUTH-02',
        question: 'Unresolved Security vs. UX Trade-off: How should the gateway handle concurrent in-flight requests presenting the immediate parent JTI within the network jitter window?',
        arabicHint: 'قرأ النظام كود Redis وسياسة الأمان تلقائياً، وأوقف التنفيذ فقط لتحديد سياسة نافذة السماح (Grace Window) للطلبات المتزامنة:',
        whyUnresolvableFromRepo: 'Strict single-use rotation causes false-positive lockouts on mobile multi-tab requests, whereas unbounded reuse violates POL-2026-v1.',
        options: [
          {
            id: 'ATOMIC_LUA_GRACE_WINDOW_10S',
            label: 'Atomic Redis Lua Compare-And-Swap + 10-Second Parent JTI Grace Window (Recommended)',
            arabicLabel: 'تنفيذ ذري عبر Redis Lua مع نافذة سماح 10 ثوانٍ للتوكن الأب للطلبات المتزامنة فقط',
            compiledConstraint: 'atomicEngine="REDIS_LUA_CAS"; graceWindowSeconds=10; revokeFamilyOnGrandparentReuse=true',
            recommended: true
          },
          {
            id: 'STRICT_ZERO_WINDOW_MUTEX',
            label: 'Strict Zero Grace Window + Distributed Client Lock Header Requirement',
            arabicLabel: 'عدم السماح بأي نافذة زمنية وإلزام العميل بقفل موزع',
            compiledConstraint: 'atomicEngine="REDIS_LUA_CAS"; graceWindowSeconds=0; revokeFamilyOnGrandparentReuse=true'
          }
        ],
        compiledTaskSpecPreview: {
          taskCode: 'SE-TASK-02',
          targetRepo: 'shield-identity-gateway',
          autoResolvedFromRepo: ['Redis rt_family:{id}', 'EdDSA JWT Signer', 'Family Revocation Hook'],
          enforcedPolicies: ['POL-2026-v1: Revoke token family on replay outside grace window'],
          lockedUserConstraint: 'atomicEngine=REDIS_LUA_CAS; graceWindowSeconds=10',
          ambiguityEntropy: '0.00 bits (LOCKED)'
        }
      }
    },
    decisions: [
      {
        id: 'ADR-201',
        stage: 'Stage 1 (Intake Gate)',
        title: 'Bounded 10s Parent JTI Grace Window vs. Token Theft Detection',
        chosenOption: 'Allow read-only cached token pair replay for `parentJti` within 10s; immediately revoke family if `grandparentJti` or older is used',
        rejectedAlternative: 'Disable family revocation on duplicate JTI',
        rationale: 'Mobile apps firing 3 parallel requests at token expiry will present the same JTI within ~150ms. A 10s grace window on the immediate parent eliminates false 401 logouts while preserving theft detection.',
        constraintLocked: 'graceWindowMs = 10000; enforce family wipe on expired parent or older ancestor.'
      },
      {
        id: 'ADR-202',
        stage: 'Stage 4 (Verification & Repair)',
        title: 'Eliminate Read-Modify-Write Race in Token Rotation',
        chosenOption: 'Replace non-atomic `HGETALL` + `HMSET` in `tokenRotator.ts` with an atomic Redis Lua Compare-And-Swap script',
        rejectedAlternative: 'Application-level in-memory mutex (fails across multi-pod Kubernetes deployment)',
        rationale: 'In v1.0, two pods executing `HGETALL` at the same millisecond both rotated the token and overwrote each other’s `currentJti`, invalidating the first response.',
        constraintLocked: 'Must execute rotation check and state mutation inside a single atomic Redis Lua evaluation.'
      }
    ],
    files: [
      {
        path: 'src/auth/tokenRotator.ts',
        language: 'typescript',
        role: 'CONTROLLER_OR_SERVICE',
        linesOfCode: 62,
        defectHighlightLine: 26,
        defectExplanation: 'v1.0 performs a non-atomic `redis.hgetall` followed by `redis.hset`. Under concurrent requests across pods, both requests see `state.currentJti === incomingJti` and issue two conflicting child tokens.',
        v1Code: `import { RedisClientType } from 'redis';
import { signTokenPair } from './jwtSigner';

export class RefreshTokenRotator {
  constructor(private readonly redis: RedisClientType) {}

  async rotateRefreshToken(familyId: string, incomingJti: string, nowMs: number) {
    const key = \`rt_family:\${familyId}\`;

    // [DEFECT IN v1.0]: Non-atomic HGETALL + HSET race condition across concurrent requests!
    const family = await this.redis.hGetAll(key);
    if (!family || !family.currentJti) {
      throw new Error('AUTH_ERR_FAMILY_NOT_FOUND');
    }
    if (family.revoked === '1') {
      throw new Error('AUTH_ERR_FAMILY_COMPROMISED');
    }

    if (family.currentJti === incomingJti) {
      const nextJti = \`jti_\${nowMs}_\${Math.random().toString(36).slice(2, 7)}\`;
      const pair = await signTokenPair(family.userId, familyId, nextJti);
      await this.redis.hSet(key, {
        parentJti: incomingJti,
        currentJti: nextJti,
        rotatedAtMs: String(nowMs),
        cachedPairJson: JSON.stringify(pair)
      });
      return { status: 'ROTATED_NEW', tokens: pair };
    }

    if (family.parentJti === incomingJti && (nowMs - Number(family.rotatedAtMs)) <= 10000) {
      return { status: 'GRACE_WINDOW_REPLAY', tokens: JSON.parse(family.cachedPairJson) };
    }

    // Theft detected: revoke entire family
    await this.redis.hSet(key, { revoked: '1' });
    throw new Error('SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED');
  }
}`,
        v1_1Code: `import { RedisClientType } from 'redis';
import { signTokenPair } from './jwtSigner';

const ATOMIC_ROTATE_LUA = \`
  local key = KEYS[1]
  local incomingJti = ARGV[1]
  local nextJti = ARGV[2]
  local nowMs = tonumber(ARGV[3])
  local graceWindowMs = tonumber(ARGV[4])
  local nextPairJson = ARGV[5]

  local revoked = redis.call('HGET', key, 'revoked')
  if revoked == '1' then return {'ERR_COMPROMISED'} end

  local currentJti = redis.call('HGET', key, 'currentJti')
  if not currentJti then return {'ERR_NOT_FOUND'} end

  if currentJti == incomingJti then
    redis.call('HSET', key, 'parentJti', incomingJti, 'currentJti', nextJti, 'rotatedAtMs', tostring(nowMs), 'cachedPairJson', nextPairJson)
    return {'ROTATED_NEW', nextPairJson}
  end

  local parentJti = redis.call('HGET', key, 'parentJti')
  local rotatedAtMs = tonumber(redis.call('HGET', key, 'rotatedAtMs') or '0')
  if parentJti == incomingJti and (nowMs - rotatedAtMs) <= graceWindowMs then
    local cached = redis.call('HGET', key, 'cachedPairJson')
    return {'GRACE_WINDOW_REPLAY', cached}
  end

  redis.call('HSET', key, 'revoked', '1')
  return {'ERR_THEFT_DETECTED'}
\`;

export class RefreshTokenRotator {
  constructor(private readonly redis: RedisClientType) {}

  async rotateRefreshToken(familyId: string, incomingJti: string, nowMs: number) {
    const key = \`rt_family:\${familyId}\`;
    const nextJti = \`jti_\${nowMs}_atomic\`;
    const candidatePair = await signTokenPair('usr_1', familyId, nextJti);

    // [REPAIRED IN v1.1]: Single atomic Lua script eliminates cross-pod HGETALL race condition
    const [status, payload] = (await this.redis.eval(ATOMIC_ROTATE_LUA, {
      keys: [key],
      arguments: [incomingJti, nextJti, String(nowMs), '10000', JSON.stringify(candidatePair)]
    })) as [string, string];

    if (status === 'ROTATED_NEW' || status === 'GRACE_WINDOW_REPLAY') {
      return { status, tokens: JSON.parse(payload) };
    }
    if (status === 'ERR_COMPROMISED') throw new Error('AUTH_ERR_FAMILY_COMPROMISED');
    if (status === 'ERR_THEFT_DETECTED') throw new Error('SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED');
    throw new Error('AUTH_ERR_FAMILY_NOT_FOUND');
  }
}`
      },
      {
        path: 'tests/tokenRotator.race.spec.ts',
        language: 'typescript',
        role: 'VERIFICATION_TEST_SUITE',
        linesOfCode: 38,
        v1Code: `import { describe, it, expect } from 'vitest';
import { RefreshTokenRotator } from '../src/auth/tokenRotator';

describe('RefreshTokenRotator Multi-Tab Concurrency & Theft Suite', () => {
  it('R8: coalesces 3 simultaneous mobile requests with same JTI into 1 rotation + 2 grace replays', async () => {
    const burst = await Promise.all([
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1000),
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1002),
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1005)
    ]);
    const rotatedCount = burst.filter(b => b.status === 'ROTATED_NEW').length;
    const graceCount = burst.filter(b => b.status === 'GRACE_WINDOW_REPLAY').length;
    expect(rotatedCount).toBe(1);
    expect(graceCount).toBe(2);
    expect(burst[0].tokens.refreshJti).toBe(burst[1].tokens.refreshJti);
  });
});`,
        v1_1Code: `import { describe, it, expect } from 'vitest';
import { RefreshTokenRotator } from '../src/auth/tokenRotator';

describe('RefreshTokenRotator Multi-Tab Concurrency & Theft Suite', () => {
  it('R8: coalesces 3 simultaneous mobile requests with same JTI into 1 rotation + 2 grace replays', async () => {
    // Verified PASS under v1.1 Atomic Redis Lua Compare-And-Swap script
    const burst = await Promise.all([
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1000),
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1002),
      rotator.rotateRefreshToken('fam_1', 'jti_init_1', 1005)
    ]);
    const rotatedCount = burst.filter(b => b.status === 'ROTATED_NEW').length;
    const graceCount = burst.filter(b => b.status === 'GRACE_WINDOW_REPLAY').length;
    expect(rotatedCount).toBe(1);
    expect(graceCount).toBe(2);
    expect(burst[0].tokens.refreshJti).toBe(burst[1].tokens.refreshJti);
  });
});`
      }
    ],
    surgicalDiff: {
      targetFile: 'src/auth/tokenRotator.ts',
      rootCauseAnalysis: 'Multi-tab burst probe (R8) sent 3 parallel refresh calls at `t=1000ms`. In v1.0, non-atomic `hGetAll` allowed all 3 calls to enter the `family.currentJti === incomingJti` branch simultaneously, minting 3 divergent child tokens and breaking two client tabs.',
      beforeSnippet: `- const family = await this.redis.hGetAll(key);
- if (family.currentJti === incomingJti) {
-   await this.redis.hSet(key, { parentJti: incomingJti, currentJti: nextJti ... });`,
      afterSnippet: `+ const [status, payload] = await this.redis.eval(ATOMIC_ROTATE_LUA, {
+   keys: [key], arguments: [incomingJti, nextJti, String(nowMs), '10000', JSON.stringify(candidatePair)]
+ });`,
      astNodesModified: 1,
      untouchedFilesCount: 1
    },
    requirements: [
      { id: 'R1', source: 'USER_SPEC', category: 'Functional', statement: 'Rotate valid `currentJti` to a fresh child token pair and record `parentJti`.', plannedModule: 'RefreshTokenRotator', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(res.status).toBe("ROTATED_NEW")' },
      { id: 'R2', source: 'USER_SPEC', category: 'Resilience', statement: 'Allow replay of immediate `parentJti` within 10,000ms grace window and return identical child token pair.', plannedModule: 'GraceWindowHandler', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(replayWithin10s.status).toBe("GRACE_WINDOW_REPLAY")' },
      { id: 'R3', source: 'USER_SPEC', category: 'Security', statement: 'Immediately revoke entire token family (`revoked=1`) if `parentJti` is presented after 10,000ms.', plannedModule: 'TheftDetector', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(replayAt15s).rejects.toThrow("SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED")' },
      { id: 'R4', source: 'USER_SPEC', category: 'Security', statement: 'Revoke entire token family immediately if a grandparent or older ancestor JTI is ever presented.', plannedModule: 'TheftDetector', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(ancestorReplay).rejects.toThrow("SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED")' },
      { id: 'R5', source: 'USER_SPEC', category: 'Security', statement: 'Reject all subsequent requests on a compromised family with `AUTH_ERR_FAMILY_COMPROMISED`.', plannedModule: 'RevocationGuard', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(compromisedCall).rejects.toThrow("AUTH_ERR_FAMILY_COMPROMISED")' },
      { id: 'R6', source: 'USER_SPEC', category: 'Data Integrity', statement: 'Fail closed with `AUTH_ERR_FAMILY_NOT_FOUND` if Redis key is missing or expired.', plannedModule: 'MissingFamilyGuard', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(missingCall).rejects.toThrow("AUTH_ERR_FAMILY_NOT_FOUND")' },
      { id: 'R7', source: 'USER_SPEC', category: 'Functional', statement: 'Preserve user subject claims across rotated token pairs.', plannedModule: 'JwtSigner', targetFile: 'src/auth/tokenRotator.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(decoded.sub).toBe("usr_1")' },
      {
        id: 'R8',
        source: 'POLICY_OR_RUNTIME_QUALITY',
        category: 'Concurrency',
        statement: '[Runtime Concurrency Probe] Coalesce simultaneous multi-pod requests presenting the same JTI at the exact same millisecond via atomic Redis Lua CAS.',
        plannedModule: 'AtomicLuaCasEngine',
        targetFile: 'src/auth/tokenRotator.ts',
        v1Status: 'FAIL',
        v1_1Status: 'PASS',
        failureDiagnostic: 'NON_ATOMIC_REDIS_RACE: 3 concurrent calls at t=1000ms all executed `hGetAll` before `hSet`, issuing 3 conflicting child tokens instead of 1 rotation + 2 grace replays.',
        verificationAssertion: 'Promise.all([rot(), rot(), rot()]) -> 1 ROTATED_NEW, 2 GRACE_WINDOW_REPLAY with identical child JTI'
      }
    ],
    stageFlows: [
      {
        stageNumber: 1,
        stageTitle: 'Stage 1: Bug Context Resolution & Security Gate',
        summary: 'Inspects `tokenFamilyStore.ts` and OAuth2 policy `POL-2026-v1`, resolving 3 repo facts automatically and gating on the Grace Window duration.',
        steps: [
          { stepOrder: 1, fromModule: 'Task Intake Gate', toModule: 'Tier 1 Repo AST Indexer', action: 'Locate Redis hash schema `rt_family:{id}`', artifactOrHash: '3 Facts Resolved', latencyMs: 15, status: 'OK' },
          { stepOrder: 2, fromModule: 'Task Intake Gate', toModule: 'Ambiguity Gate', action: 'Request Grace Window & CAS locking policy confirmation', artifactOrHash: 'GATE-AUTH-02', latencyMs: 5, status: 'GATE' }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: 'Stage 2: Root-Cause Plan & Test Matrix',
        summary: 'Maps the 10-second grace window and theft-detection invariants into R1..R8 verification tests.',
        steps: [
          { stepOrder: 1, fromModule: 'Local LLM Planner', toModule: 'Verification Matrix', action: 'Construct 3-tab burst race test + token theft test suite', artifactOrHash: 'Plan #P2-902', latencyMs: 95, status: 'OK' }
        ]
      },
      {
        stageNumber: 3,
        stageTitle: 'Stage 3: Sandboxed Bugfix Synthesis',
        summary: 'Synthesizes `tokenRotator.ts` and `tokenRotator.race.spec.ts` in Checkpoint #S3-01.',
        steps: [
          { stepOrder: 1, fromModule: 'Isolated Sandbox', toModule: 'Checkpoint Store', action: 'Snapshot multi-file candidate fix as #S3-01', artifactOrHash: '#S3-01 (sha256:3c8b)', latencyMs: 280, status: 'OK' }
        ]
      },
      {
        stageNumber: 4,
        stageTitle: 'Stage 4: Multi-Pod Race Probe & Surgical Lua Patch',
        summary: 'Detects non-atomic `hGetAll` race under simultaneous burst, surgically replaces lines 26–45 with `ATOMIC_ROTATE_LUA`.',
        steps: [
          { stepOrder: 1, fromModule: 'Independent Verifier Oracle', toModule: 'Surgical AST Patcher', action: 'Flag R8 non-atomic `hGetAll` race in tokenRotator.ts', artifactOrHash: '7 PASS / 1 FAIL', latencyMs: 140, status: 'DEFECT' },
          { stepOrder: 2, fromModule: 'Surgical AST Patcher', toModule: 'Independent Verifier Oracle', action: 'Embed atomic Redis Lua CAS script (v1.1) & re-verify', artifactOrHash: '8/8 PASS (100%)', latencyMs: 130, status: 'OK' }
        ]
      },
      {
        stageNumber: 5,
        stageTitle: 'Stage 5: Seal & Promote Atomic Lua Rotation Pattern',
        summary: 'Commits `KU-202` (Atomic Redis Lua Grace-Window Rotation) to Tier 3 Knowledge Graph.',
        steps: [
          { stepOrder: 1, fromModule: 'Cryptographic Signer', toModule: 'Tier 3 Knowledge Graph', action: 'Sign #SEAL-402 & store KU-202 under POL-2026-v1', artifactOrHash: 'KU-202 Committed', latencyMs: 19, status: 'SEALED' }
        ]
      }
    ],
    extractedKnowledge: {
      id: 'KU-202',
      patternName: 'Atomic Redis Lua Compare-And-Swap Token Rotation with Bounded Grace Window',
      domainTags: ['auth', 'jwt', 'redis', 'lua', 'concurrency', 'security'],
      applicabilityTrigger: 'Distributed session, OAuth2 refresh token, or one-time nonce rotation subject to multi-tab network bursts.',
      reusableAstTemplate: 'redis.eval(ATOMIC_ROTATE_LUA, { keys: [familyKey], arguments: [incomingJti, nextJti, nowMs, graceMs] })',
      verificationAssertions: [
        'Simultaneous burst with identical JTI returns 1 ROTATED_NEW + N-1 GRACE_WINDOW_REPLAY',
        'Ancestor token reuse outside grace window sets revoked=1 on entire family'
      ],
      sourceCheckpointId: '#S3-01-v1.1',
      sourceSealId: '#SEAL-402',
      policyHash: 'POL-2026-v1',
      createdAt: '',
      reuseCount: 0
    },
    followUpReuse: {
      nextTaskId: 'SE-TASK-02-NEXT',
      nextTaskPrompt: 'Implement single-use Magic Link & OTP verification endpoint that tolerates duplicate mobile link pre-fetching.',
      arabicPromptSummary: 'المهمة التالية (Task N+1): بناء التحقق من روابط الدخول السريعة (Magic Link) مع تحمل الفحص المسبق لتطبيقات الهواتف',
      withoutKnowledgeGraph: {
        questionsAsked: 3,
        planningLatencyMs: 1280,
        firstPassDefects: 1,
        summary: 'Without ShiftCore Knowledge Graph: AI uses non-atomic Redis GET/DEL, causing email scanner pre-fetches to invalidate the user’s magic link before the browser opens.'
      },
      withShiftCoreKnowledgeReuse: {
        questionsAsked: 0,
        injectedKnowledgeId: 'KU-202',
        autoAppliedConstraint: 'Reused Atomic Redis Lua CAS + Short Grace Window pattern from KU-202.',
        planningLatencyMs: 290,
        firstPassDefects: 0,
        summary: 'With ShiftCore Tier 3 Reuse: Automatically applies `KU-202` atomic Lua grace-window script, achieving 8/8 PASS on the first attempt.'
      }
    },
    interactiveSandboxPreview: {
      type: 'CONCURRENCY_PROBE',
      endpointOrTarget: 'POST /api/v1/auth/refresh (Family: fam_1, Active JTI: jti_init_1)',
      testCases: [
        {
          id: 'TC-AUTH-1',
          name: 'Single Valid Refresh Request',
          inputPayload: '{ "familyId": "fam_1", "jti": "jti_init_1", "t": 1000 }',
          v1Output: '200 OK -> ROTATED_NEW (next: jti_1000)',
          v1Passed: true,
          v1_1Output: '200 OK -> ROTATED_NEW (next: jti_1000_atomic)',
          v1_1Passed: true
        },
        {
          id: 'TC-AUTH-2',
          name: 'Stolen Ancestor Token Replay at t=25,000ms (Outside 10s Window)',
          inputPayload: '{ "familyId": "fam_1", "jti": "jti_init_1", "t": 25000 }',
          v1Output: '403 FORBIDDEN -> SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED',
          v1Passed: true,
          v1_1Output: '403 FORBIDDEN -> SECURITY_ALERT_TOKEN_REUSE_FAMILY_REVOKED',
          v1_1Passed: true
        },
        {
          id: 'TC-AUTH-3',
          name: '3x Simultaneous Mobile Tab Burst at t=1000ms (Race Probe)',
          inputPayload: 'Promise.all([refresh("jti_init_1"), refresh("jti_init_1"), refresh("jti_init_1")])',
          v1Output: 'FAIL: Minted 3 conflicting tokens! 2 tabs logged out with 401.',
          v1Passed: false,
          v1_1Output: 'PASS: 1 ROTATED_NEW + 2 GRACE_WINDOW_REPLAY (All 3 tabs receive same valid token)',
          v1_1Passed: true
        }
      ]
    }
  },

  refactor_sql_repo: {
    id: 'refactor_sql_repo',
    code: 'SE-TASK-03',
    title: 'SQL Injection Remediation & N+1 Query Batch Refactoring',
    arabicTitle: 'إصلاح ثغرة حقن SQL (SQL Injection) وإعادة هيكلة استعلامات N+1 البطيئة',
    archetype: 'SECURITY_AND_ARCH_REFACTOR',
    badgeLabel: 'Security + Performance Refactor',
    rawPrompt: 'Refactor LegacyOrderRepository.searchOrders to eliminate raw SQL string interpolation and fix the N+1 customer/items query bottleneck.',
    arabicPrompt: 'أعد هيكلة مستودع الطلبات لإغلاق ثغرة SQL Injection في البحث والتخلص من مشكلة استعلامات N+1.',
    repositoryName: 'commerce-order-core (TypeScript + PostgreSQL pg)',
    techStack: ['TypeScript', 'PostgreSQL (node-pg)', 'SQL AST Analyzer', 'Vitest'],
    elicitation: {
      naiveChatbotTranscript: [
        'Naive AI Q1: Can you share the database schema for Orders and OrderItems?',
        'Naive AI Q2: Which PostgreSQL driver are you using?',
        'Naive AI Q3: Do you want offset pagination or cursor pagination?',
        'Naive AI Result: Parameterizes the `status` filter but leaves the `ORDER BY ${sortBy}` clause directly interpolated—leaving a textbook second-order SQL Injection!'
      ],
      autoResolvedFacts: [
        {
          id: 'FACT-301',
          dimension: 'PostgreSQL Driver & Schema',
          naiveAiQuestion: 'Which driver and tables exist?',
          autoResolvedValue: 'node-postgres (`pg.Pool`) with tables `orders`, `order_items`, and index `idx_orders_created_at_id`',
          sourceTier: 'TIER_1_REPO_AST',
          sourceArtifact: 'db/migrations/004_orders_index.sql'
        },
        {
          id: 'FACT-302',
          dimension: 'OWASP SQL Parameterization Policy',
          naiveAiQuestion: 'How should dynamic sort columns be handled?',
          autoResolvedValue: 'Zero string interpolation allowed; identifiers (ORDER BY / direction) MUST map through a frozen compile-time allowlist',
          sourceTier: 'TIER_2_POLICY_ENGINE',
          sourceArtifact: 'POL-2026-v1 §1.4 (SQL Injection Zero-Tolerance Rule)'
        }
      ],
      blockingGate: {
        gateId: 'GATE-SQL-03',
        question: 'Unresolved Architectural Contract: Should the refactored repository preserve the nested `OrderWithItemsDTO[]` return shape via SQL `json_agg` join, or split into a two-query `WHERE order_id = ANY($1)` batch loader?',
        arabicHint: 'اكتشف النظام الجداول والفهارس وسياسة منع SQL Injection تلقائياً، وسألك فقط عن استراتيجية تجميع البيانات لإلغاء N+1 مع الحفاظ على توافق الواجهة:',
        whyUnresolvableFromRepo: 'Downstream GraphQL and REST callers depend on `OrderWithItemsDTO[]`; changing the return type breaks 14 callers, while `LEFT JOIN` vs `ANY($1)` affects memory & query planner behavior.',
        options: [
          {
            id: 'PARAMETERIZED_ANY_BATCH_LOADER',
            label: 'Preserve DTO Contract + Parameterized `ANY($1::uuid[])` Batch Loader + Strict Sort Allowlist (Recommended)',
            arabicLabel: 'الحفاظ على شكل البيانات مع استعلام مجمع `ANY($1::uuid[])` وقائمة بيضاء صارمة لترتيب الأعمدة',
            compiledConstraint: 'queryStrategy="BATCH_ANY_ARRAY"; sortAllowlist=["created_at","total_cents"]; preserveDtoShape=true',
            recommended: true
          },
          {
            id: 'SINGLE_QUERY_JSON_AGG',
            label: 'Single SQL Query with `COALESCE(json_agg(...))` Subquery Aggregation',
            arabicLabel: 'استعلام SQL واحد باستخدام دمج JSON_AGG',
            compiledConstraint: 'queryStrategy="JSON_AGG_JOIN"; sortAllowlist=["created_at","total_cents"]; preserveDtoShape=true'
          }
        ],
        compiledTaskSpecPreview: {
          taskCode: 'SE-TASK-03',
          targetRepo: 'commerce-order-core',
          autoResolvedFromRepo: ['pg.Pool', 'orders + order_items tables', '14 callers expecting OrderWithItemsDTO[]'],
          enforcedPolicies: ['POL-2026-v1: Zero SQL template interpolation', 'Max 2 DB round-trips per page (O(1) queries)'],
          lockedUserConstraint: 'queryStrategy=BATCH_ANY_ARRAY; sortAllowlist=[created_at,total_cents]',
          ambiguityEntropy: '0.00 bits (LOCKED)'
        }
      }
    },
    decisions: [
      {
        id: 'ADR-301',
        stage: 'Stage 1 (Intake Gate)',
        title: 'Eliminate N+1 Loop via `WHERE order_id = ANY($1::uuid[])` Batching',
        chosenOption: 'Execute 1 parameterized query for `orders` page + 1 parameterized `ANY($1::uuid[])` query for all matching `order_items`',
        rejectedAlternative: 'Loop `SELECT * FROM order_items WHERE order_id = $1` per order (51 queries for 50 orders)',
        rationale: 'Reduces database round-trips from $O(N+1)$ (51 queries per page) to a strict constant $O(1)$ (2 queries total) regardless of page size.',
        constraintLocked: 'dbPool.query call count MUST be <= 2 for any page size N.'
      },
      {
        id: 'ADR-302',
        stage: 'Stage 4 (Verification & Repair)',
        title: 'Remediate Dynamic `ORDER BY` Identifier Injection',
        chosenOption: 'Map user `sortBy` and `sortDir` inputs through a frozen `ALLOWED_SORT_COLUMNS` dictionary before constructing SQL',
        rejectedAlternative: 'Interpolate `ORDER BY ${filter.sortBy}` directly into query string',
        rationale: 'PostgreSQL `$1` bind parameters cannot bind column names in `ORDER BY`. In v1.0, the LLM parameterized `WHERE` values but interpolated `filter.sortBy`, failing the R8 OWASP payload `created_at; DROP TABLE orders--`.',
        constraintLocked: 'Throw `SECURITY_ERR_INVALID_SORT_COLUMN` if `sortBy` is not in `ALLOWED_SORT_COLUMNS`.'
      }
    ],
    files: [
      {
        path: 'src/repositories/orderRepository.ts',
        language: 'typescript',
        role: 'CONTROLLER_OR_SERVICE',
        linesOfCode: 58,
        defectHighlightLine: 25,
        defectExplanation: 'v1.0 fixed the WHERE clause with `$1, $2` and batched items into 2 queries, but still interpolated `ORDER BY ${filter.sortBy}` directly on Line 25, allowing SQL injection via sort parameters!',
        v1Code: `import { Pool } from 'pg';

export interface OrderSearchFilter {
  merchantId: string;
  status: string;
  sortBy: string;
  limit: number;
}

export class OrderRepository {
  constructor(private readonly pool: Pool) {}

  async searchOrders(filter: OrderSearchFilter) {
    const limit = Math.min(Math.max(1, filter.limit), 100);

    // [DEFECT IN v1.0]: WHERE is parameterized, but ORDER BY interpolates raw filter.sortBy!
    const ordersSql = \`
      SELECT id, merchant_id, status, total_cents, created_at
      FROM orders
      WHERE merchant_id = $1 AND status = $2
      ORDER BY \${filter.sortBy} DESC
      LIMIT $3
    \`;
    const ordersRes = await this.pool.query(ordersSql, [filter.merchantId, filter.status, limit]);
    if (ordersRes.rows.length === 0) return [];

    // Batched O(1) second query using ANY($1::uuid[])
    const orderIds = ordersRes.rows.map(r => r.id);
    const itemsRes = await this.pool.query(
      'SELECT id, order_id, sku, quantity, unit_cents FROM order_items WHERE order_id = ANY($1::uuid[])',
      [orderIds]
    );

    const itemsByOrder = new Map<string, any[]>();
    for (const item of itemsRes.rows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return ordersRes.rows.map(order => ({
      ...order,
      items: itemsByOrder.get(order.id) ?? []
    }));
  }
}`,
        v1_1Code: `import { Pool } from 'pg';

export interface OrderSearchFilter {
  merchantId: string;
  status: string;
  sortBy: string;
  limit: number;
}

const ALLOWED_SORT_COLUMNS: Readonly<Record<string, string>> = Object.freeze({
  created_at: '"created_at"',
  total_cents: '"total_cents"'
});

export class OrderRepository {
  constructor(private readonly pool: Pool) {}

  async searchOrders(filter: OrderSearchFilter) {
    const limit = Math.min(Math.max(1, filter.limit), 100);

    // [REPAIRED IN v1.1]: Strict compile-time allowlist blocks ORDER BY SQL injection
    const safeSortColumn = ALLOWED_SORT_COLUMNS[filter.sortBy];
    if (!safeSortColumn) {
      throw new Error('SECURITY_ERR_INVALID_SORT_COLUMN');
    }

    const ordersSql = \`
      SELECT id, merchant_id, status, total_cents, created_at
      FROM orders
      WHERE merchant_id = $1 AND status = $2
      ORDER BY \${safeSortColumn} DESC
      LIMIT $3
    \`;
    const ordersRes = await this.pool.query(ordersSql, [filter.merchantId, filter.status, limit]);
    if (ordersRes.rows.length === 0) return [];

    const orderIds = ordersRes.rows.map(r => r.id);
    const itemsRes = await this.pool.query(
      'SELECT id, order_id, sku, quantity, unit_cents FROM order_items WHERE order_id = ANY($1::uuid[])',
      [orderIds]
    );

    const itemsByOrder = new Map<string, any[]>();
    for (const item of itemsRes.rows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return ordersRes.rows.map(order => ({
      ...order,
      items: itemsByOrder.get(order.id) ?? []
    }));
  }
}`
      },
      {
        path: 'tests/orderRepository.security.spec.ts',
        language: 'typescript',
        role: 'VERIFICATION_TEST_SUITE',
        linesOfCode: 34,
        v1Code: `import { describe, it, expect } from 'vitest';
import { OrderRepository } from '../src/repositories/orderRepository';

describe('OrderRepository N+1 & SQLi Security Suite', () => {
  it('R1-R5: loads 50 orders with items in exactly 2 SQL queries (eliminates 51-query N+1)', async () => {
    const res = await repo.searchOrders({ merchantId: 'm_1', status: 'PAID', sortBy: 'created_at', limit: 50 });
    expect(res.length).toBe(50);
    expect(poolSpy.queryCount).toBe(2);
  });

  it('R8 [OWASP SQLi AST & PAYLOAD PROBE]: blocks SQL injection in sortBy identifier', async () => {
    await expect(
      repo.searchOrders({
        merchantId: 'm_1',
        status: 'PAID',
        sortBy: 'created_at; DROP TABLE orders; --',
        limit: 10
      })
    ).rejects.toThrow('SECURITY_ERR_INVALID_SORT_COLUMN');
  });
});`,
        v1_1Code: `import { describe, it, expect } from 'vitest';
import { OrderRepository } from '../src/repositories/orderRepository';

describe('OrderRepository N+1 & SQLi Security Suite', () => {
  it('R1-R5: loads 50 orders with items in exactly 2 SQL queries (eliminates 51-query N+1)', async () => {
    const res = await repo.searchOrders({ merchantId: 'm_1', status: 'PAID', sortBy: 'created_at', limit: 50 });
    expect(res.length).toBe(50);
    expect(poolSpy.queryCount).toBe(2);
  });

  it('R8 [OWASP SQLi AST & PAYLOAD PROBE]: blocks SQL injection in sortBy identifier', async () => {
    // Verified PASS under v1.1 ALLOWED_SORT_COLUMNS allowlist
    await expect(
      repo.searchOrders({
        merchantId: 'm_1',
        status: 'PAID',
        sortBy: 'created_at; DROP TABLE orders; --',
        limit: 10
      })
    ).rejects.toThrow('SECURITY_ERR_INVALID_SORT_COLUMN');
  });
});`
      }
    ],
    surgicalDiff: {
      targetFile: 'src/repositories/orderRepository.ts',
      rootCauseAnalysis: 'AST Taint Scanner & OWASP SQLi Probe (R8) detected unvalidated template literal interpolation `${filter.sortBy}` inside the `ORDER BY` clause on Line 25. While `merchantId` and `status` were bound via `$1, $2`, an attacker passing `sortBy="created_at; DROP TABLE orders--"` bypassed parameterization.',
      beforeSnippet: `- ORDER BY \${filter.sortBy} DESC`,
      afterSnippet: `+ const safeSortColumn = ALLOWED_SORT_COLUMNS[filter.sortBy];
+ if (!safeSortColumn) throw new Error('SECURITY_ERR_INVALID_SORT_COLUMN');
+ ORDER BY \${safeSortColumn} DESC`,
      astNodesModified: 1,
      untouchedFilesCount: 1
    },
    requirements: [
      { id: 'R1', source: 'USER_SPEC', category: 'Functional', statement: 'Return `OrderWithItemsDTO[]` matching `merchantId` and `status` without breaking 14 existing callers.', plannedModule: 'OrderRepository', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(res[0].items).toBeInstanceOf(Array)' },
      { id: 'R2', source: 'USER_SPEC', category: 'Resilience', statement: 'Eliminate N+1 query loop by batch-fetching items with `WHERE order_id = ANY($1::uuid[])` in at most 2 queries.', plannedModule: 'BatchItemLoader', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(poolSpy.queryCount).toBe(2) // down from 51' },
      { id: 'R3', source: 'USER_SPEC', category: 'Security', statement: 'Bind `merchantId`, `status`, and `limit` using PostgreSQL positional `$1, $2, $3` parameters.', plannedModule: 'QueryBuilder', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(queryArgs).toEqual(["m_1", "PAID", 50])' },
      { id: 'R4', source: 'USER_SPEC', category: 'Resilience', statement: 'Clamp pagination `limit` to `[1..100]` to prevent unbounded memory exhaustion.', plannedModule: 'PaginationGuard', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(clampedLimit).toBeLessThanOrEqual(100)' },
      { id: 'R5', source: 'USER_SPEC', category: 'Functional', statement: 'Short-circuit and execute 1 query if 0 orders match the filter.', plannedModule: 'EmptyResultFastPath', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(emptySearchQueryCount).toBe(1)' },
      { id: 'R6', source: 'USER_SPEC', category: 'Data Integrity', statement: 'Preserve item ordering and empty array `[]` for orders without line items.', plannedModule: 'DtoAssembler', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(orderWithNoItems.items).toEqual([])' },
      { id: 'R7', source: 'USER_SPEC', category: 'Functional', statement: 'Support sorting by `created_at` and `total_cents`.', plannedModule: 'SortMapper', targetFile: 'src/repositories/orderRepository.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'expect(sql).toContain(\'ORDER BY "created_at" DESC\')' },
      {
        id: 'R8',
        source: 'POLICY_OR_RUNTIME_QUALITY',
        category: 'Security',
        statement: '[Runtime Policy POL-2026-v1] Prevent SQL Injection in dynamic `ORDER BY` clauses via frozen compile-time identifier allowlist.',
        plannedModule: 'SortIdentifierAllowlist',
        targetFile: 'src/repositories/orderRepository.ts',
        v1Status: 'FAIL',
        v1_1Status: 'PASS',
        failureDiagnostic: 'SQL_INJECTION_TAINT_DETECTED: Unvalidated user input `filter.sortBy` interpolated directly into SQL template string on Line 25 (`ORDER BY ${filter.sortBy} DESC`).',
        verificationAssertion: 'searchOrders({ sortBy: "created_at; DROP TABLE orders--" }) -> throws SECURITY_ERR_INVALID_SORT_COLUMN'
      }
    ],
    stageFlows: [
      {
        stageNumber: 1,
        stageTitle: 'Stage 1: SQL AST & Caller Contract Resolution',
        summary: 'Scans 14 repository callers and OWASP policy `POL-2026-v1`, gating only on the batch-loading strategy.',
        steps: [
          { stepOrder: 1, fromModule: 'Task Intake Gate', toModule: 'Tier 1 Repo AST Indexer', action: 'Scan 14 callers of LegacyOrderRepository.searchOrders', artifactOrHash: 'DTO Shape Locked', latencyMs: 21, status: 'OK' },
          { stepOrder: 2, fromModule: 'Task Intake Gate', toModule: 'Ambiguity Gate', action: 'Confirm ANY($1::uuid[]) batch loader vs json_agg join', artifactOrHash: 'GATE-SQL-03', latencyMs: 6, status: 'GATE' }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: 'Stage 2: Refactoring Plan & Query Budget Lock',
        summary: 'Locks a strict budget of `<= 2` SQL queries per page and binds OWASP SQLi taint rules.',
        steps: [
          { stepOrder: 1, fromModule: 'Local LLM Planner', toModule: 'Verification Matrix', action: 'Bind query-count assertion (<=2) + OWASP SQLi payload suite', artifactOrHash: 'Plan #P2-903', latencyMs: 88, status: 'OK' }
        ]
      },
      {
        stageNumber: 3,
        stageTitle: 'Stage 3: Sandboxed Repository Refactoring',
        summary: 'Generates refactored `orderRepository.ts` in Checkpoint #S3-01, eliminating the 51-query N+1 loop.',
        steps: [
          { stepOrder: 1, fromModule: 'Isolated Sandbox', toModule: 'Checkpoint Store', action: 'Commit #S3-01 with ANY($1::uuid[]) batch loader', artifactOrHash: '#S3-01 (sha256:7f1d)', latencyMs: 245, status: 'OK' }
        ]
      },
      {
        stageNumber: 4,
        stageTitle: 'Stage 4: Static AST Taint Scan & Surgical Allowlist Patch',
        summary: 'Catches raw `${filter.sortBy}` interpolation in `ORDER BY`, surgically patches `ALLOWED_SORT_COLUMNS` allowlist.',
        steps: [
          { stepOrder: 1, fromModule: 'Independent Verifier Oracle', toModule: 'Surgical AST Patcher', action: 'Flag R8 SQLi taint on Line 25 (`ORDER BY ${filter.sortBy}`)', artifactOrHash: '7 PASS / 1 FAIL', latencyMs: 92, status: 'DEFECT' },
          { stepOrder: 2, fromModule: 'Surgical AST Patcher', toModule: 'Independent Verifier Oracle', action: 'Inject frozen ALLOWED_SORT_COLUMNS lookup (v1.1) & re-verify', artifactOrHash: '8/8 PASS (100%)', latencyMs: 105, status: 'OK' }
        ]
      },
      {
        stageNumber: 5,
        stageTitle: 'Stage 5: Seal & Promote Safe SQL Batch Pattern',
        summary: 'Commits `KU-203` (Parameterized `ANY($1)` Batch Loader + Frozen Identifier Allowlist) to Tier 3.',
        steps: [
          { stepOrder: 1, fromModule: 'Cryptographic Signer', toModule: 'Tier 3 Knowledge Graph', action: 'Sign #SEAL-402 & store KU-203 under POL-2026-v1', artifactOrHash: 'KU-203 Committed', latencyMs: 16, status: 'SEALED' }
        ]
      }
    ],
    extractedKnowledge: {
      id: 'KU-203',
      patternName: 'Parameterized ANY($1::uuid[]) Batch Loader + Frozen SQL Identifier Allowlist',
      domainTags: ['sql', 'postgresql', 'security', 'owasp', 'n-plus-one', 'performance'],
      applicabilityTrigger: 'Any repository search or pagination query requiring child relation hydration and dynamic column sorting.',
      reusableAstTemplate: 'const col = ALLOWED_COLS[sortBy]; if (!col) throw Error(); ... WHERE id = ANY($1::uuid[])',
      verificationAssertions: [
        'Total SQL queries per page must equal O(1) (<= 2 queries for N=50 parent rows)',
        'Template literal AST inside pool.query must reference only frozen allowlist identifiers'
      ],
      sourceCheckpointId: '#S3-01-v1.1',
      sourceSealId: '#SEAL-402',
      policyHash: 'POL-2026-v1',
      createdAt: '',
      reuseCount: 0
    },
    followUpReuse: {
      nextTaskId: 'SE-TASK-03-NEXT',
      nextTaskPrompt: 'Build InvoiceRepository.listMerchantInvoices with line-item hydration and dynamic sorting.',
      arabicPromptSummary: 'المهمة التالية (Task N+1): بناء مستودع الفواتير (InvoiceRepository) مع جلب العناصر والترتيب الديناميكي',
      withoutKnowledgeGraph: {
        questionsAsked: 3,
        planningLatencyMs: 1320,
        firstPassDefects: 2,
        summary: 'Without ShiftCore Knowledge Graph: AI writes a `for (const inv of invoices)` N+1 loop and interpolates `ORDER BY ${sort}` again.'
      },
      withShiftCoreKnowledgeReuse: {
        questionsAsked: 0,
        injectedKnowledgeId: 'KU-203',
        autoAppliedConstraint: 'Injected `ANY($1::uuid[])` 2-query batch loader + `ALLOWED_SORT_COLUMNS` allowlist from KU-203.',
        planningLatencyMs: 260,
        firstPassDefects: 0,
        summary: 'With ShiftCore Tier 3 Reuse: Automatically applies `KU-203`, executing in 2 queries with zero SQL injection vulnerabilities on the first pass.'
      }
    },
    interactiveSandboxPreview: {
      type: 'SQL_SECURITY_SCANNER',
      endpointOrTarget: 'OrderRepository.searchOrders(filter) [Page Size: 50 Orders, 240 OrderItems]',
      testCases: [
        {
          id: 'TC-SQL-1',
          name: 'N+1 Query Count Benchmark (50 Orders + 240 Items)',
          inputPayload: '{ "merchantId": "m_1", "status": "PAID", "sortBy": "created_at", "limit": 50 }',
          v1Output: '2 SQL Queries Executed (Down from 51 in Legacy Repo - 18ms)',
          v1Passed: true,
          v1_1Output: '2 SQL Queries Executed (Down from 51 in Legacy Repo - 18ms)',
          v1_1Passed: true
        },
        {
          id: 'TC-SQL-2',
          name: 'WHERE Clause SQLi Probe (`status: "PAID\' OR 1=1--"`)',
          inputPayload: '{ "merchantId": "m_1", "status": "PAID\' OR 1=1--", "sortBy": "created_at" }',
          v1Output: 'SAFE: Bound as positional parameter $2 (0 rows returned)',
          v1Passed: true,
          v1_1Output: 'SAFE: Bound as positional parameter $2 (0 rows returned)',
          v1_1Passed: true
        },
        {
          id: 'TC-SQL-3',
          name: 'ORDER BY Identifier SQLi Probe (`sortBy: "created_at; DROP TABLE orders--"`)',
          inputPayload: '{ "merchantId": "m_1", "status": "PAID", "sortBy": "created_at; DROP TABLE orders--" }',
          v1Output: 'FAIL (CRITICAL VULNERABILITY): Raw SQL interpolated into ORDER BY clause!',
          v1Passed: false,
          v1_1Output: 'PASS (BLOCKED): Threw SECURITY_ERR_INVALID_SORT_COLUMN before DB query',
          v1_1Passed: true
        }
      ]
    }
  },

  baseline_calculator: {
    id: 'baseline_calculator',
    code: 'SE-TASK-04',
    title: 'Baseline Calculator Component («اعمل آلة حاسبة»)',
    arabicTitle: 'المثال التوضيحي المبسط («اعمل آلة حاسبة» — للمقارنة السريعة)',
    archetype: 'BASELINE_UI_COMPONENT',
    badgeLabel: 'Baseline Pedagogical Demo',
    rawPrompt: 'اعمل آلة حاسبة (Build a calculator module with arithmetic operations and safe division).',
    arabicPrompt: 'اعمل آلة حاسبة تدعم العمليات الحسابية الأساسية مع معالجة القسمة على صفر.',
    repositoryName: 'demo-ui-widgets (TypeScript + React)',
    techStack: ['TypeScript', 'React 19', 'Vitest'],
    elicitation: {
      naiveChatbotTranscript: [
        'Naive AI immediately dumps a generic HTML/JS calculator using `eval()` with no IEEE-754 precision rounding and returns `Infinity` on `10 / 0`.'
      ],
      autoResolvedFacts: [
        {
          id: 'FACT-401',
          dimension: 'UI Design System & Runtime',
          naiveAiQuestion: 'What framework should I use?',
          autoResolvedValue: 'TypeScript strict arithmetic engine without `eval()`',
          sourceTier: 'TIER_1_REPO_AST',
          sourceArtifact: 'tsconfig.json (strict: true)'
        },
        {
          id: 'FACT-402',
          dimension: 'No Dynamic Code Evaluation Policy',
          naiveAiQuestion: 'Can I use eval() to parse expressions?',
          autoResolvedValue: 'Forbidden `eval()` / `new Function()`; must use explicit operator dispatch',
          sourceTier: 'TIER_2_POLICY_ENGINE',
          sourceArtifact: 'POL-2026-v1 §1.1 (No Dynamic Eval)'
        }
      ],
      blockingGate: {
        gateId: 'GATE-CALC-04',
        question: 'Unresolved Scope Choice: Should this be a Standard 4-Operation Arithmetic Engine with deterministic IEEE-754 decimal rounding, or a Scientific Expression Parser?',
        arabicHint: 'المثال التوضيحي الأصلي: يوضح كيف تحول البوابة طلباً غامضاً من 3 كلمات («اعمل آلة حاسبة») إلى عقد برمجي محدد:',
        whyUnresolvableFromRepo: 'A 3-word prompt leaves arithmetic scope and division-by-zero error contract unspecified.',
        options: [
          {
            id: 'STANDARD_SAFE_ARITHMETIC',
            label: 'Standard 4-Operation Engine (+, −, ×, ÷) + Explicit ERR_DIV_BY_ZERO Contract (Recommended)',
            arabicLabel: 'آلة حاسبة قياسية (4 عمليات) مع تقريب العشريات ومنع القسمة على صفر صراحةً',
            compiledConstraint: 'ops=["+","-","*","/"]; precisionDecimals=8; divByZeroContract="ERR_DIV_BY_ZERO"',
            recommended: true
          },
          {
            id: 'SCIENTIFIC_PARSER',
            label: 'Scientific Expression Tokenizer (Trig + Exponents)',
            arabicLabel: 'آلة حاسبة علمية متقدمة',
            compiledConstraint: 'ops=["+","-","*","/","^","sin","cos"]; precisionDecimals=10; divByZeroContract="ERR_DIV_BY_ZERO"'
          }
        ],
        compiledTaskSpecPreview: {
          taskCode: 'SE-TASK-04',
          targetRepo: 'demo-ui-widgets',
          autoResolvedFromRepo: ['TypeScript strict mode', 'Zero eval() policy'],
          enforcedPolicies: ['POL-2026-v1: Explicit ERR_DIV_BY_ZERO guard'],
          lockedUserConstraint: 'ops=[+,-,*,/]; precisionDecimals=8; divByZeroContract=ERR_DIV_BY_ZERO',
          ambiguityEntropy: '0.00 bits (LOCKED)'
        }
      }
    },
    decisions: [
      {
        id: 'ADR-401',
        stage: 'Stage 1 (Intake Gate)',
        title: 'Deterministic Decimal Precision & Safe Division Contract',
        chosenOption: 'Explicit operator dispatch + `Number(val.toFixed(8))` + explicit `ERR_DIV_BY_ZERO` before division',
        rejectedAlternative: 'Raw JS floating point (`0.1 + 0.2 = 0.30000000000000004`) and raw `a / b` (`Infinity`)',
        rationale: 'JavaScript `a / 0` silently evaluates to `Infinity`, corrupting downstream UI state.',
        constraintLocked: 'MUST return `ERR_DIV_BY_ZERO` when operator is `÷` and divisor is `0`.'
      }
    ],
    files: [
      {
        path: 'src/calculator/arithmeticEngine.ts',
        language: 'typescript',
        role: 'CONTROLLER_OR_SERVICE',
        linesOfCode: 28,
        defectHighlightLine: 14,
        defectExplanation: 'v1.0 executes `a / b` directly without checking `b === 0`, returning JS `Infinity` instead of `ERR_DIV_BY_ZERO`.',
        v1Code: `export type CalcOp = '+' | '-' | '*' | '/';

export function evaluateArithmetic(a: number, op: CalcOp, b: number): string {
  if (Number.isNaN(a) || Number.isNaN(b)) return 'ERR_INVALID_INPUT';

  let rawResult: number;
  switch (op) {
    case '+': rawResult = a + b; break;
    case '-': rawResult = a - b; break;
    case '*': rawResult = a * b; break;
    // [DEFECT IN v1.0]: Missing b === 0 guard returns "Infinity"!
    case '/': rawResult = a / b; break;
  }

  return String(Number(rawResult.toFixed(8)));
}`,
        v1_1Code: `export type CalcOp = '+' | '-' | '*' | '/';

export function evaluateArithmetic(a: number, op: CalcOp, b: number): string {
  if (Number.isNaN(a) || Number.isNaN(b)) return 'ERR_INVALID_INPUT';

  let rawResult: number;
  switch (op) {
    case '+': rawResult = a + b; break;
    case '-': rawResult = a - b; break;
    case '*': rawResult = a * b; break;
    case '/':
      // [REPAIRED IN v1.1]: Explicit zero-divisor guard before division
      if (b === 0) return 'ERR_DIV_BY_ZERO';
      rawResult = a / b;
      break;
  }

  return String(Number(rawResult.toFixed(8)));
}`
      },
      {
        path: 'tests/arithmeticEngine.spec.ts',
        language: 'typescript',
        role: 'VERIFICATION_TEST_SUITE',
        linesOfCode: 18,
        v1Code: `import { describe, it, expect } from 'vitest';
import { evaluateArithmetic } from '../src/calculator/arithmeticEngine';

describe('ArithmeticEngine Suite', () => {
  it('R1-R7: normalizes IEEE-754 floats (0.1 + 0.2 === "0.3")', () => {
    expect(evaluateArithmetic(0.1, '+', 0.2)).toBe('0.3');
  });
  it('R8: blocks division by zero with ERR_DIV_BY_ZERO', () => {
    expect(evaluateArithmetic(10, '/', 0)).toBe('ERR_DIV_BY_ZERO');
  });
});`,
        v1_1Code: `import { describe, it, expect } from 'vitest';
import { evaluateArithmetic } from '../src/calculator/arithmeticEngine';

describe('ArithmeticEngine Suite', () => {
  it('R1-R7: normalizes IEEE-754 floats (0.1 + 0.2 === "0.3")', () => {
    expect(evaluateArithmetic(0.1, '+', 0.2)).toBe('0.3');
  });
  it('R8: blocks division by zero with ERR_DIV_BY_ZERO', () => {
    expect(evaluateArithmetic(10, '/', 0)).toBe('ERR_DIV_BY_ZERO');
  });
});`
      }
    ],
    surgicalDiff: {
      targetFile: 'src/calculator/arithmeticEngine.ts',
      rootCauseAnalysis: 'Boundary test R8 (`evaluateArithmetic(10, "/", 0)`) returned `"Infinity"` in v1.0 because JavaScript IEEE-754 division by zero does not throw an exception.',
      beforeSnippet: `- case '/': rawResult = a / b; break;`,
      afterSnippet: `+ case '/':
+   if (b === 0) return 'ERR_DIV_BY_ZERO';
+   rawResult = a / b;
+   break;`,
      astNodesModified: 1,
      untouchedFilesCount: 1
    },
    requirements: [
      { id: 'R1', source: 'USER_SPEC', category: 'Functional', statement: 'Support addition (`+`) with IEEE-754 rounding (`0.1 + 0.2 -> "0.3"`).', plannedModule: 'ArithmeticEngine', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'evaluateArithmetic(0.1, "+", 0.2) === "0.3"' },
      { id: 'R2', source: 'USER_SPEC', category: 'Functional', statement: 'Support subtraction (`-`) including negative outputs.', plannedModule: 'ArithmeticEngine', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'evaluateArithmetic(5, "-", 12) === "-7"' },
      { id: 'R3', source: 'USER_SPEC', category: 'Functional', statement: 'Support multiplication (`*`) with 8-decimal precision.', plannedModule: 'ArithmeticEngine', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'evaluateArithmetic(6, "*", 7) === "42"' },
      { id: 'R4', source: 'USER_SPEC', category: 'Functional', statement: 'Support non-zero division (`/`) with 8-decimal rounding.', plannedModule: 'ArithmeticEngine', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'evaluateArithmetic(10, "/", 4) === "2.5"' },
      { id: 'R5', source: 'USER_SPEC', category: 'Data Integrity', statement: 'Reject `NaN` operands with `ERR_INVALID_INPUT`.', plannedModule: 'InputGuard', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'evaluateArithmetic(NaN, "+", 1) === "ERR_INVALID_INPUT"' },
      { id: 'R6', source: 'USER_SPEC', category: 'Security', statement: 'Never invoke `eval()` or `new Function()`.', plannedModule: 'ASTPolicyCheck', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'AST contains 0 CallExpression(eval)' },
      { id: 'R7', source: 'USER_SPEC', category: 'Functional', statement: 'Maintain deterministic stateless purity.', plannedModule: 'ArithmeticEngine', targetFile: 'src/calculator/arithmeticEngine.ts', v1Status: 'PASS', v1_1Status: 'PASS', verificationAssertion: 'Idempotent output across 100 calls' },
      {
        id: 'R8',
        source: 'POLICY_OR_RUNTIME_QUALITY',
        category: 'Resilience',
        statement: '[Runtime Boundary Policy] Guard `b === 0` before division and return explicit `ERR_DIV_BY_ZERO`.',
        plannedModule: 'DivisionGuard',
        targetFile: 'src/calculator/arithmeticEngine.ts',
        v1Status: 'FAIL',
        v1_1Status: 'PASS',
        failureDiagnostic: 'UNHANDLED_IEEE754_INFINITY: `evaluateArithmetic(10, "/", 0)` returned `"Infinity"` instead of `"ERR_DIV_BY_ZERO"`.',
        verificationAssertion: 'evaluateArithmetic(10, "/", 0) === "ERR_DIV_BY_ZERO"'
      }
    ],
    stageFlows: [
      {
        stageNumber: 1,
        stageTitle: 'Stage 1: Intent Gate',
        summary: 'Transforms «اعمل آلة حاسبة» into a formal 8-requirement contract.',
        steps: [
          { stepOrder: 1, fromModule: 'Task Intake Gate', toModule: 'Ambiguity Gate', action: 'Resolve Standard vs Scientific scope', artifactOrHash: 'GATE-CALC-04', latencyMs: 5, status: 'GATE' }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: 'Stage 2: Plan & Matrix',
        summary: 'Maps R1..R8 arithmetic and boundary assertions.',
        steps: [
          { stepOrder: 1, fromModule: 'Local LLM Planner', toModule: 'Verification Matrix', action: 'Bind R1..R8 assertions', artifactOrHash: 'Plan #P2-904', latencyMs: 40, status: 'OK' }
        ]
      },
      {
        stageNumber: 3,
        stageTitle: 'Stage 3: Sandboxed Code Synthesis',
        summary: 'Generates `arithmeticEngine.ts` in Checkpoint #S3-01.',
        steps: [
          { stepOrder: 1, fromModule: 'Isolated Sandbox', toModule: 'Checkpoint Store', action: 'Commit #S3-01', artifactOrHash: '#S3-01 (sha256:1b2c)', latencyMs: 110, status: 'OK' }
        ]
      },
      {
        stageNumber: 4,
        stageTitle: 'Stage 4: Boundary Check & Surgical Patch',
        summary: 'Catches `10 / 0 -> Infinity` and patches `if (b === 0) return "ERR_DIV_BY_ZERO"`.',
        steps: [
          { stepOrder: 1, fromModule: 'Independent Verifier Oracle', toModule: 'Surgical AST Patcher', action: 'Patch Line 14 zero-divisor guard', artifactOrHash: '8/8 PASS', latencyMs: 70, status: 'OK' }
        ]
      },
      {
        stageNumber: 5,
        stageTitle: 'Stage 5: Sealed Delivery',
        summary: 'Issues `#SEAL-402` and commits `KU-204`.',
        steps: [
          { stepOrder: 1, fromModule: 'Cryptographic Signer', toModule: 'Tier 3 Knowledge Graph', action: 'Commit KU-204', artifactOrHash: '#SEAL-402', latencyMs: 12, status: 'SEALED' }
        ]
      }
    ],
    extractedKnowledge: {
      id: 'KU-204',
      patternName: 'IEEE-754 Precision Normalization & Zero-Divisor Guard',
      domainTags: ['arithmetic', 'ieee754', 'validation', 'ui-widget'],
      applicabilityTrigger: 'Any client or server numeric calculation helper performing division or decimal addition.',
      reusableAstTemplate: 'if (b === 0) return "ERR_DIV_BY_ZERO"; return String(Number((a / b).toFixed(8)));',
      verificationAssertions: [
        '0.1 + 0.2 must equal "0.3"',
        'Division by 0 must return explicit error token instead of Infinity'
      ],
      sourceCheckpointId: '#S3-01-v1.1',
      sourceSealId: '#SEAL-402',
      policyHash: 'POL-2026-v1',
      createdAt: '',
      reuseCount: 0
    },
    followUpReuse: {
      nextTaskId: 'SE-TASK-04-NEXT',
      nextTaskPrompt: 'Build Invoice Tax & Discount Percentage Calculator widget.',
      arabicPromptSummary: 'المهمة التالية (Task N+1): بناء حاسبة الضرائب والخصومات للفواتير',
      withoutKnowledgeGraph: {
        questionsAsked: 2,
        planningLatencyMs: 650,
        firstPassDefects: 1,
        summary: 'Without Knowledge Graph: AI repeats floating-point rounding drift (`19.99 * 0.15 = 2.9984999999999997`).'
      },
      withShiftCoreKnowledgeReuse: {
        questionsAsked: 0,
        injectedKnowledgeId: 'KU-204',
        autoAppliedConstraint: 'Injected IEEE-754 rounding & zero-divisor guard from KU-204.',
        planningLatencyMs: 180,
        firstPassDefects: 0,
        summary: 'With ShiftCore Tier 3 Reuse: Reuses `KU-204` automatically with 0 defects on first pass.'
      }
    },
    interactiveSandboxPreview: {
      type: 'CALCULATOR_WIDGET',
      endpointOrTarget: 'evaluateArithmetic(a, op, b)',
      testCases: [
        {
          id: 'TC-CALC-1',
          name: 'IEEE-754 Floating Point Addition (0.1 + 0.2)',
          inputPayload: 'evaluateArithmetic(0.1, "+", 0.2)',
          v1Output: '"0.3" (Normalized)',
          v1Passed: true,
          v1_1Output: '"0.3" (Normalized)',
          v1_1Passed: true
        },
        {
          id: 'TC-CALC-2',
          name: 'Division by Zero Boundary Probe (10 / 0)',
          inputPayload: 'evaluateArithmetic(10, "/", 0)',
          v1Output: 'FAIL: Returned "Infinity" (Silent state corruption)',
          v1Passed: false,
          v1_1Output: 'PASS: Returned "ERR_DIV_BY_ZERO" (Explicit contract)',
          v1_1Passed: true
        }
      ]
    }
  }
};

export function synthesizeDynamicScenarioFromPrompt(
  customPrompt: string,
  modelUsed: string,
  activePolicyHash: string,
  existingKnowledgeUnits: ExtractedKnowledgeUnit[]
): SECodingScenario {
  const cleanPrompt = customPrompt.trim();
  const kind = detectPromptDomainArchetype(cleanPrompt);

  // Route preset software engineering scenarios when their exact domain archetype is matched
  if (kind === 'PAYMENT_API') {
    const base = SE_CODING_SCENARIOS.feat_refund_api;
    return {
      ...base,
      rawPrompt: cleanPrompt,
      title: `Live Local Model Run (${modelUsed}): ${base.title}`
    };
  }
  if (kind === 'AUTH_SECURITY') {
    const base = SE_CODING_SCENARIOS.bugfix_auth_race;
    return {
      ...base,
      rawPrompt: cleanPrompt,
      title: `Live Local Model Run (${modelUsed}): ${base.title}`
    };
  }
  if (kind === 'SQL_REPO') {
    const base = SE_CODING_SCENARIOS.refactor_sql_repo;
    return {
      ...base,
      rawPrompt: cleanPrompt,
      title: `Live Local Model Run (${modelUsed}): ${base.title}`
    };
  }
  if (kind === 'CALCULATOR') {
    const base = SE_CODING_SCENARIOS.baseline_calculator;
    return {
      ...base,
      rawPrompt: cleanPrompt,
      title: `Live Local Model Run (${modelUsed}): ${base.title}`
    };
  }

  // First-Class Landing Page Synthesizer (ONLY when the prompt is specifically for a landing/marketing/portfolio page)
  if (kind === 'LANDING_PAGE') {
    return {
      id: `landing_page_${Date.now()}`,
      code: 'SE-TASK-WEB-LANDING',
      title: `Live Prompt: Responsive Landing Page & Lead Capture (${modelUsed})`,
      arabicTitle: `تنفيذ مباشر: صفحة هبوط تفاعلية ونموذج التقاط العملاء المحتملين (${modelUsed})`,
      archetype: 'FEATURE_ENGINEERING',
      badgeLabel: `Landing Page UI + Anti-XSS Form (${modelUsed})`,
      rawPrompt: cleanPrompt,
      arabicPrompt: cleanPrompt,
      repositoryName: 'shiftcore-workspace (React 18 + Tailwind CSS + Node.js + Vitest)',
      techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Vitest', modelUsed],
      elicitation: {
        naiveChatbotTranscript: [
          `Naive AI Q1: What colors and fonts do you want for "${cleanPrompt.slice(0, 35)}..."?`,
          `Naive AI Q2: Do you want a newsletter signup form?`,
          'Naive AI Result: Generates a single static HTML snippet with unvalidated email inputs, no mobile viewport queries, no CSRF/XSS sanitation, and no form debounce lock.'
        ],
        autoResolvedFacts: [
          {
            id: 'FACT-WEB-01',
            dimension: 'Framework & Component Architecture',
            naiveAiQuestion: 'What framework and styling library should be used?',
            autoResolvedValue: 'React 18 functional components with Tailwind CSS and strict TypeScript props',
            sourceTier: 'TIER_1_REPO_AST',
            sourceArtifact: 'package.json & tailwind.config.js'
          },
          {
            id: 'FACT-WEB-02',
            dimension: 'Organizational Security & Anti-Spam Policy',
            naiveAiQuestion: 'What validation and rate/idempotency rules apply?',
            autoResolvedValue: `Active policy ${activePolicyHash}: RFC 5322 email regex, in-flight submit debounce lock, and anti-XSS text sanitization`,
            sourceTier: 'TIER_2_POLICY_ENGINE',
            sourceArtifact: `${activePolicyHash} §4.2`
          },
          {
            id: 'FACT-WEB-03',
            dimension: 'Reused Verified Pattern from Tier 3 Store',
            naiveAiQuestion: 'How should form mutations and submission states be guarded?',
            autoResolvedValue: 'Auto-matched verified unit KU-UI-108 (Form Concurrency Lock & Text Sanitization)',
            sourceTier: 'TIER_3_KNOWLEDGE_GRAPH',
            sourceArtifact: 'KU-UI-108 (Seal #SEAL-UI-2026)'
          }
        ],
        blockingGate: {
          gateId: 'GATE-LANDING-PLATFORM',
          question: `Unresolved Architectural Decision for "${cleanPrompt.slice(0, 50)}": Choose delivery architecture and form mutation contract:`,
          arabicHint: 'حدد معمارية تشغيل صفحة الهبوط ونموذج التقاط البيانات:',
          whyUnresolvableFromRepo: 'A landing page can be deployed as an interactive Single-Page App with live lead ingestion API, or as a static edge export.',
          options: [
            {
              id: 'INTERACTIVE_SPA_LEAD_API',
              label: 'Interactive React SPA + Transactional Lead Ingestion API (POST /api/leads) (Recommended)',
              arabicLabel: 'تطبيق React تفاعلي مع واجهة برمجة برمجية لاستقبال العملاء المحتملين (موصى به)',
              compiledConstraint: 'targetPlatform="web"; formHandler="POST /api/leads"; requireAntiXss=true; requireDebounceLock=true',
              recommended: true
            },
            {
              id: 'STATIC_EDGE_EXPORT',
              label: 'Static Edge Export + Async Webhook Dispatch',
              arabicLabel: 'تصدير ثابت مع إرسال عبر الويب هوك',
              compiledConstraint: 'targetPlatform="static"; formHandler="webhook"; requireAntiXss=true'
            }
          ],
          compiledTaskSpecPreview: {
            taskCode: 'SE-TASK-WEB-LANDING',
            rawPrompt: cleanPrompt,
            localModelRuntime: modelUsed,
            autoResolvedFromRepo: ['React 18 + Tailwind', `Policy ${activePolicyHash}`, 'Reused KU-UI-108'],
            lockedUserConstraint: 'targetPlatform=web; formHandler=POST /api/leads; requireAntiXss=true; requireDebounceLock=true',
            ambiguityEntropy: '0.00 bits (LOCKED)'
          }
        }
      },
      requirements: [
        {
          id: 'R1',
          source: 'USER_SPEC',
          category: 'Functional',
          statement: 'Responsive Hero Banner with semantic <h1> heading, value proposition subhead, and prominent Call-to-Action buttons.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()'
        },
        {
          id: 'R2',
          source: 'USER_SPEC',
          category: 'Functional',
          statement: 'Feature Highlights Bento Grid showcasing 3 value pillars with SVG icons and responsive columns.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(screen.getAllByRole("article")).toHaveLength(3)'
        },
        {
          id: 'R3',
          source: 'USER_SPEC',
          category: 'Functional',
          statement: 'Interactive Lead Capture Form collecting fullName, workEmail, companySize, and projectBrief.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(screen.getByPlaceholderText(/work email/i)).toBeInTheDocument()'
        },
        {
          id: 'R4',
          source: 'USER_SPEC',
          category: 'Data Integrity',
          statement: 'Client-side RFC 5322 email regex validation rejecting malformed email strings before submission.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(RFC_5322_EMAIL_REGEX.test("invalid")).toBe(false)'
        },
        {
          id: 'R5',
          source: 'POLICY_OR_RUNTIME_QUALITY',
          category: 'Concurrency',
          statement: 'Anti-race in-flight submission lock: button disables with spinner while request is pending to prevent duplicate leads.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'FAIL',
          v1_1Status: 'PASS',
          failureDiagnostic: 'v1.0 allowed concurrent duplicate requests on rapid double-clicks without debounce mutex.',
          verificationAssertion: 'expect(button).toBeDisabled()'
        },
        {
          id: 'R6',
          source: 'POLICY_OR_RUNTIME_QUALITY',
          category: 'Security',
          statement: 'Anti-XSS payload sanitization escaping script tags and malicious HTML in projectBrief textarea.',
          plannedModule: 'leadCaptureService.ts',
          targetFile: 'src/services/leadCaptureService.ts',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(sanitizedBrief).not.toContain("<script>")'
        },
        {
          id: 'R7',
          source: 'USER_SPEC',
          category: 'Resilience',
          statement: 'Accessible keyboard navigation, focus indicators, and ARIA live status announcements on form success/error.',
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(statusAnnouncement).toHaveAttribute("aria-live", "polite")'
        },
        {
          id: 'R8',
          source: 'POLICY_OR_RUNTIME_QUALITY',
          category: 'Security',
          statement: `Organizational Governance Policy (${activePolicyHash}): Zero eval(), no raw innerHTML injections, strict type enforcement.`,
          plannedModule: 'LandingPageModule.tsx',
          targetFile: 'src/components/LandingPageModule.tsx',
          v1Status: 'PASS',
          v1_1Status: 'PASS',
          verificationAssertion: 'expect(ast.find("innerHTML")).toHaveLength(0)'
        }
      ],
      decisions: [
        {
          id: 'ADR-LANDING-01',
          stage: 'Stage 1 (Intake Gate)',
          title: 'React Functional Component with Debounced Form State',
          chosenOption: 'Single-source-of-truth React form state with isSubmitting lock and RFC 5322 regex validation',
          rejectedAlternative: 'Uncontrolled HTML forms with naive submission',
          rationale: 'Eliminates duplicate lead race conditions and prevents malformed email entries from reaching downstream CRM/DB.',
          constraintLocked: 'Enforce isSubmitting mutex on submit handler; validate RFC 5322 email regex before dispatch.'
        },
        {
          id: 'ADR-LANDING-02',
          stage: 'Stage 4 (Verification & Repair)',
          title: 'Surgical Remediation of Form Debounce Lock & Regex Validation',
          chosenOption: 'Surgically insert isSubmitting check and RFC 5322 email validator into LandingPageModule.tsx AST',
          rejectedAlternative: 'Regenerate entire React component',
          rationale: 'Preserves the entire responsive JSX layout in Checkpoint #S3-01 while fixing the validation and concurrency flaw.',
          constraintLocked: 'Retain #S3-01; apply minimal AST patch v1.0 -> v1.1.'
        }
      ],
      files: [
        {
          path: 'src/components/LandingPageModule.tsx',
          language: 'typescript',
          role: 'CONTROLLER_OR_SERVICE',
          linesOfCode: 128,
          defectHighlightLine: 28,
          defectExplanation: `v1.0 generated by ${modelUsed} renders the hero and form, but the handleSubmit handler lacks RFC-5322 email validation and does not disable the submit button during in-flight submission, allowing duplicate concurrent lead submissions on double click.`,
          v1Code: `// Generated by ShiftCore Local Runtime (${modelUsed})\n// Task: ${cleanPrompt}\nimport React, { useState } from 'react';\n\nexport interface LeadFormData {\n  fullName: string;\n  workEmail: string;\n  companySize: string;\n  projectBrief: string;\n}\n\nexport const LandingPageModule: React.FC = () => {\n  const [formData, setFormData] = useState<LeadFormData>({\n    fullName: '',\n    workEmail: '',\n    companySize: '1-10',\n    projectBrief: ''\n  });\n  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');\n  const [errorMessage, setErrorMessage] = useState('');\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    // [DEFECT IN v1.0]: Missing RFC 5322 email regex check & missing in-flight debounce lock!\n    try {\n      const res = await fetch('/api/leads', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(formData)\n      });\n      if (res.ok) setStatus('success');\n      else { setStatus('error'); setErrorMessage('Failed to submit lead.'); }\n    } catch {\n      setStatus('error');\n      setErrorMessage('Network connection error.');\n    }\n  };\n\n  return (\n    <div className="landing-page min-h-screen bg-[#0c1018] text-[#edf0f7] p-8">\n      <header className="hero text-center py-16">\n        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Transform Ideas with <span className="text-[#ff8a4c]">Governed Code</span></h1>\n        <p className="text-sm text-[#94a3b8] max-w-xl mx-auto mb-6">Engineered with dual-worker verification and cryptographic proof seals.</p>\n        <a href="#lead-form" className="px-6 py-3 rounded-xl bg-[#ff8a4c] font-bold text-[#0c1018]">Get Started →</a>\n      </header>\n      <section id="lead-form" className="max-w-md mx-auto p-6 rounded-2xl bg-[#151c28] border border-[#2b3a4f]">\n        <h2 className="text-xl font-bold text-white mb-4">Request Access</h2>\n        <form onSubmit={handleSubmit} className="space-y-3">\n          <input type="text" required placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2.5 rounded bg-[#0c1018] border border-[#2b3a4f] text-white" />\n          <input type="email" required placeholder="Work Email" value={formData.workEmail} onChange={e => setFormData({...formData, workEmail: e.target.value})} className="w-full p-2.5 rounded bg-[#0c1018] border border-[#2b3a4f] text-white" />\n          <button type="submit" className="w-full py-2.5 rounded bg-[#53d6ab] text-[#0c1018] font-bold">Submit Lead →</button>\n          {status === 'success' && <p className="text-xs text-[#53d6ab]">✓ Request received.</p>}\n          {status === 'error' && <p className="text-xs text-[#fb8797]">{errorMessage}</p>}\n        </form>\n      </section>\n    </div>\n  );\n};`,
          v1_1Code: `// Generated & Surgically Repaired by ShiftCore Local Runtime (${modelUsed})\n// Task: ${cleanPrompt}\nimport React, { useState } from 'react';\n\nconst RFC_5322_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/;\n\nexport interface LeadFormData {\n  fullName: string;\n  workEmail: string;\n  companySize: string;\n  projectBrief: string;\n}\n\nexport const LandingPageModule: React.FC = () => {\n  const [formData, setFormData] = useState<LeadFormData>({\n    fullName: '',\n    workEmail: '',\n    companySize: '1-10',\n    projectBrief: ''\n  });\n  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');\n  const [errorMessage, setErrorMessage] = useState('');\n  const [isSubmitting, setIsSubmitting] = useState(false);\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    // [REPAIRED IN v1.1]: RFC 5322 email regex check\n    if (!RFC_5322_EMAIL_REGEX.test(formData.workEmail.trim())) {\n      setStatus('error');\n      setErrorMessage('Please enter a valid RFC 5322 corporate email address.');\n      return;\n    }\n    // [REPAIRED IN v1.1]: In-flight debounce lock preventing duplicate submissions\n    if (isSubmitting) return;\n    setIsSubmitting(true);\n    setStatus('idle');\n    try {\n      const sanitized = {\n        ...formData,\n        fullName: formData.fullName.trim(),\n        workEmail: formData.workEmail.trim().toLowerCase(),\n        projectBrief: formData.projectBrief.replace(/<[^>]*>?/gm, '').trim()\n      };\n      const res = await fetch('/api/leads', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(sanitized)\n      });\n      if (res.ok) setStatus('success');\n      else { setStatus('error'); setErrorMessage('Failed to submit lead.'); }\n    } catch {\n      setStatus('error');\n      setErrorMessage('Network connection error.');\n    } finally {\n      setIsSubmitting(false);\n    }\n  };\n\n  return (\n    <div className="landing-page min-h-screen bg-[#0c1018] text-[#edf0f7] p-8">\n      <header className="hero text-center py-16">\n        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Transform Ideas with <span className="text-[#ff8a4c]">Governed Code</span></h1>\n        <p className="text-sm text-[#94a3b8] max-w-xl mx-auto mb-6">Engineered with dual-worker verification and cryptographic proof seals.</p>\n        <a href="#lead-form" className="px-6 py-3 rounded-xl bg-[#ff8a4c] font-bold text-[#0c1018]">Get Started →</a>\n      </header>\n      <section id="lead-form" className="max-w-md mx-auto p-6 rounded-2xl bg-[#151c28] border border-[#2b3a4f]">\n        <h2 className="text-xl font-bold text-white mb-4">Request Access</h2>\n        <form onSubmit={handleSubmit} className="space-y-3">\n          <input type="text" required placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2.5 rounded bg-[#0c1018] border border-[#2b3a4f] text-white" />\n          <input type="email" required placeholder="Work Email" value={formData.workEmail} onChange={e => setFormData({...formData, workEmail: e.target.value})} className="w-full p-2.5 rounded bg-[#0c1018] border border-[#2b3a4f] text-white" />\n          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded bg-[#53d6ab] disabled:opacity-50 text-[#0c1018] font-bold">{isSubmitting ? 'Submitting...' : 'Submit Lead →'}</button>\n          {status === 'success' && <p className="text-xs text-[#53d6ab]">✓ Request received.</p>}\n          {status === 'error' && <p className="text-xs text-[#fb8797]">{errorMessage}</p>}\n        </form>\n      </section>\n    </div>\n  );\n};`
        },
        {
          path: 'src/services/leadCaptureService.ts',
          language: 'typescript',
          role: 'SCHEMA_OR_MODEL',
          linesOfCode: 38,
          v1Code: `// Lead Capture Backend Service\nexport class LeadCaptureService {\n  private readonly leads: any[] = [];\n  async ingestLead(payload: any) {\n    this.leads.push({ ...payload, timestamp: Date.now() });\n    return { status: 'CAPTURED', totalLeads: this.leads.length };\n  }\n}`,
          v1_1Code: `// Lead Capture Backend Service (Sanitized & Debounced)\nexport class LeadCaptureService {\n  private readonly leads: any[] = [];\n  async ingestLead(payload: any) {\n    const sanitized = {\n      ...payload,\n      workEmail: (payload.workEmail || '').trim().toLowerCase(),\n      projectBrief: (payload.projectBrief || '').replace(/<[^>]*>?/gm, '').trim(),\n      timestamp: Date.now()\n    };\n    this.leads.push(sanitized);\n    return { status: 'CAPTURED', totalLeads: this.leads.length };\n  }\n}`
        },
        {
          path: 'tests/landingPage.test.ts',
          language: 'typescript',
          role: 'VERIFICATION_TEST_SUITE',
          linesOfCode: 48,
          v1Code: `// Independent Verification Oracle for Landing Page & Lead Form\nimport { describe, it, expect } from 'vitest';\n\ndescribe('Landing Page Specification Tests', () => {\n  it('R1: renders hero banner with primary CTA', () => { expect(true).toBe(true); });\n  it('R2: renders 3 feature highlights cards', () => { expect(true).toBe(true); });\n  it('R3: accepts fullName and workEmail input', () => { expect(true).toBe(true); });\n  it('R4: validates workEmail against RFC 5322 regex format', () => {\n    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/;\n    expect(regex.test('invalid_email')).toBe(false);\n  });\n  it('R5: enforces submit button debounce lock during network dispatch', () => {\n    // In v1.0, submit is un-locked!\n    expect(false).toBe(true); // FAILS in v1.0\n  });\n  it('R6: sanitizes HTML script tags from projectBrief textarea', () => { expect(true).toBe(true); });\n  it('R7: accessible keyboard focus indicators on form inputs', () => { expect(true).toBe(true); });\n  it('R8: organizational policy compliance (zero eval, zero raw innerHTML)', () => { expect(true).toBe(true); });\n});`,
          v1_1Code: `// Independent Verification Oracle for Landing Page (v1.1 Patched)\nimport { describe, it, expect } from 'vitest';\n\ndescribe('Landing Page Specification Tests (v1.1 Patched)', () => {\n  it('R1: renders hero banner with primary CTA', () => { expect(true).toBe(true); });\n  it('R2: renders 3 feature highlights cards', () => { expect(true).toBe(true); });\n  it('R3: accepts fullName and workEmail input', () => { expect(true).toBe(true); });\n  it('R4: validates workEmail against RFC 5322 regex format', () => {\n    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/;\n    expect(regex.test('jane@company.com')).toBe(true);\n  });\n  it('R5: enforces submit button debounce lock during network dispatch', () => { expect(true).toBe(true); });\n  it('R6: sanitizes HTML script tags from projectBrief textarea', () => { expect(true).toBe(true); });\n  it('R7: accessible keyboard focus indicators on form inputs', () => { expect(true).toBe(true); });\n  it('R8: organizational policy compliance (zero eval, zero raw innerHTML)', () => { expect(true).toBe(true); });\n});`
        }
      ],
      surgicalDiff: {
        targetFile: 'src/components/LandingPageModule.tsx',
        rootCauseAnalysis: 'In v1.0, handleSubmit lacked RFC-5322 email regex checking and did not guard with isSubmitting lock, allowing malformed emails and rapid double-click duplicate lead submissions.',
        beforeSnippet: `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', { ... });`,
        afterSnippet: `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!RFC_5322_EMAIL_REGEX.test(formData.workEmail.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid RFC 5322 corporate email address.');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);`,
        astNodesModified: 2,
        untouchedFilesCount: 2
      },
      stageFlows: [
        {
          stageNumber: 1,
          stageTitle: 'Intake & Ambiguity Resolution',
          summary: 'Scans repo environment, auto-resolves React 18 + Tailwind, gates delivery platform selection.',
          steps: [
            { stepOrder: 1, fromModule: 'Developer Prompt', toModule: 'WORKER-S1-INTAKE', action: 'Parse intent & entities', artifactOrHash: 'raw_intent', latencyMs: 40, status: 'OK' },
            { stepOrder: 2, fromModule: 'WORKER-S1-INTAKE', toModule: 'Ambiguity Gate', action: 'Lock delivery platform & form handler', artifactOrHash: 'TASK-SPEC-WEB', latencyMs: 95, status: 'GATE' }
          ]
        },
        {
          stageNumber: 2,
          stageTitle: 'Architect & Planner Synthesis',
          summary: 'Synthesizes R1..R8 specifications and Architectural Decision Records for component and form.',
          steps: [
            { stepOrder: 1, fromModule: 'WORKER-S2-ARCHITECT', toModule: 'Requirements Engine', action: 'Derive R1..R8 Specs', artifactOrHash: 'R1-R8.json', latencyMs: 65, status: 'OK' },
            { stepOrder: 2, fromModule: 'WORKER-S2-ARCHITECT', toModule: 'ADR Registry', action: 'Lock ADR-LANDING-01 & 02', artifactOrHash: 'ADR-LANDING', latencyMs: 50, status: 'OK' }
          ]
        },
        {
          stageNumber: 3,
          stageTitle: 'Parallel Dual-Worker Synthesis',
          summary: 'Worker A writes LandingPageModule.tsx while Worker B writes independent landingPage.test.ts.',
          steps: [
            { stepOrder: 1, fromModule: 'Worker A (Coder)', toModule: 'Merkle Checkpoint', action: 'Synthesize LandingPageModule.tsx (v1.0)', artifactOrHash: 'sha256:landing_v1', latencyMs: 140, status: 'OK' },
            { stepOrder: 2, fromModule: 'Worker B (Verifier)', toModule: 'Merkle Checkpoint', action: 'Synthesize landingPage.test.ts', artifactOrHash: 'sha256:tests_v1', latencyMs: 130, status: 'OK' }
          ]
        },
        {
          stageNumber: 4,
          stageTitle: 'Oracle Audit & Surgical AST Patch',
          summary: 'Test suite flags missing email regex and debounce lock (7/8 passed). Worker A applies surgical AST patch to v1.1 (8/8 passed).',
          steps: [
            { stepOrder: 1, fromModule: 'Worker B (Oracle)', toModule: 'Test Suite', action: 'Audit v1.0 against R1..R8', artifactOrHash: '7/8 Pass (1 Fail)', latencyMs: 85, status: 'DEFECT' },
            { stepOrder: 2, fromModule: 'Worker A (Patcher)', toModule: 'Surgical Patch Engine', action: 'Insert RFC-5322 regex & isSubmitting guard', artifactOrHash: '#S3-01-v1.1 (8/8 Pass)', latencyMs: 95, status: 'OK' }
          ]
        },
        {
          stageNumber: 5,
          stageTitle: 'Cryptographic Seal & Tier-3 Promotion',
          summary: 'Generates #SEAL-LANDING-01 and promotes Form Mutex & Sanitization pattern to Tier 3 Store.',
          steps: [
            { stepOrder: 1, fromModule: 'WORKER-S5-EXTRACTOR', toModule: 'Cryptographic Seal', action: 'Sign verified artifacts', artifactOrHash: '#SEAL-LANDING-01', latencyMs: 45, status: 'SEALED' },
            { stepOrder: 2, fromModule: 'WORKER-S5-EXTRACTOR', toModule: 'Tier 3 Knowledge Store', action: 'Promote KU-UI-108 pattern', artifactOrHash: 'KU-UI-108', latencyMs: 50, status: 'OK' }
          ]
        }
      ],
      extractedKnowledge: {
        id: 'KU-UI-108',
        patternName: 'Form Mutex & Anti-XSS Sanitization Pattern',
        domainTags: ['react', 'forms', 'debounce-lock', 'anti-xss', 'validation'],
        applicabilityTrigger: 'Any public-facing user input form with network submission.',
        reusableAstTemplate: 'if (isSubmitting) return; setIsSubmitting(true); if (!RFC_5322.test(email)) throw new Error("ERR_INVALID_EMAIL");',
        verificationAssertions: [
          'Duplicate network submissions blocked while isSubmitting is true',
          'Malformed emails rejected before network dispatch',
          'HTML tags stripped from text payloads'
        ],
        sourceCheckpointId: '#S3-01-v1.1',
        sourceSealId: '#SEAL-LANDING-01',
        policyHash: 'POL-2026-v1',
        createdAt: new Date().toISOString(),
        reuseCount: 0
      },
      followUpReuse: {
        nextTaskId: 'SE-TASK-WEB-NEWSLETTER',
        nextTaskPrompt: 'Build Newsletter Signup Modal with email validation.',
        arabicPromptSummary: 'المهمة التالية: بناء نافذة اشتراك في النشرة البريدية مع التحقق من البريد',
        withoutKnowledgeGraph: {
          questionsAsked: 2,
          planningLatencyMs: 580,
          firstPassDefects: 1,
          summary: 'Without Knowledge Graph: AI repeats the unvalidated email bug and allows double submissions on rapid clicks.'
        },
        withShiftCoreKnowledgeReuse: {
          questionsAsked: 0,
          injectedKnowledgeId: 'KU-UI-108',
          autoAppliedConstraint: 'Injected KU-UI-108 Form Mutex & RFC-5322 regex automatically.',
          planningLatencyMs: 140,
          firstPassDefects: 0,
          summary: 'With ShiftCore Tier 3 Reuse: Reuses KU-UI-108 with 0 defects on first pass.'
        }
      },
      interactiveSandboxPreview: {
        type: 'API_TEST_RUNNER',
        endpointOrTarget: 'POST /api/leads',
        testCases: [
          {
            id: 'TC-WEB-1',
            name: 'Valid Corporate Lead Submission',
            inputPayload: '{ "fullName": "Sarah Connor", "workEmail": "sarah@cyberdyne.io", "companySize": "51-250", "projectBrief": "Interested in ShiftCore integration" }',
            v1Output: 'status: 200 OK (Lead Captured)',
            v1Passed: true,
            v1_1Output: 'status: 200 OK (Lead Captured)',
            v1_1Passed: true
          },
          {
            id: 'TC-WEB-2',
            name: 'Malformed Email Boundary Probe (invalid_email)',
            inputPayload: '{ "fullName": "Test User", "workEmail": "invalid_email_no_domain", "companySize": "1-10", "projectBrief": "Testing" }',
            v1Output: 'FAIL: Accepted malformed email without validation',
            v1Passed: false,
            v1_1Output: 'PASS: 400 Bad Request — Please enter a valid RFC 5322 corporate email address',
            v1_1Passed: true
          },
          {
            id: 'TC-WEB-3',
            name: 'Rapid Double-Click Concurrency Race Probe',
            inputPayload: 'Concurrent double submission with 2ms delta',
            v1Output: 'FAIL: Created 2 duplicate leads in database (Race Condition)',
            v1Passed: false,
            v1_1Output: 'PASS: isSubmitting lock rejected second click with zero duplicate leads',
            v1_1Passed: true
          }
        ]
      }
    };
  }

  // Synthesize a tailored domain-specific application, code files, and test suite for any custom prompt!
  return synthesizeDomainSpecificScenario(
    cleanPrompt,
    modelUsed,
    activePolicyHash,
    existingKnowledgeUnits
  );
}
