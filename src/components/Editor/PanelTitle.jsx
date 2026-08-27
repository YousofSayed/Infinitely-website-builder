import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import React from "react";
import { useRecoilState } from "recoil";
import { Icons } from "../Icons/Icons";
import { addClickClass } from "@/helpers/cocktail";

export const PanelTitle = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  const currentPanel = Object.values(
    showsComponents.views[showsComponents.views.viewKey].panels,
  ).find((panel) => panel.show);

  return (
    <header className="sticky top-0 left-0  px-2 pt-2 bg-surface-secondary z-50 select-none">
      <section
        className="flex items-center gap-2 p-3 rounded-lg bg-surface-tertiary transition-all hover:bg-brand-primary cursor-pointer"
        onClick={(e) => {
          addClickClass(e.currentTarget, "click");
          setShowsComponents((prev) => ({
            ...prev,
            views: {
              ...prev.views,
              [prev.views.viewKey]: {
                ...prev.views[prev.views.viewKey],
                panels: {
                  ...Object.fromEntries(
                    Object.entries(prev.views[prev.views.viewKey].panels).map(
                      ([key, value]) => [key, { ...value, show: false }],
                    ),
                  ),
                },
              },
            },
          }));
        }}
      >
        <i className="block rotate-90">
          <Icons.arrow />
        </i>
        <h1 className="text-white font-medium">{currentPanel.title}</h1>
      </section>
    </header>
  );
};
