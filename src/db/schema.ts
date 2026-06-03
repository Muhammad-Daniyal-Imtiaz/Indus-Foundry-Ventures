import { sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex, index, integer } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // Clerk user ID
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("None"), // Legacy field – kept for backward compat; real roles live in profiles.rolesJson
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(), // Same as users.id for 1:1 relationship
    userId: text("user_id").notNull(), // FK to users.id
    phone: text("phone"),
    country: text("country"),
    location: text("location"), // City / area
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    instagramUrl: text("instagram_url"),
    leetcodeUrl: text("leetcode_url"),
    hackerrankUrl: text("hackerrank_url"),
    portfolioUrl: text("portfolio_url"),
    bestProjectUrl: text("best_project_url"),
    rolesJson: text("roles_json").notNull().default("[]"), // JSON array e.g. ["Founder","Cofounder"]
    employmentStatus: text("employment_status"), // 'Employed' | 'Unemployed' | 'Student' | 'Freelancing' | 'Looking for Work'
    ...timestamps,
  },
  (t) => ({})
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userRole: text("user_role").notNull(), // First selected role or comma-separated
    userAvatar: text("user_avatar").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(), // 'Idea' | 'MVP' | 'Investment Wanted' | 'Partners Wanted' | 'Startup Space Wanted' | 'Cofounder Wanted'
    imagesJson: text("images_json").notNull().default("[]"), // Up to 3 base64 strings serialized as JSON
    showContactEmail: integer("show_contact_email", { mode: "boolean" }).default(false),
    showContactPhone: integer("show_contact_phone", { mode: "boolean" }).default(false),
    showContactCountry: integer("show_contact_country", { mode: "boolean" }).default(false),
    ...timestamps,
  },
  (t) => ({})
);

export const mvps = sqliteTable(
  "mvps",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userRole: text("user_role").notNull(),
    userAvatar: text("user_avatar").notNull(),
    title: text("title").notNull(), // MVP Name
    tagline: text("tagline").notNull(), // One-line Pitch
    category: text("category").notNull(), // e.g. 'SaaS MVPs', 'AI tools', etc.
    reason: text("reason").notNull(), // Reason for Sale
    askingPrice: text("asking_price").notNull(),
    revenue: text("revenue").notNull(), // Monthly Revenue
    users: text("users").notNull(), // Traction / Users
    githubRepo: text("github_repo"), // Verified GitHub Repository (optional)
    techStack: text("tech_stack").notNull(), // Comma-separated
    productDescription: text("product_description").notNull(), // Product Description
    repoVerified: integer("repo_verified", { mode: "boolean" }).default(false),
    ownershipVerified: integer("ownership_verified", { mode: "boolean" }).default(true),
    githubStars: integer("github_stars").default(0),
    screenshot: text("screenshot"),
    ...timestamps,
  },
  (t) => ({})
);

export const freelanceProjects = sqliteTable(
  "freelance_projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userRole: text("user_role").notNull(),
    userAvatar: text("user_avatar").notNull(),
    title: text("title").notNull(),
    client: text("client").notNull(),
    budget: text("budget").notNull(),
    budgetType: text("budget_type").notNull(), // 'Fixed' or 'Hourly'
    duration: text("duration").notNull(),
    primaryIndustry: text("primary_industry").notNull(),
    secondaryIndustries: text("secondary_industries").notNull(), // JSON array
    skills: text("skills").notNull(), // Comma-separated
    description: text("description").notNull(),
    ...timestamps,
  },
  (t) => ({})
);

// ─── Company Pages ────────────────────────────────────────────────────────────
// One user can own one company page (LinkedIn-style Company Page)
export const companyPages = sqliteTable(
  "company_pages",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),         // FK → users.id
    slug: text("slug").notNull(),                // URL-friendly unique identifier e.g. "acme-corp"
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),          // Short one-liner
    about: text("about").notNull(),              // Rich description
    industry: text("industry").notNull(),        // e.g. "AI", "SaaS", "Fintech"
    companySize: text("company_size").notNull(), // '1-10' | '11-50' | '51-200' | '201-500' | '500+'
    founded: text("founded"),                    // Year founded
    headquarters: text("headquarters"),         // City, Country
    website: text("website"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    logoUrl: text("logo_url"),                   // base64 or URL
    bannerUrl: text("banner_url"),               // Cover image
    specialtiesJson: text("specialties_json").notNull().default("[]"), // JSON string[]
    stage: text("stage").notNull().default("Startup"), // 'Idea' | 'Startup' | 'Growth' | 'Scale-up' | 'Enterprise'
    isVerified: integer("is_verified", { mode: "boolean" }).default(false),
    followersCount: integer("followers_count").notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    slugIdx: uniqueIndex("company_pages_slug_idx").on(t.slug),
    ownerIdx: index("company_pages_owner_idx").on(t.ownerId),
    industryIdx: index("company_pages_industry_idx").on(t.industry),
  })
);

// ─── Job Postings ─────────────────────────────────────────────────────────────
// Posted by a company page or directly by a user
export const jobPostings = sqliteTable(
  "job_postings",
  {
    id: text("id").primaryKey(),
    companyPageId: text("company_page_id"),      // FK → companyPages.id (nullable = individual posting)
    postedByUserId: text("posted_by_user_id").notNull(), // FK → users.id
    // Denormalized company info for fast display (no join needed in list view)
    companyName: text("company_name").notNull(),
    companyLogo: text("company_logo"),
    companySlug: text("company_slug"),
    // Job details
    title: text("title").notNull(),
    department: text("department"),              // e.g. "Engineering", "Product"
    employmentType: text("employment_type").notNull(), // 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote'
    locationType: text("location_type").notNull(), // 'On-site' | 'Remote' | 'Hybrid'
    location: text("location").notNull(),        // City, Country or "Remote"
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").notNull().default("PKR"),
    salaryPeriod: text("salary_period").notNull().default("Monthly"), // 'Monthly' | 'Annual'
    experienceLevel: text("experience_level").notNull(), // 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
    industry: text("industry").notNull(),
    skillsJson: text("skills_json").notNull().default("[]"), // JSON string[]
    description: text("description").notNull(),
    requirementsJson: text("requirements_json").notNull().default("[]"), // JSON string[]
    benefitsJson: text("benefits_json").notNull().default("[]"),  // JSON string[]
    applicationDeadline: text("application_deadline"),
    isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    viewsCount: integer("views_count").notNull().default(0),
    applicationsCount: integer("applications_count").notNull().default(0),
    ...timestamps,
  },
  (t) => ({
    companyIdx: index("job_postings_company_idx").on(t.companyPageId),
    posterIdx: index("job_postings_poster_idx").on(t.postedByUserId),
    industryIdx: index("job_postings_industry_idx").on(t.industry),
    openIdx: index("job_postings_open_idx").on(t.isOpen),
    typeIdx: index("job_postings_type_idx").on(t.employmentType),
  })
);

// ─── Job Applications ─────────────────────────────────────────────────────────
// Easy Apply: only 3 required fields + optional cover note
export const jobApplications = sqliteTable(
  "job_applications",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id").notNull(),             // FK → jobPostings.id
    applicantUserId: text("applicant_user_id").notNull(), // FK → users.id
    // The 3 core fields shown in the Easy Apply modal
    resumeUrl: text("resume_url").notNull(),     // Link to resume / portfolio
    phone: text("phone").notNull(),
    coverNote: text("cover_note"),               // Optional 280-char note
    // Status lifecycle
    status: text("status").notNull().default("Applied"), // 'Applied' | 'Viewed' | 'Shortlisted' | 'Rejected' | 'Hired'
    ...timestamps,
  },
  (t) => ({
    // Prevent duplicate applications
    uniqueApp: uniqueIndex("job_applications_unique_idx").on(t.jobId, t.applicantUserId),
    jobIdx: index("job_applications_job_idx").on(t.jobId),
    applicantIdx: index("job_applications_applicant_idx").on(t.applicantUserId),
    statusIdx: index("job_applications_status_idx").on(t.status),
  })
);

// ─── Type exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Mvp = typeof mvps.$inferSelect;
export type NewMvp = typeof mvps.$inferInsert;

export type FreelanceProject = typeof freelanceProjects.$inferSelect;
export type NewFreelanceProject = typeof freelanceProjects.$inferInsert;

export type CompanyPage = typeof companyPages.$inferSelect;
export type NewCompanyPage = typeof companyPages.$inferInsert;

export type JobPosting = typeof jobPostings.$inferSelect;
export type NewJobPosting = typeof jobPostings.$inferInsert;

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
