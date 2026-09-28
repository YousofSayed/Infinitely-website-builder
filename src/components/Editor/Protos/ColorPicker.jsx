import { current_project_id } from "@/constants/shared";
import { addClickClass, uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { getProjectData } from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLiveQuery } from "dexie-react-hooks";
import React, {
  memo,
  useEffect,
  useRef,
  useState,
  startTransition, // Added for lag-free React 18 updates
} from "react";
import { HexAlphaColorPicker } from "react-colorful";
import Portal from "@/components/Editor/Portal";
import { autoUpdate, useFloating } from "@floating-ui/react";

export const ColorPicker = memo(
  ({ color = "", setColor, onEffect = (_1, _2) => {} }) => {
    const [showHexColor, setShowHexColor] = useState(false);
    const [savedColors, setSavedColors] = useState([]);
    const [animate] = useAutoAnimate();
    
    // FIX 1: Only use this ref for the saved colors grid, NOT the color picker wrapper
    const savedColorsRef = useRef(null); 
    const buttonRef = useRef(null);
    
    const [localColor, setLocalColor] = useState(color);

    useEffect(() => {
      setLocalColor(color);
    }, [color]);

    // Apply auto-animate ONLY to the saved colors list so it doesn't intercept the color picker drag events
    useEffect(() => {
      if (savedColorsRef.current) {
        animate(savedColorsRef.current);
      }
    }, [animate, savedColors]);

    // FIX 2: Use startTransition to defer heavy parent updates
    const handleColorChange = (c) => {
      if (c.toLowerCase().includes("nan")) return;
      
      // 1. Instant local update for 0-lag UI (the ball moves instantly)
      setLocalColor(c);

      // 2. startTransition tells React: "This parent update is heavy, do it in the background 
      // so it doesn't block the color picker from rendering smoothly."
      startTransition(() => {
        setColor(c);
        onEffect(c, setColor);
      });
    };

    const { refs, floatingStyles } = useFloating({
      whileElementsMounted: autoUpdate,
      open: showHexColor,
      onOpenChange: setShowHexColor,
      placement: "bottom-start", 
    });

    const colorPickerContainerRef = useRef();

    useEffect(() => {
      const hideColorPicker = (e) => {
        if (
          colorPickerContainerRef.current &&
          !colorPickerContainerRef.current.contains(e.target) &&
          refs.floating.current &&
          !refs.floating.current.contains(e.target)
        ) {
          setShowHexColor(false);
        }
      };
      document.addEventListener("mousedown", hideColorPicker);
      return () => {
        document.removeEventListener("mousedown", hideColorPicker);
      };
    }, []);

    useLiveQuery(async () => {
      const savedColorsData = await (await getProjectData())?.colors;
      if (!savedColorsData) return;
      setSavedColors(savedColorsData);
    });

    const removeColor = async (colorToRemove) => {
      if (!colorToRemove) return;
      await db.projects.update(+localStorage.getItem(current_project_id), {
        colors: savedColors.filter((cl) => cl !== colorToRemove),
      });
    };

    return (
      <section
        ref={colorPickerContainerRef}
        className="relative animate-go-to"
      >
        <button
          ref={refs.setReference}
          className="w-[30px] h-[30px] shadow-md shadow-gray-950 rounded-lg border-[2.3px] border-border-default bg-surface-secondary cursor-pointer"
          onClick={(ev) => {
            ev.stopPropagation();
            setShowHexColor(!showHexColor);
          }}
          style={{ backgroundColor: color }}
        ></button>

        {showHexColor && (
          <Portal container={document.querySelector("#main-group")}>
            <section
              style={{ 
                ...floatingStyles, 
                zIndex: 998, 
                width: 'min(300px, 100vw - 20px)',
                willChange: 'transform' // FIX 3: Forces GPU acceleration, prevents full-page repaints during drag
              }}
              className={`fixed flex flex-col rounded-t-lg ${
                Boolean(savedColors.length) && "h-[400px]"
              } shadow-md shadow-slate-950 bg-surface-tertiary`}
              ref={refs.setFloating}
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="p-2 overflow-visible rounded-t-lg bg-surface-tertiary">
                <HexAlphaColorPicker
                  id="color_picker"
                  color={localColor}
                  className="relative bg-surface-tertiary z-[170] animate-go-to w-full"
                  onClick={(ev) => {
                    ev.stopPropagation();
                  }}
                  onChange={handleColorChange}
                ></HexAlphaColorPicker>
              </div>
              
              <section
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                }}
                id="colors"
                style={{
                  height: Boolean(savedColors.length) ? "250px" : "",
                }}
                className="transition-all absolute flex flex-col gap-2 top-[195px] rounded-bl-lg rounded-br-lg p-2 pt-[13px] bg-surface-tertiary shadow-md shadow-slate-950 w-full animate-go-to"
              >
                <header className="flex justify-between gap-2 bg-surface-secondary p-2 rounded-lg">
                  <FitTitle className="w-full flex justify-center items-center">
                    Save
                  </FitTitle>
                  <div
                    className="p-3 w-[120px] rounded-lg"
                    style={{ backgroundColor: localColor }}
                  ></div>
                  <SmallButton
                    className="w-[30px] h-[30px] bg-surface-tertiary"
                    tooltipTitle="Save Color"
                    onClick={async (ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      const projectId = +localStorage.getItem(current_project_id);
                      const projectData = await getProjectData();
                      !projectData?.colors && (projectData.colors = []);
                      projectData.colors.push(localColor);
                      await db.projects.update(projectId, {
                        colors: [...new Set(projectData.colors)],
                      });
                      (ev.currentTarget || ev.target.parentElement).blur();
                    }}
                  >
                    {Icons.plus("white")}
                  </SmallButton>
                </header>

                {Boolean(savedColors.length) && (
                  // Applied ref={savedColorsRef} here so auto-animate ONLY watches the grid
                  <main 
                    ref={savedColorsRef}
                    className="p-3 h-full overflow-y-auto bg-surface-secondary rounded-lg animate-go-to auto-animate"
                  >
                    <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(30px,1fr))] gap-2 h-fit animate-go-to auto-animate">
                      {savedColors.map((savedColor, i) => (
                        <button
                          key={i}
                          className="relative h-[30px] rounded-lg border-[2.2px] border-border-default hover:border-blue-500 transition-all"
                          style={{
                            backgroundColor: savedColor,
                            borderColor: savedColor == localColor ? "#3b82f6" : null,
                          }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            ev.preventDefault();
                            addClickClass(ev.currentTarget, "click");
                            handleColorChange(savedColor);
                          }}
                        >
                          <span
                            role="button"
                            className="hover:opacity-100 opacity-0 transition-all shadow-sm shadow-slate-900 absolute top-[-7px] right-[-7px] rounded-full w-[20px] h-[20px] bg-[crimson] flex items-center justify-center"
                            onClick={async (ev) => {
                              ev.stopPropagation();
                              addClickClass(ev.currentTarget, "click");
                              await removeColor(savedColor);
                            }}
                          >
                            {Icons.x({ fill: "white", width: 15, height: 15 })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </main>
                )}
              </section>
            </section>
          </Portal>
        )}
      </section>
    );
  }
);