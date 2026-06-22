"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { jobPostings, jobApplications, users, companyPages } from "@/db/schema";
import { eq, desc, and, sql, lt } from "drizzle-orm";
import { revalidateTag, revalidatePath, unstable_cache } from "next/cache";

// ─── Cached inner functions ─────────────────────────────────────────────

const _getCachedJobs = unstable_cache(
  async (
    filters: { industry?: string; employmentType?: string; experienceLevel?: string; locationType?: string } | undefined,
    limit: number,
    cursor: string | undefined,
    currentUserId: string | null
  ) => {
    const conditions = [eq(jobPostings.isOpen, true)];
    if (cursor) {
      conditions.push(lt(jobPostings.createdAt, cursor));
    }

    const jobs = await db.select().from(jobPostings)
      .where(and(...conditions))
      .orderBy(
        desc(jobPostings.isFeatured),
        desc(jobPostings.createdAt)
      )
      .limit(limit + 1);

    const hasMore = jobs.length > limit;
    const items = hasMore ? jobs.slice(0, limit) : jobs;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt : null;

    let filtered = items;
    if (filters?.industry && filters.industry !== "All") {
      filtered = filtered.filter((j) => j.industry === filters.industry);
    }
    if (filters?.employmentType && filters.employmentType !== "All") {
      filtered = filtered.filter((j) => j.employmentType === filters.employmentType);
    }
    if (filters?.experienceLevel && filters.experienceLevel !== "All") {
      filtered = filtered.filter((j) => j.experienceLevel === filters.experienceLevel);
    }
    if (filters?.locationType && filters.locationType !== "All") {
      filtered = filtered.filter((j) => j.locationType === filters.locationType);
    }

    let userAppliedJobIds = new Set<string>();
    if (currentUserId) {
      const apps = await db.select({ jobId: jobApplications.jobId }).from(jobApplications).where(eq(jobApplications.applicantUserId, currentUserId));
      userAppliedJobIds = new Set(apps.map(a => a.jobId));
    }

    return {
      success: true,
      jobs: filtered.map((j) => ({
        ...j,
        skills: JSON.parse(j.skillsJson || "[]") as string[],
        requirements: JSON.parse(j.requirementsJson || "[]") as string[],
        benefits: JSON.parse(j.benefitsJson || "[]") as string[],
        hasApplied: userAppliedJobIds.has(j.id),
      })),
      nextCursor,
      hasMore,
    };
  },
  ["jobs-list"],
  { revalidate: 600, tags: ["jobs"] }
);

// ─── Exported server actions ────────────────────────────────────────────

export async function createJobPosting(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const selectedCompanyPageId = (formData.get("companyPageId") as string)?.trim();
    if (!selectedCompanyPageId) {
      return { success: false, error: "Please select which company is posting this job." };
    }

    const companyRows = await db
      .select()
      .from(companyPages)
      .where(and(eq(companyPages.id, selectedCompanyPageId), eq(companyPages.ownerId, dbUser.id)))
      .limit(1);

    if (!companyRows.length) {
      return { success: false, error: "Selected company was not found or is not owned by you." };
    }

    const company = companyRows[0];
    const companyPageId = company.id;
    const companyName = company.name;
    const companyLogo = company.logoUrl;
    const companySlug = company.slug;

    const title = (formData.get("title") as string).trim();
    const department = (formData.get("department") as string) || null;
    const employmentType = formData.get("employmentType") as string;
    const locationType = formData.get("locationType") as string;
    const location = (formData.get("location") as string).trim();
    const salaryMin = parseInt(formData.get("salaryMin") as string) || null;
    const salaryMax = parseInt(formData.get("salaryMax") as string) || null;
    const salaryCurrency = (formData.get("salaryCurrency") as string) || "PKR";
    const salaryPeriod = (formData.get("salaryPeriod") as string) || "Monthly";
    const experienceLevel = formData.get("experienceLevel") as string;
    const industry = formData.get("industry") as string;
    const skillsRaw = formData.get("skills") as string;
    const skills = skillsRaw ? JSON.parse(skillsRaw) : [];
    const description = (formData.get("description") as string).trim();
    const requirementsRaw = formData.get("requirements") as string;
    const requirements = requirementsRaw ? JSON.parse(requirementsRaw) : [];
    const benefitsRaw = formData.get("benefits") as string;
    const benefits = benefitsRaw ? JSON.parse(benefitsRaw) : [];
    const deadline = (formData.get("applicationDeadline") as string) || null;

    const id = `job_${Math.random().toString(36).substring(2, 11)}`;
    const job = {
      id,
      companyPageId,
      postedByUserId: dbUser.id,
      companyName,
      companyLogo,
      companySlug,
      title,
      department,
      employmentType,
      locationType,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      experienceLevel,
      industry,
      skillsJson: JSON.stringify(skills),
      description,
      requirementsJson: JSON.stringify(requirements),
      benefitsJson: JSON.stringify(benefits),
      applicationDeadline: deadline,
    };

    await db.insert(jobPostings).values(job);

    revalidateTag("jobs");
    revalidatePath("/jobs");

    return {
      success: true,
      job: { ...job, skills, requirements, benefits },
    };
  } catch (err: any) {
    console.error("createJobPosting error:", err);
    return { success: false, error: err.message || "Failed to create job posting." };
  }
}

export async function getAllJobs(filters?: {
  industry?: string;
  employmentType?: string;
  experienceLevel?: string;
  locationType?: string;
}, limit = 10, cursor?: string) {
  try {
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim();
      const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (dbUsers.length) currentUserId = dbUsers[0].id;
    }

    return await _getCachedJobs(filters, limit, cursor, currentUserId);
  } catch (err: any) {
    return { success: false, jobs: [], error: err.message };
  }
}

export async function getJobById(id: string) {
  try {
    const rows = await db.select().from(jobPostings).where(eq(jobPostings.id, id)).limit(1);
    if (!rows.length) return { success: false, error: "Job not found." };

    const job = rows[0];
    // Increment views (side effect — not cached)
    await db
      .update(jobPostings)
      .set({ viewsCount: sql`${jobPostings.viewsCount} + 1` })
      .where(eq(jobPostings.id, id));

    return {
      success: true,
      job: {
        ...job,
        skills: JSON.parse(job.skillsJson || "[]") as string[],
        requirements: JSON.parse(job.requirementsJson || "[]") as string[],
        benefits: JSON.parse(job.benefitsJson || "[]") as string[],
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function applyForJob(jobId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Please sign in to apply." };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const existingApp = await db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.applicantUserId, dbUser.id)))
      .limit(1);

    if (existingApp.length) return { success: false, error: "You already applied to this job." };
    const name = (formData.get("name") as string)?.trim();
    const candidateEmail = (formData.get("email") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const resumeUrl = (formData.get("resumeUrl") as string)?.trim();
    const portfolioLink = (formData.get("portfolioLink") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const coverNote = (formData.get("coverNote") as string)?.trim() || null;
    const coverLetterUrl = (formData.get("coverLetterUrl") as string)?.trim() || "";

    if (!name || !candidateEmail || !address || !resumeUrl) {
      return { success: false, error: "Name, Email, Address, and CV (Resume URL) are required." };
    }

    const id = `app_${Math.random().toString(36).substring(2, 11)}`;
    const application = {
      id,
      jobId,
      applicantUserId: dbUser.id,
      name,
      email: candidateEmail,
      address,
      resumeUrl,
      portfolioLink,
      phone,
      coverNote,
      coverLetterUrl,
    };

    await db.insert(jobApplications).values(application);

    await db
      .update(jobPostings)
      .set({ applicationsCount: sql`${jobPostings.applicationsCount} + 1` })
      .where(eq(jobPostings.id, jobId));

    revalidateTag("jobs");
    revalidatePath("/jobs");

    return { success: true, application };
  } catch (err: any) {
    console.error("applyForJob error:", err);
    return { success: false, error: err.message || "Failed to submit application." };
  }
}

export async function deleteJobPosting(jobId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const jobRows = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
    if (!jobRows.length) return { success: false, error: "Job not found." };
    const job = jobRows[0];

    if (!job.companyPageId) {
      return { success: false, error: "Invalid job posting." };
    }
    const companyRows = await db.select().from(companyPages).where(eq(companyPages.id, job.companyPageId)).limit(1);
    if (!companyRows.length || companyRows[0].ownerId !== dbUser.id) {
      return { success: false, error: "Unauthorized. Only the company owner can delete this job." };
    }

    await db.delete(jobApplications).where(eq(jobApplications.jobId, jobId));
    await db.delete(jobPostings).where(eq(jobPostings.id, jobId));

    revalidateTag("jobs");
    revalidatePath("/jobs");

    return { success: true };
  } catch (err: any) {
    console.error("deleteJobPosting error:", err);
    return { success: false, error: err.message || "Failed to delete job." };
  }
}

export async function updateJobPosting(jobId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, error: "User not found." };
    const dbUser = dbUsers[0];

    const jobRows = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
    if (!jobRows.length) return { success: false, error: "Job not found." };
    const existingJob = jobRows[0];

    if (!existingJob.companyPageId) {
      return { success: false, error: "Invalid job posting." };
    }
    const companyRows = await db.select().from(companyPages).where(eq(companyPages.id, existingJob.companyPageId)).limit(1);
    if (!companyRows.length || companyRows[0].ownerId !== dbUser.id) {
      return { success: false, error: "Unauthorized. Only the company owner can edit this job." };
    }

    const title = (formData.get("title") as string).trim();
    const department = (formData.get("department") as string) || null;
    const employmentType = formData.get("employmentType") as string;
    const locationType = formData.get("locationType") as string;
    const location = (formData.get("location") as string).trim();
    const salaryMin = parseInt(formData.get("salaryMin") as string) || null;
    const salaryMax = parseInt(formData.get("salaryMax") as string) || null;
    const salaryCurrency = (formData.get("salaryCurrency") as string) || "PKR";
    const salaryPeriod = (formData.get("salaryPeriod") as string) || "Monthly";
    const experienceLevel = formData.get("experienceLevel") as string;
    const industry = formData.get("industry") as string;
    const skillsRaw = formData.get("skills") as string;
    const skills = skillsRaw ? JSON.parse(skillsRaw) : [];
    const description = (formData.get("description") as string).trim();
    const requirementsRaw = formData.get("requirements") as string;
    const requirements = requirementsRaw ? JSON.parse(requirementsRaw) : [];
    const benefitsRaw = formData.get("benefits") as string;
    const benefits = benefitsRaw ? JSON.parse(benefitsRaw) : [];
    const deadline = (formData.get("applicationDeadline") as string) || null;

    const jobUpdate = {
      title,
      department,
      employmentType,
      locationType,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      experienceLevel,
      industry,
      skillsJson: JSON.stringify(skills),
      description,
      requirementsJson: JSON.stringify(requirements),
      benefitsJson: JSON.stringify(benefits),
      applicationDeadline: deadline,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    await db.update(jobPostings).set(jobUpdate).where(eq(jobPostings.id, jobId));

    revalidateTag("jobs");
    revalidatePath("/jobs");

    return {
      success: true,
      job: { ...existingJob, ...jobUpdate, skills, requirements, benefits },
    };
  } catch (err: any) {
    console.error("updateJobPosting error:", err);
    return { success: false, error: err.message || "Failed to update job posting." };
  }
}

export async function getMyApplications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, applications: [] };

    const email = session.user.email.toLowerCase().trim();
    const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!dbUsers.length) return { success: false, applications: [] };

    const apps = await db
      .select({ app: jobApplications, job: jobPostings })
      .from(jobApplications)
      .leftJoin(jobPostings, eq(jobApplications.jobId, jobPostings.id))
      .where(eq(jobApplications.applicantUserId, dbUsers[0].id))
      .orderBy(desc(jobApplications.createdAt));

    return { success: true, applications: apps };
  } catch (err: any) {
    return { success: false, applications: [], error: err.message };
  }
}
