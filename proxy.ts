import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed "Middleware" to "Proxy" (same functionality).
// next-intl's request handler runs here to resolve and prefix the locale.
export default createMiddleware(routing);

export const config = {
  // Run on all paths except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
