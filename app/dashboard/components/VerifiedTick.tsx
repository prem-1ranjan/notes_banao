/**
 * Green confirmation tick. Shared so the profile mobile row and the wallet trial
 * card read identically — verified state should look the same everywhere.
 * Pair it with the .verified-mark class on the surrounding element.
 */
export function VerifiedTick() {
  return (
    <svg className="verified-tick" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M5.8 10.4l2.7 2.7 5.7-5.9" />
    </svg>
  );
}
