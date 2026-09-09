import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/setup")({
    beforeLoad: () => {
        // Secure redirect: the first person to sign in at /admin/login is automatically made Super Admin
        throw redirect({ to: "/admin/login" });
    },
    component: () => null,
});
