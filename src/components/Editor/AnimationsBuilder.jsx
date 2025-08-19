import React, { memo, useEffect, useRef, useState } from "react";
import { Aside } from "./Protos/Aside";
import { MiniTitle } from "./Protos/MiniTitle";
import { Adder } from "./Protos/Adder";
import { Input } from "./Protos/Input";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import {
  animationsType,
  animationType,
  keyframesType,
  keyframesWithPathesType,
} from "../../helpers/jsDocs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  animationsState,
  animeStylesState,
  framesStylesState,
  isAnimationsChangedState,
  showAnimationsBuilderState,
} from "../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import {
  getProjectData,
  rgbStringToHex,
  stringifyKeyframes,
} from "../../helpers/functions";
import { cloneObject } from "../../helpers/cocktail";
import { InfAccordion } from "../Protos/InfAccordion";
import { AccordionItem as HeroAccoridonItem } from "@heroui/accordion";
import { opfs } from "../../helpers/initOpfs";
import { defineRoot, inlineWorker } from "../../helpers/bridge";
import { cloneDeep, random, uniqueId } from "lodash";
import { Virtuoso } from "react-virtuoso";
import { VirtosuoVerticelWrapper } from "../Protos/VirtosuoVerticelWrapper";
import { DetailsNormal } from "../Protos/DetailsNormal";
import { keyframesGetterWorker } from "../../helpers/defineWorkers";
import { comma } from "postcss/lib/list";
import { current_page_id, current_project_id } from "../../constants/shared";
import { Accordion } from "../Protos/Accordion";
import { AccordionItem } from "../Protos/AccordionItem";
import { LazyList } from "../Protos/LazyList";
import { IntersectionList } from "../Protos/IntersectionList";
import { Memo } from "../Protos/Memo";
import { keyframeStylesInstance } from "../../constants/InfinitelyInstances";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";

// const KeyframesList = ({
//   type,
//   animations = keyframesType,
//   setAnimations = () => {},
// }) => {
//   return (
//     <Virtuoso
//       totalCount={Object.keys(animations.editorKeyframes).length}
//       className="hideScrollBar px-[unset!important] gap-2"
//       style={{ padding: "unset!important" }}
//       itemContent={(i) => {
//         const animation = Object.values(animations.editorKeyframes)[i];
//         return (
//           <DetailsNormal
//             label={animation.name}
//             labelClass="p-[3px!important]"
//             className=""
//           >
//             <Adder
//               key={i}
//               className={`p-2 bg-slate-950`}
//               addClassName="bg-slate-900"
//               delClassName="bg-slate-900"
//               onAddClick={(ev) => {
//                 addPercentage(i);
//               }}
//               onDeleteClick={(ev) => {
//                 deleteAnimation(i);
//               }}
//             >
//               <main className="w-full flex flex-col gap-3">
//                 <p className="text-white w-full font-semibold bg-blue-600 py-2 text-center rounded-lg">
//                   {animation.name}
//                 </p>

//                 {animation.keyframes
//                   .filter((kf) => kf.type == "keyframe")
//                   .map((keyframe, x) => {
//                     // const uId = uniqueId()
//                     const id = `keyframe-${animation.name}-${i}-${x}-${type}`;
//                     return (
//                       // <section key={x} className="flex flex-col bg-slate-900 px-1 py-2 gap-[100px] ">

//                       <section
//                         key={x}
//                         keyframe-id={id}
//                         className={`flex  flex-col  gap-2 bg-gray-950 p-2 border-[2.5px]  w-full rounded-lg ${
//                           // currentEditingIndexStyles == x &&
//                           currentEditing == id
//                         } `}
//                       >
//                         <section className="flex gap-2 ">
//                           <section className="w-full flex items-center  bg-slate-800 px-1 rounded-lg">
//                             {" "}
//                             <Input
//                               className="bg-slate-800 w-full"
//                               value={keyframe?.values?.join?.(",") || ""}
//                               onInput={(ev) => {
//                                 console.log("keyframe.values", keyframe.values);

//                                 if (!ev.target.value) return;
//                                 updatePercentageValue({
//                                   index: i,
//                                   propsIndex: x,
//                                   newValue: ev.target.value,
//                                 });
//                               }}
//                             />
//                             {/* <p className="font-semibold select-none text-slate-200 px-2">
//                                   %
//                                 </p> */}
//                           </section>

//                           <SmallButton
//                             title="delete frame"
//                             className="flex-shrink-0 bg-slate-800"
//                             onClick={() => {
//                               deleteFrame(i, x);
//                             }}
//                           >
//                             {Icons.trash("white")}
//                           </SmallButton>

//                           <SmallButton
//                             title="select frame"
//                             className="flex-shrink-0 bg-slate-800"
//                             onClick={(ev) => {
//                               // setCurrentEditingIndex(i);
//                               setCurrentEditingIndex(
//                                 `keyframe-${animation.name}-${i}-${x}-editor`
//                               );

//                               // setCurrentEditingIndexStyles(
//                               //   currentEditingIndexStyles == x &&
//                               //     currentEditingIndex == i
//                               //     ? undefined
//                               //     : x
//                               // );

//                               setFramesStyles(
//                                 Object.fromEntries(
//                                   keyframe?.declarations
//                                     .filter(
//                                       (dclr) => dclr.type == "declaration"
//                                     )
//                                     .map((dclr) => [dclr.property, dclr.value])
//                                 )
//                               );
//                             }}
//                           >
//                             {Icons.select("white")}
//                           </SmallButton>
//                         </section>

//                         {keyframe.declarations.length ? (
//                           <ul className="flex flex-col gap-2  bg-slate-900 p-2 rounded-lg">
//                             {keyframe.declarations
//                               .filter((dclr) => dclr.type == "declaration")
//                               .map(({ property, value }, z) => {
//                                 return (
//                                   <li
//                                     key={z}
//                                     className="w-full flex justify-between items-center gap-2 text-center "
//                                   >
//                                     <article className="w-full flex justify-between  gap-2 text-center">
//                                       <p className="w-[45%] whitespace-break-spaces break-inside-avoid-column text-slate-200 text-sm  flex items-center justify-center bg-blue-600 p-2 font-semibold rounded-lg flex-shrink-0 flex-grow">
//                                         {property}
//                                       </p>
//                                       <p className="text-white font-bold self-center">
//                                         :
//                                       </p>
//                                       <p className="w-[45%] whitespace-break-spaces break-all flex items-center justify-center  text-slate-200 text-sm bg-blue-600 p-2 font-semibold rounded-lg flex-grow">
//                                         {property.includes("color")
//                                           ? rgbStringToHex(value)
//                                           : value}{" "}
//                                       </p>
//                                     </article>
//                                   </li>
//                                 );
//                               })}
//                           </ul>
//                         ) : (
//                           <p className="bg-yellow-500 text-sm text-white font-bold w-full p-1 rounded-xl text-center">
//                             Append Styles from style Manager
//                           </p>
//                         )}
//                       </section>
//                       // </section>
//                     );
//                   })}
//               </main>
//             </Adder>
//           </DetailsNormal>
//         );
//       }}
//       components={{
//         Item: (props) => <div className="mb-2" {...props}></div>,
//       }}
//     />
//   );
// };

export const AnimationsBuilder = memo(() => {
  const editor = useEditorMaybe();
  const [animation, setAnimation] = useState("");
  const [animations, setAnimations] = useRecoilState(animationsState);
  const [isAnimationsChanged, setAnimationsChanged] = useRecoilState(
    isAnimationsChangedState
  );
  const [load, setLoad] = useState(true);
  const [currentEditing, setCurrentEditing] = useState("");
  // const [currentEditingIndex, setCurrentEditingIndex] = useState(0);
  // const [currentEditingIndexStyles, setCurrentEditingIndexStyles] = useState(0);
  const [indexes, setIndexes] = useState({
    animationIndex: null,
    keyframeIndex: null,
  });
  const animeStyles = useRecoilValue(animeStylesState);
  const oldAnimtaions = useRef(Array.from(animationsType));
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const [frameStyles, setFramesStyles] = useRecoilState(framesStylesState);
  const pageName = localStorage.getItem(current_page_id);

  // const getKeyFrames = async () => {
  //   // console.log('frames : ' , editor.Css.getAll().models.filter(r=>r.attributes.atRuleType == 'keyframes'));

  //   let projectData = await getProjectData();

  //   let cssLibs = (
  //     await Promise.all(
  //       projectData.cssLibs.map(
  //         async (lib) => await (await opfs.getFile(defineRoot(lib.path))).text()
  //       )
  //     )
  //   ).join("\n");

  //   const animationsReady = editor.Parser.parseCss(
  //     `${editor.getCss()} \n ${cssLibs || ""}`
  //   ).filter((rule) => rule.atRuleType == "keyframes");
  //   projectData = null;
  //   cssLibs = null;

  //   /**
  //    * @type {import('../../helpers/types')}
  //    */
  //   const animes = {};
  //   animationsReady.forEach((anime) => {
  //     animes[anime.mediaText] = {
  //       name: anime.mediaText,
  //       values: animes[anime.mediaText]?.values
  //         ? [
  //             ...animes[anime.mediaText].values,
  //             {
  //               percentage: +anime.selectorsAdd.replace("%", ""),
  //               styles: anime.style,
  //             },
  //           ]
  //         : [
  //             {
  //               percentage: +anime.selectorsAdd.replace("%", ""),
  //               styles: anime.style,
  //             },
  //           ],
  //     };
  //   });
  //   // console.log(animes, animationsReady, Object.values(animes));
  //   setAnimations([...Object.values(animes)]);
  // };
  const sendToKeyframesGetterWorker = ({ data }) => {
    const { command, props } = data;
    if (data.command == "getKeyFrames") {
      setLoad(false);
      // console.log(
      //   "props : ",
      //   Object.entries(props).flatMap(([path, animes]) =>
      //     animes.map((anim) => ({ ...anim, path }))
      //   )
      // );

      console.log(props);

      setAnimations(props);
    }
  };

  const getKeyFrames = () => {
    // console.log('frames : ' , editor.Css.getAll().models.filter(r=>r.attributes.atRuleType == 'keyframes'));
    // keyframesGetterWorker.removeEventListener(
    //   "message",
    //   sendToKeyframesGetterWorker,
    //   { once: true }
    // );

    keyframesGetterWorker.postMessage({
      command: "getKeyFrames",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        pageName,
        editorCss: editor.getCss({
          keepUnusedStyles: false,
          avoidProtected: true,
        }),
      },
    });

    keyframesGetterWorker.addEventListener(
      "message",
      sendToKeyframesGetterWorker,
      { once: true }
    );

    return () => {
      keyframesGetterWorker.removeEventListener(
        "message",
        sendToKeyframesGetterWorker
        // { once: true }
      );
    };

    // console.log(animes, animationsReady, Object.values(animes));
  };

  // const addAnimation = (animationName) => {
  //   if (!animation) return;
  //   oldAnimtaions.current = structuredClone(animations);
  //   // setAnimations([
  //   //   ...animations,
  //   //   {
  //   //     name: animationName,
  //   //     declarations: [
  //   //       {
  //   //         percentage: 0,
  //   //         styles: {},
  //   //       },
  //   //     ],
  //   //   },
  //   // ]);

  //    setAnimations([
  //     ...animations,
  //     {
  //       type:'keyframes',
  //       name: animationName,
  //       keyframes:[
  //         {type:'keyframe' , values:[`0%`] , declarations:[{type:'declaration' , }]}
  //       ]
  //     },
  //   ]);
  // };
  const addAnimation = (animationName) => {
    if (!animation) return;
    oldAnimtaions.current = cloneDeep(animations);

    setAnimations([
      ...animations,
      {
        type: "keyframes",
        name: animationName,
        keyframes: [
          {
            type: "keyframe",
            values: [`0%`],
            declarations: [{ type: "declaration" }],
          },
        ],
      },
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
  };

  const setValues = (animationIndex, keyframeIndex, values) => {
    const clone = structuredClone(animations);
    clone[animationIndex].keyframes[keyframeIndex].values = values
      .split(",")
      .filter(Boolean);
    setAnimations(clone);
  };

  // // const removeAnimationRule = (animations = animationsType) => {
  // //   // animations.forEach(({ name, values }) => {
  // //   //   values.forEach(({ percentage, styles }) => {
  // //   //     const oldRule = editor.Css.getRule(`${percentage}%`, {
  // //   //       atRuleType: "keyframes",
  // //   //       atRuleParams: name,
  // //   //     });

  // //   //     editor.Css.remove(oldRule);
  // //   //   });
  // //   // });

  // //     for (const animation of animations) {
  // //         for (const keyframe of animation.keyframes) {

  // //         }
  // //     }

  // // };
  // const removeAnimationRule = (animations = animationsType) => {
  //   // animations.forEach(({ name, values }) => {
  //   //   values.forEach(({ percentage, styles }) => {
  //   //     const oldRule = editor.Css.getRule(`${percentage}%`, {
  //   //       atRuleType: "keyframes",
  //   //       atRuleParams: name,
  //   //     });

  //   //     editor.Css.remove(oldRule);
  //   //   });
  //   // });

  //   for (const animation of animations) {
  //     for (const keyframe of animation.keyframes) {
  //     }
  //   }
  // };

  // const removeFrameRule = (animations = animationsType, percentageParam) => {
  //   for (const { name, values } of animations) {
  //     for (const { percentage, styles } of values) {
  //       if (percentage != percentageParam) return;
  //       const oldRule = editor.Css.getRule(`${percentage}%`, {
  //         atRuleType: "keyframes",
  //         atRuleParams: name,
  //       });

  //       editor.Css.remove(oldRule);
  //     }
  //   }
  //   // animations.forEach(({ name, values }) => {
  //   //   values.forEach(({ percentage, styles }) => {

  //   //   });
  //   // });
  // };

  // const deleteAnimation = (index) => {
  //   const newArr = cloneDeep(animations).splice(index, 1); // Array.from(animations).filter((anim, i) => i != index);
  //   oldAnimtaions.current = cloneDeep(animations);
  //   // oldAnimtaions.current.forEach(({ name, values }) => {
  //   //   values.forEach(({ percentage, styles }) => {
  //   //     const oldRule = editor.Css.getRule(`${percentage}%`, {
  //   //       atRuleType: "keyframes",
  //   //       atRuleParams: name,
  //   //     });

  //   //     editor.Css.remove(oldRule);
  //   //   });
  //   // });
  //   // editor.Css.getAll().models.filter(r=>r.get)
  //   removeAnimationRule(animations);
  //   console.log(editor.getCss());

  //   setAnimations(newArr);
  // };

  // const deleteFrame = (i, x) => {
  //   const clone = structuredClone(animations);
  //   const percentage = clone[i].values[x].percentage;
  //   clone[i].values = clone[i].values.filter((val, z) => z != x);
  //   console.log("clone : ", clone);
  //   console.log("original : ", animations);

  //   if (currentEditingIndexStyles == x)
  //     setCurrentEditingIndexStyles(currentEditingIndexStyles - 1);
  //   removeFrameRule(animations, percentage);
  //   setAnimations(clone);
  // };

  // const addPercentage = (index, propsIndex) => {
  //   const newArr = structuredClone(animations);
  //   oldAnimtaions.current = structuredClone(animations);
  //   newArr[index].values = [
  //     ...newArr[index].values,
  //     { percentage: 0, styles: {} },
  //   ];
  //   setAnimations(newArr);
  // };

  // const updatePercentageValue = ({ index, propsIndex, newValue }) => {
  //   const newArr = structuredClone(animations);
  //   oldAnimtaions.current = structuredClone(animations);
  //   newArr[index].values[propsIndex].percentage = newValue;
  //   setAnimations(newArr);
  //   addAnimationRule(newArr);
  // };

  // const addAnimationRule = (animationsArr = animationsType) => {
  //   animationsArr.forEach((animation, i) => {
  //     if (!oldAnimtaions.current[i]) return;
  //     animation.values.forEach(({ percentage, styles }, x) => {
  //       const oldRule = editor.Css.getRule(
  //         `${oldAnimtaions.current[i].values[x].percentage}%`,
  //         {
  //           atRuleType: "keyframes",
  //           atRuleParams: animation.name,
  //         }
  //       );

  //       editor.Css.remove(oldRule);
  //     });

  //     editor.addStyle(stringifyKeyframes(animation));
  //     // console.log(editor.getCss(), "after added styles");
  //   });
  // };

  // useEffect(() => {
  //   // if (
  //   //   // currentEditingIndex == undefined ||
  //   //   // currentEditingIndexStyles == undefined ||
  //   //   !animations.length
  //   // )
  //   //   return;
  //   // if (!currentEditing) return;
  //   // console.log(animeStyles);
  //   // const newArr = structuredClone(animations);
  //   // // const newObj = (newArr[currentEditingIndex] = cloneObject(
  //   // //   newArr[currentEditingIndex]
  //   // // ));
  //   // console.log(newArr);
  //   // const styles =
  //   //   newArr[currentEditingIndex].values[currentEditingIndexStyles];
  //   // styles.styles = {
  //   //   ...styles.styles,
  //   //   ...animeStyles,
  //   // };
  //   // Object.keys(styles.styles).forEach((key) => {
  //   //   if (!styles.styles[key]) delete styles.styles[key];
  //   // });
  //   // oldAnimtaions.current = structuredClone(animations);
  //   // addAnimationRule(newArr);
  //   // setAnimations(newArr);
  // }, [animeStyles]);

  useEffect(() => {
    // if (!frameStyles) return;
    // if (!animations.length) return;
    if (!indexes.animationIndex && !indexes.keyframeIndex) return;
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
      if (keyframe.type == "keyframe") {
        clone[indexes.animationIndex || 0].keyframes[
          indexes.keyframeIndex || 0
        ].declarations = keyframe.declarations.map((dclr) => {
          if (frameStyles[dclr.property]) {
            dclr.value = frameStyles[dclr.property];
          }

          return dclr;
        });

        setAnimations(clone);
        setIsChangedAnimations(
          clone[indexes.animationIndex],
          indexes.animationIndex
        );
      }
    };

    keyframeStylesInstance.on(InfinitelyEvents.keyframe.set, callback);
    return () => {
      keyframeStylesInstance.off(InfinitelyEvents.keyframe.set, callback);
    };
  }, [indexes]);

  useEffect(() => {
    if (!(showAnimeBuilder && editor)) return;
    console.log("editor : ", editor, !showAnimeBuilder && !editor);

    const cleaner = getKeyFrames();
    return () => {
      cleaner();
    };
  }, [showAnimeBuilder, editor]);

  return (
    <Memo>
      <section className="flex flex-col gap-2  h-full will-change-[contents,height] ">
        <MiniTitle>Animations Builder</MiniTitle>
        <section className="flex flex-col gap-2 rounded-lg will-change-[contents,height]">
          <section className="flex gap-2">
            <Input
              className="bg-slate-800 w-full"
              value={animation}
              placeholder="Name"
              onInput={(ev) => {
                setAnimation(ev.target.value);
              }}
            />

            <SmallButton
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
            <IntersectionList
              className="will-change-[contents,height,scroll] flex flex-col gap-2"
              renderItem={(animation, i) => (
                // <InfAccordion>
                <AccordionItem
                  title={animation.name}
                  key={i}
                  // labelClass="p-[3px!important]"
                  // className=""
                >
                  <Memo>
                    <Adder
                      className={`p-2 bg-slate-950`}
                      addClassName="bg-slate-900"
                      delClassName="bg-slate-900"
                      onAddClick={(ev) => {
                        addKeyframe(i);
                      }}
                      onDeleteClick={(ev) => {
                        removeAnimation(i);
                      }}
                    >
                      <main className="w-full flex flex-col gap-2">
                        <p className="text-white w-full font-semibold bg-blue-600 py-2 text-center rounded-lg">
                          {animation.name}
                        </p>

                        {animation.keyframes
                          .filter((kf) => kf.type == "keyframe")
                          .map((keyframe, x) => {
                            // const uId = uniqueId()
                            const id = `keyframe-${animation.name}-${i}-${x}-${
                              animation.path.startsWith(`css/${pageName}.css`)
                                ? "editor"
                                : "libs"
                            }`;
                            return (
                              // <section key={x} className="flex flex-col bg-slate-900 px-1 py-2 gap-[100px] ">

                              <section
                                key={x}
                                keyframe-id={id}
                                className={`flex  flex-col  gap-2 bg-gray-950 p-2 border-[2.5px]  w-full rounded-lg ${
                                  // currentEditingIndexStyles == x &&
                                  currentEditing == id
                                    ? "border-blue-600"
                                    : "border-slate-600"
                                } `}
                              >
                                <section className="flex gap-2 ">
                                  <section className="w-full flex items-center  bg-slate-800 px-1 rounded-lg">
                                    {" "}
                                    <Input
                                      className="bg-slate-800 w-full"
                                      value={
                                        keyframe?.values?.join?.(",") || ""
                                      }
                                      onInput={(ev) => {
                                        console.log(
                                          "keyframe.values",
                                          keyframe.values
                                        );

                                        if (!ev.target.value) return;
                                        setValues(i, x, ev.target.value);

                                        setIsChangedAnimations(animation, i);
                                        // !isAnimationsChanged && setAnimationsChanged(true);
                                        // updatePercentageValue({
                                        //   index: i,
                                        //   propsIndex: x,
                                        //   newValue: ev.target.value,
                                        // });
                                      }}
                                    />
                                    {/* <p className="font-semibold select-none text-slate-200 px-2">
                            %
                          </p> */}
                                  </section>

                                  <SmallButton
                                    title="delete frame"
                                    className="flex-shrink-0 bg-slate-800"
                                    onClick={() => {
                                      removeKeyframe(i, x);
                                    }}
                                  >
                                    {Icons.trash("white")}
                                  </SmallButton>

                                  <SmallButton
                                    title="select frame"
                                    className="flex-shrink-0 bg-slate-800"
                                    onClick={(ev) => {
                                      // setCurrentEditingIndex(i);
                                      setCurrentEditing(id);
                                      setIndexes({
                                        keyframeIndex: x,
                                        animationIndex: i,
                                      });
                                      // setCurrentEditingIndexStyles(
                                      //   currentEditingIndexStyles == x &&
                                      //     currentEditingIndex == i
                                      //     ? undefined
                                      //     : x
                                      // );

                                      // console.log(
                                      //   Object.fromEntries(
                                      //     keyframe?.declarations
                                      //       .filter(
                                      //         (dclr) =>
                                      //           dclr.type == "declaration"
                                      //       )
                                      //       .map((dclr) => [
                                      //         dclr.property,
                                      //         dclr.value,
                                      //       ])
                                      //   )
                                      // );

                                      setFramesStyles(
                                        Object.fromEntries(
                                          keyframe?.declarations
                                            .filter(
                                              (dclr) =>
                                                dclr.type == "declaration"
                                            )
                                            .map((dclr) => [
                                              dclr.property,
                                              dclr.value,
                                            ])
                                        )
                                      );
                                    }}
                                  >
                                    {Icons.select("white")}
                                  </SmallButton>
                                </section>

                                {keyframe.declarations.length ? (
                                  <ul className="flex flex-col gap-2  bg-slate-900 p-2 rounded-lg">
                                    {keyframe.declarations
                                      .filter(
                                        (dclr) => dclr.type == "declaration"
                                      )
                                      .map(({ property, value }, z) => {
                                        return (
                                          <li
                                            key={z}
                                            className="w-full flex justify-between items-center gap-2 text-center "
                                          >
                                            <article className="w-full flex justify-between  gap-2 text-center">
                                              <p className="w-[45%] whitespace-break-spaces break-inside-avoid-column text-slate-200 text-sm  flex items-center justify-center bg-blue-600 p-2 font-semibold rounded-lg flex-shrink-0 flex-grow">
                                                {property}
                                              </p>
                                              <p className="text-white font-bold self-center">
                                                :
                                              </p>
                                              <p className="w-[45%] whitespace-break-spaces break-all flex items-center justify-center  text-slate-200 text-sm bg-blue-600 p-2 font-semibold rounded-lg flex-grow">
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
              list={animations}
            />
          )}
          {/* </section> */}
        </Accordion>
      </section>
    </Memo>
  );
});

{
  /* {animations.length
            ? animations.map((animation, i) => (
                <AccordionItem title={animation.name}>
                  <Adder
                    key={i}
                    className={`p-[unset] bg-slate-800`}
                    addClassName="bg-slate-900"
                    delClassName="bg-slate-900"
                    onAddClick={(ev) => {
                      addPercentage(i);
                    }}
                    onDeleteClick={(ev) => {
                      deleteAnimation(i);
                    }}
                  >
                    <main className="w-full flex flex-col gap-3">
                      <p className="text-white w-full font-semibold bg-blue-600 py-2 text-center rounded-lg">
                        {animation.name}
                      </p>

                      {animation.values.map(({ percentage, styles }, x) => {
                        return (
                          // <section key={x} className="flex flex-col bg-slate-900 px-1 py-2 gap-[100px] ">

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
                              <section className="w-full flex items-center  bg-slate-800 px-1 rounded-lg">
                                {" "}
                                <Input
                                  className="bg-slate-800 w-full"
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
                                <p className="font-semibold select-none text-slate-200 px-2">
                                  %
                                </p>
                              </section>

                              <SmallButton
                                title="delete frame"
                                className="flex-shrink-0 bg-slate-800"
                                onClick={() => {
                                  deleteFrame(i, x);
                                }}
                              >
                                {Icons.trash("white")}
                              </SmallButton>

                              <SmallButton
                                title="select frame"
                                className="flex-shrink-0 bg-slate-800"
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
                              <ul className="flex flex-col gap-2  bg-slate-900 p-2 rounded-lg">
                                {Object.keys(styles).map((key, z) => {
                                  return (
                                    <li
                                      key={z}
                                      className="w-full flex justify-between items-center gap-2 text-center "
                                    >
                                      <article className="w-full flex justify-between  gap-2 text-center">
                                        <p className="w-[45%] whitespace-break-spaces break-inside-avoid-column text-slate-200 text-sm  flex items-center justify-center bg-blue-600 p-2 font-semibold rounded-lg flex-shrink-0 flex-grow">
                                          {key}
                                        </p>
                                        <p className="text-white font-bold self-center">
                                          :
                                        </p>
                                        <p className="w-[45%] whitespace-break-spaces break-all flex items-center justify-center  text-slate-200 text-sm bg-blue-600 p-2 font-semibold rounded-lg flex-grow">
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
