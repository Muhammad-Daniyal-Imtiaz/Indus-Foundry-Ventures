import type { NextAuthOptions } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Raw Google OAuth provider — completely bypasses next-auth/providers/google
 * and the openid-client library so it works on Cloudflare Workers (workerd).
 *
 * Why: GoogleProvider() from next-auth sets `issuer` internally, which makes
 * openid-client call Issuer.discover() using Node http/dns — both unavailable
 * in workerd, even with nodejs_compat.
 */
const googleOAuthProvider = {
  id: "google",
  name: "Google Workspace",
  type: "oauth",
  // — no `issuer`, no `wellKnown` → openid-client is never invoked —
  checks: ["state"],   // state-only; pkce needs openid-client generators
  idToken: false,       // skip JWT/JWKS validation that needs issuer
  clientId: "",         // placeholder; overridden by request() which reads env
  clientSecret: "",     // placeholder; overridden by request() which reads env
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
      scope: "openid email profile",
    },
  },
  token: {
    url: "https://oauth2.googleapis.com/token",
    async request({ provider, params, checks }: any) {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "";
      const body = new URLSearchParams({
        code: params.code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: provider.callbackUrl,
        grant_type: "authorization_code",
      });
      if ((checks as any)?.code_verifier) body.set("code_verifier", (checks as any).code_verifier);
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const tokens = await res.json();
      return { tokens };
    },
  },
  userinfo: {
    url: "https://openidconnect.googleapis.com/v1/userinfo",
    async request({ tokens }: any) {
      const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      return res.json();
    },
  },
  profile(profile: any) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
  style: { logo: "/google.svg", bg: "#fff", text: "#000" },
  options: {} as any,
};

// Inject real clientId/clientSecret at runtime so the authorization redirect
// includes the correct client_id query-param (NextAuth reads these at init).
Object.defineProperty(googleOAuthProvider, "clientId", {
  get() { return process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || ""; },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(googleOAuthProvider, "clientSecret", {
  get() { return process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || ""; },
  enumerable: true,
  configurable: true,
});

export const authOptions: NextAuthOptions = {
  providers: [
    googleOAuthProvider as any,
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials" as const,
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        name: { label: "Name", type: "text", placeholder: "Your Name" },
        role: { label: "Role", type: "text", placeholder: "Founder" },
        avatarUrl: { label: "Avatar", type: "text" },
      },
      async authorize(credentials: any) {
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
    } as any,
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const email = user.email.toLowerCase().trim();
        const name = user.name || "Google User";
        const avatarUrl = user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

        try {
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
        } catch (e) {
          console.error("DB error during Google signIn callback:", e);
          // Allow sign-in even if DB sync fails
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

      // For Google OAuth, look up user by email since user.id is the Google sub
      if (account?.provider === "google" && token.email) {
        try {
          const dbUsers = await db.select().from(users).where(eq(users.email, token.email)).limit(1);
          if (dbUsers.length > 0) {
            token.id = dbUsers[0].id;
            token.role = dbUsers[0].role;
            token.avatarUrl = dbUsers[0].avatarUrl || token.avatarUrl;
          }
        } catch {
          // non-fatal
        }
      } else if (account && token.id) {
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
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code: any, metadata: any) {
      console.error("NextAuth error:", code, metadata);
    },
    warn(code: any) {
      console.warn("NextAuth warning:", code);
    },
  },
  // @ts-ignore
  trustHost: true,
};
