"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-neutral-400 font-mono">Loading...</p>
                </div>
            </div>
        );
    }

    const FEATURES = [
        {
            title: "AI-Powered Feedback",
            desc: "Get instant, detailed analysis of your code logic. Understand why your solution works or fails, not just whether it passes.",
        },
        {
            title: "Adaptive Difficulty",
            desc: "Choose your learning mode from beginner-friendly hints all the way to competitive programming practice with no assistance.",
        },
        {
            title: "Progress Tracking",
            desc: "Monitor your improvement over time. Track your success rate, streaks, and performance across topics.",
        },
    ];

    const STEPS = [
        { n: "01", title: "Pick a Problem", desc: "Browse our curated problem library, filtered by topic and difficulty. Start anywhere." },
        { n: "02", title: "Write Your Solution", desc: "Use the built-in code editor with syntax highlighting. Write in Python or JavaScript." },
        { n: "03", title: "Get AI Feedback", desc: "Submit your code and receive structured feedback on logic, efficiency, and code quality." },
        { n: "04", title: "Improve & Iterate", desc: "Apply the suggestions and resubmit. Repeat until you fully understand the concept." },
    ];

    const FAQS = [
        {
            q: "How does the AI evaluate my code?",
            a: "Your code is sent to an AI model that checks it against the expected output and verifies you used the required concept. It gives you a hint if something is off — never the answer."
        },
        {
            q: "Will the AI give me the solution?",
            a: "No. The AI is designed to only provide hints and point you in the right direction. You have to figure out the code yourself."
        },
        {
            q: "What languages are supported?",
            a: "Python and JavaScript are fully supported right now, with more languages (Java, C++) coming soon. Each problem comes with starter code."
        },
        {
            q: "Is this free to use?",
            a: "Yes, completely free. Just sign up and start coding — no payment required."
        },
        {
            q: "Who is this for?",
            a: "Anyone learning to code. The problems are beginner-friendly and designed so you can solve them in 2–3 lines once you understand the concept."
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">
            {/* Hero */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
                <p className="font-mono text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5">
                    learn · code · improve
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight mb-5">
                    Learn to Code with<br />AI-Powered Feedback
                </h1>
                <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto mb-8">
                    Solve real programming problems. Get instant AI feedback on your logic, efficiency, and code quality — then improve and resubmit.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/signup" className="w-full sm:w-auto text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                        Start for free →
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto text-sm font-medium text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-6 py-3 rounded-md hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        I already have an account
                    </Link>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6"><div className="border-t border-neutral-200 dark:border-neutral-800" /></div>

            {/* Features */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                <p className="font-mono text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-10">What you get</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    {FEATURES.map((f, i) => (
                        <div key={i}>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6"><div className="border-t border-neutral-200 dark:border-neutral-800" /></div>

            {/* How it works */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                <p className="font-mono text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-10">How it works</p>
                <div className="space-y-8">
                    {STEPS.map(({ n, title, desc }) => (
                        <div key={n} className="flex items-start gap-6 border border-neutral-100 dark:border-neutral-800 rounded-lg p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors">
                            <span className="font-mono text-xs text-neutral-300 dark:text-neutral-600 mt-0.5 flex-shrink-0 pt-0.5">{n}</span>
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6"><div className="border-t border-neutral-200 dark:border-neutral-800" /></div>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
                <p className="font-mono text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-10">Frequently Asked</p>
                <div className="space-y-0 divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    {FAQS.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                            >
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">{faq.q}</span>
                                <svg
                                    className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-4 bg-white dark:bg-neutral-900">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6"><div className="border-t border-neutral-200 dark:border-neutral-800" /></div>

            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Ready to start?</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-7">Free to use. No credit card required.</p>
                <Link href="/signup" className="inline-block text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-7 py-3 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                    Create a free account →
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">Codexa</span>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-400 dark:text-neutral-500">
                        <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms of Service</Link>
                        <span>© 2026 Codexa. Built by Abhiraj &amp; Tuhin.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
