import type { Metadata } from "next";
import { businessInfo, publicBusinessValue } from "@/lib/business-info";
import { PageNote, PolicySection, PublicPageShell } from "../components/PublicPageShell";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | NotesBanao",
  description: "Refund and cancellation policy for NotesBanao recharge packs and English notes NB Points."
};

export default function RefundCancellationPolicyPage() {
  const ownerLine = publicBusinessValue(businessInfo.ownerLine);

  return (
    <PublicPageShell
      title="Refund & Cancellation Policy"
      description="This policy explains how NotesBanao handles recharge payments, failed payments, cancellations, and refund requests for its digital note-generation service."
    >
      <PageNote>
        <strong>Last updated:</strong> {businessInfo.lastUpdated}.{ownerLine ? ` ${ownerLine}` : ""}
      </PageNote>

      <PageNote>
        <strong>Language support:</strong> {businessInfo.languageSupportLine}
      </PageNote>

      <PolicySection title="1. Digital service and NB Points">
        <p>NotesBanao is a digital service for eligible English and Hinglish (mixed Hindi and English) lecture-note generation, with notes generated in English only. NB Points are used only inside NotesBanao for eligible services.</p>
        <p>NB Points are a limited, personal, non-transferable entitlement to use note-generation features. They are not cash, not prepaid money, not a prepaid payment instrument, not a stored-value wallet, not withdrawable, not transferable to another user, and carry no monetary value outside NotesBanao.</p>
        <p>Trial, bonus, promotional, referral, and coupon NB Points are granted free of charge. They are never refundable, exchangeable, or convertible to money, because no payment is made for them.</p>
      </PolicySection>

      <PolicySection title="2. Evaluate the service free before you pay">
        <p>Every new account can claim free trial NB Points, and NotesBanao provides a free preview allowance so you can generate and read real notes from your own lecture content before making any payment.</p>
        <p>This means you can assess note quality, accuracy, length, formatting, and how NotesBanao handles your audio and chosen language <strong>before</strong> you spend money. We strongly recommend generating at least one set of free notes before recharging.</p>
        <p>Because a free evaluation is available to every user before purchase, a recharge is treated as an informed purchase made with knowledge of the service output.</p>
      </PolicySection>

      <PolicySection title="3. Acknowledgement at the time of purchase">
        <p>By completing a recharge you confirm that you have read and accepted this policy and the NotesBanao Terms & Conditions, that you have had the opportunity to evaluate the service free of charge, and that NB Points are delivered to your account immediately and are non-refundable once delivered, except in the limited cases described in section 6.</p>
      </PolicySection>

      <PolicySection title="4. No refund for delivered NB Points">
        <p>A successful one-time recharge is final once NB Points are delivered to the user account. Delivery of NB Points constitutes complete performance of that purchase by NotesBanao.</p>
        <p>NB Points are not refundable merely because they remain unused, because you changed your mind, because you no longer wish to use NotesBanao, or because you purchased a larger pack than you needed.</p>
        <p>NB Points that have been used, in whole or in part, to generate notes are not refundable, as the service for those points has already been delivered.</p>
      </PolicySection>

      <PolicySection title="5. Notes quality, source material, and user choices">
        <p>Notes are produced using automated speech-to-text and AI language models. Generated notes may contain mistakes, omissions, summarisation gaps, or formatting differences. This is an inherent characteristic of the technology, is disclosed in our Terms & Conditions before purchase, and is not treated as a defect in the service.</p>
        <p>Note quality depends substantially on the source material, which is under your control. Unclear or low-volume audio, background noise, music, overlapping speakers, strong accents, very short recordings, silent or muted capture, and unsupported or mixed content can all reduce note quality. Such outcomes are not a service defect and are not eligible for refund.</p>
        <p>NotesBanao supports English and Hinglish (mixed Hindi and English) lectures, with notes generated in English only. Content in other languages is unsupported, and notes generated from unsupported content are not eligible for refund.</p>
        <p>The lecture language is selected by you in the NotesBanao Client before notes are generated. If an incorrect language is selected — for example choosing English for a Hinglish lecture, or Hinglish for an English lecture — the resulting notes may be poor or unusable. The service was delivered as instructed, so such cases are not eligible for refund.</p>
        <p>Dissatisfaction with the style, depth, length, structure, or wording of generated notes is a matter of preference rather than a defect, and is not a ground for refund.</p>
      </PolicySection>

      <PolicySection title="6. When a refund may be approved (payment and delivery failures only)">
        <p>This section applies only where a payment or delivery failure means you were charged but did not receive the NB Points you paid for. It does not apply where NB Points were delivered successfully. If NB Points reached your account, section 4 applies and no refund is payable, whether or not you have used them.</p>
        <p>These cases are limited to: payment was successfully completed but the corresponding NB Points were never delivered to the account; the same recharge was charged more than once due to a payment or technical error; a NotesBanao technical failure prevented the purchased service from being delivered at all; or a refund is required under applicable consumer law.</p>
        <p><strong>How these cases are resolved.</strong> NB Points are the standard remedy. Where payment has succeeded but NB Points did not reach your account, NotesBanao delivers the NB Points you paid for, by crediting them to your account or issuing a coupon of equal value. This completes the purchase you originally made and is normally the full and final resolution of the request.</p>
        <p>A money refund is made only where NB Points cannot be credited to your account, where the same amount was charged more than once and you do not accept an equivalent NB Points credit, or where a refund is required under applicable law. Any money refund is made to the original payment method, as required by payment-industry rules.</p>
        <p><strong>Pending payments.</strong> Where a payment is still pending with the payment provider or bank, NotesBanao will confirm the final settlement status with the provider before crediting NB Points or initiating a refund, so that the same payment is not credited or refunded twice.</p>
        <p>Any approved refund is limited to the amount for which NB Points were not delivered. NotesBanao may deduct from any refund the value of NB Points already delivered or used, together with applicable taxes and non-recoverable payment-gateway charges, to the extent permitted by law.</p>
      </PolicySection>

      <PolicySection title="7. When a refund will not be provided">
        <p>Refunds are not provided where NB Points were delivered successfully, whether used or unused; for change of mind; for dissatisfaction with note quality, style, or length as described in section 5; for incorrect language selection or poor source audio; for unsupported content or languages; for trial, bonus, promotional, referral, or coupon NB Points; or where the account has been suspended or terminated for breach of the NotesBanao Terms & Conditions, fraud, or abuse.</p>
      </PolicySection>

      <PolicySection title="8. Time limit for refund requests">
        <p>Refund requests must be raised within 7 days of the transaction date, so that the payment and service-delivery records can be verified reliably. Requests raised after this period may not be entertained, except where a longer period is required by applicable law.</p>
      </PolicySection>

      <PolicySection title="9. How to request support or refund review">
        <p>Email <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a> with your registered email address, payment date, amount, payment reference or order ID, screenshot if available, and a short description of the issue.</p>
        <p>NotesBanao will review the request and may ask for additional information needed to verify the transaction. As part of the review, NotesBanao may examine recharge records, NB Points delivery and usage records, and note-generation activity on the account. The outcome is communicated to your registered email address.</p>
      </PolicySection>

      <PolicySection title="10. Refund method and timeline">
        <p>Where the resolution is delivery of NB Points under section 6, the NB Points are credited to your NotesBanao account directly or by coupon, and no money is returned.</p>
        <p>Where a money refund is approved, it is initiated to the original payment method through the same payment gateway or banking network used for the transaction, in line with applicable payment-industry requirements. NotesBanao does not provide cash refunds.</p>
        <p>NotesBanao aims to review eligible refund requests and initiate approved refunds within 5-7 working days after receiving the required details. After a refund is initiated, the actual credit to the customer bank, card, UPI app, or wallet may depend on the payment provider and banking network timelines.</p>
      </PolicySection>

      <PolicySection title="11. Cancellation, account closure, and forfeiture">
        <p>One-time recharges cannot be cancelled after successful payment and NB Points delivery, including when NB Points are still unused.</p>
        <p>If you delete your NotesBanao account, any remaining NB Points are permanently forfeited and are not refunded or reinstated. Please use or consider your remaining balance before requesting deletion.</p>
        <p>If an account is suspended or terminated for breach of the Terms & Conditions, fraud, abuse, or misuse of the service, any remaining NB Points are forfeited without refund.</p>
        <p>NotesBanao does not currently sell a public monthly subscription plan. If subscriptions are introduced later, subscription cancellation terms will be shown before purchase.</p>
      </PolicySection>

      <PolicySection title="12. Chargebacks and payment disputes">
        <p>If you believe there is a problem with a payment, please contact NotesBanao support first so it can be reviewed and resolved directly. Most payment issues are resolved faster this way than through a bank dispute.</p>
        <p>Raising a chargeback or payment dispute without first contacting support may result in the account being suspended while the dispute is investigated. Where NotesBanao believes a dispute is not legitimate — for example where NB Points were delivered and used — NotesBanao may contest it and submit account, delivery, and usage records as evidence.</p>
        <p>Where a chargeback is raised on NB Points that were delivered or already used, NotesBanao may suspend the account and may recover or reverse the corresponding NB Points.</p>
      </PolicySection>

      <PolicySection title="13. Pricing and NB Points cost changes">
        <p>Recharge prices, pack contents, and the NB Points cost of generating notes may change from time to time. Changes apply to future purchases and future note generation. Already-delivered NB Points remain usable under the rules in force at the time they are used, and no refund, top-up, or compensation is provided because pricing or point costs changed after your purchase.</p>
      </PolicySection>

      <PolicySection title="14. Service interruptions and third-party dependencies">
        <p>NotesBanao depends on third-party providers for hosting, payments, and AI note generation, and may be temporarily unavailable due to maintenance, provider outages, network issues, or events outside its reasonable control. A temporary interruption is not by itself a service failure entitling a refund, unless it permanently prevented delivery of a purchased service.</p>
      </PolicySection>

      <PolicySection title="15. Payment gateway and bank disputes">
        <p>Payment gateway partners and banks may have their own processing, settlement, dispute, refund-window, and chargeback timelines. NotesBanao can review service delivery and recharge records, but banking-network timelines are outside NotesBanao direct control.</p>
      </PolicySection>

      <PolicySection title="16. Your rights under consumer law">
        <p>Nothing in this policy excludes, restricts, or limits any right or remedy available to you under applicable Indian consumer law, including where a service is found to be deficient. Where any part of this policy conflicts with a right you have under applicable law, that law prevails to the extent of the conflict.</p>
      </PolicySection>

      <PolicySection title="17. Contact">
        <p>For refund or recharge support, contact <a className="inline-link" href={`mailto:${businessInfo.supportEmail}`}>{businessInfo.supportEmail}</a>.</p>
      </PolicySection>
    </PublicPageShell>
  );
}
