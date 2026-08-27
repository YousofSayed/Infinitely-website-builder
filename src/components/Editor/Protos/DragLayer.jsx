import React from "react";
import Portal from "../Portal";

export const DragLayer = ({...props}) => {
  return (
    <Portal container={document.querySelector(`#root`)}>
      <div
        {...props}
        className={`fixed w-full h-full left-0 ${window.electron?.isDesktop ? "top-[40px]" : "top-0"} ${props.className || ""}`}
      >
        DragLayer
      </div>
    </Portal>
  );
};
