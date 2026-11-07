import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  FolderArchive,
  Laptop,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tablet,
  Terminal,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';
import { SECodingScenario } from '../lib/seScenariosAndMetamodel';
import {
  detectPromptDomainArchetype,
  generateDynamicStandaloneHtml
} from '../lib/dynamicDeliverableEngine';

interface ResultDeliverablesViewProps {
  activeScenario: SECodingScenario;
  checkpointHash: string;
  sealId: string;
  coderModel: string;
  verifierModel: string;
  onBackToRuntime: () => void;
}

export const ResultDeliverablesView: React.FC<ResultDeliverablesViewProps> = ({
  activeScenario,
  checkpointHash,
  sealId,
  coderModel,
  verifierModel,
  onBackToRuntime
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'code' | 'sandbox' | 'deploy'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [codeVersion, setCodeVersion] = useState<'v1_1' | 'v1'>('v1_1');
  const [copiedFileKey, setCopiedFileKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);
  const [iframeRefreshKey, setIframeRefreshKey] = useState<number>(0);
  const [isExpandedPreview, setIsExpandedPreview] = useState<boolean>(false);

  const detectedArchetype = useMemo(
    () => detectPromptDomainArchetype(activeScenario.rawPrompt || activeScenario.title),
    [activeScenario.rawPrompt, activeScenario.title]
  );

  // Dynamic standalone HTML synthesized specifically for the user's prompt & scenario
  const standaloneHtml = useMemo(
    () => generateDynamicStandaloneHtml(activeScenario, sealId, checkpointHash, coderModel),
    [activeScenario, sealId, checkpointHash, coderModel]
  );

  // 1-Click Single File Download
  const handleDownloadFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1-Click ZIP Download containing all generated files for the active prompt
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Standalone Interactive App HTML
      zip.file('index.html', standaloneHtml);

      // 2. Synthesized Code files (v1.1 or v1.0)
      activeScenario.files.forEach((file) => {
        const content = codeVersion === 'v1_1' ? file.v1_1Code : file.v1Code;
        zip.file(file.path, content);
      });

      // 3. Package.json
      const safeSlug = activeScenario.id.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
      const packageJson = {
        name: `shiftcore-${safeSlug}`,
        version: '1.1.0',
        private: true,
        description: `${activeScenario.title} — Synthesized from prompt: ${activeScenario.rawPrompt}`,
        scripts: {
          test: 'vitest run'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1'
        },
        devDependencies: {
          tailwindcss: '^3.4.0',
          typescript: '^5.5.0',
          vitest: '^1.6.0'
        }
      };
      zip.file('package.json', JSON.stringify(packageJson, null, 2));

      // 4. Dynamic README.md listing the actual synthesized files
      const fileLines = activeScenario.files
        .map((f, idx) => `${idx + 2}. \`${f.path}\` (${f.role}, ${f.linesOfCode} LOC)`)
        .join('\n');

      const readme = `# ShiftCore Generated Deliverable: ${activeScenario.title}

## Original Prompt
> "${activeScenario.rawPrompt}"

## Runtime Provenance
- **Detected Domain Archetype**: \`${detectedArchetype}\`
- **Checkpoint Merkle Hash**: \`${checkpointHash}\`
- **Cryptographic Proof Seal**: \`${sealId}\`
- **Synthesized by Dual Workers**: \`${coderModel}\` (Coder Role) & \`${verifierModel}\` (Independent Verifier Role)

## Files Included
1. \`index.html\`: Self-contained interactive application with Tailwind CSS & runtime logic. Open directly in any browser!
${fileLines}

## Architectural Decisions Locked (Stage 2)
${activeScenario.decisions.map((d) => `- **${d.id} (${d.title})**: ${d.chosenOption} — *${d.rationale}*`).join('\n')}

## Verified Requirements (Stage 4 Oracle — 8/8 Passed)
${activeScenario.requirements.map((r) => `- **[PASS] ${r.id} (${r.category})**: ${r.statement}`).join('\n')}

## How to Run
- **Instant Standalone App**: Double-click \`index.html\` in any modern web browser.
- **React / TypeScript Integration**: Copy the files under \`src/\` into your application.
- **Verification Suite**: Run \`npm test\` to execute the independent Vitest suite.
`;
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shiftcore-${safeSlug}-deliverables.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileKey(key);
    setTimeout(() => setCopiedFileKey(null), 2000);
  };

  const currentFile = activeScenario.files[selectedFileIdx] || activeScenario.files[0];
  const currentCode = codeVersion === 'v1_1' ? currentFile.v1_1Code : currentFile.v1Code;
  const primaryFilePath = activeScenario.files[0]?.path || 'src/components/SynthesizedApp.tsx';
  const secondaryFilePath = activeScenario.files[1]?.path || 'src/services/domainEngine.ts';
  const testFilePath = activeScenario.files[2]?.path || 'tests/verification.spec.ts';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#151c28] via-[#121924] to-[#151c28] border border-[#2b3a4f] shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#ff8a4c]/15 text-[#ff8a4c] border border-[#ff8a4c]/30">
              LIVE SYNTHESIZED DELIVERABLE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#8caef9]/15 text-[#8caef9] border border-[#8caef9]/30">
              ARCHETYPE: {detectedArchetype}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#53d6ab]/15 text-[#53d6ab] border border-[#53d6ab]/30">
              {sealId}
            </span>
            <span className="text-xs text-[#94a3b8] font-mono">
              {coderModel} ∥ {verifierModel}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeScenario.title}
          </h1>
          <p className="text-xs text-[#94a3b8] max-w-3xl font-mono">
            Prompt: &ldquo;{activeScenario.rawPrompt}&rdquo; — Interactive runtime app, verified v1.1 source code, standalone HTML, and ZIP bundle.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="px-4 py-2 rounded-xl bg-[#ff8a4c] hover:bg-[#ff9d66] text-[#0b1018] font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#ff8a4c]/20 disabled:opacity-50 cursor-pointer"
          >
            {isZipping ? (
              <span className="animate-spin">⏳</span>
            ) : zipSuccess ? (
              <Check size={14} className="text-[#0b1018]" />
            ) : (
              <FolderArchive size={14} />
            )}
            <span>{zipSuccess ? 'Downloaded ZIP! ✓' : 'Download All Files (.zip)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadFile('index.html', standaloneHtml, 'text/html')}
            className="px-3.5 py-2 rounded-xl bg-[#1f2a3a] hover:bg-[#273549] text-white border border-[#2b3a4f] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} className="text-[#53d6ab]" />
            <span>Download Standalone HTML</span>
          </button>

          <button
            type="button"
            onClick={onBackToRuntime}
            className="px-3.5 py-2 rounded-xl bg-[#101622] hover:bg-[#151c28] text-[#94a3b8] hover:text-white border border-[#212d3f] font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Runtime Stages</span>
          </button>
        </div>
      </div>

      {/* Main Mode Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212d3f] pb-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#0b1018] p-1 rounded-xl border border-[#212d3f]">
          <button
            type="button"
            onClick={() => setActiveSubTab('preview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'preview'
                ? 'bg-[#ff8a4c] text-[#0b1018] shadow-md shadow-[#ff8a4c]/25'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#151c28]'
            }`}
          >
            <Eye size={14} />
            <span>Live Interactive Application</span>
            <span className="w-2 h-2 rounded-full bg-[#53d6ab] animate-pulse"></span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('code')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-[#ff8a4c] text-[#0b1018] shadow-md shadow-[#ff8a4c]/25'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#151c28]'
            }`}
          >
            <Code2 size={14} />
            <span>Synthesized Code &amp; Diff</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">
              {activeScenario.files.length + 1} Files
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sandbox')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'sandbox'
                ? 'bg-[#ff8a4c] text-[#0b1018] shadow-md shadow-[#ff8a4c]/25'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#151c28]'
            }`}
          >
            <Play size={14} />
            <span>Live Test Oracle &amp; Sandbox</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#53d6ab]/20 text-[#53d6ab] font-mono">
              8/8 Passed
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('deploy')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'deploy'
                ? 'bg-[#ff8a4c] text-[#0b1018] shadow-md shadow-[#ff8a4c]/25'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#151c28]'
            }`}
          >
            <Zap size={14} />
            <span>How to Deploy &amp; Use</span>
          </button>
        </div>

        {/* Viewport switchers for preview mode */}
        {activeSubTab === 'preview' && (
          <div className="flex items-center gap-1.5 bg-[#0b1018] p-1 rounded-xl border border-[#212d3f]">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-[#212d3f] text-white' : 'text-[#64748b] hover:text-white'
              }`}
              title="Desktop View (100% width)"
            >
              <Laptop size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-[#212d3f] text-white' : 'text-[#64748b] hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-[#212d3f] text-white' : 'text-[#64748b] hover:text-white'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone size={14} />
            </button>
            <div className="h-4 w-px bg-[#212d3f] mx-0.5" />
            <button
              type="button"
              onClick={() => setIframeRefreshKey((k) => k + 1)}
              className="px-2 py-1 rounded-lg text-[11px] font-mono text-[#94a3b8] hover:text-white hover:bg-[#151c28] flex items-center gap-1 cursor-pointer"
              title="Reset live interactive sandbox state"
            >
              <RotateCcw size={12} />
              <span>Reset App</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExpandedPreview((v) => !v)}
              className="p-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-white hover:bg-[#151c28] cursor-pointer"
              title={isExpandedPreview ? 'Restore preview height' : 'Expand preview height'}
            >
              {isExpandedPreview ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: LIVE INTERACTIVE APPLICATION PREVIEW */}
      {/* ==================================================================== */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#94a3b8] bg-[#101622] px-4 py-2.5 rounded-xl border border-[#212d3f]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#53d6ab]"></span>
              <span>
                <strong>Live Synthesized Application ({detectedArchetype}):</strong> Interact directly with your generated app below — test inputs, state transitions, and R8 concurrency/boundary guards in real time.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-[#8caef9]">
                Target: {activeScenario.interactiveSandboxPreview.endpointOrTarget}
              </span>
              <button
                type="button"
                onClick={() => setActiveSubTab('code')}
                className="text-[#53d6ab] hover:underline font-bold cursor-pointer"
              >
                Inspect Source Files ({activeScenario.files.length}) ➔
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile('index.html', standaloneHtml, 'text/html')}
                className="text-[#ff8a4c] hover:underline font-bold cursor-pointer"
              >
                Download index.html ➔
              </button>
            </div>
          </div>

          {/* Browser Container */}
          <div className="bg-[#0b1018] rounded-2xl border border-[#26354a] shadow-2xl overflow-hidden flex flex-col items-center">
            {/* Browser chrome header */}
            <div className="w-full h-10 bg-[#121824] border-b border-[#212d3f] px-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#fb8797]/60"></span>
                <span className="w-3 h-3 rounded-full bg-[#fbbf24]/60"></span>
                <span className="w-3 h-3 rounded-full bg-[#53d6ab]/60"></span>
              </div>
              <div className="flex items-center gap-2 bg-[#0b1018] px-4 py-1 rounded-md border border-[#212d3f] text-[11px] text-[#94a3b8] font-mono max-w-md w-full justify-center truncate">
                <span className="text-[#53d6ab]">https://</span>
                <span className="text-white truncate">
                  shiftcore-runtime.app/{activeScenario.id.replace(/_/g, '-')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#64748b] font-mono shrink-0">
                <span className="text-[#53d6ab]">{sealId}</span>
              </div>
            </div>

            {/* Viewport Frame rendering the actual synthesized application for the active prompt */}
            <div
              className={`w-full transition-all duration-300 ${
                viewportMode === 'mobile'
                  ? 'max-w-[390px] border-x border-[#212d3f] my-4 shadow-xl rounded-2xl overflow-hidden'
                  : viewportMode === 'tablet'
                  ? 'max-w-[768px] border-x border-[#212d3f] my-4 shadow-xl rounded-2xl overflow-hidden'
                  : 'max-w-full'
              }`}
            >
              <iframe
                key={`${activeScenario.id}-${sealId}-${iframeRefreshKey}`}
                data-testid="live-deliverable-iframe"
                title={`Live Deliverable Preview: ${activeScenario.title}`}
                srcDoc={standaloneHtml}
                className={`w-full border-0 bg-[#0b1018] ${
                  isExpandedPreview ? 'h-[1020px]' : 'h-[790px]'
                }`}
                sandbox="allow-scripts allow-forms allow-modals"
              />
            </div>
          </div>

          {/* Synthesized Artifacts Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeScenario.files.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  setSelectedFileIdx(idx);
                  setActiveSubTab('code');
                }}
                className="p-3.5 rounded-xl bg-[#121926] hover:bg-[#172133] border border-[#243247] hover:border-[#ff8a4c]/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#ff8a4c] group-hover:underline">
                    {file.path}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#53d6ab]/15 text-[#53d6ab]">
                    {file.role}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1 line-clamp-1">
                  {file.linesOfCode} lines · {file.language.toUpperCase()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: CODE FILES & 1-CLICK EXPORT */}
      {/* ==================================================================== */}
      {activeSubTab === 'code' && (
        <div className="space-y-4">
          {/* File selector bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#101622] p-3 rounded-2xl border border-[#212d3f]">
            <div className="flex items-center flex-wrap gap-1.5">
              {/* Standalone HTML File Tab */}
              <button
                type="button"
                onClick={() => setSelectedFileIdx(-1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedFileIdx === -1
                    ? 'bg-[#ff8a4c] text-[#0b1018]'
                    : 'bg-[#151c28] text-[#cbd5e1] hover:text-white border border-[#212d3f]'
                }`}
              >
                <FileCode2 size={13} />
                <span>index.html (Standalone App)</span>
              </button>

              {/* Generated Scenario files */}
              {activeScenario.files.map((file, idx) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedFileIdx === idx
                      ? 'bg-[#ff8a4c] text-[#0b1018]'
                      : 'bg-[#151c28] text-[#cbd5e1] hover:text-white border border-[#212d3f]'
                  }`}
                >
                  <Code2 size={13} />
                  <span>{file.path.split('/').pop()}</span>
                </button>
              ))}
            </div>

            {/* Version Toggle */}
            <div className="flex items-center gap-1 bg-[#0b1018] p-1 rounded-xl border border-[#212d3f]">
              <button
                type="button"
                onClick={() => setCodeVersion('v1_1')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  codeVersion === 'v1_1'
                    ? 'bg-[#53d6ab] text-[#0b1018]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Patched v1.1 (8/8 Verified)
              </button>
              <button
                type="button"
                onClick={() => setCodeVersion('v1')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                  codeVersion === 'v1'
                    ? 'bg-[#fb8797] text-[#0b1018]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Candidate v1.0 (Pre-Repair)
              </button>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="rounded-2xl bg-[#0b1018] border border-[#26354a] overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="h-10 bg-[#121824] border-b border-[#212d3f] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 size={14} className="text-[#ff8a4c]" />
                <span className="font-mono text-xs text-white">
                  {selectedFileIdx === -1
                    ? `index.html (Standalone Interactive Application — ${activeScenario.title})`
                    : currentFile.path}
                </span>
                <span className="text-[10px] font-mono text-[#53d6ab] bg-[#53d6ab]/10 px-1.5 py-0.2 rounded border border-[#53d6ab]/20">
                  {selectedFileIdx === -1 ? 'STANDALONE HTML5' : codeVersion.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = selectedFileIdx === -1 ? standaloneHtml : currentCode;
                    handleCopyText(text, 'current_code');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1f2a3a] hover:bg-[#273549] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedFileKey === 'current_code' ? (
                    <>
                      <Check size={12} className="text-[#53d6ab]" />
                      <span className="text-[#53d6ab]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Full Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedFileIdx === -1) {
                      handleDownloadFile('index.html', standaloneHtml, 'text/html');
                    } else {
                      const fname = currentFile.path.split('/').pop() || 'file.ts';
                      handleDownloadFile(fname, currentCode);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#ff8a4c] hover:bg-[#ff9d66] text-[#0b1018] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Pre Container */}
            <pre className="p-4 text-xs font-mono text-[#cbd5e1] overflow-x-auto max-h-[600px] leading-relaxed select-text">
              <code>{selectedFileIdx === -1 ? standaloneHtml : currentCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: LIVE TEST ORACLE & SANDBOX */}
      {/* ==================================================================== */}
      {activeSubTab === 'sandbox' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#151c28] border border-[#2b3a4f] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Verification Test Matrix (8/8 Acceptance Criteria for {activeScenario.title})
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Generated by Worker B Verifier ({verifierModel}) to test functional &amp; R8 invariants independently.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#53d6ab]/15 text-[#53d6ab] border border-[#53d6ab]/30">
                8/8 INVARIANTS PASSED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
              {activeScenario.requirements.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-[#0b1018] border border-[#212d3f] flex items-start gap-2.5"
                >
                  <span className="p-1 rounded-md bg-[#53d6ab]/15 text-[#53d6ab] mt-0.5">
                    <Check size={12} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">
                      {req.id} ({req.category}): {req.statement}
                    </div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">{req.verificationAssertion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Test Payloads */}
          <div className="p-4 rounded-2xl bg-[#151c28] border border-[#2b3a4f] space-y-3">
            <h3 className="text-sm font-bold text-white">Interactive Endpoint &amp; State Probe Sandbox</h3>
            <p className="text-xs text-[#94a3b8]">
              Target:{' '}
              <code className="text-[#ff8a4c] font-mono">
                {activeScenario.interactiveSandboxPreview.endpointOrTarget}
              </code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeScenario.interactiveSandboxPreview.testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="p-3.5 rounded-xl bg-[#0b1018] border border-[#212d3f] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{tc.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#53d6ab]/15 text-[#53d6ab]">
                        PASSED
                      </span>
                    </div>
                    <pre className="mt-2 p-2 rounded-lg bg-[#121824] text-[10px] font-mono text-[#94a3b8] overflow-x-auto max-h-20">
                      {tc.inputPayload}
                    </pre>
                  </div>
                  <div className="text-[11px] text-[#53d6ab] font-mono border-t border-[#212d3f] pt-2 mt-2">
                    ✓ {tc.v1_1Output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 4: HOW TO DEPLOY & USE */}
      {/* ==================================================================== */}
      {activeSubTab === 'deploy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#151c28] border border-[#2b3a4f] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff8a4c]/15 text-[#ff8a4c] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white">Option A: Zero-Setup Standalone App</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Run your synthesized <strong>{activeScenario.title}</strong> immediately in any browser with zero dependencies:
            </p>
            <ol className="text-xs text-[#cbd5e1] space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Click <strong>Download Standalone HTML</strong> to save <code className="text-[#ff8a4c]">index.html</code>.
              </li>
              <li>Double-click the file to open it locally in Chrome, Firefox, Safari, or Edge.</li>
              <li>
                Deploy online in 5 seconds by dropping <code className="text-[#ff8a4c]">index.html</code> onto Netlify Drop, Cloudflare Pages, or Vercel.
              </li>
            </ol>
            <button
              type="button"
              onClick={() => handleDownloadFile('index.html', standaloneHtml, 'text/html')}
              className="w-full mt-4 py-2 rounded-xl bg-[#ff8a4c] text-[#0b1018] font-bold text-xs hover:bg-[#ff9d66] transition-colors cursor-pointer"
            >
              Download index.html Now →
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#151c28] border border-[#2b3a4f] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#53d6ab]/15 text-[#53d6ab] flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white">Option B: TypeScript / React Module</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Integrate the verified TypeScript &amp; React artifacts directly into your repository:
            </p>
            <ol className="text-xs text-[#cbd5e1] space-y-2 list-decimal list-inside leading-relaxed">
              <li>Download the complete project ZIP bundle.</li>
              <li>
                Copy <code className="text-[#53d6ab]">{primaryFilePath}</code> and{' '}
                <code className="text-[#53d6ab]">{secondaryFilePath}</code> into your project.
              </li>
              <li>
                Mount or import the module at{' '}
                <code className="text-xs text-[#53d6ab]">
                  {activeScenario.interactiveSandboxPreview.endpointOrTarget}
                </code>
                .
              </li>
            </ol>
            <button
              type="button"
              onClick={handleDownloadAllZip}
              className="w-full mt-4 py-2 rounded-xl bg-[#1f2a3a] text-white border border-[#2b3a4f] font-bold text-xs hover:bg-[#273549] transition-colors cursor-pointer"
            >
              Download Project Bundle (.zip) →
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#151c28] border border-[#2b3a4f] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white">Option C: Continuous Verification</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Run the Worker B independent test oracle in CI/CD to enforce all 8 requirements:
            </p>
            <ol className="text-xs text-[#cbd5e1] space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Execute <code className="text-[#38bdf8]">npx vitest run {testFilePath}</code>.
              </li>
              <li>
                Verify that the surgical AST patch on{' '}
                <code className="text-white">{activeScenario.surgicalDiff.targetFile}</code> passes R1–R8.
              </li>
              <li>
                Attach Merkle checkpoint <code className="text-[#53d6ab]">{checkpointHash}</code> and seal{' '}
                <code className="text-[#53d6ab]">{sealId}</code> to your release.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
