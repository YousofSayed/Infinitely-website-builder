// million-ignore
import React, { useRef, useState, useTransition } from "react";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Tooltip } from "react-tooltip";
import { addClickClass, uniqueID } from "../../helpers/cocktail";
import { unwrap } from "million/react";

// million-ignore
/**
 * @param {import('react').HTMLAttributes<HTMLDivElement>} [props]
 * @returns {JSX.Element}
 */
export const OptionsButton = ({
  children,
  place = "bottom-end",
  onClick,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [, startTransition] = useTransition();
  const id = useRef(uniqueID());

  const handleClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    startTransition(() => setShowTooltip((prev) => !prev));
    addClickClass(ev.currentTarget, "click");
    onClick?.(ev);
  };

  const handleTooltipClick = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  return (
    <div
      className="w-full h-full"
      onClick={(ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      }}
    >
      <SmallButton
        className="w-full h-full flex justify-center items-center bg-transparent hover:bg-transparent border-none "
        onClick={handleClick}
        id={id.current}
        {...props}
      >
        {Icons.options({ fill: "#fff" })}
      </SmallButton>

      <Tooltip
        id={`tooltip-${id.current}`}
        className="w-fit p-[unset] z-[100] shadow-lg bg-slate-800 shadow-slate-950"
        style={{
          boxShadow: "0px 0px 10px 1px #020617",
          padding: "5px",
          backgroundColor: "#1e293b",
        }}
        positionStrategy="fixed"
        anchorSelect={`#${id.current}`}
        place={place}
        clickable
        isOpen={showTooltip}
        setIsOpen={setShowTooltip}
        openEvents={{
          click: false,
          dblclick: false,
          focus: false,
          mousedown: false,
          mouseenter: false,
          mouseover: false,
        }}
        opacity={1}
        openOnClick
        closeEvents={{
          click: false,
          dblclick: false,
          blur: false,
          mouseout: false,
          mouseup: false,
          mouseleave: false,
        }}
      >
        <div onClick={handleTooltipClick}>{children}</div>
      </Tooltip>
    </div>
  );
};
