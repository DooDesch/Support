import { NextResponse } from "next/server";
import { reportPayloadSchema } from "@/lib/schema";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { buildIssueBody, buildIssueLabels } from "@/lib/issue-body";
import { createReportIssue } from "@/lib/github";

export const dynamic = "force-dynamic";

// Minimum time a human plausibly needs between opening the form and submitting.
const MIN_ELAPSED_MS = 800;

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const parsed = reportPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }
  const data = parsed.data;

  // 1) Honeypot: a filled hidden field means a bot. Pretend success so the bot
  //    gets no useful signal, but create nothing.
  if (data.website) {
    return NextResponse.json({ ok: true, issueUrl: null, issueNumber: null });
  }

  // 2) Min-time-to-submit: instant submissions are scripted.
  if (data.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  // 3) Per-IP rate limiting.
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limit" },
      { status: 429 },
    );
  }

  // 4) Cloudflare Turnstile verification (primary spam protection).
  const human = await verifyTurnstile(data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ ok: false, error: "captcha" }, { status: 403 });
  }

  // 5) Create the GitHub issue + add it to the project board.
  try {
    const issue = await createReportIssue({
      title: data.title,
      body: buildIssueBody(data),
      labels: buildIssueLabels(data),
    });
    return NextResponse.json({
      ok: true,
      issueUrl: issue.url,
      issueNumber: issue.number,
    });
  } catch (error) {
    console.error("Failed to create report issue:", error);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
