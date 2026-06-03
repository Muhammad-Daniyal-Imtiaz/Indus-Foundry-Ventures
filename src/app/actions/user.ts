"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkUserStatus() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { isAuthenticated: false, hasRole: false };
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const sessionName = session.user.name || "User";
    const sessionImage = session.user.image || "";

    // Check if user exists in Turso DB
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUsers.length > 0) {
      const dbUser = existingUsers[0];
      const hasRole = !!dbUser.role && dbUser.role !== "None";
      return { 
        isAuthenticated: true, 
        hasRole, 
        user: {
          ...dbUser,
          // Prefer DB avatar but fall back to session image (Google avatar)
          avatarUrl: dbUser.avatarUrl || sessionImage,
        }
      };
    }

    // Authenticated via Google but not yet onboarded — return session data as user shape
    return { 
      isAuthenticated: true, 
      hasRole: false, 
      user: {
        id: "",
        email,
        name: sessionName,
        role: "None",
        avatarUrl: sessionImage,
        createdAt: "",
        updatedAt: "",
      }
    };
  } catch (error) {
    console.error("Error checking user status:", error);
    return { isAuthenticated: false, hasRole: false };
  }
}

export async function saveUserOnboarding(role: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const name = session.user.name || "User";
    const avatarUrl = session.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    // Double check if already onboarded
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUsers.length > 0) {
      await db.update(users).set({ role }).where(eq(users.email, email));
      return { ...existingUsers[0], role };
    }

    const newUserId = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const newUser = {
      id: newUserId,
      email,
      name,
      role,
      avatarUrl,
    };

    await db.insert(users).values(newUser);
    return newUser;
  } catch (error) {
    console.error("Error during onboarding:", error);
    throw new Error("Failed to save user onboarding record.");
  }
}

export async function updateUserRole(role: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    await db.update(users).set({ role }).where(eq(users.email, email));
    return { success: true, role };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role.");
  }
}
