import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, CheckCheck,
  ChevronDown, CircleHelp, Database, FileCheck2, Fingerprint,
  GitBranch, Layers3, Maximize2, MousePointer2, Network, Pause,
  Play, RotateCcw, ScanSearch, ShieldCheck, Terminal, Workflow
} from 'lucide-react';
import {
  DATA_DEPENDENCY_EDGES, POLICY_GOVERNANCE_DISPOSITIONS, STAGE_DEFINITIONS,
  SYSTEM_COMPONENTS, getComponentDependencies,
  type DataDependencyEdge, type DependencyCategory, type StageIndex
} from '../lib/runtimeEngine';

interface RuntimeArchitectureDiagramProps {
  currentStage: StageIndex;
  repaired: boolean;
  clarifiedPlatform: 'web' | 'desktop' | null;
  selectedComponentId: string;
  onSelectComponent: (id: string) => void;
  dependencyFilter: DependencyCategory | 'all';
  onChangeDependencyFilter: (filter: DependencyCategory | 'all') => void;
}

const NODE_LAYOUT = [
  { id: 'comp_intake', x: 3, y: 82, icon: Terminal, title: 'Task intake', detail: 'Prompt & workspace', tone: 'blue' },
  { id: 'comp_policy', x: 3, y: 255, icon: ShieldCheck, title: 'Policy engine', detail: 'Security & quality rules', tone: 'purple' },
  { id: 'comp_experience', x: 3, y: 428, icon: Database, title: 'Experience store', detail: 'Verified patterns · pgvector', tone: 'teal' },
  { id: 'comp_analyzer', x: 28, y: 168, icon: ScanSearch, title: 'Requirement analyzer', detail: 'Clarification → task spec', tone: 'orange' },
  { id: 'comp_planner', x: 53, y: 168, icon: GitBranch, title: 'Planner & router', detail: 'Stack decisions & plan', tone: 'blue' },
  { id: 'comp_orchestrator', x: 53, y: 428, icon: Workflow, title: 'Execution orchestrator', detail: 'Stateful execution & repair', tone: 'orange' },
  { id: 'comp_evidence', x: 28, y: 428, icon: Fingerprint, title: 'Evidence ledger', detail: '13 provenance records', tone: 'teal' },
  { id: 'comp_verifier', x: 78, y: 298, icon: FileCheck2, title: 'Independent verifier', detail: 'Checks & completion gate', tone: 'teal' }
] as const;

const CONTRACT_TYPES = [
  { id: 'data_payload', label: 'Data payload', color: '#8caef9' },
  { id: 'control_flow', label: 'Control flow', color: '#ffad75' },
  { id: 'policy_constraint', label: 'Policy rule', color: '#baa3f2' },
  { id: 'audit_provenance', label: 'Provenance', color: '#53d6ab' },
  { id: 'feedback_repair', label: 'Repair loop', color: '#fb8797' }
] as const;

// Coordinates share the same percentage-based columns as the HTML nodes.
// Return routes run through dedicated space between and beneath the nodes.
const CONTRACT_ROUTES: Record<string, string> = {
  edge_prompt_intake: 'M264 142 C302 142 298 212 336 212',
  edge_policy_analyzer: 'M264 315 C300 315 300 260 336 260',
  edge_exp_analyzer: 'M264 488 H294 Q306 488 306 476 V338 Q306 326 318 326 H438 Q450 326 450 314 V288',
  edge_intake_analyzer: 'M336 228 C296 228 304 126 264 126',
  edge_clarify_loop: 'M264 158 C290 158 310 244 336 244',
  edge_analyzer_planner: 'M564 228 H636',
  edge_policy_planner: 'M264 292 H276 Q288 292 288 280 V118 Q288 106 300 106 H738 Q750 106 750 118 V168',
  edge_planner_orchestrator: 'M750 288 V428',
  edge_orch_evidence: 'M636 488 H564',
  edge_orch_verifier: 'M864 488 C906 488 894 358 936 358',
  edge_evidence_verifier: 'M564 472 H588 Q600 472 600 460 V386 Q600 374 612 374 H888 Q900 374 900 362 V354 Q900 342 912 342 H936',
  edge_repair_loop: 'M1050 418 V578 Q1050 590 1038 590 H762 Q750 590 750 578 V548',
  edge_verifier_gate: 'M936 390 H924 Q912 390 912 402 Q912 414 900 414 H594 Q582 414 582 426 V492 Q582 504 570 504 H564',
  edge_gate_experience: 'M1090 418 V610 Q1090 622 1078 622 H162 Q150 622 150 610 V548'
};

export function RuntimeArchitectureDiagram({
  currentStage, repaired, clarifiedPlatform, selectedComponentId,
  onSelectComponent, dependencyFilter, onChangeDependencyFilter
}: RuntimeArchitectureDiagramProps) {
  const markerPrefix = useId().replace(/:/g, '');
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const stage = STAGE_DEFINITIONS[currentStage];
  const { component, incoming, outgoing } = getComponentDependencies(selectedComponentId);
  const selectedEdge = DATA_DEPENDENCY_EDGES.find(edge => edge.id === selectedEdgeId);
  const focusedNode = hoveredNode ?? selectedComponentId;
  const visibleEdges = DATA_DEPENDENCY_EDGES.filter(edge => dependencyFilter === 'all' || edge.category === dependencyFilter);
  const filteredNodeIds = new Set(visibleEdges.flatMap(edge => [edge.from, edge.to]));
  const activeNode = NODE_LAYOUT.find(node => node.id === component.id)!;
  const ActiveIcon = activeNode.icon;

  useEffect(() => {
    const map = mapScrollRef.current;
    const node = map?.querySelector<HTMLElement>(`[data-module-id="${component.id}"]`);
    if (!map || !node || map.scrollWidth <= map.clientWidth) return;

    const nodeLeft = node.offsetLeft;
    if (nodeLeft < map.scrollLeft || nodeLeft + node.offsetWidth > map.scrollLeft + map.clientWidth) {
      map.scrollTo({
        left: nodeLeft - (map.clientWidth - node.offsetWidth) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }
  }, [component.id]);

  function selectNode(id: string) {
    onSelectComponent(id);
    setSelectedEdgeId(null);
  }

  function selectContract(edge: DataDependencyEdge) {
    onSelectComponent(edge.from);
    setSelectedEdgeId(edge.id);
  }

  function nodeStatus(id: string) {
    if (id === 'comp_analyzer' && currentStage === 0) return clarifiedPlatform === 'web' ? 'Web confirmed' : 'Needs input';
    if (id === 'comp_verifier' && currentStage >= 3) return repaired ? 'Verified · 8/8' : 'Blocked · 7/8';
    return stage.primaryComponents.includes(id) ? 'Active this stage' : 'Standby';
  }

  const renderContract = (edge: DataDependencyEdge, direction: 'in' | 'out') => {
    const other = SYSTEM_COMPONENTS.find(node => node.id === (direction === 'in' ? edge.from : edge.to))!;
    const type = CONTRACT_TYPES.find(type => type.id === edge.category)!;
    return (
      <button key={edge.id} type="button" className={`contract-flow-item ${selectedEdgeId === edge.id ? 'is-selected' : ''}`} onClick={() => setSelectedEdgeId(edge.id)} style={{ '--contract-color': type.color } as CSSProperties}>
        <span className="contract-flow-code"><span className="contract-dot" />{other.code}<ArrowUpRight size={13} /></span>
        <strong>{edge.payloadName}</strong>
        <span className="contract-flow-module">{other.name}</span>
      </button>
    );
  };

  return (
    <div className="architecture-studio">
      <section className="architecture-map-panel" aria-labelledby="architecture-map-title">
        <div className="architecture-map-heading">
          <div>
            <span className="architecture-eyebrow"><Network size={14} /> SYSTEM TOPOLOGY</span>
            <h2 id="architecture-map-title">One runtime. Every connection visible.</h2>
            <p>From the first prompt to a verified result. Select a module or connection to follow the data.</p>
          </div>
          <div className="architecture-map-actions">
            <span className="diagram-stage"><span className="status-dot" />Stage {currentStage + 1} · {stage.shortTitle}</span>
            <button type="button" className="diagram-motion-toggle" aria-pressed={motionEnabled} onClick={() => setMotionEnabled(!motionEnabled)}>
              {motionEnabled ? <Pause size={14} /> : <Play size={14} />}
              {motionEnabled ? 'Pause motion' : 'Play motion'}
            </button>
          </div>
        </div>

        <div className="architecture-map-toolbar">
          <div className="diagram-filter-list" role="group" aria-label="Filter architecture connections">
            <button type="button" aria-pressed={dependencyFilter === 'all'} className={dependencyFilter === 'all' ? 'is-active' : ''} onClick={() => onChangeDependencyFilter('all')}><Layers3 size={13} />All connections <span>14</span></button>
            {CONTRACT_TYPES.map(type => (
              <button key={type.id} type="button" aria-pressed={dependencyFilter === type.id} className={dependencyFilter === type.id ? 'is-active' : ''} onClick={() => onChangeDependencyFilter(type.id)} style={{ '--contract-color': type.color } as CSSProperties}><span className="contract-dot" />{type.label}</button>
            ))}
          </div>
          <span className="diagram-connection-count" role="status">{visibleEdges.length} / 14 contracts</span>
        </div>

        <div className="diagram-mobile-selector">
          <label htmlFor={`${markerPrefix}-module`}>Inspect a module</label>
          <select id={`${markerPrefix}-module`} value={component.id} onChange={event => selectNode(event.target.value)}>
            {NODE_LAYOUT.map(node => <option key={node.id} value={node.id}>{SYSTEM_COMPONENTS.find(item => item.id === node.id)!.code} · {node.title}</option>)}
          </select>
        </div>

        <div ref={mapScrollRef} className="architecture-map-scroll" tabIndex={0} role="region" aria-label="Interactive architecture map. Scroll horizontally on smaller screens.">
          <div className={`architecture-map ${motionEnabled ? '' : 'is-still'}`}>
            <div className="diagram-lanes" aria-hidden="true">
              {['01 / CONTEXT & GUARDRAILS', '02 / UNDERSTAND & RECORD', '03 / PLAN & EXECUTE', '04 / VERIFY & COMPLETE'].map(label => <span key={label}>{label}</span>)}
            </div>
            <svg className="diagram-connections" viewBox="0 0 1200 672" preserveAspectRatio="none" aria-label="14 directed data contracts">
              <defs>
                {CONTRACT_TYPES.map(type => <marker key={type.id} id={`${markerPrefix}-${type.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={type.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></marker>)}
              </defs>
              {DATA_DEPENDENCY_EDGES.map((edge, index) => {
                const type = CONTRACT_TYPES.find(type => type.id === edge.category)!;
                const isVisible = dependencyFilter === 'all' || edge.category === dependencyFilter;
                const isFocused = edge.from === focusedNode || edge.to === focusedNode;
                const isSelected = edge.id === selectedEdgeId;
                return (
                  <g key={edge.id} className={`diagram-edge ${isVisible ? '' : 'is-filtered'} ${isFocused ? 'is-connected' : ''} ${isSelected ? 'is-selected' : ''} ${edge.isRepairLoop ? 'is-repair' : ''}`} style={{ '--contract-color': type.color, '--flow-delay': `${index * -0.47}s` } as CSSProperties} data-edge-id={edge.id} data-category={edge.category}>
                    <path className="diagram-edge-line" d={CONTRACT_ROUTES[edge.id]} markerEnd={`url(#${markerPrefix}-${edge.category})`} vectorEffect="non-scaling-stroke" />
                    <path className="diagram-edge-flow" d={CONTRACT_ROUTES[edge.id]} vectorEffect="non-scaling-stroke" />
                    {isVisible && <path className="diagram-edge-hit" d={CONTRACT_ROUTES[edge.id]} role="button" tabIndex={0} aria-label={`Inspect ${edge.payloadName}`} aria-pressed={isSelected} onClick={() => selectContract(edge)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectContract(edge); } }}><title>{edge.payloadName}</title></path>}
                  </g>
                );
              })}
            </svg>

            {NODE_LAYOUT.map((node, index) => {
              const module = SYSTEM_COMPONENTS.find(item => item.id === node.id)!;
              const Icon = node.icon;
              const active = stage.primaryComponents.includes(node.id);
              const selected = component.id === node.id;
              const status = nodeStatus(node.id);
              const blocked = node.id === 'comp_verifier' && currentStage >= 3 && !repaired;
              return (
                <button key={node.id} type="button" data-module-id={node.id} className={`architecture-diagram-node tone-${node.tone} ${selected ? 'is-selected' : ''} ${active ? 'is-active-stage' : ''} ${dependencyFilter !== 'all' && !filteredNodeIds.has(node.id) ? 'is-muted' : ''} ${blocked ? 'is-blocked' : ''}`} style={{ left: `${node.x}%`, top: node.y, '--node-delay': `${index * 45}ms` } as CSSProperties} aria-label={`${module.code}: ${module.name}`} aria-pressed={selected} onClick={() => selectNode(node.id)} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} onFocus={() => setHoveredNode(node.id)} onBlur={() => setHoveredNode(null)}>
                  <span className="diagram-node-port port-left" /><span className="diagram-node-port port-right" /><span className="diagram-node-port port-top" /><span className="diagram-node-port port-bottom" />
                  <span className="diagram-node-top"><span className="diagram-node-icon"><Icon size={18} strokeWidth={1.6} /></span><span className="diagram-node-code">{module.code}</span>{selected && <MousePointer2 size={13} className="diagram-node-selected-icon" />}</span>
                  <strong>{node.title}</strong>
                  <span className="diagram-node-detail">{node.detail}</span>
                  <span className="diagram-node-status"><span className="status-dot" />{status}</span>
                </button>
              );
            })}
            <span className="diagram-route-note plan-note"><Braces size={12} />Execution plan</span>
            <span className="diagram-route-note repair-note"><RotateCcw size={12} />Targeted repair · preserve state</span>
            <span className="diagram-route-note memory-note"><CheckCheck size={13} />Verified experience → controlled reuse</span>
          </div>
        </div>
        <div className="diagram-map-footer"><span><MousePointer2 size={13} />Select a node to trace its connections</span><span className="diagram-scroll-hint"><Maximize2 size={13} />Scroll to explore the full map</span><span className="diagram-map-key"><span className="status-dot" />Highlighted modules are active in the current stage</span></div>
      </section>

      <section ref={inspectorRef} className="architecture-inspector" aria-labelledby="module-inspector-title">
        <div className="architecture-inspector-heading">
          <div><span className="architecture-eyebrow">MODULE INSPECTOR <span>/ {component.code}</span></span><h3 id="module-inspector-title">{component.name}</h3><p>{component.architecturalRole}</p></div>
          <span className="inspector-module-tech"><Terminal size={14} />{component.techStack}</span>
        </div>
        <div className="module-contract-diagram">
          <div className="module-contract-column"><h4><ArrowDown size={14} />Incoming contracts <span>{incoming.length}</span></h4>{incoming.map(edge => renderContract(edge, 'in'))}</div>
          <div className={`inspector-center-node tone-${activeNode.tone}`}><span className="inspector-center-icon"><ActiveIcon size={25} strokeWidth={1.5} /></span><span className="diagram-node-code">{component.code}</span><strong>{activeNode.title}</strong><span>{nodeStatus(component.id)}</span><div><Database size={13} />{component.dbTables.join(' · ')}</div></div>
          <div className="module-contract-column"><h4><ArrowRight size={14} />Outgoing contracts <span>{outgoing.length}</span></h4>{outgoing.map(edge => renderContract(edge, 'out'))}</div>
        </div>
        {selectedEdge && <div className="selected-contract-detail" role="status" key={selectedEdge.id}><div><span className="architecture-eyebrow">SELECTED DATA CONTRACT</span><h4>{selectedEdge.payloadName}</h4><p>{selectedEdge.description}</p></div><code>{selectedEdge.schemaSummary}</code></div>}
      </section>

      <section className="architecture-governance" aria-labelledby="governance-title">
        <div className="governance-source"><span className="architecture-eyebrow"><ShieldCheck size={15} /> GOVERNANCE LAYER</span><h3 id="governance-title">Every action passes through policy.</h3><p>Four possible outcomes. One consistent set of guardrails.</p></div>
        <div className="governance-branches">
          {POLICY_GOVERNANCE_DISPOSITIONS.map(item => {
            const Icon = item.disposition === 'ALLOWED' ? Check : item.disposition === 'MODIFIED' ? GitBranch : item.disposition === 'HELD_FOR_HUMAN' ? CircleHelp : ShieldCheck;
            return <button key={item.disposition} type="button" className={`governance-outcome governance-${item.badgeColor}`} onClick={() => { selectNode(item.moduleId); inspectorRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }}><span><Icon size={16} />{item.disposition.replaceAll('_', ' ')}</span><strong>{item.calculatorTarget}</strong><p>{item.runtimeAction}</p><span className="governance-outcome-link">Inspect policy source<ArrowUpRight size={13} /></span></button>;
          })}
        </div>
      </section>

      <details className="architecture-contract-reference">
        <summary><span><Braces size={17} />Data contract reference <span>{visibleEdges.length} contracts</span></span><ChevronDown size={17} /></summary>
        <div className="architecture-contract-table-scroll" tabIndex={0} role="region" aria-label="Data contract reference table">
          <table><thead><tr><th>Producer</th><th>Consumer</th><th>Contract / payload</th><th>Schema</th><th>Active stages</th></tr></thead><tbody>{visibleEdges.map(edge => <tr key={edge.id}><td>{SYSTEM_COMPONENTS.find(item => item.id === edge.from)!.code}</td><td>{SYSTEM_COMPONENTS.find(item => item.id === edge.to)!.code}</td><td><button type="button" onClick={() => selectContract(edge)}>{edge.payloadName}<ArrowUpRight size={12} /></button></td><td><code>{edge.schemaSummary}</code></td><td>{edge.activeInStages.map(index => index + 1).join(', ')}</td></tr>)}</tbody></table>
        </div>
      </details>
    </div>
  );
}
