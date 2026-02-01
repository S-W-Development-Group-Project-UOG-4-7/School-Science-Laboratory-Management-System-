import { Role } from "@prisma/client";

export function requireDeputyPrincipal(role: Role | string | undefined) {
  if (!role) return false;

  return (
    role === Role.DEPUTY_PRINCIPAL ||
    role === "DEPUTY_PRINCIPAL" ||
    role === "deputy-principal"
  );
}