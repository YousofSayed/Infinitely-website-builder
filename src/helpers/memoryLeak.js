// (async function () {
//   let reference = {};
//   let isLeaking;

//   const detector = new LeakDetector(reference, {
//     shouldGenerateV8HeapSnapshot: true,
//   });

//   // Reference is held in memory.
//   isLeaking = await detector.isLeaking();
//   console.log(isLeaking); // true

//   // We destroy the only reference to the object.
//   reference = null;

//   // Reference is gone.
//   isLeaking = await detector.isLeaking();
//   console.log(isLeaking); // false
// })();