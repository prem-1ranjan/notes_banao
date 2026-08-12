import type { Metadata } from "next";
import { businessInfo } from "@/lib/business-info";
import { PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Pricing | NotesBanao",
  description: "Start free with eligible English or Hinglish lecture notes. Paid NotesBanao generation can start at 100 NB Points, about Rs 1 equivalent after recharge."
};

export default function PricingPage() {
  return (
    <PublicPageShell
      title="Start free. Paid notes from about Rs 1 equivalent."
      description="0-10 minutes: 0 NB Points (Free). 11-30 minute lecture notes use 100 NB Points. Longer lectures use more NB Points based on duration. Minimum recharge pack applies, and signed-in users can view the active billing rules."
    >
      <section className="pricing-overview" aria-label="Pricing summary">
        <article>
          <span>Start free</span>
          <strong>0 NB Points</strong>
          <p>Eligible 0-10 minute lecture-note generation is free.</p>
        </article>
        <article>
          <span>Paid starts at</span>
          <strong>100 NB Points</strong>
          <p>Eligible 11-30 minute lectures are about Rs 1 equivalent after recharge.</p>
        </article>
        <article>
          <span>After sign in</span>
          <strong>Billing rules visible</strong>
          <p>Signed-in users can view the active duration-based NB Points rules.</p>
        </article>
      </section>

      <PolicySection title="How charges work">
        <p>{businessInfo.languageSupportLine} Point charges are based on the active duration rules configured in NotesBanao and do not change with the selected language.</p>
        <p>Longer sessions may use more NB Points based on duration. Signed-in users can view the active billing rules in the NotesBanao billing or recharge flow.</p>
      </PolicySection>

      <PolicySection title="Recharge packs">
        <p>Recharge packs may include base NB Points and bonus NB Points. Payment is collected in Indian rupees, while the delivered NB Points are used only inside NotesBanao.</p>
        <p>Recharge pack price, total NB Points, bonus points if any, payment gateway, and payment status are shown before checkout or in the recharge flow.</p>
        <p>NotesBanao does not charge the user until the user confirms payment through the checkout flow.</p>
      </PolicySection>

      <section className="pricing-details" aria-label="Pricing details">
        <div>
          <h2>What users pay for</h2>
          <ul>
            <li>Eligible English or Hinglish lecture-note generation usage.</li>
            <li>Recharge packs that add NB Points for NotesBanao services.</li>
            <li>Payment gateway checkout when NB Points are purchased.</li>
          </ul>
        </div>
        <div>
          <h2>What is not charged here</h2>
          <ul>
            <li>No public monthly subscription plan is currently sold.</li>
            <li>No cash withdrawal or NB Points transfer is offered.</li>
            <li>No payment is collected without checkout confirmation.</li>
          </ul>
        </div>
      </section>

      <PolicySection title="NB Points are not money">
        <p>NB Points are not cash, are not prepaid money, are not a stored-value wallet, and cannot be withdrawn, transferred, sold, or converted back to money.</p>
        <p>Unused NB Points that were successfully delivered are not refundable merely because they remain unused, unless a refund is required by applicable law or the Refund & Cancellation Policy applies because of a payment or delivery issue.</p>
      </PolicySection>

      <PolicySection title="Payment and billing">
        <p>Payments are processed through approved payment gateway partners. The final checkout page may show supported payment methods such as UPI, cards, net banking, or wallets depending on gateway availability.</p>
        <p>Invoices, taxes, and payment details will follow the legal and tax status configured for {businessInfo.tradeName}. If GST is applicable, prices may be treated as GST-inclusive unless stated otherwise on the checkout page.</p>
        <p>For recharge or payment questions, contact <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>.</p>
      </PolicySection>
    </PublicPageShell>
  );
}
