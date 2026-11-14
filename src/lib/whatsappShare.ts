/**
 * A link that opens WhatsApp with `text` already written, so the visitor only picks a chat.
 *
 * `wa.me/?text=` (no phone number) often opens WhatsApp on Android with an empty message,
 * especially from in-app browsers and home-screen apps.
 * - Android: the app's own scheme carries the text reliably. It must open in the same tab,
 *   because `_blank` would leave an empty tab behind.
 * - iPhone and computers: api.whatsapp.com opens the app (or WhatsApp Web) with the text.
 */
const isAndroid = () => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
const webLink = (text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

export function whatsappShare(text: string): { href: string; target?: "_blank" } {
  return isAndroid() ? { href: `whatsapp://send?text=${encodeURIComponent(text)}` } : { href: webLink(text), target: "_blank" };
}

/**
 * Call from the link's onClick. On an Android phone without WhatsApp the scheme link does nothing,
 * so if the page is still in front a moment later, this opens the web link (same text) instead.
 */
export function whatsappFallback(text: string): void {
  if (typeof document === "undefined" || !isAndroid()) return;
  const cancel = () => {
    if (document.visibilityState !== "hidden") return;
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", cancel);
  };
  const timer = window.setTimeout(() => {
    document.removeEventListener("visibilitychange", cancel);
    if (document.visibilityState === "visible") window.location.href = webLink(text);
  }, 1600);
  document.addEventListener("visibilitychange", cancel);
}
