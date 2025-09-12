import { getGsapCssProperties } from "../helpers/functions";

export const easeValues = [
  "none",
  "linear",
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
  "power4.in",
  "power4.out",
  "power4.inOut",
  "back.in",
  "back.out",
  "back.inOut",
  "elastic.in",
  "elastic.out",
  "elastic.inOut",
  "bounce.in",
  "bounce.out",
  "bounce.inOut",
  "circ.in",
  "circ.out",
  "circ.inOut",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "sine.in",
  "sine.out",
  "sine.inOut",
  "slowMo",
  "steps",
  "rough",
];

// export function getGsapAnimationOptions() {
//   return {
//     single: [
//       // Core tween properties (no sub-options)
//       "duration",
//       "delay",
//       "repeatDelay",
//       "id",
//       "data",
//       "vars",
//       // 'callbackScope',
//       "totalDuration",

//       // Callback properties (take functions or params, no specific sub-options)
// 'onComplete',
// 'onCompleteParams',
// 'onCompleteScope',
// 'onStart',
// 'onStartParams',
// 'onStartScope',
// 'onUpdate',
// 'onUpdateParams',
// 'onUpdateScope',
// 'onRepeat',
// 'onRepeatParams',
// 'onRepeatScope',
// 'onReverseComplete',
// 'onReverseCompleteParams',
// 'onReverseCompleteScope'
//     ].sort(),

//     multi: {
//       // Core tween properties with specific values
//       ease: easeValues,
//       repeat: [-1, 0, 1, 2], // -1 for infinite, others as examples
//       yoyo: [true, false],
//       yoyoEase: [true, false, "none", ...easeValues], // Can use ease values or boolean
//       immediateRender: [true, false],
//       paused: [true, false],
//       overwrite: [true, false, "auto", "none"],
//       runBackwards: [true, false],
//       inherit: [true, false],
//       timeScale: [0, 0.5, 1, 2], // Example values, can be any number
//       lazy: [true, false],
//       snap: ["auto", "labels"], // Simplified, can also accept object
//       scrub: [true, false, 0, 1, 2], // true/false or number for ScrollTrigger
//       invalidateOnRefresh: [true, false],

//       // Timeline-specific properties
//       autoRemoveChildren: [true, false],
//       smoothChildTiming: [true, false],

//       // Properties with sub-options
//       stagger: [
//         "from",
//         "amount",
//         "each",
//         "grid",
//         "axis",
//         "distribute",
//         // "onCompleteAll",
//         // "onCompleteAllParams",
//         // "onCompleteAllScope",
//       ],
//       motionPath: ["path", "align", "autoRotate", "start", "end"],
//     //   defaults: [
//     //     "duration",
//     //     "ease",
//     //     "delay",
//     //     "repeat",
//     //     "yoyo",
//     //     "stagger",
//     //     "motionPath",
//     //   ],
//       startAt: ["x", "y", "z", "scale", "rotate", "opacity"],
//     },
//   };
// }

export function getGsapAnimationOptions() {
  return {
    // single: [
    //   // Core tween properties (no sub-options)
    //   "duration",
    //   "delay",
    //   "repeatDelay",
    //   "id",
    //   "data",
    //   "vars",
    //   "totalDuration",

    // ].sort(),

    arrayProps: {
      duration: "",
      delay: "",
      repeatDelay: "",
      id: "",
      data: "",
      totalDuration: "",
      ease: easeValues,
      repeat: [-1, 0, 1, 2],
      yoyo: [true, false],
      yoyoEase: [true, false, ...easeValues],
      immediateRender: [true, false],
      paused: [true, false],
      overwrite: [true, false, "auto", "none"],
      runBackwards: [true, false],
      inherit: [true, false],
      timeScale: [0, 0.5, 1, 2],
      lazy: [true, false],
      snap: ["auto", "labels"],
      scrub: [true, false, 0, 1, 2],
      invalidateOnRefresh: [true, false],
      autoRemoveChildren: [true, false],
      smoothChildTiming: [true, false],
    },

    objectProps: {
      stagger: "",
      motionPath: {
        path: ["string", "array", "element"],
        align: ["string", "element", "self"],
        autoRotate: [true, false, "number"],
        start: "number",
        end: "number",
      },
      startAt: {
        _custom: true,
        _type: "choose",
        _keys: getGsapCssProperties(),
      },
      onComplete: "",
      onCompleteParams: "",
      onCompleteScope: "",
      onStart: "",
      onStartParams: "",
      onStartScope: "",
      onUpdate: "",
      onUpdateParams: "",
      onUpdateScope: "",
      onRepeat: "",
      onRepeatParams: "",
      onRepeatScope: "",
      onReverseComplete: "",
      onReverseCompleteParams: "",
      onReverseCompleteScope: "",
      scrollTrigger: {
        trigger: "", // Element or selector string
        start: [
          "top top",
          "top center",
          "top bottom",
          "top 80%",
          "center center",
          "center 50%",
          "bottom top",
          "bottom 20%",
        ], // Common position strings
        end: [
          "bottom top",
          "bottom center",
          "bottom bottom",
          "bottom 20%",
          "center center",
          "center 80%",
          "top bottom",
          "top 10%",
        ], // Common position strings
        endTrigger: "", // Element or selector string
        scrub: [true, false, 0.5, 1, 2], // true, false, or sample lag times (seconds)
        pin: [true, false], // true or false (selector/element handled by trigger)
        pinSpacing: [true, false, 100, 200], // true, false, or sample pixel values
        markers: [true, false], // true or false
        id: "", // String
        once: [true, false], // true or false
        toggleActions: [
          "play",
          "pause",
          "resume",
          "reset",
          "restart",
          "complete",
          "reverse",
          "none",
        ], // Action strings
        anticipatePin: [true, false], // true or false
        snap: [0.1, 0.5, 1], // Sample snap points (0 to 1)
        invalidateOnRefresh: [true, false], // true or false
        immediateRender: [true, false], // true or false
        refreshPriority: [0, 1, -1], // Sample priority numbers
        horizontal: [true, false], // true or false
        fastScrollEnd: [true, false], // true or false
        pinType: ["fixed", "transform", "none"], // fixed, transform, or none
        scroller: "", // Element or selector
        toggleClass: ["active", "is-active"], // Sample class names
        // vars: {}, // Object
        pinReparent: [true, false], // true or false
        pinSpacer: "", // Element or selector
        snapTo: [0.1, 0.5, 1], // Sample snap points
        duration: [0.1, 0.5, 1], // Sample durations (seconds)
        delay: [0, 0.1, 0.5], // Sample delays (seconds)
        ease: easeValues, // GSAP ease strings
        onEnter: "", // Function
        onLeave: "", // Function
        onEnterBack: "", // Function
        onLeaveBack: "", // Function
        onUpdate: "", // Function
        onToggle: "", // Function
        onRefresh: "", // Function
        onRefreshInit: "", // Function
        onSnapComplete: "", // Function
      },
    },
  };
}

export function getGsapTimelineProps() {
  return {
    // --- Timeline global options ---
    delay: '0', // number, seconds before the timeline starts
    paused: 'false', // boolean, whether timeline starts paused
    repeat: '0', // number, how many repeats after first iteration (-1 = infinite)
    repeatDelay: '0', // number, delay between repeats
    yoyo: 'false', // boolean, whether to reverse on every repeat
    smoothChildTiming: 'false', // boolean, whether children reposition to maintain smooth timing
    autoRemoveChildren: 'false', // boolean, remove child tweens/timelines when done
    defaults: {
      duration: "",
      repeat: [-1, 0, 1, 2],
      repeatDelay: "",
      ease: easeValues,
      yoyo: [true, false],
      yoyoEase: [true, false, ...easeValues],
      immediateRender: [true, false],
      overwrite: [true, false, "auto", "none"],
      runBackwards: [true, false],
      inherit: [true, false],
      lazy: [true, false],
      snap: ["auto", "labels"],
    },
    timeScale: '1', // number, speed of timeline (1 = normal)
    // 'data' is optional metadata storage
    // data: null, // any type

    // Callback/event hooks for timeline
    onStart: 'null', // function
    onStartParams: [], // array of args
    onUpdate: null, // function
    onUpdateParams: [], // array of args
    onComplete: null, // function
    onCompleteParams: [], // array of args
    onReverseComplete: null, // function
    onReverseCompleteParams: [], // array of args
    onRepeat: null, // function
    onRepeatParams: [], // array of args
    onInterrupt: null, // function, if supported

    // Identifier for debugging
    id: "", // string identifier

    // --- ScrollTrigger options (to use when you want scroll-driven timeline) ---
    scrollTrigger: {
      ...getGsapAnimationOptions().objectProps.scrollTrigger,
    },
  };
}

export const advancedGsapOptions = {
  scrollTrigger: {
    markers: {
      startColor: ["green", "blue", "red", "#000", "#fff"], // Sample colors for markers
      endColor: ["red", "yellow", "purple", "#000", "#fff"], // Sample colors for markers
      fontSize: ["12px", "14px", "16px"], // Sample CSS units for markers
      fontWeight: ["normal", "bold", "400", "700"], // Sample CSS font-weights for markers
      indent: [20, 50, 100], // Sample pixel values for markers
    },
  },
  stagger: {
    from: ["start", "center", "end", "random", "edges"],
    amount: "number",
    each: "number",
    grid: ["auto", "array"],
    axis: ["x", "y", null],
    distribute: ["function", "number"],
  },
};

export function getGsapScrollTriggerOptions() {
  return {
    single: [
      // Core options (no sub-options)
      "trigger",
      "endTrigger",
      "id",
      // 'onEnter',
      // 'onLeave',
      // 'onEnterBack',
      // 'onLeaveBack',
      // 'onUpdate',
      // 'onToggle',
      // 'onRefresh',
      // 'onRefreshInit',
      // 'onScrubComplete',
      // 'onSnapComplete'
    ].sort(),

    multi: {
      // Options with specific values or sub-options
      start: [
        "top top",
        "top center",
        "top bottom",
        "center center",
        "bottom top",
        "bottom center",
        "bottom bottom",
        "top 30%",
        "center 20%",
        "0px",
        "100px",
        "50%",
      ],
      end: [
        "bottom top",
        "bottom center",
        "bottom bottom",
        "center center",
        "top bottom",
        "top center",
        "top top",
        "bottom 50%+=100px",
        "center 20%",
        "+=500",
        "max",
      ],
      scrub: [true, false, 0, 1, 2, 3],
      pin: [true, false, ".selector", "#id"],
      pinSpacing: [true, false, "margin"],
      markers: [true, false], //,{ startColor: "green", endColor: "red" }
      snap: [0, 0.1, 0.5, 1, "labels", "labelsDirectional"],
      anticipatePin: [0, 1, 2],
      pinReparent: [true, false],
      toggleActions: [
        "play none none none",
        "restart pause reverse reset",
        "play pause resume restart",
        "none play none reverse",
      ],
      //   toggleClass: ["active", { targets: ".selector", className: "active" }],
      fastScrollEnd: [true, false, 500],
      preventOverlaps: [true, false, "groupName"],
      horizontal: [true, false],
      invalidateOnRefresh: [true, false],
      refreshPriority: [0, 1, -1, 10],
    },
  };
}
