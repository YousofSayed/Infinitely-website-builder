import React, { useState, useEffect } from "react";

// million-ignore
/**
 * We use Omit to remove the native HTML 'defaultValue' (which is a string/array)
 * so we can safely replace it with our own boolean 'defaultValue'.
 * 
 * @typedef {Omit<import('react').ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue'> & {
 *  onActive?: (ev: import('react').MouseEvent<HTMLButtonElement>) => void,
 *  onUnActive?: (ev: import('react').MouseEvent<HTMLButtonElement>) => void,
 *  onSwitch?: (isActive: boolean) => void,
 *  defaultValue?: boolean
 * }} SwitchButtonProps
 */

/**
 * A customizable toggle switch button component. 
 * It maintains internal state but syncs with the `defaultValue` prop if it changes.
 *
 * @param {SwitchButtonProps} props - The component props.
 * @returns {JSX.Element} The rendered switch button.
 *
 * @example
 * <SwitchButton 
 *   defaultValue={true} 
 *   onSwitch={(isActive) => console.log('Toggled:', isActive)} 
 *   disabled={false} 
 * />
 */
export const SwitchButton = ({
  onActive = (ev) => {},
  onUnActive = (ev) => {},
  onSwitch = (value = false) => {},
  defaultValue = false,
  ...props
}) => {
  const [active, setActive] = useState(defaultValue);

  // Syncs internal state if the parent component changes the defaultValue prop
  useEffect(() => {
    setActive(defaultValue);
  }, [defaultValue]);

  return (
    <button
      {...props}
      type="button"
      className={`relative overflow-hidden w-[40px] flex p-[2px] shrink-0 items-center h-[20px] rounded-full transition-all ${
        active ? "bg-brand-primary" : "bg-white"
      } ${props.className ? props.className : ""}`}
      
      // FIX: Merged onClick to prevent parent onClick from being overwritten
      onClick={(ev) => {
        ev.stopPropagation();
        
        // 1. Call the parent's onClick if they provided one via ...props
        if (props.onClick) {
          props.onClick(ev);
        }

        const currentValue = !active;
        
        // Fire specific callbacks
        currentValue ? onActive(ev) : onUnActive(ev);
        
        // Update internal state
        setActive(currentValue);
        
        // Fire generic toggle callback
        onSwitch(currentValue);
      }}
    >
      <div
        className={`h-[18px] w-[18px] shrink-0 rounded-full transition-all ${
          active ? "translate-x-[20px] bg-white" : "bg-brand-primary"
        }`}
      ></div>
    </button>
  );
};