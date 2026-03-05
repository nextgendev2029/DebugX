"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "signin" | "signup";

export default function LoginPage() {
    const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState<Tab>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) router.replace("/dashboard");
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (tab === "signin") {
                await signInWithEmail(email, password);
            } else {
                if (!displayName.trim()) { setError("Name is required"); setSubmitting(false); return; }
                await signUpWithEmail(email, password, displayName);
            }
            router.replace("/dashboard");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            setError(friendlyError(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogle = async () => {
        setError("");
        try {
            await signInWithGoogle();
            router.replace("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Google sign-in failed");
        }
    };

    if (loading) return null;

    return (
        <main className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
            {/* Background gradient blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        Codexa
                    </span>
                    <p className="text-slate-400 mt-2 text-sm">Your AI-powered coding practice platform</p>
                </div>

                {/* Card */}
                <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl shadow-2xl p-8">
                    {/* Tabs */}
                    <div className="flex bg-[#0f1117] rounded-xl p-1 mb-6">
                        <button
                            onClick={() => { setTab("signin"); setError(""); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${tab === "signin"
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setTab("signup"); setError(""); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${tab === "signup"
                                    ? "bg-indigo-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-5"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-slate-500 text-xs">or with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {tab === "signup" && (
                            <div>
                                <label className="text-slate-300 text-sm mb-1.5 block">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Abhiraj Singh"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-slate-300 text-sm mb-1.5 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm mb-1.5 block">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 mt-2"
                        >
                            {submitting
                                ? "Please wait..."
                                : tab === "signin"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">
                    By continuing, you agree to Codexa&apos;s Terms of Service.
                </p>
            </div>
        </main>
    );
}

// ─── Google Icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
    );
}

// ─── Firebase error → friendly message ───────────────────────────────────────
function friendlyError(msg: string): string {
    if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential"))
        return "Invalid email or password.";
    if (msg.includes("email-already-in-use")) return "An account with this email already exists.";
    if (msg.includes("weak-password")) return "Password should be at least 6 characters.";
    if (msg.includes("invalid-email")) return "Please enter a valid email address.";
    if (msg.includes("too-many-requests")) return "Too many attempts. Please try again later.";
    return msg;
}
