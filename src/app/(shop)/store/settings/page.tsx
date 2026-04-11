"use client"

import { useSession } from "next-auth/react"
import { User, Shield, Bell, Moon, Laptop, Sun, Paintbrush, Mail, Lock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { useState } from "react"
import { toast } from "sonner"

export default function CustomerSettingsPage() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="animate-pulse">Menyiapkan pengaturan...</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Pengaturan Berhasil!", {
        description: "Perubahan profil Anda telah disimpan ke sistem.",
      })
    }, 1000)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">Pengaturan Akun</h1>
          <p className="text-muted-foreground text-lg">Kelola identitas, keamanan, dan pengalaman visual Anda.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card w-full sm:w-auto border-border/50 shadow-sm p-1 grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2 hidden sm:inline" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2 hidden sm:inline" />
              Keamanan
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Paintbrush className="w-4 h-4 mr-2 hidden sm:inline" />
              Tampilan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle>Identitas Pelanggan</CardTitle>
                <CardDescription>Informasi ini akan muncul pada data pesanan dan profil Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/50">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase border-4 border-primary/10 group overflow-hidden relative">
                    {session?.user?.name ? session.user.name.substring(0, 2) : "C"}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold">{session?.user?.name || "Pelanggan"}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase">
                        Terverifikasi
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Nama Lengkap</Label>
                    <Input id="name" defaultValue={session?.user?.name || ""} className="bg-background/50 h-11" placeholder="Masukkan nama Anda" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email (Login)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" defaultValue={session?.user?.email || ""} className="pl-10 bg-muted/50 h-11" disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 animate-in fade-in-50 slide-in-from-right-5 duration-300">
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle>Keamanan Akun</CardTitle>
                <CardDescription>Gunakan kata sandi yang kuat untuk menjaga data belanja Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current" className="text-xs font-bold uppercase text-muted-foreground">Kata Sandi Saat Ini</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input id="current" type="password" placeholder="••••••••" className="pl-10 bg-background/50 h-11" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new" className="text-xs font-bold uppercase text-muted-foreground">Kata Sandi Baru</Label>
                      <Input id="new" type="password" placeholder="Minimal 8 karakter" className="bg-background/50 h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-xs font-bold uppercase text-muted-foreground">Konfirmasi Kata Sandi</Label>
                      <Input id="confirm" type="password" placeholder="Ulangi kata sandi baru" className="bg-background/50 h-11" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Autentikasi Aman</h4>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Sesi Anda sedang dilindungi oleh enkripsi standar industri.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                <Button>Perbarui Kata Sandi</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 animate-in fade-in-50 slide-in-from-left-5 duration-300">
            <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle>Tema Aplikasi</CardTitle>
                <CardDescription>Pilih suasana belanja yang paling nyaman untuk Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`group relative h-40 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all overflow-hidden ${theme === 'dark' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'}`}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                      <Moon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Mode Gelap</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Elegan & Hemat Baterai</p>
                    </div>
                    {theme === 'dark' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                  </button>

                  <button 
                    onClick={() => setTheme("light")}
                    className={`group relative h-40 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all overflow-hidden ${theme === 'light' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'}`}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                      <Sun className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Mode Terang</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Klasik & Tajam</p>
                    </div>
                    {theme === 'light' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                  </button>

                  <button 
                    onClick={() => setTheme("system")}
                    className={`group relative h-40 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all overflow-hidden ${theme === 'system' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'}`}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${theme === 'system' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                      <Laptop className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Otomatis</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Ikuti Sistem Perangkat</p>
                    </div>
                    {theme === 'system' && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-destructive/5 p-6 rounded-2xl border border-destructive/20 mt-12 mb-20">
          <h4 className="font-bold text-sm text-destructive mb-1">Area Berbahaya</h4>
          <p className="text-xs text-muted-foreground mb-4">Setelah Anda menghapus akun, data belanja dan riwayat Anda tidak dapat dikembalikan. Mohon berhati-hati.</p>
          <Button variant="destructive" size="sm">Hapus Akun Saya</Button>
        </div>
      </div>
    </div>
  )
}
