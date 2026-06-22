"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { posts, users, profiles, postLikes } from "@/db/schema";
import { eq, desc, count, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache } from "next/cache";

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedPostById = unstable_cache(
  async (postId: string, currentUserId: string | null) => {
    const result = await db
      .select({
        post: posts,
        profile: profiles,
        user: users,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.userId, profiles.userId))
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Post not found." };
    }

    const { post, profile, user } = result[0];

    const likeCountResult = await db
      .select({ value: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    let likedByMe = false;
    if (currentUserId) {
      const myLike = await db
        .select()
        .from(postLikes)
        .where(eq(postLikes.postId, postId))
        .where(eq(postLikes.userId, currentUserId))
        .limit(1);
      likedByMe = myLike.length > 0;
    }

    const likers = await db
      .select({
        userId: postLikes.userId,
        userName: postLikes.userName,
        userAvatar: postLikes.userAvatar,
      })
      .from(postLikes)
      .where(eq(postLikes.postId, postId))
      .orderBy(desc(postLikes.createdAt));

    return {
      success: true,
      post: {
        ...post,
        contactEmail: post.showContactEmail ? user?.email : null,
        contactPhone: post.showContactPhone ? profile?.phone : null,
        contactCountry: post.showContactCountry ? profile?.country : null,
        likeCount: likeCountResult[0]?.value || 0,
        likedByMe,
        likers,
      },
    };
  },
  ["posts-detail"],
  { revalidate: 300, tags: ["posts"] }
);

const _getCachedPosts = unstable_cache(
  async (limit: number, cursor: string | undefined, currentUserId: string | null) => {
    const whereClause = cursor ? lt(posts.createdAt, cursor) : undefined;

    const list = await db
      .select({
        post: posts,
        profile: profiles,
        user: users,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.userId, profiles.userId))
      .leftJoin(users, eq(posts.userId, users.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1);

    const hasMore = list.length > limit;
    const items = hasMore ? list.slice(0, limit) : list;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].post.createdAt : null;

    const formattedPosts = await Promise.all(items.map(async ({ post, profile, user }) => {
      const likeCountResult = await db
        .select({ value: count() })
        .from(postLikes)
        .where(eq(postLikes.postId, post.id));

      let likedByMe = false;
      if (currentUserId) {
        const myLike = await db
          .select()
          .from(postLikes)
          .where(eq(postLikes.postId, post.id))
          .where(eq(postLikes.userId, currentUserId))
          .limit(1);
        likedByMe = myLike.length > 0;
      }

      return {
        ...post,
        contactEmail: post.showContactEmail ? user?.email : null,
        contactPhone: post.showContactPhone ? profile?.phone : null,
        contactCountry: post.showContactCountry ? profile?.country : null,
        likeCount: likeCountResult[0]?.value || 0,
        likedByMe,
      };
    }));

    return { success: true, posts: formattedPosts, nextCursor, hasMore };
  },
  ["posts-list"],
  { revalidate: 300, tags: ["posts"] }
);

const _getCachedPostLikes = unstable_cache(
  async (postId: string) => {
    const likes = await db
      .select({
        userId: postLikes.userId,
        userName: postLikes.userName,
        userAvatar: postLikes.userAvatar,
      })
      .from(postLikes)
      .where(eq(postLikes.postId, postId))
      .orderBy(desc(postLikes.createdAt));

    return { success: true, likes };
  },
  ["post-likes"],
  { revalidate: 300, tags: ["posts"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function getPostById(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (dbUsers.length > 0) currentUserId = dbUsers[0].id;
    }

    return await _getCachedPostById(postId, currentUserId);
  } catch (error: any) {
    console.error("Error loading post:", error);
    return { success: false, error: "Failed to load post." };
  }
}

export async function getPosts(limit = 10, cursor?: string) {
  try {
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (dbUsers.length > 0) currentUserId = dbUsers[0].id;
    }

    return await _getCachedPosts(limit, cursor, currentUserId);
  } catch (error) {
    console.error("Error loading posts:", error);
    return { success: false, error: "Failed to load posts from database." };
  }
}

export async function createPost(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const imagesRaw = formData.get("images") as string;
    
    const showContactEmail = formData.get("showContactEmail") === "true";
    const showContactPhone = formData.get("showContactPhone") === "true";
    const showContactCountry = formData.get("showContactCountry") === "true";
    
    let images: string[] = [];
    if (imagesRaw) {
      try {
        images = JSON.parse(imagesRaw);
      } catch (e) {
        images = [];
      }
    }

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
    let profile = null;
    try {
      const profileRows = await db.select().from(profiles).where(eq(profiles.userId, dbUser.id)).limit(1);
      if (profileRows.length > 0 && profileRows[0].rolesJson) {
        profile = profileRows[0];
        const roles: string[] = JSON.parse(profileRows[0].rolesJson);
        if (roles.length > 0) {
          userRoleDisplay = roles.join(", ");
        }
      }
    } catch {
      // fallback to legacy role
    }

    const newPostId = `pst_${Math.random().toString(36).substring(2, 11)}`;

    const newPost = {
      id: newPostId,
      userId: dbUser.id,
      userName: dbUser.name,
      userRole: userRoleDisplay,
      userAvatar: dbUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      title: title.trim(),
      content: content.trim(),
      category: category,
      imagesJson: JSON.stringify(images.slice(0, 3)),
      showContactEmail,
      showContactPhone,
      showContactCountry,
    };

    await db.insert(posts).values(newPost);

    revalidateTag("posts");
    revalidatePath("/feed");

    return {
      success: true,
      post: {
        ...newPost,
        contactEmail: showContactEmail ? dbUser.email : null,
        contactPhone: showContactPhone ? profile?.phone : null,
        contactCountry: showContactCountry ? profile?.country : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message || "Failed to submit post." };
  }
}

export async function toggleLike(postId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      return { success: false, error: "User not found." };
    }
    const dbUser = dbUsers[0];

    const existing = await db
      .select()
      .from(postLikes)
      .where(eq(postLikes.postId, postId))
      .where(eq(postLikes.userId, dbUser.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(postLikes)
        .where(eq(postLikes.postId, postId))
        .where(eq(postLikes.userId, dbUser.id));
    } else {
      await db.insert(postLikes).values({
        postId,
        userId: dbUser.id,
        userName: dbUser.name,
        userAvatar: dbUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      });
    }

    const likeCount = await db
      .select({ value: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    revalidateTag("posts");
    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);

    return {
      success: true,
      liked: existing.length === 0,
      likeCount: likeCount[0]?.value || 0,
    };
  } catch (error: any) {
    console.error("Error toggling like:", error);
    return { success: false, error: error.message || "Failed to toggle like." };
  }
}

export async function getPostLikes(postId: string) {
  try {
    return await _getCachedPostLikes(postId);
  } catch (error: any) {
    console.error("Error getting post likes:", error);
    return { success: false, error: error.message || "Failed to get likes." };
  }
}
