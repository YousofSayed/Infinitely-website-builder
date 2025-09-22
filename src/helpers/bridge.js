import parseObjectLiteral from "object-literal-parse";
import { parse as parseCss, stringify as stringifyCss } from "css";
import { cloneDeep, isArray, isPlainObject, random, uniqueId } from "lodash";
import serializeJavascript from "serialize-javascript";
import {
  interactionId,
  interactionInstanceId,
  mainMotionId,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  MAX_UPLOAD_SIZE,
  motionId,
  motionInstanceId,
  preivewScripts,
} from "../constants/shared";
import { db } from "./db";
import { opfs } from "./initOpfs";
import { buildProject } from "./exportProject";
import { tmp } from "../constants/RestAPIEndpoints";

export const html = String.raw;
export const css = String.raw;

export function doDocument(content = "") {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @param {import('grapesjs').Component} cmp
 */
export function getAlpineContext(editor, cmp) {
  const wrapper = editor.getWrapper();
  console.log("cmp : ", cmp);

  function getElementType(selectorOrElement) {
    // Get the element (handle both selector string and element)
    const element =
      typeof selectorOrElement === "string"
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;

    if (!element || !(element instanceof HTMLElement)) {
      return "Element not found or not an HTMLElement";
    }

    // Return the constructor name (e.g., HTMLBodyElement, HTMLDivElement)
    return element.constructor.name;
  }
  // const wrapperAttributes = Object.fromEntries(
  //   Object.entries(wrapper.getAttributes()).filter(([key, value]) =>
  //     key.startsWith(`x-`)
  //   )
  // );
  const cmpAttributes = cmp.getAttributes();
  const parents = cmp.parents();
  const parentsAttributes = parents.map((parent) => parent.getAttributes());
  const allAttributes = [cmpAttributes, ...parentsAttributes];
  let context = ``;

  //extract x-data scope :
  const xDataScope = allAttributes
    .map((attrs) => attrs["v-scope"])
    .filter(Boolean);
  let dataWillContenx = [];
  for (const scope of xDataScope) {
    dataWillContenx.push(...transformDataToVars(scope));
  }
  dataWillContenx = [...new Set(dataWillContenx.reverse())]
    .reverse()
    .join("\n");

  //extract x-for scope :
  const xForScope = allAttributes
    .map((attrs) => attrs["v-for"])
    .filter(Boolean);
  let forWillContenx = [];
  for (const scope of xForScope) {
    const parsedFor = parseForDirective(scope);
    if (!parsedFor) continue;
    console.log("scope : ", scope, parsedFor);

    const context =
      parsedFor?.varName && parsedFor?.array
        ? `
     ${parsedFor.index ? `var ${parsedFor.index} : number;` : ""}
    var ${parsedFor.varName} = ${parsedFor.array}[0];
    `
        : "";
    forWillContenx.push(context.trim());
  }
  forWillContenx = [...new Set(forWillContenx.reverse())].reverse().join("\n");

  //extract v-ref scope :
  const vRefScope = editor.getWrapper().find(`[v-ref]`);
  let refWillContenx = ``;
  for (let cmp of vRefScope) {
    const elType = getElementType(cmp.getEl());
    refWillContenx += `var $${cmp.getAttributes()["v-ref"]} : ${elType};`;
  }

  return `
 ${dataWillContenx || ""}

 ${forWillContenx || ""}

 ${refWillContenx || ""}

 `;
  //  ${refWillContenx || ""}
}

/**
 *
 * @param {import('grapesjs').Component} cmp
 * @param {string} directive
 */
export function getDirectiveContext(
  attributes,
  directive,
  getTheSameOne = false
) {
  if (!attributes) return {};
  // const attributes = cmp.getAttributes();
  const context = Object.fromEntries(
    Object.entries(attributes)
      .filter(([key, value]) => {
        return getTheSameOne
          ? key.toLowerCase() == directive.toLowerCase()
          : key.startsWith(directive);
      })
      .map(([key, value]) => {
        const oldValue = value || "";
        const newValue = {
          value,
          suffixes: key
            ?.match?.(/\:\w+/gi)
            ?.map?.((modifire) => modifire.replace(":", "")),
          modifires: key
            ?.match?.(/\.\w+/gi)
            ?.map?.((modifire) => modifire.replace(".", "")),
        };
        return [key, newValue];
      })
  );
  return context;
}

export function doStringObject(object = {}) {
  let stringObj = `{ `;
  const entries = Object.entries(JSON.parse(JSON.stringify(object)));
  entries.forEach(([key, value], i) => {
    stringObj += `${key} : ${value} ${i != entries.length - 1 ? "," : ""} ${
      i == entries.length - 1 ? "}" : ""
    }`;
  });
  console.log(JSON.stringify(object));
  console.log(JSON.parse(JSON.stringify(object)));

  return stringObj;
}

export function objectToString(obj, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel); // Two spaces per level

  // Handle null or undefined
  if (obj === null) return "null";
  if (obj === undefined) return "undefined";

  // Handle functions
  if (typeof obj === "function") {
    const funcStr = obj.toString();
    // Split function into lines and indent body
    const lines = funcStr.split("\n");
    const indentedLines = lines
      .map(
        (line, i) => (i === 0 ? line : `${indent}  ${line.trim()}`) // Indent body lines
      )
      .join("\n");
    return indentedLines;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj
      .map((item) => `${indent}  ${objectToString(item, indentLevel + 1)}`)
      .join(",\n");
    return `[\n${items}\n${indent}]`;
  }

  // Handle objects
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    const props = entries
      .map(([key, value]) => {
        const valueStr = objectToString(value, indentLevel + 1);
        return `${indent}  ${key}: ${valueStr}`;
      })
      .join(",\n");
    return `{\n${props},\n${indent}}`;
  }

  // Handle primitives (strings, numbers, booleans)
  if (typeof obj === "string") return `"${obj}"`;
  return String(obj); // Numbers, booleans, etc.
}

export function parseForDirective(xForDirective = "") {
  console.log("xForDirective : ", xForDirective);

  const rgxWithIndex = /\((\s+)?\w+(\s+)?,(\s+)?\w+(\s+)?\)(\s+)?in(\s+)?\w+/gi;
  const rgxWithoutIndex = /(\s+)?\w+(\s+)?in(\s+)?\w+/gi;
  if (xForDirective.match(rgxWithIndex)?.length) {
    const firstPart = xForDirective
      .match(/\(.+\)/gi)
      .join("")
      .replaceAll(/\(|\)/gi, "")
      .split(",");
    const secondPart = xForDirective
      .split(/\(.+\)/gi)
      .join("")
      .replace(/(\s+)in(\s+)/gi, "");
    return {
      varName: firstPart[0].trim(),
      index: firstPart[1].trim(),
      array: secondPart.trim(),
    };
  } else if (xForDirective.match(rgxWithoutIndex)?.length) {
    const part = xForDirective.split(/\s|\s+/gi);
    console.log(part);
    return {
      varName: part[0].trim(),
      array: part[part.length - 1].trim(),
    };
  } else {
    return null;
  }
}

// console.log(
//   parseForDirective(`(post , i) in respone[2].data`),
//   parseForDirective(`post in respone[2].data`)
// );

function transformDataToVars(data = "") {
  data = data.trim();
  const fnRgx = /\.+\(\)/gi;
  const isFunction = (value = "") => {
    try {
      const fn = new Function(`return  ${value}`);
      return typeof fn == "function" ? true : false;
    } catch (error) {
      return false;
    }
  };
  if (data.startsWith("{") && data.endsWith("}")) {
    // console.log(new Function(`return (${data})`)());
    let parsed = parseObjectLiteral(data.slice(1, -1));

    const parseMaped = parsed.map(([key, value]) => {
      if (key) {
        return `var ${key} = ${value};`;
      } else if (!key && isFunction(`function ${value}`)) {
        console.log(new Function(`return function  ${value}`)().name, value);
        const funcName = new Function(`return function  ${value}`)().name;
        // return `var ${funcName} = ${value.replace(`function`, "")};`;
        return `function  ${value};`;
      }
    });

    console.log("scope parsed : ", parsed, parseMaped);
    return parseMaped;
  } else {
    return;
  }
}

export async function replaceCssURLS(css = "", callback = (url = "") => {}) {
  const blobRegex = /url\(['"]?(blob:[^'")]+)['"]?\)/g;
  const infinitelyRgx = /url\((\"|\'|\`)?infinitely(.+)(\"|\'|\`)?\)/g;
  const stylesheet = parseCss(
    css
      .replace(/{/g, " {\n  ")
      .replace(/}/g, "\n}\n")
      .replace(/;/g, ";\n  ")
      .replace(/(@media[^{]*){/, "$1 {\n")
      .replace(/\n\s*\n/g, "\n")
  );
  await Promise.all(
    stylesheet.stylesheet.rules.map(async (rule) => {
      if (rule?.declarations) {
        const decs = rule?.declarations;
        console.log("decs : ", decs);
        await Promise.all(
          decs.map(async (dec) => {
            /**
             * @type {{value : string , property : string}}
             */
            const { value, property } = dec;
            if (value?.match?.(jsRgx)?.length) {
              let splitted = [...new Set(value.split(","))];
              const blobUrlIndex = splitted.findIndex((url) =>
                blobRegex.test(url)
              );
              const infUrl = splitted
                ?.find((url) => url?.match?.(jsRgx)?.length)
                ?.trim()
                .replaceAll("url", "")
                .trim()
                .slice(2, -2);

              if (infUrl) {
                // console.log((await parseInfinitelyURL(infUrl)).blobUrl);
                if (blobUrlIndex != -1) {
                  splitted[blobUrlIndex] = `url("${
                    await callback(infUrl)
                    // (await parseInfinitelyURL(infUrl)).blobUrl
                  }")`;
                } else {
                  splitted = [
                    `url("${
                      await callback(infUrl)
                      // (await parseInfinitelyURL(infUrl)).blobUrl
                    }")`,
                    ...splitted,
                  ];
                }
                // splitted[0] = `url(${
                //   await callback(infUrl)
                //   // (await parseInfinitelyURL(infUrl)).blobUrl
                // })`;
                dec.value = splitted.join(" , ");
                console.log("truuuu match", blobUrlIndex, infUrl, dec.value);
              }
            }
            return dec;
          })
        );
      }

      return rule;
    })
  );

  const str = stringifyCss(stylesheet);
  return str;
}

export function defineFontFace({ family, url }) {
  return css`
    @font-face {
      font-family: "${family}";
      src: ${url};
    }
  `;
}

/**
 *
 * @param {import('./types').Project} projectData
 * @returns
 */
export const getFonts = (projectData, urlException = "") => {
  const fonts = Object.values(projectData.fonts);

  const stringFonts = fonts.map((font) => {
    //  ( async () => {
    //     console.log('font res' , await fetch(font.path));
    //   })();
    return defineFontFace({
      family: font.name,
      url: font.isCDN ? `url("${font.url}")` : `url("../${font.path}") `,
    });
  });
  return stringFonts.join("\n");
};

/**
 *
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function blobToDataUrlAndClean(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      resolve(dataUrl);
      // Clean up
      reader.onload = null; // Remove listener
    };
    reader.readAsDataURL(file);
  }).then((dataUrl) => {
    // Use dataUrl here if needed
    console.log("Data URL:", dataUrl);
    return dataUrl;
  });
}

export async function replaceBlobs(input) {
  if (input instanceof Blob) {
    return {
      __blob__: true,
      type: input.type,
      base64: await blobToBase64(input), // Convert Blob to Base64
    };
  } else if (Array.isArray(input)) {
    return await Promise.all(input.map(replaceBlobs)); // Process arrays recursively
  } else if (typeof input === "object" && input !== null) {
    const entries = await Promise.all(
      Object.entries(input).map(async ([key, value]) => [
        key,
        await replaceBlobs(value),
      ])
    );
    return Object.fromEntries(entries);
  }
  return input; // Return other values as is
}

// Convert Blob to Base64
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // Extract Base64
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function restoreBlobs(input) {
  if (typeof input === "object" && input !== null) {
    if (input.__blob__) {
      return base64ToBlob(input.base64, input.type); // Convert Base64 back to Blob
    } else if (Array.isArray(input)) {
      return input.map(restoreBlobs); // Process arrays recursively
    } else {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, restoreBlobs(value)])
      );
    }
  }
  return input;
}

// Convert Base64 back to Blob
export function base64ToBlob(base64, type) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type });
}

/**
 *
 * @param {Blob} blob
 * @returns
 */
export async function minifyBlobJSAndCssStream(blob, type = "") {
  if (!type) return blob;
  const { minify } =
    type == "js"
      ? await import("terser")
      : type == "css"
      ? await import("csso")
      : ""; // Assuming Terser is loaded

  // Get a ReadableStream from the Blob
  const stream = blob.stream();
  const reader = stream.getReader();
  let code = "";

  // Read the stream in chunks
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Decode chunk (Uint8Array) to string and append
    code += new TextDecoder().decode(value);
  }

  // Minify the accumulated code
  console.log(
    "code : ",
    code,
    type == "css" && (await import("csso")).minify(code).css
  );

  const minified =
    type == "js"
      ? (await (await import("terser")).minify(code)).code
      : (await import("csso")).minify(code).css;
  if (minified.error) {
    throw new Error("Minification failed: " + minified.error);
  }

  // Return as a new Blob
  return new Blob([minified], {
    type: type == "js" ? "application/javascript" : "text/css",
  });
}

export function getProjectRoot(id) {
  return `projects/project-${id || opfs.id}`;
}

export async function getOPFSProjectDir() {
  const projectDir = await opfs.getFolder(getProjectRoot());
  return projectDir;
}

/**
 *
 * @param {string} path
 */
export async function getFileFromHandle(path) {
  return await (await opfs.getFile(await getOPFSProjectDir(), path)).getFile();
}

export function isDevMode(resolve = (result) => {}, reject = (result) => {}) {
  const isDev = import.meta.env.MODE === "development";
  if (isDev) {
    resolve(isDev);
  } else {
    reject(isDev);
  }

  return isDev;
}

export function toMB(bytes = 0, toFixed = 2) {
  const bytesPerMB = 1048576; // 1 MB = 2^20 bytes
  const totalSizeInMB = bytes / bytesPerMB;
  return +totalSizeInMB.toFixed(toFixed);
}

export function toGB(bytes = 0, toFixed = 2) {
  const bytesPerGB = 1073741824; // 1 GB = 2^30 bytes
  const totalSizeInGB = (bytes / bytesPerGB).toFixed(toFixed);
  return +totalSizeInGB;
}

/**
 * @param {File} file
 */
export function getFileSize(file, fixed = 2) {
  // const bytesPerMB = 1048576; // 1 MB = 2^20 bytes
  // const bytesPerGB = 1073741824; // 1 GB = 2^30 bytes
  // const totalSizeInMB = file.size / bytesPerMB;
  // const totalSizeInGB = (file.size / bytesPerGB).toFixed(2);
  if (!file) {
    console.warn("No file provided or file is invalid.");
    return {
      MB: 0,
      GB: 0,
    };
  }

  return {
    MB: toMB(file.size, fixed),
    GB: toGB(file.size, fixed),
  };
}

/**
 *
 * @param {File[]} files
 */
export function getFilesSize(files, fixed = 2) {
  // const bytesPerMB = 1048576; // 1 MB = 2^20 bytes
  // const bytesPerGB = 1073741824; // 1 GB = 2^30 bytes
  console.log("files : ", files, files?.length);

  if (!files?.filter(Boolean)?.length) {
    console.warn("No files provided or all files are invalid.");
    return {
      MB: 0,
      GB: 0,
    };
  }
  const totalSizeInBytes = Array.from(files).reduce(
    (prev, current, currentIndex, arr) => {
      return prev + current.size;
    },
    0
  );
  // const totalSizeInMB = totalSizeInBytes / bytesPerMB;
  // const totalSizeInGB = (totalSizeInBytes / bytesPerGB).toFixed(2);

  return {
    MB: toMB(totalSizeInBytes, fixed),
    GB: toGB(totalSizeInBytes, fixed),
  };
}

export function isChrome(callback = (bool = false) => {}) {
  const cond = navigator.userAgent.toLowerCase().includes("chrome");
  if (cond) {
    callback(cond);
  }
  return cond;
}

export function editNestedObject(obj, keys, newValue) {
  let current = obj;

  // Traverse the object until the second-to-last key
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    // Ensure the key exists, if not create an empty object
    if (!current[key]) {
      current[key] = {};
    }
    !isPlainObject(current[key]) && (current[key] = {});
    current = current[key];
  }

  // Set the new value at the final key
  const finalKey = keys[keys.length - 1];
  // const prevFinalKey = keys[keys.length - 2];
  console.log(current, current[finalKey], newValue, keys);
  // if(!current[finalKey]){
  //   current[prevFinalKey] = {}
  // }
  // !isPlainObject( current) && (current={})
  console.log(current, current[finalKey], newValue, keys);

  current[finalKey] = newValue;

  return obj;
}

export function getNestedValue(obj, keys) {
  let current = obj;

  // Traverse the object using all keys
  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined; // Return undefined if the path is invalid
    }
    current = current[key];
  }

  return current;
}

export function removeNestedKey(obj, keys) {
  if (
    !obj ||
    typeof obj !== "object" ||
    !Array.isArray(keys) ||
    keys.length === 0
  ) {
    return obj;
  }

  let current = obj;

  // Traverse to the parent of the final key
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current || typeof current !== "object" || !(key in current)) {
      return obj; // Path doesn't exist, return unchanged object
    }
    current = current[key];
  }

  // Delete the final key
  const finalKey = keys[keys.length - 1];
  if (current && typeof current === "object" && finalKey in current) {
    delete current[finalKey];
  }

  return obj;
}

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
          console.log("key : ", key);

          // if (key == "markers" && removeMarkers) return null;
          if (typeof value === "object" && !Array.isArray(value)) {
            return [key, parseObjValue(value)];
          } else if (
            key.startsWith("on") &&
            /on[A-Z]/gi.test(key) &&
            !key.toLocaleLowerCase().endsWith("params")
          ) {
            const isFn = isFunction(value);
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

export async function cloneMotion(motionId, projectId) {
  const projectData = await db.projects.get(+projectId);
  const motions = projectData.motions;
  const targetMotion = motions[motionId];
  const clone = cloneDeep(targetMotion);
  const newId = uniqueId(`mt${random(999, 10000)}`);
  clone.id = newId;
  for (const animation of clone.animations) {
    animation.name = uniqueId(`varName_${random(999, 1000)}${random(99, 999)}`);
  }
  return clone;
}

/**
 *
 * @param {{[key:string] : import('./types').MotionType}} motions
 */
export function buildGsapMotionsScript(
  motions,
  isInstance = false,
  removeMarkers = true,
  pageName
) {
  const built = Object.values(motions).map((motion) => {
    const compiledMotion = CompileMotion(
      motion,
      false,
      isInstance,
      removeMarkers
    );
    let tween = `let ${motion.id} = {}; \n\n`;
    const doMotion = () => {
      if (motion.isTimeLine) {
        tween += `${motion.id}.${
          motion.timeLineName
        } = gsap.timeline( new Function(\`return (${serializeJavascript(
          compiledMotion.timeline,
          { space: 2 }
        ).replaceAll("\\", "\\\\")})\`)())`;
      }
      if (compiledMotion.fromTo.length) {
        for (const item of compiledMotion.fromTo) {
          const toObject = `new Function(\`return (${serializeJavascript(
            item.toValue,
            { space: 2 }
          ).replaceAll("\\", "\\\\")})\`)()`;
          const fromObject = `new Function(\`return (${serializeJavascript(
            item.fromValue,
            { space: 2 }
          ).replaceAll("\\", "\\\\")})\`)()`;
          tween += `${
            motion.isTimeLine ? "" : `${motion.id}.${item.name} = gsap`
          }.fromTo(\`${
            item.selector
          }\`, {...${fromObject}}, {...${toObject}} , ${
            item.positionParameter || ""
          });\n\n`;

          // console.log(new Function(`return ${serializeJavascript(item.toValue , {space:2, })}`)());
        }
      }
    };

    console.log(
      "motions from script builder",
      motion,
      !motion?.excludes?.includes?.(pageName)
    );

    if (!motion?.excludes?.includes?.(pageName)) {
      doMotion();
    }

    if (Object.keys(motion.instances).length) {
      console.log(
        "instances length : ",
        motion.instances,
        Object.keys(motion.instances)
      );

      for (const id in motion.instances) {
        const clone = cloneDeep(motion);
        clone.id = id;
        (clone.isInstance = true), (clone.instances = {});
        delete clone["excludes"];
        tween += buildGsapMotionsScript({ [id]: clone }, true, removeMarkers);
      }
    }

    return tween;
  });

  return built.join(`\n\n\n`);
}

/**
 *
 * @param {{[key:string] : import('./types').MotionType}} motions
 * @param {string} pageName
 */
export function filterMotionsByPage(motions, pageName) {
  if (!pageName) {
    throw new Error(`pageName is not defined at filterMotionsByPage`);
  }
  return Object.fromEntries(
    Object.entries(motions).filter(([key, motion]) => {
      if (!motion.pages || !motion.pages.length) return false;
      return motion.pages.includes(pageName);
    })
  );
}

/**
 *
 * @param {{[key : string] : import('./types').MotionType}} motions
 * @param {{[key:string] : import('./types').InfinitelyPage}} pages
 */
export async function cleanMotions(motions, pages) {
  const { parseHTML } = await import("linkedom");
  const pagesContent = {};
  for (const key in pages) {
    const page = pages[key];
    const pageContent = await (
      await opfs.getFile(defineRoot(page.pathes.html))
    ).text();
    pagesContent[page.name] = pageContent;
  }

  for (const key in cloneDeep(motions)) {
    const motion = motions[key];
    let isChange = false;
    const allowedInstances = {};

    for (const name in pagesContent) {
      if (isChange) break;
      const pageContent = pagesContent[name];
      const { document } = parseHTML(doDocument(pageContent));
      const mainIdEls = document.querySelectorAll(`[${motionId}="${key}"]`);
      const instancesEls = document.querySelectorAll(
        `[${mainMotionId}="${key}"]`
      );
      console.log(mainIdEls, instancesEls, pageContent, "a3aaaaaaa");
      if (!mainIdEls.length && instancesEls.length) {
        motion.excludes = [...new Set([...(motion.excludes || []), name])];
      }

      if (mainIdEls.length || instancesEls.length) {
        isChange = true;
      } else {
        isChange = false;
      }

      //clear instances
      for (const instanceKey in cloneDeep(motion.instances)) {
        if (allowedInstances[instanceKey]) continue;
        const el = document.querySelectorAll(
          `[${motionInstanceId}="${instanceKey}"]`
        );
        if (el.length) allowedInstances[instanceKey] = true;
        if (!el.length) allowedInstances[instanceKey] = false;
      }
    }

    for (const allowedInstance in allowedInstances) {
      if (!allowedInstances[allowedInstance])
        delete motion.instances[allowedInstance];
    }
    if (!isChange) delete motions[key];
  }

  // await Promise.all(
  //   Object.entries(motions).map(async ([key, motion]) => {
  //     return await Promise.all(
  //       Object.values(pages).map(async (page) => {
  //         // const pageContent = await page.html.text();
  //         console.log(page, page.helmet);
  //         const { document } = parseHTML(
  //           doDocument(
  //             await (await opfs.getFile(defineRoot(page.pathes.html))).text()
  //           )
  //         );

  //         const els = document.querySelectorAll(
  //           `[${motionId}="${key}"] , [${mainMotionId}="${key}"]`
  //         );
  //         if (!els.length) {
  //           console.log(`motions ${key} deleted.`, els);

  //           delete motions[key];
  //         }
  //         // const stream = pageFile.stream();
  //         // const reader = stream.getReader();
  //         // const decoder = new TextDecoder();
  //         // const buffer = [];
  //         // let isMotionFounded = false;
  //         // while (true) {
  //         //   const { value, done } = await reader.read();
  //         //   const pageContent = decoder.decode(value, { stream: true });
  //         //   if (!pageContent) break;
  //         //   buffer.push(pageContent);
  //         //   console.log("page content is : ", pageContent, buffer.join(""));
  //         //   buffer.length > 20 && buffer.shift();
  //         //   if (buffer.join("").includes(`${motionId}="${motion.id}"`)) {
  //         //     isMotionFounded = true;
  //         //     break;
  //         //   }
  //         //   if (isMotionFounded || done) {
  //         //     !isMotionFounded && delete motions[key];
  //         //     break;
  //         //   }
  //         // }
  //         // if (!pageContent.includes(`[${motionId}="${motion.id}"]`)) {
  //         //   delete motions[key];
  //         // }
  //         return page;
  //       })
  //     );
  //   })
  // );

  console.log("cleaned motions", motions);

  return motions;
}

/**
 *
 * @param {import('../helpers/types').Interactions} interactions
 * @param {{[key:string] : import('./types').InfinitelyPage}} pages
 */
export async function cleanInteractions(interactions, pages) {
  /**
   * @type {import('../helpers/types').Interactions}
   */
  const newInteractions = {};

  for (const id in interactions) {
    let isUsed = false;
    for (const key in pages) {
      const page = pages[key];
      const content = await (
        await (await opfs.getFile(defineRoot(page.pathes.html))).getOriginFile()
      ).text();

      isUsed = content.includes(`${interactionId}="${id}"`);
      console.log(
        "interactions cleaner : ",
        interactionId,
        id,
        isUsed,
        key,
        "\n\n\n",
        content
      );
      if (isUsed) {
        newInteractions[id] = interactions[id];
      }
    }
  }

  console.log(`newInteractions is: `, newInteractions);

  return newInteractions;
}

export function advancedParse(value) {
  // console.log("before parse value : ", value);

  try {
    return JSON.parse(value); // new Function(`return ${value}`)();
  } catch (error) {
    return value == undefined ? `undefined` : `\`${value}\``;
  }
}

/**
 *
 * @param {import('./types').Actions} actions
 * @param {string} id
 */
export const buildFunctionsFromActions = (actions, id, isInstance = false) => {
  // console.log(actions);

  const functionsFromParams = actions
    .map(
      (action) =>
        `${action.function}(${Object.values(action.params)
          .map((value) => {
            value = isPlainObject(value) ? value.value : value;
            value = advancedParse(value);
            console.log("value", value);
            return typeof value == "string"
              ? value.replaceAll(
                  `self`,
                  `[${
                    isInstance ? interactionInstanceId : interactionId
                  }="${id}"]`
                )
              : value;
          })
          .join(",")})`
    )
    .join(";");

  // console.log('functionsFromParams' , functionsFromParams);

  return functionsFromParams;
};

/**
 *
 * @param {import('./types').Interactions} interactions
 * @param {string} interactionsId
 * @param {boolean} isInstance
 */
export function buildInteractionsAttributes(
  interactions,
  interactionsId,
  isInstance = false
) {
  return Object.fromEntries(
    interactions.map((interaction) => [
      `v-on:${interaction.event}`,
      buildFunctionsFromActions(
        interaction.actions,
        interactionsId,
        isInstance
      ),
    ])
  );
}

/**
 *
 * @param {import('./types').LibraryConfig[]} libs
 */
export async function installLibs(libs) {
  const mime = await (await import("mime/lite")).default;
  for (const lib of libs) {
    // console.log(lib);
    if (lib.isCDN) continue;
    // const loadedFile = await fonts[value.path].async("blob");
    if (!navigator.onLine) {
      lib.file = null;
      lib.waitToInstall = true;
      continue;
    }
    lib.file = new File([await (await fetch(lib.fileUrl)).blob()], lib.name, {
      type: mime.getType(lib.name),
    });
  }
}

/**
 *
 * @param {import('./types').InfinitelyFonts} fonts
 */
export async function installFonts(fonts) {
  const mime = await (await import("mime/lite")).default;

  for (const key in fonts) {
    const value = fonts[key];
    if (value.isCDN) continue;
    if (!navigator.onLine) {
      value.file = null;
      value.waitToInstall = true;
      continue;
    }
    const loadedFile = await (await fetch(value.url)).blob();
    // console.log("value : ", loadedFile, value.name);

    value.file = new File([loadedFile], key, {
      type: mime.getType(value.path),
    });
  }
}
/**
 *
 * @param {import('./types').RestAPIModel[]} rModels
 */
export async function installRestModelsAPI(rModels) {
  return await Promise.all(
    rModels.map(async (model) => {
      if (!navigator.onLine) {
        console.log("you offline");

        model.response = null;
        model.waitToInstall = true;
        return await new Promise((res, rej) => res(model));
      }

      try {
        const response = await fetch(model.url, {
          method: model.method,
          headers: Object.keys(model.headers || {}).length
            ? model.headers
            : undefined,
          body: Object.keys(model.body || {}).length ? model.body : undefined,
        });
        const data = await response.json();
        model.response = JSON.stringify(data);
        model.waitToInstall = false;
      } catch (error) {
        console.error(`Error fetching ${model.name}:`, error);
        model.response = null;
        model.waitToInstall = true;
      }
    })
  );
}

/**
 *
 * @param {import('./types').Project} projectData
 */
export async function getTotalSizeProject(projectId, projectData) {
  return toMB(await opfs.getFolderSize(`projects/project-${projectId}`));
}

/**
 *
 * @param {File[]} assets
 * @param {number} projectId
 */
export async function handleFilesSize(assets, projectId) {
  // const clone = [...assets];
  // const projectData = await db.projects.get(+projectId);
  const storageDetails = await getStorageDetails(+projectId);
  // storageDetails.
  const previousSize = (await getTotalSizeProject(+projectId)) || 0;
  const igonredFiles = [];
  const assetsFilesLength = (
    await (await opfs.getFolder(defineRoot("assets"))).children()
  ).length;
  assets = assets
    .slice(0, MAX_FILES_COUNT + 1 - assetsFilesLength)
    .filter((asset) => {
      const fileSizeByMB = getFileSize(asset).MB;
      const condition = fileSizeByMB <= MAX_FILE_SIZE;
      if (!condition) igonredFiles.push(asset);
      return condition;
    });

  /**
   *
   * @param {File[]} assets
   * @returns
   */
  const handler = (assets) => {
    const size = getFilesSize(assets).MB;
    if (
      previousSize + size >
      (storageDetails.availableSpaceInMB >= MAX_UPLOAD_SIZE
        ? MAX_UPLOAD_SIZE
        : storageDetails.availableSpaceInMB)
    ) {
      igonredFiles.push(assets.pop());
      return handler(assets);
    } else {
      return {
        igonredFiles, //:igonredFiles.push(...newIgonred),
        assets,
      };
    }
  };

  return handler(assets);
}

/**
 *
 * @param {import('./types').LibraryConfig[]} libs
 */
export async function getScripts(libs, urlException = "") {
  const scripts = Promise.all(
    libs.map(
      async (lib) => {
        // const projectDir = await opfs.getFolder(
        //   await opfs.root,
        //   `projects/project-${opfs.id}`
        // );
        // const file = await (await opfs.getFile(projectDir, lib.path)).getFile();
        return lib.isCDN
          ? html`
              <script
                src="${lib.fileUrl}"
                ${lib.defer && `defer=${lib.defer}`}
                ${lib.async && `async=${lib.async}`}
                name="${lib.name}"
              ></script>
            `
          : html`
              <script
                src="${urlException}/${lib.path}"
                ${lib.defer && `defer=${lib.defer}`}
                ${lib.async && `async=${lib.async}`}
                name="${lib.name}"
              ></script>
            `;
      }
      // ${await lib.file.text()};
    )
  );

  return (await scripts).join("\n");
}

/**
 *
 * @param {import('./types').LibraryConfig[]} libs
 */
export async function getStyles(libs, urlException = "") {
  const styles = Promise.all(
    libs.map(async (lib) => {
      // const projectDir = await opfs.getFolder(
      //   await opfs.root,
      //   `projects/project-${opfs.id}`
      // );
      // const file = await (await opfs.getFile(projectDir, lib.path)).getFile();
      return lib.isCDN
        ? html`
            <link href="${lib.fileUrl}" name="${lib.name}" rel="stylesheet" />
          `
        : html`
            <link
              href="${urlException}/${lib.path}"
              name="${lib.name}"
              rel="stylesheet"
            />
          `;
    })
    // ${await lib.file.text()};
  );

  return (await styles).join("\n");
}

/**
 *
 * @param {FileSystemFileHandle[]} handles
 */
export async function filesGetterFromHandles(handles) {
  const handlers = await handles.map(async (handle) => await handle.getFile());
  return await Promise.all(handlers);
}

export const buildHeadFromEditorCanvasHeader = ({
  canvasCss = "",
  editorCss = "",
}) => {
  return html` <style id="global-rules">
    ${canvasCss}
    ${editorCss}
  </style>`;
};

/**
 *
 * @param {string} page
 * @param {import('./types').Project} projectData
 * @param {import('./types').ProjectSetting} projectSetting
 * @returns
 */
export const buildPageData = async (page = "", projectData, projectSetting) => {
  console.log(`from buildPageData callback : `, page);

  const currentPageId = page;
  const urlException = page.toLowerCase() == "index" ? `.` : `..`;
  const projectId = projectData.id;
  const currentPage = projectData.pages[`${currentPageId}`];
  const mainRoot = await opfs.root;
  // const projectDir = await opfs.getFolder(
  //   mainRoot,
  //   `projects/project-${projectId}` //OR opfs.id
  // );
  const pageContent = await (
    await opfs.getFile(defineRoot(`editor/pages/${currentPageId}.html`))
  ).text();
  // const libsFolder = await opfs.getFolder(projectDir, "libs");
  // const libsFolders = await opfs.getFolders(libsFolder, ["js", "css"]);
  // const jsFolders = await opfs.getFolders(libsFolders[0], ["header", "footer"]);
  // const jsHeaderLibs = await filesGetterFromHandles(opfs.getAllFiles(jsFolders[0]));
  // const jsFooterLibs = await filesGetterFromHandles(opfs.getAllFiles(jsFolders[1]));
  // const cssLibs = await filesGetterFromHandles(opfs.getAllFiles(libsFolders[1]));

  const data = {
    helmet: "",
    headerScripts: "",
    footerScripts: "",
    cssLibs: "",
    mainScripts: "",
    localScript: "",
    globalScript: "",
    content: "",
    pageStyle: "",
    // editorStyles: "",
    symbolsStyles: "",
    templatesStyles: "",
    fonts: "",
    bodyAttributes: projectData.pages[`${currentPageId}`].bodyAttributes || {},
    motions:
      `<script>${buildGsapMotionsScript(
        filterMotionsByPage(
          await cleanMotions(projectData.motions, projectData.pages),
          currentPageId
        ),
        false,
        projectSetting.remove_gsap_markers_on_build,
        currentPageId
      )}</script>` || "",
  };

  // console.log("motions script: ", cleanMotions(projectData.motions, projectData.pages),);

  const helmet = currentPage.helmet;

  const headerScrtips = getScripts(projectData.jsHeaderLibs, urlException);

  const footerScritps = getScripts(projectData.jsFooterLibs, urlException);

  const cssLibs = getStyles(projectData.cssLibs, urlException);

  const viewMainScripts = preivewScripts
    .map((src) => {
      if (typeof src === "string") {
        return html` <script src="${src}"></script> `;
      } else if (isPlainObject(src)) {
        return html`
          <script
            ${Object.entries(src)
              .map(([key, value]) => `${key}=${value} `)
              .join(" ")}
          ></script>
        `;
      }
    })
    .join("\n");

  const globalScrtip = html`
    <script src="${urlException}/global/global.js"></script>
  `;

  const localScript = html`
    <script src="${urlException}/js/${currentPageId}.js"></script>
  `;

  data.helmet += html`
    <meta name="author" content="${helmet.author || ""}" />
    <meta name="description" content="${helmet.description || ""}" />
    <meta name="keywords" content="${helmet.keywords || ""}" />
    <title>${helmet.title || ""}</title>
    <link rel="icon" href="${urlException}/${projectData.logo}" />
    ${(await helmet?.customMetaTags?.text?.()) || ""}
  `;

  data.headerScripts = (await headerScrtips) || "";
  data.footerScripts = (await footerScritps) || "";
  data.cssLibs = (await cssLibs) || "";
  data.mainScripts = viewMainScripts || "";
  data.content = pageContent || "";
  // data.pageStyle = (await currentPage.css.text()) || "";
  data.globalScript = globalScrtip || "";
  data.localScript = localScript || "";
  data.symbolsStyles = currentPage.symbols
    .map(
      (id) =>
        `<link href="${urlException}/editor/symbols/${id}/${id}.css" rel="stylesheet"/>`
    )
    .join("\n");
  data.templatesStyles = Object.values(projectData.blocks)
    .filter((block) => block.type == "template")
    .map(
      (block) =>
        `<link href="${urlException}/${block.pathes.style}" rel="stylesheet"/>`
    )
    .join("\n");
  // data.fonts = getFonts(projectData, urlException) || "";
  return data;
};

/**
 *
 * @param {{
 * page:string ,
 * projectSetting:import('./types').ProjectSetting,
 * projectData:import('./types').Project ,
 * editorData:{
 * canvasCss:string,
 * editorCss:string
 * }}} param0
 */
export async function buildPageContentFromData({
  page,
  projectData,
  editorData,
  projectSetting = {},
}) {
  const pageData = await buildPageData(page, projectData, projectSetting);
  const urlException = page.toLowerCase() == "index" ? `.` : `..`;
  let isTailwindEnabled = false;
  if (projectSetting.enable_tailwind) {
    const handle = await opfs.getFile(defineRoot(`css/tailwind/${page}.css`));
    isTailwindEnabled = handle && handle.exists();
  }

  // ${buildHeadFromEditorCanvasHeader({
  //         canvasCss: editorData.canvasCss,
  //         editorCss: editorData.editorCss,
  //       })}
  const content = html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link href="/styles/style.css" rel="stylesheet" />

        ${isTailwindEnabled
          ? ` <link
            href="${urlException}/css/tailwind/${page}.css"
            id="tailwind-style"
            rel="stylesheet"
          />`
          : `
          <link
            href="/styles/global-rules.css"
            id="global-rules"
            rel="stylesheet"
          />
          `}
        <!-- There is {pageData.symbolsStyles} {pageData.templatesStyles} -->
        ${Object.values(projectData.fonts).length
          ? `<link href="${urlException}/css/fonts.css" rel="stylesheet"/>`
          : ""}
        ${pageData.helmet} ${pageData.cssLibs}
        <link
          href="${urlException}/css/${page}.css"
          id="page-style"
          rel="stylesheet"
        />
        ${pageData.headerScripts}
        ${projectSetting.enable_spline_viewer
          ? `<script src="https://unpkg.com/@splinetool/viewer@1.10.27/build/spline-viewer.js" type="module"></script>`
          : ""}
      </head>

      <body
        ${Object.keys(pageData.bodyAttributes || {})
          .filter((key) => Boolean(pageData.bodyAttributes[key]))
          .map((key) => `${key}="${pageData.bodyAttributes[key]}"`)
          .join(" ")}
      >
        ${pageData.content} ${pageData.footerScripts} ${pageData.mainScripts}
        ${pageData.motions} ${pageData.globalScript} ${pageData.localScript}
      </body>
    </html>
  `;

  return content;
}

/**
 *
 * @param {{
 * projectData:import('./types').Project ,
 * projectSetting:import('./types').ProjectSetting,
 * editorData:{
 * canvasCss:string,
 * editorCss:string
 * }}} param0
 */
export async function buildPagesAsBlobForSecrviceWorker({
  projectData,
  editorData,
  projectSetting = {},
}) {
  const pages = projectData.pages;
  const pagesAsBlob = {};
  for (const key in pages) {
    const pageKey = new URL(
      `/pages/${key}.html`,
      self?.origin || window?.origin
    ).pathname
      .split("/")
      .pop();

    pagesAsBlob[pageKey] = new Blob(
      [
        await buildPageContentFromData({
          page: key,
          projectData,
          editorData,
          projectSetting,
        }),
      ],
      { type: "text/html" }
    );
  }
  return pagesAsBlob;
}

/**
 *
 * @param {{
 * projectData:import('./types').Project ,
 * pageName:string,
 * projectSetting:import('./types').ProjectSetting,
 * editorData:{
 * canvasCss:string,
 * editorCss:string
 * }}} param0
 */
export async function buildPageAsBlobForSecrviceWorker({
  projectData,
  editorData,
  pageName,
  projectSetting = {},
}) {
  if (!pageName) {
    console.error(
      `From pages builder worker buildPageAsBlobForSecrviceWorker : no page name founded`
    );
  }
  // const page = projectData.pages[pageName];
  const pageContent = await buildPageContentFromData({
    page: pageName,
    projectData,
    editorData,
    projectSetting,
  });
  // const pageKey = new URL(
  //   `/pages/${pageName}.html`,
  //   self?.origin || window?.origin
  // ).pathname
  //   .split("/")
  //   .pop();

  return {
    [`${pageName}.html`]: new File([pageContent], `${pageName}.html`, {
      type: "text/html",
    }),
  };
}

/**
 * @param {number} projectId
 * @returns {Promise<import('./types').StorageDetails>}
 */
export async function getStorageDetails(projectId) {
  const storageDetails = await navigator.storage.estimate();
  // const projectLength = await db.projects.count();
  // const quotaPerProject = toMB(storageDetails.quota) / projectLength;
  // const currentProject = await db.projects.get(projectId);
  // const currentProjectSize = await getTotalSizeProject(currentProject);

  const quotaInMB = toMB(storageDetails.quota);
  const usageInMB = toMB(storageDetails.usage);

  // const projectsFolder = await opfs.getFolder(await opfs.root, "projects");
  const projectsLength = (await opfs.getAllFolders("projects")).length;
  const availableInStorageMB = quotaInMB - usageInMB;

  // const projectsFolderSize = await opfs.getFolderSize(getProjectRoot());
  const quotaPerProject = MAX_UPLOAD_SIZE;

  const currentProjectSize = await getTotalSizeProject(+projectId);
  const assetsRoot = await opfs.getFolder(defineRoot(`assets`));
  const filesLength = (await assetsRoot.children()).length;

  //  getFilesSize(
  //   currentProject?.assets?.map?.((asset) => asset.file) || []
  // ).MB;
  const projectSpace =
    availableInStorageMB > quotaPerProject
      ? quotaPerProject
      : availableInStorageMB;
  const availableSize = projectSpace - currentProjectSize;
  const totalAviableSpace = availableSize < 0 ? 0 : availableSize;

  return {
    usage: storageDetails.usage,
    quota: storageDetails.quota,
    usageInMB: toMB(storageDetails.usage),
    usageInGB: toGB(storageDetails.usage),
    quotaInMB: toMB(storageDetails.quota),
    quotaInGB: toGB(storageDetails.quota),
    availableSpaceInMB: Math.ceil(totalAviableSpace),
    availableSpaceInGB: toGB(Math.ceil(totalAviableSpace)),
    usedSpace: currentProjectSize,
    projectSpace,
    filesLength,
  };
}

export async function sendDataToServiceWorker(data) {
  navigator.serviceWorker.controller.postMessage({
    command: "setVar",
    props: {
      obj: data,
    },
  });
}

export function inlineWorker(callback = () => {}, scope = {}) {
  let strScope = ``;
  for (const key in scope) {
    strScope += `const  ${key} = ${serializeJavascript(scope[key])};\n`;
  }
  const code = `${strScope} (${callback.toString()})()`;
  console.log("code  : ", code);

  const urlCode = URL.createObjectURL(
    new Blob([code], {
      type: "application/javascript",
    })
  );

  const worker = new Worker(urlCode, { credentials: "omit" });
  return {
    worker,
    revoker() {
      URL.revokeObjectURL(urlCode);
      worker.terminate();
    },
  };
}

/**
 *
 * @param {string} path
 * @param {import('jszip').JSZipObject} file
 */

/**
 *
 * @param {{
 * pageName:string,
 * file:import('jszip').JSZipObject | Blob | File,
 * css : {
 *  [key : string]:import('jszip').JSZipObject
 * } | undefined,
 * js : {
 *  [key : string]:import('jszip').JSZipObject
 * } | undefined,
 * }} param0
 * @returns
 */
export async function buildPage({ pageName, file, css, js }) {
  const { parseHTML } = await import("linkedom");
  const isJSZipObject = file.async && file.async instanceof Function;
  const isBlobOrFile = file instanceof Blob || file instanceof File;
  const name = pageName.toLowerCase();
  console.log(
    "is instance from : ",
    file.async && file.async instanceof Function,
    file instanceof Blob,
    file instanceof File
  );
  const content = isJSZipObject
    ? await file.async("text")
    : isBlobOrFile
    ? await file.text()
    : file; // Assuming file is a string if not a Blob or JSZipObject
  if (!content) {
    throw new Error(`File is empty`);
  }
  const pageCss = css
    ? new Blob([await css[`css/${pageName}.css`].async("blob")], {
        type: "text/css",
      })
    : new Blob([""], { type: "text/css" });

  const pageJs = js
    ? new Blob([await js[`js/${pageName}.js`].async("blob")], {
        type: "application/js",
      })
    : new Blob([""], { type: "application/js" });

  const { document } = parseHTML(content);
  const pageTitle = document.title;
  const bodyAttributes = document.body.getAttributeNames().length
    ? Object.fromEntries(
        document.body
          .getAttributeNames()
          .map((attr) => [attr, document.body.getAttribute(attr)])
      )
    : {};

  const descMetaEl = document.querySelector('meta[name="description"]');
  const descMeta = descMetaEl?.getAttribute?.("content") || "";

  const authorMetaEl = document.querySelector('meta[name="author"]');
  const authorMeta = authorMetaEl?.getAttribute?.("content") || "";

  const keywordsMetaEl = document.querySelector('meta[name="keywords"]');
  const keywordsMeta = keywordsMetaEl?.getAttribute?.("content") || "";

  /**
   *
   * @param {import('./types').LibraryConfig} lib
   * @param {boolean} isHeader
   * @returns
   */
  // const defineJsLibs = (lib, isHeader) => {
  //   if(lib.src && lib.src.toLowerCase() == `js/${pageName}.js`) return;
  //   const isInline = !lib.src;
  //   const inlineContent = isInline ? lib.innerHTML : "";

  //   const isCDN =
  //     !isInline &&
  //     (lib.src.startsWith("http://") || lib.src.startsWith("https://"));
  //   const isDefer = lib.defer ? true : false;
  //   const isAsync = lib.async ? true : false;
  //   const name = isCDN
  //     ? ""
  //     : lib.getAttribute("name") || !isInline
  //     ? lib.src.split("/").pop().split(".").shift()
  //     : "";
  //   return {
  //     async: isAsync,
  //     defer: isDefer,
  //     header: isHeader,
  //     footer: !isHeader,
  //     id: uniqueId(`js-header-lib-${random(10000, 9999999)}`),
  //     name,
  //     inlineContent,
  //     isInline,
  //     isCDN,
  //     path: isInline ? "" : lib.src,
  //     fileUrl: isCDN ? lib.src : "",
  //     type: "js",
  //   };
  // };

  //  /**
  //  * @type {import('./types').LibraryConfig[]}
  //  */
  // const cssLibs = [...document.querySelectorAll('link[rel="stylesheet"]')]
  //   .map((lib) => {
  //     if (!lib.href) return;
  //     // if(lib.href.startsWith("data:")) return;
  //     if(lib.href.toLowerCase() == `css/${pageName}.css`)return;
  //     const isCDN =
  //       lib.href.startsWith("http://") || lib.href.startsWith("https://");
  //     const path = isCDN ? el.href : el.href; //maybe i will put logic here
  //     return {
  //       path,
  //       isCDN,
  //     };
  //   })
  //   .filter(Boolean);

  // /**
  //  * @type {import('./types').LibraryConfig[]}
  //  */
  // const jsHeaderLibs = [...document.head.querySelectorAll("script")].map(
  //   (lib) => {
  //     return defineJsLibs(lib, true);
  //   }
  // ).filter(Boolean);

  // const jsFooterLibs = [...document.body.querySelectorAll("script")].map(
  //   (lib) => {
  //     return defineJsLibs(lib, false);
  //   }
  // ).filter(Boolean);

  //Remove none important els
  descMetaEl?.remove?.();
  authorMetaEl?.remove?.();
  keywordsMetaEl?.remove?.();
  document.body.querySelectorAll("script").forEach((el) => el.remove());
  document.body.querySelectorAll("style").forEach((el) => el.remove());
  document.body.querySelectorAll("link").forEach((el) => el.remove());

  console.log("helmet : ", pageTitle, descMeta, authorMeta, keywordsMeta);
  const allMeta = new Blob(
    [
      [...document.querySelectorAll("meta")]
        .map((el) => el.outerHTML)
        .join("\n"),
    ],
    { type: "text/html" }
  );

  /**
   * @type {import('./types').InfinitelyPage}
   */
  const page = {
    html: new File([document.body.innerHTML], `${name}.html`, {
      type: "text/html",
    }),
    css: pageCss,
    js: pageJs,
    pathes: {
      html: `editor/pages/${name}.html`,
      css: `css/${name}.css`,
      js: `js/${name}.js`,
    },
    name,
    bodyAttributes,
    id: uniqueId(`page-id-${random(1000, 9999)}`),
    helmet: {
      description: descMeta,
      author: authorMeta,
      keywords: keywordsMeta,
      title: pageTitle,
      customMetaTags: allMeta,
    },
  };
  return page;
}

export function defineRoot(root = "") {
  const projectRoot = getProjectRoot();
  return `${projectRoot}/${root.replace(`${projectRoot}/`, "")}`;
}

export function getPageURLException(pageName = "") {
  if (!pageName) {
    throw new Error(`Page name is not founded!`);
  }
  return pageName.toLowerCase() == "index" ? `.` : `..`;
}

/**
 *
 * @param {string} html
 * @returns {string[]}
 */
export function chunkHtmlElements(html = "") {
  const pattern = /<([a-zA-Z0-9\-]+)(\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  return html.match(pattern) || [];
}

export function getInitProjectData({
  name = "",
  description = "This is a new project created with Infinitely Editor.",
  logo = "",
  pages = {
    index: {
      // html: new Blob([``], { type: "text/html" }),
      // css: new Blob([``], { type: "text/css" }),
      // js: new Blob([``], { type: "text/javascript" }),
      pathes: {
        html: "editor/pages/index.html",
        css: "css/index.css",
        js: "js/index.js",
      },
      cmds: {},
      id: "index",
      name: "index",
      symbols: [],
      components: {},
      helmet: {},
      bodyAttributes: {},
    },
    playground: {
      // html: new Blob([``], { type: "text/html" }),
      // css: new Blob([``], { type: "text/css" }),
      // js: new Blob([``], { type: "text/javascript" }),
      pathes: {
        html: "editor/pages/playground.html",
        css: "css/playground.css",
        js: "js/playground.js",
      },
      id: "playground",
      symbols: [],
      cmds: {},
      name: "playground",
      components: {},
      helmet: {},
      bodyAttributes: {},
    },
  },
}) {
  return {
    name,
    description,
    logo,
    blocks: {},
    // cssLibraries: [],
    // jsHeaderLocalLibraries: [],
    // jsHeaderCDNLibraries: [],
    // jsFooterLocalLibraries: [],
    // jsFooterCDNLibraries: [],
    // cssFooterCDNLibraries: [],
    // cssFooterLocalLibraries: [],
    // cssHeaderCDNLibraries: [],
    // cssHeaderLocalLibraries: [],
    cssLibs: [],
    jsHeaderLibs: [],
    jsFooterLibs: [],
    pages,
    // globalCss: new Blob([``], { type: "text/css" }),
    // globalJs: new Blob([``], { type: "text/javascript" }),
    symbols: {},
    assets: [],
    dynamicTemplates: {},
    restAPIModels: [],
    symbolBlocks: [],
    globalRules: {},
    fonts: {},
    motions: {},
    interactions: {},
    inited: false,
  };
}

/**
 *
 * @param {{asJson:boolean , projectId:number , toastId:string, projectSetting : import('./types').ProjectSetting}} props
 */
export async function uploadProjectToTMP(props) {
  const projectData = await db.projects.get(props.projectId);
  const project = await (
    await buildProject(props)
  ).generateAsync({
    compression: "STORE",
    type: "blob",
    streamFiles: true,
  });
  const formData = new FormData();
  formData.append("file", project, `${projectData.name}.zip`);
  const res = await fetch(tmp, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export function doGlobalType(libName, globalTypeName, isExportDefault = false) {
  if (!libName) {
    throw new Error(`libName param is required`);
  }

  const importStatement = isExportDefault
    ? `import _lf from "${libName}";`
    : `import * as _lf from "${libName}";`;

  const globalDeclaration =
    globalTypeName && globalTypeName.trim().length > 0
      ? `
declare global {
  const ${globalTypeName}: typeof _lf;
}
export {};`
      : "";

  return `
${importStatement}
${globalDeclaration}
  `;
}

export function needsWrapping(code) {
  return (
    /\bexport\s+(interface|type|class|function|const|enum)/.test(code) &&
    !/\bdeclare\s+module\s+['"]/.test(code)
  );
}

export function wrapModule(libName, code) {
  return `declare module "${libName}" {\n${code}\n}`;
}

export function hasExportDefault(code = "") {
  return /export default/gi.test(code);
}

export function styleToString(styleObj = {}) {
  return Object.entries(styleObj)
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
    )
    .join(";");
}

export function isDaysAgo(date, days) {
  const now = Date.now(); // current time in ms
  const targetTime = !(date instanceof Date) ? new Date(date) : date.getTime(); // convert Date object to ms
  const daysInMs = days * 24 * 60 * 60 * 1000; // days → ms

  return now - targetTime >= daysInMs;
}

/**
 * Extract all relevant CSS rules for one or more HTML elements.
 * - Fully supports @media, @supports, @keyframes, etc.
 * - Handles pseudo selectors like :hover, :focus, etc.
 * - Designed to run inside Web Worker (no real DOM required)
 * - Very fast: parses CSS once and matches selectors in memory
 *
 * @param {Object} params
 * @param {string|string[]} params.html - HTML string or array of HTML strings
 * @param {string} params.cssCode - Raw CSS code
 * @param {boolean} [params.nested=true] - Include child elements recursively
 * @returns {Promise<{rules: any[], stringRules: string}>}
 */
export async function getElementRulesWithAst({ html, cssCode, nested = true }) {
  if (!cssCode) throw new Error("CSS code is required");

  const { parse, stringify } = await import("css"); // npm: css
  const { parseHTML } = await import("linkedom"); // npm: linkedom

  // Normalize input
  const htmlArray = Array.isArray(html) ? html : [html];

  // Parse CSS once
  const ast = parse(cssCode);

  const matchedRules = [];
  const seenSelectors = new Set();
  const stack = [];

  // --- Build initial elements stack ---
  for (const htmlString of htmlArray) {
    const { document } = parseHTML(doDocument(htmlString));
    if (document.body?.firstElementChild) {
      stack.push(document.body.firstElementChild);
    }
  }

  // --- Helper: Get all selectors for a given element ---
  const getElementSelectors = (el) => {
    const selectors = [];

    // Tag
    if (el.tagName) selectors.push(el.tagName.toLowerCase());

    // Classes
    if (el.classList?.length) {
      el.classList.forEach((cls) => selectors.push(`.${cls}`));
    }

    // ID
    if (el.id) selectors.push(`#${el.id}`);

    // Attributes
    if (el.getAttributeNames) {
      for (const name of el.getAttributeNames()) {
        const value = el.getAttribute(name);
        selectors.push(value ? `[${name}="${value}"]` : `[${name}]`);
      }
    }

    return selectors;
  };

  // --- Helper: Does a selector match this element ---
  const selectorMatches = (ruleSelector, elementSelectors) => {
    return elementSelectors.some((sel) => {
      return (
        ruleSelector === sel || // exact match
        ruleSelector.startsWith(sel + ":") || // pseudo class
        ruleSelector.includes(sel + "::") || // pseudo element
        ruleSelector.split(/\s+/).includes(sel) // part of complex selector
      );
    });
  };

  // --- Walk through CSS AST recursively ---
  const walk = (rules, parentAtRule = null, selectorsToMatch = []) => {
    for (const rule of rules) {
      // Normal CSS rule
      if (rule.type === "rule" && rule.selectors) {
        if (
          rule.selectors.some((rSel) => selectorMatches(rSel, selectorsToMatch))
        ) {
          const uniqueKey =
            (parentAtRule ? parentAtRule.type : "root") +
            "|" +
            rule.selectors.join(",");

          if (!seenSelectors.has(uniqueKey)) {
            seenSelectors.add(uniqueKey);

            if (parentAtRule) {
              // Clone parent at-rule and only include this rule
              const cloned = JSON.parse(JSON.stringify(parentAtRule));
              cloned.rules = [rule];
              matchedRules.push(cloned);
            } else {
              matchedRules.push(rule);
            }
          }
        }
      }

      // Nested @media / @supports / etc.
      if (rule.rules) {
        walk(rule.rules, rule, selectorsToMatch);
      }

      // Keyframes, font-face, layer → always include
      if (["keyframes", "font-face", "layer"].includes(rule.type)) {
        const key = JSON.stringify(rule);
        if (!matchedRules.find((r) => JSON.stringify(r) === key)) {
          matchedRules.push(rule);
        }
      }
    }
  };

  // === Main Matching Loop ===
  while (stack.length > 0) {
    const el = stack.pop();
    if (!el) continue;

    const selectors = getElementSelectors(el);

    if (nested && el.children?.length) {
      stack.push(...Array.from(el.children));
    }

    walk(ast.stylesheet.rules, null, selectors);
  }

  // Build filtered AST
  const filteredAst = {
    type: "stylesheet",
    stylesheet: { rules: matchedRules },
  };

  return {
    rules: matchedRules,
    stringRules: stringify(filteredAst),
  };
}

/**
 *
 * @param {{elementsHTML : string | string[]  , cssCode:string}} param0
 * @returns
 */
export async function extractElementStyles({ elementsHTML, cssCode }) {
  if (!elementsHTML) return { rules: [], stringRules: "" };
  const { parse, stringify } = await import("css"); // npm: css
  const { parseHTML } = await import("linkedom"); // npm: linkedom

  // لو العنصر جاي كـ array، نجمعه
  const htmlString = Array.isArray(elementsHTML)
    ? elementsHTML.join("")
    : elementsHTML;

  // نجهز DOM وهمي
  const { document } = parseHTML(doDocument(htmlString));
  const root = document.firstElementChild;

  // نجمع كل العناصر (الابن + الأحفاد)
  const allElements = [root, ...root.querySelectorAll("*")];

  // نجمع جميع selectors الممكنة (id, class, attributes)
  const selectorsToMatch = new Set();
  allElements.forEach((el) => {
    // الكلاسات
    el.classList.forEach((cls) => selectorsToMatch.add(`.${cls}`));

    // id
    if (el.id) selectorsToMatch.add(`#${el.id}`);

    // attributes
    [...el.attributes].forEach((attr) => {
      selectorsToMatch.add(
        `[${attr.name}${attr.value ? `="${attr.value}"` : ""}]`
      );
    });
  });

  // Parse الـCSS مرة واحدة
  const ast = parse(cssCode);
  const matchedRules = [];

  /**
   * recursive function to walk nested rules
   */
  const walk = (rules, parentAtRule = null) => {
    for (const rule of rules) {
      if (rule.type === "rule" && rule.selectors) {
        // لو أي selector موجود ضمن العنصر أو ولاده
        const match = rule.selectors.some((sel) =>
          [...selectorsToMatch].some((target) => sel.includes(target))
        );

        if (match) {
          if (parentAtRule) {
            const cloned = JSON.parse(JSON.stringify(parentAtRule));
            cloned.rules = [rule];
            matchedRules.push(cloned);
          } else {
            matchedRules.push(rule);
          }
        }
      }

      // لو فيه nested rules زي media queries
      if (rule.rules) {
        walk(rule.rules, rule);
      }

      // قواعد خاصة زي keyframes أو font-face أو layer
      if (["keyframes", "font-face", "layer"].includes(rule.type)) {
        matchedRules.push(rule);
      }
    }
  };

  walk(ast.stylesheet.rules);

  const filteredAst = {
    type: "stylesheet",
    stylesheet: { rules: matchedRules },
  };

  return {
    rules: matchedRules,
    stringRules: stringify(filteredAst),
  };
}
