import { BookingLink } from "@/components/booking-link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-brand-block">
              <a className="footer-brand" href="#top" aria-label="Pegasus Education home">
                <BrandMark className="footer-mark" />
                <span className="footer-name">Pegasus Education</span>
              </a>
              <p className="footer-positioning">
                A private education office for families who expect every detail of the admissions
                process to be handled with care.
              </p>
              <span className="footer-invitation ds-eyebrow ds-eyebrow--inverse ds-eyebrow--compact">
                By invitation &amp; referral only
              </span>
            </div>

            <nav className="footer-column" aria-label="Footer navigation">
              <p className="footer-heading ds-eyebrow ds-eyebrow--inverse ds-eyebrow--compact">
                Explore
              </p>
              <a href="#top">Home</a>
              <a href="#testimonials">Approach &amp; results</a>
              <a href="#about">Meet the founder</a>
              <a href="/apply">Private admissions assessment</a>
            </nav>

            <div className="footer-column">
              <p className="footer-heading ds-eyebrow ds-eyebrow--inverse ds-eyebrow--compact">
                Private admissions
              </p>
              <a href="mailto:admissions@pegasusprep.education">
                admissions@pegasusprep.education
              </a>
              <a href="tel:+19178552330">917-855-2330</a>
              <a
                href="https://www.linkedin.com/in/bobajef/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <BookingLink appearance="text" className="footer-meeting-link">
                Schedule a private meeting
              </BookingLink>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Pegasus Education. All rights reserved.</span>
            <span>Private college admissions strategy and execution.</span>
          </div>
        </div>
      </footer>

      <div className="cta-sticky">
        <BookingLink>Schedule a Private Meeting</BookingLink>
      </div>
    </>
  );
}
