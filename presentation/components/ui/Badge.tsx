export function Badge({ children, tone }: { children: React.ReactNode; tone: "tcp" | "udp" }) {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: tone === "tcp" ? "var(--color-primary)" : "var(--color-ink)",
        color: "var(--color-on-primary)",
      }}
    >
      {children}
    </span>
  );
}
