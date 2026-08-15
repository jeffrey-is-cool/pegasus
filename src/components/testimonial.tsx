"use client";

import Image from "next/image";
import { useState } from "react";

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
      <div className="t-logo">
        <Image src={logo} alt={logoAlt} width={logoWidth} height={logoHeight} />
      </div>
      <div className="t-content">
        <blockquote>
          {quote}
          {more ? <span className={expanded ? "t-hidden open" : "t-hidden"}>{more}</span> : null}
        </blockquote>
        {more ? (
          <button className="t-expand" type="button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Read less ↑" : "Read more ↓"}
          </button>
        ) : null}
        <div className="t-attr">{attribution}</div>
      </div>
    </article>
  );
}
