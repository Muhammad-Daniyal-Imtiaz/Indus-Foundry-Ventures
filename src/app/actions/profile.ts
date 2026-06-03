"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Not authenticated" };
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      return { success: false, error: "User not found" };
    }

    const user = dbUsers[0];
    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    return {
      success: true,
      user,
      profile: profileRows.length > 0 ? profileRows[0] : null,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to load profile" };
  }
}

export async function saveProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      throw new Error("User not found in database");
    }

    const user = dbUsers[0];

    const phone = (formData.get("phone") as string) || "";
    const country = (formData.get("country") as string) || "";
    const location = (formData.get("location") as string) || "";
    const linkedinUrl = (formData.get("linkedinUrl") as string) || "";
    const twitterUrl = (formData.get("twitterUrl") as string) || "";
    const instagramUrl = (formData.get("instagramUrl") as string) || "";
    const leetcodeUrl = (formData.get("leetcodeUrl") as string) || "";
    const hackerrankUrl = (formData.get("hackerrankUrl") as string) || "";
    const portfolioUrl = (formData.get("portfolioUrl") as string) || "";
    const bestProjectUrl = (formData.get("bestProjectUrl") as string) || "";
    const rolesJson = (formData.get("rolesJson") as string) || "[]";
    const employmentStatus = (formData.get("employmentStatus") as string) || "";
    const avatarUrl = (formData.get("avatarUrl") as string) || "";

    // Also update the legacy role field in users table with the first selected role
    const roles: string[] = JSON.parse(rolesJson);
    const primaryRole = roles.length > 0 ? roles[0] : "None";
    await db
      .update(users)
      .set({
        role: primaryRole,
        avatarUrl: avatarUrl.trim() || user.avatarUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));

    // Upsert the profile
    const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    const profileData = {
      userId: user.id,
      phone,
      country,
      location,
      linkedinUrl,
      twitterUrl,
      instagramUrl,
      leetcodeUrl,
      hackerrankUrl,
      portfolioUrl,
      bestProjectUrl,
      rolesJson,
      employmentStatus,
    };

    if (existingProfile.length > 0) {
      await db.update(profiles).set(profileData).where(eq(profiles.userId, user.id));
    } else {
      const profileId = `prf_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(profiles).values({ id: profileId, ...profileData });
    }

    return { success: true, primaryRole };
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return { success: false, error: error.message || "Failed to save profile" };
  }
}
