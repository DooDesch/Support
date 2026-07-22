import { NextResponse } from "next/server";
import { getCachedRepos } from "@/lib/repos-cache";

// Always run at request time (never prerender at build, which would need a token).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ repos: await getCachedRepos() });
  } catch (error) {
    console.error("Failed to list public repos:", error);
    return NextResponse.json({ repos: [], error: "failed" }, { status: 500 });
  }
}
