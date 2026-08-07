import React, { memo } from "react";

export const Memo = memo(
  /**
   * @typedef {Object} Props
   * @property {React.JSX.Element} children
   * @param {React.HTMLAttributes<HTMLDivElement> & Props} props
   * @returns
   */
  ({ children , ...props}) => {
    return <div {...props}>{children}</div>;
  }
);
