import { getAppType } from "@/helpers/functions";

/**
 * @param {{ children: React.ReactNode, type: import("@/helpers/types").AppType }} param0
 */
export const ShowBasedOnAppType = ({ children, type }) => {
  const appType = getAppType();
  return appType === type ? <>{children}</> : null;
};