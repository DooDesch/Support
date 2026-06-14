import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Produce a minimal, self-contained server bundle for the Docker image.
  output: "standalone",
};

export default withNextIntl(nextConfig);
