import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const email = user.email.toLowerCase().trim();
        const name = user.name || "Google User";
        const avatarUrl = user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

        // Sync with Turso DB
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
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      // Only sync with DB on sign-in (user object only exists on first call)
      if (user || account) {
        const email = token.email?.toLowerCase().trim();
        if (email) {
          const dbUsers = await db
            .select({ id: users.id, role: users.role, avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          if (dbUsers.length > 0) {
            token.id = dbUsers[0].id;
            token.role = dbUsers[0].role;
            token.avatarUrl = dbUsers[0].avatarUrl || user?.image;
          }
        }
        // Strip large Google fields that bloat the JWT cookie
        delete token.picture;
        delete token.sub;
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
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
