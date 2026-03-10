import { auth } from "@/lib/auth";
import { getEntries } from "@/lib/entries";
import { getStreak } from "@/lib/insights";
import { MoodBadge } from "@/components/mood/MoodBadge";
import { Button } from "@/components/ui/button";
import { Flame, PenLine, BarChart2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Mood } from "@/lib/types";

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (dateStr === todayStr) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
  if (dateStr === yesterdayStr) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [recent, streak] = await Promise.all([
    getEntries(userId).then((e) => e.slice(0, 3)),
    getStreak(userId),
  ]);

  const hasEntries = recent.length > 0;

  return (
    <div className="max-w-xl mx-auto px-6 py-12 space-y-8">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-800">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm">
          {hasEntries ? "Here's how you've been doing." : "Ready to start your journal?"}
        </p>
      </div>

      {/* Stats */}
      {hasEntries && (
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 flex-1">
            <Flame className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5">Streak</p>
              <p className="text-lg font-semibold text-slate-800 leading-none">
                {streak} <span className="text-sm font-normal text-slate-500">{streak === 1 ? "day" : "days"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 flex-1">
            <PenLine className="h-5 w-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5">Latest mood</p>
              <div className="mt-0.5">
                <MoodBadge mood={recent[0].mood as Mood} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent entries */}
      {hasEntries ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Recent entries</h2>
          <div className="space-y-2">
            {recent.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-100 bg-white px-4 py-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <MoodBadge mood={entry.mood as Mood} size="sm" />
                  <span className="text-xs text-slate-400">
                    {formatRelativeDate(new Date(entry.createdAt))}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-slate-600 line-clamp-2">{entry.note}</p>
                )}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center space-y-3">
          <p className="text-slate-500 text-sm">No entries yet — write your first one.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/journal">
            <PenLine className="h-4 w-4 mr-1.5" />
            New entry
          </Link>
        </Button>
        {hasEntries && (
          <Button asChild variant="outline" className="flex-1">
            <Link href="/insights">
              <BarChart2 className="h-4 w-4 mr-1.5" />
              View insights
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
