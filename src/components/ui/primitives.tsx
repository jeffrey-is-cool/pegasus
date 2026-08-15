import type { HTMLAttributes, ReactNode } from "react";

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

type PrimitiveProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type ContainerProps = PrimitiveProps & {
  size?: "content" | "hero" | "reading";
};

export function Container({ children, className, size = "content", ...props }: ContainerProps) {
  return (
    <div
      className={classes("ds-container", size !== "content" && `ds-container--${size}`, className)}
      {...props}
    >
      {children}
    </div>
  );
}

type SurfaceProps = PrimitiveProps & {
  tone?: "default" | "subtle" | "deep";
};

export function Surface({ children, className, tone = "default", ...props }: SurfaceProps) {
  return (
    <div
      className={classes("ds-surface", tone !== "default" && `ds-surface--${tone}`, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Stack({ children, className, ...props }: PrimitiveProps) {
  return (
    <div className={classes("ds-stack", className)} {...props}>
      {children}
    </div>
  );
}

export function Cluster({ children, className, ...props }: PrimitiveProps) {
  return (
    <div className={classes("ds-cluster", className)} {...props}>
      {children}
    </div>
  );
}

export function Grid({ children, className, ...props }: PrimitiveProps) {
  return (
    <div className={classes("ds-grid", className)} {...props}>
      {children}
    </div>
  );
}
