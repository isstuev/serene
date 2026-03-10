"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { BookOpen, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: BarChart3 },
]

interface MobileHeaderProps {
  initials: string
  avatarUrl?: string | null
}

export function MobileHeader({ initials, avatarUrl }: MobileHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="flex md:hidden items-center justify-between border-b border-border bg-white px-4 py-3 shrink-0">
      <Link
        href="/home"
        className="text-base font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Serene
      </Link>

      <nav className="flex items-center gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          )
        })}

        <div className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="ml-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </nav>
    </header>
  )
}
