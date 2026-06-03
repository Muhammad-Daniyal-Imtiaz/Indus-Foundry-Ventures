"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { posts, users, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPosts() {
  try {
    const list = await db
      .select({
        post: posts,
        profile: profiles,
        user: users,
      })
      .from(posts)
      .leftJoin(profiles, eq(posts.userId, profiles.userId))
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const formattedPosts = list.map(({ post, profile, user }) => {
      return {
        ...post,
        contactEmail: post.showContactEmail ? user?.email : null,
        contactPhone: post.showContactPhone ? profile?.phone : null,
        contactCountry: post.showContactCountry ? profile?.country : null,
      };
    });

    return { success: true, posts: formattedPosts };
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
    // Load current user details
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUsers.length === 0) {
      throw new Error("User record not found in database.");
    }

    const dbUser = dbUsers[0];

    // Get roles from profile
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
      imagesJson: JSON.stringify(images.slice(0, 3)), // Enforce max 3 images
      showContactEmail,
      showContactPhone,
      showContactCountry,
    };

    await db.insert(posts).values(newPost);
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
