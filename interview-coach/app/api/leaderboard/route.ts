import { NextResponse } from "next/server";
import { listLeaderboard, listRoles } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roleIdRaw = searchParams.get("roleId");
  const roleId = roleIdRaw ? Number(roleIdRaw) : undefined;
  const filterRoleId = roleId && roleId > 0 ? roleId : undefined;

  return NextResponse.json({
    roles: await listRoles(),
    entries: await listLeaderboard(filterRoleId),
    roleId: filterRoleId ?? null,
  });
}
