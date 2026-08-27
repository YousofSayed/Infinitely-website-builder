import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { keyframeStylesInstance } from "@/constants/InfinitelyInstances";
import { current_page_id, current_project_id } from "@/constants/shared";
import {
  animationsState,
  animationsWillRemoveState,
  animeStylesState,
  framesStylesState,
  isAnimationsChangedState,
  showAnimationsBuilderState,
  showComponentsInLeftPanelState,
  showsState,
} from "@/helpers/atoms";
import { keyframesGetterWorker } from "@/helpers/defineWorkers";
import {
  advancedSearchSuggestions,
  doInWordpress,
  getProjectData,
  getProjectId,
  isWordpress,
  rgbStringToHex,
  workerCallbackMakerWithProps,
} from "@/helpers/functions";
import { animationsType, animationType } from "@/helpers/jsDocs";
import { useInfinitelyUndoRedo } from "@/hooks/useInfinitelyUndoRedo";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Accordion } from "@/components/Protos/Accordion";
import { AccordionItem } from "@/components/Protos/AccordionItem";
import { IntersectionList } from "@/components/Protos/IntersectionList";
import { Memo } from "@/components/Protos/Memo";
import { UndoRedoContainer } from "@/components/Protos/UndoRedoContainer";
import { Adder } from "@/components/Editor/Protos/Adder";
import { Input } from "@/components/Editor/Protos/Input";
import { MiniTitle } from "@/components/Editor/Protos/MiniTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep, isNumber } from "lodash";
import { For } from "million/react";
import React, { memo, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";

// million-ignore
export const AnimationsBuilder = () => {
  const editor = useEditorMaybe();
  const [animation, setAnimation] = useState("");
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [animationsWillRemove, setAnimationsWillRemove] = useRecoilState(
    animationsWillRemoveState,
  );
  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState,
  );
  const [load, setLoad] = useState(true);
  const [currentEditing, setCurrentEditing] = useState("");
  const searchedAnimations = useRef(animationsType);
  const [indexes, setIndexes] = useState({
    animationIndex: null,
    keyframeIndex: null,
  });
  const animeStyles = useRecoilValue(animeStylesState);
  const oldAnimtaions = useRef(Array.from(animationsType));
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const [frameStyles, setFramesStyles] = useRecoilState(framesStylesState);
  const pageName = localStorage.getItem(current_page_id);
  const [globalSlug, setGlobalSlug] = useState("");
  const [path, setPath] = useState(
    isWordpress() ? "css/main.css" : `css/${pageName}.css`,
  );
  const [chooseGlobal, setChoose] = useState("");
  const [showsComponents, setShowsComponents] = useRecoilState(
    showComponentsInLeftPanelState,
  );

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    doInWordpress(() => {
      setGlobalSlug(projectData.globalCss.slug);
    });
  }, []);

  const getKeyFrames = () => {
    // console.log('frames : ' , editor.Css.getAll().models.filter(r=>r.attributes.atRuleType == 'keyframes'));
    // keyframesGetterWorker.removeEventListener(
    //   "message",
    //   sendToKeyframesGetterWorker,
    //   { once: true }
    // );

    workerCallbackMakerWithProps(
      keyframesGetterWorker,
      "getKeyFrames",
      {
        editorCss: editor.getCss({
          keepUnusedStyles: false,
          avoidProtected: true,
        }),
        projectId: getProjectId(),
      },
      (props) => {
        if (props.done) {
          setAnimations(props.res);
        } else {
          setAnimations([]);
        }
        setLoad(false);
        searchedAnimations.current = props.res;
      },
    );
  };

  useEffect(() => {
    // if (!frameStyles) return;
    // if (!animations.length) return;
    // console.log('key frame indexes : ' , indexes)
    if (!isNumber(indexes.animationIndex) && !isNumber(indexes.keyframeIndex))
      return;
    console.log("key frame indexes after: ", indexes);
    /**
     *
     * @param {CustomEvent} ev
     */
    const callback = (ev) => {
      const frameStyles = ev.detail;
      const clone = structuredClone(animations);
      const keyframe =
        clone[indexes.animationIndex || 0].keyframes[
          indexes.keyframeIndex || 0
        ];
      // keyframe.changed = true;
      console.log("key frame event : ", ev, keyframe);
      // const noDeclerations = [];
      if (keyframe.type == "keyframe") {
        keyframe.declarations = keyframe.declarations.map((dclr) => {
          if (frameStyles[dclr.property]) {
            dclr.value = frameStyles[dclr.property];
          }
          return dclr;
        });
        const properties = keyframe.declarations.map((dclr) => dclr.property);
        const notFoundedKeys = new Set([
          ...Object.keys(frameStyles),
          ...properties,
        ]);
        // const isThereProperty = keyframe.declarations.some(dclr=>Boolean(frameStyles[dclr.property]));
        notFoundedKeys.forEach((value) => {
          console.log("value : ", value);
          !properties.includes(value) &&
            keyframe.declarations.push({
              type: "declaration",
              property: value,
              value: frameStyles[value],
            });
        });

        // clone[indexes.animationIndex || 0].keyframes[
        //   indexes.keyframeIndex || 0
        // ].declarations.concat(noDeclerations);

        if (!clone[indexes.animationIndex].changed) {
          clone[indexes.animationIndex].changed = true;
          setAnimations(clone);
        }
        console.log(
          "clone  : ",
          clone,
          clone[indexes.animationIndex],
          // noDeclerations,
          frameStyles,
          Array.from(notFoundedKeys),
        );
        setAnimations(clone);

        // setIsChangedAnimations(
        //   clone[indexes.animationIndex],
        //   indexes.animationIndex
        // );
      }
    };

    keyframeStylesInstance.on(InfinitelyEvents.keyframe.set, callback);
    return () => {
      keyframeStylesInstance.off(InfinitelyEvents.keyframe.set, callback);
    };
  }, [animations, indexes]);

  useEffect(() => {
    if (!(showsComponents.animationsBuilder && editor)) return;
    console.log(
      "editor animation builder: ",
      editor,
      !showsComponents.animationsBuilder && !editor,
    );

    const cleaner = getKeyFrames();
    return () => {
      setFramesStyles({});
      // cleaner();
    };
  }, [showsComponents.animationsBuilder, editor]);

  const addAnimation = (animationName) => {
    if (!animationName) {
      toast.warn(
        <ToastMsgInfo msg="Please give a name for the animation 😀" />,
      );
      return;
    }

    if (!chooseGlobal) {
      toast.warn(
        <ToastMsgInfo msg="Please choose a distination for the animation 😀" />,
      );
      return;
    }

    oldAnimtaions.current = cloneDeep(animations);

    setAnimations([
      {
        type: "keyframes",
        name: animationName,
        path,
        keyframes: [
          {
            type: "keyframe",
            values: [`0%`],
            declarations: [],
          },
        ],
      },
      ...animations,
    ]);
  };

  const setIsChangedAnimations = (animation = animationType, index) => {
    !isAnimationsChanged && setAnimationsChanged(true);
    if (!animation.changed) {
      const clone = structuredClone(animations);
      clone[index].changed = true;
      setAnimations(clone);
    }
  };

  const addKeyframe = (animationIndex) => {
    const clone = structuredClone(animations);
    clone[animationIndex].keyframes.push({
      type: "keyframe",
      values: [],
      declarations: [],
    });
    setAnimations(clone);
  };

  const removeKeyframe = (animationIndex, keyframeIndex) => {
    // if(!animationIndex)return;
    const clone = structuredClone(animations);
    clone[animationIndex].keyframes.splice(keyframeIndex, 1);

    setAnimations(clone);
  };

  const removeAnimation = (animationIndex) => {
    // if(!animationIndex)return;
    const clone = structuredClone(animations);
    clone.splice(animationIndex, 1);
    setAnimations(clone);
    //  keyframesGetterWorker.postMessage({
    //  command:'removeAnimation',
    //  props:{
    //    keyframe:animations[animationIndex],
    //    path: animations[animationIndex].path
    //  }
    // });
    setAnimationsWillRemove([
      ...animationsWillRemove,
      structuredClone(animations[animationIndex]),
    ]);
    setAnimationsChanged(true);
  };

  const setValues = (animationIndex, keyframeIndex, values) => {
    const clone = structuredClone(animations);
    clone[animationIndex].keyframes[keyframeIndex].values = values
      .split(",")
      .filter(Boolean);
    setAnimations(clone);
  };

  /**
   *
   * @param {InputEvent} ev
   */
  const search = (ev) => {
    if (!ev.target.value) {
      setAnimations(searchedAnimations.current);
      searchedAnimations.current = [];
      return;
    }
    const searchAnims = advancedSearchSuggestions(
      animations,
      ev.target.value,
      undefined,
      "name",
    );
    setAnimations(searchAnims);
  };

  // useEffect(() => {
  //   return () => {
  //     setShows((old) => ({ ...old, animationBuilder: false }));
  //   };
  // }, []);

  return (
    <main className="h-full animate-go-to">
      {load && <Loader />}
      {!load && (
        <UndoRedoContainer
          defaultValue={animationsType}
          className="h-full animate-go-to"
          showProp="animationBuilder"
          state={[animations, setAnimations]}
        >
          <section className="flex flex-col gap-2  h-full  animate-go-to">
            <MiniTitle>Animations Builder</MiniTitle>
            <section className="flex flex-col gap-2 rounded-lg ">
              <Input
                type="search"
                placeholder="Search..."
                className="bg-surface-tertiary"
                onInput={search}
              />
              <Select
                placeholder="Select Global or Local"
                keywords={["global", "local"]}
                preventInput
                value={chooseGlobal}
                onAll={(value) => {
                  const newPath =
                    value.trim().toLowerCase() == "global"
                      ? isWordpress()
                        ? globalSlug
                        : `global/global.css`
                      : path;
                  setPath(newPath);
                  setChoose(value);
                }}
              />
              <section className="flex gap-2">
                <Input
                  className="bg-surface-tertiary w-full"
                  autoFocus={false}
                  value={animation}
                  placeholder="Enter Name"
                  onInput={(ev) => {
                    setAnimation(ev.target.value);
                  }}
                />

                <SmallButton
                  tooltipTitle="Add Animation"
                  onClick={(ev) => {
                    addAnimation(animation);
                  }}
                >
                  {Icons.plus("white")}
                </SmallButton>
              </section>
            </section>
            <Accordion>
              {/* <section className="w-full h-full flex flex-col gap-2 "> */}

              {!!animations.length && (
                <For
                  // memo
                  // each={(i)=>}
                  className=" flex flex-col gap-2"
                  each={animations}
                >
                  {(animation, i) => (
                    // <InfAccordion>
                    <AccordionItem
                      title={animation.name}
                      key={i}
                      // labelClass="p-[3px!important]"
                      // className=""
                    >
                      <Memo>
                        <Adder
                          className={`p-2 bg-surface-main`}
                          addClassName="bg-surface-secondary"
                          delClassName="bg-surface-secondary"
                          onAddClick={(ev) => {
                            addKeyframe(i);
                          }}
                          onDeleteClick={(ev) => {
                            removeAnimation(i);
                          }}
                        >
                          <main className="w-full flex flex-col gap-2">
                            <p className="text-white w-full font-semibold bg-brand-primary py-2 text-center rounded-lg">
                              {animation.name}
                            </p>

                            {animation.keyframes
                              .filter((kf) => kf.type == "keyframe")
                              .map((keyframe, x) => {
                                // const uId = uniqueId()
                                const id = `keyframe-${
                                  animation.name
                                }-${i}-${x}-${
                                  animation.path.startsWith(
                                    `css/${pageName}.css`,
                                  )
                                    ? "editor"
                                    : "libs"
                                }`;
                                return (
                                  // <section key={x} className="flex flex-col bg-surface-secondary px-1 py-2 gap-[100px] ">

                                  <section
                                    key={x}
                                    keyframe-id={id}
                                    className={`flex  flex-col  gap-2 bg-gray-950 p-2 border-[2.5px]  w-full rounded-lg ${
                                      // currentEditingIndexStyles == x &&
                                      indexes.animationIndex == i &&
                                      indexes.keyframeIndex == x
                                        ? "border-blue-600"
                                        : "border-border-default"
                                    } `}
                                  >
                                    <section className="flex gap-2 ">
                                      <section className="w-full flex items-center  bg-surface-tertiary px-1 rounded-lg">
                                        {" "}
                                        <Input
                                          className="bg-surface-tertiary w-full"
                                          value={
                                            keyframe?.values?.join?.(",") || ""
                                          }
                                          onInput={(ev) => {
                                            console.log(
                                              "keyframe.values",
                                              keyframe.values,
                                            );

                                            if (!ev.target.value) return;
                                            setValues(i, x, ev.target.value);

                                            setIsChangedAnimations(
                                              animation,
                                              i,
                                            );
                                            // !isAnimationsChanged && setAnimationsChanged(true);
                                            // updatePercentageValue({
                                            //   index: i,
                                            //   propsIndex: x,
                                            //   newValue: ev.target.value,
                                            // });
                                          }}
                                        />
                                        {/* <p className="font-semibold select-none text-text-primary px-2">
                            %
                          </p> */}
                                      </section>

                                      <SmallButton
                                        title="delete frame"
                                        className="shrink-0 bg-surface-tertiary"
                                        onClick={() => {
                                          removeKeyframe(i, x);
                                        }}
                                      >
                                        {Icons.trash("white")}
                                      </SmallButton>

                                      <SmallButton
                                        title="select frame"
                                        className="shrink-0 bg-surface-tertiary"
                                        onClick={(ev) => {
                                          // setCurrentEditingIndex(i);
                                          // setCurrentEditing(id);
                                          setIndexes({
                                            keyframeIndex: x,
                                            animationIndex: i,
                                          });

                                          console.log(
                                            "indexing",
                                            Object.fromEntries(
                                              keyframe?.declarations
                                                .filter(
                                                  (dclr) =>
                                                    dclr.type == "declaration",
                                                )
                                                .map((dclr) => [
                                                  dclr.property,
                                                  dclr.value,
                                                ]),
                                            ),
                                          );

                                          setFramesStyles(
                                            Object.fromEntries(
                                              keyframe?.declarations
                                                .filter(
                                                  (dclr) =>
                                                    dclr.type == "declaration",
                                                )
                                                .map((dclr) => [
                                                  dclr.property,
                                                  dclr.value,
                                                ]),
                                            ),
                                          );
                                        }}
                                      >
                                        {Icons.select("white")}
                                      </SmallButton>
                                    </section>

                                    {keyframe.declarations.length ? (
                                      <ul className="flex flex-col gap-2  bg-surface-secondary p-2 rounded-lg">
                                        {keyframe.declarations
                                          .filter(
                                            (dclr) =>
                                              dclr.type == "declaration",
                                          )
                                          .map(({ property, value }, z) => {
                                            return (
                                              <li
                                                key={z}
                                                className="w-full flex justify-between items-center gap-2 text-center "
                                              >
                                                <article className="w-full flex justify-between  gap-2 text-center">
                                                  <p className="w-[45%] whitespace-break-spaces break-inside-avoid-column text-text-primary text-sm  flex items-center justify-center bg-brand-primary p-2 font-semibold rounded-lg shrink-0 flex-grow">
                                                    {property}
                                                  </p>
                                                  <p className="text-white font-bold self-center">
                                                    :
                                                  </p>
                                                  <p className="w-[45%] whitespace-break-spaces break-all flex items-center justify-center  text-text-primary text-sm bg-brand-primary p-2 font-semibold rounded-lg flex-grow">
                                                    {property.includes("color")
                                                      ? rgbStringToHex(value)
                                                      : value}{" "}
                                                  </p>
                                                </article>
                                              </li>
                                            );
                                          })}
                                      </ul>
                                    ) : (
                                      <p className="bg-yellow-500 text-sm text-white font-bold w-full p-1 rounded-xl text-center">
                                        Append Styles from style Manager
                                      </p>
                                    )}
                                  </section>
                                  // </section>
                                );
                              })}
                          </main>
                        </Adder>
                      </Memo>
                    </AccordionItem>
                    // </InfAccordion>
                  )}
                </For>
              )}
              {/* </section> */}
            </Accordion>
          </section>
        </UndoRedoContainer>
      )}
    </main>
  );
};

{
  /* {animations.length
            ? animations.map((animation, i) => (
                <AccordionItem title={animation.name}>
                  <Adder
                    key={i}
                    className={`p-[unset] bg-surface-tertiary`}
                    addClassName="bg-surface-secondary"
                    delClassName="bg-surface-secondary"
                    onAddClick={(ev) => {
                      addPercentage(i);
                    }}
                    onDeleteClick={(ev) => {
                      deleteAnimation(i);
                    }}
                  >
                    <main className="w-full flex flex-col gap-3">
                      <p className="text-white w-full font-semibold bg-brand-primary py-2 text-center rounded-lg">
                        {animation.name}
                      </p>

                      {animation.values.map(({ percentage, styles }, x) => {
                        return (
                          // <section key={x} className="flex flex-col bg-surface-secondary px-1 py-2 gap-[100px] ">

                          <section
                            key={x}
                            className={`flex  flex-col  gap-2 bg-gray-950 p-2 border-[2.5px]  w-full rounded-lg ${
                              currentEditingIndexStyles == x &&
                              currentEditingIndex == i
                                ? "border-2 border-blue-600 p-1 shadow-md shadow-gray-950"
                                : "border-gray-600"
                            } `}
                          >
                            <section className="flex gap-2 ">
                              <section className="w-full flex items-center  bg-surface-tertiary px-1 rounded-lg">
                                {" "}
                                <Input
                                  className="bg-surface-tertiary w-full"
                                  value={`${percentage}`}
                                  onInput={(ev) => {
                                    console.log("perc", percentage);

                                    if (!ev.target.value) return;
                                    updatePercentageValue({
                                      index: i,
                                      propsIndex: x,
                                      newValue: ev.target.value,
                                    });
                                  }}
                                />
                                <p className="font-semibold select-none text-text-primary px-2">
                                  %
                                </p>
                              </section>

                              <SmallButton
                                title="delete frame"
                                className="shrink-0 bg-surface-tertiary"
                                onClick={() => {
                                  deleteFrame(i, x);
                                }}
                              >
                                {Icons.trash("white")}
                              </SmallButton>

                              <SmallButton
                                title="select frame"
                                className="shrink-0 bg-surface-tertiary"
                                onClick={(ev) => {
                                  setCurrentEditingIndex(i);

                                  setCurrentEditingIndexStyles(
                                    currentEditingIndexStyles == x &&
                                      currentEditingIndex == i
                                      ? undefined
                                      : x
                                  );
                                  setFramesStyles({ ...styles });
                                }}
                              >
                                {Icons.select("white")}
                              </SmallButton>
                            </section>

                            {Object.keys(styles).length ? (
                              <ul className="flex flex-col gap-2  bg-surface-secondary p-2 rounded-lg">
                                {Object.keys(styles).map((key, z) => {
                                  return (
                                    <li
                                      key={z}
                                      className="w-full flex justify-between items-center gap-2 text-center "
                                    >
                                      <article className="w-full flex justify-between  gap-2 text-center">
                                        <p className="w-[45%] whitespace-break-spaces break-inside-avoid-column text-text-primary text-sm  flex items-center justify-center bg-brand-primary p-2 font-semibold rounded-lg shrink-0 flex-grow">
                                          {key}
                                        </p>
                                        <p className="text-white font-bold self-center">
                                          :
                                        </p>
                                        <p className="w-[45%] whitespace-break-spaces break-all flex items-center justify-center  text-text-primary text-sm bg-brand-primary p-2 font-semibold rounded-lg flex-grow">
                                          {key.includes("color")
                                            ? rgbStringToHex(styles[key])
                                            : styles[key]}{" "}
                                        </p>
                                      </article>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="bg-yellow-500 text-sm text-white font-bold w-full p-1 rounded-xl text-center">
                                Append Styles from style Manager
                              </p>
                            )}
                          </section>
                          // </section>
                        );
                      })}
                    </main>
                  </Adder>
                </AccordionItem>
              ))
            : null} */
}
