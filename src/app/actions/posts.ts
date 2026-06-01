"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPosts() {
  try {
    const list = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return { success: true, posts: list };
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
    // Load current user details to check their role
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      throw new Error("User record not found in database.");
    }

    const dbUser = dbUsers[0];
    const newPostId = `pst_${Math.random().toString(36).substring(2, 11)}`;

    const newPost = {
      id: newPostId,
      userId: dbUser.id,
      userName: dbUser.name,
      userRole: dbUser.role,
      userAvatar: dbUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      title: title.trim(),
      content: content.trim(),
      category: category,
      imagesJson: JSON.stringify(images.slice(0, 3)), // Enforce max 3 images
    };

    await db.insert(posts).values(newPost);
    return { success: true, post: newPost };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, error: error.message || "Failed to submit post." };
  }
}
