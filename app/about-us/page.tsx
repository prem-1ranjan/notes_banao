import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "About Us | NotesBanao",
  description: "About NotesBanao, a study-notes portal and the NotesBanao Clients using NB Points for English and Hinglish lecture revision."
};

export default function AboutUsPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);
  const address = publicBusinessValue(businessInfo.address);
  const phone = publicBusinessValue(businessInfo.supportPhone);

  return (
    <PublicPageShell
      title="About NotesBanao"
      description="NotesBanao helps learners capture eligible English and Hinglish lecture content and generate organized English notes for personal study and revision."
    >
      <PolicySection title="What we provide">
        <p>NotesBanao provides the NotesBanao Clients (our browser extension, Windows desktop app, and Android app) and a web portal for English and Hinglish lecture-note generation. Users can capture eligible lecture or course content, generate structured notes, and access their generated notes from the portal.</p>
        <p>The service includes account access, generated notes, NB Points recharge and usage tracking where paid usage is enabled, and support for the NotesBanao Clients.</p>
      </PolicySection>

      <PolicySection title="Service access and delivery">
        <p>NotesBanao is a digital service. After account login, users access the portal and the NotesBanao Client workflow online. Generated notes are delivered through the NotesBanao portal or a NotesBanao Client download flow.</p>
        <p>No physical goods are shipped by NotesBanao.</p>
      </PolicySection>

      <PolicySection title="Language and content support">
        <p>{businessInfo.languageSupportLine}</p>
        <p>Tutorials in other languages, noisy audio, overlapping speakers, or unclear speech may produce poor, incomplete, or unusable notes.</p>
      </PolicySection>

      <PolicySection title="Responsible use">
        <p>NotesBanao is intended for students, self-learners, course viewers, and professionals who want organized English notes for later revision.</p>
        <p>Users are responsible for ensuring they have permission to record, process, summarize, or create notes from any lecture, meeting, video, class, or other content used with NotesBanao.</p>
        <p>NotesBanao does not unlock, bypass, or work around paywalls, DRM, download restrictions, or platform access controls, and it does not copy, host, or redistribute the original lecture or course material. It produces the user&apos;s own study notes from a lecture the user is entitled to record.</p>
      </PolicySection>

      <PolicySection title="NB Points">
        <p>NB Points are NotesBanao internal usage points for eligible digital services. They are not cash, cannot be withdrawn or transferred, and cannot be converted to money.</p>
        <p>Payment is collected in rupees through the checkout flow. NB Points are delivered to the user account after trusted payment confirmation and are used only inside NotesBanao.</p>
      </PolicySection>

      <PolicySection title="Business details">
        {ownerLine ? <p>{ownerLine}</p> : null}
        <p>Trade name: {businessInfo.tradeName}</p>
        <p>Website: {businessInfo.domain}</p>
        <p>Support: <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a></p>
        {phone ? <p>Phone: <a className="inline-link" href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></p> : null}
        {address ? <p>Address: {address}</p> : null}
      </PolicySection>
    </PublicPageShell>
  );
}
