export const getFragmentId = (...keys: (string | undefined)[]) =>
  keys.filter(Boolean).join("-");
