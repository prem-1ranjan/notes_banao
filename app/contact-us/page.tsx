import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Contact Us | NotesBanao",
  description: "Contact NotesBanao support for account, NB Points recharge, payment, refund review, the NotesBanao Clients, and product questions."
};

export default function ContactUsPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);
  const address = publicBusinessValue(businessInfo.address);
  const phone = publicBusinessValue(businessInfo.supportPhone);
  const gstin = publicBusinessValue(businessInfo.gstin);
  const udyamRegistrationNo = publicBusinessValue(businessInfo.udyamRegistrationNo);

  return (
    <PublicPageShell
      title="Contact NotesBanao"
      description="Use this page for account access, NB Points recharge, payment, refund review, NotesBanao Client, or generated-note support."
    >
      <section className="public-card-grid">
        <article className="panel compact-public-card">
          <p className="eyebrow">Support email</p>
          <h2>Email us</h2>
          <p><a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a></p>
        </article>

        {phone ? (
          <article className="panel compact-public-card">
            <p className="eyebrow">Support phone</p>
            <h2>Call us</h2>
            <p><a className="inline-link" href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></p>
          </article>
        ) : null}

        {address ? (
          <article className="panel compact-public-card">
            <p className="eyebrow">Business address</p>
            <h2>Registered / operating address</h2>
            <p>{address}</p>
          </article>
        ) : null}
      </section>

      <PolicySection title="What to include">
        <p>For NB Points recharge or payment issues, include your registered email, amount paid, selected recharge pack, payment date, payment reference or order ID, and a screenshot if available.</p>
        <p>For NotesBanao Client issues, tell us which client (browser extension, Windows desktop app, or Android app), its version if visible, and a short description of what happened.</p>
        <p>For generated-note issues, include the approximate session time, note title if available, and what went wrong.</p>
      </PolicySection>

      <PolicySection title="Support response">
        <p>NotesBanao reviews support requests on working days. Payment, refund, and account-access questions are prioritized because they may affect service access.</p>
        <p>Refund requests are handled according to the Refund & Cancellation Policy published on this website. Successful NB Points recharges are not refundable merely because delivered NB Points remain unused.</p>
      </PolicySection>

      <PolicySection title="Business details">
        {ownerLine ? <p>{ownerLine}</p> : null}
        <p>Trade name: {businessInfo.tradeName}</p>
        {gstin ? <p>GSTIN: {gstin}</p> : null}
        {udyamRegistrationNo ? <p>Udyam Registration No: {udyamRegistrationNo}</p> : null}
        {address ? <p>Address: {address}</p> : null}
        {phone ? <p>Phone: {phone}</p> : null}
      </PolicySection>
    </PublicPageShell>
  );
}
