"use client";

import type { ReactNode } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type BookingLinkProps = {
  children: ReactNode;
  className?: string;
};

const BOOKING_URL = "https://form.typeform.com/to/gJ9aqAqL";

export function BookingLink({ children, className = "" }: BookingLinkProps) {
  return (
    <a
      className={className}
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => window.fbq?.("track", "Lead")}
    >
      {children}
    </a>
  );
}
