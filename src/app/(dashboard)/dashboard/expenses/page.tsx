import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getExpenses, getExpenseCategories } from "@/app/actions/expense"
import { ExpensesClient } from "./_components/expenses-client"

export const dynamic = "force-dynamic"

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const { data: expenses, error } = await getExpenses()
  const { data: categories } = await getExpenseCategories()

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  // Serialize decimals for client component
  const serializedExpenses = (expenses || []).map((exp: any) => ({
    ...exp,
    amount: Number(exp.amount),
    date: exp.date.toISOString(),
    createdAt: exp.createdAt.toISOString(),
  }))

  return (
    <div className="flex-1 space-y-6">
      <div className="relative pb-6 border-b border-border/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none flex items-center gap-3">
              BIAYA <span className="text-red-500 font-light italic">Operasional</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="h-[1px] w-8 bg-red-500/40" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Pencatatan pengeluaran harian toko</p>
            </div>
          </div>
        </div>
      </div>

      <ExpensesClient 
        initialExpenses={serializedExpenses} 
        categories={categories || []}
        userRole={session.user.role as string}
      />
    </div>
  )
}
