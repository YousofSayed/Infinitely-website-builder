import React from "react";

export const Path = ({
  d,
  transform,
  strokeMiterlimit,
  stroke = "#64748B",
  strokeWidth = "2",
  dontHover = false,
  fill = "",
  justFillOnHover = false,
  dontFileStroke = false,
  group = true,
}) => {
  return (
    <path
      d={d}
      // strokeMiterlimit={strokeMiterlimit}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fillRule="evenodd"
          clipRule="evenodd"
      // strokeLinecap="round"
      className={`${
        group && !dontHover && !dontFileStroke && "group-hover:stroke-white" 
      } ${
        justFillOnHover && !dontHover
          ? group &&
            !dontHover ?
            "group-hover:fill-[white!important]" : ''
          : ""
      } transition-all`}
      strokeLinejoin="round"
      fill={fill}
      transform={transform}
    />
  );
};
