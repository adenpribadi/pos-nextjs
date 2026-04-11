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
  email: z.string().email({
    message: "Harap masukkan alamat email yang valid.",
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
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (response?.error) {
        setError("Email atau Password salah.")
      } else {
        // Ambil sesi terbaru untuk mengecek role
        const session = await getSession()
        
        if (session?.user?.role === "CUSTOMER") {
          router.push("/store")
        } else {
          router.push("/dashboard")
        }
        
        router.refresh()
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
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-primary mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur-md">
            <Store className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Masuk ke POS Anda
        </h2>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@pos.com" 
                          autoComplete="email"
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

        {/* Info Card for Demo (Optional, made it look cleaner) */}
        {!error && !isLoading && (
          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50 backdrop-blur-sm">
             <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Akun Demo Default:</p>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[9px] text-muted-foreground">Admin Email:</p>
                   <p className="text-xs font-mono text-primary">admin@pos.com</p>
                </div>
                <div>
                   <p className="text-[9px] text-muted-foreground">Password:</p>
                   <p className="text-xs font-mono text-primary">admin123</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
