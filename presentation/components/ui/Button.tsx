import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "tertiary";

// Colors set inline (not via CSS classes) so they can never be dropped by a build step.
const variantStyle: Record<Variant, CSSProperties> = {
  primary: { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", border: "none" },
  secondary: { backgroundColor: "var(--color-ink)", color: "var(--color-on-primary)", border: "none" },
  tertiary: { backgroundColor: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-ink)" },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", style, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`btn ${className ?? ""}`}
      style={{ ...variantStyle[variant], ...style }}
    />
  );
}
