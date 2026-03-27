"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, dbUser, signOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = mobileOpen ? "hidden" : "";
        }
        return () => {
            if (typeof document !== "undefined") {
                document.body.style.overflow = "";
            }
        };
    }, [mobileOpen]);

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const displayName = dbUser?.display_name || user?.displayName || user?.email?.split("@")[0] || "User";
    const avatarUrl = dbUser?.avatar_url || user?.photoURL;

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const navLinks = user
        ? [
            { href: "/dashboard", label: "Dashboard" },
            { href: "/problems", label: "Problems" },
            { href: "/learning", label: "Learning" },
        ]
        : [];

    return (
        <>
            <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-50">
                <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Codexa</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-5">
                        {user ? (
                            <>
                                {navLinks.map(l => (
                                    <Link key={l.href} href={l.href}
                                        className={`text-sm font-medium transition-colors ${isActive(l.href) ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}>
                                        {l.label}
                                    </Link>
                                ))}

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-1.5 focus:outline-none py-1">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-xs font-mono">{getInitials(displayName)}</span>
                                            </div>
                                        )}
                                        <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
                                            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{displayName}</p>
                                                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                            </div>
                                            {[
                                                { href: "/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                                                { href: "/bookmarks", label: "Bookmarks", icon: "M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" },
                                            ].map(item => (
                                                <Link key={item.href} href={item.href}
                                                    className="flex items-center space-x-2 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                                    onClick={() => setDropdownOpen(false)}>
                                                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                    </svg>
                                                    <span>{item.label}</span>
                                                </Link>
                                            ))}
                                            <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                                                <button onClick={() => { handleLogout(); setDropdownOpen(false); }}
                                                    className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <ThemeToggle />
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Link href="/login" className="text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Log In</Link>
                                <Link href="/signup" className="text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Right — ThemeToggle + Hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

                    {/* Slide-in panel */}
                    <div className="absolute top-14 left-0 right-0 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shadow-xl animate-in slide-in-from-top-4 duration-200">
                        {user ? (
                            <>
                                {/* User info strip */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-xs font-mono">{getInitials(displayName)}</span>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{displayName}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* Nav links */}
                                <div className="py-2">
                                    {[
                                        { href: "/dashboard", label: "Dashboard" },
                                        { href: "/problems", label: "Problems" },
                                        { href: "/learning", label: "Learning" },
                                        { href: "/bookmarks", label: "Bookmarks" },
                                        { href: "/profile", label: "Profile" },
                                    ].map(l => (
                                        <Link key={l.href} href={l.href}
                                            className={`block px-5 py-3.5 text-sm font-medium border-l-2 transition-colors ${isActive(l.href)
                                                ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-900"
                                                : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                                }`}>
                                            {l.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Sign out */}
                                <div className="border-t border-neutral-100 dark:border-neutral-800 p-4">
                                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 space-y-3">
                                <Link href="/login" className="block w-full text-center py-2.5 text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/signup" className="block w-full text-center py-2.5 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Close dropdown backdrop */}
            {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
        </>
    );
}
