import { serverConfig } from "./env";

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

// Server-side verification of a Cloudflare Turnstile token. Each token is
// single-use and expires after ~5 minutes.
export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.append("secret", serverConfig.turnstileSecret);
    body.append("response", token);
    if (remoteIp) body.append("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return false;

    const data = (await res.json()) as SiteVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
