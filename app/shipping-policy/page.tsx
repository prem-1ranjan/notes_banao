import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PageNote, PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Shipping Policy | NotesBanao",
  description: "Shipping and digital delivery policy for NotesBanao NB Points, portal access, the NotesBanao Client workflow, and generated notes."
};

export default function ShippingPolicyPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);

  return (
    <PublicPageShell
      title="Shipping / Delivery Policy"
      description="NotesBanao is an online digital service. This page explains how NB Points, account access, NotesBanao Client workflows, and generated notes are delivered."
    >
      <PageNote>
        <strong>Last updated:</strong> {businessInfo.lastUpdated}.{ownerLine ? ` ${ownerLine}` : ""}
      </PageNote>

      <PolicySection title="1. No physical shipping">
        <p>NotesBanao does not sell or ship physical goods. No courier, postal delivery, or physical shipment is provided for NB Points, portal access, NotesBanao Client usage, or generated notes.</p>
      </PolicySection>

      <PolicySection title="2. Digital delivery">
        <p>NB Points are delivered digitally to the user account after trusted payment confirmation from the payment gateway or banking network.</p>
        <p>Generated notes are delivered digitally through the NotesBanao portal or a NotesBanao Client download flow, where the feature is available.</p>
      </PolicySection>

      <PolicySection title="3. Delivery timelines">
        <p>Account access and generated-note access are normally available immediately after successful login and successful note generation.</p>
        <p>NB Points are normally added after the payment gateway confirms a successful recharge. Some payments may remain pending while the bank, UPI network, card network, wallet, or payment gateway confirms the final status.</p>
      </PolicySection>

      <PolicySection title="4. Language support and note output">
        <p>{businessInfo.languageSupportLine}</p>
        <p>Generated notes are delivered in English and are intended to be structured, clear, and professional for personal study and revision. Users should review generated notes before relying on them for exams, assignments, professional work, or important decisions.</p>
        <p>Content in languages other than English and Hinglish, or noisy, unclear, or otherwise unsupported content, may produce incomplete or unusable notes and may not qualify for a refund unless the Refund & Cancellation Policy applies.</p>
      </PolicySection>

      <PolicySection title="5. Failed or delayed delivery">
        <p>If payment is debited but NB Points are not added, contact <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a> with your registered email address, amount paid, payment date, payment reference or order ID, and a screenshot if available.</p>
        <p>After verification, NotesBanao will either deliver the missing NB Points or review the case under the Refund & Cancellation Policy.</p>
      </PolicySection>

      <PolicySection title="6. Service availability">
        <p>Digital delivery depends on account status, device or browser support, NotesBanao Client availability, payment status, technical availability, and the user following NotesBanao Terms & Conditions.</p>
      </PolicySection>
    </PublicPageShell>
  );
}
