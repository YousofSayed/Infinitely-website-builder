import { showComponentsInLeftPanelState } from "@/helpers/atoms";
import React from "react";
import { useRecoilState } from "recoil";
import { Button } from "@/components/Protos/Button";
import { Icons } from "@/components/Icons/Icons";

export const WordpressViewPanelNav = () => {
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  return (
    <nav className="flex flex-col gap-2 w-full h-full p-2">
      {Object.entries(showsComponents.wordpressViews).map(([key, value]) => (
        <Button
        className="h-fit !p-3 font-medium bg-surface-tertiary hover:bg-brand-primary transition-colors flex items-center justify-between"
          onClick={() => {
            setShowsComponents((prev) => ({
              ...prev,
              wordpressViews: {
                
                ...prev.wordpressViews,
                [key]: {
                  ...prev.wordpressViews[key],
                  show: !prev.wordpressViews[key].show,
                },
              },
            }));
          }}
        >
          <span>{value.title}</span>
          <span className="rotate-[-90deg]">
            <Icons.arrow/>
          </span>
        </Button>
      ))}
    </nav>
  );
};
