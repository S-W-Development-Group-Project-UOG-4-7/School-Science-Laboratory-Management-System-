import { Role } from '@prisma/client'

export function requirePrincipal(role: Role | string | undefined) {
  if (!role) return false
  return role === Role.PRINCIPAL || role === 'PRINCIPAL'
}
