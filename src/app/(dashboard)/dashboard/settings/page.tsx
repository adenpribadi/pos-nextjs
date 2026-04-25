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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
        <p className="text-muted-foreground mt-1">
          Kelola profil pengguna, konfigurasi toko, keamanan, dan preferensi aplikasi Anda.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border-border/50 shadow-sm p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4 mr-2" />
            Profil Akun
          </TabsTrigger>
          {canManageStore && (
            <TabsTrigger value="store" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store className="w-4 h-4 mr-2" />
              Informasi Toko
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Manajemen User
            </TabsTrigger>
          )}
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Paintbrush className="w-4 h-4 mr-2" />
            Tampilan
          </TabsTrigger>
        </TabsList>

        {/* Profil Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Profil Pengguna Aktif</CardTitle>
              <CardDescription>Informasi dasar terkait akun yang sedang digunakan saat ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border/50">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase shadow-sm border border-primary/20">
                  {session?.user?.name ? session.user.name.substring(0, 2) : "AD"}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{session?.user?.name || "Administrator"}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px] tracking-wider">
                      {session?.user?.role || "ADMIN"} Akses
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
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
              <Button>Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Informasi Toko + PPN Tab */}
        {canManageStore && (
          <TabsContent value="store" className="space-y-4">
            <form onSubmit={handleSaveStore} className="space-y-4">
              {/* Identitas Toko */}
              <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Identitas Bisnis</CardTitle>
                  <CardDescription>Konfigurasi yang tercetak di struk pelanggan dan laporan aplikasi.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat pengaturan toko...</div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
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
              </Card>

              {/* Pengaturan Pajak (PPN) */}
              <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Pengaturan Pajak (PPN)</CardTitle>
                      <CardDescription>
                        Aktifkan atau nonaktifkan penerapan PPN pada setiap transaksi penjualan.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat pengaturan pajak...</div>
                  ) : (
                    <>
                      {/* Toggle PPN */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm">Aktifkan PPN</p>
                          <p className="text-xs text-muted-foreground">
                            Jika diaktifkan, pajak akan dihitung otomatis pada setiap transaksi kasir.
                          </p>
                        </div>
                        <Switch
                          checked={settings.taxEnabled}
                          onCheckedChange={val => setSettings(s => ({ ...s, taxEnabled: val }))}
                        />
                      </div>

                      {/* Status Banner */}
                      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${settings.taxEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/30"}`}>
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${settings.taxEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`}></div>
                        <p className={`text-xs font-bold ${settings.taxEnabled ? "text-primary" : "text-muted-foreground"}`}>
                          {settings.taxEnabled
                            ? `PPN AKTIF — Setiap transaksi akan dikenakan pajak ${settings.taxRate}%`
                            : "PPN NONAKTIF — Harga yang dibayar pelanggan adalah harga netto (tanpa pajak)"}
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
                <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
                  <Button type="submit" disabled={isPending || isLoadingSettings}>
                    {isPending ? "Menyimpan..." : "Simpan Semua Pengaturan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Konfigurasi Bank Transfer */}
              <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Rekening Transfer Bank</CardTitle>
                      <CardDescription>
                        Informasi rekening ini akan ditampilkan kepada pelanggan yang memilih metode pembayaran Transfer.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingSettings ? (
                    <div className="text-sm text-muted-foreground animate-pulse">Memuat konfigurasi bank...</div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
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
                <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
                  <Button type="submit" disabled={isPending || isLoadingSettings}>
                    {isPending ? "Menyimpan..." : "Simpan Semua Pengaturan"}
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
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Tema Aplikasi</CardTitle>
              <CardDescription>
                Standar tema di-setting ke mode gelap (Dark Mode) untuk optimalisasi performa kasir malam dan estetika premium.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => setTheme("dark")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'dark' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}>
                  <Moon className="h-6 w-6" />Dark Mode
                </Button>
                <Button variant="outline" onClick={() => setTheme("light")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'light' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}>
                  <Sun className="h-6 w-6" />Light Mode
                </Button>
                <Button variant="outline" onClick={() => setTheme("system")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'system' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}>
                  <Laptop className="h-6 w-6" />Ikuti Sistem Operasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
