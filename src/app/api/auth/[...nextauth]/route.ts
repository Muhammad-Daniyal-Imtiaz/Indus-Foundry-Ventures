import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Ensure environment variables are set
if (!process.env.NEXTAUTH_SECRET) {
  console.error("NEXTAUTH_SECRET is not set!");
}
if (!process.env.NEXTAUTH_URL) {
  console.error("NEXTAUTH_URL is not set!");
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID is not set!");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("GOOGLE_CLIENT_SECRET is not set!");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
