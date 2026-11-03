import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAdvanceToStage,
  computeRuntimeMetrics,
  getComponentDependencies,
  INITIAL_CALCULATOR_STATE,
  stepCalculator,
  SYSTEM_COMPONENTS,
  DATA_DEPENDENCY_EDGES,
  REQUIREMENT_TRACE_MATRIX,
  EVIDENCE_RECORDS_LEDGER,
  POLICY_GOVERNANCE_DISPOSITIONS
} from './runtimeEngine';

test('stage progression blocks advancing past Stage 0 until platform is clarified as web', () => {
  const unclarified = canAdvanceToStage(1, { clarifiedPlatform: null, repaired: false });
  assert.equal(unclarified.allowed, false);

  const desktopSelected = canAdvanceToStage(1, { clarifiedPlatform: 'desktop', repaired: false });
  assert.equal(desktopSelected.allowed, false);

  const webSelected = canAdvanceToStage(1, { clarifiedPlatform: 'web', repaired: false });
  assert.equal(webSelected.allowed, true);
});

test('completion gate blocks advancing to Stage 4 (Result) until DIV-ZERO-01 is repaired', () => {
  const beforeRepair = canAdvanceToStage(4, { clarifiedPlatform: 'web', repaired: false });
  assert.equal(beforeRepair.allowed, false);

  const afterRepair = canAdvanceToStage(4, { clarifiedPlatform: 'web', repaired: true });
  assert.equal(afterRepair.allowed, true);
});

test('runtime metrics separate evidence coverage (13/13) from acceptance pass rate (7/8 -> 8/8)', () => {
  const checkFailedMetrics = computeRuntimeMetrics({
    currentStage: 3,
    clarifiedPlatform: 'web',
    repaired: false
  });
  assert.equal(checkFailedMetrics.evidenceCollected, 13);
  assert.equal(checkFailedMetrics.evidenceTotal, 13);
  assert.equal(checkFailedMetrics.requirementsPassed, 7);
  assert.equal(checkFailedMetrics.unresolvedIssues, 1);
  assert.equal(checkFailedMetrics.globalStatusTone, 'rose');

  const checkRepairedMetrics = computeRuntimeMetrics({
    currentStage: 3,
    clarifiedPlatform: 'web',
    repaired: true
  });
  assert.equal(checkRepairedMetrics.requirementsPassed, 8);
  assert.equal(checkRepairedMetrics.unresolvedIssues, 0);
  assert.equal(checkRepairedMetrics.globalStatusTone, 'emerald');
});

test('system architecture graph has 8 core components, 14 data contracts, 13 evidence items, and 4 policy dispositions', () => {
  assert.equal(SYSTEM_COMPONENTS.length, 8);
  assert.equal(DATA_DEPENDENCY_EDGES.length, 14);
  assert.equal(EVIDENCE_RECORDS_LEDGER.length, 13);
  assert.equal(POLICY_GOVERNANCE_DISPOSITIONS.length, 4);

  const verifierDeps = getComponentDependencies('comp_verifier');
  assert.equal(verifierDeps.component.code, 'MOD-08');
  assert.ok(verifierDeps.incoming.some((e) => e.id === 'edge_evidence_verifier'));
  assert.ok(verifierDeps.outgoing.some((e) => e.id === 'edge_repair_loop'));

  const req08 = REQUIREMENT_TRACE_MATRIX.find((r) => r.id === 'REQ-08');
  assert.ok(req08);
  assert.equal(req08.statusBeforeRepair, 'FAIL');
  assert.equal(req08.statusAfterRepair, 'PASS');

  const evid13 = EVIDENCE_RECORDS_LEDGER.find((e) => e.id === 'EVID-13');
  assert.ok(evid13);
  assert.equal(evid13.verdictBeforeRepair, 'RECORDED_FAIL');
  assert.equal(evid13.verdictAfterRepair, 'RECORDED_PASS');
});

test('deterministic calculator engine handles arithmetic, chained ops, operator switching, and zero-division guard', () => {
  let state = INITIAL_CALCULATOR_STATE;
  state = stepCalculator(state, '7');
  state = stepCalculator(state, '×');
  state = stepCalculator(state, '6');
  state = stepCalculator(state, '=');
  assert.equal(state.display, '42');

  // Chained arithmetic: 7 + 3 × 2 = 20
  let chained = INITIAL_CALCULATOR_STATE;
  for (const k of ['7', '+', '3', '×', '2', '=']) {
    chained = stepCalculator(chained, k, true);
  }
  assert.equal(chained.display, '20');

  // Operator switching: 9 + - 4 = 5
  let switched = INITIAL_CALCULATOR_STATE;
  for (const k of ['9', '+', '-', '4', '=']) {
    switched = stepCalculator(switched, k, true);
  }
  assert.equal(switched.display, '5');

  // Unguarded division by zero (before repair) produces Infinity
  let unguarded = INITIAL_CALCULATOR_STATE;
  unguarded = stepCalculator(unguarded, '8');
  unguarded = stepCalculator(unguarded, '÷');
  unguarded = stepCalculator(unguarded, '0');
  unguarded = stepCalculator(unguarded, '=', false);
  assert.equal(unguarded.display, 'Infinity');

  // Guarded division by zero (after targeted repair) produces controlled Error
  let guarded = INITIAL_CALCULATOR_STATE;
  guarded = stepCalculator(guarded, '8');
  guarded = stepCalculator(guarded, '÷');
  guarded = stepCalculator(guarded, '0');
  guarded = stepCalculator(guarded, '=', true);
  assert.equal(guarded.display, 'Error');
});

test('when local model daemon is OFFLINE, probe reports DAEMON_OFFLINE (0ms) and stage execution rejects with 0 tokens', async () => {
  const {
    probeLocalModelConnection,
    executeStage1IntakeLive,
    clearWorkerTokenStream,
    subscribeToWorkerTokenStream
  } = await import('./localLlmBridge');
  type StreamEvent = import('./localLlmBridge').WorkerTokenStreamEvent;

  const offlineCfg = {
    provider: 'ollama' as const,
    endpointUrl: 'http://127.0.0.1:1', // Unreachable local port
    coderModel: 'qwen2.5-coder:7b',
    verifierModel: 'deepseek-coder:6.7b',
    temperature: 0.1
  };

  const probe = await probeLocalModelConnection(offlineCfg);
  assert.equal(probe.reachable, false);
  assert.equal(probe.coderWorkerStatus.available, false);
  assert.equal(probe.coderWorkerStatus.daemonOnline, false);
  assert.equal(probe.coderWorkerStatus.mode, 'DAEMON_OFFLINE');
  assert.equal(probe.coderWorkerStatus.latencyMs, 0);

  assert.equal(probe.verifierWorkerStatus.available, false);
  assert.equal(probe.verifierWorkerStatus.daemonOnline, false);
  assert.equal(probe.verifierWorkerStatus.mode, 'DAEMON_OFFLINE');
  assert.equal(probe.verifierWorkerStatus.latencyMs, 0);

  clearWorkerTokenStream();
  const events: StreamEvent[] = [];
  const unsub = subscribeToWorkerTokenStream((e) => events.push(e));

  await assert.rejects(
    () =>
      executeStage1IntakeLive(
        'Add a POST /api/v1/payments/:id/refund endpoint with DB transaction',
        'POL-2026-v1',
        [],
        offlineCfg
      ),
    /is OFFLINE/
  );
  unsub();

  assert.ok(events.length >= 1);
  assert.ok(events.every((e) => e.tokensEmitted === 0), 'Zero tokens must be emitted when daemon is offline');
  const errorEvent = events[events.length - 1];
  assert.equal(errorEvent.eventType, 'STREAM_ERROR');
  assert.equal(errorEvent.tokensEmitted, 0);
  assert.equal(errorEvent.tokensPerSec, 0);
  assert.equal(errorEvent.connectionSource, 'OFFLINE_NO_DAEMON');
});

async function withEphemeralOllamaDaemon<T>(fn: (endpointUrl: string) => Promise<T>): Promise<T> {
  const http = await import('node:http');
  const server = http.createServer((req, res) => {
    if (req.url === '/api/tags' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          models: [{ name: 'qwen2.5-coder:7b' }, { name: 'deepseek-coder:6.7b' }]
        })
      );
      return;
    }
    if (req.url === '/api/show' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ details: { family: 'qwen2', parameter_size: '7B' } }));
      return;
    }
    if (req.url === '/api/chat' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
        const chunks = [
          '{"role":"LOCAL_MODEL_WORKER",',
          '"status":"VERIFIED",',
          '"stage":"LIVE_REDUCTION",',
          '"verdict":"RECORDED_PASS",',
          '"summary":"Live token stream from local model worker"}\n'
        ];
        for (let i = 0; i < chunks.length; i++) {
          const isLast = i === chunks.length - 1;
          res.write(
            JSON.stringify({
              message: { content: chunks[i] },
              done: isLast
            }) + '\n'
          );
        }
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 11434;
  const endpointUrl = `http://127.0.0.1:${port}`;

  try {
    return await fn(endpointUrl);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

test('progressive Local Model reduction starts with zero unexecuted Stage 2-5 artifacts and dynamically reduces provenance records when daemon is online', async () => {
  const {
    executeStage1IntakeLive,
    executeStage2PlanLive,
    executeStage3ParallelSynthesisLive,
    executeStage4VerificationAuditLive,
    executeStage4SurgicalRepairLive,
    executeStage5SealAndExtractLive,
    reduceLiveProvenanceLedgerFromScenario
  } = await import('./localLlmBridge');

  await withEphemeralOllamaDaemon(async (endpointUrl) => {
    const cfg = {
      provider: 'ollama' as const,
      endpointUrl,
      coderModel: 'qwen2.5-coder:7b',
      verifierModel: 'deepseek-coder:6.7b',
      temperature: 0.1
    };

    // Stage 1: Intake Role ONLY populates Stage 1 elicitation & stageFlows[0]
    const s1 = await executeStage1IntakeLive(
      'Add a POST /api/v1/payments/:id/refund endpoint with DB transaction',
      'POL-2026-v1',
      [],
      cfg
    );
    assert.equal(s1.baseScenario.decisions.length, 0, 'Stage 2 decisions must be empty after Stage 1');
    assert.equal(s1.baseScenario.requirements.length, 0, 'Stage 2 requirements must be empty after Stage 1');
    assert.equal(s1.baseScenario.files.length, 0, 'Stage 3 files must be empty after Stage 1');
    assert.equal(s1.baseScenario.stageFlows.length, 1, 'Only Stage 1 flow should exist after Stage 1');
    assert.equal(s1.baseScenario.extractedKnowledge.createdAt, '', 'Knowledge unit createdAt must be empty until Stage 5');

    // Stage 2: Architect Role reduces R1..R8, ADRs, and stageFlows[1]
    const s2 = await executeStage2PlanLive(s1.baseScenario, 0, 'POL-2026-v1', cfg);
    assert.equal(s2.requirements.length, 8);
    assert.ok(s2.decisions.length >= 2);
    assert.equal(s2.stageFlow.stageNumber, 2);

    const scenAfterS2 = {
      ...s1.baseScenario,
      requirements: s2.requirements,
      decisions: s2.decisions,
      stageFlows: [...s1.baseScenario.stageFlows, s2.stageFlow]
    };

    // Stage 3: Parallel Coder (A) || Test Oracle (B) reduces multi-file code and checkpointHash
    const s3 = await executeStage3ParallelSynthesisLive(scenAfterS2, cfg);
    assert.equal(s3.files.length, 3);
    assert.ok(s3.checkpointHash.startsWith('sha256:'));
    assert.equal(s3.stageFlow.stageNumber, 3);

    const scenAfterS3 = {
      ...scenAfterS2,
      files: s3.files,
      stageFlows: [...scenAfterS2.stageFlows, s3.stageFlow]
    };

    // Stage 4A & 4B: Verifier Oracle Audit & Surgical AST Patcher
    const s4Audit = await executeStage4VerificationAuditLive(scenAfterS3, cfg);
    assert.equal(s4Audit.passedCount, 7);
    assert.equal(s4Audit.failedRequirement.id, 'R8');

    const s4Repair = await executeStage4SurgicalRepairLive(scenAfterS3, cfg);
    assert.ok(s4Repair.repairedCheckpointHash.startsWith('sha256:'));
    assert.notEqual(s4Repair.repairedCheckpointHash, s3.checkpointHash);

    // Stage 5: Cryptographic Sealer & Tier-3 Knowledge Extractor stamps live UTC timestamp
    const s5 = await executeStage5SealAndExtractLive(
      scenAfterS3,
      s4Repair.repairedCheckpointHash,
      'POL-2026-v1',
      cfg
    );
    assert.ok(s5.sealId.startsWith('#SEAL-'));
    assert.ok(s5.promotedUnit.createdAt.length > 10, 'Promoted unit must have a live ISO timestamp');
    assert.ok(!s5.promotedUnit.createdAt.startsWith('2026-11-03T15:'), 'Must not use hardcoded static timestamp');

    // Verify dynamic Provenance Ledger reduction for Payment Refund API has zero calculator static strings
    const ledger = reduceLiveProvenanceLedgerFromScenario(
      {
        ...scenAfterS3,
        extractedKnowledge: s5.promotedUnit,
        stageFlows: [...scenAfterS3.stageFlows, s4Audit.stageFlow, s5.stageFlow]
      },
      [
        s5.telemetry,
        s4Repair.telemetry,
        s4Audit.telemetry,
        s3.workerBTelemetry,
        s3.workerATelemetry,
        s2.telemetry,
        s1.telemetry
      ],
      s4Repair.repairedCheckpointHash,
      s5.sealId,
      'POL-2026-v1'
    );
    assert.equal(ledger.length, 13);
    assert.ok(ledger.every((r) => !r.title.includes('اعمل آلة حاسبة')));
    assert.ok(ledger.every((r) => r.latencyMs >= 0));
  });
});

test('probeLocalModelConnection pings Coder and Verifier models independently in parallel when daemon is online', async () => {
  const { probeLocalModelConnection } = await import('./localLlmBridge');
  await withEphemeralOllamaDaemon(async (endpointUrl) => {
    const probe = await probeLocalModelConnection({
      provider: 'ollama',
      endpointUrl,
      coderModel: 'qwen2.5-coder:7b',
      verifierModel: 'deepseek-coder:6.7b',
      temperature: 0.1
    });

    assert.equal(probe.reachable, true);
    assert.equal(probe.coderWorkerStatus.workerId, 'WORKER-A-CODER');
    assert.equal(probe.coderWorkerStatus.modelName, 'qwen2.5-coder:7b');
    assert.equal(probe.coderWorkerStatus.available, true);
    assert.equal(probe.coderWorkerStatus.mode, 'DAEMON_ONLINE');
    assert.ok(probe.coderWorkerStatus.latencyMs > 0);
    assert.ok(probe.coderWorkerStatus.lastCheckedAt.length > 10);

    assert.equal(probe.verifierWorkerStatus.workerId, 'WORKER-B-VERIFIER');
    assert.equal(probe.verifierWorkerStatus.modelName, 'deepseek-coder:6.7b');
    assert.equal(probe.verifierWorkerStatus.available, true);
    assert.equal(probe.verifierWorkerStatus.mode, 'DAEMON_ONLINE');
    assert.ok(probe.verifierWorkerStatus.latencyMs > 0);
    assert.ok(probe.verifierWorkerStatus.lastCheckedAt.length > 10);
  });
});

test('subscribeToWorkerTokenStream emits real-time STREAM_START, TOKEN_DELTA, and STREAM_COMPLETE events from live NDJSON stream', async () => {
  const {
    subscribeToWorkerTokenStream,
    clearWorkerTokenStream,
    getWorkerTokenStreamSnapshot,
    executeStage1IntakeLive,
    executeStage3ParallelSynthesisLive
  } = await import('./localLlmBridge');
  type StreamEvent = import('./localLlmBridge').WorkerTokenStreamEvent;

  await withEphemeralOllamaDaemon(async (endpointUrl) => {
    clearWorkerTokenStream();
    const capturedEvents: StreamEvent[] = [];
    const unsubscribe = subscribeToWorkerTokenStream((event) => {
      capturedEvents.push(event);
    });

    const cfg = {
      provider: 'ollama' as const,
      endpointUrl,
      coderModel: 'qwen2.5-coder:7b',
      verifierModel: 'deepseek-coder:6.7b',
      temperature: 0.1
    };

    const s1 = await executeStage1IntakeLive(
      'Add a POST /api/v1/payments/:id/refund endpoint with DB transaction',
      'POL-2026-v1',
      [],
      cfg
    );

    // Stage 3 executes Coder Worker A and Verifier Worker B in parallel
    await executeStage3ParallelSynthesisLive(s1.baseScenario, cfg);
    unsubscribe();

    const coderEvents = capturedEvents.filter((e) => e.workerPool === 'CODER_WORKER_A');
    const verifierEvents = capturedEvents.filter((e) => e.workerPool === 'VERIFIER_WORKER_B');

    assert.ok(coderEvents.some((e) => e.eventType === 'STREAM_START'), 'Coder pool must emit STREAM_START');
    assert.ok(
      coderEvents.filter((e) => e.eventType === 'TOKEN_DELTA').length >= 4,
      'Coder pool must emit multiple progressive TOKEN_DELTA chunks'
    );
    assert.ok(coderEvents.some((e) => e.eventType === 'STREAM_COMPLETE'), 'Coder pool must emit STREAM_COMPLETE');

    assert.ok(verifierEvents.some((e) => e.eventType === 'STREAM_START'), 'Verifier pool must emit STREAM_START');
    assert.ok(
      verifierEvents.filter((e) => e.eventType === 'TOKEN_DELTA').length >= 4,
      'Verifier pool must emit multiple progressive TOKEN_DELTA chunks'
    );
    assert.ok(verifierEvents.some((e) => e.eventType === 'STREAM_COMPLETE'), 'Verifier pool must emit STREAM_COMPLETE');

    const snapshot = getWorkerTokenStreamSnapshot();
    assert.equal(snapshot.length, 3, 'Snapshot should hold s1-intake, s3-worker-a-coder, and s3-worker-b-oracle streams');
    assert.ok(snapshot.every((s) => s.connectionSource === 'DIRECT_BROWSER_LOCALHOST'));
  });
});

