import { db } from "./src/db/index";
import { posts, profiles, users } from "./src/db/schema";
import { desc, eq } from "drizzle-orm";

async function checkDB() {
  try {
    const allPostsRaw = await db.select().from(posts);
    console.log("Raw posts count:", allPostsRaw.length);

    if (allPostsRaw.length > 0) {
       console.log("First raw post:", allPostsRaw[0]);
    }

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

    console.log("Joined posts count:", list.length);
  } catch (error) {
    console.error("DB Query Error:", error);
  }
}

checkDB();
