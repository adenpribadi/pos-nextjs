"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn, getSession } from "next-auth/react"
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
import { Store, Loader2 } from "lucide-react"

const formSchema = z.object({
  identifier: z.string().min(3, {
    message: "Harap masukkan email atau nomor HP yang valid.",
  }),
  password: z.string().min(1, {
    message: "Password wajib diisi.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await signIn("credentials", {
        redirect: false,
        identifier: values.identifier,
        password: values.password,
      })

      if (response?.error) {
        setError("Email/Nomor HP atau Password salah.")
        setIsLoading(false)
      } else {
        // Ambil sesi terbaru untuk mengecek role
        const session = await getSession()
        
        if (session?.user?.role === "CUSTOMER") {
          router.push("/store")
        } else {
          router.push("/dashboard")
        }
        
        router.refresh()
        // Kita biarkan isLoading tetap true agar tombol tetap dalam mode memuat saat redirect
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-8 md:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Global Loading Overlay (When redirecting) */}
      {isLoading && !error && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                <div className="relative p-4 bg-card border border-primary/20 rounded-2xl shadow-2xl">
                   <Store className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                 <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span className="text-sm font-bold tracking-widest uppercase">Menyiapkan Sesi...</span>
                 </div>
              </div>
           </div>
        </div>
      )}
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-blue-600 mb-6">
          <div className="p-3 bg-blue-600/10 rounded-2xl ring-1 ring-blue-600/20 backdrop-blur-md">
            <Store className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2 text-center">Masuk ke Warung Bintang</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10">
        <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl">Otentikasi</CardTitle>
            <CardDescription>
              Gunakan kredensial yang telah terdaftar untuk masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email atau Nomor HP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="contoh@email.com / 081234..." 
                          autoComplete="username"
                          {...field} 
                          className="bg-background/50 border-input/50 focus:bg-background h-11"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          autoComplete="current-password"
                          {...field} 
                          className="bg-background/50 border-input/50 focus:bg-background h-11"
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
                  className="w-full h-11 font-semibold transition-all hover:scale-[1.01] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memeriksa...
                    </>
                  ) : (
                    "Login Ke Sistem"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center pt-6 border-t border-border/50">
              <span className="text-sm text-muted-foreground mr-1">Belum punya akun?</span>
              <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
                Daftar sebagai Pelanggan
              </Link>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
