import { nbPoints } from "./format";
import type { BillingDurationRule, BillingRuleSet } from "./types";

type BillingPanelProps = {
  billingError: string;
  billingLoading: boolean;
  ruleSets: BillingRuleSet[];
  rules: BillingDurationRule[];
};

function durationText(seconds: number) {
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes}` : minutes.toFixed(1);
}

function startMinute(seconds: number) {
  return Math.max(0, Math.floor(seconds / 60) + (seconds % 60 === 0 ? 0 : 1));
}

function endMinute(seconds: number) {
  return Math.max(0, Math.floor(seconds / 60));
}

function normalizeRules(rules: BillingDurationRule[]) {
  const unique = new Map<string, BillingDurationRule>();
  for (const rule of rules) {
    const key = `${rule.min_duration_seconds}:${rule.max_duration_seconds ?? "open"}:${rule.charge_points}`;
    if (!unique.has(key)) {
      unique.set(key, rule);
    }
  }
  return Array.from(unique.values()).sort((left, right) => {
    if (left.min_duration_seconds !== right.min_duration_seconds) {
      return left.min_duration_seconds - right.min_duration_seconds;
    }
    return left.sort_order - right.sort_order;
  });
}

function ruleSetCodeForMode(ruleSets: BillingRuleSet[], mode: "single_note" | "continuous_notes") {
  return ruleSets.find((ruleSet) => (
    ruleSet.product_code === "note_generation" && ruleSet.billing_mode === mode
  ))?.code || "";
}

function rulesForMode(rules: BillingDurationRule[], ruleSets: BillingRuleSet[], mode: "single_note" | "continuous_notes") {
  const code = ruleSetCodeForMode(ruleSets, mode);
  return normalizeRules(code ? rules.filter((rule) => rule.rule_set_code === code) : []);
}

function fallbackLabel(rule: BillingDurationRule) {
  if (rule.max_duration_seconds === null) {
    return `More than ${durationText(Math.max(0, rule.min_duration_seconds - 1))} minutes`;
  }
  return `${startMinute(rule.min_duration_seconds)}-${endMinute(rule.max_duration_seconds)} minutes`;
}

function chargeText(chargePoints: number) {
  if (chargePoints === 0) {
    return "Free";
  }
  return `${nbPoints(chargePoints)} NB Points`;
}

function durationLabel(rule: BillingDurationRule) {
  const label = rule.label || fallbackLabel(rule);
  return label
    .replace(/:\s*[\d,]+\s*NB Points$/i, "")
    .replace(/:\s*free$/i, "");
}

function BillingModeExample({ mode }: { mode: "single" | "continuous" }) {
  if (mode === "single") {
    return (
      <div className="extension-mini" aria-hidden="true">
        <div className="extension-mini-field">
          <span>Lecture title</span>
          <strong>Python for Beginners</strong>
        </div>
        <div className="extension-mini-option collapsed">
          <span>Options</span>
        </div>
        <div className="extension-mini-actions">
          <span className="extension-mini-button primary">Capture Lecture (Eng)</span>
          <span className="extension-mini-button success">Generate Notes</span>
        </div>
      </div>
    );
  }

  return (
    <div className="extension-mini" aria-hidden="true">
      <div className="extension-mini-option">
        <div>
          <span>Options</span>
          <strong>Continuous Recording</strong>
        </div>
        <span className="extension-mini-toggle"><span /></span>
      </div>
      <div className="extension-mini-option extension-mini-option-limit">
        <div>
          <strong>Auto Generate Limit</strong>
        </div>
        <span>Create combined notes up to 180 min.</span>
      </div>
      <div className="extension-mini-actions">
        <span className="extension-mini-button primary wide">Capture Series (Eng)</span>
      </div>
    </div>
  );
}

function BillingRuleGroup({
  description,
  mode,
  rules,
  title,
}: {
  description: string;
  mode: "single" | "continuous";
  rules: BillingDurationRule[];
  title: string;
}) {
  return (
    <section className="billing-rule-group">
      <div className="billing-rule-intro">
        <div className="billing-mode-heading">
          <h3>{title}</h3>
          <span>Example</span>
        </div>
        <p>{description}</p>
        <BillingModeExample mode={mode} />
      </div>
      {rules.length === 0 ? (
        <p className="empty-state">No rules configured.</p>
      ) : (
        <div className="billing-rule-list">
          <div className="billing-rule-row billing-rule-head">
            <span>Duration</span>
            <span>Charge (NB Points)</span>
          </div>
          {rules.map((rule) => (
            <div className="billing-rule-row" key={`${rule.id}-${rule.min_duration_seconds}-${rule.max_duration_seconds ?? "open"}`}>
              <span>{durationLabel(rule)}</span>
              <strong>{chargeText(rule.charge_points)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function BillingPanel({ billingError, billingLoading, ruleSets, rules }: BillingPanelProps) {
  const singleRules = rulesForMode(rules, ruleSets, "single_note");
  const continuousRules = rulesForMode(rules, ruleSets, "continuous_notes");
  const visibleRules = [...singleRules, ...continuousRules];
  const hasFreeRule = visibleRules.some((rule) => rule.charge_points === 0);
  return (
    <div className="content-panel">
      {billingError && <p className="message error">{billingError}</p>}
      {billingLoading && <p className="empty-state">Loading billing rules...</p>}
      {!billingLoading && !billingError && visibleRules.length === 0 && (
        <p className="empty-state">No billing rules are available right now.</p>
      )}
      {!billingLoading && !billingError && visibleRules.length > 0 && (
        <div className="billing-rules">
          <BillingRuleGroup
            description="Use this when one lecture should generate one notes file."
            mode="single"
            rules={singleRules}
            title="Single Notes Creation"
          />
          <BillingRuleGroup
            description="Use this when multiple lectures should become one combined notes file."
            mode="continuous"
            rules={continuousRules}
            title="Continuous Notes Creation"
          />
        </div>
      )}
      <p className="empty-state billing-note">
        {hasFreeRule
          ? "Videos under the free duration can generate notes without NB Points. Longer videos require enough NB Points before generation starts."
          : "Configured NB Points are reserved before generation starts."}
      </p>
    </div>
  );
}
