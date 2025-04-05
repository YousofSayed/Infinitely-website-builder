import React, { useState } from "react";

export const SwitchButton = ({
  onActive = (ev) => {},
  onUnActive = (ev) => {},
  defaultValue = false,
}) => {
  const [active, setActive] = useState(defaultValue);
  return (
    <button
      className={`relative overflow-hidden w-[40px] flex items-center h-[20px] rounded-full ${
        active ? "bg-blue-500" : "bg-white"
      } `}
      onClick={(ev) => {
        const currentValue = !active;
        currentValue ? onActive(ev) : onUnActive(ev);
        setActive(currentValue);
      }}
    >
      <div
        className={`h-[18px] w-[20px]  rounded-full ${
          active ? "translate-x-[20px] bg-white" : "bg-blue-500"
        } transition-all`}
      ></div>
    </button>
  );
};
