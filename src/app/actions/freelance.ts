"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { freelanceProjects, users, profiles, freelanceSubmissions } from "@/db/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache, cacheLife } from "next/cache";

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedFreelanceProjects = unstable_cache(
  async (limit: number, cursor: string | undefined, currentUserId: string | null) => {
    cacheLife("freelance");

    const whereClause = cursor ? lt(freelanceProjects.createdAt, cursor) : undefined;

    const list = await db
      .select({
        project: freelanceProjects,
        profile: profiles,
        user: users,
      })
      .from(freelanceProjects)
      .leftJoin(profiles, eq(freelanceProjects.userId, profiles.userId))
      .leftJoin(users, eq(freelanceProjects.userId, users.id))
      .where(whereClause)
      .orderBy(desc(freelanceProjects.createdAt))
      .limit(limit + 1);

    const hasMore = list.length > limit;
    const items = hasMore ? list.slice(0, limit) : list;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].project.createdAt : null;

    let appliedProjectIds = new Set<string>();
    let allSubmissions: any[] = [];

    if (currentUserId) {
      const apps = await db.select({ projectId: freelanceSubmissions.projectId }).from(freelanceSubmissions).where(eq(freelanceSubmissions.applicantUserId, currentUserId));
      appliedProjectIds = new Set(apps.map(a => a.projectId));
      
      allSubmissions = await db
        .select({
          submission: freelanceSubmissions,
          user: users,
        })
        .from(freelanceSubmissions)
        .leftJoin(users, eq(freelanceSubmissions.applicantUserId, users.id))
        .leftJoin(freelanceProjects, eq(freelanceSubmissions.projectId, freelanceProjects.id))
        .where(eq(freelanceProjects.userId, currentUserId));
    }

    const formattedProjects = items.map(({ project }) => {
      const isOwner = currentUserId === project.userId;
      const projectSubs = isOwner 
        ? allSubmissions.filter(s => s.submission.projectId === project.id).map(s => ({ ...s.submission, applicantName: s.user?.name, applicantAvatar: s.user?.avatarUrl }))
        : [];

      return {
        ...project,
        skills: project.skills ? project.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        secondaryIndustries: project.secondaryIndustries ? JSON.parse(project.secondaryIndustries) : [],
        hasApplied: appliedProjectIds.has(project.id),
        isOwner,
        submissions: projectSubs,
      };
    });

    return { success: true, projects: formattedProjects, nextCursor, hasMore };
  },
  ["freelance-list"],
  { revalidate: 600, tags: ["freelance"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function getFreelanceProjects(limit = 10, cursor?: string) {
  try {
    const session = await getServerSession(authOptions);
    let currentUserEmail = session?.user?.email?.toLowerCase().trim();
    let currentUserId: string | null = null;

    if (currentUserEmail) {
      const dbUsers = await db.select().from(users).where(eq(users.email, currentUserEmail)).limit(1);
      if (dbUsers.length > 0) {
        currentUserId = dbUsers[0].id;
      }
    }

    return await _getCachedFreelanceProjects(limit, cursor, currentUserId);
  } catch (error) {
    console.error("Error loading freelance projects:", error);
    return { success: false, error: "Failed to load freelance projects from database." };
  }
}

export async function createFreelanceProject(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const client = formData.get("client") as string;
    const budget = formData.get("budget") as string;
    const budgetType = formData.get("budgetType") as string;
    const duration = formData.get("duration") as string;
    const primaryIndustry = formData.get("primaryIndustry") as string;
    const secondaryIndustriesRaw = formData.get("secondaryIndustries") as string;
    const skillsRaw = formData.get("skills") as string;
    const description = formData.get("description") as string;

    const skills = skillsRaw ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];
    const secondaryIndustries = secondaryIndustriesRaw ? JSON.parse(secondaryIndustriesRaw) : [];

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

    const newProjectId = `f_${Math.random().toString(36).substring(2, 11)}`;

    const newProject = {
      id: newProjectId,
      userId: dbUser.id,
      userName: dbUser.name,
      userRole: userRoleDisplay,
      userAvatar: dbUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dbUser.name)}`,
      title: title.trim(),
      client: client.trim(),
      budget: budget,
      budgetType: budgetType,
      duration: duration,
      primaryIndustry: primaryIndustry,
      secondaryIndustries: JSON.stringify(secondaryIndustries),
      skills: skills.join(","),
      description: description.trim(),
    };

    await db.insert(freelanceProjects).values(newProject);

    revalidateTag("freelance");
    revalidatePath("/freelance");

    return { 
      success: true, 
      project: { 
        ...newProject, 
        skills,
        secondaryIndustries,
        hasApplied: false,
        isOwner: true,
        submissions: [],
      } 
    };
  } catch (error: any) {
    console.error("Error creating freelance project:", error);
    return { success: false, error: error.message || "Failed to submit freelance project." };
  }
}

export async function submitFreelanceProposal(projectId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Please sign in to submit a proposal." };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const existingSub = await db
      .select({ id: freelanceSubmissions.id })
      .from(freelanceSubmissions)
      .where(and(eq(freelanceSubmissions.projectId, projectId), eq(freelanceSubmissions.applicantUserId, dbUser.id)))
      .limit(1);

    if (existingSub.length) return { success: false, error: "You already submitted a proposal for this project." };

    const name = (formData.get("name") as string)?.trim() || dbUser.name;
    const applicantEmail = (formData.get("email") as string)?.trim() || email;
    const proposalText = (formData.get("proposalText") as string)?.trim();
    const portfolioLink = (formData.get("portfolioLink") as string)?.trim() || null;
    const bidAmount = parseInt(formData.get("bidAmount") as string) || null;

    if (!proposalText) {
      return { success: false, error: "Proposal text is required." };
    }

    const id = `fsub_${Math.random().toString(36).substring(2, 11)}`;
    const submission = {
      id,
      projectId,
      applicantUserId: dbUser.id,
      name,
      email: applicantEmail,
      proposalText,
      portfolioLink,
      bidAmount,
    };

    await db.insert(freelanceSubmissions).values(submission);

    revalidateTag("freelance");
    revalidatePath("/freelance");

    return { success: true, submission };
  } catch (err: any) {
    console.error("submitFreelanceProposal error:", err);
    return { success: false, error: err.message || "Failed to submit proposal." };
  }
}
