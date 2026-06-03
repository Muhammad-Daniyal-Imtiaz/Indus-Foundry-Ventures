"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { jobPostings, jobApplications, users, companyPages } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

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
}) {
  try {
    let query = db.select().from(jobPostings).where(eq(jobPostings.isOpen, true));

    const jobs = await query.orderBy(
      desc(jobPostings.isFeatured),
      desc(jobPostings.createdAt)
    );

    let filtered = jobs;
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

    return {
      success: true,
      jobs: filtered.map((j) => ({
        ...j,
        skills: JSON.parse(j.skillsJson || "[]") as string[],
        requirements: JSON.parse(j.requirementsJson || "[]") as string[],
        benefits: JSON.parse(j.benefitsJson || "[]") as string[],
      })),
    };
  } catch (err: any) {
    return { success: false, jobs: [], error: err.message };
  }
}

export async function getJobById(id: string) {
  try {
    const rows = await db.select().from(jobPostings).where(eq(jobPostings.id, id)).limit(1);
    if (!rows.length) return { success: false, error: "Job not found." };

    const job = rows[0];
    // Increment views
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

    // Check existing application
    const existingApp = await db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.applicantUserId, dbUser.id)))
      .limit(1);

    if (existingApp.length) return { success: false, error: "You already applied to this job." };

    const resumeUrl = (formData.get("resumeUrl") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const coverNote = (formData.get("coverNote") as string)?.trim() || null;

    if (!resumeUrl || !phone) {
      return { success: false, error: "Resume URL and phone are required." };
    }

    const id = `app_${Math.random().toString(36).substring(2, 11)}`;
    const application = {
      id,
      jobId,
      applicantUserId: dbUser.id,
      resumeUrl,
      phone,
      coverNote,
    };

    await db.insert(jobApplications).values(application);

    // Increment applicationsCount
    await db
      .update(jobPostings)
      .set({ applicationsCount: sql`${jobPostings.applicationsCount} + 1` })
      .where(eq(jobPostings.id, jobId));

    return { success: true, application };
  } catch (err: any) {
    console.error("applyForJob error:", err);
    return { success: false, error: err.message || "Failed to submit application." };
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
