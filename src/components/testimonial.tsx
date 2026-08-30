"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";

type TestimonialProps = {
  quote: string;
  more?: string;
  attribution: string;
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
};

export function Testimonial({
  quote,
  more,
  attribution,
  logo,
  logoAlt,
  logoWidth,
  logoHeight,
}: TestimonialProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="t-item">
      <div className="t-card-header">
        <div className="t-logo">
          <Image src={logo} alt={logoAlt} width={logoWidth} height={logoHeight} />
        </div>
        <p className="t-attr">{attribution}</p>
      </div>
      <div className="t-content">
        <blockquote>
          {quote}
          {more ? <span className={expanded ? "t-hidden open" : "t-hidden"}>{more}</span> : null}
        </blockquote>
        {more ? (
          <Button appearance="text" className="t-expand" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Read less ↑" : "Read more ↓"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
