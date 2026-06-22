"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { companyPages, users, jobPostings, jobApplications } from "@/db/schema";
import { eq, desc, like, sql, and, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache, cacheLife } from "next/cache";

// ─── Helpers ────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedCompanyPages = unstable_cache(
  async (limit: number, cursor: string | undefined) => {
    cacheLife("companies");

    const whereClause = cursor ? lt(companyPages.createdAt, cursor) : undefined;

    const rows = await db
      .select()
      .from(companyPages)
      .where(whereClause)
      .orderBy(desc(companyPages.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt : null;

    return {
      success: true,
      pages: items.map((p) => ({
        ...p,
        specialties: JSON.parse(p.specialtiesJson || "[]") as string[],
      })),
      nextCursor,
      hasMore,
    };
  },
  ["companies-list"],
  { revalidate: 600, tags: ["companies"] }
);

const _getCachedCompanyPageBySlug = unstable_cache(
  async (slug: string) => {
    cacheLife("companies");

    const rows = await db
      .select({ page: companyPages, owner: users })
      .from(companyPages)
      .leftJoin(users, eq(companyPages.ownerId, users.id))
      .where(eq(companyPages.slug, slug))
      .limit(1);

    if (!rows.length) return { success: false, error: "Company page not found." };

    const { page, owner } = rows[0];
    return {
      success: true,
      page: {
        ...page,
        specialties: JSON.parse(page.specialtiesJson || "[]") as string[],
        ownerName: owner?.name,
        ownerAvatar: owner?.avatarUrl,
      },
    };
  },
  ["company-detail"],
  { revalidate: 600, tags: ["companies"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function createCompanyPage(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const name = (formData.get("name") as string).trim();
    const tagline = (formData.get("tagline") as string).trim();
    const about = (formData.get("about") as string).trim();
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const stage = formData.get("stage") as string;
    const founded = (formData.get("founded") as string) || null;
    const headquarters = (formData.get("headquarters") as string) || null;
    const website = (formData.get("website") as string) || null;
    const linkedinUrl = (formData.get("linkedinUrl") as string) || null;
    const twitterUrl = (formData.get("twitterUrl") as string) || null;
    const logoUrl = (formData.get("logoUrl") as string) || null;
    const bannerUrl = (formData.get("bannerUrl") as string) || null;
    const specialtiesRaw = formData.get("specialties") as string;
    const specialties = specialtiesRaw ? JSON.parse(specialtiesRaw) : [];

    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const taken = await db
        .select({ id: companyPages.id })
        .from(companyPages)
        .where(eq(companyPages.slug, slug))
        .limit(1);
      if (!taken.length) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const id = `cp_${Math.random().toString(36).substring(2, 11)}`;
    const page = {
      id,
      ownerId: dbUser.id,
      slug,
      name,
      tagline,
      about,
      industry,
      companySize,
      stage,
      founded,
      headquarters,
      website,
      linkedinUrl,
      twitterUrl,
      logoUrl,
      bannerUrl,
      specialtiesJson: JSON.stringify(specialties),
    };

    await db.insert(companyPages).values(page);

    revalidateTag("companies");
    revalidatePath("/company");

    return { success: true, slug, page: { ...page, specialties } };
  } catch (err: any) {
    console.error("createCompanyPage error:", err);
    return { success: false, error: err.message || "Failed to create company page." };
  }
}

export async function getCompanyPageBySlug(slug: string) {
  try {
    return await _getCachedCompanyPageBySlug(slug);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMyCompanyPage() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, page: null };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, page: null };

    const rows = await db
      .select()
      .from(companyPages)
      .where(eq(companyPages.ownerId, dbUsers[0].id))
      .limit(1);

    if (!rows.length) return { success: true, page: null };
    const page = rows[0];
    return {
      success: true,
      page: { ...page, specialties: JSON.parse(page.specialtiesJson || "[]") as string[] },
    };
  } catch (err: any) {
    return { success: false, page: null };
  }
}

export async function getMyCompanyPages() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, pages: [] };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, pages: [] };

    const rows = await db
      .select()
      .from(companyPages)
      .where(eq(companyPages.ownerId, dbUsers[0].id))
      .orderBy(desc(companyPages.createdAt));

    return {
      success: true,
      pages: rows.map((page) => ({
        ...page,
        specialties: JSON.parse(page.specialtiesJson || "[]") as string[],
      })),
    };
  } catch (err: any) {
    return { success: false, pages: [], error: err.message };
  }
}

export async function getAllCompanyPages(limit = 10, cursor?: string) {
  try {
    return await _getCachedCompanyPages(limit, cursor);
  } catch (err: any) {
    return { success: false, pages: [], error: err.message };
  }
}

export async function updateCompanyPage(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const pageId = formData.get("pageId") as string;
    if (!pageId) return { success: false, error: "Page ID is required." };

    const existing = await db.select().from(companyPages).where(eq(companyPages.id, pageId)).limit(1);
    if (!existing.length) return { success: false, error: "Company page not found." };
    if (existing[0].ownerId !== dbUser.id) return { success: false, error: "Not authorized to edit this page." };

    const name = (formData.get("name") as string).trim();
    const tagline = (formData.get("tagline") as string).trim();
    const about = (formData.get("about") as string).trim();
    const industry = formData.get("industry") as string;
    const companySize = formData.get("companySize") as string;
    const stage = formData.get("stage") as string;
    const founded = (formData.get("founded") as string) || null;
    const headquarters = (formData.get("headquarters") as string) || null;
    const website = (formData.get("website") as string) || null;
    const linkedinUrl = (formData.get("linkedinUrl") as string) || null;
    const twitterUrl = (formData.get("twitterUrl") as string) || null;
    const logoUrl = (formData.get("logoUrl") as string) || null;
    const bannerUrl = (formData.get("bannerUrl") as string) || null;
    const specialtiesRaw = formData.get("specialties") as string;
    const specialties = specialtiesRaw ? JSON.parse(specialtiesRaw) : [];

    let slug = existing[0].slug;
    const newBase = generateSlug(name);
    if (newBase !== existing[0].slug.split("-")[0]) {
      slug = newBase;
      let suffix = 1;
      while (true) {
        const taken = await db
          .select({ id: companyPages.id })
          .from(companyPages)
          .where(and(eq(companyPages.slug, slug), eq(companyPages.id, pageId)))
          .limit(1);
        if (!taken.length) break;
        slug = `${newBase}-${suffix++}`;
      }
    }

    await db
      .update(companyPages)
      .set({
        name,
        slug,
        tagline,
        about,
        industry,
        companySize,
        stage,
        founded,
        headquarters,
        website,
        linkedinUrl,
        twitterUrl,
        logoUrl,
        bannerUrl,
        specialtiesJson: JSON.stringify(specialties),
      })
      .where(eq(companyPages.id, pageId));

    revalidateTag("companies");
    revalidatePath("/company");

    return { success: true, slug, page: existing[0] };
  } catch (err: any) {
    console.error("updateCompanyPage error:", err);
    return { success: false, error: err.message || "Failed to update company page." };
  }
}

export async function getCompanySubmissions(slug: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const companyRows = await db
      .select()
      .from(companyPages)
      .where(eq(companyPages.slug, slug))
      .limit(1);

    if (!companyRows.length) return { success: false, error: "Company page not found." };
    const company = companyRows[0];

    if (company.ownerId !== dbUser.id) {
      return { success: false, error: "You are not the owner of this company page." };
    }

    const rawApps = await db
      .select()
      .from(jobApplications)
      .innerJoin(jobPostings, eq(jobApplications.jobId, jobPostings.id))
      .where(eq(jobPostings.companyPageId, company.id))
      .orderBy(desc(jobApplications.createdAt));

    const apps = rawApps.map((row) => ({
      id: row.job_applications.id,
      jobId: row.job_applications.jobId,
      applicantUserId: row.job_applications.applicantUserId,
      name: row.job_applications.name,
      email: row.job_applications.email,
      address: row.job_applications.address,
      resumeUrl: row.job_applications.resumeUrl,
      portfolioLink: row.job_applications.portfolioLink,
      phone: row.job_applications.phone,
      coverNote: (row.job_applications as any).coverNote || null,
      coverLetterUrl: (row.job_applications as any).coverLetterUrl || null,
      status: row.job_applications.status,
      createdAt: row.job_applications.createdAt,
      jobTitle: row.job_postings.title,
    }));

    return { success: true, submissions: apps };
  } catch (err: any) {
    console.error("getCompanySubmissions error:", err);
    return { success: true, submissions: [] };
  }
}
