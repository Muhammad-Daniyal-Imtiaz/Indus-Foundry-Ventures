"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { mvps, users, profiles } from "@/db/schema";
import { eq, desc, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache, cacheLife } from "next/cache";

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedMvps = unstable_cache(
  async (limit: number, cursor: string | undefined) => {
    cacheLife("marketplace");

    const whereClause = cursor ? lt(mvps.createdAt, cursor) : undefined;

    const list = await db
      .select({
        mvp: mvps,
        profile: profiles,
        user: users,
      })
      .from(mvps)
      .leftJoin(profiles, eq(mvps.userId, profiles.userId))
      .leftJoin(users, eq(mvps.userId, users.id))
      .where(whereClause)
      .orderBy(desc(mvps.createdAt))
      .limit(limit + 1);

    const hasMore = list.length > limit;
    const items = hasMore ? list.slice(0, limit) : list;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].mvp.createdAt : null;

    const formattedMvps = items.map(({ mvp }) => {
      return {
        ...mvp,
        techStack: mvp.techStack ? mvp.techStack.split(",").map(t => t.trim()).filter(Boolean) : [],
      };
    });

    return { success: true, mvps: formattedMvps, nextCursor, hasMore };
  },
  ["mvps-list"],
  { revalidate: 600, tags: ["mvps"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function getMvps(limit = 10, cursor?: string) {
  try {
    return await _getCachedMvps(limit, cursor);
  } catch (error) {
    console.error("Error loading mvps:", error);
    return { success: false, error: "Failed to load mvps from database." };
  }
}

export async function createMvp(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const tagline = formData.get("tagline") as string;
    const category = formData.get("category") as string;
    const reason = formData.get("reason") as string;
    const askingPrice = (formData.get("askingPrice") as string) || "Open for Offers";
    const revenue = (formData.get("revenue") as string) || "$0/mo";
    const tractionUsers = (formData.get("users") as string) || "Prototype stage";
    const githubRepo = formData.get("githubRepo") as string;
    const techStackRaw = formData.get("techStack") as string;
    const productDescription = (formData.get("productDescription") as string) || "No description provided.";

    const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      throw new Error("User record not found in database.");
    }

    const dbUser = dbUsers[0];

    let userRoleDisplay = dbUser.role || "Member";
    try {
      const profileRows = await db.select().from(profiles).where(eq(profiles.userId, dbUser.id)).limit(1);
      if (profileRows.length > 0 && profileRows[0].rolesJson) {
        const roles: string[] = JSON.parse(profileRows[0].rolesJson);
        if (roles.length > 0) {
          userRoleDisplay = roles.join(", ");
        }
      }
    } catch {
      // fallback to legacy role
    }

    const newMvpId = `mvp_${Math.random().toString(36).substring(2, 11)}`;

    const newMvp = {
      id: newMvpId,
      userId: dbUser.id,
      userName: dbUser.name,
      userRole: userRoleDisplay,
      userAvatar: dbUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      title: title.trim(),
      tagline: tagline.trim(),
      category: category,
      reason: reason,
      askingPrice: askingPrice,
      revenue: revenue,
      users: tractionUsers,
      githubRepo: githubRepo || null,
      techStack: techStack.join(","),
      productDescription: productDescription,
      repoVerified: !!githubRepo,
      ownershipVerified: true,
      githubStars: githubRepo ? Math.floor(Math.random() * 20) : 0,
      screenshot: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    };

    await db.insert(mvps).values(newMvp);

    revalidateTag("mvps");
    revalidatePath("/mvps");

    return { 
      success: true, 
      mvp: { 
        ...newMvp, 
        techStack: newMvp.techStack.split(",").map(t => t.trim()).filter(Boolean) 
      } 
    };
  } catch (error: any) {
    console.error("Error creating mvp:", error);
    return { success: false, error: error.message || "Failed to submit mvp." };
  }
}
