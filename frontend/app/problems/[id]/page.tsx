"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CodeEditor from "@/components/editor/CodeEditor";
import { fetchProblem, submitCode, ProblemDetail, SubmissionResult } from "@/lib/api";
import { Group, Panel, Separator } from "react-resizable-panels";
import { getLogger } from "@/lib/logger";

const logger = getLogger("ProblemSolve");

const DIFF_COLORS: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
};

export default function ProblemSolvePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.id as string;

    const [problem, setProblem] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [language, setLanguage] = useState<"python">("python");
    const [code, setCode] = useState("");
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [activeTab, setActiveTab] = useState<"console" | "tests" | "feedback">("console");

    useEffect(() => {
        const load = async () => {
            try {
                logger.info("Loading problem", { slug });
                const data = await fetchProblem(slug);
                setProblem(data);
                logger.info("Problem loaded", { title: data.title, difficulty: data.difficulty });
                if (data.starter_code?.python) {
                    setCode(data.starter_code.python);
                }
            } catch (err: any) {
                logger.error("Failed to load problem", { slug, error: err.message });
                setError(err.message || "Failed to load problem");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    const handleSubmit = async () => {
        if (!problem) return;
        setSubmitting(true);
        setError(null);
        try {
            logger.info("Submitting code", { problemId: problem.id, language });
            const res = await submitCode(problem.id, code, language);
            logger.info("Submission result", { status: res.status, passed: res.passed_tests, total: res.total_tests });
            setResult(res);
            setActiveTab("tests");
        } catch (err: any) {
            logger.error("Submission failed", { error: err.message });
            setError(err.message || "Submission failed");
            setActiveTab("console");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        if (problem?.starter_code?.[language]) setCode(problem.starter_code[language]);
        setResult(null);
        setError(null);
        setActiveTab("console");
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="h-screen bg-white dark:bg-neutral-950 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm font-mono transition-colors">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mb-4"></div>
                        <p className="animate-pulse">Loading problem details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error && !problem) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center transition-colors">
                    <div className="text-center max-w-md px-6">
                        <p className="text-6xl font-mono font-bold text-neutral-200 dark:text-neutral-800 mb-6">404</p>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Problem not found</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">{error}</p>
                        <button 
                            onClick={() => router.push("/problems")} 
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            Back to Problems
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!problem) return null;

    return (
        <ProtectedRoute>
            <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col overflow-hidden text-neutral-700 dark:text-neutral-300">

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Panel — Problem Description */}
                    <div className="w-full lg:w-1/2 overflow-y-auto bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
                        <div className="p-6 md:p-8">
                            {/* Back Button */}
                            <button
                                onClick={() => router.push("/problems")}
                                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6 text-sm group"
                            >
                                <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span> Back to Problems
                            </button>

                            {/* Title & Badges */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">{problem.title}</h1>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className={`capitalize font-bold px-2.5 py-1 rounded-md border ${DIFF_COLORS[problem.difficulty?.toLowerCase()]?.replace('text-', 'bg-').replace('-500', '-500/10 border-').replace('border-', 'border-') || "text-neutral-400 border-neutral-800"}`}>
                                        <span className={DIFF_COLORS[problem.difficulty?.toLowerCase()]}>{problem.difficulty}</span>
                                    </span>
                                    <span className="text-neutral-300 dark:text-neutral-700 font-light">|</span>
                                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-md font-medium border border-neutral-200 dark:border-neutral-700">{problem.topic}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-10">
                                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-4">Description</h2>
                                <p className="text-base text-neutral-700 dark:text-neutral-400 leading-relaxed whitespace-pre-line font-sans">{problem.description}</p>
                            </div>

                            {/* Examples */}
                            {problem.examples && problem.examples.length > 0 && (
                                <div className="mb-10">
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-4">Examples</h2>
                                    {problem.examples.map((example, index) => (
                                        <div key={index} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-4 bg-neutral-50 dark:bg-neutral-900/50 font-mono text-sm shadow-sm transition-all hover:bg-white dark:hover:bg-neutral-900">
                                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-3 font-sans uppercase tracking-[0.2em] font-bold">Example {index + 1}</p>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-neutral-500 dark:text-neutral-600 text-[10px] uppercase tracking-widest font-bold">Input</span>
                                                    <div className="bg-white dark:bg-neutral-950 px-3 py-2 rounded-md border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">{example.input}</div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-neutral-500 dark:text-neutral-600 text-[10px] uppercase tracking-widest font-bold">Output</span>
                                                    <div className="bg-white dark:bg-neutral-950 px-3 py-2 rounded-md border border-neutral-100 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">{example.output}</div>
                                                </div>
                                                {example.explanation && (
                                                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-3">
                                                        <span className="text-neutral-500 dark:text-neutral-600 text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Explanation</span>
                                                        <p className="text-neutral-600 dark:text-neutral-400 font-sans text-sm leading-relaxed">{example.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Constraints */}
                            {problem.constraints && problem.constraints.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-4">Constraints</h2>
                                    <ul className="space-y-2.5">
                                        {problem.constraints.map((constraint, index) => (
                                            <li key={index} className="flex items-center gap-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-900 px-4 py-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                <span className="text-neutral-400 dark:text-neutral-600 select-none">•</span>
                                                <span>{constraint}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel — Code Editor & Output */}
                    <div className="w-full lg:w-1/2 flex flex-col bg-neutral-950">
                        {/* Editor Toolbar */}
                        <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 shadow-sm">Python</span>
                                <button
                                    onClick={handleReset}
                                    className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-sans transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold px-6 py-2 rounded-md shadow-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                            >
                                {submitting ? "Submitting..." : "Submit Code"}
                            </button>
                        </div>

                        <Group orientation="vertical" className="flex-1">
                            <Panel defaultSize={60} minSize={20}>
                                {/* Editor Area */}
                                <div className="h-full overflow-hidden relative">
                                    <CodeEditor
                                        language={language}
                                        value={code}
                                        onChange={(val) => setCode(val || "")}
                                    />
                                </div>
                            </Panel>

                            <Separator className="h-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 transition-colors cursor-row-resize z-10" />

                            <Panel defaultSize={40} minSize={10}>
                                {/* Output Panel (Bottom split) */}
                                <div className="bg-white dark:bg-neutral-950 flex flex-col h-full border-t border-neutral-200 dark:border-neutral-800">
                            {/* Tabs */}
                            <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                {(["console", "tests", "feedback"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === tab
                                            ? "text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white bg-white dark:bg-neutral-950/50"
                                            : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                                            }`}
                                    >
                                        {tab === "tests" ? "Test Cases" : tab === "feedback" ? "AI Feedback" : "Console"}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm scrollbar-thin scrollbar-thumb-neutral-800">
                                {/* Console */}
                                {activeTab === "console" && (
                                    <div className="text-neutral-400">
                                        {error ? (
                                            <p className="text-red-400 whitespace-pre-line">{error}</p>
                                        ) : result && result.error_message ? (
                                            <div>
                                                <p className="text-red-400 mb-2">Runtime Error:</p>
                                                <p className="text-red-500 whitespace-pre-line bg-red-950/30 p-3 rounded">{result.error_message}</p>
                                            </div>
                                        ) : result ? (
                                            <p className="text-green-500">Execution successful! Check 'Test Cases' tab for test results.</p>
                                        ) : (
                                            <>
                                                <p className="mb-1">Console ready.</p>
                                                <p>{">"} Submit your code to see results.</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Test Results */}
                                {activeTab === "tests" && result && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                                            <span className={`font-bold text-xs uppercase tracking-widest ${result.status === "passed" || result.status === "accepted" ? "text-green-500" : "text-red-500"}`}>
                                                {result.status.replace("_", " ")}
                                            </span>
                                            <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                                                Tests: <span className="text-neutral-900 dark:text-white ml-1 font-bold">{result.passed_tests}/{result.total_tests}</span>
                                            </span>
                                        </div>
                                        {result.test_results?.map((test, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg border text-xs ${test.passed ? "bg-green-950/20 border-green-900/50" : "bg-red-950/20 border-red-900/50"}`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-neutral-600 dark:text-neutral-300 font-medium">Test {test.test_number || idx + 1}</span>
                                                    <span className={`font-bold uppercase ${test.passed ? "text-green-500" : "text-red-500"}`}>{test.passed ? "PASS" : "FAIL"}</span>
                                                </div>
                                                {!test.passed && (
                                                    <div className="space-y-1.5 text-neutral-600 dark:text-neutral-400 mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-red-900/50">
                                                        <p>Input: <span className="text-neutral-900 dark:text-neutral-200 font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{test.input}</span></p>
                                                        <p>Expected: <span className="text-green-600 dark:text-green-400 font-mono">{test.expected}</span></p>
                                                        <p>Got: <span className="text-red-600 dark:text-red-400 font-mono">{test.actual ?? "(no output)"}</span></p>
                                                        {test.error && <p className="text-red-500 mt-2 bg-red-950/50 p-2 rounded">{test.error}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* AI Feedback */}
                                {activeTab === "feedback" && result && (
                                    <div className="text-sm space-y-4">
                                        {result.feedback ? (
                                            <>
                                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 shadow-sm">
                                                    <p className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 mb-2.5 font-bold tracking-[0.2em]">AI Analysis</p>
                                                    <p className="text-sm font-sans leading-relaxed">{result.feedback.feedback_text}</p>
                                                </div>
                                                
                                                {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                                                    <div className="border border-yellow-900/50 rounded-lg p-4 bg-yellow-950/10">
                                                        <p className="text-xs font-mono uppercase text-yellow-500 mb-2 font-semibold tracking-wide">Suggestions ✨</p>
                                                        <ul className="space-y-2">
                                                            {result.feedback.suggestions.map((suggestion, idx) => (
                                                                <li key={idx} className="flex gap-2 text-sm text-neutral-300 font-sans">
                                                                    <span className="text-yellow-600 mt-0.5">•</span>
                                                                    <span>{suggestion}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-neutral-500 font-sans">No feedback generated for this submission.</p>
                                        )}
                                    </div>
                                )}

                                {/* Empty states */}
                                {activeTab === "tests" && !result && (
                                    <p className="text-neutral-500">{">"} Submit your code to see test results.</p>
                                )}
                                {activeTab === "feedback" && !result && (
                                    <p className="text-neutral-500">{">"} Submit your code to receive AI feedback.</p>
                                )}
                            </div>
                                </div>
                            </Panel>
                        </Group>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
