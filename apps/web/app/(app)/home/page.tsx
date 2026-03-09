import { auth } from "@/lib/auth";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-24 px-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-indigo-100">
          <BookOpen className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-500">
          Your journal is empty. Write your first entry to get started.
        </p>
        <Button asChild>
          <Link href="/journal">New entry</Link>
        </Button>
      </div>
    </div>
  );
}
