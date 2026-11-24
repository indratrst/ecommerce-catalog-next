import { cookies } from "next/headers";

export type UserRole = "SUPERUSER" | "ADMIN" | "USER";

export interface SessionPayload {
  userId?: string;
  email?: string;
  role: UserRole;
  name?: string;
  exp?: number;
}

const ALLOWED_ADMIN_ROLES: UserRole[] = ["SUPERUSER", "ADMIN"];

function decodeJwtPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonPayload);

    if (parsed.exp && Date.now() >= parsed.exp * 1000) {
      return null;
    }

    const normalizedRole = String(parsed.role || "").toUpperCase() as UserRole;

    return {
      userId: parsed.user_id || parsed.sub || parsed.id,
      email: parsed.email,
      role: normalizedRole,
      name: parsed.name || "Administrator",
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const session = decodeJwtPayload(token);
  if (!session) return null;

  if (!ALLOWED_ADMIN_ROLES.includes(session.role)) {
    return null;
  }

  return session;
}