"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { db } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { posts, profiles, users } from "@/db/schema";

// Get current user's posts
export async function getUserPosts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Not authenticated" };
  }
  const email = session.user.email.toLowerCase().trim();
  const dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (dbUser.length === 0) {
    return { success: false, error: "User not found" };
  }
  const userId = dbUser[0].id;
  const list = await db
    .select({
      post: posts,
      profile: profiles,
      user: users,
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.userId, profiles.userId))
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt));

  const userPosts = list.map(({ post, profile, user }) => ({
    ...post,
    contactEmail: post.showContactEmail ? user?.email : null,
    contactPhone: post.showContactPhone ? profile?.phone : null,
    contactCountry: post.showContactCountry ? profile?.country : null,
  }));

  return { success: true, posts: userPosts };
}

// Update a post (all fields editable)
export async function updatePost(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const postId = String(formData.get("postId") || "");
    const title = String(formData.get("title") || "").trim();
    const content = String(formData.get("content") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const imagesRaw = String(formData.get("images") || "[]");
    const showContactEmail = formData.get("showContactEmail") === "true";
    const showContactPhone = formData.get("showContactPhone") === "true";
    const showContactCountry = formData.get("showContactCountry") === "true";

    if (!postId || !title || !content || !category) {
      return { success: false, error: "Title, content, and category are required." };
    }

    let images: string[] = [];
    try {
      const parsed = JSON.parse(imagesRaw);
      images = Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 3) : [];
    } catch {
      images = [];
    }

    // verify ownership
    const email = session.user.email.toLowerCase().trim();
    const dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUser.length === 0) {
      return { success: false, error: "User not found" };
    }

    const userId = dbUser[0].id;
    const existing = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Post not found or not owned" };
    }

    await db
      .update(posts)
      .set({
        title,
        content,
        category,
        imagesJson: JSON.stringify(images),
        showContactEmail,
        showContactPhone,
        showContactCountry,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)));

    const updated = await db
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

    if (updated.length === 0) {
      return { success: false, error: "Updated post could not be loaded." };
    }

    const { post, profile, user } = updated[0];

    return {
      success: true,
      post: {
        ...post,
        contactEmail: post.showContactEmail ? user?.email : null,
        contactPhone: post.showContactPhone ? profile?.phone : null,
        contactCountry: post.showContactCountry ? profile?.country : null,
      },
    };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: "Failed to update post." };
  }
}

// Delete a post
export async function deletePost(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const postId = String(formData.get("postId") || "");
    if (!postId) {
      return { success: false, error: "Post ID is required." };
    }

    const email = session.user.email.toLowerCase().trim();
    const dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUser.length === 0) {
      return { success: false, error: "User not found" };
    }

    const userId = dbUser[0].id;
    await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post." };
  }
}
