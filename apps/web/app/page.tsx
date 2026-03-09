import Link from "next/link";
import { BookOpen, Brain, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "Daily Journaling",
    description:
      "Capture your mood, add tags, and write freely. Your thoughts, organized beautifully.",
  },
  {
    icon: Brain,
    title: "AI Vibe Checks",
    description:
      "Get a thoughtful, non-clinical reflection on each entry — powered by Claude.",
  },
  {
    icon: BarChart3,
    title: "Mood Insights",
    description:
      "See patterns over time. Streaks, mood charts, and tag frequency at a glance.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your journal is yours alone. Entries are scoped to your account, always.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-50">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-xl font-semibold tracking-tight text-indigo-600">
          Serene
        </span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Your calm corner
            <br />
            <span className="text-indigo-500">for everyday reflection.</span>
          </h1>
          <p className="text-lg text-slate-500">
            Track your mood, journal your thoughts, and get gentle AI insights —
            all in one quiet, focused place.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start journaling — it&apos;s free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">I already have an account</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-semibold text-slate-800">
            Everything you need, nothing you don&apos;t.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-indigo-600 px-6 py-16 text-center sm:px-10">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-3xl font-semibold text-white">
            Ready to feel a little more serene?
          </h2>
          <p className="text-indigo-200">
            Join today. No credit card required.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50"
            asChild
          >
            <Link href="/auth/signup">Create your free account</Link>
          </Button>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Serene. Made with care.
      </footer>
    </div>
  );
}
