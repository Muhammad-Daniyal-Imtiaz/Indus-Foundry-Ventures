"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { challenges, companyPages, users, challengeTeams, challengeSubmissions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// ─── Challenges CRUD ─────────────────────────────────────────────────────

export async function getAllChallenges() {
  try {
    const list = await db
      .select()
      .from(challenges)
      .orderBy(desc(challenges.createdAt));
      
    return { success: true, challenges: list };
  } catch (error: any) {
    console.error("Error fetching challenges:", error);
    return { success: false, error: "Failed to load challenges." };
  }
}

export async function getChallengeById(id: string) {
  try {
    const list = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    if (!list.length) return { success: false, error: "Challenge not found." };
    return { success: true, challenge: list[0] };
  } catch (error: any) {
    console.error("Error fetching challenge:", error);
    return { success: false, error: "Failed to load challenge." };
  }
}

export async function createChallenge(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) throw new Error("User not found");
    const dbUser = dbUsers[0];

    const companyPageId = formData.get("companyPageId") as string;
    let companyName = "";
    let companyLogo = null;
    let companySlug = null;

    if (companyPageId) {
      const cPages = await db.select().from(companyPages).where(eq(companyPages.id, companyPageId)).limit(1);
      if (cPages.length && cPages[0].ownerId === dbUser.id) {
        companyName = cPages[0].name;
        companyLogo = cPages[0].logoUrl;
        companySlug = cPages[0].slug;
      } else {
        throw new Error("Invalid company page.");
      }
    } else {
      throw new Error("Challenges must be posted by a verified Company Page.");
    }

    const prizesJsonRaw = formData.get("prizesJson") as string;
    let prizes: string[] = [];
    try {
      prizes = JSON.parse(prizesJsonRaw || "[]");
    } catch { prizes = []; }
    if (!prizes.length || !prizes[0]?.trim()) {
      throw new Error("At least one prize is required.");
    }
    prizes = prizes.slice(0, 20).filter(p => p.trim());

    const newChallengeId = `chal_${Math.random().toString(36).substring(2, 11)}`;
    const challengeData = {
      id: newChallengeId,
      postedByUserId: dbUser.id,
      companyPageId,
      companyName,
      companyLogo,
      companySlug,
      title: (formData.get("title") as string)?.trim() || "Untitled Challenge",
      description: (formData.get("description") as string)?.trim() || "",
      prizesJson: JSON.stringify(prizes),
      duration: (formData.get("duration") as string)?.trim() || "",
      location: (formData.get("location") as string)?.trim() || "",
      minTeamMembers: parseInt(formData.get("minTeamMembers") as string) || 1,
      maxTeamMembers: parseInt(formData.get("maxTeamMembers") as string) || 5,
      category: (formData.get("category") as string)?.trim() || "Engineering",
      status: "Open"
    };

    await db.insert(challenges).values(challengeData);
    
    return { success: true, challenge: challengeData };
  } catch (error: any) {
    console.error("Error creating challenge:", error);
    return { success: false, error: error.message || "Failed to create challenge." };
  }
}

export async function updateChallenge(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) throw new Error("User not found");
    const dbUser = dbUsers[0];

    const existing = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    if (!existing.length) throw new Error("Challenge not found");
    if (existing[0].postedByUserId !== dbUser.id) throw new Error("Unauthorized to edit this challenge");

    const prizesJsonRaw = formData.get("prizesJson") as string;
    let prizes: string[] = [];
    try {
      prizes = JSON.parse(prizesJsonRaw || "[]");
    } catch { prizes = []; }
    if (!prizes.length || !prizes[0]?.trim()) {
      throw new Error("At least one prize is required.");
    }
    prizes = prizes.slice(0, 20).filter(p => p.trim());

    const updateData = {
      title: (formData.get("title") as string)?.trim(),
      description: (formData.get("description") as string)?.trim(),
      prizesJson: JSON.stringify(prizes),
      duration: (formData.get("duration") as string)?.trim(),
      location: (formData.get("location") as string)?.trim(),
      minTeamMembers: parseInt(formData.get("minTeamMembers") as string) || 1,
      maxTeamMembers: parseInt(formData.get("maxTeamMembers") as string) || 5,
      category: (formData.get("category") as string)?.trim() || "Engineering",
    };

    await db.update(challenges).set(updateData).where(eq(challenges.id, id));

    return { success: true, challenge: { ...existing[0], ...updateData } };
  } catch (error: any) {
    console.error("Error updating challenge:", error);
    return { success: false, error: error.message || "Failed to update challenge." };
  }
}

export async function deleteChallenge(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");
    
    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) throw new Error("User not found");
    const dbUser = dbUsers[0];

    const existing = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    if (!existing.length) throw new Error("Challenge not found");
    if (existing[0].postedByUserId !== dbUser.id) throw new Error("Unauthorized to delete this challenge");

    await db.delete(challenges).where(eq(challenges.id, id));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting challenge:", error);
    return { success: false, error: error.message || "Failed to delete challenge." };
  }
}

// ─── Challenge Teams ─────────────────────────────────────────────────────

export async function createChallengeTeam(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) throw new Error("User not found");
    const dbUser = dbUsers[0];

    const challengeId = formData.get("challengeId") as string;
    const teamName = (formData.get("teamName") as string)?.trim();
    if (!teamName) throw new Error("Team name is required.");

    const membersJsonRaw = formData.get("membersJson") as string;
    let members: any[] = [];
    try { members = JSON.parse(membersJsonRaw || "[]"); } catch { members = []; }

    const teamId = `team_${Math.random().toString(36).substring(2, 11)}`;
    const teamData = {
      id: teamId,
      challengeId,
      teamName,
      captainUserId: dbUser.id,
      membersJson: JSON.stringify(members),
      invitationStatus: "Active",
    };

    await db.insert(challengeTeams).values(teamData);
    return { success: true, team: teamData };
  } catch (error: any) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message || "Failed to create team." };
  }
}

export async function getChallengeTeams(challengeId: string) {
  try {
    const list = await db
      .select()
      .from(challengeTeams)
      .where(eq(challengeTeams.challengeId, challengeId))
      .orderBy(desc(challengeTeams.createdAt));
    return { success: true, teams: list };
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return { success: false, error: "Failed to load teams." };
  }
}

export async function getUserTeamForChallenge(challengeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found" };
    const dbUser = dbUsers[0];

    const team = await db
      .select()
      .from(challengeTeams)
      .where(
        and(
          eq(challengeTeams.challengeId, challengeId),
          eq(challengeTeams.captainUserId, dbUser.id)
        )
      )
      .limit(1);

    if (!team.length) return { success: false, error: "No team found." };
    return { success: true, team: team[0] };
  } catch (error: any) {
    console.error("Error fetching user team:", error);
    return { success: false, error: "Failed to load team." };
  }
}

// ─── Challenge Submissions ───────────────────────────────────────────────

export async function createChallengeSubmission(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Unauthorized");

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) throw new Error("User not found");
    const dbUser = dbUsers[0];

    const challengeId = formData.get("challengeId") as string;
    const teamId = formData.get("teamId") as string;
    const teamName = (formData.get("teamName") as string)?.trim();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const videoLink = formData.get("videoLink") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const liveDemoUrl = formData.get("liveDemoUrl") as string;
    const techStackJson = formData.get("techStackJson") as string;
    const teamMembersJson = formData.get("teamMembersJson") as string;
    const additionalLinksJson = formData.get("additionalLinksJson") as string;

    if (!title) throw new Error("Submission title is required.");
    if (!description) throw new Error("Submission description is required.");

    const submissionId = `sub_${Math.random().toString(36).substring(2, 11)}`;
    const submissionData = {
      id: submissionId,
      challengeId,
      teamId,
      captainUserId: dbUser.id,
      teamName: teamName || "",
      title,
      description,
      videoLink: videoLink || null,
      githubUrl: githubUrl || null,
      liveDemoUrl: liveDemoUrl || null,
      techStackJson: techStackJson || "[]",
      teamMembersJson: teamMembersJson || "[]",
      additionalLinksJson: additionalLinksJson || "[]",
      status: "Submitted",
      judgeNotes: null,
      prizeWon: null,
    };

    await db.insert(challengeSubmissions).values(submissionData);
    return { success: true, submission: submissionData };
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return { success: false, error: error.message || "Failed to create submission." };
  }
}

export async function getChallengeSubmissions(challengeId: string) {
  try {
    const list = await db
      .select()
      .from(challengeSubmissions)
      .where(eq(challengeSubmissions.challengeId, challengeId))
      .orderBy(desc(challengeSubmissions.createdAt));
    return { success: true, submissions: list };
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return { success: false, error: "Failed to load submissions." };
  }
}

export async function getUserSubmissionForChallenge(challengeId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found" };
    const dbUser = dbUsers[0];

    const sub = await db
      .select()
      .from(challengeSubmissions)
      .where(
        and(
          eq(challengeSubmissions.challengeId, challengeId),
          eq(challengeSubmissions.captainUserId, dbUser.id)
        )
      )
      .limit(1);

    if (!sub.length) return { success: false, error: "No submission found." };
    return { success: true, submission: sub[0] };
  } catch (error: any) {
    console.error("Error fetching user submission:", error);
    return { success: false, error: "Failed to load submission." };
  }
}
