import { NextResponse } from "next/server";

export async function GET() {
  const envStatus = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Defined" : "Undefined",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Defined (Secret)" : "Undefined",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Defined" : "Undefined",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Defined (Secret)" : "Undefined",
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "Defined" : "Undefined",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "Defined (Secret)" : "Undefined",
    NODE_ENV: process.env.NODE_ENV || "not set",
  };

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: envStatus,
    process_env_keys: Object.keys(process.env).filter(key => !key.includes("SECRET") && !key.includes("TOKEN") && !key.includes("PASSWORD")),
  });
}
