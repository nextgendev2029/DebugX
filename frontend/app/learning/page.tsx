"use client";

import Link from "next/link";
import { allTracks } from "@/data/python-course";
import { useState, useEffect } from "react";

function getTrackProgress(trackId: string): number {
    if (typeof window === "undefined") return 0;
    try {
        const raw = localStorage.getItem(`learning-progress-${trackId}`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        const completed = Object.values(data).filter(Boolean).length;
        const total = Object.keys(data).length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    } catch {
        return 0;
    }
}

export default function LearningPage() {
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});

    useEffect(() => {
        const map: Record<string, number> = {};
        allTracks.forEach((t) => {
            map[t.id] = getTrackProgress(t.id);
        });
        setProgressMap(map);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Hero */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
                <p className="font-mono text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                    Learning Tracks
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
                    Master Programming
                </h1>
                <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl">
                    Structured, interactive courses with hands-on examples and quizzes.
                    Learn at your own pace, track your progress, and test your knowledge.
                </p>
            </section>

            {/* Track Cards */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
                <div className="grid grid-cols-1 gap-5">
                    {allTracks.map((track) => {
                        const progress = progressMap[track.id] || 0;
                        return (
                            <Link
                                key={track.id}
                                href={`/learning/${track.id}`}
                                id={`track-${track.id}`}
                                className="group block border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                    {/* Icon */}
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${track.modules[0]?.color || "#6366f1"}15, ${track.modules[0]?.color || "#6366f1"}30)`,
                                        }}
                                    >
                                        <svg className="w-6 h-6" style={{ color: track.modules[0]?.color || "#6366f1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-brand-indigo dark:group-hover:text-brand-indigo transition-colors">
                                                {track.title}
                                            </h2>
                                            <span className="px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                {track.language}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                                            {track.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                                {track.totalModules} modules
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {track.totalSections} sections
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {track.totalMCQs} quizzes
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        {progress > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${progress}%`,
                                                            background: "linear-gradient(90deg, #6366f1, #a855f7)",
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 flex-shrink-0">
                                                    {progress}%
                                                </span>
                                            </div>
                                        )}
                                        {progress === 0 && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 group-hover:text-brand-indigo dark:group-hover:text-brand-indigo transition-colors">
                                                Start learning
                                                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
