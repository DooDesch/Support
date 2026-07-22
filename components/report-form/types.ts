export type FormValues = {
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  environment: string;
  additional: string;
  contact: string;
  website: string; // honeypot
};

export const DEFAULTS: FormValues = {
  title: "",
  description: "",
  steps: "",
  expected: "",
  actual: "",
  environment: "",
  additional: "",
  contact: "",
  website: "",
};

export const GITHUB_OWNER = "DooDesch";
export const SUPPORT_REPO = `${GITHUB_OWNER}/Support`;
// Stay well under GitHub's ~8KB prefilled-URL limit (414 above it).
export const MAX_GITHUB_URL = 6500;

export type SubmitResult = {
  url: string | null;
  number: number | null;
};
