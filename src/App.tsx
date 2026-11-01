/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  StageIndex,
  DependencyCategory,
  computeRuntimeMetrics,
  STAGE_DEFINITIONS
} from './lib/runtimeEngine';
import { LifecycleSimulator } from './components/LifecycleSimulator';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { TraceabilityMatrixView } from './components/TraceabilityMatrixView';

type ActiveWorkspaceTab = 'flow_studio' | 'architecture' | 'traceability';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('flow_studio');
  const [currentStage, setCurrentStage] = useState<StageIndex>(0);
  const [clarifiedPlatform, setClarifiedPlatform] = useState<'web' | 'desktop' | null>(null);
  const [repaired, setRepaired] = useState<boolean>(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('comp_analyzer');
  const [dependencyFilter, setDependencyFilter] = useState<DependencyCategory | 'all'>('all');

  const metrics = computeRuntimeMetrics({
    currentStage,
    clarifiedPlatform,
    repaired
  });

  const handleStageChange = (nextStage: StageIndex) => {
    setCurrentStage(nextStage);
    const primaryComp = STAGE_DEFINITIONS[nextStage].primaryComponents[0];
    if (primaryComp) {
      setSelectedComponentId(primaryComp);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlatform = (platform: 'web' | 'desktop') => {
    setClarifiedPlatform(platform);
    setSelectedComponentId('comp_analyzer');
  };

  const handleApplyRepair = () => {
    setRepaired(true);
    setSelectedComponentId('comp_verifier');
  };

  const handleToggleRepair = (val: boolean) => {
    setRepaired(val);
    setSelectedComponentId('comp_verifier');
  };

  const handleResetSimulation = () => {
    setCurrentStage(0);
    setClarifiedPlatform(null);
    setRepaired(false);
    setSelectedComponentId('comp_analyzer');
    setDependencyFilter('all');
    setActiveTab('flow_studio');
  };

  const handleCompleteFullDemoPath = () => {
    setClarifiedPlatform('web');
    setRepaired(true);
    setCurrentStage(4);
    setSelectedComponentId('comp_verifier');
    setActiveTab('flow_studio');
  };

  const switchWorkspaceTab = (tab: ActiveWorkspaceTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col text-[#f7f8fb]">
      {/* Strict 3-Zone Top Bar Contract with ShiftCore Top Orange Stripe */}
      <header className="sticky top-0 z-30 border-t-4 border-t-[#ff7015] border-b border-b-[#17243a] bg-[#040915]/95 backdrop-blur px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            switchWorkspaceTab('flow_studio');
          }}
          className="text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap shrink-0"
        >
          Shift<span className="text-[#ff7015]">Core</span>
        </a>

        {/* Zone 2: 3 Calculator-Dedicated Views */}
        <nav
          aria-label="Calculator Task Views"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => switchWorkspaceTab('flow_studio')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'flow_studio'
                ? 'border-[#ff7015] text-white font-bold'
                : 'border-transparent text-[#95a3ba] hover:text-white'
            }`}
          >
            1. Calculator Runtime Flow (Steps 1–5)
          </button>
          <button
            type="button"
            onClick={() => switchWorkspaceTab('architecture')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-[#ff7015] text-white font-bold'
                : 'border-transparent text-[#95a3ba] hover:text-white'
            }`}
          >
            2. Calculator Architecture & Data Dependencies
          </button>
          <button
            type="button"
            onClick={() => switchWorkspaceTab('traceability')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'traceability'
                ? 'border-[#ff7015] text-white font-bold'
                : 'border-transparent text-[#95a3ba] hover:text-white'
            }`}
          >
            3. Calculator Evidence Ledger (13/13)
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetSimulation}
            className="px-4 py-2 text-xs font-extrabold text-[#08101e] bg-[#ff7015] hover:bg-[#ff812f] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reset Calculator Task
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 max-w-[1420px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ShiftCore Hero Card — 100% Dedicated to TASK-001 («اعمل آلة حاسبة») */}
        <section className="rounded-2xl border border-[#1d2e48] bg-gradient-to-br from-[#0c182c]/95 to-[#08101f]/90 p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="font-mono text-[11px] font-bold tracking-widest text-[#ff7015]">
              COGNITIVE AI RUNTIME · REFERENCE TASK #001 («اعمل آلة حاسبة»)
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
              Give AI the task. Keep control of how it gets done.
            </h1>
            <p className="mt-1.5 text-sm text-[#95a3ba] max-w-3xl">
              The example is intentionally simple:{' '}
              <strong className="text-white">“اعمل آلة حاسبة”</strong> (Make a calculator). The
              value is everything the Runtime does around the AI—trace the 5-step Calculator
              lifecycle on the left and its live architectural & data dependencies on the right.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div
              dir="rtl"
              className="rounded-xl border border-[#ff7015]/50 bg-[#ff7015]/10 px-4 py-2.5 text-lg font-extrabold text-white whitespace-nowrap"
            >
              اعمل آلة حاسبة
            </div>

            <div className="rounded-xl border border-[#223149] bg-[#091326] px-3.5 py-2 text-xs font-mono">
              <div className="text-[10px] text-[#95a3ba]">TASK-001 STATUS</div>
              <div
                data-testid="global-runtime-status"
                className={`mt-0.5 font-extrabold ${
                  metrics.globalStatusTone === 'emerald'
                    ? 'text-[#35d39a]'
                    : metrics.globalStatusTone === 'rose'
                      ? 'text-[#ff6b72]'
                      : 'text-[#ff7015]'
                }`}
              >
                {metrics.globalStatusLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteFullDemoPath}
              className="px-3.5 py-2.5 rounded-xl border border-[#263852] bg-[#0a1426] hover:border-[#ff7015] text-xs font-mono font-bold text-[#dce3ef] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Jump to Verified Calculator ⏭
            </button>
          </div>
        </section>

        {/* VIEW 1: SPLIT-SCREEN CALCULATOR FLOW (STEPS 1–5) + LIVE RUNTIME PIPELINE */}
        {activeTab === 'flow_studio' && (
          <LifecycleSimulator
            currentStage={currentStage}
            clarifiedPlatform={clarifiedPlatform}
            repaired={repaired}
            selectedComponentId={selectedComponentId}
            dependencyFilter={dependencyFilter}
            onSelectPlatform={handleSelectPlatform}
            onApplyRepair={handleApplyRepair}
            onToggleRepair={handleToggleRepair}
            onChangeStage={handleStageChange}
            onFocusComponent={setSelectedComponentId}
            onChangeDependencyFilter={setDependencyFilter}
          />
        )}

        {/* VIEW 2: CALCULATOR SYSTEM ARCHITECTURE & DATA DEPENDENCY MAP */}
        {activeTab === 'architecture' && (
          <ArchitectureGraph
            currentStage={currentStage}
            repaired={repaired}
            clarifiedPlatform={clarifiedPlatform}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            dependencyFilter={dependencyFilter}
            onChangeDependencyFilter={setDependencyFilter}
            compactMode={false}
          />
        )}

        {/* VIEW 3: CALCULATOR END-TO-END TRACEABILITY & 13/13 EVIDENCE LEDGER */}
        {activeTab === 'traceability' && (
          <TraceabilityMatrixView
            repaired={repaired}
            onToggleRepairState={(val) => setRepaired(val)}
            onJumpToModule={(compId) => {
              setSelectedComponentId(compId);
              switchWorkspaceTab('architecture');
            }}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-[#17243a] px-6 py-4 text-xs text-[#95a3ba]">
        <div className="max-w-[1420px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            ShiftCore — Cognitive AI Runtime · Reference Task #001: «اعمل آلة حاسبة» (Calculator)
          </div>
          <div className="font-mono">
            8 Modules · 14 Data Contracts · 8 Requirements · 13 Provenance Records · No eval()
          </div>
        </div>
      </footer>
    </div>
  );
}
