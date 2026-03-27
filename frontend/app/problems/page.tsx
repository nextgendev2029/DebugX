"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Link from "next/link";
import { fetchProblems, fetchUserSubmissions, ProblemListItem, SubmissionResult } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const topics = ["All", "Arrays", "Strings", "Linked Lists", "Trees", "Stack", "Dynamic Programming", "Math", "Loops", "Conditionals"];
const difficulties = ["All", "Easy", "Medium", "Hard"];

const difficultyColors: Record<string, string> = {
    easy: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    medium: "text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    hard: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

export default function ProblemsPage() {
    const { dbUser } = useAuth();
    const [selectedTopic, setSelectedTopic] = useState("All");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [problems, setProblems] = useState<(ProblemListItem & { userSolved: boolean, userAttempts: number, userSuccessRate: number })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const probsData = await fetchProblems();
                
                let subsData: SubmissionResult[] = [];
                if (dbUser?.id) {
                    subsData = await fetchUserSubmissions();
                }

                const enrichedProblems = probsData.map(p => {
                    const userSubs = subsData.filter(s => s.problem_id === p.id);
                    const userAttempts = userSubs.length;
                    const userSolved = userSubs.some(s => s.status === 'accepted');
                    const userSuccessRate = userAttempts > 0
                        ? Math.round((userSubs.filter(s => s.status === 'accepted').length / userAttempts) * 100)
                        : 0;
                    return { ...p, userSolved, userAttempts, userSuccessRate };
                });
                setProblems(enrichedProblems);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [dbUser?.id]);

    const filteredProblems = problems.filter(problem => {
        const matchesTopic = selectedTopic === "All" || problem.topic === selectedTopic;
        const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (problem.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTopic && matchesDifficulty && matchesSearch;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-neutral-400 font-mono tracking-tight">Loading problems...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Problems</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Master your skills with curated coding challenges.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                        {[
                            { label: "Total", value: problems.length, color: "text-neutral-900 dark:text-white" },
                            { label: "Solved", value: problems.filter(p => p.userSolved).length, color: "text-green-600 dark:text-green-400" },
                            { label: "In Progress", value: problems.filter(p => p.userAttempts > 0 && !p.userSolved).length, color: "text-yellow-600 dark:text-yellow-400" },
                            { label: "Not Started", value: problems.filter(p => p.userAttempts === 0).length, color: "text-neutral-500 dark:text-neutral-400" },
                        ].map((s) => (
                            <div key={s.label} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 text-center bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                                <p className={`text-2xl font-bold font-mono tracking-tighter ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono uppercase tracking-[0.2em] mt-1.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-6 mb-8 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2 ml-1">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by title or topic..."
                                        className="w-full border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 placeholder-neutral-300 dark:placeholder-neutral-600 transition-all shadow-inner"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2 ml-1">Topic</label>
                                <div className="relative group">
                                    <select
                                        className="w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer appearance-none transition-all"
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                    >
                                        {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                    </select>
                                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-hover:text-neutral-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2 ml-1">Difficulty</label>
                                <div className="relative group">
                                    <select
                                        className="w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer appearance-none transition-all"
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    >
                                        {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                                    </select>
                                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none group-hover:text-neutral-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Problems List */}
                    <div className="grid grid-cols-1 gap-4">
                        {filteredProblems.length === 0 ? (
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-16 text-center bg-white dark:bg-neutral-900 shadow-sm">
                                <p className="text-sm text-neutral-400 font-mono">No problems found matching your filters.</p>
                            </div>
                        ) : (
                            filteredProblems.map(problem => (
                                <div key={problem.id} className="group border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                                {problem.userSolved && (
                                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                        <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <h3 className="text-base font-bold text-neutral-900 dark:text-white truncate tracking-tight">{problem.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${difficultyColors[problem.difficulty.toLowerCase()] || "text-neutral-600 bg-neutral-50 border-neutral-200"}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                                                    {problem.topic}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-3 pr-4">{problem.description || "Challenge your limits with this problem."}</p>
                                            <div className="flex items-center gap-5 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono tracking-tight uppercase">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                                    Attempts: <span className="text-neutral-600 dark:text-neutral-300">{problem.userAttempts}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                                    Success: <span className="text-neutral-600 dark:text-neutral-300">{problem.userSuccessRate}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/problems/${problem.slug}`} className="flex-shrink-0">
                                            <button className="w-full md:w-auto text-sm font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-all shadow-md group-hover:shadow-lg active:scale-95 whitespace-nowrap">
                                                {problem.userSolved ? "RETRY" : problem.userAttempts > 0 ? "CONTINUE" : "SOLVE"}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
