import { BookingLink } from "@/components/booking-link";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="announcement-bar">
        <span>Private admissions, built around one child.</span>
        <a href="/apply">
          Begin the private assessment <span aria-hidden="true">↗</span>
        </a>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className="logo" href="#top" aria-label="Pegasus Education home">
          <BrandMark className="nav-mark" />
          <span className="logo-name">Pegasus Education</span>
        </a>

        <div className="nav-links">
          <a href="#testimonials">Approach &amp; results</a>
          <a href="#about">About Pegasus</a>
          <a href="/apply">Admissions assessment</a>
        </div>

        <div className="nav-right">
          <BookingLink>Schedule a Meeting</BookingLink>
        </div>
      </nav>
    </header>
  );
}
