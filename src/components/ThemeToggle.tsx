import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = window.document.documentElement
    const initialColorValue = root.classList.contains("dark") ? "dark" : "light"
    setTheme(initialColorValue)
  }, [])

  const toggleTheme = () => {
    const root = window.document.documentElement
    const newTheme = theme === "light" ? "dark" : "light"
    root.classList.remove(theme)
    root.classList.add(newTheme)
    setTheme(newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-full justify-start px-4">
      {theme === "light" ? (
        <Moon className="h-5 w-5 mr-3" />
      ) : (
        <Sun className="h-5 w-5 mr-3" />
      )}
      <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </Button>
  )
}
