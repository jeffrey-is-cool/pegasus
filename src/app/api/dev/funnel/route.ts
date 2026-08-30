import { isLocalHostname } from "@/app/dev/local-development-only";
import {
  getApplyFunnelReport,
  type ApplyFunnelWindow,
} from "@/lib/analytics/apply-funnel-report";

const WINDOWS = new Set(["today", "7", "30", "90"]);

function reportWindow(value: string): ApplyFunnelWindow {
  return value === "today" ? "today" : Number(value) as 7 | 30 | 90;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (process.env.NODE_ENV !== "development" || !isLocalHostname(url.hostname)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const requestedWindow = url.searchParams.get("window") ?? "7";
  if (!WINDOWS.has(requestedWindow)) {
    return Response.json({ error: "Choose a valid timeframe." }, { status: 400 });
  }

  return Response.json(await getApplyFunnelReport(reportWindow(requestedWindow)));
}
