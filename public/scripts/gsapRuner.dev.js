/**
 * @type {import('gsap')}
 */
let gsap = window.gsap || window._gsap;
if (!gsap) {
  console.error("GSAP is not loaded");
}
gsap.registerPlugin(ScrollTrigger);

/**
 * @type {{[key:string] : gsap.core.Tween[] | gsap.core.Timeline }}
 */
let gsapTween = {};
/**
 * @type {import('../../src/helpers/types').MotionType}
 */
let previousMotion;

/**
 *
 * @param {import('./types').MotionType} motion
 * @param {Boolean} paused
 * @param {boolean} isInstance
 * @returns
 */
function CompileMotion(
  motion,
  paused = false,
  isInstance = false
  // removeMarkers = true // this is just in bridge.js for final build (production)
) {
  /**
   * @type {{timeline:object , fromTo : {
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
          // if (key == "markers" && removeMarkers) return null;
          if (typeof value === "object") {
            return [key, parseObjValue(value)];
          } else if (key.startsWith("on") && /on[A-Z]/gi.test(key)) {
            return [key, new Function(`return (()=>{${value}})`)()];
          }
          return [
            key,
            typeof value === "string"
              ? value.replaceAll?.(
                  "self",
                  attribute
                )
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
      selector: selector.replaceAll(
        "self",
        attribute
      ),
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
 */
function CreateGsap(motion, paused = false) {
  const { fromTo, timeline } = CompileMotion(motion, paused);
  console.log("from copiled motions : ", fromTo, timeline);

  if (Object.keys(timeline).length > 0) {
    const tl = gsap.timeline(timeline);
    fromTo.forEach((item) => {
      const { selector, fromValue, toValue, positionParameter } = item;
      tl.fromTo(selector, fromValue, toValue, positionParameter);
    });

    timeline.name && (window[timeline.name] = tl);
    return tl;
  } else if (!Object.keys(timeline).length && fromTo.length) {
    return fromTo.map((item) => {
      const { selector, fromValue, toValue } = item;
      const tween = gsap.fromTo(selector, fromValue, toValue);
      item.name && (window[item.name] = tween);
      return tween;
    });
  } else {
    return null;
  }
}

window.parent.addEventListener("gsap:run", (ev) => {
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
    if (Array.isArray(gsapTween[motion.id])) {
      gsapTween[motion.id].forEach((tween) => {
        tween.kill(true);
        tween.revert();
        ScrollTrigger.refresh();
      });
    } else if (gsapTween[motion.id] && motion.isTimeLine) {
      gsapTween[motion.id].getChildren().forEach((child) => {
        if (child.scrollTrigger) {
          child.scrollTrigger.revert(); // Kill inner scrollTrigger
          //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
        }
      });
      gsapTween[motion.id].revert(); // Kill the timeline
      gsapTween[motion.id].kill(true); // Kill the timeline
      console.log(gsapTween, gsapTween[motion.id]);
      ScrollTrigger.refresh();
    } else if (gsapTween[motion.id] && !motion.isTimeLine) {
      gsapTween[motion.id].kill(true);
      gsapTween[motion.id].revert();
      ScrollTrigger.refresh();
    }
    gsapTween[motion.id] = null;
    console.log("From gsap runner ", motion.id, "killed");
  } else {
    console.log(
      previousMotion == JSON.stringify(motion),
      previousMotion,
      JSON.stringify(motion)
    );

    if (previousMotion != JSON.stringify(motion)) {
      if (Array.isArray(gsapTween[motion.id])) {
        gsapTween[motion.id].forEach((tween) => {
          tween.kill(true);
          tween.revert();
          ScrollTrigger.refresh();
        });
      } else if (gsapTween[motion.id] && motion.isTimeLine) {
        gsapTween[motion.id].getChildren().forEach((child) => {
          if (child.scrollTrigger) {
            child.scrollTrigger.revert(); // Kill inner scrollTrigger
            //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
          }
        });
        gsapTween[motion.id].revert(); // Kill the timeline
        gsapTween[motion.id].kill(true); // Kill the timeline
        console.log(gsapTween, gsapTween[motion.id]);
        ScrollTrigger.refresh();
      } else if (gsapTween[motion.id] && !motion.isTimeLine) {
        gsapTween[motion.id].kill(true);
        gsapTween[motion.id].revert();
        ScrollTrigger.refresh();
      }
      // console.log('Motion changed', motion , CompileMotion(motion) );

      gsapTween[motion.id] = null;
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
        // previousMotion = null;
      }
    }
  }
  previousMotion = JSON.stringify(motion);
});

window.parent.addEventListener("gsap:all:run", (ev) => {
  /**
   * @type {{motions:{[key:string]:import('../../src/helpers/types').MotionType}}}
   */
  const { motions, methods, props } = ev.detail;

  Object.values(motions).forEach((motion) => {
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
  });
});

window.parent.addEventListener("gsap:all:kill", (ev) => {
  /**
   * @type {{motions:{[key:string]:import('../../src/helpers/types').MotionType}}}
   */
  const { motions } = ev.detail;
  Object.values(motions).forEach((motion) => {
    if (!gsapTween[motion.id]) return;
    if (Array.isArray(gsapTween[motion.id])) {
      gsapTween[motion.id].forEach((tween) => {
        tween.revert();
        tween.kill(true);
        ScrollTrigger.refresh();
      });
    } else if (gsapTween[motion.id] && motion.isTimeLine) {
      gsapTween[motion.id].getChildren().forEach((child) => {
        if (child.scrollTrigger) {
          child.scrollTrigger.revert(); // Kill inner scrollTrigger
          //child.scrollTrigger.kill(true); // Kill inner scrollTrigger
        }
      });
      gsapTween[motion.id].revert(); // Kill the timeline
      gsapTween[motion.id].kill(true); // Kill the timeline
      console.log(gsapTween, gsapTween[motion.id]);
      ScrollTrigger.refresh();
    } else if (gsapTween[motion.id] && !motion.isTimeLine) {
      gsapTween[motion.id].kill(true);
      gsapTween[motion.id].revert();
      ScrollTrigger.refresh();
    }
    delete gsapTween[motion.id] 
    const instanceMotions = {};

    Object.entries(motion.instances || {}).forEach(([id, instace]) => {
      instanceMotions[id] = { ...motion, id, isInstance: true, instances: {} };
    });

    window.parent.dispatchEvent(
      new CustomEvent("gsap:all:kill", { detail: { motions: instanceMotions } })
    );
  });
});
