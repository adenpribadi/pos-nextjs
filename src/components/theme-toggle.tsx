"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 border border-border/50 bg-background/50 rounded-full cursor-pointer">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 border border-border/50 bg-background/50 hover:bg-muted/50 rounded-full transition-all duration-355 relative overflow-hidden cursor-pointer shrink-0"
    >
      <Sun className={`h-4 w-4 text-amber-500 absolute transition-all duration-500 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`h-4 w-4 text-blue-400 absolute transition-all duration-500 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  )
}
