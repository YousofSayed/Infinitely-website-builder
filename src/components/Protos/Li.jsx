import React, { memo, useEffect, useRef, useState } from "react";
import { addClickClass, uniqueID } from "../../helpers/cocktail";
import { Link, useParams, useResolvedPath } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { removeAllActivesState } from "../../helpers/atoms";
import { refType } from "../../helpers/jsDocs";
import { Tooltip } from "react-tooltip";
import { useUlContext } from "./UlProvider";
import { uniqueId } from "lodash";

//million-ignore
export const Li = ({
  children,
  className = "",
  hover = true,
  to = "",
  title = "",
  onClick = () => {},
  justHover = false,
  isObjectParamsIcon = false,
  fillObjIcon = true,
  fillObjectIconOnHover = false,
  fillObjIconStroke = false,
  fillIcon = false,
  fillStrokeIcon = false,
  refForward,
  linkClassName = "",
  target,
  notify,
  notifyBg = "bg-blue-600",
  mode,
  id ,
  enableSelecting = false,
  icon = (strokeColor, strokeWidth) => {},
}) => {
  const path = useResolvedPath();
  const setRemoveActives = useSetRecoilState(removeAllActivesState);
  const allActives = useRecoilValue(removeAllActivesState);
  const [myName, setMyName] = useState("");
  const [isClicked, setIsClicked] = useState();
  const buttonRef = useRef(refType);
  const uuid = useRef(uniqueID());
  const [showTooltip, setShowTooltip] = useState(false);
  const { selectedId, setSelectedId } = useUlContext();
  const [selected, setSelected] = useState(null);

  const select = () => {
    console.log("wow");
    if (!enableSelecting) return;
    if(!selectedId && !setSelectedId)return
    if (mode == "group") {
      setSelectedId(selected ? null : id);
    } else {
      setSelected(!selected);
    }
  };

  useEffect(() => {
    if (!enableSelecting) return;
    
    if (mode === "group") {
      console.log('selecting enabled' , selectedId === id);
      setSelected(selectedId === id);
    }
  }, [selectedId]);


  return (
    <li
      onMouseOver={() => {
        setShowTooltip(true);
      }}
      onMouseOut={() => {
        setShowTooltip(false);
      }}
      tooltib-id={uuid.current}
      style={{
        backgroundColor:selected ? 'var(--main-bg)' : ''
      }}
      className={`group relative li-btn h-[30px] w-[30px]     rounded-lg cursor-pointer grid place-items-center transition-all ${
        to && path.pathname?.match(to)?.filter((link) => link)?.length
          ? "bg-blue-600"
          : ""
      }  ${className}  ${
        hover ? "hover:bg-blue-600" : ""
      }`}
    >
      {to ? (
        <Link
          to={to}
          // title={title}
          aria-label={title}
          ref={refForward}
          target={target}
          className={`w-full h-full   
          ${linkClassName ? linkClassName : "flex justify-center items-center"}

          ${fillObjectIconOnHover && "[&_path]:hover:fill-[white!important]"}

          ${fillStrokeIcon && "[&_path]:hover:stroke-white"}
          
          ${
            fillObjectIconOnHover &&
            selected &&
            "[&_path]:fill-[white!important]"
          }

          ${fillStrokeIcon && selected && "[&_path]:stroke-white"}

          `}
          onClick={(ev) => {
            // ev.preventDefault();
            // ev.stopPropagation();
            // select();
            addClickClass(ev.currentTarget, "click");
            onClick(ev);
          }}
        >
          {isObjectParamsIcon
            ? icon?.({
                fill: path.pathname.includes(to)
                  ? "white"
                  : fillObjIcon
                  ? "white"
                  : undefined,
                strokeColor: fillObjIconStroke
                  ? isClicked && allActives == title
                    ? "white"
                    : undefined
                  : undefined,
              })
            : icon?.(
                path.pathname.includes(to) ? "white" : undefined,
                undefined,
                isClicked && allActives == title ? "white" : undefined
              )}
          {children}
        </Link>
      ) : (
        <button
          ref={refForward}
          aria-label={title}
          // title={title}
          className={`w-full h-full  flex justify-center items-center 
          
          ${fillIcon && "[&_path]:hover:fill-white"}
          
          ${fillStrokeIcon && "[&_path]:hover:stroke-white"}
          
          ${fillIcon && selected && "[&_path]:fill-white"}

          ${
            fillObjectIconOnHover &&
            selected &&
            "[&_path]:fill-[white!important] [&_svg]:fill-[white!important]"
          }

          ${fillStrokeIcon && selected && "[&_path]:stroke-white"}

          `}
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            select();
            addClickClass(ev.currentTarget, "click");
            onClick(ev);

            // if(justHover)return;
            // [...$a(".clicked")]
            //   .filter((el) => el != ev.currentTarget)
            //   .forEach((el) => el.classList.remove("clicked"));
            // setMyName("");
            // const is = ev.currentTarget.classList.contains("clicked");
            // setRemoveActives(title);

            // if (is) {
            //   setIsClicked(false);

            //   ev.currentTarget.classList.remove("clicked");
            // } else {
            //   setIsClicked(true);
            //   ev.currentTarget.classList.add("clicked");
            // }
          }}
        >
          {isObjectParamsIcon
            ? icon?.({
                fill: fillObjIcon
                  ? isClicked && allActives == title
                    ? "white"
                    : undefined
                  : undefined,
                strokeColor: fillObjIconStroke
                  ? isClicked && allActives == title
                    ? "white"
                    : undefined
                  : undefined,
              })
            : icon?.(
                fillStrokeIcon ? "white" : undefined,
                undefined,
                isClicked && allActives == title ? "white" : undefined
              )}
          {children}
        </button>
      )}

      {notify && (
        <div
          className={`absolute w-[10px] h-[10px] ${notifyBg} rounded-full right-0 top-0`}
        ></div>
      )}
      {showTooltip && title && (
        <Tooltip
          anchorSelect={`[tooltib-id="${uuid.current}"]`}
          place="bottom-start"
          positionStrategy="fixed"
          className="z-[100] capitalize font-semibold"
        >
          {title}
        </Tooltip>
      )}
    </li>
  );
};
