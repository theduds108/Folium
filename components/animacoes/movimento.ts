/** true quando a pessoa pediu ao sistema para reduzir animações. */
export function reduzirMovimento() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
