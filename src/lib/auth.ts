import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_ID || process.env.key;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_SECRET || process.env.secret;
const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
      // CRITICAL: null wellKnown to prevent openid-client Issuer.discover()
      // (Node.js http/https DNS resolution) which crashes in workerd.
      wellKnown: null as unknown as undefined,
      // CRITICAL: ["state"] only — skip pkce which needs openid-client generators.
      checks: ["state"],
      idToken: false,
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
      // Custom token exchange via fetch (no openid-client / Node.js http).
      token: {
        url: "https://oauth2.googleapis.com/token",
        async request({ provider, params, checks }: any) {
          const body = new URLSearchParams({
            code: params.code,
            client_id: provider.clientId,
            client_secret: provider.clientSecret,
            redirect_uri: provider.callbackUrl,
            grant_type: "authorization_code",
          });
          if (checks?.code_verifier) body.set("code_verifier", checks.code_verifier);
          const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
          });
          const tokens = await res.json();
          return { tokens };
        },
      },
      // Custom userinfo fetch via fetch (no openid-client / Node.js http).
      userinfo: {
        url: "https://openidconnect.googleapis.com/v1/userinfo",
        async request({ tokens }: any) {
          const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          return res.json();
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.picture ? profile.email : profile.email, // standard fallback
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        name: { label: "Name", type: "text", placeholder: "Your Name" },
        role: { label: "Role", type: "text", placeholder: "Founder" },
        avatarUrl: { label: "Avatar", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.name) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const name = credentials.name.trim();
        const role = (credentials.role || "Founder").trim();
        const avatarUrl = credentials.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

        let existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length === 0) {
          const newUserId = `usr_${Math.random().toString(36).substring(2, 11)}`;
          await db.insert(users).values({
            id: newUserId,
            email,
            name,
            role,
            avatarUrl,
          });
          const inserted = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
          if (inserted.length > 0) {
            return {
              id: inserted[0].id,
              email: inserted[0].email,
              name: inserted[0].name,
              role: inserted[0].role,
              image: inserted[0].avatarUrl,
            };
          }
        } else {
          return {
            id: existingUser[0].id,
            email: existingUser[0].email,
            name: existingUser[0].name,
            role: existingUser[0].role,
            image: existingUser[0].avatarUrl,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const email = user.email.toLowerCase().trim();
        const name = user.name || "Google User";
        const avatarUrl = user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length === 0) {
          const newUserId = `usr_${Math.random().toString(36).substring(2, 11)}`;
          await db.insert(users).values({
            id: newUserId,
            email,
            name,
            role: "None",
            avatarUrl,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "None";
        token.avatarUrl = user.image || user.avatarUrl;
      }

      if (account && token.id) {
        try {
          const dbUsers = await db.select().from(users).where(eq(users.id, token.id)).limit(1);
          if (dbUsers.length > 0) {
            token.role = dbUsers[0].role;
            token.avatarUrl = dbUsers[0].avatarUrl || token.avatarUrl;
          }
        } catch {
          // non-fatal
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
        session.user.image = token.avatarUrl;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      console.error("NextAuth error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth warning:", code);
    },
  },
  // @ts-ignore: trustHost is valid NextAuth option
  trustHost: true,
};
