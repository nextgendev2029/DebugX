"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CodeEditor from "@/components/editor/CodeEditor";
import { visualizeCode, TraceResult, TraceStep } from "@/lib/api";
import { getLogger } from "@/lib/logger";

const logger = getLogger("Visualizer");

const SAMPLE_CODE = "";

const SPEED_OPTIONS = [
    { label: "0.5×", ms: 2000 },
    { label: "1×", ms: 1000 },
    { label: "2×", ms: 500 },
    { label: "4×", ms: 250 },
];

export default function VisualizerPage() {
    const [code, setCode] = useState(SAMPLE_CODE);
    const [stdin, setStdin] = useState("");
    const [trace, setTrace] = useState<TraceResult | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(1); // default 1× speed
    const [error, setError] = useState<string | null>(null);
    const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Current step data
    const step: TraceStep | null = trace?.steps[currentStep] ?? null;
    const totalSteps = trace?.total_steps ?? 0;

    // ── Pre-fill from Session Storage ─────────────────────────────────────────

    useEffect(() => {
        const storedCode = sessionStorage.getItem("visualizer_code");
        const storedStdin = sessionStorage.getItem("visualizer_stdin");

        if (storedCode !== null && storedCode !== undefined) {
            setCode(storedCode);
            sessionStorage.removeItem("visualizer_code");
        }
        if (storedStdin !== null && storedStdin !== undefined) {
            setStdin(storedStdin);
            sessionStorage.removeItem("visualizer_stdin");
        }
    }, []);

    // ── Playback Controls ─────────────────────────────────────────────────────

    const stopPlayback = useCallback(() => {
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const startPlayback = useCallback(() => {
        if (!trace || trace.steps.length === 0) return;
        setIsPlaying(true);

        playIntervalRef.current = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= trace.steps.length - 1) {
                    stopPlayback();
                    return prev;
                }
                return prev + 1;
            });
        }, SPEED_OPTIONS[speedIdx].ms);
    }, [trace, speedIdx, stopPlayback]);

    // Cleanup on unmount
    useEffect(() => () => stopPlayback(), [stopPlayback]);

    // Restart playback at new speed when speed changes during play
    useEffect(() => {
        if (isPlaying) {
            stopPlayback();
            startPlayback();
        }
    }, [speedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Visualize Handler ─────────────────────────────────────────────────────

    const handleVisualize = async () => {
        if (!code.trim()) return;
        setIsLoading(true);
        setError(null);
        setTrace(null);
        setCurrentStep(0);
        stopPlayback();

        try {
            logger.info("Visualizing code", { length: code.length });
            const result = await visualizeCode(code, stdin);
            setTrace(result);

            if (result.error) {
                setError(result.error);
                logger.warn("Visualization returned error", { error: result.error });
            } else {
                logger.info("Visualization complete", { steps: result.total_steps, truncated: result.truncated });
            }
        } catch (err: any) {
            logger.error("Visualization failed", err);
            setError(err.message || "Failed to visualize code");
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step Controls ─────────────────────────────────────────────────────────

    const stepForward = () => {
        if (trace && currentStep < trace.steps.length - 1) {
            setCurrentStep((p) => p + 1);
        }
    };

    const stepBack = () => {
        if (currentStep > 0) {
            setCurrentStep((p) => p - 1);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            // If at the end, restart from beginning
            if (trace && currentStep >= trace.steps.length - 1) {
                setCurrentStep(0);
            }
            startPlayback();
        }
    };

    const resetVisualization = () => {
        stopPlayback();
        setCurrentStep(0);
    };

    // ── Render Helpers ────────────────────────────────────────────────────────

    const formatValue = (val: unknown): string => {
        if (val === null || val === undefined) return "None";
        if (typeof val === "string") return `"${val}"`;
        if (typeof val === "boolean") return val ? "True" : "False";
        if (Array.isArray(val)) return `[${val.map(formatValue).join(", ")}]`;
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    const getTypeLabel = (val: unknown): string => {
        if (val === null || val === undefined) return "None";
        if (typeof val === "string") return "str";
        if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
        if (typeof val === "boolean") return "bool";
        if (Array.isArray(val)) return "list";
        if (typeof val === "object") return "dict";
        return typeof val;
    };

    const getTypeColor = (val: unknown): string => {
        if (typeof val === "string") return "text-green-600 dark:text-green-400";
        if (typeof val === "number") return "text-blue-600 dark:text-blue-400";
        if (typeof val === "boolean") return "text-purple-600 dark:text-purple-400";
        if (Array.isArray(val)) return "text-yellow-600 dark:text-yellow-400";
        if (typeof val === "object" && val !== null) return "text-orange-600 dark:text-orange-400";
        return "text-neutral-500";
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Code Visualizer</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Step through your Python code line-by-line and watch variables change in real time.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ── Left: Code Editor ──────────────────────────────────── */}
                        <div className="flex flex-col">
                            {/* Editor toolbar */}
                            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-xl px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">Python</span>
                                    <span className="w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
                                    <button
                                        onClick={() => { setCode(SAMPLE_CODE); setStdin(""); setTrace(null); setCurrentStep(0); stopPlayback(); setError(null); }}
                                        className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors font-bold"
                                    >
                                        Reset
                                    </button>
                                </div>
                                <button
                                    onClick={handleVisualize}
                                    disabled={isLoading || !code.trim()}
                                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold px-5 py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                                >
                                    {isLoading ? "Tracing..." : "Visualize"}
                                </button>
                            </div>

                            {/* Editor */}
                            <div className="h-[500px] border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-xl overflow-hidden relative">
                                <CodeEditor
                                    language="python"
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                />
                                {/* Line highlight overlay — rendered via decorations in a real impl, but for now we indicate via the step panel */}
                            </div>

                            {/* Standard Input */}
                            <div className="mt-4 flex flex-col">
                                <label className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2">
                                    Standard Input (Test Cases)
                                </label>
                                <textarea
                                    value={stdin}
                                    onChange={(e) => setStdin(e.target.value)}
                                    placeholder="Enter inputs here (one per line)..."
                                    className="w-full h-24 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all resize-none"
                                />
                            </div>

                            {/* Current line indicator */}
                            {step && (
                                <div className="mt-3 flex items-center gap-2 px-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                                        Executing <span className="text-neutral-900 dark:text-white font-bold">line {step.line}</span>
                                        {trace?.code_lines[step.line - 1] && (
                                            <span className="text-neutral-400 dark:text-neutral-500 ml-2">
                                                → <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-300">{trace.code_lines[step.line - 1].trim()}</code>
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Execution Visualization ─────────────────────── */}
                        <div className="flex flex-col gap-4">
                            {/* Controls Bar */}
                            {trace && trace.steps.length > 0 && (
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-900">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {/* Step Back */}
                                            <button onClick={stepBack} disabled={currentStep === 0}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>

                                            {/* Play / Pause */}
                                            <button onClick={togglePlay}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-all active:scale-95">
                                                {isPlaying ? (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                )}
                                            </button>

                                            {/* Step Forward */}
                                            <button onClick={stepForward} disabled={currentStep >= trace.steps.length - 1}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>

                                            {/* Reset */}
                                            <button onClick={resetVisualization}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.2-5.2M20 15a9 9 0 01-15.2 5.2" /></svg>
                                            </button>
                                        </div>

                                        {/* Speed selector */}
                                        <div className="flex items-center gap-1">
                                            {SPEED_OPTIONS.map((opt, i) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => setSpeedIdx(i)}
                                                    className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-md transition-all ${
                                                        speedIdx === i
                                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                            : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 whitespace-nowrap font-bold">
                                            Step {currentStep + 1} / {totalSteps}
                                        </span>
                                        <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-200"
                                                style={{ width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Step slider */}
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(0, totalSteps - 1)}
                                        value={currentStep}
                                        onChange={(e) => { stopPlayback(); setCurrentStep(Number(e.target.value)); }}
                                        className="w-full mt-2 accent-neutral-900 dark:accent-white cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Variable Inspector */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden flex-1">
                                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                                    <h2 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">Variables</h2>
                                </div>
                                <div className="p-4 max-h-[280px] overflow-y-auto">
                                    {!trace ? (
                                        <p className="text-sm text-neutral-400 dark:text-neutral-500 font-mono text-center py-8">Click "Visualize" to start tracing your code.</p>
                                    ) : trace.steps.length === 0 ? (
                                        <p className="text-sm text-neutral-400 dark:text-neutral-500 font-mono text-center py-8">No execution steps recorded.</p>
                                    ) : step && Object.keys(step.variables).length > 0 ? (
                                        <div className="space-y-2">
                                            {Object.entries(step.variables).map(([name, val]) => (
                                                <div key={name} className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{name}</span>
                                                        <span className={`text-[9px] font-mono uppercase tracking-widest ${getTypeColor(val)}`}>{getTypeLabel(val)}</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300 text-right break-all">{formatValue(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-neutral-400 dark:text-neutral-500 font-mono text-center py-4">No variables at this step.</p>
                                    )}
                                </div>
                            </div>

                            {/* Output Panel */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden">
                                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                                    <h2 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold">Output</h2>
                                </div>
                                <div className="p-4 min-h-[80px] max-h-[160px] overflow-y-auto">
                                    <pre className="text-sm font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {step?.output || (trace?.final_output ? trace.final_output : (trace ? "(no output yet)" : ""))}
                                    </pre>
                                </div>
                            </div>

                            {/* Error Banner */}
                            {error && (
                                <div className="border border-red-200 dark:border-red-900 rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold mb-1.5">Error</p>
                                    <p className="text-sm font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap">{error}</p>
                                </div>
                            )}

                            {/* Truncation Warning */}
                            {trace?.truncated && (
                                <div className="border border-yellow-200 dark:border-yellow-900 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-4">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                                        ⚠️ Execution was truncated at 500 steps. Your code may have a long loop or infinite loop.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
