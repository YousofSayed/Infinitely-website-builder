import React, { useEffect, useState } from "react";

/**
 * A small button component with customizable styles and click behavior.
 * @typedef {Object} Props - Component props
 * @property {string} className - Custom CSS class for the button.
 * @property {Function} onClick - Callback function for button click.
 * @property {boolean} showTooltip - Show popover on button click.
 * @property {string} tooltipTitle
 * @property {ReactNode} children - Child components to render inside the button.
 * @param {React.InputHTMLAttributes<HTMLInputElement> & Props} props
 */
export const Input = ({
  type = "text",
  autoFocus = false,
  className = "",
  placeholder = "",
  value = "",
  onInput = (_) => {},
  onChange = (_) => {},
  onKeyUp = (ev) => {},
  onKeyDown = (ev) => {},
  ...props
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value != undefined ? value : "");
  }, [value]);

  return (
    <input
      {...props}
      autoFocus={autoFocus}
      type={type}
      value={val}
      placeholder={placeholder}
      className={`p-2 outline-none text-white border-2 border-transparent focus:border-blue-600  rounded-lg  ${
        className ? className : "bg-slate-950"
      }`}
      onInput={(ev) => {
        setVal(ev.target.value);
        onInput(ev);
      }}
      onChange={(ev) => {
        setVal(ev.target.value);
        onChange(ev);
      }}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
    />
  );
};
