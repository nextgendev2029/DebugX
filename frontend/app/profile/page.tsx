"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Loader2, User, Settings, ShieldAlert, LogOut } from "lucide-react";

type Tab = "personal" | "account" | "danger";

export default function ProfilePage() {
    const { user, dbUser, syncUserWithBackend, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("personal");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        display_name: "",
        username: "",
        bio: ""
    });

    useEffect(() => {
        if (dbUser) {
            setFormData({
                display_name: dbUser.display_name || user?.displayName || "",
                username: dbUser.username || "",
                bio: dbUser.bio || ""
            });
        }
    }, [dbUser, user]);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const idToken = await user?.getIdToken();
            const response = await fetch("http://localhost:8000/api/users/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update profile");
            }

            await syncUserWithBackend();
            setMessage({ text: "Profile updated successfully!", type: "success" });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ text: err.message, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const avatarInitials = (formData.display_name || user?.email || "U")
        .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: "personal", label: "Personal Information", icon: User },
        { key: "account", label: "Account Settings", icon: Settings },
        { key: "danger", label: "Danger Zone", icon: ShieldAlert },
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-10">Profile Settings</h1>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* LEFT SIDEBAR */}
                        <div className="w-full lg:w-80 space-y-6">
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                                {/* Avatar + Basics */}
                                <div className="p-8 flex flex-col items-center border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="w-24 h-24 bg-neutral-900 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-5 border-4 border-neutral-50 dark:border-neutral-900 shadow-sm relative overflow-hidden">
                                        {dbUser?.avatar_url || user?.photoURL ? (
                                            <img
                                                src={dbUser?.avatar_url || user?.photoURL!}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white dark:text-neutral-200 font-bold text-3xl">{avatarInitials}</span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white text-center">{formData.display_name || "Coder"}</h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-mono tracking-tight">@{formData.username || "unset"}</p>
                                </div>

                                {/* Tabs Navigation */}
                                <nav className="py-3">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`w-full text-left px-6 py-4 text-sm font-semibold transition-all border-l-4 flex items-center space-x-3 ${
                                                    activeTab === tab.key
                                                        ? tab.key === "danger"
                                                            ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10"
                                                            : "border-neutral-900 dark:border-white text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800"
                                                        : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>

                                {/* Simple Metadata */}
                                <div className="px-6 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">Member Since</p>
                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                                        {dbUser?.created_at ? new Date(dbUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT CONTENT PANEL */}
                        <div className="flex-1 w-full">
                            {/* Feedback Toast (Simplified) */}
                            {message && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border animate-in fade-in slide-in-from-top-2 overflow-hidden ${
                                    message.type === "success"
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                                        : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400"
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* PERSONAL INFORMATION TAB */}
                            {activeTab === "personal" && (
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm transition-all duration-300">
                                    <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                                        <h3 className="text-base font-bold text-neutral-900 dark:text-white">Personal Information</h3>
                                        <button
                                            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border ${
                                                isEditing
                                                    ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                                                    : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm"
                                            }`}
                                        >
                                            {isEditing ? "Cancel" : "Edit Profile"}
                                        </button>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Public Name */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-widest block">Public Name</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={formData.display_name}
                                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-sm focus:border-neutral-400 dark:focus:border-neutral-500 outline-none transition-all dark:text-white"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{formData.display_name || "Not set"}</p>
                                                )}
                                            </div>

                                            {/* Username */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-widest block">Username</label>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm leading-none">@</span>
                                                        <input
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                                                            className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-7 pr-4 py-2.5 text-sm font-mono focus:border-neutral-400 dark:focus:border-neutral-500 outline-none transition-all dark:text-white"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-mono text-neutral-900 dark:text-white">@{formData.username || "unset"}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email (Read Only) */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-widest block">Email Address</label>
                                            <div className="inline-flex items-center px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{user?.email}</p>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic mt-1 font-medium">Primary email is managed by your account provider.</p>
                                        </div>

                                        {/* Bio */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-widest block">Bio</label>
                                            {isEditing ? (
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    rows={4}
                                                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-sm focus:border-neutral-400 dark:focus:border-neutral-500 outline-none transition-all dark:text-white resize-none"
                                                    placeholder="A short sentence about you..."
                                                />
                                            ) : (
                                                <p className={`text-sm leading-relaxed ${formData.bio ? "text-neutral-700 dark:text-neutral-300 font-medium" : "text-neutral-400 italic font-medium"}`}>
                                                    {formData.bio || "No bio set. Keep it simple and relevant."}
                                                </p>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <div className="pt-4 flex gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isLoading}
                                                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold px-6 py-3 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
                                                >
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Changes</span>}
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold px-6 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ACCOUNT SETTINGS TAB */}
                            {activeTab === "account" && (
                                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm transition-all duration-300">
                                    <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800">
                                        <h3 className="text-base font-bold text-neutral-900 dark:text-white">Account Details</h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest block">Account Type</label>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white capitalize">{dbUser?.role || "Student"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest block">Total XP</label>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{dbUser?.total_score || 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest block">Problems Solved</label>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{dbUser?.problems_solved || 0}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono uppercase text-neutral-400 tracking-widest block">Account Status</label>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-tighter">Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DANGER ZONE TAB */}
                            {activeTab === "danger" && (
                                <div className="border border-red-200 dark:border-red-900 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm transition-all duration-300">
                                    <div className="px-8 py-6 border-b border-red-100 dark:border-red-900/50">
                                        <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-red-50 dark:border-red-900/10 rounded-xl bg-red-50/20 dark:bg-red-900/5">
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">Sign Out</p>
                                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">End your current session on this device.</p>
                                            </div>
                                            <button
                                                onClick={logout}
                                                className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center space-x-2 shadow-sm shadow-red-500/10"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm">Logout</span>
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-neutral-100 dark:border-neutral-800 rounded-xl opacity-40">
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">Delete Account</p>
                                                <p className="text-xs text-neutral-400 mt-1">Permanently remove your data. Action is irreversible.</p>
                                            </div>
                                            <button className="bg-neutral-400 text-white font-bold px-5 py-2.5 rounded-xl cursor-not-allowed">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
