"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DBUser {
    id: number;
    firebase_uid: string;
    email: string;
    username: string;
    display_name: string;
    avatar_url: string;
    role: string;
    total_score: number;
    problems_solved: number;
    current_streak: number;
}

interface AuthContextType {
    user: User | null;
    dbUser: DBUser | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDbUser] = useState<DBUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync Firebase user to backend and get DB profile
    const syncWithBackend = async (firebaseUser: User): Promise<DBUser | null> => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const profile = await syncWithBackend(firebaseUser);
                setDbUser(profile);
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // ─── Auth Actions ──────────────────────────────────────────────────────────

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        // Force re-sync after profile update
        await credential.user.reload();
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setDbUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, dbUser, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
