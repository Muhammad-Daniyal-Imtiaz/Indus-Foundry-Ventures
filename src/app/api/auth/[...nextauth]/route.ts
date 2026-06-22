import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Ensure environment variables are set
if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.error("NEXTAUTH_SECRET/AUTH_SECRET is not set!");
}
if (!process.env.NEXTAUTH_URL) {
  console.error("NEXTAUTH_URL is not set!");
}
if (!process.env.GOOGLE_CLIENT_ID && !process.env.AUTH_GOOGLE_ID && !process.env.GOOGLE_ID && !process.env.key) {
  console.error("GOOGLE_CLIENT_ID/AUTH_GOOGLE_ID is not set!");
}
if (!process.env.GOOGLE_CLIENT_SECRET && !process.env.AUTH_GOOGLE_SECRET && !process.env.GOOGLE_SECRET && !process.env.secret) {
  console.error("GOOGLE_CLIENT_SECRET/AUTH_GOOGLE_SECRET is not set!");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
