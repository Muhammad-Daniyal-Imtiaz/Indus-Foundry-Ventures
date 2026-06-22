"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users, profiles, connections, follows } from "@/db/schema";
import { eq, and, or, count, desc, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache, cacheLife } from "next/cache";

// ─── Helpers ────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const email = session.user.email.toLowerCase().trim();
  const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return dbUsers.length > 0 ? dbUsers[0] : null;
}

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedUserNetwork = unstable_cache(
  async (targetUserId: string) => {
    cacheLife("network");

    const targetUsers = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (targetUsers.length === 0) return { success: false, error: "User not found" };
    const target = targetUsers[0];

    const acceptedAsSender = await db.select().from(connections)
      .where(and(eq(connections.senderId, targetUserId), eq(connections.status, "accepted")));
    const acceptedAsReceiver = await db.select().from(connections)
      .where(and(eq(connections.receiverId, targetUserId), eq(connections.status, "accepted")));

    const connectedUsers = [
      ...acceptedAsSender.map(c => ({ id: c.receiverId, name: c.receiverName, avatar: c.receiverAvatar })),
      ...acceptedAsReceiver.map(c => ({ id: c.senderId, name: c.senderName, avatar: c.senderAvatar })),
    ];

    const followerCount = (await db.select({ value: count() }).from(follows).where(eq(follows.followingId, targetUserId)))[0]?.value || 0;
    const followingCount = (await db.select({ value: count() }).from(follows).where(eq(follows.followerId, targetUserId)))[0]?.value || 0;

    return {
      success: true,
      user: { id: target.id, name: target.name, avatar: target.avatarUrl, role: target.role },
      connections: connectedUsers,
      connectionCount: connectedUsers.length,
      followerCount,
      followingCount,
    };
  },
  ["user-network"],
  { revalidate: 120, tags: ["network"] }
);

const _getCachedMyNetwork = unstable_cache(
  async (myId: string, suggestionsLimit: number, suggestionsCursor: string | undefined) => {
    cacheLife("network");

    const acceptedAsSender = await db.select().from(connections)
      .where(and(eq(connections.senderId, myId), eq(connections.status, "accepted")));
    const acceptedAsReceiver = await db.select().from(connections)
      .where(and(eq(connections.receiverId, myId), eq(connections.status, "accepted")));

    const connectedUsers = [
      ...acceptedAsSender.map(c => ({ id: c.receiverId, name: c.receiverName, avatar: c.receiverAvatar, since: c.createdAt })),
      ...acceptedAsReceiver.map(c => ({ id: c.senderId, name: c.senderName, avatar: c.senderAvatar, since: c.createdAt })),
    ];

    const pendingIncoming = await db.select().from(connections)
      .where(and(eq(connections.receiverId, myId), eq(connections.status, "pending")));

    const pendingOutgoing = await db.select().from(connections)
      .where(and(eq(connections.senderId, myId), eq(connections.status, "pending")));

    const myFollowing = await db.select().from(follows)
      .where(eq(follows.followerId, myId));
    const myFollowers = await db.select().from(follows)
      .where(eq(follows.followingId, myId));

    const followingIds = myFollowing.map(f => f.followingId);
    const followingUsers = followingIds.length > 0
      ? await db.select().from(users).where(or(...followingIds.map(id => eq(users.id, id))))
      : [];

    const allKnownIds = new Set([myId, ...connectedUsers.map(c => c.id), ...followingIds]);

    const allCursorDate = suggestionsCursor ? new Date(suggestionsCursor) : null;
    const allUsers = await db.select().from(users).limit(200);
    const peopleYouMayKnowRaw = allUsers
      .filter(u => !allKnownIds.has(u.id))
      .filter(u => !allCursorDate || (u.createdAt && new Date(u.createdAt) < allCursorDate));

    const hasMoreSuggestions = peopleYouMayKnowRaw.length > suggestionsLimit;
    const peopleYouMayKnowItems = hasMoreSuggestions ? peopleYouMayKnowRaw.slice(0, suggestionsLimit) : peopleYouMayKnowRaw;
    const nextSuggestionsCursor = hasMoreSuggestions && peopleYouMayKnowItems.length > 0
      ? peopleYouMayKnowItems[peopleYouMayKnowItems.length - 1].createdAt
      : null;

    const profilesMap = new Map<string, any>();
    for (const u of peopleYouMayKnowItems) {
      const p = await db.select().from(profiles).where(eq(profiles.userId, u.id)).limit(1);
      profilesMap.set(u.id, p[0] || null);
    }

    return {
      success: true,
      connections: connectedUsers,
      connectionCount: connectedUsers.length,
      followerCount: myFollowers.length,
      followingCount: myFollowing.length,
      pendingIncoming: pendingIncoming.map(c => ({ id: c.id, userId: c.senderId, name: c.senderName, avatar: c.senderAvatar, since: c.createdAt })),
      pendingOutgoing: pendingOutgoing.map(c => ({ id: c.id, userId: c.receiverId, name: c.receiverName, avatar: c.receiverAvatar, since: c.createdAt })),
      following: followingUsers.map(u => ({ id: u.id, name: u.name, avatar: u.avatarUrl })),
      peopleYouMayKnow: peopleYouMayKnowItems.map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatarUrl,
        role: u.role,
        profile: profilesMap.get(u.id),
      })),
      nextSuggestionsCursor,
      hasMoreSuggestions,
    };
  },
  ["my-network"],
  { revalidate: 120, tags: ["network"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function sendConnectionRequest(targetUserId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };
    if (me.id === targetUserId) return { success: false, error: "Cannot connect with yourself" };

    const targetUsers = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (targetUsers.length === 0) return { success: false, error: "User not found" };
    const target = targetUsers[0];

    const existing = await db.select().from(connections)
      .where(or(
        and(eq(connections.senderId, me.id), eq(connections.receiverId, targetUserId)),
        and(eq(connections.senderId, targetUserId), eq(connections.receiverId, me.id))
      )).limit(1);

    if (existing.length > 0) {
      const conn = existing[0];
      if (conn.status === "accepted") return { success: false, error: "Already connected" };
      if (conn.status === "pending") return { success: false, error: "Request already pending" };
      if (conn.status === "rejected") {
        await db.update(connections).set({ status: "pending" }).where(eq(connections.id, conn.id));
        revalidateTag("network");
        revalidatePath("/network");
        return { success: true, status: "pending" };
      }
    }

    const id = `con_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(connections).values({
      id,
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(me.name)}`,
      receiverId: target.id,
      receiverName: target.name,
      receiverAvatar: target.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(target.name)}`,
    });

    revalidateTag("network");
    revalidatePath("/network");

    return { success: true, status: "pending" };
  } catch (error: any) {
    console.error("Error sending connection request:", error);
    return { success: false, error: error.message || "Failed to send request" };
  }
}

export async function acceptConnectionRequest(connectionId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };

    const rows = await db.select().from(connections).where(eq(connections.id, connectionId)).limit(1);
    if (rows.length === 0) return { success: false, error: "Request not found" };
    if (rows[0].receiverId !== me.id) return { success: false, error: "Not authorized" };

    await db.update(connections).set({ status: "accepted" }).where(eq(connections.id, connectionId));

    revalidateTag("network");
    revalidatePath("/network");

    return { success: true };
  } catch (error: any) {
    console.error("Error accepting connection:", error);
    return { success: false, error: error.message || "Failed to accept" };
  }
}

export async function rejectConnectionRequest(connectionId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };

    const rows = await db.select().from(connections).where(eq(connections.id, connectionId)).limit(1);
    if (rows.length === 0) return { success: false, error: "Request not found" };
    if (rows[0].receiverId !== me.id) return { success: false, error: "Not authorized" };

    await db.update(connections).set({ status: "rejected" }).where(eq(connections.id, connectionId));

    revalidateTag("network");
    revalidatePath("/network");

    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting connection:", error);
    return { success: false, error: error.message || "Failed to reject" };
  }
}

export async function removeConnection(targetUserId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };

    await db.delete(connections).where(or(
      and(eq(connections.senderId, me.id), eq(connections.receiverId, targetUserId)),
      and(eq(connections.senderId, targetUserId), eq(connections.receiverId, me.id))
    ));

    revalidateTag("network");
    revalidatePath("/network");

    return { success: true };
  } catch (error: any) {
    console.error("Error removing connection:", error);
    return { success: false, error: error.message || "Failed to remove" };
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };
    if (me.id === targetUserId) return { success: false, error: "Cannot follow yourself" };

    const existing = await db.select().from(follows)
      .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetUserId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(follows)
        .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetUserId)));

      revalidateTag("network");
      revalidatePath("/network");

      return { success: true, following: false };
    } else {
      await db.insert(follows).values({ followerId: me.id, followingId: targetUserId });

      revalidateTag("network");
      revalidatePath("/network");

      return { success: true, following: true };
    }
  } catch (error: any) {
    console.error("Error toggling follow:", error);
    return { success: false, error: error.message || "Failed to toggle follow" };
  }
}

export async function getConnectionStatus(targetUserId: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: true, status: "none" as const, following: false };

    const connRows = await db.select().from(connections)
      .where(or(
        and(eq(connections.senderId, me.id), eq(connections.receiverId, targetUserId)),
        and(eq(connections.senderId, targetUserId), eq(connections.receiverId, me.id))
      )).limit(1);

    let status: "none" | "pending_sent" | "pending_received" | "connected" = "none";
    let connectionId: string | null = null;
    if (connRows.length > 0) {
      const conn = connRows[0];
      connectionId = conn.id;
      if (conn.status === "accepted") status = "connected";
      else if (conn.status === "pending") {
        status = conn.senderId === me.id ? "pending_sent" : "pending_received";
      }
    }

    const followRows = await db.select().from(follows)
      .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetUserId)))
      .limit(1);

    return { success: true, status, connectionId, following: followRows.length > 0 };
  } catch (error: any) {
    console.error("Error getting connection status:", error);
    return { success: false, status: "none" as const, following: false };
  }
}

export async function getMyNetwork(suggestionsLimit = 10, suggestionsCursor?: string) {
  try {
    const me = await getCurrentUser();
    if (!me) return { success: false, error: "Unauthorized" };

    return await _getCachedMyNetwork(me.id, suggestionsLimit, suggestionsCursor);
  } catch (error: any) {
    console.error("Error loading network:", error);
    return { success: false, error: error.message || "Failed to load network" };
  }
}

export async function getUserNetwork(targetUserId: string) {
  try {
    return await _getCachedUserNetwork(targetUserId);
  } catch (error: any) {
    console.error("Error loading user network:", error);
    return { success: false, error: error.message || "Failed to load user network" };
  }
}
