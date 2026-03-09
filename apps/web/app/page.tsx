import { redirect } from "next/navigation";

// Temporary: redirect root to marketing landing (stub for Stage 2)
export default function RootPage() {
  redirect("/home");
}
