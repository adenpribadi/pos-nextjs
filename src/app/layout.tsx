import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS Next | Premium Point of Sale",
  description: "Modern Point of Sale application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark h-full", "font-sans", geist.variable)}>
      <body className={`${inter.variable} min-h-full font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
