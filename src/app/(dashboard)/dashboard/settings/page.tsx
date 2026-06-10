"use client"

import { useSession } from "next-auth/react"
import { Store, User, Shield, Paintbrush, Moon, Laptop, Sun, Percent, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { UserManagementClient } from "./_components/user-management-client"
import { getUsers } from "@/app/actions/user"
import { getStoreSettings, saveStoreSettings } from "@/app/actions/settings"
import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [settings, setSettings] = useState({
    storeName: "WarungBintang",
    address: "",
    phone: "",
    taxEnabled: true,
    taxRate: 11,
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    isOnline: true,
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const isAdmin = session?.user?.role === "ADMIN"
  const canManageStore = isAdmin || session?.user?.role === "MANAGER"

  useEffect(() => {
    if (isAdmin) {
      setIsLoadingUsers(true)
      getUsers().then(data => {
        setUsers(data as any)
        setIsLoadingUsers(false)
      })
    }
  }, [isAdmin])

  useEffect(() => {
    if (canManageStore) {
      getStoreSettings().then(s => {
        setSettings({
          storeName: s.storeName,
          address: s.address || "",
          phone: s.phone || "",
          taxEnabled: s.taxEnabled,
          taxRate: Math.round(s.taxRate * 100),
          bankName: s.bankName || "",
          bankAccountNumber: s.bankAccountNumber || "",
          bankAccountName: s.bankAccountName || "",
          isOnline: s.isOnline ?? true,
        })
        setIsLoadingSettings(false)
      })
    }
  }, [canManageStore])

  const handleSaveStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("taxEnabled", String(settings.taxEnabled))
    formData.set("taxRate", String(settings.taxRate))
    formData.set("isOnline", String(settings.isOnline))

    startTransition(async () => {
      const res = await saveStoreSettings(formData)
      if (res.success) {
        toast.success("Pengaturan Tersimpan", {
          description: "Konfigurasi toko berhasil diperbarui."
        })
      } else {
        toast.error("Gagal Menyimpan", { description: res.error })
      }
    })
  }

  if (status === "loading") {
    return <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground animate-pulse">Memuat pengaturan...</div>
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="relative pb-6 border-b border-border/40 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none flex items-center gap-3">
            PENGATURAN <span className="text-primary font-light italic">Sistem</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-[1px] w-8 bg-primary/40" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black">Konfigurasi & Manajemen Aset Digital</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/40 border border-border/40 p-1.5 rounded-2xl h-auto gap-1 w-max sm:w-auto inline-flex">
            <TabsTrigger value="profile" className="rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <User className="w-3.5 h-3.5 mr-2" />
              Profil
            </TabsTrigger>
            {canManageStore && (
              <TabsTrigger value="store" className="rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
                <Store className="w-3.5 h-3.5 mr-2" />
                Toko
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="users" className="rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
                <Shield className="w-3.5 h-3.5 mr-2" />
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="appearance" className="rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all">
              <Paintbrush className="w-3.5 h-3.5 mr-2" />
              Tema
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profil Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
              <CardTitle className="text-xl font-black tracking-tight">Akun Pengguna</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Personal account identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 border-b border-border/40">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-2xl uppercase shadow-sm border border-primary/20 shrink-0">
                  {session?.user?.name ? session.user.name.substring(0, 2) : "AD"}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-black tracking-tighter">{session?.user?.name || "Administrator"}</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <p className="text-sm text-muted-foreground font-medium">{session?.user?.email}</p>
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1">
                      {session?.user?.role || "ADMIN"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input key={session?.user?.email + "name"} id="name" defaultValue={session?.user?.name || ""} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input key={session?.user?.email + "email"} id="email" defaultValue={session?.user?.email || ""} className="bg-background/50" disabled />
                  <p className="text-xs text-muted-foreground">Email digunakan untuk otentikasi login, hubungi pihak IT untuk mengubah.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/40 py-4 flex justify-end px-6">
              <Button className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-8 rounded-xl h-11 transition-all active:scale-95">Simpan Profil</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Informasi Toko + PPN Tab */}
        {canManageStore && (
          <TabsContent value="store" className="space-y-4">
            <form onSubmit={handleSaveStore} className="space-y-4">
              {/* Identitas Toko */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
                  <CardTitle className="text-xl font-black tracking-tight">Identitas Toko</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Store identity & branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat pengaturan toko...</div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="storeName">Nama Toko / Outlet</Label>
                          <Input
                            id="storeName" name="storeName"
                            value={settings.storeName}
                            onChange={e => setSettings(s => ({ ...s, storeName: e.target.value }))}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon Toko</Label>
                          <Input
                            id="phone" name="phone"
                            value={settings.phone}
                            onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
                            placeholder="021-xxxxxxx"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Alamat (Tercetak di Struk)</Label>
                        <Input
                          id="address" name="address"
                          value={settings.address}
                          onChange={e => setSettings(s => ({ ...s, address: e.target.value }))}
                          placeholder="Jalan Sudirman Kav 24, Jakarta Pusat"
                          className="bg-background/50"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/40 py-4 flex justify-end px-6">
                  <Button type="submit" disabled={isPending || isLoadingSettings} className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-8 rounded-xl h-11 transition-all active:scale-95">
                    {isPending ? "Menyimpan..." : "Simpan Info Toko"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Status Toko (Online / Offline) */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-black/20">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight">Status Toko</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Store operational status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 p-4 sm:p-6">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat status toko...</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/50 shadow-sm">
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="font-black text-[10px] sm:text-sm uppercase tracking-wider">Toko Aktif</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            Matikan ini jika toko sedang tutup agar pelanggan tidak dapat memesan.
                          </p>
                        </div>
                        <Switch
                          checked={settings.isOnline ?? true}
                          onCheckedChange={val => setSettings(s => ({ ...s, isOnline: val }))}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>

                      <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 ${settings.isOnline ? "bg-primary/5 border-primary/20" : "bg-red-500/10 border-red-500/20 opacity-90"}`}>
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${settings.isOnline ? "bg-primary animate-pulse" : "bg-red-500"}`}></div>
                        <p className={`text-xs font-black uppercase tracking-widest ${settings.isOnline ? "text-primary" : "text-red-500"}`}>
                          {settings.isOnline
                            ? "TOKO ONLINE — Pelanggan dapat memesan dari katalog."
                            : "TOKO OFFLINE — Katalog disembunyikan."}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/40 py-4 flex justify-end px-6">
                  <Button type="submit" disabled={isPending || isLoadingSettings} className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-8 rounded-xl h-11 transition-all active:scale-95">
                    {isPending ? "Menyimpan..." : "Update Status Toko"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pengaturan Pajak (PPN) */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-black/20">
                      <Percent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight">Konfigurasi Pajak (PPN)</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Tax & fiscal regulation settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6 p-4 sm:p-6">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat pengaturan pajak...</div>
                  ) : (
                    <>
                      {/* Toggle PPN */}
                      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-border/40 bg-background/50 shadow-sm">
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="font-black text-[10px] sm:text-sm uppercase tracking-wider">Status Perpajakan</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                            Kalkulasi PPN otomatis pada transaksi.
                          </p>
                        </div>
                        <Switch
                          checked={settings.taxEnabled}
                          onCheckedChange={val => setSettings(s => ({ ...s, taxEnabled: val }))}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>

                      {/* Status Banner */}
                      <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 ${settings.taxEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40 opacity-50"}`}>
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${settings.taxEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`}></div>
                        <p className={`text-xs font-black uppercase tracking-widest ${settings.taxEnabled ? "text-primary" : "text-muted-foreground"}`}>
                          {settings.taxEnabled
                            ? `PPN AKTIF — Tarif saat ini: ${settings.taxRate}%`
                            : "PPN NONAKTIF — Transaksi Netto"}
                        </p>
                      </div>

                      {/* Tarif PPN (hanya muncul jika aktif) */}
                      {settings.taxEnabled && (
                        <div className="space-y-3">
                          <Label htmlFor="taxRate" className="font-bold">Tarif PPN (%)</Label>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Input
                              id="taxRate"
                              type="number"
                              min={0} max={100} step={0.5}
                              value={settings.taxRate}
                              onChange={e => setSettings(s => ({ ...s, taxRate: parseFloat(e.target.value) || 0 }))}
                              className="bg-background/50 max-w-[120px] text-center text-lg font-black"
                            />
                            <span className="text-muted-foreground font-bold text-lg">%</span>
                            <div className="flex gap-2">
                              {[5, 10, 11, 12].map(rate => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => setSettings(s => ({ ...s, taxRate: rate }))}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${settings.taxRate === rate ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:bg-primary/10 hover:border-primary/30"}`}
                                >
                                  {rate}%
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tarif PPN standar Indonesia: <strong>11%</strong> (April 2022) / <strong>12%</strong> (2025).
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/40 py-4 flex justify-end px-6">
                  <Button type="submit" disabled={isPending || isLoadingSettings} className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-8 rounded-xl h-11 transition-all active:scale-95">
                    {isPending ? "Menyimpan..." : "Update Konfigurasi Pajak"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Konfigurasi Bank Transfer */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-black/20">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight">Rekening Pembayaran</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Bank transfer details for customers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 p-4 sm:p-6">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat konfigurasi bank...</div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Nama Bank</Label>
                          <Input
                            id="bankName" name="bankName"
                            value={settings.bankName}
                            onChange={e => setSettings(s => ({ ...s, bankName: e.target.value }))}
                            placeholder="Contoh: BCA, Mandiri, BRI"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bankAccountNumber">Nomor Rekening</Label>
                          <Input
                            id="bankAccountNumber" name="bankAccountNumber"
                            value={settings.bankAccountNumber}
                            onChange={e => setSettings(s => ({ ...s, bankAccountNumber: e.target.value }))}
                            placeholder="1234567890"
                            className="bg-background/50 font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountName">Nama Pemilik Rekening</Label>
                        <Input
                          id="bankAccountName" name="bankAccountName"
                          value={settings.bankAccountName}
                          onChange={e => setSettings(s => ({ ...s, bankAccountName: e.target.value }))}
                          placeholder="Nama sesuai buku rekening"
                          className="bg-background/50"
                        />
                      </div>
                      {settings.bankName && settings.bankAccountNumber && (
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Preview Info Transfer</p>
                          <p className="text-sm font-bold">{settings.bankName}</p>
                          <p className="font-mono font-black text-lg tracking-widest">{settings.bankAccountNumber}</p>
                          <p className="text-xs text-muted-foreground">a.n. {settings.bankAccountName || "—"}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/40 py-4 flex justify-end px-6">
                  <Button type="submit" disabled={isPending || isLoadingSettings} className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold px-8 rounded-xl h-11 transition-all active:scale-95">
                    {isPending ? "Menyimpan..." : "Simpan Rekening"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        )}

        {/* User Management Tab */}
        {isAdmin && (
          <TabsContent value="users" className="space-y-4">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">Memuat data user...</div>
            ) : (
              <UserManagementClient initialUsers={users} />
            )}
          </TabsContent>
        )}

        {/* Tampilan Tab */}
        <TabsContent value="appearance">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-border/40 pb-6 bg-muted/20">
              <CardTitle className="text-xl font-black tracking-tight">Personalisasi Tema</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">Appearance & visual experience</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 p-4 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                <button 
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "h-28 sm:h-32 flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-border/40 bg-background/50 hover:bg-muted/50'
                  )}
                >
                  <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all", theme === 'dark' ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground')}>
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className={cn("text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]", theme === 'dark' ? 'text-primary' : 'text-muted-foreground')}>Dark Mode</span>
                  {theme === 'dark' && <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-bl-xl flex items-center justify-center"><div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white animate-pulse" /></div>}
                </button>

                <button 
                  onClick={() => setTheme("light")}
                  className={cn(
                    "h-28 sm:h-32 flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                    theme === 'light' 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-border/40 bg-background/50 hover:bg-muted/50'
                  )}
                >
                  <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all", theme === 'light' ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground')}>
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className={cn("text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]", theme === 'light' ? 'text-primary' : 'text-muted-foreground')}>Light Mode</span>
                  {theme === 'light' && <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-xl flex items-center justify-center"><div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white animate-pulse" /></div>}
                </button>

                <button 
                  onClick={() => setTheme("system")}
                  className={cn(
                    "h-28 sm:h-32 flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl border transition-all duration-300 group relative overflow-hidden col-span-2 sm:col-span-1",
                    theme === 'system' 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg shadow-primary/10' 
                      : 'border-border/40 bg-background/50 hover:bg-muted/50'
                  )}
                >
                  <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all", theme === 'system' ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground')}>
                    <Laptop className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className={cn("text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]", theme === 'system' ? 'text-primary' : 'text-muted-foreground')}>System Mode</span>
                  {theme === 'system' && <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-xl flex items-center justify-center"><div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white animate-pulse" /></div>}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
