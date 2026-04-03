import { auth } from "@/lib/firebase";
import { getLogger } from "@/lib/logger";

const logger = getLogger("API");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://debugx-backend.onrender.com";

/**
 * Get the current user's Firebase ID token for authenticated requests.
 */
async function getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

/**
 * Generic authenticated fetch wrapper.
 */
async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const method = options.method || "GET";
    logger.debug(`${method} ${path}`);

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        logger.error(`${method} ${path} failed`, { status: res.status, detail: error.detail });
        throw new Error(error.detail || `API error ${res.status}`);
    }

    logger.debug(`${method} ${path} — ${res.status} OK`);
    return res.json();
}


// ─── Problems API ────────────────────────────────────────────────────────────

export interface ProblemListItem {
    id: number;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
    tags: string[] | null;
    success_rate: number;
    total_attempts: number;
    total_solved: number;
    description?: string;
}

export interface ProblemDetail {
    id: number;
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    topic: string;
    tags: string[] | null;
    examples: Array<{ input: string; output: string; explanation?: string }> | null;
    constraints: string[] | null;
    starter_code: Record<string, string> | null;
    success_rate: number;
    total_attempts: number;
    total_solved: number;
}

/** Fetch all problems (optional filters) */
export async function fetchProblems(filters?: {
    difficulty?: string;
    topic?: string;
}): Promise<ProblemListItem[]> {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.topic) params.set("topic", filters.topic);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/api/problems${query}`);
}

/** Fetch a single problem by slug */
export async function fetchProblem(slug: string): Promise<ProblemDetail> {
    return apiFetch(`/api/problems/${slug}`);
}


// ─── Submissions API ─────────────────────────────────────────────────────────

export interface TestCaseResult {
    test_number: number;
    input: string;
    expected: string;
    actual: string | null;
    passed: boolean;
    error: string | null;
}

export interface AIFeedback {
    feedback_text: string;
    suggestions: string[] | null;
}

export interface SubmissionResult {
    id: number;
    problem_id: number;
    problem_title: string;
    status: string;
    code: string;
    language: string;
    passed_tests: number;
    total_tests: number;
    score: number;
    execution_time: number | null;
    error_message: string | null;
    test_results: TestCaseResult[] | null;
    feedback: AIFeedback | null;
    created_at: string;
}

/** Submit code for a problem */
export async function submitCode(
    problemId: number,
    code: string,
    language: string = "python"
): Promise<SubmissionResult> {
    return apiFetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
            problem_id: problemId,
            code,
            language,
        }),
    });
}

/** Fetch user-specific stats */
export async function fetchUserStats(): Promise<{
    total_solved: number;
    success_rate: number;
    current_streak: number;
    total_score: number;
}> {
    return apiFetch(`/api/submissions/stats`);
}

/** Fetch user-specific heatmap data */
export interface HeatmapData {
    activity: Record<string, number>;
    current_streak: number;
    longest_streak: number;
    total_submissions: number;
    active_days: number;
    today: string;
}

export async function fetchUserHeatmap(): Promise<HeatmapData> {
    return apiFetch(`/api/submissions/heatmap`);
}

/** Fetch all submissions for the current user */
export async function fetchUserSubmissions(): Promise<SubmissionResult[]> {
    return apiFetch(`/api/submissions/mine`);
}


// ─── Visualizer API ──────────────────────────────────────────────────────────

export interface TraceStep {
    line: number;
    variables: Record<string, unknown>;
    output: string;
}

export interface TraceResult {
    steps: TraceStep[];
    final_output: string;
    error: string | null;
    total_steps: number;
    truncated: boolean;
    code_lines: string[];
}

/** Trace Python code execution step-by-step */
export async function visualizeCode(code: string, stdin: string = ""): Promise<TraceResult> {
    return apiFetch("/api/visualize", {
        method: "POST",
        body: JSON.stringify({ code, stdin }),
    });
}

// ─── Bookmarks API ───────────────────────────────────────────────────────────

export interface Bookmark {
    id: number;
    user_id: number;
    problem_id: number;
    created_at: string;
    problem_title: string;
    problem_slug: string;
    problem_difficulty: string;
    problem_topic: string;
    problem_description: string;
}

export const bookmarkApi = {
    /** Toggle bookmark — add if not bookmarked, remove if already bookmarked */
    toggle: async (userId: number, problemId: number): Promise<{ bookmarked: boolean; bookmark_id: number | null }> => {
        return apiFetch(`/api/bookmarks/toggle`, {
            method: "POST",
            body: JSON.stringify({ user_id: userId, problem_id: problemId }),
        });
    },

    /** Get all bookmarks with problem details for a user */
    getAll: async (userId: number): Promise<Bookmark[]> => {
        return apiFetch(`/api/bookmarks/user/${userId}`);
    },

    /** Get just the bookmarked problem IDs (fast, for highlighting icons) */
    getIds: async (userId: number): Promise<number[]> => {
        const data = await apiFetch(`/api/bookmarks/user/${userId}/ids`);
        return data.bookmarked_problem_ids ?? [];
    }
};

