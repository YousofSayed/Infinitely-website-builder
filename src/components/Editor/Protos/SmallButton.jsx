// million-ignore
import React from "react";
import { addClickClass } from "../../../helpers/cocktail";
import { Tooltip } from "react-tooltip";

// million-ignore
/**
 * A small button component with customizable styles and click behavior.
 * @typedef {Object} Props - Component props
 * @property {string} className - Custom CSS class for the button.
 * @property {Function} onClick - Callback function for button click.
 * @property {boolean} showTooltip - Show popover on button click.
 * @property {string} tooltipTitle
 * @property {string} tooltipClassName
 * @property {ReactNode} children - Child components to render inside the button.
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & Props} props
 */
export const SmallButton = ({
  children,
  className = "",
  // onClick,
  showTooltip = true,
  tooltipTitle = "",
  tooltipClassName = "",
  ...props
}) => {
  const id = React.useId();

  return (
    <>
      <button
        {...props}
        tooltip-id={id}
        className={`w-[48px] outline-none border-2 border-transparent focus:border-blue-600 transition-colors   hover:bg-blue-600 flex rounded-lg cursor-pointer items-center justify-center flex-shrink-0  ${
          className ? className : "bg-slate-800"
        }`}
        onClick={(ev) => {
          addClickClass(ev.currentTarget, "click");
          props.onClick?.(ev);
        }}
      >
        {children}
      </button>
      {showTooltip && (tooltipTitle || props.title) && (
        <Tooltip
          anchorSelect={`[tooltip-id="${id}"]`}
          place="bottom-end"
          positionStrategy="fixed"
          opacity={1}
          className={`capitalize font-semibold z-[11000!important]  ${tooltipClassName}`}
        >
          {tooltipTitle || props.title}
        </Tooltip>
      )}
    </>
  );
};
