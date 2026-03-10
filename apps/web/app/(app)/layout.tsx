import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { SignOutButton } from "@/components/layout/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const user = session.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-warm-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-white px-4 py-6 sticky top-0 h-screen">
        {/* Logo */}
        <Link
          href="/home"
          className="mb-8 text-lg font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Serene
        </Link>

        <SidebarNav />

        {/* User + sign-out */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              {user?.name && (
                <p className="truncate text-sm font-medium text-slate-800">
                  {user.name}
                </p>
              )}
              {user?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Content column */}
      <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
        {/* Mobile top bar */}
        <MobileHeader initials={initials} avatarUrl={user?.image} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
