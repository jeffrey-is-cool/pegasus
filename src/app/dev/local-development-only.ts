import "server-only";

import { headers } from "next/headers";
import { notFound } from "next/navigation";

export function isLocalHostname(hostname: string) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "[::1]";
}

export async function localDevelopmentOnly() {
  const host = (await headers()).get("host");
  const normalizedHost = host?.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  const closingBracket = normalizedHost.indexOf("]");
  const hostname = normalizedHost.startsWith("[") && closingBracket >= 0
    ? normalizedHost.slice(0, closingBracket + 1)
    : normalizedHost.split(":", 1)[0];

  if (process.env.NODE_ENV !== "development" || !isLocalHostname(hostname)) {
    notFound();
  }
}
