export const isDesktop =
  typeof window !== "undefined" &&
  window.electron?.isDesktop === true;