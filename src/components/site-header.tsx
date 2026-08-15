"use client";

import { useEffect, useState } from "react";
import { BookingLink } from "@/components/booking-link";
import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "site-nav scrolled" : "site-nav"}>
      <a className="logo" href="#top" aria-label="Pegasus Education home">
        <BrandMark className="nav-mark" />
        <span className="logo-name">Pegasus Education</span>
      </a>
      <div className="nav-right">
        <BookingLink className="btn">Schedule a Private Meeting</BookingLink>
      </div>
    </nav>
  );
}
