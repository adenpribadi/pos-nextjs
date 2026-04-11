import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { User, Mail, Shield, Calendar, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground text-lg">Informasi lengkap akun dan keamanan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-border/50 bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 mb-4">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{session.user.name}</h2>
              <Badge variant="secondary" className="mt-2 uppercase tracking-widest text-[10px]">
                {session.user.role}
              </Badge>
              <div className="w-full mt-6 space-y-4 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Bergabung sejak Apr 2026</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informasi Personal</CardTitle>
              <CardDescription>Kelola informasi identitas Anda di sini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap</label>
                  <p className="text-sm font-medium p-3 bg-muted/50 rounded-lg">{session.user.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Alamat Email</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">{session.user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Nomor Telepon</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">+62 812-3456-7890</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hak Akses</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium uppercase">{session.user.role}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <h4 className="font-bold text-sm text-primary mb-1">Status Keamanan</h4>
                <p className="text-xs text-muted-foreground">Akun Anda sudah terverifikasi. Gunakan otentikasi dua faktor untuk perlindungan ekstra.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
