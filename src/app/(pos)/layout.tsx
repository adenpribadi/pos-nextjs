import { TopBar } from "./_components/topbar"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function POSLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "CUSTOMER") {
    redirect("/store")
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TopBar />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}
