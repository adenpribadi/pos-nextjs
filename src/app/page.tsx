import Link from "next/link"
import {
  Store, ArrowRight, Star, Heart, Tag,
  ShoppingBag, MapPin, Smartphone, Coffee,
  UtensilsCrossed, Package, Truck
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-blue-50 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0"></div>

      {/* Navigation */}
      <nav className="sticky top-0 h-16 border-b border-blue-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Star className="w-5 h-5 fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Warung<span className="text-blue-600">Bintang</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#about" className="hover:text-blue-600 transition-colors">Tentang Kami</a>
          <a href="#products" className="hover:text-blue-600 transition-colors">Produk</a>
          <a href="#location" className="hover:text-blue-600 transition-colors">Lokasi</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 font-semibold">Login Staf</Button>
          </Link>
          <Link href="/store">
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 shadow-md font-bold px-5 rounded-lg transition-all">
              Belanja Online
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center z-10 pt-12 md:pt-20">
        <div className="px-6 text-center max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] uppercase font-bold tracking-wider text-blue-600 mb-6">
            Kebutuhan Harian Tetangga Terdekat
          </div>

          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-slate-900">
            Belanja Sembako <br />
            <span className="text-blue-600">Jadi Lebih Mudah.</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Sedia kebutuhan pokok, makanan ringan, dan minuman dingin untuk warga sekitar. Harga pas, stok selalu tersedia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/store" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-base w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">
                Lihat Katalog Produk
                <ShoppingBag className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#location" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full bg-white border-slate-200 text-slate-700 hover:bg-blue-50 rounded-xl font-bold">
                Cek Lokasi Toko
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Showcase Image */}
        <section className="relative w-full max-w-5xl px-6 mb-24">
          <div className="relative rounded-3xl border border-slate-200 overflow-hidden shadow-2xl bg-white">
            {/* Floating Info */}
            <div className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-xl hidden md:flex items-center gap-3 shadow-xl">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Status Stok</p>
                <p className="text-sm font-bold text-slate-900">Sembako Lengkap & Baru</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="about" className="w-full bg-white border-y border-slate-100 py-24 mb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Layanan Warung Bintang</h2>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">Fokus kami adalah menyediakan kebutuhan dasar untuk tetangga dengan pelayanan yang efisien.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                  <Tag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Harga Terjangkau</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Harga yang kami tawarkan kompetitif dan sesuai dengan budget harian keluarga Anda.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Produk Pilihan</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Menyediakan beras, telur, minyak, hingga aneka cemilan dan minuman dingin.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Dekat & Praktis</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">Berlokasi di tengah pemukiman agar Anda tidak perlu jauh-jauh mencari kebutuhan harian.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="products" className="max-w-5xl mx-auto px-6 mb-24 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Katalog Kebutuhan Tetangga</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Kami terus menambah pilihan produk untuk memudahkan Anda memenuhi kebutuhan dapur dan cemilan.</p>

              <ul className="space-y-4">
                {[
                  "Sembako (Beras, Minyak, Telur, Gula)",
                  "Bumbu Dapur & Bahan Masakan",
                  "Makanan Ringan & Snack Anak",
                  "Minuman Dingin & Kopi",
                  "Kebutuhan Mandi & Cuci"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/store">
                <Button variant="link" className="text-blue-600 font-bold p-0 h-auto text-base group">
                  Cek Harga Online <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="h-48 rounded-2xl bg-blue-100 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale-[0.2]" alt="Rice and grains" />
              </div>
              <div className="h-48 rounded-2xl bg-blue-100 overflow-hidden mt-6">
                <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale-[0.2]" alt="Snacks" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="location" className="w-full max-w-5xl px-6 mb-24">
          <div className="bg-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Mampir ke Warung Bintang</h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto font-medium">Buka setiap hari dari pagi hingga malam. Kami siap melayani kebutuhan Anda dan keluarga.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold">
                <MapPin className="mr-2 h-4 w-4" /> Petunjuk Lokasi
              </Button>
              <Link href="/store" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 w-full border-slate-700 text-white hover:bg-white/10 rounded-xl font-bold">
                  Pesan Online
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Warung Bintang</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <Link href="/login" className="hover:text-blue-600">Staff Access</Link>
          </div>

          <p className="text-xs text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} Warung Bintang.
          </p>
        </div>
      </footer>
    </div>
  )
}

