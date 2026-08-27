import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import React from "react";
import { useRecoilState } from "recoil";
import { ShowIf } from "../ShowIf";
import { WpSettings } from "../Protos/wordpress/WpSettings";
import { WpQueriesBuilder } from "../Protos/wordpress/WpQueriesBuilder";

export const WordpressPanel = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  return (
    <>
      <ShowIf
        condition={showsComponents.views.wordpress.panels.wpSettings.show}
      >
        <WpSettings />
      </ShowIf>

      <ShowIf
        condition={showsComponents.views.wordpress.panels.wpQueriesBuilder.show}
      >
        <WpQueriesBuilder />
      </ShowIf>
    </>
  );
};
