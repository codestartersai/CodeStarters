export type AdminPermission =
    | "all"
    | "manage_team"
    | "manage_requests"
    | "manage_applications"
    | "manage_scanners"
    | "manage_admins";

export type AdminRole = "super_admin" | "editor" | "viewer" | "custom";

export type AdminUser = {
    id: string;
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    role: AdminRole;
    permissions: AdminPermission[];
    created_at?: string;
    updated_at?: string;
};

export type AdminInvite = {
    id: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermission[];
    token: string;
    used: boolean;
    invited_by?: string | null;
    created_at: string;
    expires_at: string;
};

export const AVAILABLE_PERMISSIONS: { id: AdminPermission; label: string; description: string }[] = [
    {
        id: "manage_team",
        label: "Team & Tabs Manager",
        description: "Add/edit team tabs (like Robotics team) and manage members & photos",
    },
    {
        id: "manage_requests",
        label: "Website Requests",
        description: "View and respond to website creation requests from businesses",
    },
    {
        id: "manage_applications",
        label: "Volunteer Applications",
        description: "Review and approve/reject volunteer and mentor applications",
    },
    {
        id: "manage_scanners",
        label: "Event & Summer Scanners",
        description: "Access QR scanner and summer check-in tools",
    },
    {
        id: "manage_admins",
        label: "Manage Admins & Invites",
        description: "Invite new team members via Google SSO and configure email connector",
    },
];

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    super_admin: ["all"],
    editor: ["manage_team", "manage_requests", "manage_applications"],
    viewer: ["manage_requests"],
    custom: ["manage_team"],
};

export function hasPermission(
    userPermissions: AdminPermission[] | null | undefined,
    required: AdminPermission
): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) return false;
    if (userPermissions.includes("all")) return true;
    return userPermissions.includes(required);
}
