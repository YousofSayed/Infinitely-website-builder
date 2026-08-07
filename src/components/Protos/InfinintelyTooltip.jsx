import { tooltipDataState } from "@/helpers/atoms";
import { tooltipDataType } from "@/helpers/jsDocs";
import Portal from "@/components/Editor/Portal";
import React from "react";
import { Tooltip } from "react-tooltip";
import { useRecoilValue } from "recoil";

export const InfinintelyTooltip = ({ props = tooltipDataType, children }) => {
    const tooltipData = useRecoilValue(tooltipDataState);
  return (
    <Portal>
      <Tooltip {...{props , tooltipData}}>{children}</Tooltip>
    </Portal>
  );
};
