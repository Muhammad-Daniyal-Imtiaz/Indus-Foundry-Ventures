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
