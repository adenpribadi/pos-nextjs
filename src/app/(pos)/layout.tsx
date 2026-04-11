import { ReactNode } from "react"
import { TopBar } from "./_components/topbar"

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TopBar />
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}
