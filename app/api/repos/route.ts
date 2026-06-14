import { NextResponse } from "next/server";
import { listPublicRepos, type PublicRepo } from "@/lib/github";

// Always run at request time (never prerender at build, which would need a token).
export const dynamic = "force-dynamic";

// Small in-memory cache to keep the form snappy and stay well within GitHub's
// rate limits. The list of public repos changes rarely.
const TTL_MS = 10 * 60 * 1000;
let cache: { data: PublicRepo[]; expiresAt: number } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (!cache || cache.expiresAt <= now) {
      cache = { data: await listPublicRepos(), expiresAt: now + TTL_MS };
    }
    return NextResponse.json({ repos: cache.data });
  } catch (error) {
    console.error("Failed to list public repos:", error);
    return NextResponse.json(
      { repos: [], error: "failed" },
      { status: 500 },
    );
  }
}
