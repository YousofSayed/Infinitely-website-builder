import React from "react";
import { WordpressPanel } from "../Panels/WordpressPanel";
import { useRecoilState } from "recoil";
import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import { PanelTitle } from "./PanelTitle";
import { ThemesBuilderPanel } from "../Panels/ThemesBuilderPanel";
import { ShowIf } from "../ShowIf";

const panels = {
  wordpress: WordpressPanel,
  themesBuilder: ThemesBuilderPanel,
};

export const ViewsPanel = () => {
  const [showsComponents] = useRecoilState(showComponentsInLeftPanelState);

  const supportNav =
    showsComponents.views[showsComponents.views.viewKey].supportNav;

  const Panel = panels[showsComponents.views.viewKey];
  if (!Panel)
    return (
      <p className="text-white capitalize">
        no data here at : {showsComponents.views.viewKey}
      </p>
    );
  return (
    <main className="w-full h-full flex flex-col  overflow-y-auto pb-2 hideScrollBar animate-to-go">
      <ShowIf condition={supportNav}>
        <PanelTitle />
      </ShowIf>
      <Panel />
    </main>
  );
};
