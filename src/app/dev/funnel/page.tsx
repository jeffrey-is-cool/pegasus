import type { Metadata } from "next";

import { getApplyFunnelReport } from "@/lib/analytics/apply-funnel-report";

import { FunnelStatsWorkbench } from "../_components/funnel-stats-workbench";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply funnel | Pegasus dev",
  robots: { index: false, follow: false },
};

export default async function FunnelPage() {
  const report = await getApplyFunnelReport(7);
  return <FunnelStatsWorkbench initialReport={report} />;
}
