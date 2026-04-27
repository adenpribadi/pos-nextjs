import Link from "next/link"
import {
  Store, ArrowRight, Star, Heart, Tag,
  ShoppingBag, MapPin, Smartphone, Coffee,
  UtensilsCrossed, Package, Truck,
  ChevronRight, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[1000px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[150px] pointer-events-none hidden md:block"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[150px] pointer-events-none hidden md:block"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* Premium Navigation */}
      <nav className="sticky top-0 h-16 md:h-20 border-b border-white/20 bg-white/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-12 z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Star className="w-4 h-4 md:w-5 md:h-5 fill-white" />
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-tight text-slate-900">
            Warung<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Bintang</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-600">
          <a href="#about" className="hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all hover:after:w-full">Tentang Kami</a>
          <a href="#products" className="hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all hover:after:w-full">Katalog</a>
          <a href="#location" className="hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all hover:after:w-full">Lokasi</a>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/store">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 font-bold px-4 md:px-6 h-9 md:h-11 text-xs md:text-sm rounded-lg md:rounded-xl transition-all duration-300 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Belanja Online
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center z-10 pt-10 md:pt-16">
        <div className="px-4 md:px-6 text-center max-w-4xl mb-12 md:mb-16 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 md:w-40 md:h-40 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>

          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100 shadow-sm text-[10px] md:text-xs font-bold tracking-widest text-blue-600 mb-6 md:mb-8 transform transition-transform hover:scale-105 cursor-default">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />
            KEBUTUHAN HARIAN TERDEKAT
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 leading-[1.15] md:leading-[1.1] text-slate-900 drop-shadow-sm">
            Belanja Sembako <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-gradient bg-[length:200%_auto]">
              Jadi Lebih Mudah.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium px-2">
            Sedia kebutuhan pokok, makanan ringan, dan minuman dingin untuk warga sekitar. Harga transparan, stok selalu baru dan lengkap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full px-4 sm:px-0">
            <Link href="/store" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl md:rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                Lihat Katalog Produk
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <a href="#location" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-sm md:text-base w-full bg-white/50 backdrop-blur-md border-2 border-slate-200 text-slate-700 hover:bg-white hover:border-blue-200 hover:text-blue-700 rounded-xl md:rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1">
                Cek Lokasi Toko
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Showcase Images with Glassmorphism */}
        <section className="relative w-full max-w-6xl px-4 md:px-6 mb-16 md:mb-24">
          <div className="relative rounded-3xl md:rounded-[2.5rem] border border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] bg-white/60 backdrop-blur-2xl p-3 md:p-6 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-3xl md:rounded-[2.5rem] z-0 pointer-events-none"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 relative z-10">
              <div className="h-48 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl bg-slate-100 overflow-hidden relative group-hover:shadow-lg transition-all duration-500">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Sembako" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                  <p className="font-bold text-base md:text-lg">Bahan Pokok</p>
                  <p className="text-xs md:text-sm text-white/80 font-medium">Beras & Minyak</p>
                </div>
              </div>
              <div className="h-48 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl bg-slate-100 overflow-hidden relative group-hover:shadow-lg transition-all duration-500">
                <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Snack" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                  <p className="font-bold text-base md:text-lg">Cemilan Sore</p>
                  <p className="text-xs md:text-sm text-white/80 font-medium">Aneka Rasa</p>
                </div>
              </div>
              <div className="h-48 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl bg-slate-100 overflow-hidden relative group-hover:shadow-lg transition-all duration-500 sm:col-span-2 md:col-span-1">
                <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Minuman" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                  <p className="font-bold text-base md:text-lg">Minuman Segar</p>
                  <p className="text-xs md:text-sm text-white/80 font-medium">Dingin & Manis</p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute z-20 -bottom-5 right-6 md:-bottom-6 md:right-12 p-4 md:p-5 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl flex items-center gap-3 md:gap-4 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] md:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Status Toko</p>
                <p className="text-sm md:text-base font-bold text-slate-900">Buka & Stok Penuh</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="about" className="w-full py-16 md:py-24 mb-10 relative">
          <div className="absolute inset-0 bg-white border-y border-slate-100 skew-y-[-2deg] z-0"></div>
          <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-12 md:mb-20 space-y-3 md:space-y-4 px-2">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Layanan Kami</h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">Berbelanja harian tak pernah semudah ini. Kami hadir lebih dekat dengan pelayanan sepenuh hati.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: Tag, title: "Harga Kompetitif", desc: "Harga sangat bersahabat dan sesuai dengan budget dapur keluarga Anda." },
                { icon: UtensilsCrossed, title: "Produk Lengkap", desc: "Beras, telur, minyak, bumbu dapur, hingga jajanan anak semua ada." },
                { icon: Truck, title: "Dekat & Praktis", desc: "Berlokasi persis di tengah pemukiman agar mudah dijangkau kapan saja." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 md:p-10 rounded-3xl md:rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 md:hover:-translate-y-2 group">
                  <div className="h-14 w-14 md:h-16 md:w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <feature.icon className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="location" className="w-full max-w-5xl px-4 md:px-6 mb-20 md:mb-32 mt-10 md:mt-20">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-slate-900/30 border border-slate-800">
            {/* Glow effects inside CTA */}
            <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-blue-600/20 blur-[60px] md:blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 md:w-80 h-64 md:h-80 bg-indigo-600/20 blur-[60px] md:blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 text-white tracking-tight leading-tight">Mampir ke Warung Bintang</h2>
              <p className="text-slate-300 text-base md:text-xl mb-10 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Buka setiap hari dari pagi hingga malam. Kami siap melayani kebutuhan Anda dan keluarga dengan ramah.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-5">
                <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-500 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105">
                  <MapPin className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Petunjuk Lokasi
                </Button>
                <Link href="/store" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 w-full bg-transparent border-2 border-slate-600 text-white hover:bg-white hover:text-slate-900 hover:border-white rounded-xl md:rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg">
                    Pesan Online
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Premium Footer */}
      <footer className="bg-slate-950 text-slate-300 py-16 md:py-24 px-6 md:px-12 relative overflow-hidden border-t border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
          {/* Brand Col */}
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Star className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">Warung<span className="text-blue-500">Bintang</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Sahabat terbaik dapur Anda. Menyediakan bahan pokok dan cemilan segar untuk warga sekitar dengan harga terjangkau.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all duration-300 hover:scale-110">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white font-bold text-xs transition-all duration-300 hover:scale-110">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white font-bold text-xs transition-all duration-300 hover:scale-110">
                X
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Pintasan</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#about" className="hover:text-blue-400 transition-colors inline-block">Tentang Kami</a></li>
              <li><a href="#products" className="hover:text-blue-400 transition-colors inline-block">Katalog Produk</a></li>
              <li><Link href="/store" className="hover:text-blue-400 transition-colors inline-block text-blue-400">Belanja Online</Link></li>
              <li><a href="#location" className="hover:text-blue-400 transition-colors inline-block">Lokasi Toko</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Dukungan</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-blue-400 transition-colors inline-block">Cara Pemesanan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors inline-block">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors inline-block">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>PMI2 - Jl. Selayar Raya Blok N10, Jawa Barat, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Smartphone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>0822-1694-1828</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} Warung Bintang. All rights reserved.</p>
          <p>Didesain untuk melayani dengan sepenuh hati ❤️</p>
        </div>
      </footer>
    </div>
  )
}

