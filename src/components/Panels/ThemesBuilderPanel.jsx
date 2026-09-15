import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import React from "react";
import { useRecoilState } from "recoil";
import { ShowIf } from "@/components/ShowIf";
import { ThemesBuilder } from "../Protos/ThemesBuilder";

export const ThemesBuilderPanel = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  return (
    <>
      <ShowIf
        condition={
          showsComponents.views.themesBuilder.panels.themesBuilder.show
        }
      >
        <ThemesBuilder />
      </ShowIf>
    </>
  );
};
