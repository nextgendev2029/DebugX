"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { allTracks } from "@/data/python-course";
import { useState, useEffect } from "react";

type SectionProgress = Record<string, boolean>;

function getSectionProgress(trackId: string): SectionProgress {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(`learning-progress-${trackId}`);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export default function TrackDetailPage() {
    const params = useParams();
    const trackId = params.id as string;
    const track = allTracks.find((t) => t.id === trackId);
    const [progress, setProgress] = useState<SectionProgress>({});

    useEffect(() => {
        if (track) {
            setProgress(getSectionProgress(track.id));
        }
    }, [track]);

    if (!track) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Track not found</h1>
                    <Link href="/learning" className="text-sm text-brand-indigo hover:underline">
                        ← Back to tracks
                    </Link>
                </div>
            </div>
        );
    }

    const getModuleProgress = (moduleId: string) => {
        const module = track.modules.find((m) => m.id === moduleId);
        if (!module) return { completed: 0, total: 0, percent: 0 };
        const total = module.sections.length;
        const completed = module.sections.filter((s) => progress[`${moduleId}-${s.id}`]).length;
        return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const totalCompleted = Object.values(progress).filter(Boolean).length;
    const totalSections = track.modules.reduce((s, m) => s + m.sections.length, 0);
    const overallPercent = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Header */}
            <section className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-6">
                        <Link href="/learning" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                            Learning
                        </Link>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-neutral-900 dark:text-white">{track.title}</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${track.modules[0]?.color || "#6366f1"}15, ${track.modules[0]?.color || "#6366f1"}30)`,
                            }}
                        >
                            <svg className="w-5 h-5" style={{ color: track.modules[0]?.color || "#6366f1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                {track.title}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {track.description}
                            </p>
                        </div>
                    </div>

                    {/* Stats & Progress */}
                    <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-4">
                        <span>{track.totalModules} modules</span>
                        <span>{track.totalSections} sections</span>
                        <span>{track.totalMCQs} quizzes</span>
                        {overallPercent > 0 && (
                            <span className="text-emerald-500 font-semibold">{overallPercent}% complete</span>
                        )}
                    </div>

                    {overallPercent > 0 && (
                        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${overallPercent}%`,
                                    background: "linear-gradient(90deg, #22c55e, #3b82f6, #a855f7)",
                                }}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Module List */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
                <div className="space-y-4">
                    {track.modules.map((mod, idx) => {
                        const mp = getModuleProgress(mod.id);
                        const isCompleted = mp.percent === 100;

                        return (
                            <Link
                                key={mod.id}
                                href={`/learning/${track.id}/${mod.id}`}
                                id={`module-${mod.id}`}
                                className="group block border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Module number */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono"
                                        style={{
                                            background: isCompleted
                                                ? "linear-gradient(135deg, #22c55e20, #22c55e40)"
                                                : `linear-gradient(135deg, ${mod.color}15, ${mod.color}30)`,
                                            color: isCompleted ? "#22c55e" : mod.color,
                                        }}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span>{String(idx + 1).padStart(2, "0")}</span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-brand-indigo dark:group-hover:text-brand-indigo transition-colors truncate">
                                                {mod.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
                                            {mod.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                                                {mod.sections.length} sections · {mod.sections.reduce((s, sec) => s + sec.mcqs.length, 0)} quizzes
                                            </span>

                                            {mp.percent > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${mp.percent}%`,
                                                                background: isCompleted ? "#22c55e" : mod.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                                                        {mp.completed}/{mp.total}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <svg className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-brand-indigo dark:group-hover:text-brand-indigo flex-shrink-0 mt-1 transform group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
