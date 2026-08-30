import type { ReactNode } from "react";
import Link from "next/link";

import { localDevelopmentOnly } from "./local-development-only";
import styles from "./funnel-stats.module.css";

export default async function DevLayout({ children }: { children: ReactNode }) {
  await localDevelopmentOnly();

  return (
    <div className={styles.devShell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.sidebarEyebrow}>Local development</p>
          <h2 className={styles.sidebarTitle}>Dev tools</h2>
        </div>
        <nav className={styles.primaryNav} aria-label="Developer tools">
          <Link className={styles.navLink} href="/dev/funnel">Dashboard</Link>
          <Link className={`${styles.navLink} ${styles.navLinkActive}`} href="/dev/funnel">Funnel stats</Link>
        </nav>
        <nav className={styles.reportingNav} aria-label="Funnel reporting">
          <p className={styles.reportingLabel}>Reporting</p>
          <Link className={styles.reportingTitle} href="/dev/funnel">Funnel stats</Link>
          <div className={styles.subnav}>
            <Link href="/dev/funnel">/apply</Link>
            <a href="https://us.posthog.com/project/559881" rel="noreferrer" target="_blank">Open PostHog ↗</a>
            <Link href="/apply">Open assessment ↗</Link>
          </div>
        </nav>
      </aside>
      <div className={styles.devContent}>{children}</div>
    </div>
  );
}
