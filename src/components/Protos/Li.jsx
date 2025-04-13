import React, { memo, useEffect, useRef, useState } from "react";
import { $a, addClickClass } from "../../helpers/cocktail";
import { Link, useParams, useResolvedPath } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { removeAllActivesState } from "../../helpers/atoms";
import { refType } from "../../helpers/jsDocs";

export const Li = memo(
  ({
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
    icon = (strokeColor, strokeWidth) => {},
  }) => {
    const path = useResolvedPath();
    const setRemoveActives = useSetRecoilState(removeAllActivesState);
    const allActives = useRecoilValue(removeAllActivesState);
    const [myName, setMyName] = useState("");
    const [isClicked, setIsClicked] = useState();
    const buttonRef = useRef(refType);

    // console.log(path.pathname?.match(to)?.filter(link=>link)?.length);

    // useEffect(() => {
    //   //   if (!buttonRef || !buttonRef.current) return;
    //   console.log(isClicked);

    //   if (allActives == title) {
    //     setMyName(title);
    //     setIsClicked(true);
    //     return;
    //   }
    //   setMyName("");
    //   setIsClicked(false);
    // }, [allActives]);

    // useEffect(() => {
    //   const handleClickCallback = () => {
    //     setRemoveActives("");
    //   };
    //   window.addEventListener("click", handleClickCallback);
    //   return () => {
    //     window.removeEventListener("click", handleClickCallback);
    //   };
    // }, []);

    return (
      <li
        className={`group li-btn h-[35px] w-[35px]   rounded-lg cursor-pointer grid place-items-center transition-all ${
          to && path.pathname?.match(to)?.filter((link) => link)?.length
            ? "bg-blue-600"
            : ""
        } ${className}  ${hover ? "hover:bg-blue-700" : ""}`}
      >
        {to ? (
          <Link
            to={to}
            title={title}
            aria-label={title}
            ref={refForward}
            target={target}
            className={`w-full h-full   ${
              linkClassName ? linkClassName : "flex justify-center items-center"
            } ${
              fillObjectIconOnHover && "[&_path]:hover:fill-[white!important]"
            }  ${fillStrokeIcon && "[&_path]:hover:stroke-white"}`}
            onClick={(ev) => {
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
            title={title}
            className={`w-full h-full  flex justify-center items-center ${
              fillIcon && "[&_path]:hover:fill-white"
            } ${fillStrokeIcon && "[&_path]:hover:stroke-white"}`}
            onClick={(ev) => {
              onClick(ev);
              addClickClass(ev.currentTarget, "click");

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
      </li>
    );
  }
);
