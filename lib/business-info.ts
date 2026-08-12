/**
 * Business details shown on the policy pages, the footer, and the GST invoice.
 *
 * The values below are PLACEHOLDERS for this demo build. The production portal
 * carries the real registered name, address, GSTIN and support contacts; none
 * of that belongs in a shared repository, so it has been replaced here. Change
 * anything you like — nothing outside this file depends on the values.
 */
export const businessInfo = {
  brandName: "NotesBanao",
  domain: "example.com",
  legalOwner: "Demo Owner",
  tradeName: "NotesBanao Demo",
  ownerLine: "This is a demo build of the NotesBanao portal. It is not operated as a business.",
  supportEmail: "support@example.com",
  contactEmail: "support@example.com",
  supportPhone: "+91 00000 00000",
  address: "1 Demo Street, Example City - 000000",
  gstin: "00AAAAA0000A1Z0",
  udyamRegistrationNo: "UDYAM-XX-00-0000000",
  stateName: "Karnataka",
  stateCode: "29",
  supportedInputLanguage: "English lectures and Hinglish (mixed Hindi and English) lectures",
  generatedNotesLanguage: "English only",
  languageSupportLine: "NotesBanao transcribes English lectures and Hinglish (mixed Hindi and English) lectures. You choose the lecture language in the NotesBanao Client (browser extension, Windows desktop app, or Android app), and both English and Hinglish lectures produce English notes only.",
  lastUpdated: "1 January 2026"
} as const;

/** Footer social links. Public pages only — change or empty as you like. */
export const socialLinks = [
  ["LinkedIn", "https://www.linkedin.com/company/notesbanao/"],
  ["YouTube", "https://www.youtube.com/@NotesBanaoAdmin"]
] as const;

export function publicBusinessValue(value: string) {
  const trimmed = value.trim();
  return trimmed && !trimmed.includes("[") && !trimmed.includes("]") ? trimmed : "";
}
