/**
 * @type {import('gsap')}
 */
let gsap = window.gsap || window._gsap;
if (!gsap) {
  console.error("GSAP is not loaded");
}
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

/**
 * @type {{[key:string] : gsap.core.Tween[] | gsap.core.Timeline }}
 */
let gsapTween = {};

/**
 * @type {{[key:string] : SplitText[] | SplitText }}
 */
let gsapSplitTexts = {};
/**
 * @type {import('../../src/helpers/types').MotionType}
 */
let previousMotion;

window.gsapRunner = true;

const isFunction = (value) => {
  try {
    const isFunction = typeof new Function(`return (${value})`) == "function";
    return isFunction;
  } catch (error) {
    return false;
  }
};

/**
 *
 * @param {import('../../src/helpers/types').MotionType} motion
 * @param {Boolean} paused
 * @param {boolean} isInstance
 * @returns
 */
function CompileMotion(
  motion,
  paused = false,
  isInstance = false,
  removeMarkers = true // this is just in bridge.js for final build (production)
) {
  /**
   * @type {{
   * timeline:object ,
   * splitText:SplitText.Vars,
   *  fromTo : {
   * selector:string,
   * fromValue:CSSStyleDeclaration,
   * toValue:CSSStyleDeclaration,
   * positionParameter:string,
   * name:string | undefined
   * }[]
   * }}
   */
  const output = {
    timeline: {},
    fromTo: [],
  };
  const attribute = `[${
    motion?.isInstance ? `motion-instance-id` : `motion-id`
  }=${motion.id}]`;

  const parseObjValue = (obj = {}) => {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => {
          console.log("key : ", key);

          if (
            !(typeof window !== "undefined" ? window : self).gsapRunner &&
            key == "markers" &&
            removeMarkers
          )
            return null;
          if (typeof value === "object" && !Array.isArray(value)) {
            return [key, parseObjValue(value)];
          } else if (
            key.startsWith("on") &&
            /on[A-Z]/gi.test(key) &&
            !key.toLocaleLowerCase().endsWith("params")
          ) {
            const isFn = isFunction(value);
            value =
              typeof value === "string"
                ? value.replaceAll?.("self", attribute)
                : value;

            return [
              key,
              isFn
                ? new Function(`return (${value}) `)()
                : new Function(`return (()=>{${value}})`)(),
            ];
          }
          return [
            key,
            typeof value === "string"
              ? value.replaceAll?.("self", attribute)
              : value,
          ];
        })
        .filter(Boolean)
    );
  };

  if (motion.isTimeLine) {
    output.timeline = {
      // ...parseObjValue(motion.timeLineSingleOptions),
      // ...parseObjValue(motion.timeLineMultiOptions),
      ...parseObjValue(motion?.timeline || {}),
      paused,
    };
    if (motion.isTimelineHasScrollTrigger) {
      output.timeline.scrollTrigger = {
        // ...parseObjValue(motion.timelineScrollTriggerOptions.singleOptions),
        // ...parseObjValue(motion.timelineScrollTriggerOptions.multiOptions),
        // ...parseObjValue(motion?.timelineScrollTriggerOptions || {}),
      };
    }
    motion.timeLineName && (output.timeline.name = motion.timeLineName);
  }

  if (motion.isSplitText) {
    output.splitText = parseObjValue(motion.splitText);
  }

  motion.animations.forEach((animation) => {
    const { selector, positionParameter, name } = animation;
    let fromValue = {
      ...animation.from,
    };

    let toValue = {
      ...animation.to,
    };

    if (animation.fromOptions) {
      fromValue = {
        ...fromValue,
        ...parseObjValue(animation.fromOptions),
        paused,
      };
    }

    if (animation.toOptions) {
      toValue = {
        ...toValue,
        ...parseObjValue(animation.toOptions),
        paused,
      };
    }
    output.fromTo.push({
      selector: selector.replaceAll("self", attribute),
      fromValue,
      toValue,
      positionParameter,

      name,
      //   options,
    });
  });
  return output;
}

/**
 *
 * @param {import('../../src/helpers/types').MotionType} motion
 * @param {SplitText.Vars} tweens
 */
function createSplitText(motion, splitTextVars) {
  const attribute = `[${
    motion?.isInstance ? `motion-instance-id` : `motion-id`
  }=${motion.id}]`;

  const split = new SplitText(
    motion.splitTextSelector.replaceAll("self", attribute),
    splitTextVars
  );

  return split;
}

/**
 *
 * @param {import('../../src/helpers/types').MotionType} motion
 */
function killAndRevert(motion, isSingle = true) {
  if (!(motion && motion.id)) throw new Error(`No motion id founded`);
  const killer = (obj) => {
    if (Array.isArray(gsapTween[motion.id])) {
      obj[motion.id].forEach((tween) => {
        tween.kill && tween.kill(true);
        tween.revert && tween.revert();
        isSingle && ScrollTrigger.refresh();
      });
    } else if (obj[motion.id] && motion.isTimeLine) {
      obj[motion.id].getChildren().forEach((child) => {
        if (child.scrollTrigger) {
          child?.scrollTrigger && child.scrollTrigger.revert(); // Kill inner scrollTrigger
          //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
        }
      });
      obj[motion.id]?.revert && obj[motion.id].revert(); // Kill the timeline
      obj[motion.id]?.kill && obj[motion.id].kill(true); // Kill the timeline
      console.log(obj, obj[motion.id]);
      isSingle && ScrollTrigger.refresh();
    } else if (obj[motion.id] && !motion.isTimeLine) {
      obj[motion.id]?.kill && obj[motion.id].kill(true);
      obj[motion.id]?.revert && obj[motion.id].revert();
      isSingle && ScrollTrigger.refresh();
    }
    delete obj[motion.id];
    console.log("From gsap runner ", motion.id, "killed");
  };

  killer(gsapTween);
  killer(gsapSplitTexts);
}

/**
 *
 * @param {import('../../src/helpers/types').MotionType} motion
 * @param {Boolean} paused
 * @param {SplitText} split
 */
function CreateGsap(motion, paused = false) {
  const { fromTo, timeline, splitText } = CompileMotion(motion, paused);
  console.log("from copiled motions : ", fromTo, timeline);
  console.log("from copiled motions splitText : ", splitText);

  const splitKeys = ["chars", "lines", "words"];
  const split = motion.isSplitText ? createSplitText(motion, splitText) : null;

  const setSelector = (selector = "") => {
    let splitTarget;
    const cond =
      motion.isSplitText &&
      split &&
      splitKeys.some((key) => {
        const cond = key.toLowerCase() == selector.toLowerCase();
        splitTarget = key;
        return cond;
      });
    console.log("splitTarget", splitTarget, split);

    return cond ? split[splitTarget] : selector;
  };

  motion.isSplitText && (gsapSplitTexts[motion.id] = split);

  if (Object.keys(timeline).length > 0) {
    const tl = gsap.timeline(timeline);
    fromTo.forEach((item) => {
      const { selector, fromValue, toValue, positionParameter } = item;
      if (!document.querySelectorAll(selector).length) {
        // console.warn('A7a mafesh elements hena');
        console.warn(
          `Infinitely : No element with this selector : ${selector} founded`
        );

        // return;
      }
      tl.fromTo(setSelector(selector), fromValue, toValue, positionParameter);
    });

    timeline.name && (window[timeline.name] = tl);
    return tl;
  } else if (!Object.keys(timeline).length && fromTo.length) {
    return fromTo.map((item) => {
      const { selector, fromValue, toValue } = item;
      if (!document.querySelectorAll(selector).length) {
        // console.warn('A7a mafesh elements hena');
        console.warn(
          `Infinitely : No element with this selector : ${selector} founded`
        );

        // return;
      }
      const tween = gsap.fromTo(setSelector(selector), fromValue, toValue);
      item.name && (window[item.name] = tween);
      return tween;
    });
  } else {
    return null;
  }
}

function gsapRun(ev) {
  /**
   * @type {{methods :  string[] , motion:import('../../src/helpers/types').MotionType}}
   */
  const { methods, motion, props } = ev.detail;
  console.log("Before InIt : ", { methods, motion, props });

  if (
    !gsapTween[motion.id] &&
    !(methods.includes("kill") || methods.includes("revert"))
  ) {
    console.log("Init Gsap Tweens");

    gsapTween[motion.id] = CreateGsap(motion);
  } else if (
    gsapTween[motion.id] &&
    (methods.includes("kill") || methods.includes("revert"))
  ) {
    killAndRevert(motion);
    // if (Array.isArray(gsapTween[motion.id])) {
    //   gsapTween[motion.id].forEach((tween) => {
    //     tween.kill(true);
    //     tween.revert();
    //     ScrollTrigger.refresh();
    //   });
    // } else if (gsapTween[motion.id] && motion.isTimeLine) {
    //   gsapTween[motion.id].getChildren().forEach((child) => {
    //     if (child.scrollTrigger) {
    //       child.scrollTrigger.revert(); // Kill inner scrollTrigger
    //       //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
    //     }
    //   });
    //   gsapTween[motion.id].revert(); // Kill the timeline
    //   gsapTween[motion.id].kill(true); // Kill the timeline
    //   console.log(gsapTween, gsapTween[motion.id]);
    //   ScrollTrigger.refresh();
    // } else if (gsapTween[motion.id] && !motion.isTimeLine) {
    //   gsapTween[motion.id].kill(true);
    //   gsapTween[motion.id].revert();
    //   ScrollTrigger.refresh();
    // }
    // gsapTween[motion.id] = null;
    // console.log("From gsap runner ", motion.id, "killed");
  } else {
    console.log(
      previousMotion == JSON.stringify(motion),
      previousMotion,
      JSON.stringify(motion)
    );

    if (previousMotion != JSON.stringify(motion)) {
      killAndRevert(motion);
      // if (Array.isArray(gsapTween[motion.id])) {
      //   gsapTween[motion.id].forEach((tween) => {
      //     tween.kill(true);
      //     tween.revert();
      //     ScrollTrigger.refresh();
      //   });
      // } else if (gsapTween[motion.id] && motion.isTimeLine) {
      //   gsapTween[motion.id].getChildren().forEach((child) => {
      //     if (child.scrollTrigger) {
      //       child.scrollTrigger.revert(); // Kill inner scrollTrigger
      //       //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
      //     }
      //   });
      //   gsapTween[motion.id].revert(); // Kill the timeline
      //   gsapTween[motion.id].kill(true); // Kill the timeline
      //   console.log(gsapTween, gsapTween[motion.id]);
      //   ScrollTrigger.refresh();
      // } else if (gsapTween[motion.id] && !motion.isTimeLine) {
      //   gsapTween[motion.id].kill(true);
      //   gsapTween[motion.id].revert();
      //   ScrollTrigger.refresh();
      // }
      // // console.log('Motion changed', motion , CompileMotion(motion) );

      // gsapTween[motion.id] = null;
      previousMotion = JSON.stringify(motion);
      window.parent.dispatchEvent(
        new CustomEvent("gsap:run", {
          detail: {
            motion,
            methods,
            props,
          },
        })
      );
      return;
    }

    // previousMotion = JSON.stringify(motion);

    if (methods && methods.length) {
      let isIncluedsKillOrRevert = false;
      methods.forEach((method) => {
        if (Array.isArray(gsapTween[motion.id])) {
          console.log("tweens : ", gsapTween[motion.id]);

          gsapTween[motion.id].forEach((tween) => {
            tween[method](...props);
          });
        } else if (gsapTween[motion.id] && motion.isTimeLine) {
          gsapTween[motion.id].getChildren().forEach((child) => {
            if (child.scrollTrigger) {
              child[method](...props);
            }
          });
          gsapTween[motion.id][method](...props);
        } else if (gsapTween[motion.id]) {
          gsapTween[motion.id][method](...props);
        }
        console.log("tween or timeline:", gsapTween[motion.id]);

        (method.includes("kill") || method.includes("revert")) &&
          (isIncluedsKillOrRevert = true) &&
          ScrollTrigger.refresh();
      });

      if (isIncluedsKillOrRevert) {
        console.log("Killed");

        gsapTween[motion.id] = null;
        gsapSplitTexts[motion.id] = null;
        // previousMotion = null;
      }
    }
  }
  previousMotion = JSON.stringify(motion);
}

function gsapRunAll(ev) {
  /**
   * @type {{motions:{[key:string]:import('../../src/helpers/types').MotionType}}}
   */
  const { motions, methods, props } = ev.detail;

  let index = 0;
  const values = Object.values(motions);
  const handler = () => {
    if (index >= values.length) return;
    const motion = values[index];
    window.parent.dispatchEvent(
      new CustomEvent("gsap:run", {
        detail: {
          motion,
          methods,
          props,
        },
      })
    );

    const instanceMotions = {};

    Object.entries(motion.instances || {}).forEach(([id, instance]) => {
      instanceMotions[id] = { ...motion, id, isInstance: true, instances: {} };
    });

    window.parent.dispatchEvent(
      new CustomEvent("gsap:all:run", {
        detail: { motions: instanceMotions, methods, props },
      })
    );

    index++;
    setTimeout(() => {
      handler();
    }, 10);
  };

  handler();

  // Object.values(motions).forEach((motion) => {
  //   window.parent.dispatchEvent(
  //     new CustomEvent("gsap:run", {
  //       detail: {
  //         motion,
  //         methods,
  //         props,
  //       },
  //     })
  //   );

  //   const instanceMotions = {};

  //   Object.entries(motion.instances || {}).forEach(([id, instance]) => {
  //     instanceMotions[id] = { ...motion, id, isInstance: true, instances: {} };
  //   });

  //   window.parent.dispatchEvent(
  //     new CustomEvent("gsap:all:run", {
  //       detail: { motions: instanceMotions, methods, props },
  //     })
  //   );
  // });
}

function gsapKillAll(ev) {
  /**
   * @type {{motions:{[key:string]:import('../../src/helpers/types').MotionType}}}
   */
  const { motions } = ev.detail;
  const values = Object.values(motions);

  let index = 0;
  const handler = () => {
    if (index >= values.length) {
      ScrollTrigger.refresh(true);
      return;
    }
    let motion = values[index];
    console.log("motion killing - 1 : ", motion.id, motion);
    // if (!gsapTween[motion.id]) return;
    console.log("motion killing - 2 : ", motion.id, motion);

    gsapTween[motion.id] && killAndRevert(motion, false);
    // if (Array.isArray(gsapTween[motion.id])) {
    //   gsapTween[motion.id].forEach((tween) => {
    //     tween.revert();
    //     tween.kill(true);
    //     ScrollTrigger.refresh();
    //   });
    // } else if (gsapTween[motion.id] && motion.isTimeLine) {
    //   gsapTween[motion.id].getChildren().forEach((child) => {
    //     if (child.scrollTrigger) {
    //       child.scrollTrigger.revert(); // Kill inner scrollTrigger
    //       //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
    //     }
    //   });
    //   gsapTween[motion.id].revert(); // Kill the timeline
    //   gsapTween[motion.id].kill(true); // Kill the timeline
    //   console.log(gsapTween, gsapTween[motion.id]);
    //   ScrollTrigger.refresh();
    // } else if (gsapTween[motion.id] && !motion.isTimeLine) {
    //   gsapTween[motion.id].kill(true);
    //   gsapTween[motion.id].revert();
    //   ScrollTrigger.refresh();
    // }
    // delete gsapTween[motion.id];
    const instanceMotions = {};

    Object.entries(motion.instances || {}).forEach(([id, instace]) => {
      instanceMotions[id] = { ...motion, id, isInstance: true, instances: {} };
    });

    window.parent.dispatchEvent(
      new CustomEvent("gsap:all:kill", { detail: { motions: instanceMotions } })
    );

    index++;
    setTimeout(() => {
      handler();
    }, 10);
  };
  handler();
  // Object.values(motions).forEach((motion) => {
  //   console.log("motion killing - 1 : ", motion.id, motion);
  //   // if (!gsapTween[motion.id]) return;
  //   console.log("motion killing - 2 : ", motion.id, motion);

  //   gsapTween[motion.id] && killAndRevert(motion);
  //   // if (Array.isArray(gsapTween[motion.id])) {
  //   //   gsapTween[motion.id].forEach((tween) => {
  //   //     tween.revert();
  //   //     tween.kill(true);
  //   //     ScrollTrigger.refresh();
  //   //   });
  //   // } else if (gsapTween[motion.id] && motion.isTimeLine) {
  //   //   gsapTween[motion.id].getChildren().forEach((child) => {
  //   //     if (child.scrollTrigger) {
  //   //       child.scrollTrigger.revert(); // Kill inner scrollTrigger
  //   //       //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
  //   //     }
  //   //   });
  //   //   gsapTween[motion.id].revert(); // Kill the timeline
  //   //   gsapTween[motion.id].kill(true); // Kill the timeline
  //   //   console.log(gsapTween, gsapTween[motion.id]);
  //   //   ScrollTrigger.refresh();
  //   // } else if (gsapTween[motion.id] && !motion.isTimeLine) {
  //   //   gsapTween[motion.id].kill(true);
  //   //   gsapTween[motion.id].revert();
  //   //   ScrollTrigger.refresh();
  //   // }
  //   // delete gsapTween[motion.id];
  //   const instanceMotions = {};

  //   Object.entries(motion.instances || {}).forEach(([id, instace]) => {
  //     instanceMotions[id] = { ...motion, id, isInstance: true, instances: {} };
  //   });

  //   window.parent.dispatchEvent(
  //     new CustomEvent("gsap:all:kill", { detail: { motions: instanceMotions } })
  //   );
  // });
}

window.parent.addEventListener("gsap:run", gsapRun);

window.parent.addEventListener("gsap:all:run", gsapRunAll);

window.parent.addEventListener("gsap:all:kill", gsapKillAll);

function clearScript(ev) {
  window.parent.removeEventListener("gsap:run", gsapRun);

  window.parent.removeEventListener("gsap:all:run", gsapRunAll);

  window.parent.removeEventListener("gsap:all:kill", gsapKillAll);

  gsap = null;
  gsapTween = null;
  gsapSplitTexts = null;
  previousMotion = null;

  console.log("script cleared from gsapRuner.dev.js");

  window.parent.removeEventListener("gsap:all:kill", clearScript);
}

window.parent.addEventListener("clear:script", clearScript);
