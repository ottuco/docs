export const getFragmentId = (...keys: (string | undefined)[]) =>
  keys.filter(Boolean).join("-");

export const copyAnchorUrl = async (id: string) => {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;

  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof document === "undefined" ||
    !document.hasFocus()
  ) {
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Ignore clipboard failures and keep the anchor navigation working.
  }
};
