"use client"

import { useSession } from "next-auth/react"
import { Store, User, Shield, CreditCard, Bell, Moon, Laptop, Sun, Paintbrush } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

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
          <TabsTrigger value="store" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Store className="w-4 h-4 mr-2" />
            Informasi Toko
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Paintbrush className="w-4 h-4 mr-2" />
            Tampilan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Profil Pengguna Aktif</CardTitle>
              <CardDescription>
                Informasi dasar terkait akun yang sedang digunakan saat ini.
              </CardDescription>
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
                  <Input id="name" defaultValue={session?.user?.name || ""} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input id="email" defaultValue={session?.user?.email || ""} className="bg-background/50" disabled />
                  <p className="text-xs text-muted-foreground">Email digunakan untuk otentikasi login, hubungi pihak IT untuk mengubah.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
              <Button>Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Identitas Bisnis</CardTitle>
              <CardDescription>
                Konfigurasi yang tercetak di struk pelanggan dan laporan aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nama Toko / Outlet</Label>
                  <Input id="store-name" defaultValue="POS Next Premium" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Persentase PPN (%)</Label>
                  <Input id="tax-rate" defaultValue="11" type="number" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Pusat / Cabang (Akan tercetak di Struk)</Label>
                <Input id="address" defaultValue="Jalan Sudirman Kav 24, Jakarta Pusat" className="bg-background/50" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
              <Button>Perbarui Toko</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
                <Button 
                  variant="outline" 
                  onClick={() => setTheme("dark")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'dark' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}
                >
                  <Moon className="h-6 w-6" />
                  Dark Mode
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setTheme("light")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'light' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}
                >
                  <Sun className="h-6 w-6" />
                  Light Mode
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setTheme("system")}
                  className={`h-24 flex flex-col items-center justify-center gap-2 ${theme === 'system' ? 'border-primary ring-2 ring-primary bg-primary/5' : 'border-border/50 bg-background/50'} transition-all`}
                >
                  <Laptop className="h-6 w-6" />
                  Ikuti Sistem Operasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
