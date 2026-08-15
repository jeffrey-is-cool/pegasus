import type { Metadata } from "next";
import { ApplyFunnel } from "./apply-funnel";

export const metadata: Metadata = {
  title: "Private Admissions Assessment | Pegasus Education",
  description:
    "A short, private assessment to explore whether Pegasus Education is the right admissions partner for your family.",
};

export default function ApplyPage() {
  return <ApplyFunnel />;
}
