"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        parentElement: HTMLElement;
        url: string;
      }) => void;
    };
  }
}

type CalendlyEmbedProps = {
  url: string;
};

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialize = useCallback(() => {
    const parentElement = containerRef.current;

    if (!parentElement || parentElement.childElementCount > 0 || !window.Calendly) return;

    window.Calendly.initInlineWidget({ parentElement, url });
  }, [url]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <div className="calendly-inline-widget" ref={containerRef} />
      <Script
        id="calendly-inline-widget-script"
        onLoad={initialize}
        onReady={initialize}
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
