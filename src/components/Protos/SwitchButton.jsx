import React, { useState } from "react";

export const SwitchButton = ({
  onActive = (ev) => {},
  onUnActive = (ev) => {},
  defaultValue = false,
}) => {
  const [active, setActive] = useState(defaultValue);
  return (
    <button
      className={`relative overflow-hidden w-[40px] flex p-[2px] flex-shrink-0  items-center h-[20px] rounded-full ${
        active ? "bg-blue-600" : "bg-white"
      } transition-all`}
      onClick={(ev) => {
        const currentValue = !active;
        currentValue ? onActive(ev) : onUnActive(ev);
        setActive(currentValue);
      }}
    >
      <div
        className={`h-[18px] w-[18px] flex-shrink-0   rounded-full ${
          active ? "translate-x-[20px] bg-white" : "bg-blue-600"
        } transition-all`}
      ></div>
    </button>
  );
};
