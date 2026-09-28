// (() => {
//   const script = document.currentScript;

//   const source =
//     script?.src
//       ? new URL(script.src).searchParams.get("source") || "preview"
//       : "preview";

//   const methods = ["log", "info", "warn", "error", "debug"];

//   const LOGGER_FILE = "/scripts/iframeLogs.js";

//   function serialize(value, seen = new WeakSet()) {
//     if (value === undefined) {
//       return {
//         type: "undefined",
//         value: "undefined",
//       };
//     }

//     if (value === null) {
//       return {
//         type: "null",
//         value: null,
//       };
//     }

//     if (typeof value === "string") {
//       return {
//         type: "string",
//         value,
//       };
//     }

//     if (typeof value === "number") {
//       return {
//         type: "number",
//         value,
//       };
//     }

//     if (typeof value === "boolean") {
//       return {
//         type: "boolean",
//         value,
//       };
//     }

//     if (typeof value === "bigint") {
//       return {
//         type: "bigint",
//         value: `${value}n`,
//       };
//     }

//     if (typeof value === "function") {
//       return {
//         type: "function",
//         value: value.name || "anonymous",
//       };
//     }

//     if (value instanceof Error) {
//       return {
//         type: "error",
//         value: {
//           name: value.name,
//           message: value.message,
//           stack: value.stack,
//         },
//       };
//     }

//     if (value instanceof HTMLElement) {
//       return {
//         type: "element",
//         value: value.outerHTML,
//         tagName: value.tagName.toLowerCase(),
//       };
//     }

//     if (value instanceof Node) {
//       return {
//         type: "node",
//         value: value.nodeName,
//       };
//     }

//     if (value instanceof Date) {
//       return {
//         type: "date",
//         value: value.toISOString(),
//       };
//     }

//     if (value instanceof RegExp) {
//       return {
//         type: "regexp",
//         value: value.toString(),
//       };
//     }

//     if (Array.isArray(value)) {
//       return {
//         type: "array",
//         value: value.map((item) => serialize(item, seen)),
//       };
//     }

//     if (typeof value === "object") {
//       if (seen.has(value)) {
//         return {
//           type: "circular",
//           value: "[Circular]",
//         };
//       }

//       seen.add(value);

//       const result = {};

//       for (const key of Object.keys(value)) {
//         try {
//           result[key] = serialize(value[key], seen);
//         } catch {
//           result[key] = {
//             type: "unserializable",
//             value: "[Unserializable]",
//           };
//         }
//       }

//       return {
//         type: "object",
//         value: result,
//       };
//     }

//     return {
//       type: typeof value,
//       value: String(value),
//     };
//   }

//   function serializeArgs(args) {
//     return args.map((arg) => serialize(arg));
//   }

//   function getCallerLocation() {
//     const stack = new Error().stack;

//     if (!stack) return null;

//     const lines = stack.split("\n");

//     for (const line of lines) {
//       if (line.includes(LOGGER_FILE)) {
//         continue;
//       }

//       const match = line.match(
//         /^\s*at\s+(.*?)\s+\((.*)\)$|^\s*at\s+(.*)$/
//       );

//       if (!match) continue;

//       const functionName = match[1] || null;
//       const location = match[2] || match[3];

//       if (location.includes(LOGGER_FILE)) {
//         continue;
//       }

//       const position = location.match(/:(\d+):(\d+)$/);

//       if (!position) continue;

//       return {
//         functionName,
//         url: location.slice(0, position.index),
//         line: Number(position[1]),
//         column: Number(position[2]),
//         raw: line.trim(),
//       };
//     }

//     return null;
//   }

//   methods.forEach((method) => {
//     const original = console[method];

//     console[method] = function (...args) {
//       const location = getCallerLocation();

//       window.parent.postMessage(
//         {
//           type: "infinitely-console",
//           level: method,
//           className: `Infinitely.${method}`,
//           args: serializeArgs(args),
//           source,
//           timestamp: Date.now(),
//           location,
//         },
//         "*"
//       );

//       original.apply(this, args);
//     };
//   });
// })();