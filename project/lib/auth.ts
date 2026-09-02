export type Role = "citizen" | "bank" | "officer"

export const ROLE_COOKIE = "prthvi_role"

export const ROLE_LABELS: Record<Role, string> = {
  citizen: "Citizen / Buyer",
  bank: "Bank Officer",
  officer: "Land Revenue Officer",
}

export const ROLES: Role[] = ["citizen", "bank", "officer"]

export function canViewFraudDetails(role: Role | null): boolean {
  return role === "bank" || role === "officer"
}

export function isRole(value: string | undefined): value is Role {
  return value === "citizen" || value === "bank" || value === "officer"
}
