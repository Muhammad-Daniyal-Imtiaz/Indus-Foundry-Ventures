"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { freelanceProjects, users, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getFreelanceProjects() {
  try {
    const list = await db
      .select({
        project: freelanceProjects,
        profile: profiles,
        user: users,
      })
      .from(freelanceProjects)
      .leftJoin(profiles, eq(freelanceProjects.userId, profiles.userId))
      .leftJoin(users, eq(freelanceProjects.userId, users.id))
      .orderBy(desc(freelanceProjects.createdAt));

    const formattedProjects = list.map(({ project }) => {
      return {
        ...project,
        skills: project.skills ? project.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        secondaryIndustries: project.secondaryIndustries ? JSON.parse(project.secondaryIndustries) : [],
      };
    });

    return { success: true, projects: formattedProjects };
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
    return { 
      success: true, 
      project: { 
        ...newProject, 
        skills,
        secondaryIndustries,
      } 
    };
  } catch (error: any) {
    console.error("Error creating freelance project:", error);
    return { success: false, error: error.message || "Failed to submit freelance project." };
  }
}
