import React, { useEffect, useState, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Columns2,
  Cpu,
  ListFilter,
  Loader2,
  Radio,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap
} from 'lucide-react';
import {
  WorkerTokenStreamEvent,
  WorkerPoolId,
  subscribeToWorkerTokenStream,
  getWorkerTokenStreamSnapshot,
  clearWorkerTokenStream
} from '../lib/localLlmBridge';

interface LiveRoleLogsConsoleProps {
  coderModel: string;
  verifierModel: string;
  isStageExecuting: boolean;
  executingStageLabel: string;
  isRuntimeIdle: boolean;
}

type ConsoleViewMode = 'split_dual' | 'all_streams' | 'coder_only' | 'verifier_only';

export const LiveRoleLogsConsole: React.FC<LiveRoleLogsConsoleProps> = ({
  coderModel,
  verifierModel,
  isStageExecuting,
  executingStageLabel,
  isRuntimeIdle
}) => {
  const [streamsMap, setStreamsMap] = useState<Record<string, WorkerTokenStreamEvent>>(() => {
    const initial: Record<string, WorkerTokenStreamEvent> = {};
    for (const ev of getWorkerTokenStreamSnapshot()) {
      initial[ev.streamId] = ev;
    }
    return initial;
  });

  const [viewMode, setViewMode] = useState<ConsoleViewMode>('split_dual');
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [liveDeltaCount, setLiveDeltaCount] = useState<number>(0);

  const coderScrollRef = useRef<HTMLDivElement | null>(null);
  const verifierScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Sync snapshot on mount
    const snapshot = getWorkerTokenStreamSnapshot();
    if (snapshot.length > 0) {
      const next: Record<string, WorkerTokenStreamEvent> = {};
      for (const item of snapshot) {
        next[item.streamId] = item;
      }
      setStreamsMap(next);
    }

    // Subscribe to real-time token delta events from Coder & Verifier workers
    const unsubscribe = subscribeToWorkerTokenStream((event) => {
      setStreamsMap((prev) => ({
        ...prev,
        [event.streamId]: event
      }));
      if (event.eventType === 'TOKEN_DELTA') {
        setLiveDeltaCount((c) => c + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Clear local console map when runtime resets to S0 Idle
  useEffect(() => {
    if (isRuntimeIdle && getWorkerTokenStreamSnapshot().length === 0) {
      setStreamsMap({});
      setLiveDeltaCount(0);
    }
  }, [isRuntimeIdle]);

  const allStreams = (Object.values(streamsMap) as WorkerTokenStreamEvent[]).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );

  const coderStreams = allStreams.filter((s) => s.workerPool === 'CODER_WORKER_A');
  const verifierStreams = allStreams.filter((s) => s.workerPool === 'VERIFIER_WORKER_B');

  const activeStreamingCount = allStreams.filter(
    (s) => s.eventType !== 'STREAM_COMPLETE' && s.eventType !== 'STREAM_ERROR'
  ).length;
  const totalTokensEmitted = allStreams.reduce((acc, s) => acc + s.tokensEmitted, 0);

  // Auto-scroll active panes when new tokens arrive
  useEffect(() => {
    if (coderScrollRef.current) {
      coderScrollRef.current.scrollTop = coderScrollRef.current.scrollHeight;
    }
    if (verifierScrollRef.current) {
      verifierScrollRef.current.scrollTop = verifierScrollRef.current.scrollHeight;
    }
  }, [streamsMap, liveDeltaCount]);

  const togglePromptExpand = (streamId: string) => {
    setExpandedPrompts((prev) => ({ ...prev, [streamId]: !prev[streamId] }));
  };

  const handleClearConsole = () => {
    clearWorkerTokenStream();
    setStreamsMap({});
    setLiveDeltaCount(0);
  };

  const renderStreamEntry = (stream: WorkerTokenStreamEvent) => {
    const isError = stream.eventType === 'STREAM_ERROR';
    const isStreaming = stream.eventType !== 'STREAM_COMPLETE' && !isError;
    const isCoder = stream.workerPool === 'CODER_WORKER_A';
    const isPromptExpanded = Boolean(expandedPrompts[stream.streamId]);

    return (
      <div
        key={stream.streamId}
        data-testid={`role-stream-card-${stream.streamId}`}
        className={`rounded-xl border transition-all overflow-hidden ${
          isError
            ? 'border-[#fb8797]/70 bg-[#1a0d12]'
            : isStreaming
              ? isCoder
                ? 'border-[#53d6ab] bg-[#0d1922] shadow-[0_0_20px_rgba(83,214,171,0.12)]'
                : 'border-[#8caef9] bg-[#101829] shadow-[0_0_20px_rgba(140,174,249,0.12)]'
              : 'border-[#223046] bg-[#0b1018]'
        }`}
      >
        {/* Stream Entry Header */}
        <div className="px-3.5 py-2.5 bg-[#101724] border-b border-[#1d2a3f] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                isCoder
                  ? 'bg-[#12312a] text-[#53d6ab] border border-[#245c4d]'
                  : 'bg-[#172542] text-[#8caef9] border border-[#2d487d]'
              }`}
            >
              {isCoder ? <Code2 size={11} /> : <ShieldCheck size={11} />}
              {stream.workerId}
            </span>
            <span className="font-mono text-xs font-bold text-white">{stream.stageLabel}</span>
            <span className="px-2 py-0.5 rounded bg-[#162030] text-[#ffa875] font-mono text-[11px] border border-[#2a3b55]">
              {stream.modelName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            {isError ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2d1219] text-[#fb8797] border border-[#6e2435] font-bold">
                DAEMON OFFLINE · 0 TOKENS
              </span>
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2d1e12] text-[#ff8a4c] border border-[#6b4226] font-bold animate-pulse">
                <Radio size={11} className="animate-spin" />
                STREAMING TOKENS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#112a22] text-[#53d6ab] border border-[#215442] font-bold">
                <CheckCircle2 size={11} />
                STREAM COMPLETE
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-[#141d2b] text-[#c8d3e2] border border-[#24344d]">
              {stream.tokensEmitted} tok
            </span>
            <span className="px-2 py-0.5 rounded bg-[#141d2b] text-[#53d6ab] border border-[#24344d]">
              {stream.tokensPerSec} tok/s
            </span>
            <span className="text-[#8899b0]">{stream.elapsedMs}ms</span>
          </div>
        </div>

        {/* Collapsible System Prompt Sent to Worker */}
        <div className="px-3.5 py-1.5 bg-[#0d131f] border-b border-[#192334] flex items-center justify-between">
          <button
            type="button"
            onClick={() => togglePromptExpand(stream.streamId)}
            className="text-[11px] font-mono text-[#8caef9] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {isPromptExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>
              {isPromptExpanded ? 'Hide' : 'Inspect'} Dispatched System Prompt ({stream.connectionSource})
            </span>
          </button>
          <span className="font-mono text-[10px] text-[#6d7f99]">
            {stream.timestamp ? stream.timestamp.slice(11, 23) : ''} UTC
          </span>
        </div>

        {isPromptExpanded && (
          <div className="px-3.5 py-2 bg-[#080c13] border-b border-[#192334] font-mono text-[11px] text-[#9fb0c7] whitespace-pre-wrap">
            {stream.systemPromptSent}
          </div>
        )}

        {/* Real-Time Raw Token Stream Output */}
        <div className="p-3.5 bg-[#070a10]">
          <pre
            data-testid={`raw-token-output-${stream.streamId}`}
            className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words max-h-60 overflow-y-auto ${
              isError ? 'text-[#fb8797]' : 'text-[#53d6ab]'
            }`}
          >
            {stream.accumulatedText || '// Connecting to local model token stream...'}
            {isStreaming && (
              <span
                className="inline-block ml-1 text-[#ff8a4c] font-extrabold animate-pulse"
                aria-label="Streaming token cursor"
              >
                ▋
              </span>
            )}
          </pre>

          {stream.producedSummary && (
            <div className="mt-2.5 pt-2 border-t border-[#182232] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-[#d4deec]">
                <strong className={isError ? 'text-[#fb8797]' : 'text-[#ffa875]'}>
                  {isError ? 'Execution Blocked:' : 'Reduced Stage Output:'}
                </strong>{' '}
                {stream.producedSummary}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkerPoolColumn = (
    poolId: WorkerPoolId,
    title: string,
    modelName: string,
    streams: WorkerTokenStreamEvent[],
    scrollRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const isCoder = poolId === 'CODER_WORKER_A';
    const isPoolStreaming = streams.some((s) => s.eventType !== 'STREAM_COMPLETE');
    const poolTokens = streams.reduce((acc, s) => acc + s.tokensEmitted, 0);

    return (
      <div
        data-testid={`live-console-pool-${poolId}`}
        className="rounded-xl border border-[#233147] bg-[#0a0f17] flex flex-col overflow-hidden"
      >
        <div
          className={`px-3.5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
            isCoder
              ? 'bg-[#0f2222] border-[#1f473e]'
              : 'bg-[#121d33] border-[#263d6b]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPoolStreaming
                  ? 'bg-[#ff8a4c] animate-ping'
                  : streams.length > 0
                    ? 'bg-[#53d6ab]'
                    : 'bg-[#5d6e87]'
              }`}
            />
            <span className="font-mono text-xs font-extrabold text-white uppercase tracking-wider">
              {title}
            </span>
            <code
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                isCoder
                  ? 'bg-[#0b1919] text-[#53d6ab] border border-[#24594c]'
                  : 'bg-[#0d1526] text-[#8caef9] border border-[#2b477c]'
              }`}
            >
              {modelName}
            </code>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-[#a9b8ce]">{streams.length} role runs</span>
            <span className="px-2 py-0.5 rounded bg-[#0c121c] text-[#53d6ab] border border-[#213047]">
              {poolTokens} tokens
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="p-3 space-y-3 max-h-[420px] overflow-y-auto flex-1"
        >
          {streams.length === 0 ? (
            <div className="py-10 px-4 text-center font-mono text-xs text-[#7c8ea6] border border-dashed border-[#1e2b3e] rounded-xl">
              {isCoder ? (
                <>
                  Waiting for <strong className="text-[#53d6ab]">Coder Worker A ({modelName})</strong>{' '}
                  token stream (Stages 1, 2, 3A, 4B)...
                </>
              ) : (
                <>
                  Waiting for{' '}
                  <strong className="text-[#8caef9]">Verifier Worker B ({modelName})</strong> token
                  stream (Stages 3B, 4A, 5)...
                </>
              )}
            </div>
          ) : (
            streams.map((st) => renderStreamEntry(st))
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      data-testid="live-role-logs-console"
      aria-label="Live Role Logs Token Stream Console"
      className="mb-6 rounded-2xl border border-[#283852] bg-[#0c121c] shadow-2xl overflow-hidden"
    >
      {/* Top Console Control Bar */}
      <div className="px-4 py-3 bg-[#111927] border-b border-[#223147] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#162336] border border-[#2b4060]">
            <Terminal size={15} className="text-[#53d6ab]" />
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-white">
              Live Role Logs · Raw Token Stream Console
            </span>
          </div>

          {isStageExecuting || activeStreamingCount > 0 ? (
            <span
              data-testid="live-console-streaming-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2c1d11] text-[#ff8a4c] border border-[#6b4123] font-mono text-xs font-bold"
            >
              <Loader2 size={13} className="animate-spin" />
              <span>{executingStageLabel || `Streaming ${activeStreamingCount} Active Worker(s)...`}</span>
            </span>
          ) : (
            <span
              data-testid="live-console-status-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11241e] text-[#53d6ab] border border-[#224e3f] font-mono text-xs font-bold"
            >
              <Activity size={13} />
              <span>
                {allStreams.length === 0
                  ? 'Subscribed · Awaiting Stage Execution'
                  : `${allStreams.length} Worker Stream(s) Captured · ${totalTokensEmitted} Tokens`}
              </span>
            </span>
          )}
        </div>

        {/* View Mode Filter Buttons & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            data-testid="console-mode-split"
            onClick={() => setViewMode('split_dual')}
            className={`px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer border transition-all ${
              viewMode === 'split_dual'
                ? 'bg-[#ff8a4c] text-[#0c1018] border-[#ff8a4c]'
                : 'bg-[#0e1520] text-[#b4c2d8] border-[#25354d] hover:border-[#ff8a4c]'
            }`}
          >
            <Columns2 size={13} />
            <span>Dual Split: Coder ∥ Verifier</span>
          </button>

          <button
            type="button"
            data-testid="console-mode-all"
            onClick={() => setViewMode('all_streams')}
            className={`px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer border transition-all ${
              viewMode === 'all_streams'
                ? 'bg-[#ff8a4c] text-[#0c1018] border-[#ff8a4c]'
                : 'bg-[#0e1520] text-[#b4c2d8] border-[#25354d] hover:border-[#ff8a4c]'
            }`}
          >
            <ListFilter size={13} />
            <span>Chronological ({allStreams.length})</span>
          </button>

          <button
            type="button"
            data-testid="console-mode-coder"
            onClick={() => setViewMode('coder_only')}
            className={`px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer border transition-all ${
              viewMode === 'coder_only'
                ? 'bg-[#53d6ab] text-[#0c1018] border-[#53d6ab]'
                : 'bg-[#0e1520] text-[#53d6ab] border-[#21483e] hover:border-[#53d6ab]'
            }`}
          >
            <Cpu size={13} />
            <span>Coder Pool ({coderStreams.length})</span>
          </button>

          <button
            type="button"
            data-testid="console-mode-verifier"
            onClick={() => setViewMode('verifier_only')}
            className={`px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer border transition-all ${
              viewMode === 'verifier_only'
                ? 'bg-[#8caef9] text-[#0c1018] border-[#8caef9]'
                : 'bg-[#0e1520] text-[#8caef9] border-[#273d66] hover:border-[#8caef9]'
            }`}
          >
            <Zap size={13} />
            <span>Verifier Pool ({verifierStreams.length})</span>
          </button>

          {allStreams.length > 0 && (
            <button
              type="button"
              onClick={handleClearConsole}
              title="Clear console token logs"
              className="px-2 py-1 rounded-lg bg-[#161f2e] hover:bg-[#233148] text-[#9fb0c7] border border-[#26364f] inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="px-2 py-1 rounded-lg bg-[#161f2e] hover:bg-[#233148] text-white border border-[#26364f] inline-flex items-center gap-1 cursor-pointer"
          >
            {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
          </button>
        </div>
      </div>

      {/* Console Body */}
      {!isCollapsed && (
        <div className="p-4">
          {viewMode === 'split_dual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderWorkerPoolColumn(
                'CODER_WORKER_A',
                'Worker A · Coder Stream',
                coderModel,
                coderStreams,
                coderScrollRef
              )}
              {renderWorkerPoolColumn(
                'VERIFIER_WORKER_B',
                'Worker B · Verifier Stream',
                verifierModel,
                verifierStreams,
                verifierScrollRef
              )}
            </div>
          )}

          {viewMode === 'all_streams' && (
            <div className="space-y-3 max-h-[460px] overflow-y-auto">
              {allStreams.length === 0 ? (
                <div className="py-10 px-4 text-center font-mono text-xs text-[#8899b0] border border-dashed border-[#223147] rounded-xl">
                  No role token streams recorded yet. Submit a prompt or click{' '}
                  <strong className="text-[#ff8a4c]">Start Step 1 Role (S0→S1)</strong> to watch live
                  tokens stream from <code className="text-[#53d6ab]">{coderModel}</code> and{' '}
                  <code className="text-[#8caef9]">{verifierModel}</code>.
                </div>
              ) : (
                allStreams.map((stream) => renderStreamEntry(stream))
              )}
            </div>
          )}

          {viewMode === 'coder_only' &&
            renderWorkerPoolColumn(
              'CODER_WORKER_A',
              'Worker A · Coder Stream (Stages 1, 2, 3A, 4B)',
              coderModel,
              coderStreams,
              coderScrollRef
            )}

          {viewMode === 'verifier_only' &&
            renderWorkerPoolColumn(
              'VERIFIER_WORKER_B',
              'Worker B · Verifier Stream (Stages 3B, 4A, 5)',
              verifierModel,
              verifierStreams,
              verifierScrollRef
            )}
        </div>
      )}
    </section>
  );
};
