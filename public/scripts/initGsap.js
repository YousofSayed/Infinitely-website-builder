gsap.registerPlugin(ScrollTrigger);


// gsap.fromTo(
//   `[motion-id="mtMjgyNQ1"] img`,
//   {
//     ...new Function(`return ({
//       "opacity": ".2",
//       "paused": false // Removed trailing comma
//     })`)(),
//   },
//   {
//     ...new Function(`return ({
//       "opacity": "1",
//       "duration": 2,
//       "ease": "power1.in",
//       "scrollTrigger": {
//         "trigger": "[motion-id=\"mtMjgyNQ1\"] img",
//         "start": "-+100 50%",
//         "end": "570 bottom",
//         "scrub": true,
//         "toggleActions": "play",
//         "anticipatePin": 0,
//         "markers": true
//       },
//       "paused": false
//     })`)(),
//   }
// );