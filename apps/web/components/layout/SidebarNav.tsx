"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: BarChart3 },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
