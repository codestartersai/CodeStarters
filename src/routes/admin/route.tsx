import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/codestarters/AdminSidebar";
import { getSupabase } from "@/lib/supabase/browser";
import { createContext, useContext, useEffect, useState } from "react";
import type { AdminUser, AdminPermission } from "@/lib/admin-auth";
import { hasPermission } from "@/lib/admin-auth";

export type AdminSessionContextType = {
    admin: AdminUser | null;
    isLoading: boolean;
    can: (permission: AdminPermission) => boolean;
};

const AdminSessionContext = createContext<AdminSessionContextType>({
    admin: null,
    isLoading: true,
    can: () => false,
});

export function useAdminSession() {
    return useContext(AdminSessionContext);
}

export const Route = createFileRoute("/admin")({
    beforeLoad: async ({ location }) => {
        if (
            location.pathname === "/admin/login" ||
            location.pathname === "/admin/setup" ||
            location.pathname.startsWith("/admin/auth")
        ) {
            return;
        }
        if (typeof window === "undefined") return;

        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw redirect({ to: "/admin/login" });
        }

        const { data: adminRow } = await supabase
            .from("admin_users")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (!adminRow) {
            // Also check if they can be verified / bootstrap
            const res = await fetch("/api/admin/auth-verify", { method: "POST" });
            const verifyData = await res.json().catch(() => ({}));
            if (!verifyData.authorized) {
                await supabase.auth.signOut();
                throw redirect({ to: "/admin/login" });
            }
        }
    },
    component: AdminLayout,
});

function AdminLayout() {
    const location = useLocation();
    const isAuthPage =
        location.pathname === "/admin/login" ||
        location.pathname === "/admin/setup" ||
        location.pathname.startsWith("/admin/auth");

    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(!isAuthPage);

    useEffect(() => {
        if (isAuthPage) return;

        let isMounted = true;
        async function fetchProfile() {
            try {
                const supabase = getSupabase();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: row } = await supabase
                    .from("admin_users")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                if (row && isMounted) {
                    setAdmin(row as AdminUser);
                } else if (isMounted) {
                    // Try verifying via auth-verify (handles first user bootstrap or invite token in session)
                    const inviteToken = typeof window !== "undefined"
                        ? window.sessionStorage.getItem("cs_invite_token") || undefined
                        : undefined;

                    const res = await fetch("/api/admin/auth-verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ inviteToken }),
                    });
                    const verifyData = await res.json().catch(() => ({}));

                    if (verifyData.authorized && verifyData.admin) {
                        setAdmin(verifyData.admin as AdminUser);
                    } else {
                        // Access denied - clear session and redirect to login
                        await supabase.auth.signOut();
                        if (typeof window !== "undefined") {
                            window.location.href = "/admin/login?error=" + encodeURIComponent(verifyData.error || "Access Denied: You have not been invited to this admin portal.");
                        }
                    }
                }
            } catch (err) {
                console.error("Admin layout profile fetch error:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        void fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [isAuthPage]);

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Outlet />
            </div>
        );
    }

    const can = (permission: AdminPermission) => {
        if (!admin) return false;
        return hasPermission(admin.permissions, permission);
    };

    return (
        <AdminSessionContext.Provider value={{ admin, isLoading, can }}>
            <div className="min-h-screen bg-slate-50 flex">
                <AdminSidebar />
                <main className="flex-1 lg:ml-72 min-h-screen">
                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </AdminSessionContext.Provider>
    );
}
