"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { allTracks, Section, MCQ, CodeExample } from "@/data/python-course";
import { useState, useEffect, useCallback } from "react";

// ── Local Storage Helpers ────────────────────────────────────────

function getProgress(trackId: string): Record<string, boolean> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(`learning-progress-${trackId}`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveProgress(trackId: string, data: Record<string, boolean>) {
    if (typeof window !== "undefined") {
        localStorage.setItem(`learning-progress-${trackId}`, JSON.stringify(data));
    }
}

function getMcqState(trackId: string, moduleId: string): Record<string, number> {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(`mcq-state-${trackId}-${moduleId}`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveMcqState(trackId: string, moduleId: string, data: Record<string, number>) {
    if (typeof window !== "undefined") {
        localStorage.setItem(`mcq-state-${trackId}-${moduleId}`, JSON.stringify(data));
    }
}

// ── Code Block Component ─────────────────────────────────────────

function CodeBlock({ example }: { example: CodeExample }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(example.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-4 group/code">
            {example.description && (
                <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{example.description}</p>
                </div>
            )}
            <div className="relative">
                <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all opacity-0 group-hover/code:opacity-100 z-10"
                    title="Copy code"
                >
                    {copied ? (
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
                <pre className="px-4 py-4 overflow-x-auto bg-neutral-950 dark:bg-neutral-900">
                    <code className="text-sm font-mono leading-relaxed text-emerald-400 whitespace-pre">{example.code}</code>
                </pre>
            </div>
            {example.output && (
                <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                            Output
                        </span>
                    </div>
                    <pre className="text-sm font-mono text-neutral-600 dark:text-neutral-300 whitespace-pre">{example.output}</pre>
                </div>
            )}
        </div>
    );
}

// ── MCQ Component ────────────────────────────────────────────────

function MCQCard({
    mcq,
    index,
    selectedAnswer,
    onSelect,
}: {
    mcq: MCQ;
    index: number;
    selectedAnswer: number | undefined;
    onSelect: (optionIndex: number) => void;
}) {
    const hasAnswered = selectedAnswer !== undefined;
    const correctIndex = mcq.options.findIndex((o) => o.isCorrect);

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-4">
            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-indigo/10 text-brand-indigo text-[10px] font-bold font-mono">
                        Q{index + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Quiz
                    </span>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1 whitespace-pre-line">
                    {mcq.question}
                </p>
                {mcq.codeSnippet && (
                    <pre className="my-3 px-3 py-2.5 rounded-lg bg-neutral-950 dark:bg-neutral-900 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                        {mcq.codeSnippet}
                    </pre>
                )}
                <div className="space-y-2 mt-3">
                    {mcq.options.map((option, optIdx) => {
                        let borderColor = "border-neutral-200 dark:border-neutral-800";
                        let bgColor = "bg-white dark:bg-neutral-950";
                        let textColor = "text-neutral-700 dark:text-neutral-300";
                        let indicatorColor = "bg-neutral-200 dark:bg-neutral-700";
                        let indicatorText = "";
                        let cursor = "cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900";

                        if (hasAnswered) {
                            cursor = "cursor-default";
                            if (option.isCorrect) {
                                borderColor = "border-emerald-300 dark:border-emerald-700";
                                bgColor = "bg-emerald-50 dark:bg-emerald-900/20";
                                textColor = "text-emerald-700 dark:text-emerald-300";
                                indicatorColor = "bg-emerald-500";
                                indicatorText = "✓";
                            } else if (selectedAnswer === optIdx && !option.isCorrect) {
                                borderColor = "border-red-300 dark:border-red-700";
                                bgColor = "bg-red-50 dark:bg-red-900/20";
                                textColor = "text-red-700 dark:text-red-300";
                                indicatorColor = "bg-red-500";
                                indicatorText = "✗";
                            }
                        }

                        return (
                            <button
                                key={optIdx}
                                onClick={() => !hasAnswered && onSelect(optIdx)}
                                disabled={hasAnswered}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${bgColor} ${cursor} transition-all duration-200 text-left`}
                            >
                                <span className={`flex-shrink-0 w-6 h-6 rounded-md ${indicatorColor} flex items-center justify-center text-xs font-bold text-white`}>
                                    {hasAnswered ? indicatorText : String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className={`text-sm ${textColor}`}>{option.text}</span>
                            </button>
                        );
                    })}
                </div>
                {hasAnswered && (
                    <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedAnswer === correctIndex
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}>
                        {selectedAnswer === correctIndex
                            ? "Correct! Great job!"
                            : `Incorrect. The correct answer is: ${mcq.options[correctIndex].text}`}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Section Content Component ────────────────────────────────────

function SectionContent({
    section,
    mcqState,
    onMcqAnswer,
}: {
    section: Section;
    mcqState: Record<string, number>;
    onMcqAnswer: (mcqKey: string, optionIndex: number) => void;
}) {
    return (
        <div className="animate-fadeIn">
            {/* Content paragraphs */}
            <div className="space-y-3 mb-5">
                {section.content.map((para, i) => (
                    <p key={i} className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {para}
                    </p>
                ))}
            </div>

            {/* Key Points */}
            {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 p-4 mb-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Key Points
                    </h4>
                    <ul className="space-y-1.5">
                        {section.keyPoints.map((kp, i) => (
                            <li key={i} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5 flex-shrink-0 w-1 h-1 rounded-full bg-blue-400" />
                                {kp}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Important Notes */}
            {section.importantNotes && section.importantNotes.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 mb-5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Important
                    </h4>
                    <ul className="space-y-1.5">
                        {section.importantNotes.map((note, i) => (
                            <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5 flex-shrink-0 w-1 h-1 rounded-full bg-amber-400" />
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Table */}
            {section.table && (
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-900/50">
                                {section.table.headers.map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {section.table.rows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300 font-mono text-xs">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Code Examples */}
            {section.codeExamples.map((ex, i) => (
                <CodeBlock key={i} example={ex} />
            ))}

            {/* MCQs */}
            {section.mcqs.length > 0 && (
                <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Test Your Knowledge
                    </h4>
                    {section.mcqs.map((mcq, mi) => (
                        <MCQCard
                            key={mi}
                            mcq={mcq}
                            index={mi}
                            selectedAnswer={mcqState[`${section.id}-${mi}`]}
                            onSelect={(optIdx) => onMcqAnswer(`${section.id}-${mi}`, optIdx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Module Page ─────────────────────────────────────────────

export default function ModulePage() {
    const params = useParams();
    const trackId = params.id as string;
    const moduleId = params.moduleId as string;

    const track = allTracks.find((t) => t.id === trackId);
    const mod = track?.modules.find((m) => m.id === moduleId);

    const [activeSectionIdx, setActiveSectionIdx] = useState(0);
    const [progress, setProgress] = useState<Record<string, boolean>>({});
    const [mcqState, setMcqState] = useState<Record<string, number>>({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (trackId) {
            setProgress(getProgress(trackId));
        }
        if (trackId && moduleId) {
            setMcqState(getMcqState(trackId, moduleId));
        }
    }, [trackId, moduleId]);

    const markSectionComplete = useCallback(
        (sectionId: string) => {
            const key = `${moduleId}-${sectionId}`;
            setProgress((prev) => {
                const next = { ...prev, [key]: true };
                saveProgress(trackId, next);
                return next;
            });
        },
        [trackId, moduleId]
    );

    const handleMcqAnswer = useCallback(
        (mcqKey: string, optionIndex: number) => {
            setMcqState((prev) => {
                const next = { ...prev, [mcqKey]: optionIndex };
                saveMcqState(trackId, moduleId, next);
                return next;
            });
        },
        [trackId, moduleId]
    );

    if (!track || !mod) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Module not found</h1>
                    <Link href="/learning" className="text-sm text-brand-indigo hover:underline">
                        ← Back to tracks
                    </Link>
                </div>
            </div>
        );
    }

    const activeSection = mod.sections[activeSectionIdx];
    const isSectionComplete = (sectionId: string) => progress[`${moduleId}-${sectionId}`];
    const completedCount = mod.sections.filter((s) => isSectionComplete(s.id)).length;

    // Find next / prev module
    const currentModuleIdx = track.modules.findIndex((m) => m.id === moduleId);
    const prevModule = currentModuleIdx > 0 ? track.modules[currentModuleIdx - 1] : null;
    const nextModule = currentModuleIdx < track.modules.length - 1 ? track.modules[currentModuleIdx + 1] : null;

    const goToSection = (idx: number) => {
        setActiveSectionIdx(idx);
        setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNext = () => {
        // Mark current section complete
        markSectionComplete(activeSection.id);

        if (activeSectionIdx < mod.sections.length - 1) {
            goToSection(activeSectionIdx + 1);
        }
    };

    const handlePrev = () => {
        if (activeSectionIdx > 0) {
            goToSection(activeSectionIdx - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Top Bar */}
            <div className="sticky top-14 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Mobile sidebar toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Breadcrumb */}
                            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate">
                                <Link href={`/learning/${trackId}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                                    {track.title}
                                </Link>
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-neutral-900 dark:text-white truncate">
                                    Module {mod.number}
                                </span>
                            </nav>
                            <span className="sm:hidden text-xs font-mono text-neutral-900 dark:text-white truncate">
                                {mod.title}
                            </span>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="hidden sm:flex items-center gap-1">
                                {mod.sections.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => goToSection(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            i === activeSectionIdx
                                                ? "w-5 bg-brand-indigo"
                                                : isSectionComplete(s.id)
                                                ? "bg-emerald-500"
                                                : "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                                        }`}
                                        title={s.title}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 ml-1">
                                {completedCount}/{mod.sections.length}
                            </span>
                        </div>
                    </div>

                    {/* Mobile progress bar */}
                    <div className="mt-2 h-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden sm:hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 bg-brand-indigo"
                            style={{ width: `${((activeSectionIdx + 1) / mod.sections.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute top-28 left-0 right-0 max-h-[60vh] overflow-y-auto bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-xl p-4">
                        <SidebarContent
                            mod={mod}
                            activeSectionIdx={activeSectionIdx}
                            isSectionComplete={isSectionComplete}
                            onSelect={goToSection}
                        />
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-36">
                            <SidebarContent
                                mod={mod}
                                activeSectionIdx={activeSectionIdx}
                                isSectionComplete={isSectionComplete}
                                onSelect={goToSection}
                            />
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-w-0 max-w-3xl">
                        {/* Section Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono font-medium text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded-md">
                                    {activeSection.id}
                                </span>
                                {isSectionComplete(activeSection.id) && (
                                    <span className="text-xs font-mono font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Complete
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                {activeSection.title}
                            </h2>
                        </div>

                        {/* Section Body */}
                        <SectionContent
                            section={activeSection}
                            mcqState={mcqState}
                            onMcqAnswer={handleMcqAnswer}
                        />

                        {/* Navigation */}
                        <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={handlePrev}
                                    disabled={activeSectionIdx === 0}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                {activeSectionIdx < mod.sections.length - 1 ? (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-sm font-semibold text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
                                    >
                                        {isSectionComplete(activeSection.id) ? "Next" : "Complete & Next"}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            markSectionComplete(activeSection.id);
                                        }}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                            isSectionComplete(activeSection.id)
                                                ? "bg-emerald-500 text-white"
                                                : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200"
                                        }`}
                                    >
                                        {isSectionComplete(activeSection.id) ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Module Complete!
                                            </>
                                        ) : (
                                            "Complete Section"
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Next / Prev Module Links */}
                            {activeSectionIdx === mod.sections.length - 1 && isSectionComplete(activeSection.id) && (
                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    {nextModule && (
                                        <Link
                                            href={`/learning/${trackId}/${nextModule.id}`}
                                            className="flex-1 flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-brand-indigo dark:hover:border-brand-indigo hover:shadow-sm transition-all group"
                                        >
                                            <div>
                                                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                                    Next Module
                                                </span>
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-brand-indigo transition-colors mt-0.5">
                                                    {nextModule.title}
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-brand-indigo transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                    <Link
                                        href={`/learning/${trackId}`}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        All Modules
                                    </Link>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* CSS for fade-in animation */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

// ── Sidebar Content Component ────────────────────────────────────

function SidebarContent({
    mod,
    activeSectionIdx,
    isSectionComplete,
    onSelect,
}: {
    mod: { title: string; icon: string; sections: Section[] };
    activeSectionIdx: number;
    isSectionComplete: (id: string) => boolean;
    onSelect: (idx: number) => void;
}) {
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 px-1">
                {mod.title}
            </h3>
            <nav className="space-y-0.5">
                {mod.sections.map((section, idx) => {
                    const isActive = idx === activeSectionIdx;
                    const isComplete = isSectionComplete(section.id);

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSelect(idx)}
                            className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                isActive
                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            }`}
                        >
                            {/* Status indicator */}
                            <span className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                                isComplete
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    : isActive
                                    ? "bg-brand-indigo/10 text-brand-indigo"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
                            }`}>
                                {isComplete ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    section.id.split(".")[1]
                                )}
                            </span>

                            <span className="truncate">{section.title}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
