// Safe fetch + JSON parse for client components.

export async function apiJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, init);
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      return { ok: false, error: res.ok ? "Invalid server response." : `Server error (${res.status}).` };
    }
    if (!res.ok) {
      const err =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: unknown }).error)
          : `Request failed (${res.status}).`;
      return { ok: false, error: err };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Could not reach the server. Is the dev server running?" };
  }
}
