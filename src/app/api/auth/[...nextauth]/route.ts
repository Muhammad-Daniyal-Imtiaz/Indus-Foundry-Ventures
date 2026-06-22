export const dynamic = "force-dynamic";

async function handler(req: Request, ctx: any) {
  const { default: NextAuth } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  return NextAuth(authOptions)(req, ctx);
}

export { handler as GET, handler as POST };
