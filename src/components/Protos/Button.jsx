// million-ignore
import React from "react";
import { addClickClass } from "../../helpers/cocktail";

/**
 * Reusable blue button with click animation.
 *
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   refForward?: React.Ref<HTMLButtonElement>,
 *   keepPadding?: boolean
 * }} props
 */
export const Button = ({
  children,
  refForward,
  keepPadding = true,
  className = "py-2 h-full px-4 font-bold",
  ...props
}) => {
  return (
    <button
      ref={refForward || null}
      className={`bg-blue-600 rounded-lg flex gap-2 items-center ${
        className && keepPadding
          ? `${className} px-4 py-2`
          : className || ""
      } text-nowrap text-white text-[14px]`}
      {...props}
      onClick={(ev) => {
        addClickClass(ev.currentTarget, "click");
        props.onClick?.(ev);
      }}
    >
      {children}
    </button>
  );
};
