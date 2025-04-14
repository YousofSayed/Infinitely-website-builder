import parseObjectLiteral from "object-literal-parse";
import { parse as parseCss, stringify as stringifyCss } from "css";

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

  //extract x-ref scope :
  // const xRefScope = allAttributes
  //   .map((attrs) => attrs["x-ref"])
  //   .filter(Boolean);
  // let refWillContenx = ``;
  // for (let i = 0; i < xRefScope.length; i++) {
  //   refWillContenx += `${i == 0 ? "var $refs = {" : ""} ${xRefScope[i]} : $el ${
  //     i == xRefScope.length - 1 ? "}" : ","
  //   }`;
  // }

  return `
 ${dataWillContenx || ""}

 ${forWillContenx || ""}

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
          suffixes: key?.match?.(/\:\w+/gi),
          modifires: key?.match?.(/\.\w+/gi),
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
      .replace(/in/gi, "");
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
  const minified = await minify(code);
  if (minified.error) {
    throw new Error("Minification failed: " + minified.error);
  }

  // Return as a new Blob
  return new Blob([minified.code], {
    type:
      (type == "js" && "application/javascript") ||
      (type == "css" && "text/css") ||
      "",
  });
}

export function isDevMode(resolve = (result) => {}, reject = (result) => {}) {
  const isDev = import.meta.env.MODE === "development";
  if (isDev) {
    resolve(isDev);
  } else {
    reject(isDev);
  }
}

/**
 *
 * @param {File[]} files
 */
export function getFilesSize(files) {
  const bytesPerMB = 1048576; // 1 MB = 2^20 bytes
  const bytesPerGB = 1073741824; // 1 GB = 2^30 bytes
  const totalSizeInBytes = Array.from(files).reduce(
    (prev, current, currentIndex, arr) => {
      console.log("files : ", prev, current.size);
      return prev + current.size;
    },
    0
  );
  const totalSizeInMB = totalSizeInBytes / bytesPerMB;
  const totalSizeInGB = (totalSizeInBytes / bytesPerGB).toFixed(2);

  return {
    MB: +(totalSizeInMB).toFixed(2),
    GB: +totalSizeInGB,
  };
}


export function isChrome() {
  return navigator.userAgent.toLowerCase().includes('chrome')
}