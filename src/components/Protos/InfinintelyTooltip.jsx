import React from "react";
import { Tooltip } from "react-tooltip";
import Portal from "../Editor/Portal";
import { tooltipDataType } from "../../helpers/jsDocs";
import { useRecoilValue } from "recoil";
import { tooltipDataState } from "../../helpers/atoms";

export const InfinintelyTooltip = ({ props = tooltipDataType, children }) => {
    const tooltipData = useRecoilValue(tooltipDataState);
  return (
    <Portal>
      <Tooltip {...{props , tooltipData}}>{children}</Tooltip>
    </Portal>
  );
};
