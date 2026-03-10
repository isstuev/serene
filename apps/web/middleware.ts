export { auth as default } from "@/lib/auth";

export const config = {
  matcher: ["/home/:path*", "/journal/:path*", "/insights/:path*"],
};
