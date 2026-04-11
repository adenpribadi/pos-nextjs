import { Loader2, Store } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer Pulse */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 duration-1000"></div>
        
        {/* Inner Card */}
        <div className="relative p-6 bg-card border border-primary/20 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Store className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm font-bold tracking-widest text-foreground uppercase">Memuat Data</span>
             </div>
             <p className="text-[10px] text-muted-foreground animate-pulse font-medium">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
      
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  )
}
