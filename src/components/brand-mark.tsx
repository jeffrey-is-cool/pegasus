type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 100 110"
      fill="none"
    >
      <defs>
        <clipPath id="pegasus-shield">
          <path d="M0,0 L100,0 L100,60 L50,110 L0,60 Z" />
        </clipPath>
      </defs>
      <path
        className="brandMarkSolid"
        d="M0,0 L100,0 L100,60 L50,110 L0,60 Z"
        fill="currentColor"
        display="none"
      />
      <g clipPath="url(#pegasus-shield)">
        <rect x="0" y="0" width="14.3" height="110" fill="var(--color-accent-gold)" />
        <rect x="14.3" y="0" width="14.3" height="110" fill="var(--color-background-page)" />
        <rect x="28.6" y="0" width="14.3" height="110" fill="var(--color-accent-gold)" />
        <rect x="42.9" y="0" width="14.3" height="110" fill="var(--color-background-page)" />
        <rect x="57.1" y="0" width="14.3" height="110" fill="var(--color-accent-gold)" />
        <rect x="71.4" y="0" width="14.3" height="110" fill="var(--color-background-page)" />
        <rect x="85.7" y="0" width="14.3" height="110" fill="var(--color-accent-gold)" />
      </g>
    </svg>
  );
}
