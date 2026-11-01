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
