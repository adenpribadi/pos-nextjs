import { useSession } from "next-auth/react"

export type Role = "ADMIN" | "MANAGER" | "CASHIER"

export function usePermissions() {
  const { data: session, status } = useSession()
  
  const role = session?.user?.role as Role | undefined
  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  // Hierarki:
  // ADMIN bisa semuanya.
  // MANAGER bisa fitur-fitur ERP & laporannya, juga kasir (tergantung).
  // CASHIER hanya fitur POS.

  const canAccessAdminDashboard = role === "ADMIN"
  const canAccessManagerDashboard = role === "ADMIN" || role === "MANAGER"
  const canAccessPOS = role === "ADMIN" || role === "MANAGER" || role === "CASHIER"

  const canManageUsers = role === "ADMIN"
  const canManageProducts = role === "ADMIN" || role === "MANAGER"
  
  return {
    role,
    isAuthenticated,
    isLoading,
    canAccessAdminDashboard,
    canAccessManagerDashboard,
    canAccessPOS,
    canManageUsers,
    canManageProducts,
  }
}
