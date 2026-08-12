type StatusPillProps = {
  children: string | number;
  tone?: "neutral" | "good" | "warn" | "bad";
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return <span className={`staff-status-pill ${tone}`}>{children}</span>;
}
