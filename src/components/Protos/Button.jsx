import React from "react";
import { addClickClass } from "../../helpers/cocktail";

/**
 *
 * @param {React.HTMLAttributes<HTMLButtonElement>} [props]
 * @returns
 */
export const Button = ({
  children,
  title,
  type = "button",
  keepPadding = true,
  className = "py-2 h-full  px-4  font-bold",
  onClick = () => {},
  ...props
}) => {
  return (
    <button
    title={title}
    type={type}
    className={`bg-blue-600 rounded-lg flex gap-2 items-center ${
      className && keepPadding
          ? `${className} px-4 py-2`
          : className
          ? className
          : ""
      }  text-nowrap text-white text-[14px]`}
      onClick={(ev) => {
        addClickClass(ev.currentTarget, "click");
        onClick(ev);
      }}
      {...props}
    >
      {children}
    </button>
  );
};
