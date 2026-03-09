"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function credentialsSignIn(
  email: string,
  password: string
): Promise<string | undefined> {
  try {
    await signIn("credentials", { email, password, redirectTo: "/home" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error; // rethrow NEXT_REDIRECT so Next.js handles navigation
  }
}

export async function googleSignIn(): Promise<void> {
  await signIn("google", { redirectTo: "/home" });
}
