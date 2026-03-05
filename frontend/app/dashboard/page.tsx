"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, dbUser, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace("/login");
    };

    // Get initials for avatar fallback
    const displayName = dbUser?.display_name || user?.displayName || "User";
    const email = dbUser?.email || user?.email || "";
    const avatarUrl = dbUser?.avatar_url || user?.photoURL || "";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0f1117] text-white">
                {/* Top nav */}
                <nav className="border-b border-white/10 bg-[#1a1d2e]/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                            Codexa
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </nav>

                {/* Main content */}
                <main className="max-w-6xl mx-auto px-6 py-12">
                    {/* Welcome card */}
                    <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/30 rounded-2xl p-8 mb-8 flex items-center gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={avatarUrl}
                                    alt={displayName}
                                    className="w-20 h-20 rounded-full border-2 border-indigo-500/50 object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold">
                                    {initial}
                                </div>
                            )}
                        </div>

                        {/* Name & email */}
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Welcome back 👋</p>
                            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                            <p className="text-slate-400 text-sm mt-1">{email}</p>
                            {dbUser?.username && (
                                <span className="inline-block mt-2 text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">
                                    @{dbUser.username}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats — placeholder */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: "Problems Solved", value: dbUser?.problems_solved ?? 0, color: "from-green-500/20 to-emerald-500/10 border-green-500/20" },
                            { label: "Total Score", value: dbUser?.total_score ?? 0, color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/20" },
                            { label: "Current Streak", value: `${dbUser?.current_streak ?? 0} 🔥`, color: "from-orange-500/20 to-amber-500/10 border-orange-500/20" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className={`bg-gradient-to-br ${stat.color} border rounded-xl p-5`}
                            >
                                <p className="text-slate-400 text-xs mb-2">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Coming Soon */}
                    <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-8 text-center">
                        <div className="text-4xl mb-3">🚧</div>
                        <h2 className="text-lg font-semibold text-white mb-2">More coming soon</h2>
                        <p className="text-slate-400 text-sm">
                            Problems, heatmap, learning tracks — all being built. Stay tuned!
                        </p>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
