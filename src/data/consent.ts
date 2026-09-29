/**
 * Marketing consent wording, defined once.
 *
 * The exact string shown to the visitor is stored on the lead row, so this
 * constant is the single source for both. Never edit the text in place: bump
 * the version and add a new constant, or old rows will claim agreement to
 * wording that was never on screen.
 */
export const MARKETING_CONSENT_TEXT =
  "By checking this box, I agree to receive personalised marketing text messages and/or emails from Mad Monkey.";

/** Small print shown underneath the consent box. Not the consent wording itself. */
export const CONSENT_DISCLOSURE_TEXT =
  "Disclosure: Consent is not a condition of any purchase. Reply STOP to cancel, HELP for help. Msg & data rates may apply. Msg frequency varies. View Terms of Service and Privacy Policy.";

export const MARKETING_CONSENT_VERSION = "2026-09-29";
