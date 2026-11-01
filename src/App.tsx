/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Box, Check, FileCheck2, Network, RotateCcw, Workflow } from 'lucide-react';
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
    document.getElementById('workspace')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
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
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  const workspaceTabs = [
    { id: 'flow_studio' as const, label: 'Task journey', icon: Workflow },
    { id: 'architecture' as const, label: 'System map', icon: Network },
    { id: 'traceability' as const, label: 'Proof', icon: FileCheck2 }
  ];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">Skip to workspace</a>
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
            <span className="brand-symbol"><Box size={22} strokeWidth={1.7} /></span>
            <span>Shift<span className="brand-accent">Core</span></span>
            <span className="product-label">Runtime Studio</span>
          </a>

          <nav className="workspace-nav" aria-label="Workspace views">
            {workspaceTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`workspace-tab ${activeTab === id ? 'is-active' : ''}`}
                aria-label={label}
                aria-current={activeTab === id ? 'page' : undefined}
                onClick={() => switchWorkspaceTab(id)}
              >
                <Icon size={17} aria-hidden="true" />
                <span className="desktop-tab-label">{label}</span>
                <span className="mobile-tab-label">{id === 'flow_studio' ? 'Journey' : label}</span>
              </button>
            ))}
          </nav>

          <button type="button" className="reset-button" onClick={handleResetSimulation}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reset task</span>
          </button>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="overview" aria-labelledby="overview-title">
          <div className="overview-copy">
            <div className="eyebrow"><span className="live-dot" /> INTERACTIVE EXAMPLE</div>
            <h1 id="overview-title">See how an AI task becomes a <span>verified result.</span></h1>
            <p>Follow one request through five clear steps. Make a decision, see the work, and check the proof before the task is complete.</p>
            <div className="overview-actions">
              <button type="button" className="primary-action" onClick={() => {
                setActiveTab('flow_studio');
                document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>
                Start the journey <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="text-action" onClick={handleCompleteFullDemoPath}>
                See finished example <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="task-card">
            <div className="task-card-heading">
              <span className="eyebrow">THE REQUEST</span>
              <span className="task-id">TASK-001</span>
            </div>
            <div className="task-request">
              <div>
                <h2 lang="ar" dir="rtl">اعمل آلة حاسبة</h2>
                <p>“Make a calculator”</p>
              </div>
            </div>
            <div className="task-card-status">
              <span className={`status-pill tone-${metrics.globalStatusTone}`} data-testid="global-runtime-status" role="status">
                <span className="status-dot" />{metrics.globalStatusLabel}
              </span>
              <span className="task-stage">Stage {currentStage + 1} of 5</span>
            </div>
            <div className="task-progress" aria-label={`Stage ${currentStage + 1} of 5`}>
              {STAGE_DEFINITIONS.map((stage, index) => (
                <span key={stage.id} className={index <= currentStage ? 'is-filled' : ''} />
              ))}
            </div>
          </div>
        </section>

        <section id="workspace" className="workspace-section" aria-label={workspaceTabs.find(tab => tab.id === activeTab)?.label}>
          <div className="workspace-section-heading">
            <div>
              <h2>{activeTab === 'flow_studio' ? 'Follow the task' : activeTab === 'architecture' ? 'How the system works' : 'Why the result can be trusted'}</h2>
              <p>{activeTab === 'flow_studio' ? 'Move through the steps in order. Each one shows what the system does and what you can decide.' : activeTab === 'architecture' ? 'Explore the modules and connections behind the task.' : 'See each requirement, the decision made, and its evidence.'}</p>
            </div>
          </div>

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
          {activeTab === 'traceability' && (
            <TraceabilityMatrixView
              repaired={repaired}
              onToggleRepairState={setRepaired}
              onJumpToModule={(componentId) => {
                setSelectedComponentId(componentId);
                switchWorkspaceTab('architecture');
              }}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div><span className="footer-mark"><Box size={14} /> ShiftCore</span><span>Cognitive AI Runtime</span></div>
        <span><Check size={14} /> Every decision has a trace. Every result has proof.</span>
      </footer>
    </div>
  );
}
