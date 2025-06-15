import React, { memo, useEffect, useRef, useState } from "react";
import { Aside } from "./Protos/Aside";
import { MiniTitle } from "./Protos/MiniTitle";
import { Adder } from "./Protos/Adder";
import { Input } from "./Protos/Input";
import { SmallButton } from "./Protos/SmallButton";
import { Icons } from "../Icons/Icons";
import { animationsType } from "../../helpers/jsDocs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  animeStylesState,
  framesStylesState,
  showAnimationsBuilderState,
} from "../../helpers/atoms";
import { useEditorMaybe } from "@grapesjs/react";
import { rgbStringToHex, stringifyKeyframes } from "../../helpers/functions";
import { cloneObject } from "../../helpers/cocktail";

export const AnimationsBuilder = memo(() => {
  const editor = useEditorMaybe();
  const [animation, setAnimation] = useState("");
  const [animations, setAnimations] = useState(Array.from(animationsType));
  const [currentEditingIndex, setCurrentEditingIndex] = useState(0);
  const [currentEditingIndexStyles, setCurrentEditingIndexStyles] = useState(0);
  const animeStyles = useRecoilValue(animeStylesState);
  const oldAnimtaions = useRef(Array.from(animationsType));
  const showAnimeBuilder = useRecoilValue(showAnimationsBuilderState);
  const setFramesStyles = useSetRecoilState(framesStylesState);

  const getKeyFrames = () => {
    const animationsReady = editor.Parser.parseCss(editor.getCss()).filter(
      (animation) => animation.atRuleType == "keyframes"
    );
    /**
     * @type {import('../../helpers/types')}
     */
    const animes = {};
    animationsReady.forEach((anime) => {
      animes[anime.mediaText] = {
        name: anime.mediaText,
        values: animes[anime.mediaText]?.values
          ? [
              ...animes[anime.mediaText].values,
              {
                percentage: +anime.selectorsAdd.replace("%", ""),
                styles: anime.style,
              },
            ]
          : [
              {
                percentage: +anime.selectorsAdd.replace("%", ""),
                styles: anime.style,
              },
            ],
      };
    });
    console.log(animes, animationsReady, Object.values(animes));
    setAnimations([...Object.values(animes)]);
  };

  const addAnimation = (animationName) => {
    if (!animation) return;
    oldAnimtaions.current = structuredClone(animations);
    setAnimations([
      ...animations,
      {
        name: animationName,
        values: [
          {
            percentage: 0,
            styles: {},
          },
        ],
      },
    ]);
  };

  const removeAnimationRule = (animations = animationsType) => {
    animations.forEach(({ name, values }) => {
      values.forEach(({ percentage, styles }) => {
        const oldRule = editor.Css.getRule(`${percentage}%`, {
          atRuleType: "keyframes",
          atRuleParams: name,
        });

        editor.Css.remove(oldRule);
      });
    });
  };

  const removeFrameRule = (animations = animationsType, percentageParam) => {
    animations.forEach(({ name, values }) => {
      values.forEach(({ percentage, styles }) => {
        if (percentage != percentageParam) return;
        const oldRule = editor.Css.getRule(`${percentage}%`, {
          atRuleType: "keyframes",
          atRuleParams: name,
        });

        editor.Css.remove(oldRule);
      });
    });
  };

  const deleteAnimation = (index) => {
    const newArr = Array.from(animations).filter((anim, i) => i != index);
    oldAnimtaions.current = structuredClone(animations);
    // oldAnimtaions.current.forEach(({ name, values }) => {
    //   values.forEach(({ percentage, styles }) => {
    //     const oldRule = editor.Css.getRule(`${percentage}%`, {
    //       atRuleType: "keyframes",
    //       atRuleParams: name,
    //     });

    //     editor.Css.remove(oldRule);
    //   });
    // });
    removeAnimationRule(animations);
    console.log(editor.getCss());

    setAnimations(newArr);
  };

  const deleteFrame = (i, x) => {
    const clone = structuredClone(animations);
    const percentage = clone[i].values[x].percentage;
    clone[i].values = clone[i].values.filter((val, z) => z != x);
    console.log("clone : ", clone);
    console.log("original : ", animations);

    if (currentEditingIndexStyles == x)
      setCurrentEditingIndexStyles(currentEditingIndexStyles - 1);
    removeFrameRule(animations, percentage);
    setAnimations(clone);
  };

  const addPercentage = (index, propsIndex) => {
    const newArr = structuredClone(animations);
    oldAnimtaions.current = structuredClone(animations);
    newArr[index].values = [
      ...newArr[index].values,
      { percentage: 0, styles: {} },
    ];
    setAnimations(newArr);
  };

  const updatePercentageValue = ({ index, propsIndex, newValue }) => {
    const newArr = structuredClone(animations);
    oldAnimtaions.current = structuredClone(animations);
    newArr[index].values[propsIndex].percentage = newValue;
    setAnimations(newArr);
    addAnimationRule(newArr);
  };

  const addAnimationRule = (animationsArr = animationsType) => {
    animationsArr.forEach((animation, i) => {
      if (!oldAnimtaions.current[i]) return;
      animation.values.forEach(({ percentage, styles }, x) => {
        const oldRule = editor.Css.getRule(
          `${oldAnimtaions.current[i].values[x].percentage}%`,
          {
            atRuleType: "keyframes",
            atRuleParams: animation.name,
          }
        );

        editor.Css.remove(oldRule);
      });

      editor.addStyle(stringifyKeyframes(animation));
      console.log(editor.getCss(), "after added styles");
    });
  };

  useEffect(() => {
    if (
      currentEditingIndex == undefined ||
      currentEditingIndexStyles == undefined ||
      !animations.length
    )
      return;
    console.log(animeStyles);
    const newArr = structuredClone(animations);
    // const newObj = (newArr[currentEditingIndex] = cloneObject(
    //   newArr[currentEditingIndex]
    // ));
    console.log(newArr);
    const styles =
      newArr[currentEditingIndex].values[currentEditingIndexStyles];
    styles.styles = {
      ...styles.styles,
      ...animeStyles,
    };

    Object.keys(styles.styles).forEach((key) => {
      if (!styles.styles[key]) delete styles.styles[key];
    });
    oldAnimtaions.current = structuredClone(animations);

    addAnimationRule(newArr);
    setAnimations(newArr);
  }, [animeStyles]);

  useEffect(() => {
    if (!showAnimeBuilder) return;
    setAnimations([]);
    getKeyFrames();
  }, [showAnimeBuilder]);

  return (
    <>
      <MiniTitle>Animations Builder</MiniTitle>
      <section className="flex flex-col gap-2 mt-2 rounded-lg ">
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

        {animations.length
          ? animations.map((animation, i) => (
              <Adder
                key={i}
                className={`p-1 bg-slate-800`}
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
            ))
          : null}
      </section>
    </>
  );
});
