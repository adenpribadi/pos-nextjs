"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { registerCustomer } from "@/app/actions/auth"

const formSchema = z.object({
  name: z.string().min(2, { message: "Nama terlalu pendek" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("password", values.password)

      const res = await registerCustomer(formData)

      if (res.success) {
        toast.success("Registrasi Berhasil!", { description: "Silakan login menggunakan akun baru Anda." })
        router.push("/login")
      } else {
        setError(res.error || "Pendaftaran ditolak.")
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-8 md:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center text-primary mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur-md">
            <Store className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Daftar Akun Baru
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px] z-10">
        <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Otentikasi Pelanggan</CardTitle>
            <CardDescription>
              Nikmati fasilitas pemesanan langsung dengan mendaftarkan email Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Misal: Budi Santoso" 
                          {...field} 
                          className="bg-background/50 border-input/50 h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="budi@email.com" 
                          type="email"
                          {...field} 
                          className="bg-background/50 border-input/50 h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-background/50 border-input/50 h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-sm font-medium text-destructive mt-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 font-bold transition-all mt-4 hover:scale-[1.01] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 text-center pt-6 border-t border-border/50">
              <span className="text-sm text-muted-foreground mr-1">Sudah punya akun?</span>
              <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
