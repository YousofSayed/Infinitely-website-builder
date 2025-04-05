import React, { useEffect, useRef, useState, useTransition } from "react";
import { SmallButton } from "../Editor/Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { Menu } from "../Editor/Protos/Menu";
import { Popover } from "../Editor/Popover";

export const OptionsButton = ({
  children,
  buttonClassName = "",
  menuClassName = "",
  menuWidth,
  menuHight,
  onClick = (ev, setShowMenu) => {},
  callbackChildren = ({ setShowMenu }) => {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, setTransition] = useTransition();
  const buttonRef = useRef();

  useEffect(() => {
    const clickCallback = (ev) => {
      console.log(ev.target.tagName);
      setTransition(() => {
        setShowMenu(false);
      });
    };
    window.addEventListener("click", clickCallback);

    return () => {
      window.removeEventListener("click", clickCallback);
      //   document.removeEventListener("focusout", clickCallback);
    };
  });

  return (
    <section
      className="relative h-full "
      onClick={(ev) => {
        ev.stopPropagation();
      }}
      ref={buttonRef}
    >
      <SmallButton
        onBlur={(ev) => {
          ev.stopPropagation();
        }}
        onClick={(ev) => {
          ev.stopPropagation();
          console.log(true);

          ev.currentTarget.parentNode.click();
          setTransition(() => {
            setShowMenu(!showMenu);
          });
          onClick(ev, setShowMenu);
        }}
        className={`h-full ${
          buttonClassName ? buttonClassName : "bg-slate-800"
        }`}
      >
        {Icons.options({ fill: "#fff" })}
      </SmallButton>

      {showMenu && (
        // <menu

        //   onClick={(ev) => {
        //     ev.stopPropagation();
        //   }}
        //   className={`flex flex-col gap-2 border-2 border-slate-600  p-2 absolute  shadow-md shadow-gray-950 text-white w-[130px] text-center left-[-65px] rounded-lg z-[500] top-[calc(100%+10px)] ${
        //     menuClassName ? menuClassName : "bg-slate-800"
        //   }`}
        // >
        //   {children || callbackChildren({setShowMenu})}
        // </menu>
        <Popover
          width={menuWidth || 200}
          height={menuHight || 200}
          isOpen={showMenu}
          setIsOpen={setShowMenu}
          targetRef={buttonRef}
        >
          <menu className="p-2">
            {children || callbackChildren({ setShowMenu })}
          </menu>
        </Popover>
      )}
    </section>
  );
};
