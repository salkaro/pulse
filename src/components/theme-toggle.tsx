"use client"

// Local Imports
import { Button } from "@/components/ui/button"

// External Imports
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"


export function ModeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid SSR mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" disabled aria-label="Toggle theme">
                <Sun className="h-4 w-4 opacity-50" />
            </Button>
        )
    }

    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(nextTheme)}
            aria-label="Toggle theme"
        >
            {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    )
}
