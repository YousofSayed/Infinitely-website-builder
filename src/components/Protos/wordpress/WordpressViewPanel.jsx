import React from "react";
import { ShowIf } from "@/components/ShowIf";
import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import { useRecoilState } from "recoil";
import { WpSettings } from "@/components/Protos/wordpress/WpSettings";
import { WpQueriesBuilder } from "@/components/Protos/wordpress/WpQueriesBuilder";


export const WordpressViewPanel = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  return (
    <>
      <ShowIf condition={showsComponents.wpSettings}>
        <WpSettings />
      </ShowIf>

      <ShowIf condition={showsComponents.wpQueriesBuilder}>
        <WpQueriesBuilder />
      </ShowIf>
    </>
  );
};

