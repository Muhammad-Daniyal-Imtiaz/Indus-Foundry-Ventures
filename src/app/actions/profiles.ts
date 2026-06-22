"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, profiles, posts, mvps, freelanceProjects, connections, follows, postLikes } from "@/db/schema";
import { eq, desc, and, lt, count, or, like } from "drizzle-orm";

export async function getUserProfile(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (dbUsers.length > 0) currentUserId = dbUsers[0].id;
    }

    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userRows.length) return { success: false, error: "User not found." };
    const user = userRows[0];

    const profileRows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const profile = profileRows[0] || null;

    const userPosts = await db.select().from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(20);

    const userMvps = await db.select().from(mvps)
      .where(eq(mvps.userId, userId))
      .orderBy(desc(mvps.createdAt))
      .limit(20);

    const userFreelance = await db.select().from(freelanceProjects)
      .where(eq(freelanceProjects.userId, userId))
      .orderBy(desc(freelanceProjects.createdAt))
      .limit(20);

    const followerCount = (await db.select({ value: count() }).from(follows).where(eq(follows.followingId, userId)))[0]?.value || 0;
    const followingCount = (await db.select({ value: count() }).from(follows).where(eq(follows.followerId, userId)))[0]?.value || 0;

    const acceptedAsSender = await db.select().from(connections)
      .where(and(eq(connections.senderId, userId), eq(connections.status, "accepted")));
    const acceptedAsReceiver = await db.select().from(connections)
      .where(and(eq(connections.receiverId, userId), eq(connections.status, "accepted")));
    const connectionCount = acceptedAsSender.length + acceptedAsReceiver.length;

    let isFollowing = false;
    let connectionStatus: "none" | "pending_sent" | "pending_received" | "connected" = "none";
    let connectionId: string | null = null;

    if (currentUserId && currentUserId !== userId) {
      const followRow = await db.select().from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userId)))
        .limit(1);
      isFollowing = followRow.length > 0;

      const connRows = await db.select().from(connections)
        .where(or(
          and(eq(connections.senderId, currentUserId), eq(connections.receiverId, userId)),
          and(eq(connections.senderId, userId), eq(connections.receiverId, currentUserId))
        )).limit(1);
      if (connRows.length > 0) {
        const conn = connRows[0];
        connectionId = conn.id;
        if (conn.status === "accepted") connectionStatus = "connected";
        else if (conn.status === "pending") {
          connectionStatus = conn.senderId === currentUserId ? "pending_sent" : "pending_received";
        }
      }
    }

    return {
      success: true,
      user: {
        ...user,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
      },
      profile,
      posts: userPosts,
      mvps: userMvps.map(m => ({
        ...m,
        techStack: m.techStack ? m.techStack.split(",").map(t => t.trim()).filter(Boolean) : [],
      })),
      freelanceProjects: userFreelance.map(f => ({
        ...f,
        skills: f.skills ? f.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      })),
      connectionCount,
      followerCount,
      followingCount,
      isFollowing,
      connectionStatus,
      connectionId,
      isOwnProfile: currentUserId === userId,
    };
  } catch (error: any) {
    console.error("Error loading user profile:", error);
    return { success: false, error: error.message || "Failed to load profile." };
  }
}

export async function getAllUsers(limit = 3, cursor?: string, search?: string) {
  try {
    const whereClause = cursor ? lt(users.createdAt, cursor) : undefined;

    let query = db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit + 1);

    const userList = await query;
    const hasMore = userList.length > limit;
    const items = hasMore ? userList.slice(0, limit) : userList;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt : null;

    let filtered = items;
    if (search) {
      const q = search.toLowerCase();
      filtered = items.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }

    const enriched = await Promise.all(filtered.map(async (u) => {
      const profileRows = await db.select().from(profiles).where(eq(profiles.userId, u.id)).limit(1);
      const profile = profileRows[0] || null;
      const followerCount = (await db.select({ value: count() }).from(follows).where(eq(follows.followingId, u.id)))[0]?.value || 0;
      const postCount = (await db.select({ value: count() }).from(posts).where(eq(posts.userId, u.id)))[0]?.value || 0;

      return {
        ...u,
        avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
        profile,
        followerCount,
        postCount,
      };
    }));

    return { success: true, users: enriched, nextCursor, hasMore };
  } catch (error: any) {
    console.error("Error loading users:", error);
    return { success: false, error: error.message || "Failed to load users." };
  }
}
