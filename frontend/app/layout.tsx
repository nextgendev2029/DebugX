import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Codexa — AI-Powered Coding Practice",
    description: "Practice coding problems with an AI code visualizer and step-through debugger.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-200`}>
                <ThemeProvider>
                    <AuthProvider>
                        <Header />
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
