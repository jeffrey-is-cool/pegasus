"use client";

import posthog from "posthog-js";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/primitives";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type BookingLinkProps = {
  children: ReactNode;
  className?: string;
  appearance?: "button" | "text";
  size?: "default" | "large";
};

const BOOKING_URL = "https://form.typeform.com/to/gJ9aqAqL";

export function BookingLink({
  appearance = "button",
  children,
  className = "",
  size = "default",
}: BookingLinkProps) {
  return (
    <ButtonLink
      appearance={appearance === "button" ? "primary" : "text"}
      className={className}
      href={BOOKING_URL}
      size={size}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        posthog.capture("booking_link_clicked");
        window.fbq?.("track", "Lead");
      }}
    >
      {children}
    </ButtonLink>
  );
}
