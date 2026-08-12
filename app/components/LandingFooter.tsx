import { businessInfo, publicBusinessValue } from "@/lib/business-info";

const productLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about-us", label: "About Us" }
] as const;

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation Policy" }
] as const;

export function LandingFooter() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);
  const address = publicBusinessValue(businessInfo.address);
  const phone = publicBusinessValue(businessInfo.supportPhone);
  const gstin = publicBusinessValue(businessInfo.gstin);
  const udyamRegistrationNo = publicBusinessValue(businessInfo.udyamRegistrationNo);

  return (
    <footer className="landing-footer">
      <div className="landing-footer-top">
        <div className="landing-footer-brand">
          <strong>NotesBanao</strong>
          <p className="landing-footer-tagline">Record lectures and turn them into clean, organized study notes.</p>
          {ownerLine ? <p className="landing-footer-owner">{ownerLine}</p> : null}
        </div>

        <nav className="landing-footer-col" aria-label="Product">
          <h3>Product</h3>
          {productLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>

        <nav className="landing-footer-col" aria-label="Legal">
          <h3>Legal</h3>
          {legalLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="landing-footer-col">
          <h3>Contact</h3>
          <a href="/contact-us">Contact Us</a>
          <a href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>
          {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a> : null}
          {address ? <address className="landing-footer-address">{address}</address> : null}
        </div>
      </div>

      <div className="landing-footer-bottom">
        <span>&copy; 2026 NotesBanao. All rights reserved.</span>
        {gstin || udyamRegistrationNo ? (
          <span className="landing-footer-reg">
            {gstin ? <span>GSTIN: {gstin}</span> : null}
            {udyamRegistrationNo ? <span>Udyam: {udyamRegistrationNo}</span> : null}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
