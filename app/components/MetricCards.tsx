type MetricCard = {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "default" | "good" | "warn" | "bad";
};

export function MetricCards({ metrics }: { metrics: MetricCard[] }) {
  return (
    <div className="staff-metric-grid">
      {metrics.map((metric) => (
        <article className={`staff-metric ${metric.tone || "default"}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {metric.detail ? <small>{metric.detail}</small> : null}
        </article>
      ))}
    </div>
  );
}
