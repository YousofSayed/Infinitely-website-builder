import React, { useEffect, useRef, useState, useTransition } from "react";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Menu } from "../Editor/Protos/Menu";
import { Popover } from "../Editor/Popover";
import { Tooltip } from "react-tooltip";
import { addClickClass, uniqueID } from "../../helpers/cocktail";

/**
 * @param {import('react').HTMLAttributes<HTMLDivElement>} [props] - All HTML div attributes
 * @returns {JSX.Element}
 */
export const OptionsButton = ({ children, onClick, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPending, setTransition] = useTransition();
  const buttonRef = useRef();
  const id = useRef(uniqueID());

  return (
    <>
      <SmallButton
        {...props}
        id={id.current}
        onClick={(ev) => {
          addClickClass(ev.currentTarget, "click");
          onClick?.(ev);
        }}
        className="w-fit bg-transparent hover:bg-transparent border-none"
      >
        {Icons.options({ fill: "#fff" })}
      </SmallButton>

      <Tooltip
        className="w-fit p-[unset] z-[100]"
        style={{
          boxShadow:`0px 0px 10px 1px #0f172a`,
          padding: "10px 5px",
        }}
        anchorSelect={`#${id.current}`}
        place="bottom-end"
        clickable
        opacity={1}
        isOpen={showTooltip}
        setIsOpen={setShowTooltip}
        openOnClick
      >
        {children}
      </Tooltip>
    </>
  );
};
