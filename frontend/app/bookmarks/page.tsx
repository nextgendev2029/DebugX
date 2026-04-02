"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Link from "next/link";
import { bookmarkApi, Bookmark } from "@/lib/api";
import { getLogger } from "@/lib/logger";

const logger = getLogger("BookmarksPage");


const DIFFICULTY_COLOR: Record<string, string> = {
    easy: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    medium: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    hard: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

export default function BookmarksPage() {
    const { dbUser } = useAuth();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<number | null>(null);

    useEffect(() => {
        if (!dbUser?.id) return;
        logger.info("Loading bookmarks", { userId: dbUser.id });
        bookmarkApi.getAll(dbUser.id).then(data => {
            logger.info("Bookmarks loaded", { count: data.length });
            setBookmarks(data);
            setLoading(false);
        }).catch(err => {
            logger.error("Failed to load bookmarks", { error: err });
            setLoading(false);
        });
    }, [dbUser?.id]);

    const handleRemove = async (problemId: number) => {
        if (!dbUser?.id) return;
        setRemovingId(problemId);
        logger.info("Removing bookmark", { problemId });
        try {
            await bookmarkApi.toggle(dbUser.id, problemId);
            setBookmarks(prev => prev.filter(b => b.problem_id !== problemId));
            logger.info("Bookmark removed successfully", { problemId });
        } catch (err) {
            logger.error("Failed to remove bookmark", { problemId, error: err });
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-10">
                        <svg className="w-6 h-6 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
                        </svg>
                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Bookmarks</h1>
                        {!loading && (
                            <span className="ml-auto text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-3 py-1 rounded-full uppercase tracking-widest">
                                {bookmarks.length} saved
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 animate-pulse bg-white dark:bg-neutral-900">
                                    <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3 mb-4" />
                                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-full mb-3" />
                                    <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/50 dark:bg-neutral-900/30">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No bookmarks yet</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">Click the bookmark icon on any problem to save it to your collection.</p>
                            <Link
                                href="/problems"
                                className="text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-all shadow-md inline-block uppercase tracking-widest active:scale-95"
                            >
                                Browse Problems
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {bookmarks.map(bm => (
                                <div
                                    key={bm.id}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                            <Link
                                                href={`/problems/${bm.problem_slug}`}
                                                className="text-base font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                                            >
                                                {bm.problem_title}
                                            </Link>
                                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${DIFFICULTY_COLOR[bm.problem_difficulty.toLowerCase()] ?? "text-neutral-500 border-neutral-200 bg-neutral-50"}`}>
                                                {bm.problem_difficulty}
                                            </span>
                                            {bm.problem_topic && (
                                                <span className="text-[10px] px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                                                    {bm.problem_topic}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-3">
                                            {bm.problem_description}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Saved {new Date(bm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
                                        <Link
                                            href={`/problems/${bm.problem_slug}`}
                                            className="flex-1 sm:flex-none text-center text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-6 py-2.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors uppercase tracking-widest whitespace-nowrap"
                                        >
                                            Solve
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(bm.problem_id)}
                                            disabled={removingId === bm.problem_id}
                                            title="Remove bookmark"
                                            className="p-2.5 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-40 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
