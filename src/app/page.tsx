import Link from "next/link"
import { Store, ArrowRight, ShieldCheck, Zap, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 md:px-12 z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Bintang<span className="text-primary font-black">POS</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:flex font-medium">Bantuan</Button>
          </Link>
          <Link href="/login">
            <Button className="shadow-md font-semibold">
              Masuk Sistem
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 pt-20 pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistem BintangPOS Telah Aktif
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl text-foreground mb-6 leading-[1.1]">
          Kelola Bisnis Lebih Cerdas <br className="hidden md:block" /> 
          Dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">BintangPOS Premium</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Solusi terintegrasi untuk kasir, manajemen inventori, dan pelaporan finansial berbasis peran dengan keamanan tingkat tinggi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/store" className="w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg w-full shadow-xl shadow-primary/20 group bg-emerald-600 hover:bg-emerald-700">
              Belanja Sekarang
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50">
              Akses Kasir / Admin
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-32 text-left">
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 p-6 rounded-2xl">
            <Zap className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Penjualan Kilat</h3>
            <p className="text-muted-foreground">Mode Launchpad khusus kasir memastikan operasional antrean pelayanan berjalan sangat responsif dan bebas gangguan.</p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 p-6 rounded-2xl">
            <ShieldCheck className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Anti Phantom Sales</h3>
            <p className="text-muted-foreground">Validasi ketersediaan stok fisik real-time sebelum struk tercetak memastikan data gudang selalu sinkron secara otomatis.</p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 p-6 rounded-2xl">
            <LineChart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Laporan Analitik</h3>
            <p className="text-muted-foreground">Lacak performa kasir harian dan temukan tren pendapatan bisnis Anda dengan dashboard metrik berkelas tinggi.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-muted/10 text-center text-sm text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} BintangPOS Architecture. All rights reserved.</p>
      </footer>
    </div>
  )
}
