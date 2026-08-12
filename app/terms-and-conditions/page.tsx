import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PageNote, PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | NotesBanao",
  description: "Terms and Conditions for using NotesBanao, NB Points, and the NotesBanao Clients."
};

export default function TermsAndConditionsPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);

  return (
    <PublicPageShell
      title="NotesBanao Terms & Conditions"
      description={`These Terms explain how you may use ${businessInfo.brandName}, including the portal, the NotesBanao Clients, generated notes, NB Points, and paid features where enabled.`}
    >
      {ownerLine ? (
        <PageNote>
          <strong>Last updated:</strong> {businessInfo.lastUpdated}. {ownerLine}
        </PageNote>
      ) : (
        <PageNote>
          <strong>Last updated:</strong> {businessInfo.lastUpdated}.
        </PageNote>
      )}

      <PageNote>
        <strong>Language support:</strong> {businessInfo.languageSupportLine}
      </PageNote>

      <PolicySection title="1. Acceptance of these Terms">
        <p>By creating an account, signing in, buying NB Points, installing or using any NotesBanao Client (our browser extension, Windows desktop app, or Android app), or using the NotesBanao portal, you agree to these Terms & Conditions.</p>
        <p>If you do not agree with these Terms, please do not use NotesBanao.</p>
        <p><strong>Minimum age.</strong> NotesBanao is intended for users aged 16 and above. If you are between 16 and 18, you may use NotesBanao only with the consent of a parent or legal guardian, who accepts these Terms on your behalf and remains responsible for the account. You must not create an account if you are under 16.</p>
      </PolicySection>

      <PolicySection title="2. What NotesBanao does">
        <p>NotesBanao helps users capture English or Hinglish (mixed Hindi and English) lecture or study-session content they are allowed to use and generate structured English notes for personal study and revision.</p>
        <p>NotesBanao supports English lectures and Hinglish (mixed Hindi and English) lectures, and generated notes are provided in English only. You choose the video lecture language in the NotesBanao Client. Audio in other languages, heavy accents, noisy recordings, music, overlapping speakers, or unclear speech may produce poor, incomplete, or unusable notes.</p>
        <p>Generated notes may contain mistakes, omissions, or formatting issues. You should review all generated notes before relying on them for exams, assignments, professional work, or important decisions.</p>
      </PolicySection>

      <PolicySection title="3. Digital access and delivery">
        <p>NotesBanao is delivered as an online digital service. After login, users access the portal and the NotesBanao Client workflow to generate and download notes where the feature is available.</p>
        <p>No physical products are shipped by NotesBanao. Service access depends on account status, device or browser support, NotesBanao Client approval and availability, payment status where paid usage is enabled, and technical availability.</p>
      </PolicySection>

      <PolicySection title="4. Your responsibility for content and permissions">
        <p>You must have permission or a lawful right to record, process, upload, summarize, or create notes from any lecture, video, meeting, class, or other content used with NotesBanao.</p>
        <p>You must follow the rules of your school, college, course provider, employer, meeting host, website, platform, and applicable law, including copyright, privacy, recording consent, and academic integrity rules.</p>
        <p>You must not use NotesBanao to bypass paywalls, DRM, download controls, account restrictions, access controls, or platform usage restrictions.</p>
      </PolicySection>

      <PolicySection title="5. Account use">
        <p>You are responsible for keeping your account credentials secure and for activity that happens through your account.</p>
        <p>You must provide accurate account information and must not impersonate another person or use NotesBanao for illegal, abusive, harmful, or unauthorized activity.</p>
        <p>If you use Google sign-in, you authorize NotesBanao to use the Google account information needed for authentication, account access, and related support as described in the Privacy Policy.</p>
      </PolicySection>

      <PolicySection title="6. NB Points and paid features">
        <p>NotesBanao may offer NB Points or paid access for eligible note-generation features. NB Points are usable only inside NotesBanao for eligible services and features.</p>
        <p>NB Points are an internal usage unit. They are not cash, are not prepaid money, are not a stored-value wallet, are non-transferable, are non-withdrawable, and cannot be converted to money.</p>
        <p>Unused NB Points that were successfully delivered are not refundable merely because they remain unused or because you changed your mind, unless a refund is required by applicable law or the Refund & Cancellation Policy applies because of a payment or delivery issue.</p>
        <p>Usage charges, recharge options, bonus points, expiry rules if introduced, and feature availability may change as the product evolves. Before buying NB Points or using paid features, please confirm that your intended tutorials or lectures are in English or Hinglish (mixed Hindi and English), and note that the generated notes themselves are produced in English only.</p>
      </PolicySection>

      <PolicySection title="7. Payments, refunds, and cancellations">
        <p>Payments are processed through third-party payment gateway partners. Your payment may be subject to the gateway checkout flow, verification, and settlement process.</p>
        <p>The payable rupee amount, selected recharge pack, and NB Points to be delivered are shown before checkout. NotesBanao does not collect payment unless the user confirms payment through the checkout flow.</p>
        <p>Refunds and cancellations are handled according to the Refund & Cancellation Policy published on this website.</p>
      </PolicySection>

      <PolicySection title="8. Prohibited use">
        <p>You must not misuse NotesBanao, interfere with the service, reverse engineer protected parts of the service, overload systems, attempt unauthorized access, scrape private data, or use the service to violate third-party rights.</p>
        <p>We may suspend or restrict accounts that appear to misuse NotesBanao, violate these Terms, create legal risk, or harm other users, service providers, or third parties.</p>
      </PolicySection>

      <PolicySection title="9. Intellectual property">
        <p>NotesBanao, its branding, website, portal design, the NotesBanao Clients, and software are owned by or licensed to the operator of NotesBanao.</p>
        <p>You keep responsibility for the content you submit or process through NotesBanao. You grant NotesBanao the limited permission needed to process that content to provide the service.</p>
      </PolicySection>

      <PolicySection title="10. Service availability and changes">
        <p>NotesBanao is provided on an as-available basis. We may update, improve, limit, suspend, or discontinue features when needed for security, reliability, compliance, or product changes.</p>
      </PolicySection>

      <PolicySection title="11. Contact">
        <p>For questions about these Terms, contact us at <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>.</p>
      </PolicySection>
    </PublicPageShell>
  );
}
