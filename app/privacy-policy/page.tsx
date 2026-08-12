import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PageNote, PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | NotesBanao",
  description: "Privacy Policy for NotesBanao account, portal, the NotesBanao Clients, payments, and generated notes."
};

export default function PrivacyPolicyPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);

  return (
    <PublicPageShell
      title="NotesBanao Privacy Policy"
      description="This policy explains what information NotesBanao may collect, how it is used to provide the portal and the NotesBanao Clients (our browser extension, Windows desktop app, and Android app), and how users can contact us about privacy questions."
    >
      <PageNote>
        <strong>Last updated:</strong> {businessInfo.lastUpdated}.{ownerLine ? ` ${ownerLine}` : ""}
      </PageNote>

      <PolicySection title="1. Information we collect">
        <p>We may collect account information such as your name, email address, login method, and authentication status.</p>
        <p>When you use NotesBanao, we may process lecture or session content, generated notes, transcript-related data, usage activity, support messages, NB Points balance and ledger activity, payment status, recharge records, and technical logs required to operate the service.</p>
        <p>When you use a NotesBanao Client — our browser extension, our Windows desktop app, or our Android app (each a &ldquo;NotesBanao Client&rdquo;, and together the &ldquo;NotesBanao Clients&rdquo;) — we may process information needed to create notes, such as the recording title, selected note options, transcript text, notes status, login status, and technical error details. In each NotesBanao Client, audio is converted to text on your own device and is not intentionally uploaded to our servers.</p>
      </PolicySection>

      <PolicySection title="2. Google sign-in data">
        <p>If you choose Google sign-in, NotesBanao requests only basic sign-in scopes such as openid, email, and profile. This may provide your Google account identifier, email address, email verification status, and basic profile identity information needed for login.</p>
        <p>NotesBanao uses Google sign-in data only to authenticate your account, maintain access to the portal and the NotesBanao Clients, prevent abuse, and provide account-related support.</p>
        <p>NotesBanao does not sell Google user data, use it for advertising, transfer it to data brokers, or use it to determine creditworthiness. The use of information received from Google APIs will adhere to the Google API Services User Data Policy, including Limited Use requirements.</p>
      </PolicySection>

      <PolicySection title="3. Lecture content and generated notes">
        <p>NotesBanao processes eligible lecture/session content to generate notes requested by the user. Generated notes and related metadata may be stored so users can access downloads and recent-note history from the portal.</p>
        <p>Transcript text and note-generation details may be sent securely to NotesBanao and trusted service providers only as needed to format, summarize, structure, and generate the requested notes. Raw captured audio is converted to text on your own device by the NotesBanao Client and is not intentionally uploaded to NotesBanao servers for notes generation.</p>
        <p>Users should not submit content they are not allowed to process or content that includes unnecessary personal, confidential, or sensitive information.</p>
      </PolicySection>

      <PolicySection title="4. Browser extension permissions and data handling">
        <p>The NotesBanao browser extension (a NotesBanao Client) works only for its user-facing purpose: helping you capture eligible lecture playback and generate notes when you choose to start the workflow.</p>
        <p><strong>Audio capture.</strong> The NotesBanao browser extension captures audio only during an active recording started by the user. That audio is processed on your device for speech-to-text. NotesBanao does not intentionally upload raw audio files or voice recordings to its servers for notes generation.</p>
        <p><strong>Transcripts and generated notes.</strong> Transcript text created from the lecture, and sometimes caption/subtitle/transcript text already available on the lecture page, may be sent securely to NotesBanao over HTTPS so we can validate the content and generate notes.</p>
        <p><strong>Website access.</strong> The NotesBanao browser extension asks for website access so it can work across lecture websites, course platforms, video pages, and pages that change without a full reload. We use this access to support lecture capture and notes generation. We do not use it to sell browsing history, build unrelated browsing profiles, or monitor tabs where you have not started or interacted with the NotesBanao workflow.</p>
        <p><strong>Login and local storage.</strong> The NotesBanao browser extension may store login and workflow information on your device so you can stay signed in, resume or retry notes generation, and connect requests to your NotesBanao account.</p>
      </PolicySection>

      <PolicySection title="5. Chrome Web Store Limited Use disclosure">
        <p>NotesBanao&apos;s use and transfer of information received from Chrome extension APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.</p>
        <p><strong>Allowed use.</strong> We use personal or sensitive data handled by the NotesBanao browser extension only to provide or improve NotesBanao&apos;s notes-generation features, account access, NB Points usage, error debugging, abuse prevention, and user support.</p>
        <p><strong>Allowed transfer.</strong> We transfer user data only when needed to provide or improve NotesBanao, comply with law, protect security, prevent abuse, process payments, provide support, or complete a permitted business transfer. Transcript text may be processed by trusted service providers only as needed to generate the requested notes.</p>
        <p><strong>Advertising prohibition.</strong> We do not use or transfer extension data, transcript data, lecture content, browsing activity, Google user data, or Chrome Web Store API data to serve personalized, retargeted, or interest-based advertising.</p>
        <p><strong>No sale or brokerage.</strong> We do not sell, rent, trade, or disclose user data to third-party data brokers.</p>
        <p><strong>Human access limits.</strong> NotesBanao personnel do not read user transcripts, lecture content, or generated notes except with the user&apos;s specific consent for support, when necessary for security or abuse investigation, to comply with law, or in aggregated/anonymized form for internal operations.</p>
      </PolicySection>

      <PolicySection title="6. How we use information">
        <p>We use information to create and secure accounts, provide lecture-note generation, manage NB Points and recharges, process support requests, prevent abuse, debug errors, improve reliability, and comply with applicable legal, tax, accounting, and payment requirements.</p>
        <p>NB Points records are used to show available points, reserve points during generation, record point usage, reconcile recharge delivery, and support payment or dispute review.</p>
      </PolicySection>

      <PolicySection title="7. Payments and billing">
        <p>Payment information may be processed by third-party payment gateway providers. NotesBanao may receive payment status, transaction references, recharge amount, NB Points delivered, refund status, dispute status, and settlement-related information, but does not store full card or UPI credentials.</p>
      </PolicySection>

      <PolicySection title="8. NotesBanao Clients and technical data">
        <p>The NotesBanao Clients may exchange login status, recording/session details, context needed for notes generation, transcript text, and feature-status information with the NotesBanao portal and backend services.</p>
        <p>Each NotesBanao Client uses the narrowest permissions reasonably needed for its features. We do not use NotesBanao Client data for unrelated advertising, and we do not sell browsing activity.</p>
        <p>The use of information received from Chrome extension APIs will adhere to the Chrome Web Store User Data Policy, including Limited Use requirements.</p>
        <p>We may collect technical logs such as request metadata, error details, device or client context, and security signals needed to operate, debug, and protect the service.</p>
      </PolicySection>

      <PolicySection title="9. Sharing of information">
        <p>We may share information with service providers that help operate NotesBanao, including hosting, authentication, email, analytics, security, notes generation, payment processing, and support providers.</p>
        <p>We may also disclose information when required by law, regulation, court order, government request, fraud prevention, payment dispute handling, or to protect the rights and safety of NotesBanao, users, or third parties.</p>
      </PolicySection>

      <PolicySection title="10. Data security">
        <p>We use reasonable technical and organizational measures to protect user information. Personal or sensitive user data transmitted between the NotesBanao Clients, portal, backend services, and service providers is sent over secure connections such as HTTPS.</p>
        <p>No online service can guarantee perfect security, so users should keep account credentials safe and contact us quickly if they suspect unauthorized access.</p>
      </PolicySection>

      <PolicySection title="11. Data retention">
        <p>We keep information for as long as needed to provide NotesBanao, maintain account records, handle disputes, comply with legal/accounting requirements, prevent fraud, and improve service reliability.</p>
        <p>Raw audio captured by a NotesBanao Client is intended to remain on your device during recording and transcription. Transcript text, generated notes, note metadata, NB Points records, and payment records may be retained by NotesBanao as needed to provide downloads, show recent-note history, support account recovery, reconcile billing, investigate abuse, or comply with legal obligations.</p>
      </PolicySection>

      <PolicySection title="12. Account deletion and retention on deletion">
        <p>You can ask us to delete your NotesBanao account and associated personal data at any time, through any of these routes:</p>
        <p><strong>From within the NotesBanao Clients or portal.</strong> In any NotesBanao Client and in the web portal, open <strong>User Profile &rarr; Delete my account</strong>.</p>
        <p><strong>From the web, without signing in.</strong> Use our <a className="inline-link" href="/account-deletion">account deletion page</a>. We email a confirmation link to the address you provide to verify the request is genuinely yours before it takes effect. If the request is not confirmed, the link expires and no deletion takes place.</p>
        <p>Once a request is confirmed, we permanently delete your account and personal data within <strong>7 working days</strong>. This includes your profile and login credentials, your generated notes and transcript data, your NB Points balance and usage history, and related account activity. Audio captured by the apps is processed on your own device and is not stored on our servers, so there is no stored audio to delete.</p>
        <p><strong>What we cannot delete on request.</strong> Some records are retained where we are required or permitted to keep them, and are minimized and, where feasible, de-identified so they are no longer linked to you:</p>
        <p>&bull; Payment and transaction records (such as amounts paid, payment-gateway references and invoice data) are retained for the period required by Indian tax and accounting law.</p>
        <p>&bull; A one-way, irreversible hash of a verified mobile number may be retained to prevent repeated abuse of one-time signup benefits (fraud prevention).</p>
        <p>&bull; Where the law requires, certain security and transaction logs may be retained for a limited period after deletion.</p>
        <p>You can cancel a deletion request at any time before it is processed by signing in and opening <strong>User Profile &rarr; Delete my account</strong>. For questions about deletion or retention, contact <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>.</p>
      </PolicySection>

      <PolicySection title="13. Your choices">
        <p>You may contact us to request support with account access, correction, deletion, or privacy questions. Some records may need to be retained where required for legal, tax, payment, fraud-prevention, or security purposes.</p>
      </PolicySection>

      <PolicySection title="14. Children and students">
        <p>NotesBanao is intended for users aged 16 and above, consistent with the target audience we declare on Google Play. We do not knowingly create accounts for, or collect personal data from, anyone under 16. If we become aware that we hold personal data of a user under 16, we will delete it and close the account.</p>
        <p>Indian law treats anyone who has not completed 18 years of age as a child. If you are between 16 and 18, you may use NotesBanao only with the knowledge and consent of a parent or legal guardian, who accepts these Terms on your behalf and remains responsible for the account.</p>
        <p>We do not carry out behavioural tracking, profiling, or targeted advertising directed at children, and we do not serve personalised or interest-based advertising to any user.</p>
        <p>If a school, parent, guardian, or institution controls the learning environment, users must also follow those rules.</p>
      </PolicySection>

      <PolicySection title="15. Contact">
        <p>For privacy questions, contact <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>.</p>
      </PolicySection>
    </PublicPageShell>
  );
}
