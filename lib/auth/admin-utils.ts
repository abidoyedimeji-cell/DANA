/** Admin role constants and type guard. Not a server action – safe to use anywhere. */

export const ADMIN_ROLES = ["super_admin", "admin"] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return role === "super_admin" || role === "admin"
}
