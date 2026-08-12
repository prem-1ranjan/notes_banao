import { businessInfo, publicBusinessValue, socialLinks } from "@/lib/business-info";

const FOOTER_LINKS = [
  ["Pricing", "/pricing"],
  ["Contact", "/contact-us"],
  ["Privacy", "/privacy-policy"],
  ["Terms", "/terms-and-conditions"]
] as const;

export function DashboardFooter() {
  const gstin = publicBusinessValue(businessInfo.gstin);
  const udyamRegistrationNo = publicBusinessValue(businessInfo.udyamRegistrationNo);
  const registrationLine = [
    gstin ? `GSTIN: ${gstin}` : "",
    udyamRegistrationNo ? `Udyam: ${udyamRegistrationNo}` : ""
  ].filter(Boolean).join(" · ");

  return (
    <footer className="portal-footer">
      <span>&copy; 2026 NotesBanao. All rights reserved.</span>
      {registrationLine ? <span className="portal-footer-registration">{registrationLine}</span> : null}
      <nav aria-label="Footer links">
        {FOOTER_LINKS.map(([label, href]) => (
          <a href={href} key={href}>{label}</a>
        ))}
      </nav>
      <div className="portal-social-links" aria-label="Social media">
        {socialLinks.map(([label, href]) => (
          <a href={href} key={label} target="_blank" rel="noreferrer noopener">{label}</a>
        ))}
      </div>
      <a href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>
    </footer>
  );
}
