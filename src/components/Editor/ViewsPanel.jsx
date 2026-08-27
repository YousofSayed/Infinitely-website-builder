import React from "react";
import { WordpressPanel } from "../Panels/WordpressPanel";
import { useRecoilState } from "recoil";
import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import { PanelTitle } from "./PanelTitle";

const panels = {
  wordpress: WordpressPanel,
};

export const ViewsPanel = () => {
  const [showsComponents] = useRecoilState(showComponentsInLeftPanelState);

  const currentPanels =
    showsComponents.views[showsComponents.views.viewKey].panels;

  const Panel = panels[showsComponents.views.viewKey];
  if (!Panel)
    return (
      <p className="text-white capitalize">
        no data here at : {showsComponents.views.viewKey}
      </p>
    );
  return (
    <main className="w-full h-full flex flex-col  overflow-y-auto pb-2 hideScrollBar animate-to-go">
      <PanelTitle />
      <Panel />
    </main>
  );
};
