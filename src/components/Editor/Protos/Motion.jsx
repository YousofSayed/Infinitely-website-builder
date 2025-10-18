import React, { memo, useEffect, useRef, useState, useTransition } from "react";
import { SwitchButton } from "../../Protos/SwitchButton";
// import { InfAccordion } from "../../Protos/InfAccordion";
// import { Accordion, AccordionItem } from "@heroui/accordion";
import { Select } from "./Select";
import {
  downloadFile,
  getGsapCssProperties,
  getProjectData,
  getProjectSettings,
  initToolbar,
  preventSelectNavigation,
  workerCallbackMaker,
} from "../../../helpers/functions";
import { Adder } from "./Adder";
import { Input } from "./Input";
import {
  advancedGsapOptions,
  getGsapAnimationOptions,
  getGsapScrollTriggerOptions,
  getGsapTimelineProps,
  splitTextOptions,
} from "../../../constants/motion";
import { SmallButton } from "./SmallButton";
import { Icons, mainColor } from "../../Icons/Icons";
import { MiniTitle } from "./MiniTitle";
import {
  animationsType,
  motionAnimationType,
  motionType,
} from "../../../helpers/jsDocs";
import noData from "../../../assets/images/no-data.svg";
import { Button } from "../../Protos/Button";
import { useEditorMaybe } from "@grapesjs/react";
import {
  add,
  cloneDeep,
  isArray,
  isBoolean,
  isObject,
  isPlainObject,
  isString,
  random,
  uniqueId,
} from "lodash";
import {
  addClickClass,
  parseAndReturnInputIfNot,
  stringify,
  uniqueID,
} from "../../../helpers/cocktail";
import { useRecoilState } from "recoil";
import { currentElState } from "../../../helpers/atoms";
import { infinitelyWorker } from "../../../helpers/infinitelyWorker";
import {
  current_page_id,
  current_project_id,
  mainMotionId,
  motionId,
  motionInstanceId,
} from "../../../constants/shared";
import { useLiveQuery } from "dexie-react-hooks";
import { runGsapMethod } from "../../../helpers/customEvents";
import { FitTitle } from "./FitTitle";
import {
  editNestedObject,
  getNestedValue,
  removeNestedKey,
} from "../../../helpers/bridge";
import { Tooltip } from "react-tooltip";
import serializeJavascript from "serialize-javascript";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { OptionsButton } from "../../Protos/OptionsButton";
import { ScrollableToolbar } from "../../Protos/ScrollableToolbar";
import { pageBuilderWorker } from "../../../helpers/defineWorkers";
import { AccordionItem } from "../../Protos/AccordionItem";
import { Accordion } from "../../Protos/Accordion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Hr } from "../../Protos/Hr";
const parseValue = (value) => {
  try {
    return (
      //  new Function(`return (${value})`)();
      JSON.parse(value)
    );
  } catch (error) {
    return value;
  }
};
console.log(/on[A-Z]/gi.test("onUpdate"));

// serializing :  {"callback":() => {
//   "hahaha";
// }}

const cssProps = getGsapCssProperties();
const allGsapOptions = getGsapAnimationOptions();
const timelineOptions = getGsapTimelineProps();
const multiGsapProps = allGsapOptions.arrayProps;
const objectProps = allGsapOptions.objectProps;
const scrollTriggerOptions = getGsapScrollTriggerOptions();
const singleScrollTriggerProps = scrollTriggerOptions.single;
const multiScrollTriggerProps = scrollTriggerOptions.multi;

const AddNestedProps = ({
  destination = [],
  secondDestination = [],
  className,
  motion = motionType,
  setMotion = (motion = motionType) => {},
  animation = motionAnimationType,
  animationIndex = 0,
  keys = [],
  placeholder = "",
}) => {
  const [value, setValue] = useState("");
  const [animatedRef] = useAutoAnimate();
  const [parentAnimatedRef] = useAutoAnimate();
  const addProp = (prop) => {
    const clone = cloneDeep(animation);
    const editeable = editNestedObject(clone, destination.concat(prop), "");
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(clone, secondDestination.concat(prop), "")
      : {};

    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return {
            ...anim,
            ...editeable,
            ...secondEditeable,
          };
        }
        return anim;
      }),
    });
  };

  const editeProp = (prop, value) => {
    const clone = cloneDeep(animation);
    const editeable = editNestedObject(clone, destination.concat(prop), value);
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(
          clone,
          secondDestination.concat(prop),
          parseAndReturnInputIfNot(value)
        )
      : {};

    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return {
            ...anim,
            ...editeable,
            ...secondEditeable,
          };
        }
        return anim;
      }),
    });
  };

  const removeProp = (prop, objKey) => {
    const clone = cloneDeep(animation);
    const editeable = removeNestedKey(clone, destination.concat(prop));
    const secondEditeable = isArray(secondDestination)
      ? removeNestedKey(clone, secondDestination.concat(prop))
      : {};

    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return {
            // ...anim,
            ...editeable,
            ...secondEditeable,
          };
        }
        return anim;
      }),
    });
  };

  return (
    <section className="flex flex-col  " ref={parentAnimatedRef}>
      <section
        className={`${className} flex  gap-2  sticky top-0 bg-slate-950 ${
          Object.keys(getNestedValue(animation, destination) || {})?.length
            ? "rounded-tl-lg rounded-tr-lg"
            : "rounded-lg"
        }`}
      >
        <Select
          className="p-[unset]"
          inputClassName="bg-slate-800"
          containerClassName="bg-slate-800"
          placeholder={placeholder || "Select Prop"}
          keywords={keys}
          value={value}
          onInput={(value) => setValue(value)}
          onEnterPress={(value) => {
            addProp(value);
          }}
          onItemClicked={(value) => {
            addProp(value);
          }}
        />
        <SmallButton
          className="w-[40px!important] bg-slate-800"
          onClick={() => {
            addProp(value);
          }}
        >
          {Icons.plus("white")}
        </SmallButton>
      </section>

      {!!Object.entries(getNestedValue(animation, destination) || {})
        .length && (
        <section
          ref={animatedRef}
          className=" flex flex-col gap-2 p-1 bg-slate-950 rounded-bl-md rounded-br-md"
        >
          {Object.entries(getNestedValue(animation, destination) || {}).map(
            ([key, value], index) => {
              return (
                <section
                  key={index}
                  className="relative flex flex-col gap-2  mt-3"
                >
                  {/* <h1 className="px-2 text-slate-200 py-1  bg-blue-600 rounded-lg w-fit">
                    {key}
                  </h1> */}

                  <FitTitle className="capitalize">{key}</FitTitle>

                  <section className="flex  gap-2">
                    <Input
                      placeholder={key}
                      className="bg-slate-800 w-full"
                      value={value}
                      onInput={(ev) => {
                        editeProp(key, ev.target.value);
                      }}
                    />
                    <SmallButton
                      onClick={(ev) => {
                        removeProp(key);
                      }}
                    >
                      {Icons.trash("white")}
                    </SmallButton>
                  </section>
                </section>
              );
            }
          )}
        </section>
      )}
    </section>
  );
};

const ObjectComponent = ({
  objectProps = {},
  destination = [],
  secondDestination = [],
  motion = motionType,
  animation = motionAnimationType,
  animationIndex = 0,
  isTimeLine = false,
  isSplitText = false,
  setMotion = (motion = motionType) => {},
}) => {
  const addValue = (value, prop) => {
    if (isTimeLine || isSplitText) {
      const clone = cloneDeep(motion);
      const editeable = editNestedObject(
        clone,
        destination.concat(prop),
        parseValue(value)
      );
      console.log("cloone timeline : ", clone);

      setMotion(clone);
      return;
    }

    console.log("from destoooo : ", destination.concat(prop));
    console.log(
      "from destoooo one and second: ",
      destination.concat(prop),
      secondDestination?.concat?.(prop)
    );

    const clone = cloneDeep(animation);
    const editeable = editNestedObject(
      clone,
      destination.concat(prop),
      parseValue(value)
    );
    const secondEditeable = isArray(secondDestination)
      ? editNestedObject(
          clone,
          secondDestination.concat(prop),
          parseValue(value)
        )
      : {};

    const editableValue = getNestedValue(editeable, destination.concat(prop));
    const secondEditableValue = isArray(secondDestination)
      ? getNestedValue(secondEditeable, secondDestination.concat(prop))
      : null;
    if (!editableValue && !isBoolean(editableValue)) {
      removeNestedKey(editeable, destination.concat(prop));
    }

    // console.log("from removing empty obj : " , editableValue ,destination , prop);
    const parentObj = getNestedValue(editeable, destination);
    const secondParentObj = isArray(secondDestination)
      ? getNestedValue(secondEditeable, secondDestination)
      : null;
    if (isPlainObject(parentObj) && !Object.keys(parentObj || {})?.length) {
      removeNestedKey(editeable, destination);
    }

    if (
      isArray(secondDestination) &&
      !secondEditableValue &&
      !isBoolean(secondEditableValue)
    ) {
      removeNestedKey(secondEditeable, secondDestination.concat(prop));
    }
    if (
      isArray(secondDestination) &&
      isPlainObject(secondParentObj) &&
      !Object.keys(secondParentObj || {})?.length
    ) {
      removeNestedKey(secondEditeable, secondDestination);
    }

    console.log(
      "from after set first and second nested : ",
      editeable,
      secondEditeable
    );

    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          console.log("from setting motions satete : ", {
            ...anim,
            ...editeable,
            ...secondEditeable,
          });

          return {
            ...anim,
            ...editeable,
            ...secondEditeable,
          };
        }
        return anim;
      }),
    });
  };

  return (
    <section className="flex flex-col gap-2 p-1 bg-slate-950 rounded-lg">
      {Object.entries(objectProps).map(([key, value], index) => {
        return (
          <section key={index} className="relative flex flex-col gap-2  ">
            <FitTitle
              className={`capitalize font-semibold text-slate-200 text-ellipsis overflow-hidden max-w-full`}
            >
              {key}
            </FitTitle>
            {isPlainObject(value) && !value._custom ? (
              <Accordion
              // variant="shadow"
              // itemClasses={{
              //   trigger: "flex items-center justify-between ",
              //   base: "bg-slate-800 p-3  rounded-lg text-slate-200 font-semibold relative",
              //   content: `bg-slate-900 p-[unset!important] mt-2 rounded-md`,
              //   title: `capitalize custom-font-size`,
              //   indicator: `text-[18px] transition-all`,
              // }}
              >
                <AccordionItem title={key}>
                  <ObjectComponent
                    motion={motion}
                    setMotion={setMotion}
                    animation={animation}
                    isTimeLine={isTimeLine}
                    animationIndex={animationIndex}
                    objectProps={value}
                    destination={[...destination, key]}
                    secondDestination={
                      secondDestination && isArray(secondDestination)
                        ? [...secondDestination, key]
                        : null
                    }
                  />
                </AccordionItem>
              </Accordion>
            ) : isPlainObject(value) &&
              value._custom &&
              value._type == "choose" ? (
              <>
                {/* <FitTitle className={`capitalize font-semibold`}>
                  {key}
                </FitTitle> */}
                <AddNestedProps
                  destination={[...destination, key]}
                  secondDestination={
                    isArray(secondDestination)
                      ? [...secondDestination, key]
                      : null
                  }
                  motion={motion}
                  animation={animation}
                  animationIndex={animationIndex}
                  setMotion={setMotion}
                  keys={value._keys}
                />
              </>
            ) : isArray(value) ? (
              <Select
                placeholder={key}
                value={
                  isPlainObject(
                    getNestedValue(isTimeLine ? motion : animation, [
                      ...destination,
                      key,
                    ])
                  )
                    ? ""
                    : getNestedValue(isTimeLine ? motion : animation, [
                        ...destination,
                        key,
                      ])
                }
                keywords={value}
                onAll={(value) => {
                  console.log(
                    "from select : ",
                    [...destination, key],
                    getNestedValue(isTimeLine ? motion : animation, [
                      ...destination,
                      key,
                    ])
                  );

                  addValue(value, key);
                }}
              />
            ) : key.startsWith("on") && /on[A-Z]/gi.test(key) ? (
              <Select
                placeholder={key}
                isCode
                allowCmdsContext
                value={getNestedValue(isTimeLine ? motion : animation, [
                  ...destination,
                  key,
                ])}
                codeProps={{
                  language: "javascript",
                  value: isObject(
                    getNestedValue(isTimeLine ? motion : animation, [
                      ...destination,
                      key,
                    ])
                  )
                    ? stringify(
                        getNestedValue(isTimeLine ? motion : animation, [
                          ...destination,
                          key,
                        ])
                      )
                    : getNestedValue(isTimeLine ? motion : animation, [
                        ...destination,
                        key,
                      ]),
                  onChange: (value) => {
                    addValue(value, key);
                  },
                }}
              />
            ) : isString(value) ? (
              <Input
                placeholder={key}
                value={
                  isPlainObject(
                    getNestedValue(isTimeLine ? motion : animation, [
                      ...destination,
                      key,
                    ])
                  )
                    ? ""
                    : getNestedValue(isTimeLine ? motion : animation, [
                        ...destination,
                        key,
                      ])
                }
                className="bg-slate-900 w-full border-[4px]  border-[#1e293b!important]"
                onInput={(ev) => {
                  addValue(ev.target.value, key);
                }}
              />
            ) : null}
          </section>
        );
      })}
    </section>
  );
};

const SwitcherSection = ({
  defaultValue,
  title = "",
  onActive = () => {},
  onUnActive = () => {},
  onSwitch = () => {},
}) => {
  return (
    <section className="flex justify-between gap-2 items-center p-2 bg-slate-800 rounded-lg">
      <h1 className="text-slate-200 custom-font-size font-semibold">{title}</h1>
      <SwitchButton
        defaultValue={defaultValue}
        onActive={onActive}
        onUnActive={onUnActive}
        onSwitch={onSwitch}
      />
    </section>
  );
};

const ScrollTriggerOptions = ({
  motion = motionType,
  setMotion = (motion = motionType) => {},
  animation = motionAnimationType,
  singleTitle = "",
  multiTitle = "",
  animationIndex = 0,
  main = "",
  secondMain = "",
  isTimeLine = false,
  //   singleTimelineScrollTriggerOptions = {},
  //   multiTimelineScrollTriggerOptions = {},
}) => {
  const setSingleTimelineScrollTriggerOptions = (key, value) => {
    setMotion({
      ...motion,
      timelineScrollTriggerOptions: {
        ...motion.timelineScrollTriggerOptions,
        singleOptions: {
          ...motion.timelineScrollTriggerOptions.singleOptions,
          [key]: value,
        },
      },
    });
  };

  const setMultiTimelineScrollTriggerOptions = (key, value) => {
    setMotion({
      ...motion,
      timelineScrollTriggerOptions: {
        ...motion.timelineScrollTriggerOptions,
        multiOptions: {
          ...motion.timelineScrollTriggerOptions.multiOptions,
          [key]: value,
        },
      },
    });
  };

  const setSingleScrollTriggerOptions = (
    main = "",
    secondMain = "",
    key,
    value
  ) => {
    setMotion({
      ...motion,
      animations: motion.animations.map((animation, index) => {
        if (index === animationIndex) {
          return {
            ...animation,
            [main]: {
              ...animation[main],
              scrollTriggerOptions: {
                ...animation[main].scrollTriggerOptions,
                singleOptions: {
                  ...animation[main].scrollTriggerOptions.singleOptions,
                  [key]: value,
                },
              },
            },

            ...(secondMain && {
              [secondMain]: {
                ...animation[secondMain],
                scrollTriggerOptions: {
                  ...animation[secondMain].scrollTriggerOptions,
                  singleOptions: {
                    ...animation[secondMain].scrollTriggerOptions.singleOptions,
                    [key]: value,
                  },
                },
              },
            }),
          };
        }
        return animation;
      }),
    });
  };

  const setMultiScrollTriggerOptions = (
    main = "",
    secondMain = "",
    key,
    value
  ) => {
    setMotion({
      ...motion,
      animations: motion.animations.map((animation, index) => {
        if (index === animationIndex) {
          return {
            ...animation,
            [main]: {
              ...animation[main],
              scrollTriggerOptions: {
                ...animation[main].scrollTriggerOptions,
                multiOptions: {
                  ...animation[main].scrollTriggerOptions.multiOptions,
                  [key]: value,
                },
              },
            },
            ...(secondMain && {
              [secondMain]: {
                ...animation[secondMain],
                scrollTriggerOptions: {
                  ...animation[secondMain].scrollTriggerOptions,
                  multiOptions: {
                    ...animation[secondMain].scrollTriggerOptions.multiOptions,
                    [key]: value,
                  },
                },
              },
            }),
          };
        }
        return animation;
      }),
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <Accordion>
        <AccordionItem title={singleTitle || "ScrollTrigger options"}>
          <section className=" flex flex-col gap-2 p-1">
            {singleScrollTriggerProps.map((item, index) => {
              return (
                <section
                  key={index}
                  className="relative flex flex-col gap-2  mt-3"
                >
                  <h1 className="px-2 py-1  bg-blue-600 rounded-lg w-fit">
                    {item}
                  </h1>
                  <Input
                    placeholder={item}
                    className="bg-slate-800 w-full"
                    value={
                      isTimeLine
                        ? motion.timelineScrollTriggerOptions?.singleOptions?.[
                            item
                          ]
                        : animation?.[main]?.scrollTriggerOptions
                            ?.singleOptions?.[item]
                    }
                    onInput={(ev) => {
                      if (isTimeLine) {
                        setSingleTimelineScrollTriggerOptions(
                          item,
                          ev.target.value
                        );
                      } else {
                        setSingleScrollTriggerOptions(
                          main,
                          secondMain,
                          item,
                          ev.target.value
                        );
                      }
                    }}
                  />
                </section>
              );
            })}
          </section>
        </AccordionItem>

        <AccordionItem title={multiTitle || "Advanced ScrollTrigger options"}>
          <section className=" flex flex-col gap-2 p-1">
            {Object.entries(multiScrollTriggerProps).map(
              ([key, value], index) => {
                return (
                  <section
                    key={index}
                    className="relative flex flex-col gap-2  mt-3"
                  >
                    <h1 className="px-2 py-1  bg-blue-600 rounded-lg w-fit">
                      {key}
                    </h1>
                    <Select
                      value={
                        isTimeLine
                          ? motion?.timelineScrollTriggerOptions
                              ?.multiOptions?.[key]
                          : animation?.[main]?.scrollTriggerOptions
                              ?.multiOptions?.[key]
                      }
                      placeholder={key}
                      keywords={value}
                      onAll={(value) => {
                        if (isTimeLine) {
                          setMultiTimelineScrollTriggerOptions(key, value);
                        } else {
                          setMultiScrollTriggerOptions(
                            main,
                            secondMain,
                            key,
                            value
                          );
                        }
                      }}
                    />
                  </section>
                );
              }
            )}
          </section>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

const FromTo = ({
  motion = motionType,
  setMotion = (motion = motionType) => {},
  animation = motionAnimationType,
  animationIndex = 0,
}) => {
  const setSelector = (value) => {
    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return { ...anim, selector: value };
        }
        return anim;
      }),
    });
  };

  const setActive = (key) => {
    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return { ...anim, [key]: true };
        }
        return anim;
      }),
    });
  };

  const setUnActive = (key) => {
    setMotion({
      ...motion,
      animations: motion.animations.map((anim, index) => {
        if (index === animationIndex) {
          return { ...anim, [key]: false };
        }
        return anim;
      }),
    });
  };

  return (
    <section className="flex flex-col gap-3">
      {/* <ObjectComponent objectProps={objectProps} /> */}
      <>
        <FitTitle title="Selector" className={"w-fit"}>
          Selector
        </FitTitle>
        <Input
          placeholder="Selector"
          className="bg-slate-800"
          value={animation?.selector}
          onInput={(ev) => {
            setSelector(ev.target.value);
          }}
        />
      </>

      {!motion.isTimeLine && (
        <>
          <FitTitle title="Name" className={"w-fit"}>
            Name
          </FitTitle>
          <Input
            placeholder="Name"
            className="bg-slate-800"
            value={animation?.name}
            onInput={(ev) => {
              setMotion({
                ...motion,
                animations: motion.animations.map((anim, index) => {
                  if (index === animationIndex) {
                    return { ...anim, name: ev.target.value };
                  }
                  return anim;
                }),
              });
            }}
          />
        </>
      )}

      <SwitcherSection
        title="Use Same From Options"
        defaultValue={Boolean(animation?.useSameFromOptions)}
        onActive={() => setActive("useSameFromOptions")}
        onUnActive={() => setUnActive("useSameFromOptions")}
      />

      <SwitcherSection
        title="Use Same To Options"
        defaultValue={Boolean(animation?.useSameToOptions)}
        onActive={() => setActive("useSameToOptions")}
        onUnActive={() => setUnActive("useSameToOptions")}
      />

      {/* <SwitcherSection
        title="Use Same From ScrollTrigger Options"
        onActive={() => setActive("useSameFromScrollTrigger")}
        onUnActive={() => setUnActive("useSameFromScrollTrigger")}
      />

      <SwitcherSection
        title="Use Same To ScrollTrigger Options"
        onActive={() => setActive("useSameToScrollTrigger")}
        onUnActive={() => setUnActive("useSameToScrollTrigger")}
      /> */}

      <Accordion>
        <AccordionItem title="From">
          {/* <section className="flex  gap-2 p-2 bg-slate-950 rounded-lg">
            <Select
              className="p-[unset]"
              inputClassName="bg-slate-800"
              containerClassName="bg-slate-800"
              placeholder="Select Prop"
              keywords={cssProps}
              value={fromValue}
              onInput={(value) => setFromValue(value)}
              onEnterPress={(value) => {
                addProp(value, "from");
              }}
              onItemClicked={(value) => {
                addProp(value, "from");
              }}
            />
            <SmallButton
              className="w-[40px!important] bg-slate-800"
              onClick={() => {
                addProp(fromValue, "from");
              }}
            >
              {Icons.plus("white")}
            </SmallButton>
          </section>
          {!!Object.keys(animation.from).length && (
            <section className=" flex flex-col gap-2 p-1">
              {Object.entries(
                motion?.animations?.[animationIndex]?.from || {}
              ).map(([key, value], index) => {
                return (
                  <section
                    key={index}
                    className="relative flex flex-col gap-2  mt-3"
                  >
                    <h1 className="px-2 py-1  bg-blue-600 rounded-lg w-fit">
                      {key}
                    </h1>

                    <section className="flex  gap-2">
                      <Input
                        placeholder={key}
                        className="bg-slate-800 w-full"
                        value={value}
                        onInput={(ev) => {
                          addProp(key, "from", ev.target.value);
                        }}
                      />
                      <SmallButton
                        onClick={(ev) => {
                          removeProp(key, "from");
                        }}
                      >
                        {Icons.trash("white")}
                      </SmallButton>
                    </section>
                  </section>
                );
              })}
            </section>
          )} */}

          <section className="w-full p-1 bg-slate-950 rounded-lg">
            <AddNestedProps
              motion={motion}
              setMotion={setMotion}
              animation={animation}
              animationIndex={animationIndex}
              destination={["from"]}
              keys={cssProps}
            />
          </section>
        </AccordionItem>

        <AccordionItem title="From Options">
          <ObjectComponent
            motion={motion}
            setMotion={setMotion}
            animationIndex={animationIndex}
            animation={animation}
            destination={["fromOptions"]}
            secondDestination={
              animation.useSameFromOptions ? ["toOptions"] : null
            }
            objectProps={{ ...allGsapOptions.arrayProps, ...objectProps }}
          />
        </AccordionItem>

        <AccordionItem title="Advanced From options">
          <ObjectComponent
            motion={motion}
            setMotion={setMotion}
            animationIndex={animationIndex}
            animation={animation}
            destination={["fromOptions"]}
            secondDestination={
              animation.useSameFromOptions ? ["toOptions"] : null
            }
            objectProps={advancedGsapOptions}
          />
        </AccordionItem>
      </Accordion>

      <Accordion>
        <AccordionItem title="To">
          <section className="w-full p-1 bg-slate-950 rounded-lg">
            <AddNestedProps
              motion={motion}
              setMotion={setMotion}
              animation={animation}
              animationIndex={animationIndex}
              destination={["to"]}
              keys={cssProps}
            />
          </section>
        </AccordionItem>

        <AccordionItem title="To Options">
          <ObjectComponent
            motion={motion}
            setMotion={setMotion}
            animationIndex={animationIndex}
            animation={animation}
            destination={["toOptions"]}
            secondDestination={
              animation.useSameToOptions ? ["fromOptions"] : null
            }
            objectProps={{ ...allGsapOptions.arrayProps, ...objectProps }}
          />
        </AccordionItem>

        <AccordionItem title="Advanced To options">
          <ObjectComponent
            motion={motion}
            setMotion={setMotion}
            animationIndex={animationIndex}
            animation={animation}
            destination={["toOptions"]}
            secondDestination={
              animation.useSameToOptions ? ["fromOptions"] : null
            }
            objectProps={advancedGsapOptions}
          />
        </AccordionItem>
      </Accordion>

      {/* <SwitcherSection
        title="From ScrollTrigger"
        defaultValue={animation.fromOptions.isScrollTrigger}
        onActive={() =>
          setActiveScrollTrigger("fromOptions", "isScrollTrigger")
        }
        onUnActive={() =>
          setUnActiveScrollTrigger("fromOptions", "isScrollTrigger")
        }
      />

      {animation.fromOptions.isScrollTrigger && (
        <ScrollTriggerOptions
          motion={motion}
          setMotion={setMotion}
          animation={animation}
          animationIndex={animationIndex}
          main="fromOptions"
          secondMain={animation.useSameFromScrollTrigger ? "toOptions" : ""}
          isTimeLine={false}
        />
      )}

      <SwitcherSection
        title="To ScrollTrigger"
        defaultValue={animation.toOptions.isScrollTrigger}
        onActive={() => setActiveScrollTrigger("toOptions", "isScrollTrigger")}
        onUnActive={() =>
          setUnActiveScrollTrigger("toOptions", "isScrollTrigger")
        }
      />

      {animation.toOptions.isScrollTrigger && (
        <ScrollTriggerOptions
          motion={motion}
          setMotion={setMotion}
          animation={animation}
          animationIndex={animationIndex}
          main="toOptions"
          secondMain={animation.useSameFromScrollTrigger ? "fromOptions" : ""}
          isTimeLine={false}
        />
      )} */}

      {motion.isTimeLine && (
        <>
          <MiniTitle title="Position Parameter" className={"w-fit"}>
            Position Parameter
          </MiniTitle>
          <Input
            placeholder="Position Parameter"
            className="bg-slate-800"
            value={animation.positionParameter}
            onInput={(ev) => {
              setMotion({
                ...motion,
                animations: motion.animations.map((anim, index) => {
                  if (index === animationIndex) {
                    return { ...anim, positionParameter: ev.target.value };
                  }
                  return anim;
                }),
              });
            }}
          />
        </>
      )}
    </section>
  );
};

const Timeline = ({
  motion = motionType,
  setMotion = (motion = motionType) => {},
}) => {
  return (
    <section className="flex flex-col gap-3">
      <section className="flex  gap-2 flex-col ">
        <FitTitle className={`flex justify-center items-center`}>name</FitTitle>
        <Input
          value={motion.timeLineName || ""}
          onInput={(ev) => {
            setMotion({ ...motion, timeLineName: ev.target.value });
          }}
          placeholder="name"
          className="bg-slate-900 border-[#1e293b!important] w-full"
        />
      </section>
      <Accordion>
        <AccordionItem title="Timeline options">
          <section className=" flex flex-col gap-2 p-1">
            <ObjectComponent
              isTimeLine
              motion={motion}
              setMotion={setMotion}
              objectProps={timelineOptions}
              destination={["timeline"]}
            />
          </section>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

const SplitText = ({
  motion = motionType,
  setMotion = (motion = motionType) => {},
}) => {
  return (
    <section className="flex flex-col gap-3">
      <section className="flex  gap-2 flex-col ">
        <FitTitle className={`flex justify-center items-center`}>name</FitTitle>
        <Input
          value={motion.timeLineName || ""}
          onInput={(ev) => {
            setMotion({ ...motion, splitTextName: ev.target.value });
          }}
          placeholder="name"
          className="bg-slate-900 border-[#1e293b!important] w-full"
        />
      </section>
      <Accordion>
        <AccordionItem title="SplitText options">
          <section className=" flex flex-col gap-2 p-1">
            <ObjectComponent
              isTimeLine
              motion={motion}
              setMotion={setMotion}
              objectProps={splitTextOptions}
              destination={["splitText"]}
            />
          </section>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export const Motion = memo(() => {
  const editor = useEditorMaybe();
  const [timeline, setTimeline] = useState(false);

  /**
   * @type {import('../../../helpers/types').MotionType}
   */
  const mType = null;
  const [motion, setMotion] = useState(mType);
  const [selectedEl, setSelectedEl] = useRecoilState(currentElState);
  const [selectedElMotionId, setSelectedElMotionId] = useState("");
  const [isPending, setTransition] = useTransition();
  const [motionKeys, setMotionKeys] = useState([]);
  const [isInstance, setIsInstance] = useState(false);
  const [editeAsMain, setEditeAsMain] = useState(true);
  const [mainId, setMainId] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const motionUploader = useRef();
  const [autoAnimateRef] = useAutoAnimate();
  const isStoring = useRef(false);
  const rId = useRef(null);
  const iconStyle = {
    fill: "white",
    strokeColor: "white",
    width: 15,
    height: 15,
  };
  const controllerIcons = [
    { icon: Icons.play(iconStyle), methods: ["play"], tooltipTitle: "Play" },
    { icon: Icons.pause(iconStyle), methods: ["pause"], tooltipTitle: "Pause" },
    {
      icon: Icons.resume(iconStyle),
      methods: ["resume"],
      tooltipTitle: "Resume",
    },
    {
      icon: Icons.refresh(iconStyle),
      methods: ["restart"],
      tooltipTitle: "Restart",
    },
    // {icon : Icons.trash('white') , method : "remove"},
    {
      icon: Icons.x(iconStyle),
      methods: ["kill", "revert"],
      tooltipTitle: "Kill",
    },
    {
      icon: Icons.reverse(iconStyle),
      methods: ["reverse"],
      tooltipTitle: "Reverse",
    },
  ];

  /**
   * @type {import('../../../helpers/types').MotionAnimationType}
   */
  const initialMotionAnimation = {
    from: {},
    to: {},
    useSameFromOptions: false,
    useSameToOptions: false,
    // useSameFromScrollTrigger: false,
    // useSameToScrollTrigger: false,
    positionParameter: "",
    fromOptions: {
      // isScrollTrigger: false,
      // multiOptions: {},
      // singleOptions: {},
      // scrollTriggerOptions: { multiOptions: {}, singleOptions: {} },
    },
    toOptions: {
      // isScrollTrigger: false,
      // multiOptions: {},
      // singleOptions: {},
      // scrollTriggerOptions: { multiOptions: {}, singleOptions: {} },
    },
    // isScrollTrigger: false,
    // scrollTriggerOptions: { multiOptions: {}, singleOptions: {} },
  };

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    const currentMotion = projectData?.motions;
    setMotionKeys(Object.keys(currentMotion || {}));
  });

  useEffect(() => {
    if (!editor || !editor?.getSelected?.() || !motion?.animations?.length)
      return;
    // console.log("bonbone");

    motion.id && updateDB(motion);

    console.log("motion", motion);
  }, [motion]);

  useEffect(() => {
    if (!editor || !selectedEl) {
      setMotion({ ...motionType, id: "" });
      return;
    }
    if (!selectedEl.currentEl) return;
    if (isStoring.current) return;
    console.log(selectedEl, "selectedEl");
    const sle = editor.getSelected();
    if (!sle) return;
    const attributes = sle.getAttributes();
    let mId = attributes[motionId] || attributes[mainMotionId],
      instanceId = attributes[motionInstanceId];
    setEditeAsMain(!Boolean(instanceId));
    setIsInstance(Boolean(instanceId));
    setMainId(mId);
    setInstanceId(instanceId);
    console.log("mide : ", mId);

    // instanceId ? setIsInstance(true) : setIsInstance(false);
    // instanceId ? setEditeAsMain(false) : setEditeAsMain(true);
    (async () => {
      await getMotion(mId);
    })();
  }, [selectedEl, editor]);

  /**
   *
   * @param {import('../../../helpers/types').MotionType} newMotion
   * @returns
   */
  const updateDB = async (newMotion, callback = () => {}) => {
    if (!newMotion?.id) return;
    const projectData = await getProjectData();
    const { projectSettings } = getProjectSettings();
    const clone = cloneDeep(newMotion);
    clone.pages = [
      ...new Set([...newMotion.pages, localStorage.getItem(current_page_id)]),
    ];
    const newMotions = {
      ...projectData.motions,
      [clone.id]: clone,
    };
    console.log(
      "project settings  ::: ",
      projectSettings.remove_gsap_markers_on_build
    );

    rId.current && clearTimeout(rId.current);
    rId.current = setTimeout(() => {
      console.log("update from insdie ", newMotion);
      workerCallbackMaker(infinitelyWorker, "updateDB", callback);
      infinitelyWorker.postMessage({
        command: "updateDB",
        props: {
          projectId: +localStorage.getItem(current_project_id),
          data: { motions: newMotions },
          updatePreviewPages: projectSettings.enable_auto_save,
          pageName: localStorage.getItem(current_page_id),
          projectSetting: projectSettings,
          // pageUrl: `pages/${localStorage.getItem(current_page_id)}.html`,
        },
      });
    }, 10);
    // projectData.motions = {
    //   ...projectData.motions,
    //   ...newMotions,
    // };

    // pageBuilderWorker.postMessage({
    //   command: "sendPreviewPageToServiceWorker",
    //   props: {
    //     projectData,
    //     pageUrl: `pages/${localStorage.getItem(current_page_id)}.html`,
    //     pageName: localStorage.getItem(current_page_id),
    //     editorData: {},
    //   },
    // });
  };

  const getMotion = async (id) => {
    if (!id) {
      console.log("no id");

      setMotion({ ...cloneDeep(motionType) });
      return;
    }
    const projectData = await getProjectData();
    const currentMotion = projectData?.motions?.[id];
    console.log("current motion : ", currentMotion, projectData.motions, id);

    setMotion(currentMotion ? { ...currentMotion, id } : { ...motionType, id });
  };

  const deleteMotion = async (id) => {
    const sle = editor.getSelected();
    if (!id || !sle) return;
    const cnfrm = confirm(
      `Are you sure you want to delete those motions? All instances will be removed from all pages, and you won’t be able to undo them on other pages (but you can undo them on the current page; symbols are exceptions)`
    );
    if (!cnfrm) return;
    const { projectSettings } = getProjectSettings();
    const projectData = await getProjectData();
    editor
      .getWrapper()
      .find(`[${motionId}="${id}"] , [${mainMotionId}="${id}"]`)
      .forEach((cmp) => {
        cmp.removeAttributes([motionId, motionInstanceId, mainMotionId]);
      });
    delete projectData.motions[id];
    infinitelyWorker.postMessage({
      command: "deleteAllMotionsById",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        mId: id,
      },
    });
    /**
     *
     * @param {MessageEvent} ev
     */
    const callback = (ev) => {
      const { command, props } = ev.data;
      if (command == "motion-delete" && props.done) {
        console.log("motion-deleted successfully");

        infinitelyWorker.postMessage({
          command: "updateDB",
          props: {
            projectId: +localStorage.getItem(current_project_id),
            data: { motions: projectData.motions },
            updatePreviewPages: projectSettings.enable_auto_save,
            pageName: localStorage.getItem(current_page_id),
            projectSetting: projectSettings,
          },
        });
      }

      infinitelyWorker.removeEventListener("message", callback);
    };

    infinitelyWorker.addEventListener("message", callback);

    // preventSelectNavigation(editor,sle)
    initToolbar(editor, sle);
    setIsInstance(false);
    setEditeAsMain(true);
    setInstanceId("");
    setMainId("");
    preventSelectNavigation(editor, sle);
    toast.success(<ToastMsgInfo msg={`Motion delete successfully👍`} />);
  };

  const addAnimation = () => {
    const id = motion?.id ? motion.id : uniqueId(`mt${uniqueID()}`);
    const pageId = localStorage.getItem(current_page_id);
    const sle = editor.getSelected();
    if (!sle) return;
    const attrs = sle.getAttributes();
    let mId = attrs[motionId] || attrs[mainMotionId];
    if (!mId) {
      sle.addAttributes({ [motionId]: id });
      setMainId(id);
    }

    /**
     * @type {import('../../../helpers/types').MotionType}
     */
    const newMotion = {
      ...(motion || {}),
      id,
      ...(motion.isTimeLine && { timeLineName: id }),
      pages: [...new Set([...(motion.pages ? motion.pages : []), pageId])],
      animations: [
        ...(motion?.animations || []),
        {
          ...initialMotionAnimation,
          name: uniqueId(`mt${uniqueID()}`),
          ...(!motion?.animations?.length ? { selector: `self` } : {}),
        },
      ],
    };

    setMotion(newMotion);
    initToolbar(editor, sle);
  };

  const removeAnimation = (index) => {
    const newAnimations = motion.animations.filter((_, i) => i !== index);

    if (!newAnimations.length && motion.id) {
      // console.log("no length");

      // const sle = editor?.getSelected();
      // if (sle) {
      //   sle.removeAttributes([motionId, mainMotionId]);
      //   // preventSelectNavigation(editor, sle);
      //   initToolbar(editor, sle);
      // }
      const cnfrm = confirm(
        Object.keys(motion.instances || {}).length
          ? `You will remove all instance too , Are you sure ?`
          : `Are you sure to remove motion ?`
      );
      if (!cnfrm) return;
      deleteMotion(motion.id);
      setMotion({ ...motionType, id: "" });
      setIsInstance(false);
      setEditeAsMain(true);
      setInstanceId("");
      setMainId("");
      preventSelectNavigation(editor, sle);
    } else {
      const newMotion = { ...motion, animations: newAnimations };
      setMotion(newMotion);
    }
  };

  const removeInstance = async () => {
    const sle = editor.getSelected();
    console.log(isInstance, instanceId, sle, mainId, "midd");

    if (!(isInstance && instanceId && sle && mainId)) return;
    const projectData = await getProjectData();
    sle.removeAttributes([mainMotionId, motionInstanceId, motionId]);
    delete projectData.motions[mainId].instances[instanceId];
    await infinitelyWorker.postMessage({
      command: "updateDB",
      props: {
        projectId: +localStorage.getItem(current_project_id),
        data: { motions: projectData.motions },
      },
    });
    // preventSelectNavigation(editor,sle)
    initToolbar(editor, sle);
    setInstanceId("");
    setIsInstance(false);
    setEditeAsMain(true);
    preventSelectNavigation(editor, sle);
    // const firstMotionCmp = editor
    //   .getWrapper()
    //   .find(`[${motionId}="${mainId}"]`)[0];
    // firstMotionCmp && preventSelectNavigation(editor, firstMotionCmp);
  };

  const copyInstance = async () => {
    await navigator.clipboard.writeText(instanceId);
    toast.success(<ToastMsgInfo msg={`Instance id copied successfully👍`} />);
  };

  const cloneMotion = async (targetId) => {
    const sle = editor?.getSelected?.();
    if (!targetId) {
      toast.warn(<ToastMsgInfo msg={"Selecte Motion To Edite"} />);
      return;
    } else if (!editor || !sle) {
      toast.warn(<ToastMsgInfo msg={"Selecte Element To Edite"} />);
      return;
    }
    const projectData = await getProjectData();
    const motions = projectData.motions;
    const targetMotion = motions[targetId];
    const clone = cloneDeep(targetMotion);
    const newId = uniqueId(`mt${uniqueID()}`);
    clone.id = newId;
    for (const animation of clone.animations) {
      animation.name = uniqueId(`varName_${uniqueID()}${random(99, 999)}`);
    }
    sle.addAttributes({ [motionId]: newId });
    initToolbar(editor, sle);
    await updateDB(clone);
    setMotion(clone);
  };

  const createInstance = async (targetId) => {
    const sle = editor?.getSelected?.();
    if (!targetId) {
      toast.warn(<ToastMsgInfo msg={"Selecte Motion To Edite"} />);
      return;
    } else if (!editor || !sle) {
      toast.warn(<ToastMsgInfo msg={"Selecte Element To Edite"} />);
      return;
    }
    const projectData = await getProjectData();
    const targetMotion = projectData.motions[targetId];
    const instanceId = uniqueId(`mt${uniqueID()}`);
    targetMotion.instances = {
      ...targetMotion.instances,
      [instanceId]: {
        id: instanceId,
        page: localStorage.getItem(current_page_id),
      },
    };
    console.log("motion instance should created");
    sle.addAttributes({
      [motionInstanceId]: instanceId,
      [mainMotionId]: targetId,
    });

    await updateDB(targetMotion, () => {
      initToolbar(editor, sle);
      preventSelectNavigation(editor, sle);
    });
    // const projectSettings = getProjectSettings();
    // const oldSelectValue =
    //   projectSettings.projectSettings.navigate_to_style_when_Select;
    // projectSettings.set({ navigate_to_style_when_Select: false });

    // setInstanceId(instanceId);
    // editor.select(null);
    // editor.select(sle);
    // projectSettings.set({ navigate_to_style_when_Select: oldSelectValue });
    // setIsInstance(true);
    // setEditeAsMain(false);
    // setMotion(targetMotion);
  };

  const downloadMotion = async (targetId) => {
    if (!targetId) return;
    const projectData = await getProjectData();
    const targetMotion = projectData.motions[targetId];
    downloadFile({
      filename: `motion-${targetId}.json`,
      content: JSON.stringify(targetMotion),
      type: "application/json",
    });
  };

  const uploadMotion = async (ev) => {
    console.log(ev);

    /**
     * @type {File}
     */
    const file = ev.target.files[0];
    if (!file) return;
    /**
     * @type {import('../../../helpers/types').MotionType}
     */
    const motion = JSON.parse(await file.text());
    const sle = editor.getSelected();
    if (!motion || !sle) return;
    sle.addAttributes({ [motionId]: motion.id });
    await updateDB(motion);
    setMotion(motion);
    initToolbar(editor, sle);
    // reSelect();
    // preventSelectNavigation(editor , sle)
  };

  return (
    <section
      ref={autoAnimateRef}
      className="flex flex-col gap-2 w-full relative mt-2"
    >
      {isInstance && !editeAsMain && (
        <section className="absolute left-0 top-[0] w-full h-full min-h-full backdrop-blur-md z-[50] rounded-lg p-2">
          <section className="sticky top-0 flex flex-col gap-3 items-center p-2 py-3 bg-slate-900 rounded-lg">
            {Icons.info({
              fill: "yellow",
              strokeColor: "yellow",
              width: 30,
              height: 30,
            })}
            <p className="text-center text-slate-200 font-semibold">
              You can’t edite instance , If you wanna to edite so you should
              edite as main
            </p>
            <Button
              onClick={(ev) => {
                setEditeAsMain(true);
              }}
            >
              Edite As Main
            </Button>
          </section>
        </section>
      )}
      {!!motion?.animations?.length ? (
        <>
          <ScrollableToolbar
            className="p-2  flex  justify-between rounded-lg bg-slate-800 sticky top-0 z-[40]"
            space={2}
          >
            {controllerIcons
              .reverse()
              .map(({ icon, methods, tooltipTitle }, index) => {
                return (
                  <button
                    key={index}
                    id={`motion-controller-${index}`}
                    onClick={async (ev) => {
                      addClickClass(
                        ev.currentTarget || ev.target.parentNode,
                        "click"
                      );
                      // console.log('motcheeeeeeeeeee : ' , {
                      //   ...motion,
                      //   isInstance: isInstance,
                      //   id: isInstance ? instanceId : mainId,
                      //   // id:instance
                      // } , methods);

                      runGsapMethod(methods, {
                        ...motion,
                        ...(isInstance
                          ? {
                              isInstance: isInstance,
                              id: instanceId,
                            }
                          : {}),
                        // id:instance
                      });
                    }}
                    className="relative cursor-pointer  p-2 rounded-md bg-slate-900 transition-all hover:bg-blue-600 "
                  >
                    {icon}
                    <Tooltip
                      anchorSelect={`#motion-controller-${index}`}
                      place={isInstance ? "top-end" : "bottom-end"}
                      // position={{x: 0, y: 0}}

                      positionStrategy="fixed"
                      className=" text-slate-200 font-semibold "
                    >
                      {tooltipTitle}
                    </Tooltip>
                  </button>
                );
              })}
          </ScrollableToolbar>
          <section className="relative flex gap-2 p-3 justify-between bg-slate-800 w-full rounded-md">
            {/* <FitTitle className="absolute top-[-50%]  left-0">{isInstance ? 'Instance' : 'Main'}</FitTitle> */}
            <FitTitle className="custom-font-size flex items-center  text-slate-200 ">
              {isInstance ? "Main ID :" : ""} {motion.id}
            </FitTitle>
            <OptionsButton>
              <section className="flex flex-col items-center gap-5">
                <button
                  id="mt-copy"
                  onClick={async (ev) => {
                    addClickClass(ev.currentTarget, "click");
                    await navigator.clipboard.writeText(motion.id);
                    toast.success(
                      <ToastMsgInfo msg={`Motion Id Copied Successfully`} />
                    );
                  }}
                >
                  {Icons.copy({ fill: "white", height: 18 })}
                </button>
                <Tooltip anchorSelect="#mt-copy" opacity={1} place="left-end">
                  Copy
                </Tooltip>

                <button
                  id="mt-delete-motion"
                  onClick={async (ev) => {
                    addClickClass(ev.currentTarget, "click");
                    await deleteMotion(motion.id);
                    editor
                      .getSelected()
                      .removeAttributes([motionId, motionInstanceId]);
                    setMotion(cloneDeep(motionType));
                  }}
                >
                  {Icons.trash("white", undefined, undefined, 18)}
                </button>
                <Tooltip
                  anchorSelect="#mt-delete-motion"
                  opacity={1}
                  place="left-end"
                >
                  Delete All Motion
                </Tooltip>

                <button
                  id="mt-download-motion"
                  onClick={async (ev) => {
                    downloadMotion(motion.id);
                  }}
                >
                  {Icons.export("white", 2, 18, 18)}
                </button>
                <Tooltip
                  anchorSelect="#mt-download-motion"
                  opacity={1}
                  place="left-end"
                >
                  Download Motion
                </Tooltip>
              </section>
            </OptionsButton>
          </section>

          {isInstance && (
            <section className="relative  flex gap-2 p-3 justify-between bg-slate-800 w-full rounded-lg">
              {/* <FitTitle className="absolute top-[-50%]  left-0">{isInstance ? 'Instance' : 'Main'}</FitTitle> */}
              <FitTitle className="custom-font-size flex items-center  text-slate-200 flex-shrink ">
                Instance ID : {instanceId}
              </FitTitle>
              <OptionsButton>
                <section className="flex flex-col items-center gap-5">
                  <button
                    id="mt-copy"
                    onClick={async (ev) => {
                      await copyInstance();
                    }}
                  >
                    {Icons.copy({ fill: "white", height: 18 })}
                  </button>
                  <Tooltip anchorSelect="#mt-copy" opacity={1} place="left-end">
                    Copy Instance ID
                  </Tooltip>

                  <button
                    id="mt-delete-motion"
                    onClick={async (ev) => {
                      await removeInstance();
                    }}
                  >
                    {Icons.trash("white", undefined, undefined, 18)}
                  </button>
                  <Tooltip
                    anchorSelect="#mt-delete-motion"
                    opacity={1}
                    place="left-end"
                  >
                    Delete Instance
                  </Tooltip>
                </section>
              </OptionsButton>
            </section>
          )}
          {/* <SwitcherSection
            title="Use Globally"
            defaultValue={isGlobally}
            onActive={() => setIsGlobally(true)}
            onUnActive={() => {
              setIsGlobally(false);
            }}
          /> */}

          <SwitcherSection
            title="SpliteText"
            defaultValue={motion.isSplitText}
            onActive={() =>
              setTransition(() => setMotion({ ...motion, isSplitText: true }))
            }
            onUnActive={() => {
              runGsapMethod(["revert", "kill"], {
                ...motion,
                ...(isInstance
                  ? {
                      isInstance: isInstance,
                      id: instanceId,
                    }
                  : {}),
                // id:instance
              });
              setTransition(() =>
                setMotion({ ...motion, isSplitText: false, splitText: null })
              );
            }}
          />
          {motion.isSplitText && (
            <>
              <FitTitle>SplitText selector</FitTitle>
              <Input
                value={motion.splitTextSelector || ""}
                placeholder="SplitText selector"
                className="bg-slate-900 border-[#1e293b!important] w-full"
                onInput={(ev) => {
                  setMotion({
                    ...motion,
                    splitTextSelector: ev.target.value,
                  });
                }}
              />
              <SplitText motion={motion} setMotion={setMotion} />
            </>
          )}

          <SwitcherSection
            title="Timeline"
            defaultValue={motion.isTimeLine}
            onActive={() =>
              setTransition(() => setMotion({ ...motion, isTimeLine: true }))
            }
            onUnActive={() => {
              runGsapMethod(["revert", "kill"], {
                ...motion,
                ...(isInstance
                  ? {
                      isInstance: isInstance,
                      id: instanceId,
                    }
                  : {}),
                // id:instance
              });
              setTransition(() =>
                setMotion({ ...motion, isTimeLine: false, timeline: null })
              );
            }}
          />

          {motion.isTimeLine && (
            <Timeline motion={motion} setMotion={setMotion} />
          )}

          <MiniTitle className={"sticky top-0"}>Animations</MiniTitle>
          {motion?.animations?.map?.((animation, index) => {
            return (
              <Adder
                key={index}
                className={`flex flex-col gap-3 p-2 bg-slate-950 rounded-lg minion ${
                  motion.animations.length > 1 && "mb-[30px]"
                }`}
                addClassName="bg-slate-800"
                delClassName="bg-slate-800"
                onAddClick={() => {
                  addAnimation();
                }}
                onDeleteClick={() => {
                  removeAnimation(index);
                }}
              >
                <FromTo
                  motion={motion}
                  setMotion={setMotion}
                  animation={animation}
                  animationIndex={index}
                />
              </Adder>
            );
          })}
        </>
      ) : (
        <section className=" flex flex-col gap-2 items-center justify-center p-2 bg-slate-800 rounded-lg minion">
          <section className="container bg-slate-900 flex flex-col justify-center p-2 items-center rounded-md gap-2 font-semibold">
            <FitTitle className="animate-bounce text-slate-200 font-semibold text-center capitalize">
              No animations yet
            </FitTitle>

            <figure>
              <img src={noData} className="max-h-[150px]" />
            </figure>

            <p className="text-slate-400 text-sm text-center">
              Click the add button to add an animation
            </p>
            <Button
              onClick={() => {
                addAnimation();
              }}
            >
              Add Animation
              {Icons.plus("white")}
            </Button>
            {/* <h1 className="text-slate-400 text-sm text-center">OR</h1> */}
            <p className="text-slate-400 text-sm text-center">Or Select One</p>
            <section className="flex justify-between gap-2   rounded-md">
              <Select
                className="p-[unset] bg-[#1e293b!important]"
                containerClassName="bg-slate-800"
                inputClassName="bg-slate-800"
                placeholder="Select Animation"
                keywords={motionKeys}
                value={selectedElMotionId}
                onAll={(value) => {
                  // selectNewMotion(value);
                  setSelectedElMotionId(value);
                }}
              />
              {/* <SmallButton id="mt-options-btn" className="bg-slate-900">
              {Icons.options({ fill: "white", width: 20, height: 16.5 })}
            </SmallButton>
            <Tooltip
              className="w-fit p-[unset]"
              style={{
                padding: "10px 5px",
              }}
              anchorSelect="#mt-options-btn"
              place="bottom-end"
              clickable
              opacity={1}
              isOpen={showTooltip}
              setIsOpen={setShowTooltip}
              openOnClick
            >
              <section className="flex flex-col gap-3 items-center">
                <button
                  id="mt-clone-btn"
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    cloneMotion(selectedElMotionId);
                  }}
                >
                  {Icons.paste({ fill: "white", height: 18, strokWidth: 0.9 })}{" "}
                </button>
                <Tooltip
                  anchorSelect="#mt-clone-btn"
                  place="left-end"
                  opacity={1}
                >
                  Clone
                </Tooltip>
                <button
                  id="mt-instance-btn"
                  onClick={(ev) => {
                    createInstance(selectedElMotionId);
                  }}
                >
                  {Icons.link({ fill: "white", strokWidth: 2, height: 19 })}{" "}
                </button>
                <Tooltip
                  anchorSelect="#mt-instance-btn"
                  place="left-end"
                  opacity={1}
                >
                  Create Instance
                </Tooltip>
              </section>
            </Tooltip> */}

              <div className="flex-shrink-1">
                <OptionsButton>
                  <section className="flex flex-col gap-3 items-center">
                    <button
                      id="mt-clone-btn"
                      onClick={(ev) => {
                        addClickClass(ev.currentTarget, "click");
                        cloneMotion(selectedElMotionId);
                      }}
                    >
                      {Icons.paste({
                        fill: "white",
                        height: 18,
                        strokWidth: 0.9,
                      })}{" "}
                    </button>
                    <Tooltip
                      anchorSelect="#mt-clone-btn"
                      place="left-end"
                      opacity={1}
                    >
                      Clone
                    </Tooltip>
                    <button
                      id="mt-instance-btn"
                      onClick={(ev) => {
                        createInstance(selectedElMotionId);
                      }}
                    >
                      {Icons.link({
                        fill: "white",
                        strokWidth: 2.4,
                        height: 19,
                      })}{" "}
                    </button>
                    <Tooltip
                      anchorSelect="#mt-instance-btn"
                      place="left-end"
                      opacity={1}
                    >
                      Create Instance
                    </Tooltip>

                    <button
                      id="mt-upload-btn"
                      onClick={(ev) => {
                        addClickClass(ev.currentTarget, "click");
                        console.log('motionUploader' , motionUploader.current);
                        
                        motionUploader.current.click();
                      }}
                    >
                      {Icons.upload({
                        strokeColor: "white",
                        strokWidth: 2.4,
                        width: 18,
                        height: 18,
                      })}{" "}
                    </button>
                    <input
                      ref={motionUploader}
                      type="file"
                      accept=".json"
                      hidden
                      onChange={uploadMotion}
                    />

                    <Tooltip
                      anchorSelect="#mt-upload-btn"
                      place="left-end"
                      opacity={1}
                    >
                      Upload Motion
                    </Tooltip>
                  </section>
                </OptionsButton>
              </div>
            </section>
          </section>
        </section>
      )}
    </section>
  );
});
