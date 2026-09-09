/**
 * Safely extracts a meaningful error message from any error or Supabase error object.
 */
export function extractErrorMessage(err: unknown, fallback: string = "Operation failed"): string {
    if (!err) return fallback;
    if (typeof err === "string" && err.trim()) return err;

    if (typeof err === "object") {
        const e = err as Record<string, any>;
        const msg = e.message || e.error_description || e.error || e.msg;
        if (typeof msg === "string" && msg.trim()) {
            const details = typeof e.details === "string" && e.details ? ` (${e.details})` : "";
            const hint = typeof e.hint === "string" && e.hint ? ` [Hint: ${e.hint}]` : "";
            return `${msg}${details}${hint}`;
        }
    }

    if (err instanceof Error && err.message) {
        return err.message;
    }

    try {
        const str = JSON.stringify(err);
        if (str && str !== "{}") return str;
    } catch {
        // Ignore JSON serialization errors
    }

    return fallback;
}
