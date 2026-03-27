"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchUserHeatmap, fetchUserStats, fetchUserSubmissions, fetchProblems, HeatmapData, SubmissionResult } from "@/lib/api";

// ── Live Clock Component ──────────────────────────────────────────────────────

function LiveClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = now.toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    });

    return (
        <div className="text-right flex-shrink-0">
            <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">{dateStr}</p>
            <p className="text-lg font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{timeStr}</p>
        </div>
    );
}

// ── Activity Heatmap Component ────────────────────────────────────────────────

type HeatmapFilter = "6m" | "12m" | "2026" | "2025";

function getDateRange(filter: HeatmapFilter): { startDate: Date; endDate: Date; label: string } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "6m") {
        const start = new Date(today);
        start.setMonth(start.getMonth() - 6);
        start.setDate(1);
        return { startDate: start, endDate: today, label: "last 6 months" };
    }
    if (filter === "12m") {
        const start = new Date(today);
        start.setFullYear(start.getFullYear() - 1);
        start.setDate(start.getDate() + 1);
        return { startDate: start, endDate: today, label: "last 12 months" };
    }
    if (filter === "2026") {
        return { startDate: new Date("2026-01-01"), endDate: new Date(Math.min(today.getTime(), new Date("2026-12-31").getTime())), label: "2026" };
    }
    return { startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31"), label: "2025" };
}

function buildWeeks(startDate: Date, endDate: Date): { date: string; count: number }[][] {
    const alignedStart = new Date(startDate);
    alignedStart.setDate(alignedStart.getDate() - alignedStart.getDay());

    const weeks: { date: string; count: number }[][] = [];
    const cursor = new Date(alignedStart);

    while (cursor <= endDate) {
        const week: { date: string; count: number }[] = [];
        for (let d = 0; d < 7; d++) {
            week.push({ date: cursor.toISOString().slice(0, 10), count: 0 });
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}

function ActivityHeatmap({ heatmap }: { heatmap: HeatmapData }) {
    const { activity, today, current_streak, longest_streak, active_days, total_submissions } = heatmap;
    const [filter, setFilter] = useState<HeatmapFilter>("12m");
    const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    const filterOptions: { value: HeatmapFilter; label: string }[] = [
        { value: "6m", label: "Last 6 Months" },
        { value: "12m", label: "Last 12 Months" },
        { value: "2026", label: "Year 2026" },
        { value: "2025", label: "Year 2025" },
    ];

    const { startDate, endDate, label } = getDateRange(filter);
    const cells = buildWeeks(startDate, endDate);

    cells.forEach(week => week.forEach(cell => {
        cell.count = activity[cell.date] || 0;
    }));

    const getColor = (cell: { date: string; count: number }) => {
        const isToday = cell.date === today;
        const isFuture = cell.date > today;
        const isPast = cell.date < startDate.toISOString().slice(0, 10);
        if (isPast || isFuture) return "bg-neutral-50 dark:bg-neutral-900 opacity-20";
        if (isToday) return "bg-neutral-300 dark:bg-neutral-600 ring-1 ring-dashed ring-neutral-500 dark:ring-neutral-400";
        if (cell.count === 0) return "bg-neutral-100 dark:bg-neutral-800";
        if (cell.count === 1) return "bg-neutral-300 dark:bg-neutral-600";
        if (cell.count === 2) return "bg-neutral-500 dark:bg-neutral-400";
        return "bg-neutral-800 dark:bg-neutral-200";
    };

    const getLegendColor = (level: number) => {
        if (level === 0) return "bg-neutral-100 dark:bg-neutral-800";
        if (level === 1) return "bg-neutral-300 dark:bg-neutral-600";
        if (level === 2) return "bg-neutral-500 dark:bg-neutral-400";
        return "bg-neutral-800 dark:bg-neutral-200";
    };

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const monthLabels: { label: string; col: number }[] = [];
    let lastLabelCol = -4;
    cells.forEach((week, colIdx) => {
        const m = new Date(week[0].date + "T00:00:00").getMonth();
        const prevM = colIdx > 0 ? new Date(cells[colIdx - 1][0].date + "T00:00:00").getMonth() : -1;
        if (m !== prevM && colIdx - lastLabelCol >= 3) {
            monthLabels.push({ label: MONTHS[m], col: colIdx });
            lastLabelCol = colIdx;
        }
    });

    return (
        <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Activity</h2>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {total_submissions} submissions · {active_days} active days in the {label}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value as HeatmapFilter)}
                        className="text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    >
                        {filterOptions.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <div className="text-center">
                        <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white">{current_streak}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">day streak</p>
                    </div>
                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="text-center">
                        <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white">{longest_streak}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">best streak</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto pb-1">
                <div className="min-w-max">
                    <div className="flex mb-1 ml-8">
                        {cells.map((_, i) => {
                            const lbl = monthLabels.find(m => m.col === i);
                            return (
                                <div key={i} className="flex-shrink-0 w-3.5 mr-0.5">
                                    {lbl ? (
                                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap block">{lbl.label}</span>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex">
                        <div className="flex flex-col mr-2 flex-shrink-0">
                            {DAY_LABELS.map((day, i) => (
                                <div key={i} className="h-3.5 mb-0.5 flex items-center">
                                    {i % 2 === 1 ? (
                                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 w-6 text-right leading-none">{day}</span>
                                    ) : (
                                        <span className="w-6" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-0.5">
                            {cells.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-0.5">
                                    {week.map((cell, di) => (
                                        <div
                                            key={di}
                                            className={`w-3.5 h-3.5 rounded-[2px] flex-shrink-0 ${getColor(cell)} transition-colors cursor-default relative`}
                                            onMouseEnter={e => {
                                                const rect = (e.target as HTMLElement).getBoundingClientRect();
                                                setTooltip({ date: cell.date, count: cell.count, x: rect.left + rect.width / 2, y: rect.top });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 ml-8">
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mr-1">Less</span>
                        {[0, 1, 2, 4].map(level => (
                            <div key={level} className={`w-3.5 h-3.5 rounded-[2px] ${getLegendColor(level)}`} />
                        ))}
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 ml-1">More</span>
                        <div className="ml-3 flex items-center gap-1">
                            <div className="w-3.5 h-3.5 rounded-[2px] bg-neutral-300 dark:bg-neutral-600 ring-1 ring-dashed ring-neutral-500 dark:ring-neutral-400" />
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Today</span>
                        </div>
                    </div>
                </div>
            </div>

            {tooltip && (
                <div
                    className="fixed z-50 px-2.5 py-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[11px] font-mono shadow-lg pointer-events-none whitespace-nowrap"
                    style={{ left: tooltip.x, top: tooltip.y - 8, transform: "translate(-50%, -100%)" }}
                >
                    <span className="font-semibold">{tooltip.count} submission{tooltip.count !== 1 ? "s" : ""}</span>
                    <span className="text-neutral-400 dark:text-neutral-500 ml-1.5">{tooltip.date}</span>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900 dark:border-t-neutral-100" />
                </div>
            )}
        </div>
    );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [totalProblemsCount, setTotalProblemsCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        // If auth is still loading, wait
        if (authLoading) return;

        // If no user at all, redirect to landing or show empty
        if (!user) {
            setLoadingData(false);
            return;
        }

        // If we have a user but no dbUser yet, it might still be syncing
        if (!dbUser?.id) return;

        const fetchData = async () => {
            try {
                const [subsData, probsData, heatmapData, statsData] = await Promise.all([
                    fetchUserSubmissions(),
                    fetchProblems(),
                    fetchUserHeatmap(),
                    fetchUserStats(),
                ]);
                setSubmissions(subsData);
                setTotalProblemsCount(probsData.length);
                setHeatmap(heatmapData);
                setStats(statsData);
            } catch (error) {
                console.error("Dashboard fetch failed:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [user, dbUser?.id, authLoading]);

    const displayName = dbUser?.display_name || user?.displayName || user?.email?.split("@")[0] || "User";
    const avatarInitials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted": return "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
            case "wrong_answer": return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
            case "error": return "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
            default: return "text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700";
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${mins}m ago`;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    {/* Welcome Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-8 bg-neutral-50 dark:bg-neutral-900">
                        {dbUser?.avatar_url || user?.photoURL ? (
                            <img src={dbUser?.avatar_url || user?.photoURL!} alt="Profile" className="w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover flex-shrink-0" />
                        ) : (
                            <div className="w-16 h-16 bg-neutral-900 dark:bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-2xl font-mono">{avatarInitials}</span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Welcome back, {displayName}</h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate">{user?.email}</p>
                        </div>
                        <div className="hidden sm:block"><LiveClock /></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Problems Solved", value: stats?.total_solved ?? 0, sub: `of ${totalProblemsCount} available` },
                            { label: "Submissions", value: heatmap?.total_submissions ?? 0, sub: "Total attempts" },
                            { label: "Success Rate", value: stats ? `${stats.success_rate}%` : "0%", sub: `${stats?.total_solved ?? 0} accepted` },
                            { label: "Current Streak", value: heatmap ? `${heatmap.current_streak}d` : "0d", sub: `Best: ${heatmap?.longest_streak ?? 0}d` },
                        ].map((stat, i) => (
                            <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-white dark:bg-neutral-900">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">{stat.label}</p>
                                <p className="text-3xl font-bold text-neutral-900 dark:text-white font-mono">{loadingData ? "—" : stat.value}</p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Area */}
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-8 bg-white dark:bg-neutral-900">
                        {loadingData || !heatmap ? (
                            <div className="h-40 flex items-center justify-center text-sm text-neutral-400 font-mono animate-pulse">
                                Loading activity...
                            </div>
                        ) : (
                            <ActivityHeatmap heatmap={heatmap} />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Submissions list */}
                        <div className="md:col-span-2 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
                            <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
                                <Link href="/problems" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Solve More →</Link>
                            </div>
                            <div className="p-5">
                                {loadingData ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg animate-pulse" />)}
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-sm text-neutral-400 mb-5">You haven't solved any problems yet.</p>
                                        <Link href="/problems" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                                            Start Coding
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {submissions.slice(0, 5).map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-3.5 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-neutral-200 dark:hover:border-neutral-700 transition-all hover:shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${sub.status === "accepted" ? "bg-green-500" : "bg-red-500"}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{sub.problem_title}</p>
                                                        <p className="text-xs text-neutral-500 font-mono mt-0.5 capitalize">{sub.status.replace(/_/g, " ")} · {sub.language}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{sub.score}</p>
                                                    <p className="text-[10px] text-neutral-400 mt-1">{formatTime(sub.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Card */}
                        <div className="space-y-6">
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
                                <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Account Details</h2>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono mb-1">Username</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">@{dbUser?.username || "not_set"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono mb-1">XP Points</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{dbUser?.total_score || 0} XP</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono mb-1">Next Goal</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">Expert Coder 🏆</p>
                                    </div>
                                    <Link href="/profile" className="block w-full text-center py-2 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
