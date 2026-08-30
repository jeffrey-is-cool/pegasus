import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

export function classes(...values: Array<string | undefined | false>) {
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

type ButtonAppearance = "outline-inverse" | "primary" | "text" | "unstyled";

type ButtonClassOptions = {
  appearance?: ButtonAppearance;
  className?: string;
  size?: "compact" | "default" | "large";
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonClassOptions;

export function buttonClasses({
  appearance = "primary",
  className,
  size = "default",
}: ButtonClassOptions = {}) {
  return classes(
    appearance === "text"
      ? "ds-text-button"
      : appearance === "unstyled"
        ? "ds-unstyled-button"
        : "ds-button",
    appearance === "outline-inverse" && "ds-button--outline-inverse",
    appearance !== "text" && appearance !== "unstyled" && size !== "default" && `ds-button--${size}`,
    className,
  );
}

export function Button({
  appearance = "primary",
  className,
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ appearance, className, size })}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonClassOptions;

export function ButtonLink({
  appearance = "primary",
  className,
  size = "default",
  ...props
}: ButtonLinkProps) {
  return <a className={buttonClasses({ appearance, className, size })} {...props} />;
}
