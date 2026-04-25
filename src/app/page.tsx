import Link from "next/link"
import { 
  Store, ArrowRight, ShieldCheck, Zap, LineChart, 
  Ticket, CreditCard, Star, Users, CheckCircle2,
  Package, Smartphone, LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[1000px] bg-gradient-to-b from-blue-50 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[160px] opacity-60 pointer-events-none animate-pulse"></div>
      <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[140px] opacity-40 pointer-events-none"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>

      {/* Navigation */}
      <nav className="sticky top-0 h-20 border-b border-slate-100 bg-white/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-12 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
            <Store className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">Bintang<span className="text-blue-600 italic">POS</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Fitur</a>
          <a href="#showcase" className="hover:text-blue-600 transition-colors">Showcase</a>
          <a href="#stats" className="hover:text-blue-600 transition-colors">Statistik</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-500 hover:text-blue-600 font-bold hover:bg-blue-50">Bantuan</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-black px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Akses Sistem
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center z-10 pt-20">
        <div className="px-6 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] uppercase font-black tracking-[0.2em] text-blue-600 mb-10 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
            V2.0 PRO • Enterprise Ready
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] [text-wrap:balance] text-slate-900">
            Kelola Bisnis <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500">Jauh Lebih Cerdas.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Solusi <span className="text-blue-600 font-bold">Point of Sale</span> yang dirancang untuk kecepatan transaksi, otomasi inventori, dan analitik mendalam untuk pertumbuhan bisnis Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <Link href="/store" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 px-10 text-lg w-full shadow-2xl shadow-blue-600/20 group bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black">
                Coba Demo Toko
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-black shadow-sm">
                Kelola Warung
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Showcase Image */}
        <section id="showcase" className="relative w-full max-w-6xl px-6 mb-32 group">
          <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] bg-white ring-8 ring-slate-50/50">
             <img 
               src="/pos_dashboard_light_mockup_1777084514573.png" 
               alt="POS Dashboard Mockup" 
               className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-700"
             />
             {/* Floating UI Badges */}
             <div className="absolute top-10 left-10 p-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl hidden md:flex items-center gap-3 shadow-2xl animate-bounce">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                   <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400">Kecepatan Transaksi</p>
                   <p className="text-sm font-black text-slate-900">0.3s Konfirmasi</p>
                </div>
             </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="w-full bg-slate-50 border-y border-slate-100 py-16 mb-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-blue-600">99.9%</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Uptime Server</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-slate-900">1.2jt+</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Produk Terjual</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-slate-900">150+</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Cabang Aktif</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-emerald-600">4.9/5</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Rating Pengguna</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Features Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-32">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">Dirancang Untuk <span className="text-blue-600">Efisien</span>.</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">Sistem kami dibangun untuk mempermudah operasional harian Anda tanpa ribet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Kilat & Responsif</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Mode POS yang dioptimalkan untuk kasir sibuk. Pencarian produk instan dan scan barcode tanpa hambatan.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Smart Promo Engine</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Atur diskon persentase, nominal tetap, hingga batasan penggunaan per pelanggan secara otomatis.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-emerald-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <LineChart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Analitik Real-time</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Pantau laporan laba rugi, performa kasir, dan stok kritis langsung dari dashboard Anda.</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-purple-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-purple-500/5">
              <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Self-Checkout Store</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Berikan kemudahan pelanggan untuk memesan langsung via smartphone mereka sendiri.</p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-amber-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-amber-500/5">
              <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Multi-Payment Ready</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Dukungan pembayaran Tunai, Transfer Bank (dengan QRIS preview), hingga Kartu Kredit.</p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-pink-200 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-xl hover:shadow-pink-500/5">
              <div className="h-14 w-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900">Role Management</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Akses dashboard yang berbeda untuk Admin, Manager, Kasir, dan Pelanggan.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-6xl px-6 mb-32">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-[60px] rounded-full -translate-x-10 translate-y-10"></div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">Siap Memajukan <br className="hidden md:block" />Bisnis Anda?</h2>
            <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">Gabung bersama ratusan pemilik usaha yang telah meningkatkan omzet mereka dengan BintangPOS Premium.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="h-16 px-12 text-lg w-full bg-white text-blue-600 hover:bg-slate-100 rounded-2xl font-black shadow-xl transition-all hover:scale-[1.05]">
                  Daftar Sekarang
                </Button>
              </Link>
              <Link href="/store" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-16 px-12 text-lg w-full border-white/20 text-white hover:bg-white/10 rounded-2xl font-black backdrop-blur-md">
                  Lihat Toko Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white z-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
             </div>
             <span className="font-black text-xl tracking-tighter text-slate-900">Bintang<span className="text-blue-600 italic">POS</span></span>
          </div>
          
          <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
             <a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a>
             <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Kontak Kami</a>
          </div>

          <p className="text-xs text-slate-400 font-bold tracking-tight">
            &copy; {new Date().getFullYear()} WarungBintang Premium Architecture.
          </p>
        </div>
      </footer>
    </div>
  )
}
