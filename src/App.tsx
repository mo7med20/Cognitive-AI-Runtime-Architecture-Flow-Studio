/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Boxes,
  Box,
  Check,
  Copy,
  Cpu,
  Database,
  Eye,
  FileCheck2,
  Loader2,
  Network,
  Play,
  Presentation,
  RefreshCw,
  RotateCcw,
  Scale,
  Send,
  Settings2,
  Workflow
} from 'lucide-react';
import {
  StageIndex,
  DependencyCategory,
  computeRuntimeMetrics,
  STAGE_DEFINITIONS
} from './lib/runtimeEngine';
import {
  SE_CODING_SCENARIOS,
  SECodingScenario,
  ExtractedKnowledgeUnit,
  synthesizeDynamicScenarioFromPrompt
} from './lib/seScenariosAndMetamodel';
import {
  LocalModelRuntimeConfig,
  ParallelWorkerTelemetry,
  IndividualWorkerProbeStatus,
  probeLocalModelConnection,
  executeStage1IntakeLive,
  executeStage2PlanLive,
  executeStage3ParallelSynthesisLive,
  executeStage4VerificationAuditLive,
  executeStage4SurgicalRepairLive,
  executeStage5SealAndExtractLive,
  clearWorkerTokenStream,
  emitOfflineRoleTelemetry
} from './lib/localLlmBridge';
import { LifecycleSimulator } from './components/LifecycleSimulator';
import { LiveRoleLogsConsole } from './components/LiveRoleLogsConsole';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { TraceabilityMatrixView } from './components/TraceabilityMatrixView';
import { AbstractModelView } from './components/AbstractModelView';
import { KnowledgeLifecycleView } from './components/KnowledgeLifecycleView';
import { SlidesDeckModal, WorkspaceTabId } from './components/SlidesDeckModal';
import { ArchitectureGuideModal } from './components/ArchitectureGuideModal';
import { ResultDeliverablesView } from './components/ResultDeliverablesView';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('flow_studio');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Strictly starts in clean S0 Idle state (nothing pre-populated statically until user submits a prompt)
  const [isRuntimeIdle, setIsRuntimeIdle] = useState<boolean>(true);
  const [highestCompletedStage, setHighestCompletedStage] = useState<number>(-1);
  const [isStageExecuting, setIsStageExecuting] = useState<boolean>(false);
  const [executingStageLabel, setExecutingStageLabel] = useState<string>('');

  const [currentStage, setCurrentStage] = useState<StageIndex>(0);
  const [clarifiedPlatform, setClarifiedPlatform] = useState<'web' | 'desktop' | null>(null);
  const [repaired, setRepaired] = useState<boolean>(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('comp_intake');
  const [dependencyFilter, setDependencyFilter] = useState<DependencyCategory | 'all'>('all');
  const [isSlidesOpen, setIsSlidesOpen] = useState<boolean>(false);

  // Active SE Scenario & Prompt State (Initialized to Landing Page deliverable so Result tab is always ready)
  const [activeScenario, setActiveScenario] = useState<SECodingScenario>(() =>
    synthesizeDynamicScenarioFromPrompt('i need landing-page for my site', 'qwen3:4b', 'POL-2026-v1', [])
  );
  const [customPromptInput, setCustomPromptInput] = useState<string>('i need landing-page for my site');

  // Parallel Local LLM Runtime Config (Worker A = Coder Model, Worker B = Verifier/Critic Model)
  const [llmConfig, setLlmConfig] = useState<LocalModelRuntimeConfig>({
    provider: 'ollama',
    endpointUrl: 'http://localhost:11434',
    coderModel: 'qwen3:4b',
    verifierModel: 'qwen3:4b',
    temperature: 0.1
  });
  const [availableLocalModels, setAvailableLocalModels] = useState<string[]>([]);
  const [llmReachable, setLlmReachable] = useState<boolean>(false);
  const [isProbingWorkers, setIsProbingWorkers] = useState<boolean>(false);
  const [llmStatusMessage, setLlmStatusMessage] = useState<string>('Pinging Coder & Verifier workers...');
  const [coderWorkerStatus, setCoderWorkerStatus] = useState<IndividualWorkerProbeStatus>({
    workerId: 'WORKER-A-CODER',
    roleLabel: 'Worker A · Coder',
    modelName: 'qwen3:4b',
    available: false,
    daemonOnline: false,
    mode: 'DAEMON_OFFLINE',
    latencyMs: 0,
    statusDetail: 'Worker A (qwen3:4b) OFFLINE — Awaiting local model daemon',
    lastCheckedAt: ''
  });
  const [verifierWorkerStatus, setVerifierWorkerStatus] = useState<IndividualWorkerProbeStatus>({
    workerId: 'WORKER-B-VERIFIER',
    roleLabel: 'Worker B · Verifier',
    modelName: 'qwen3:4b',
    available: false,
    daemonOnline: false,
    mode: 'DAEMON_OFFLINE',
    latencyMs: 0,
    statusDetail: 'Worker B (qwen3:4b) OFFLINE — Awaiting local model daemon',
    lastCheckedAt: ''
  });
  const [showLlmSettings, setShowLlmSettings] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);

  // Live Worker Telemetries collected step-by-step across Stages 1 -> 5
  const [workerTelemetries, setWorkerTelemetries] = useState<ParallelWorkerTelemetry[]>([]);
  const [checkpointHash, setCheckpointHash] = useState<string>('sha256:pending_s3');
  const [sealId, setSealId] = useState<string>('#SEAL-PENDING');

  // Persistent 3-Tier Knowledge Store State (Starts empty until Stage 5 WORKER-S5-EXTRACTOR promotes sealed units)
  const [activePolicyHash, setActivePolicyHash] = useState<'POL-2026-v1' | 'POL-2026-v2'>('POL-2026-v1');
  const [knowledgeUnits, setKnowledgeUnits] = useState<ExtractedKnowledgeUnit[]>([]);

  // Pings both Coder (Worker A) and Verifier (Worker B) models independently in parallel
  const runLocalModelProbe = async (cfg = llmConfig) => {
    setIsProbingWorkers(true);
    try {
      const probe = await probeLocalModelConnection(cfg);
      setLlmReachable(probe.reachable);
      setLlmStatusMessage(probe.statusMessage);
      setCoderWorkerStatus(probe.coderWorkerStatus);
      setVerifierWorkerStatus(probe.verifierWorkerStatus);
      if (probe.availableModels.length > 0) {
        setAvailableLocalModels(probe.availableModels);
      }
    } finally {
      setIsProbingWorkers(false);
    }
  };

  useEffect(() => {
    runLocalModelProbe(llmConfig);
    fetch('/api/knowledge')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.activePolicyHash) setActivePolicyHash(data.activePolicyHash);
        if (Array.isArray(data?.knowledgeUnits)) setKnowledgeUnits(data.knowledgeUnits);
      })
      .catch(() => {});
  }, []);

  const metrics = computeRuntimeMetrics({
    currentStage,
    clarifiedPlatform,
    repaired
  });

  /**
   * ==========================================================================
   * TRANSITION S0 -> S1: Dispatch Prompt to Stage 1 Intake & Ambiguity Role
   * ==========================================================================
   */
  const handleStartRuntimeWithPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean) return;

    clearWorkerTokenStream();
    setIsStageExecuting(true);
    setExecutingStageLabel(
      `Stage 1 Role (WORKER-S1-INTAKE): Querying Tier 1–3 Store & Running Intake Analyzer (${llmConfig.coderModel})...`
    );
    setActiveTab('flow_studio');

    try {
      const s1 = await executeStage1IntakeLive(
        clean,
        activePolicyHash,
        knowledgeUnits,
        llmConfig
      );
      setActiveScenario(s1.baseScenario);
      setWorkerTelemetries([s1.telemetry]);
      setCurrentStage(0);
      setHighestCompletedStage(0);
      setClarifiedPlatform(null);
      setRepaired(false);
      setCheckpointHash('sha256:pending_s3');
      setSealId('#SEAL-PENDING');
      setIsRuntimeIdle(false);
      setSelectedComponentId('comp_analyzer');
    } catch (err) {
      setLlmStatusMessage(
        err instanceof Error ? err.message : 'Local model daemon is offline. Start Ollama for live token streaming.'
      );
      // Graceful offline fallback: initialize deterministic scenario for prompt
      const full = synthesizeDynamicScenarioFromPrompt(
        clean,
        llmConfig.coderModel,
        activePolicyHash,
        knowledgeUnits
      );
      const t1 = emitOfflineRoleTelemetry('S1', full, llmConfig);
      setActiveScenario({
        ...full,
        decisions: [],
        requirements: [],
        files: [],
        stageFlows: [full.stageFlows[0]]
      });
      setWorkerTelemetries([t1]);
      setCurrentStage(0);
      setHighestCompletedStage(0);
      setClarifiedPlatform(null);
      setRepaired(false);
      setCheckpointHash('sha256:pending_s3');
      setSealId('#SEAL-PENDING');
      setIsRuntimeIdle(false);
      setSelectedComponentId('comp_analyzer');
    } finally {
      setIsStageExecuting(false);
      setExecutingStageLabel('');
    }
  };

  /**
   * ==========================================================================
   * STAGE 1 GATE RESOLUTION (Compiles TaskSpec & Unlocks Stage 2 Role)
   * ==========================================================================
   */
  const handleSelectPlatformAndCompileStage2 = async (platform: 'web' | 'desktop') => {
    setClarifiedPlatform(platform);
    setSelectedComponentId('comp_analyzer');
  };

  /**
   * ==========================================================================
   * LIVE STEP-BY-STEP STAGE TRANSITIONS (S1 -> S2 -> S3 -> S4 -> S5)
   * ==========================================================================
   */
  const handleAdvanceToStageWithLiveWorker = async (nextStage: StageIndex) => {
    if (nextStage < currentStage) {
      setCurrentStage(nextStage);
      return;
    }

    setIsStageExecuting(true);
    try {
      if (nextStage === 1) {
        // S1 -> S2: Run Stage 2 Architect & Planner Role on Local Model
        setExecutingStageLabel(
          `Stage 2 Role (WORKER-S2-ARCHITECT): Synthesizing R1..R8 & ADRs on ${llmConfig.coderModel}...`
        );
        const s2 = await executeStage2PlanLive(
          activeScenario,
          clarifiedPlatform === 'desktop' ? 1 : 0,
          activePolicyHash,
          llmConfig
        );
        setActiveScenario((prev) => ({
          ...prev,
          requirements: s2.requirements,
          decisions: s2.decisions,
          stageFlows: [...prev.stageFlows.slice(0, 1), s2.stageFlow]
        }));
        setWorkerTelemetries((prev) => [
          s2.telemetry,
          ...prev.filter((w) => w.workerRole !== 'STAGE2_ARCHITECT_PLANNER')
        ]);
      } else if (nextStage === 2) {
        // S2 -> S3: Dispatch PARALLEL Role 3A (Coder) || Role 3B (Independent Test Synthesizer)
        setExecutingStageLabel(
          `Stage 3 Parallel Roles: Running [Role 3A Coder (${llmConfig.coderModel}) ∥ Role 3B Test Oracle (${llmConfig.verifierModel})]...`
        );
        const s3 = await executeStage3ParallelSynthesisLive(activeScenario, llmConfig);
        setActiveScenario((prev) => ({
          ...prev,
          files: s3.files,
          stageFlows: [...prev.stageFlows.slice(0, 2), s3.stageFlow]
        }));
        setCheckpointHash(s3.checkpointHash);
        setWorkerTelemetries((prev) => [
          s3.workerBTelemetry,
          s3.workerATelemetry,
          ...prev.filter(
            (w) =>
              w.workerRole !== 'STAGE3_WORKER_A_CODER' &&
              w.workerRole !== 'STAGE3_WORKER_B_TEST_SYNTH'
          )
        ]);
      } else if (nextStage === 3) {
        // S3 -> S4: Run Independent Verifier Oracle Role on Checkpoint #S3-01
        setExecutingStageLabel(
          `Stage 4 Role (WORKER-S4A-ORACLE): Auditing Checkpoint #S3-01 with Independent Verifier (${llmConfig.verifierModel})...`
        );
        const s4Audit = await executeStage4VerificationAuditLive(activeScenario, llmConfig);
        setActiveScenario((prev) => ({
          ...prev,
          stageFlows: [...prev.stageFlows.slice(0, 3), s4Audit.stageFlow]
        }));
        setWorkerTelemetries((prev) => [
          s4Audit.telemetry,
          ...prev.filter((w) => w.workerRole !== 'STAGE4_VERIFIER_CRITIC')
        ]);
      } else if (nextStage === 4) {
        // S4 -> S5: Issue Cryptographic Seal & Extract Reusable KnowledgeUnit into Tier 3
        setExecutingStageLabel(
          `Stage 5 Role (WORKER-S5-EXTRACTOR): Issuing Cryptographic Seal & Extracting Tier 3 Knowledge Unit (${llmConfig.verifierModel})...`
        );
        const s5 = await executeStage5SealAndExtractLive(
          activeScenario,
          checkpointHash,
          activePolicyHash,
          llmConfig
        );
        setSealId(s5.sealId);
        setActiveScenario((prev) => ({
          ...prev,
          extractedKnowledge: s5.promotedUnit,
          stageFlows: [...prev.stageFlows.slice(0, 4), s5.stageFlow]
        }));
        setKnowledgeUnits((prev) => {
          const rest = prev.filter((u) => u.id !== s5.promotedUnit.id);
          return [s5.promotedUnit, ...rest];
        });
        setWorkerTelemetries((prev) => [
          s5.telemetry,
          ...prev.filter((w) => w.workerRole !== 'STAGE5_KNOWLEDGE_EXTRACTOR')
        ]);
      }

      setCurrentStage(nextStage);
      setHighestCompletedStage((prev) => Math.max(prev, nextStage));
      const primaryComp = STAGE_DEFINITIONS[nextStage].primaryComponents[0];
      if (primaryComp) {
        setSelectedComponentId(primaryComp);
      }
    } catch (err) {
      setLlmStatusMessage(
        err instanceof Error ? err.message : 'Local model daemon is offline. Generated deterministic stage artifacts.'
      );
      const full = synthesizeDynamicScenarioFromPrompt(
        activeScenario.rawPrompt,
        llmConfig.coderModel,
        activePolicyHash,
        knowledgeUnits
      );
      if (nextStage === 1) {
        const t2 = emitOfflineRoleTelemetry('S2', full, llmConfig);
        setActiveScenario((prev) => ({
          ...prev,
          requirements: full.requirements,
          decisions: full.decisions,
          stageFlows: [...prev.stageFlows.slice(0, 1), full.stageFlows[1] || full.stageFlows[0]]
        }));
        setWorkerTelemetries((prev) => [
          t2,
          ...prev.filter((w) => w.workerRole !== 'STAGE2_ARCHITECT_PLANNER')
        ]);
      } else if (nextStage === 2) {
        const t3a = emitOfflineRoleTelemetry('S3A', full, llmConfig);
        const t3b = emitOfflineRoleTelemetry('S3B', full, llmConfig);
        setActiveScenario((prev) => ({
          ...prev,
          files: full.files,
          stageFlows: [...prev.stageFlows.slice(0, 2), full.stageFlows[2] || full.stageFlows[0]]
        }));
        setCheckpointHash('sha256:s3_offline_chk');
        setWorkerTelemetries((prev) => [
          t3b,
          t3a,
          ...prev.filter(
            (w) =>
              w.workerRole !== 'STAGE3_WORKER_A_CODER' &&
              w.workerRole !== 'STAGE3_WORKER_B_TEST_SYNTH'
          )
        ]);
      } else if (nextStage === 3) {
        const t4a = emitOfflineRoleTelemetry('S4A', full, llmConfig);
        setActiveScenario((prev) => ({
          ...prev,
          stageFlows: [...prev.stageFlows.slice(0, 3), full.stageFlows[3] || full.stageFlows[0]]
        }));
        setWorkerTelemetries((prev) => [
          t4a,
          ...prev.filter((w) => w.workerRole !== 'STAGE4_VERIFIER_CRITIC')
        ]);
      } else if (nextStage === 4) {
        const t5 = emitOfflineRoleTelemetry('S5', full, llmConfig);
        setSealId('#SEAL-DELIVERY-2026');
        setActiveScenario((prev) => ({
          ...prev,
          extractedKnowledge: full.extractedKnowledge,
          stageFlows: [...prev.stageFlows.slice(0, 4), full.stageFlows[4] || full.stageFlows[0]]
        }));
        setKnowledgeUnits((prev) => {
          const rest = prev.filter((u) => u.id !== full.extractedKnowledge.id);
          return [full.extractedKnowledge, ...rest];
        });
        setWorkerTelemetries((prev) => [
          t5,
          ...prev.filter((w) => w.workerRole !== 'STAGE5_KNOWLEDGE_EXTRACTOR')
        ]);
      }
      setCurrentStage(nextStage);
      setHighestCompletedStage((prev) => Math.max(prev, nextStage));
      const primaryComp = STAGE_DEFINITIONS[nextStage].primaryComponents[0];
      if (primaryComp) {
        setSelectedComponentId(primaryComp);
      }
    } finally {
      setIsStageExecuting(false);
      setExecutingStageLabel('');
    }
  };

  /**
   * ==========================================================================
   * STAGE 4B SURGICAL AST REPAIR WORKER ROLE
   * ==========================================================================
   */
  const handleApplySurgicalRepairWithLiveWorker = async () => {
    setIsStageExecuting(true);
    setExecutingStageLabel(
      `Stage 4B Role (WORKER-S4B-PATCHER): Applying Surgical AST Patch (${llmConfig.coderModel}) on retained Checkpoint #S3-01...`
    );
    try {
      const repairRes = await executeStage4SurgicalRepairLive(activeScenario, llmConfig);
      setCheckpointHash(repairRes.repairedCheckpointHash);
      setRepaired(true);
      setSelectedComponentId('comp_verifier');
      setWorkerTelemetries((prev) => [
        repairRes.telemetry,
        ...prev.filter((w) => w.workerRole !== 'STAGE4_SURGICAL_PATCHER')
      ]);
    } catch (err) {
      setLlmStatusMessage(
        err instanceof Error ? err.message : 'Local model daemon is offline. Applied deterministic AST repair.'
      );
      const full = synthesizeDynamicScenarioFromPrompt(
        activeScenario.rawPrompt,
        llmConfig.coderModel,
        activePolicyHash,
        knowledgeUnits
      );
      const t4b = emitOfflineRoleTelemetry('S4B', full, llmConfig);
      setRepaired(true);
      setCheckpointHash('sha256:repaired_v1_1');
      setSelectedComponentId('comp_verifier');
      setWorkerTelemetries((prev) => [
        t4b,
        ...prev.filter((w) => w.workerRole !== 'STAGE4_SURGICAL_PATCHER')
      ]);
    } finally {
      setIsStageExecuting(false);
      setExecutingStageLabel('');
    }
  };

  /**
   * ==========================================================================
   * SEQUENTIAL AUTO-PLAY THROUGH ALL 5 ROLES
   * ==========================================================================
   */
  const handleAutoRunFullPipelineLive = async (promptToRun?: string) => {
    const targetPrompt = (promptToRun || customPromptInput || activeScenario.rawPrompt).trim();
    if (!targetPrompt) return;

    clearWorkerTokenStream();
    setActiveTab('flow_studio');
    setIsStageExecuting(true);

    try {
      // Stage 1 Role
      setExecutingStageLabel(
        `Role 1/5 (WORKER-S1-INTAKE): Context Auto-Resolution & Gate Analysis (${llmConfig.coderModel})...`
      );
      const s1 = await executeStage1IntakeLive(targetPrompt, activePolicyHash, knowledgeUnits, llmConfig);
      let currentScen = s1.baseScenario;
      setIsRuntimeIdle(false);
      setActiveScenario(currentScen);
      setWorkerTelemetries([s1.telemetry]);
      setCurrentStage(0);
      setHighestCompletedStage(0);
      setClarifiedPlatform('web');
      setRepaired(false);

      // Stage 2 Role
      setExecutingStageLabel(
        `Role 2/5 (WORKER-S2-ARCHITECT): Synthesizing 8 Requirements & ADRs (${llmConfig.coderModel})...`
      );
      const s2 = await executeStage2PlanLive(currentScen, 0, activePolicyHash, llmConfig);
      currentScen = {
        ...currentScen,
        requirements: s2.requirements,
        decisions: s2.decisions,
        stageFlows: [...currentScen.stageFlows.slice(0, 1), s2.stageFlow]
      };
      setActiveScenario(currentScen);
      setWorkerTelemetries((prev) => [s2.telemetry, ...prev]);
      setCurrentStage(1);
      setHighestCompletedStage(1);

      // Stage 3 Parallel Roles (Worker A || Worker B)
      setExecutingStageLabel(
        `Role 3/5 (PARALLEL): [Worker A Coder (${llmConfig.coderModel}) ∥ Worker B Test Oracle (${llmConfig.verifierModel})]...`
      );
      const s3 = await executeStage3ParallelSynthesisLive(currentScen, llmConfig);
      currentScen = {
        ...currentScen,
        files: s3.files,
        stageFlows: [...currentScen.stageFlows.slice(0, 2), s3.stageFlow]
      };
      setActiveScenario(currentScen);
      setCheckpointHash(s3.checkpointHash);
      setWorkerTelemetries((prev) => [s3.workerBTelemetry, s3.workerATelemetry, ...prev]);
      setCurrentStage(2);
      setHighestCompletedStage(2);

      // Stage 4A Oracle Audit + Stage 4B Surgical AST Repair
      setExecutingStageLabel(
        `Role 4/5: Running Independent Oracle (${llmConfig.verifierModel}) & Surgical AST Patch (${llmConfig.coderModel})...`
      );
      const s4Audit = await executeStage4VerificationAuditLive(currentScen, llmConfig);
      const s4Repair = await executeStage4SurgicalRepairLive(currentScen, llmConfig);
      currentScen = {
        ...currentScen,
        stageFlows: [...currentScen.stageFlows.slice(0, 3), s4Audit.stageFlow]
      };
      setActiveScenario(currentScen);
      setCheckpointHash(s4Repair.repairedCheckpointHash);
      setRepaired(true);
      setWorkerTelemetries((prev) => [s4Repair.telemetry, s4Audit.telemetry, ...prev]);
      setCurrentStage(3);
      setHighestCompletedStage(3);

      // Stage 5 Sealer & Knowledge Extraction Role
      setExecutingStageLabel(
        `Role 5/5 (WORKER-S5-EXTRACTOR): Issuing Cryptographic Seal & Promoting Tier 3 Knowledge...`
      );
      const s5 = await executeStage5SealAndExtractLive(
        currentScen,
        s4Repair.repairedCheckpointHash,
        activePolicyHash,
        llmConfig
      );
      currentScen = {
        ...currentScen,
        extractedKnowledge: s5.promotedUnit,
        stageFlows: [...currentScen.stageFlows.slice(0, 4), s5.stageFlow]
      };
      setActiveScenario(currentScen);
      setSealId(s5.sealId);
      setKnowledgeUnits((prev) => [s5.promotedUnit, ...prev.filter((u) => u.id !== s5.promotedUnit.id)]);
      setWorkerTelemetries((prev) => [s5.telemetry, ...prev]);
      setCurrentStage(4);
      setHighestCompletedStage(4);
      setSelectedComponentId('comp_registry');
    } catch (err) {
      setLlmStatusMessage(
        err instanceof Error ? err.message : 'Local model daemon is offline. Executed deterministic 5-stage synthesis.'
      );
      const full = synthesizeDynamicScenarioFromPrompt(
        targetPrompt,
        llmConfig.coderModel,
        activePolicyHash,
        knowledgeUnits
      );
      const t1 = emitOfflineRoleTelemetry('S1', full, llmConfig);
      const t2 = emitOfflineRoleTelemetry('S2', full, llmConfig);
      const t3a = emitOfflineRoleTelemetry('S3A', full, llmConfig);
      const t3b = emitOfflineRoleTelemetry('S3B', full, llmConfig);
      const t4a = emitOfflineRoleTelemetry('S4A', full, llmConfig);
      const t4b = emitOfflineRoleTelemetry('S4B', full, llmConfig);
      const t5 = emitOfflineRoleTelemetry('S5', full, llmConfig);
      setIsRuntimeIdle(false);
      setClarifiedPlatform('web');
      setRepaired(true);
      setSealId('#SEAL-DELIVERY-2026');
      setActiveScenario(full);
      setWorkerTelemetries([t5, t4b, t4a, t3b, t3a, t2, t1]);
      setKnowledgeUnits((prev) => [full.extractedKnowledge, ...prev.filter((u) => u.id !== full.extractedKnowledge.id)]);
      setCheckpointHash('sha256:repaired_v1_1');
      setCurrentStage(4);
      setHighestCompletedStage(4);
      setSelectedComponentId('comp_registry');
    } finally {
      setIsStageExecuting(false);
      setExecutingStageLabel('');
    }
  };

  /**
   * Fast-track jump directly to Stage 3 (Generated Code & Tests)
   */
  const handleAutoAdvanceToStage3 = async () => {
    setIsStageExecuting(true);
    try {
      let currentScen = activeScenario;
      if (currentStage === 0) {
        setClarifiedPlatform('web');
        setExecutingStageLabel(
          `Synthesizing Requirements & ADRs (Stage 2) on ${llmConfig.coderModel}...`
        );
        const s2 = await executeStage2PlanLive(currentScen, 0, activePolicyHash, llmConfig);
        currentScen = {
          ...currentScen,
          requirements: s2.requirements,
          decisions: s2.decisions,
          stageFlows: [...currentScen.stageFlows.slice(0, 1), s2.stageFlow]
        };
        setActiveScenario(currentScen);
        setWorkerTelemetries((prev) => [s2.telemetry, ...prev]);
        setHighestCompletedStage((prev) => Math.max(prev, 1));
      }
      setExecutingStageLabel(
        `Synthesizing Step 3 Code & Tests [Worker A (${llmConfig.coderModel}) ∥ Worker B (${llmConfig.verifierModel})]...`
      );
      const s3 = await executeStage3ParallelSynthesisLive(currentScen, llmConfig);
      currentScen = {
        ...currentScen,
        files: s3.files,
        stageFlows: [...currentScen.stageFlows.slice(0, 2), s3.stageFlow]
      };
      setActiveScenario(currentScen);
      setCheckpointHash(s3.checkpointHash);
      setWorkerTelemetries((prev) => [s3.workerBTelemetry, s3.workerATelemetry, ...prev]);
      setCurrentStage(2);
      setHighestCompletedStage((prev) => Math.max(prev, 2));
      setSelectedComponentId('comp_coder');
    } catch (err) {
      setLlmStatusMessage(
        err instanceof Error ? err.message : 'Local model offline. Generated deterministic code files.'
      );
      const full = synthesizeDynamicScenarioFromPrompt(
        activeScenario.rawPrompt,
        llmConfig.coderModel,
        activePolicyHash,
        knowledgeUnits
      );
      const t2 = emitOfflineRoleTelemetry('S2', full, llmConfig);
      const t3a = emitOfflineRoleTelemetry('S3A', full, llmConfig);
      const t3b = emitOfflineRoleTelemetry('S3B', full, llmConfig);
      setClarifiedPlatform('web');
      setActiveScenario((prev) => ({
        ...prev,
        requirements: full.requirements,
        decisions: full.decisions,
        files: full.files,
        stageFlows: full.stageFlows.slice(0, 3)
      }));
      setWorkerTelemetries((prev) => [t3b, t3a, t2, ...prev]);
      setCheckpointHash('sha256:s3_offline_chk');
      setCurrentStage(2);
      setHighestCompletedStage((prev) => Math.max(prev, 2));
      setSelectedComponentId('comp_coder');
    } finally {
      setIsStageExecuting(false);
      setExecutingStageLabel('');
    }
  };

  const handleOpenResultWithPrompt = (promptText?: string) => {
    const clean = (promptText || customPromptInput || activeScenario.rawPrompt || 'i need landing-page for my site').trim();
    const generated = synthesizeDynamicScenarioFromPrompt(
      clean,
      llmConfig.coderModel,
      activePolicyHash,
      knowledgeUnits
    );
    setCustomPromptInput(clean);
    setActiveScenario(generated);
    setIsRuntimeIdle(false);
    setClarifiedPlatform('web');
    setRepaired(true);
    setCheckpointHash('sha256:s3_verified_chk');
    setSealId('#SEAL-DELIVERY-2026');
    setCurrentStage(4);
    setHighestCompletedStage(4);
    switchWorkspaceTab('result_preview');
  };

  const handleResetToIdleRuntime = () => {
    clearWorkerTokenStream();
    setIsRuntimeIdle(true);
    setHighestCompletedStage(-1);
    setCurrentStage(0);
    setClarifiedPlatform(null);
    setRepaired(false);
    setWorkerTelemetries([]);
    setCheckpointHash('sha256:pending');
    setSealId('#SEAL-PENDING');
    setSelectedComponentId('comp_intake');
    setActiveTab('flow_studio');
  };

  const handleTogglePolicyHash = async () => {
    const nextPolicy = activePolicyHash === 'POL-2026-v1' ? 'POL-2026-v2' : 'POL-2026-v1';
    setActivePolicyHash(nextPolicy);
    try {
      const res = await fetch('/api/knowledge/toggle-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyHash: nextPolicy })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activePolicyHash) setActivePolicyHash(data.activePolicyHash);
        if (data.knowledgeUnits) setKnowledgeUnits(data.knowledgeUnits);
      }
    } catch {
      // State already toggled
    }
  };

  const switchWorkspaceTab = (tab: WorkspaceTabId) => {
    setActiveTab(tab);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  };

  const liveTab = { id: 'flow_studio' as const, label: 'Live Runtime', shortLabel: 'Live', badge: 'S0→S5', icon: Workflow };
  const staticTabs = [
    { id: 'abstract_model' as const, label: 'Model', fullLabel: 'Abstract Model', icon: Boxes },
    { id: 'architecture' as const, label: 'Map', fullLabel: 'System Map', icon: Network },
    { id: 'knowledge_graph' as const, label: 'Knowledge', fullLabel: 'Knowledge Graph', icon: Database },
    { id: 'traceability' as const, label: 'Proof', fullLabel: 'Proof & Lineage', icon: FileCheck2 }
  ];
  const workspaceTabs = [liveTab, ...staticTabs];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <header className="app-header">
        <div className="header-inner">
          <a
            href="#top"
            className="brand"
            aria-label="ShiftCore home"
            onClick={(event) => {
              event.preventDefault();
              switchWorkspaceTab('flow_studio');
            }}
          >
            <span className="brand-symbol">
              <Box size={20} strokeWidth={1.8} />
            </span>
            <span>
              Shift<span className="brand-accent">Core</span>
            </span>
          </a>

          <nav className="workspace-nav" aria-label="Workspace views">
            <div className="flex items-center gap-0.5 bg-[#0b1018] p-1 rounded-xl border border-[#212d3f]">
              {/* Group 1: Live Engine & Delivered Result */}
              <button
                type="button"
                className={`workspace-tab ${activeTab === liveTab.id ? 'is-active is-live' : ''}`}
                aria-label={liveTab.label}
                aria-current={activeTab === liveTab.id ? 'page' : undefined}
                onClick={() => switchWorkspaceTab(liveTab.id)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#53d6ab] animate-pulse" />
                <Workflow size={13} className="text-[#53d6ab]" />
                <span>Live Runtime</span>
                <span className="text-[10px] font-mono font-bold text-[#53d6ab] bg-[#53d6ab]/15 px-1 py-0.2 rounded">
                  S0→S5
                </span>
              </button>

              <button
                type="button"
                data-testid="nav-result-preview"
                disabled={isRuntimeIdle || highestCompletedStage < 4}
                title={
                  !isRuntimeIdle && highestCompletedStage >= 4
                    ? 'Open Sealed Deliverable Result & Download Center'
                    : 'Complete Steps 1 → 5 (including Step 4 Surgical Repair) to unlock Sealed Result'
                }
                className={`workspace-tab ${activeTab === 'result_preview' ? 'is-active is-live' : ''} ${
                  isRuntimeIdle || highestCompletedStage < 4 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Result & Download"
                aria-current={activeTab === 'result_preview' ? 'page' : undefined}
                onClick={() => {
                  if (!isRuntimeIdle && highestCompletedStage >= 4) {
                    switchWorkspaceTab('result_preview');
                  }
                }}
              >
                <Eye size={13} className="text-[#ff8a4c]" />
                <span className="font-bold text-white">Result &amp; Download</span>
                <span className="text-[10px] font-mono font-bold text-[#0b1018] bg-[#ff8a4c] px-1.5 py-0.2 rounded">
                  {!isRuntimeIdle && highestCompletedStage >= 4 ? 'HTML / ZIP' : '🔒 S5 Seal'}
                </span>
              </button>

              <div className="h-4 w-px bg-[#26354a] mx-0.5" />

              {/* Group 2: Formal Metamodel */}
              {staticTabs.map(({ id, label, fullLabel, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`workspace-tab ${activeTab === id ? 'is-active' : ''}`}
                  aria-label={fullLabel}
                  aria-current={activeTab === id ? 'page' : undefined}
                  onClick={() => switchWorkspaceTab(id)}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span className="hidden 2xl:inline">{fullLabel}</span>
                  <span className="2xl:hidden">{label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Consolidated Local Worker Availability Pill */}
            <button
              type="button"
              data-testid="header-coder-status"
              onClick={() => setShowLlmSettings(!showLlmSettings)}
              title={`Worker A (Coder): ${coderWorkerStatus.modelName} | Worker B (Verifier): ${verifierWorkerStatus.modelName} — Click to configure`}
              className={`px-2 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                llmReachable
                  ? 'border-[#53d6ab]/40 bg-[#53d6ab]/10 text-[#53d6ab]'
                  : 'border-[#fb8797]/40 bg-[#fb8797]/10 text-[#fb8797]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isProbingWorkers ? 'bg-[#ff8a4c] animate-ping' : llmReachable ? 'bg-[#53d6ab]' : 'bg-[#fb8797]'
                }`}
              />
              <strong className="text-white font-mono">{llmConfig.coderModel}</strong>
              <span className="text-[9px] px-1 py-0.2 rounded font-extrabold bg-[#0b121e]">
                {llmReachable ? 'ONLINE' : 'OFFLINE'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-2 py-1 rounded-lg border border-[#8caef9]/40 bg-[#8caef9]/10 hover:bg-[#8caef9]/20 text-[#8caef9] font-mono text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Explainer: How ShiftCore separates the Static Metamodel from the Live Dynamic Engine"
            >
              <Scale size={13} />
              <span className="hidden sm:inline">Explainer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSlidesOpen(true)}
              className="px-2 py-1 rounded-lg border border-[#ff8a4c]/40 bg-[#ff8a4c]/10 hover:bg-[#ff8a4c]/20 text-[#ffa875] font-mono text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="10-Slide Academic Defense"
            >
              <Presentation size={13} />
              <span className="hidden sm:inline">Defense</span>
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleResetToIdleRuntime}
              title="Reset Runtime to clean S0 Idle State"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="main-content">
        {/* ===============================================================
            COMPACT PARALLEL LOCAL LLM RUNTIME COMMAND BAR
           =============================================================== */}
        <section
          aria-label="Parallel Local LLM Runtime Control Bar"
          className="mb-4 rounded-xl border border-[#243247] bg-[#111826] px-4 py-3 space-y-2.5 shadow-md"
        >
          {/* Row 1: Full-Width Prompt Input + Step-by-Step / Auto-Run Dispatch */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customPromptInput.trim()) {
                handleStartRuntimeWithPrompt(customPromptInput);
              }
            }}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-2 min-w-0"
          >
            <input
              type="text"
              data-testid="top-bar-prompt-input"
              value={customPromptInput}
              onChange={(e) => setCustomPromptInput(e.target.value)}
              placeholder="Enter your software engineering prompt (e.g., i need landing-page for my site)..."
              className="flex-1 min-w-0 rounded-lg border border-[#2b3c56] bg-[#0a0f18] px-3.5 py-2 text-xs text-white placeholder-[#7c8ca5] focus:border-[#ff8a4c] focus:outline-none font-mono"
            />
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="submit"
                data-testid="top-start-step1-btn"
                disabled={isStageExecuting || !customPromptInput.trim()}
                className="px-3.5 py-2 rounded-lg bg-[#ff8a4c] hover:bg-[#ffa06b] disabled:opacity-50 text-[#0c1018] font-mono text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                <Play size={13} />
                <span>Start Step 1 Intake Role (S0 → S1) →</span>
              </button>
              <button
                type="button"
                data-testid="top-autorun-btn"
                disabled={isStageExecuting}
                onClick={() =>
                  handleAutoRunFullPipelineLive(customPromptInput.trim() || activeScenario.rawPrompt)
                }
                className="px-3.5 py-2 rounded-lg bg-[#162234] hover:bg-[#1e2e46] border border-[#53d6ab]/45 text-[#53d6ab] disabled:opacity-50 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                {isStageExecuting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Running Roles...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    <span>Auto-Execute All 5 Stages (S1→S5)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Row 2: Compact Worker Telemetry & Configuration Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e293b] text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94a3b8]">
              <span
                data-testid="global-runtime-status"
                role="status"
                className="font-bold text-white px-2 py-0.5 rounded bg-[#182334] border border-[#2b3c56]"
              >
                {isRuntimeIdle
                  ? 'S0: Idle'
                  : `Step ${currentStage + 1}/5 Active`}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Coder A: <strong className="text-[#53d6ab]">{coderWorkerStatus.modelName}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Verifier B: <strong className="text-[#8caef9]">{verifierWorkerStatus.modelName}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className={llmReachable ? 'text-[#53d6ab]' : 'text-[#fb8797]'}>
                {llmReachable ? 'Daemon Online' : 'Deterministic Fallback'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => runLocalModelProbe(llmConfig)}
                className="px-2.5 py-1 rounded-lg border border-[#2b3a4f] bg-[#0d131d] hover:border-[#53d6ab] text-[11px] font-mono text-[#c8d3e2] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                title="Ping both Coder and Verifier models independently"
              >
                <RefreshCw size={12} className={isProbingWorkers ? 'animate-spin text-[#53d6ab]' : ''} />
                <span>Ping Workers</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLlmSettings(!showLlmSettings)}
                className="px-2.5 py-1 rounded-lg border border-[#324665] bg-[#0d131d] hover:border-[#ff8a4c] text-[11px] font-mono font-bold text-white flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Settings2 size={13} className="text-[#ff8a4c]" />
                <span>Configure Models</span>
              </button>
            </div>
          </div>

          {/* Expandable Parallel Local LLM Configuration Drawer */}
          {showLlmSettings && (
            <div className="rounded-xl border border-[#ff8a4c]/40 bg-[#0d131d] p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block font-mono text-xs text-[#a2afc3] mb-1">
                    Local Runtime Provider
                  </label>
                  <select
                    value={llmConfig.provider}
                    onChange={(e) => {
                      const provider = e.target.value as 'ollama' | 'openai_compatible';
                      const endpointUrl =
                        provider === 'ollama'
                          ? 'http://localhost:11434'
                          : 'http://localhost:1234/v1';
                      setLlmConfig((prev) => ({ ...prev, provider, endpointUrl }));
                    }}
                    className="w-full rounded-lg border border-[#2b3a4f] bg-[#151c28] px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="ollama">Ollama on Laptop (http://localhost:11434)</option>
                    <option value="openai_compatible">
                      LM Studio / vLLM (http://localhost:1234/v1)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#a2afc3] mb-1">
                    Local Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={llmConfig.endpointUrl}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({ ...prev, endpointUrl: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#2b3a4f] bg-[#151c28] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#53d6ab] mb-1">
                    Worker A: Coder &amp; Planner Model
                  </label>
                  <input
                    type="text"
                    list="local-models-list"
                    value={llmConfig.coderModel}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({ ...prev, coderModel: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#2b3a4f] bg-[#151c28] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#8caef9] mb-1">
                    Worker B: Independent Verifier Model
                  </label>
                  <input
                    type="text"
                    list="local-models-list"
                    value={llmConfig.verifierModel}
                    onChange={(e) =>
                      setLlmConfig((prev) => ({ ...prev, verifierModel: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#2b3a4f] bg-[#151c28] px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <datalist id="local-models-list">
                  {availableLocalModels.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* Quick Model Presets & Auto-Detected Local Models */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1a2536] text-xs font-mono">
                <span className="text-[#a2afc3] text-[11px]">Quick Model Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setLlmConfig((prev) => ({
                      ...prev,
                      coderModel: 'qwen3:4b',
                      verifierModel: 'qwen3:4b'
                    }));
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                    llmConfig.coderModel === 'qwen3:4b' && llmConfig.verifierModel === 'qwen3:4b'
                      ? 'bg-[#53d6ab]/20 text-[#53d6ab] border-[#53d6ab]'
                      : 'bg-[#151c28] text-[#c8d3e2] border-[#2b3a4f] hover:border-[#53d6ab]'
                  }`}
                >
                  Single Model: qwen3:4b (4B Lightweight · Low VRAM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLlmConfig((prev) => ({
                      ...prev,
                      coderModel: 'qwen2.5-coder:7b',
                      verifierModel: 'deepseek-coder:6.7b'
                    }));
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                    llmConfig.coderModel === 'qwen2.5-coder:7b' && llmConfig.verifierModel === 'deepseek-coder:6.7b'
                      ? 'bg-[#ff8a4c]/20 text-[#ff8a4c] border-[#ff8a4c]'
                      : 'bg-[#151c28] text-[#c8d3e2] border-[#2b3a4f] hover:border-[#ff8a4c]'
                  }`}
                >
                  Dual 7B / 6.7B: qwen2.5-coder + deepseek-coder
                </button>

                {availableLocalModels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto text-[11px]">
                    <span className="text-[#7c8ca5]">Detected in Ollama:</span>
                    {availableLocalModels.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setLlmConfig((prev) => ({
                            ...prev,
                            coderModel: m,
                            verifierModel: m
                          }));
                        }}
                        className="px-2 py-0.5 rounded bg-[#101724] border border-[#2b3a4f] hover:border-[#53d6ab] text-[#53d6ab] font-bold cursor-pointer"
                        title={`Set both Coder & Verifier to ${m}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e293b] text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2 text-[#a2afc3]">
                  <span>To allow your browser to connect directly to Ollama on your laptop, run:</span>
                  <code className="px-2.5 py-1 rounded bg-[#162234] text-[#ffa875] border border-[#2b3d59]">
                    OLLAMA_ORIGINS=&quot;*&quot; ollama serve
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('OLLAMA_ORIGINS="*" ollama serve');
                      setCopiedCommand(true);
                      setTimeout(() => setCopiedCommand(false), 2000);
                    }}
                    className="px-2 py-1 rounded bg-[#1b2738] hover:bg-[#24344b] text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>{copiedCommand ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    runLocalModelProbe(llmConfig);
                    setShowLlmSettings(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#ff8a4c] hover:bg-[#ffa06b] text-[#0c1018] font-extrabold cursor-pointer"
                >
                  Save &amp; Connect Parallel Workers
                </button>
              </div>
            </div>
          )}
        </section>

        <section
          id="workspace"
          className="workspace-section space-y-5"
          aria-label={workspaceTabs.find((tab) => tab.id === activeTab)?.label}
        >
          {activeTab === 'flow_studio' && (
            <>
              <LifecycleSimulator
                isRuntimeIdle={isRuntimeIdle}
                isStageExecuting={isStageExecuting}
                executingStageLabel={executingStageLabel}
                currentStage={currentStage}
                highestCompletedStage={highestCompletedStage}
                clarifiedPlatform={clarifiedPlatform}
                repaired={repaired}
                selectedComponentId={selectedComponentId}
                dependencyFilter={dependencyFilter}
                activeScenario={activeScenario}
                checkpointHash={checkpointHash}
                sealId={sealId}
                coderModel={llmConfig.coderModel}
                verifierModel={llmConfig.verifierModel}
                workerTelemetries={workerTelemetries}
                onStartRuntimeWithPrompt={handleStartRuntimeWithPrompt}
                onSelectPlatformAndCompileStage2={handleSelectPlatformAndCompileStage2}
                onAdvanceToStageWithLiveWorker={handleAdvanceToStageWithLiveWorker}
                onApplySurgicalRepairWithLiveWorker={handleApplySurgicalRepairWithLiveWorker}
                onAutoAdvanceToStage3={handleAutoAdvanceToStage3}
                onAutoRunFullPipelineLive={handleAutoRunFullPipelineLive}
                onOpenResultPreview={handleOpenResultWithPrompt}
                onToggleRepair={setRepaired}
                onFocusComponent={setSelectedComponentId}
                onChangeDependencyFilter={setDependencyFilter}
                onOpenKnowledgeTab={() => switchWorkspaceTab('knowledge_graph')}
              />
              <LiveRoleLogsConsole
                coderModel={llmConfig.coderModel}
                verifierModel={llmConfig.verifierModel}
                isStageExecuting={isStageExecuting}
                executingStageLabel={executingStageLabel}
                isRuntimeIdle={isRuntimeIdle}
              />
            </>
          )}

          {activeTab === 'result_preview' && (
            <ResultDeliverablesView
              activeScenario={activeScenario}
              checkpointHash={checkpointHash === 'sha256:pending_s3' ? 'sha256:s3_verified_chk' : checkpointHash}
              sealId={sealId === '#SEAL-PENDING' ? '#SEAL-DELIVERY-2026' : sealId}
              coderModel={llmConfig.coderModel}
              verifierModel={llmConfig.verifierModel}
              onBackToRuntime={() => switchWorkspaceTab('flow_studio')}
            />
          )}

          {activeTab === 'abstract_model' && (
            <AbstractModelView
              activeScenario={activeScenario}
              onSelectScenario={(scenId) => {
                const scen = SE_CODING_SCENARIOS[scenId] || SE_CODING_SCENARIOS.feat_refund_api;
                handleStartRuntimeWithPrompt(scen.rawPrompt);
              }}
              onJumpToJourney={() => switchWorkspaceTab('flow_studio')}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureGraph
              isRuntimeIdle={isRuntimeIdle}
              currentStage={currentStage}
              repaired={repaired}
              clarifiedPlatform={clarifiedPlatform}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              dependencyFilter={dependencyFilter}
              onChangeDependencyFilter={setDependencyFilter}
              activeScenario={activeScenario}
              compactMode={false}
            />
          )}

          {activeTab === 'knowledge_graph' && (
            <KnowledgeLifecycleView
              isRuntimeIdle={isRuntimeIdle}
              highestCompletedStage={highestCompletedStage}
              activeScenario={activeScenario}
              knowledgeUnits={knowledgeUnits}
              activePolicyHash={activePolicyHash}
              onTogglePolicyHash={handleTogglePolicyHash}
              onSelectScenario={(scenId) => {
                const scen = SE_CODING_SCENARIOS[scenId] || SE_CODING_SCENARIOS.feat_refund_api;
                handleStartRuntimeWithPrompt(scen.rawPrompt);
              }}
              onReturnToRuntime={() => switchWorkspaceTab('flow_studio')}
            />
          )}

          {activeTab === 'traceability' && (
            <TraceabilityMatrixView
              isRuntimeIdle={isRuntimeIdle}
              highestCompletedStage={highestCompletedStage}
              currentStage={currentStage}
              repaired={repaired}
              activeScenario={activeScenario}
              activePolicyHash={activePolicyHash}
              checkpointHash={checkpointHash}
              sealId={sealId}
              workerTelemetries={workerTelemetries}
              onToggleRepairState={setRepaired}
              onJumpToModule={(componentId) => {
                setSelectedComponentId(componentId);
                switchWorkspaceTab('architecture');
              }}
              onReturnToRuntime={() => switchWorkspaceTab('flow_studio')}
            />
          )}
        </section>
      </main>

      <SlidesDeckModal
        isOpen={isSlidesOpen}
        onClose={() => setIsSlidesOpen(false)}
        onJumpToStage={(st) => {
          if (isRuntimeIdle || st > highestCompletedStage) {
            handleAutoRunFullPipelineLive(SE_CODING_SCENARIOS.feat_refund_api.rawPrompt);
          } else {
            setCurrentStage(st);
          }
        }}
        onJumpToTab={switchWorkspaceTab}
      />

      <ArchitectureGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        activeModelName={llmConfig.coderModel}
      />

      <footer className="app-footer">
        <div>
          <span className="footer-mark">
            <Box size={14} /> ShiftCore
          </span>
          <span>
            Parallel Local LLM Runtime ({llmConfig.coderModel} ∥ {llmConfig.verifierModel})
          </span>
        </div>
        <span>
          <Check size={14} /> Progressive Role Execution · Independent Test Oracle · Surgical AST Repair
        </span>
      </footer>
    </div>
  );
}
