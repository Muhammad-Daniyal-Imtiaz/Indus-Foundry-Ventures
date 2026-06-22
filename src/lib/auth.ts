import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
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

        // Check if user exists in database
        let existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length === 0) {
          // Create new user in Turso DB
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
          // Return existing user
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
      try {
        if (account?.provider === "google") {
          if (!user.email) {
            console.error("Google sign-in failed: No email provided");
            return false;
          }

          const email = user.email.toLowerCase().trim();
          const name = user.name || "Google User";
          const avatarUrl = user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

          // Sync with Turso DB
          try {
            const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
            
            if (existingUser.length === 0) {
              const newUserId = `usr_${Math.random().toString(36).substring(2, 11)}`;
              await db.insert(users).values({
                id: newUserId,
                email,
                name,
                role: "None", // None triggers OnboardingOverlay to prompt for role
                avatarUrl,
              });
              console.log("New user created:", email);
            } else {
              console.log("Existing user signed in:", email);
            }
          } catch (dbError) {
            console.error("Database error during sign-in:", dbError);
            // Continue with sign-in even if DB fails
          }
        }
        return true;
      } catch (error) {
        console.error("Sign-in callback error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }: any) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role || "None";
          token.avatarUrl = user.image || user.avatarUrl;
        }

        // For Google OAuth, we need to fetch user from DB by email
        if (account?.provider === "google" && token.email) {
          try {
            const dbUsers = await db.select().from(users).where(eq(users.email, token.email)).limit(1);
            if (dbUsers.length > 0) {
              token.id = dbUsers[0].id;
              token.role = dbUsers[0].role;
              token.avatarUrl = dbUsers[0].avatarUrl || token.avatarUrl;
            }
          } catch (dbError) {
            console.error("Database error in JWT callback:", dbError);
          }
        } else if (account && token.id) {
          try {
            const dbUsers = await db.select().from(users).where(eq(users.id, token.id)).limit(1);
            if (dbUsers.length > 0) {
              token.role = dbUsers[0].role;
              token.avatarUrl = dbUsers[0].avatarUrl || token.avatarUrl;
            }
          } catch (dbError) {
            console.error("Database error in JWT callback:", dbError);
          }
        }
        
        // CRITICAL: Remove large OAuth tokens to prevent cookie overflow
        // Only keep essential user data in the JWT
        return {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          avatarUrl: token.avatarUrl,
          picture: token.picture,
          sub: token.sub,
        };
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
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
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  // @ts-ignore: trustHost is valid NextAuth option
  trustHost: true,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
