import { Icons } from "../components/Icons/Icons";
import { filterUnits } from "../constants/cssProps";
import { css, html, random, uniqueID } from "./cocktail";
import { dynamic_container, dynamic_text } from "../constants/cmpsTypes";
import {
  projectDataType,
  projectSettingsType,
  refType,
  restModelType,
} from "./jsDocs";
import {
  current_project_id,
  current_symbol_rule,
  global_settings,
  inf_bridge_id,
  inf_class_name,
  inf_symbol_Id_attribute,
  inf_template_id,
  project_settings,
} from "../constants/shared";
import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { db } from "./db";
import html2canvas from "html2canvas-pro";
import { jsURLRgx } from "../constants/rgxs";
import { pvMount, pvUnMount } from "./customEvents";
import { toBlob } from "html-to-image";
export {
  replaceBlobs,
  base64ToBlob,
  blobToBase64,
  restoreBlobs,
} from "./bridge";
export const isValidCssUnit = (value) => {
  // Updated regex to match valid CSS units, calc(), or var(), but not single numbers
  const cssUnitRegex =
    /^\s*(-?\d+(\.\d+)?\s*(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|fr|deg|grad|rad|turn|s|ms|hz|khz)|calc\([^()]*\)|var\(--[a-zA-Z0-9-]+\))\s*$/i;
  return cssUnitRegex.test(value);
};

/**
 *
 * @param {string} prop
 */
export function getValFormMultiProp(prop) {
  return prop.replace(/\w+(\s+)?:/gi, "").replace(";", "") || "";
}

/**
 *
 * @param {string} prop
 */
export function toJsProp(prop) {
  return (
    prop
      .replace(/\w+(\s+)?:/gi, "")
      .replace(/-([a-z])/gi, (match, letter) => letter.toUpperCase()) || ""
  );
}

/**
 * @param {HTMLElement} el
 * @param {string} prop
 * @returns {{props : string[] , names:string[] , vals:string[] , namesAndVals:{[key : string]:string}}}
 */
export function getAllValsFromMultiProp(el, prop) {
  const props = getPropVal(el, prop)?.split(" ") || "";

  if (!props[0]) {
    return {
      props: [],
      names: [],
      vals: [],
      namesAndVals: {},
    };
  }

  const names = props.map((prop) => prop.replace(/\(.+\)/gi, ""));
  const vals = props.map((prop) =>
    prop
      .match(/\(.+\)/gi)
      .join("")
      .replace(/\(|\)/gi, "")
  );
  const namesAndVals = {};
  for (let i = 0; i < names.length; i++) {
    namesAndVals[names[i]] = +vals[i].match(/\d+/gi).join("");
  }

  // console.log(namesAndVals, vals);

  return {
    props,
    names,
    vals,
    namesAndVals,
  };
}

/**
 *
 * @param {{prevObjVals:{[key:string]:string} ,cssProp:string, propVal:string , propName:string}} param0
 */
export function setMultiValInProp({ prevObjVals, cssProp, propVal, propName }) {
  const vals = {
    ...prevObjVals,
    [propName]: +propVal <= 0 ? propVal * 100 : propVal,
  };
  !propName && delete vals[propName];

  let finalVlaue = ``;
  Object.keys(vals).forEach((val) => {
    finalVlaue += `${val}(${vals[val]}${filterUnits[val]})`;
  });

  currentEl.style[toJsProp(cssProp)] = finalVlaue;
}

export function hexToRgbA(hex) {
  // Remove the '#' if it exists
  let cleanedHex = hex.replace("#", "");

  // Handle 3 or 4 character HEX codes (shorthand versions)
  if (cleanedHex.length === 3 || cleanedHex.length === 4) {
    cleanedHex = cleanedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(cleanedHex.substring(0, 2), 16);
  const g = parseInt(cleanedHex.substring(2, 4), 16);
  const b = parseInt(cleanedHex.substring(4, 6), 16);

  // If HEX contains alpha (opacity) information
  let a = 1; // Default to fully opaque
  if (cleanedHex.length === 8) {
    a = parseInt(cleanedHex.substring(6, 8), 16) / 255;
  }

  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    opacity: Math.round(a * 100),
  };
}

export function rgbStringToHex(rgbString) {
  // Extract the numbers from the string
  if (!rgbString) return "";
  if (rgbString?.startsWith("#")) return rgbString;
  const result = rgbString.match(/\d+(\.\d+)?/g) || "";

  // Convert the extracted numbers to hexadecimal
  const r = parseInt(result[0], 10);
  const g = parseInt(result[1], 10);
  const b = parseInt(result[2], 10);

  const toHex = (component) => {
    const hex = component.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  let hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

  // If the input includes an alpha channel, handle it
  if (result.length === 4) {
    const a = Math.round(parseFloat(result[3]) * 255);
    const hexAlpha = toHex(a).toUpperCase();
    hexColor += hexAlpha;
  }
  return result ? hexColor : "";
}

export const getIconForMultiChoice = (iconName) => {
  return (strokeColor) =>
    Icons[iconName]({
      strokeColor: strokeColor,
      width: 16.5,
      height: 16.5,
    });
};

/**
 *
 * @param {import('grapesjs').Block[]} blocks
 * @param {import('grapesjs').Editor} editor
 * @returns {{[categoryName : string] : import('grapesjs').BlockProperties[]}}
 */
export function handleCustomBlock(blocks, editor) {
  /**
   * @type {{[categoryName : string] : import('grapesjs').BlockProperties[]}}
   */
  const ctgs = {};

  blocks.forEach((block) => {
    const id = block?.category?.id || block.category;

    if (Array.isArray(ctgs[id])) {
      ctgs[id].push(editor.Blocks.render(block, { external: true }));
    } else {
      ctgs[id] = [];
      ctgs[id].push(editor.Blocks.render(block, { external: true }));
    }
    console.log(id);
  });

  console.log("ctgs : ", ctgs);

  return ctgs;
}

export function isValidAttribute(key = "", value = "") {
  if (!key) {
    // throw Error(`key is undefined`);
    return;
  }
  try {
    const el = document.createElement("div");
    el.setAttribute(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 *
 * @param {{commandName:string , editor : import('grapesjs').Editor , forAll:boolean, showInDynamic:boolean ,  commandCallback:(editor:import('grapesjs').Editor)=>void , label:string , cmpType:string}} param0
 */
export function addItemInToolBarForEditor({
  commandName,
  editor,
  cmpType = "",
  commandCallback = (_) => {},
  showInDynamic = false,
  label,
  toolId = "",
  forAll = true,
}) {
  const selectedEl = editor.getSelected();
  const sleType = selectedEl.get("type");
  const toolbar = selectedEl.get("toolbar");
  const isExist = toolbar.find((item) => item.command == commandName);
  if (selectedEl.tagName == "body") return;

  const setToolbar = () => {
    !editor.Commands.has(commandName) &&
      editor.Commands.add(commandName, commandCallback);

    const newTool = {
      label: label,
      category: "custom",
      command: commandName,
    };

    // if( JSON.stringify([newTool, ...toolbar]) ==  JSON.stringify(toolbar)){
    //   console.warn('sherbtaha ya ahbal ?????????????????????????????????????');
    //   return;
    // }

    if (!isExist) {
      selectedEl.set({
        toolbar: newTool ? [newTool, ...toolbar] : toolbar,
      });
      console.log("another 1");
    } else {
      selectedEl.set({
        toolbar: toolbar,
      });
      console.log("another 2");

      selectedEl.initToolbar();
    }
  };

  // if (!showInDynamic) return;
  setToolbar();
}

export function getCloneArray(array = []) {
  return [...array];
}

/**
 *
 * @param {string} str
 * @returns {object | null}
 */
export function evalObject(str) {
  try {
    const rgx = /\w+(\s+)?\:|\{|\}/gi;
    // str=str.replaceAll(rgx)
    const splited = str.replaceAll(rgx, "").split(",");
    splited.forEach((val) => {
      // console.log(`"${val}"`, val);

      str = str.replaceAll(val.trim(), `"${val}"`.trim());
    });
    // console.log("3agaby : ", str, splited);
    return new Function(`
      return ${str}`)();
  } catch (error) {
    console.warn("Error evaluating the string to object:", error.message);
    return null;
  }
}

// console.log("evooooo : ", evalObject(`{ me: 'hello' + me }`));

export function objectToString(obj) {
  const stringify = (value) => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return `${value}`; // Wrap strings in quotes
    if (typeof value === "number" || typeof value === "boolean")
      return String(value); // Numbers and booleans
    if (Array.isArray(value)) {
      // Handle arrays
      return `[${value.map(stringify).join(", ")}]`;
    }
    if (typeof value === "object") {
      // Handle objects
      const entries = Object.entries(value)
        .map(([key, val]) => `${key}: ${stringify(val)}`)
        .join(", ");
      return `{ ${entries} }`;
    }
    if (typeof value === "function") {
      // Handle functions (convert to their string representation)
      return value.toString();
    }
    return `"${String(value)}"`; // Fallback for other types
  };

  return stringify(obj);
}

// /**
//  *
//  * @param {string[]} array
//  * @param {string} query
//  * @param {boolean} ignoreLastSpace
//  * @returns
//  */
// export function advancedSearchSuggestions(array, query = "", ignoreLastSpace) {
//   // if (ignoreLastSpace && (!query || query.endsWith(" "))) return [];
//   if (!query) return array;
//   const lowerQuery = query.toLowerCase();

//   // Score a single item based on query
//   function score(item) {
//     const lowerItem = item.toLowerCase();
//     let queryIndex = 0;
//     let score = 0;

//     for (let i = 0; i < lowerItem.length; i++) {
//       if (lowerItem[i] === lowerQuery[queryIndex]) {
//         score += 10; // Matching characters get higher scores.
//         if (i === 0 || lowerItem[i - 1] === "_") {
//           score += 5; // Bonus for matching after a separator (e.g., `_`).
//         }
//         queryIndex++;
//         if (queryIndex >= lowerQuery.length) break;
//       } else {
//         score -= 1; // Penalize mismatched characters slightly.
//       }
//     }

//     return queryIndex === lowerQuery.length ? score : -Infinity; // Exclude items if query is not fully matched.
//   }

//   const suggestions = array
//     .map((item) => ({ item, score: score(item) })) // Score each item.
//     .filter(({ score }) => score > -Infinity) // Keep only items that matched the query.
//     .sort((a, b) => b.score - a.score) // Sort by descending score.
//     .map(({ item }) => item); // Return only the items.
//   // !suggestions.length && suggestions.push('No Items Founded...')
//   return suggestions;
// }

/**
 *
 * @param {Array<string | object>} array - Array of strings or objects to search through
 * @param {string} query - Search query
 * @param {boolean} ignoreLastSpace - If true, ignore suggestions when query ends with a space
 * @param {string|string[]} [targetKeys] - Optional keys to search in if array contains objects
 * @returns {Array<string | object>} - Filtered and sorted suggestions
 */
export function advancedSearchSuggestions(
  array,
  query = "",
  ignoreLastSpace,
  targetKeys = null
) {
  if (!query) return array; // Return full array if no query
  if (ignoreLastSpace && query.endsWith(" ")) return []; // Bail if ignoring trailing space
  console.log("query : ", query);

  const lowerQuery = query.toLowerCase();

  // Score a single item based on query
  function score(value) {
    const lowerValue = value.toLowerCase();
    let queryIndex = 0;
    let score = 0;

    for (let i = 0; i < lowerValue.length; i++) {
      if (lowerValue[i] === lowerQuery[queryIndex]) {
        score += 10; // Match bonus
        if (i === 0 || lowerValue[i - 1] === "_") {
          score += 5; // Start or separator bonus
        }
        queryIndex++;
        if (queryIndex >= lowerQuery.length) break;
      } else {
        score -= 1; // Mismatch penalty
      }
    }

    return queryIndex === lowerQuery.length ? score : -Infinity; // Must fully match query
  }

  // Handle both strings and objects
  const scoredItems = array.map((item) => {
    if (typeof item === "string") {
      // String case: score directly
      return { item, score: score(item) };
    } else if (typeof item === "object" && targetKeys) {
      // Object case: score based on targetKeys
      const keys = Array.isArray(targetKeys) ? targetKeys : [targetKeys];
      const scores = keys
        .filter((key) => item[key] && typeof item[key] === "string") // Only valid string keys
        .map((key) => score(item[key]));
      const maxScore = Math.max(...scores, -Infinity); // Best score across keys
      return { item, score: maxScore };
    }
    return { item, score: -Infinity }; // Invalid item type or no keys
  });

  const suggestions = scoredItems
    .filter(({ score }) => score > -Infinity) // Keep matches
    .sort((a, b) => b.score - a.score) // Sort by score
    .map(({ item }) => item); // Extract items

  return suggestions.length ? suggestions : array; // Return array if no matches
}

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @returns
 */
export function getCurrentMediaDevice(editor) {
  const desktopDevices = ["desktop", "DESKTOP", "Desktop"];
  // console.log(desktopDevices.findIndex((value) => value == editor.getDevice()));

  const Media =
    desktopDevices.findIndex((value) => value == editor.getDevice()) == -1
      ? {
          atRuleType: "media",
          atRuleParams: `(max-width: ${editor.Devices.get(
            editor.getDevice()
          ).getWidthMedia()})`,
        }
      : {};

  return Media;
}

export const replaceLastWord = (
  string = "",
  newValue = "",
  ignoreCurlyBrackets = false
) => {
  const arrOfString = string.split(" ");
  const lastIndex = arrOfString.length - 1;

  arrOfString[lastIndex] = ignoreCurlyBrackets ? newValue : `\$\{${newValue}\}`;

  return arrOfString.join(" ");

  // if (arrOfString.length == 1) {
  //   console.log(
  //     "lenfthooo : ",
  //     arrOfString.length,
  //     string.replace(string, newValue)
  //   );

  //   return string.replace(string, newValue);
  // }

  // const mappedArrOfString = arrOfString
  //   .map((str, i) => {
  //     if (i + 1 == arrOfString.length) {
  //       return str.replace(str, newValue);
  //     } else {
  //       return str;
  //     }
  //   })
  //   .join(" ");
  // return mappedArrOfString;
};

export function extractRulesById(cssText, selector) {
  // Regex specifically to find rules containing the ID selector
  const idRegex = new RegExp(`(${selector}[^{}]*{[^{}]*})`, "g");
  const matches = cssText.match(idRegex) || [];
  return matches.map((rule) => rule.trim());
}

export function extractRulesBySelector(cssText, selector) {
  // Escape special characters in the selector for regex
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a regex based on the type of selector
  const regex = new RegExp(`(${escapedSelector}\\s*{[^{}]*})`, "g");

  // Match and return the results
  const matches = cssText.match(regex) || [];
  return matches.map((rule) => rule.trim());
}

export function extractRulesByIdWithDetails(cssText, selector) {
  // Escape the selector for use in a regex
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Regex to match rules containing the ID selector or attribute selector with optional states
  const selectorRegex = new RegExp(
    `(${escapedSelector}|\\[${escapedSelector}\\s*=\\s*"[^"]*"\\])` +
      `(:{1,2}[a-zA-Z-]+)*\\s*{[^{}]*}`,
    "g"
  );

  const atRuleRegex =
    /@(media|supports|keyframes|font-face|import|page|namespace|charset|document|viewport|counter-style|property)\s*([^{]*)/gi;

  const details = [];

  let match;
  while ((match = selectorRegex.exec(cssText)) !== null) {
    const rule = match[0];
    const ruleStart = match.index;

    // Extract states (e.g., :hover, ::before)
    const stateMatches = rule.match(
      new RegExp(
        `(${escapedSelector}|\\[${escapedSelector}\\s*=\\s*"[^"]*"\\])` +
          `((:{1,2}[a-zA-Z-]+)+)`
      )
    );
    const states = stateMatches ? stateMatches[2] : null;

    // Create states as an array
    const statesAsArray = states ? states.match(/:{1,2}[a-zA-Z-]+/g) : [];

    // Look backwards to find the nearest @rule before this rule
    const beforeText = cssText.substring(0, ruleStart);
    let atRuleMatch;
    let atRuleType = null;
    let atRuleParams = null;

    while ((atRuleMatch = atRuleRegex.exec(beforeText)) !== null) {
      atRuleType = atRuleMatch[1];
      atRuleParams = atRuleMatch[2]?.trim();
    }

    const styles = {};
    const matching = rule
      .trim()
      .split(/\n|\n+|\s|\s+/gi)
      .join("")
      .match(/\{.+\}/gi)
      .join("")
      .replaceAll(/\{|\}/gi, "")
      .split(";")
      .filter((mt) => mt)
      .map((style) => {
        return style.split(":").filter((st) => st);
      })
      .forEach(([key, value]) => {
        styles[key] = value;
      });
    matching;

    const fullRule = atRuleType
      ? css`
          @${atRuleType} ${atRuleParams} {
            ${rule}
          }
        `
      : null;

    details.push({
      id: uniqueID() + random(10),
      rule: rule.trim(),
      fullRule,
      styles: styles,
      states: states || null,
      statesAsArray,
      atRuleType: atRuleType || null,
      atRuleParams: atRuleParams || null,
    });
  }

  return details;
}

export function generateBeautifulHexColor(includeOpacity = false, opacity = 1) {
  // Ensure opacity is between 0 and 1
  opacity = Math.max(0, Math.min(opacity, 1));

  // Generate a random hue (0 - 360 degrees)
  const hue = Math.floor(Math.random() * 360);

  // Fixed saturation and lightness for vibrant and beautiful colors
  const saturation = 70; // 70%
  const lightness = 50; // 50%

  // Helper function to convert HSL to Hex
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));

    return `#${f(0).toString(16).padStart(2, "0")}${f(8)
      .toString(16)
      .padStart(2, "0")}${f(4).toString(16).padStart(2, "0")}`;
  }

  // Helper function to convert HSL to RGBA
  function hslToRgba(h, s, l, alpha) {
    s /= 100;
    l /= 100;

    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));

    return `rgba(${f(0)}, ${f(8)}, ${f(4)}, ${alpha})`;
  }

  // Generate and return the color
  return includeOpacity
    ? hslToRgba(hue, saturation, lightness, opacity)
    : hslToHex(hue, saturation, lightness);
}

/**
 *
 * @param {string} css
 * @param {import('grapesjs').Component} parentEl
 * @returns
 */
export const extractChildsRules = (css = "", parentEl) => {
  const elRules = {};
  parentEl.find("*").forEach((el) => {
    const elClassName = el.getAttributes()[inf_class_name];
    if (!elClassName) return;
    elRules[elClassName] = extractRulesById(css, `.${elClassName}`);
  });
  return elRules;
};

/**
 *
 * @param {string} css
 * @param {import('grapesjs').Component} parentEl
 * @returns
 */
export function extractAllRulesWithChildRules(css = "", parentEl) {
  const parentClassName = parentEl.getAttributes()[inf_class_name];
  const parentRules = extractRulesById(css, `.${parentClassName}`);
  const childRules = extractChildsRules(css, parentEl);

  return {
    asObject: {
      parent: parentRules,
      childs: childRules,
    },
    asString: `${parentRules.join("\n")}\n${Object.values(childRules)
      .map((rules) => rules.join("\n"))
      .join("\n")}}`,
  };
}

/**
 *
 * @param {import('grapesjs').Component} cmp
 */
export function isDynamicComponent(cmp) {
  let isDynamic = false;
  const type = cmp.get("type").toLowerCase();
  if (type == dynamic_container) {
    isDynamic = true;
    return isDynamic;
  }

  cmp.parents().forEach((parent) => {
    if (parent.get("type").toLowerCase() == dynamic_container) {
      isDynamic = true;
    }
  });
  return isDynamic;
}

export function stringifyKeyframes(keyframe) {
  // Start with the @keyframes name
  let css = `@keyframes ${keyframe.name} {\n`;

  // Loop through each keyframe step
  keyframe.values.forEach(({ percentage, styles }) => {
    // Add percentage and start a new block
    css += `  ${percentage}% { `;

    // Add each style rule
    for (const [property, value] of Object.entries(styles)) {
      css += `${property}: ${value}; `;
    }

    // Close the block
    css += `}\n`;
  });

  // Close the @keyframes
  css += `}`;
  return css;
}

export function extractKeyframesAsCSSString(keyframesString) {
  const keyframePattern = /(\d+%)\s*\{([^\}]*)\}/g;
  let result = "";

  let match;
  while ((match = keyframePattern.exec(keyframesString)) !== null) {
    const percentage = match[1].trim();
    const styles = match[2].trim().replace(/\s+/g, " ");
    result += `${percentage} { ${styles} } `;
  }

  return result.trim();
}

export const getWindowBuiltInClasses = () => {
  const builtInClasses = Object.getOwnPropertyNames(window).filter((key) => {
    try {
      const item = window[key];
      return (
        typeof item === "function" &&
        item.prototype &&
        key[0].toUpperCase() === key[0]
      );
    } catch (e) {
      // Ignore properties we don't have access to
      return false;
    }
  });

  return builtInClasses;
};

export const getDocumentBuiltInClasses = () => {
  const documentKeys = [];

  for (let key in document) {
    documentKeys.push(key);
  }
  return documentKeys;
};

export const getArrayProps = () => {
  const arrayFunctions = Object.getOwnPropertyNames(Array.prototype).filter(
    (key) => {
      return typeof Array.prototype[key] === "function";
    }
  );

  return arrayFunctions;
};

export function getAllStandardCSSProperties() {
  // Create a temporary element
  const tempElement = document.createElement("div");

  // Collect all properties
  const supportedProperties = [];
  for (let property in tempElement.style) {
    // Include only non-prefixed properties
    if (
      !property.startsWith("webkit") &&
      !property.startsWith("moz") &&
      !property.startsWith("ms") &&
      !property.startsWith("o")
    ) {
      supportedProperties.push(property);
    }
  }

  // Sort and return
  return supportedProperties.sort();
}

export function getAllCssProperties() {
  // Create a dummy element to retrieve the styles
  const element = document.createElement("div");
  document.body.appendChild(element); // Append it to the DOM to access computed styles

  // Get the computed styles for the element
  const computedStyles = window.getComputedStyle(element);

  // Create an array of all properties
  const cssProperties = [];

  // Iterate over all the computed style properties
  for (let i = 0; i < computedStyles.length; i++) {
    const prop = computedStyles[i];
    // Convert from kebab-case to camelCase
    const camelCaseProp = prop.replace(/-([a-z])/g, (match, letter) =>
      letter.toUpperCase()
    );
    cssProperties.push(camelCaseProp);
  }

  // Clean up by removing the dummy element
  document.body.removeChild(element);

  return cssProperties;
}

function transformJSONObjToHSObject(
  object = "{}",
  removeCurlyBrackets = false
) {
  let hsObject = ``;
  const buildParams = JSON.parse(object || "{}");
  const keys = Object.keys(buildParams);
  keys.forEach((key, i) => {
    hsObject += `${key} : ${buildParams[key]} ${
      i == keys.length - 1 ? "" : ","
    }`;
  });
  return removeCurlyBrackets ? hsObject : `{${hsObject}}`;
}

/**
 *
 * @param {import('./types').CMD[]} cmds
 */
export function buildScriptFromCmds(cmds) {
  const clone = structuredClone(cmds);

  let script = `init `;

  clone.forEach((key, i) => {
    clone[i].params.forEach((param) => {
      if (!clone[i].params.length) return;

      if (!param.value && !param.required) {
        clone[i].cmd = clone[i].cmd.replaceAll(`{${param.name}}`, "");
        return;
      }

      if (param.type == "object" && !param.removeCurlyBrackets) {
        const hsObject = transformJSONObjToHSObject(param.value);
        // let params = ``;
        // const buildParams = JSON.parse(param.value || '{}');
        // Object.keys(buildParams).forEach(key=>{
        //   params+= `${key} : ${buildParams[key]},`
        // })
        clone[i].cmd = clone[i].cmd.replaceAll(`{${param.name}}`, hsObject);
        // .replaceAll(/\{|\}/gi,'');
        return;
      }

      if (param.type == "object" && param.removeCurlyBrackets) {
        const hsObject = transformJSONObjToHSObject(param.value, true);

        // let params = ``;
        // const buildParams = JSON.parse(param.value || '{}');
        // Object.keys(buildParams).forEach(key=>{
        //   params+= `${key} : ${buildParams[key]},`
        // })
        clone[i].cmd = clone[i].cmd.replaceAll(`{${param.name}}`, hsObject);
        // .replaceAll(/\{|\}/gi,'');
        return;
      }

      clone[i].cmd = clone[i].cmd.replaceAll(
        `{${param.name}}`,
        param.value || ""
      );
    });

    clone[i].cmd = clone[i].cmd
      .replace(`{option}`, clone[i].optionValue)
      .replaceAll("[object Object]", "{}");

    script +=
      clone[i].cmd +
      (!clone[i].starter && i != clone.length - 1 ? " then \n " : " "); //+ (i == clone.length - 1 ? "" : "\n then \n");
  });

  return script;
}

/**
 *
 * @param {import('./types').CMD[]} cmds
 */
export function parseCmds(cmds) {
  const script = buildScriptFromCmds(cmds);
  const vars = {};
  script
    .match(/set(\s+)?(\$|\:)\w+(\s+)?to(\s+)?(\'|\`|\")?\w+(\'|\`|\")?|/gi)
    .filter((item) => item)
    .forEach((item) => {
      const keyV = item.split(" ").filter((item2) => {
        if (item2.toLowerCase() == "set" || item2.toLowerCase() == "to") return;
        else return item;
      });

      vars[keyV[0].trim()] = keyV[1].trim();
    });

  const params = script
    .match(/\w+\((\w+(,)?)+\)|/gi)
    .filter((item) => item)
    .map((item) =>
      item
        .split(/\w+(\s+)?\(|\)/gi)
        .join("")
        .split(",")
    );

  const objectskeys = {};

  (script || "")
    .match(
      /set(\s+)?(\$|\:)\w+(\s+)?to(\s+)?\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}|/g
    )
    .map((val) => val.replaceAll(/set/gi, ""))
    .filter((item) => item)
    .forEach((obj) => {
      if (!obj) return;
      // const vObj = [];
      // const evaluatedObj = evalObject(obj) | {};
      // Object.keys(evaluatedObj).forEach((key) => vObj.push(key));
      // return vObj;
      const keyV = obj.split("to").filter((txt) => txt);
      objectskeys[keyV[0].trim()] = keyV[1].trim();
    });
  const objectsRgx = /set(\s+)?(\$|\:)\w+(\s+)?to(\s+)?\{.+\}|/gi;
  const val = (script || "")
    .split("\n")
    .join(" ")
    .match(objectsRgx)
    .filter((item) => item);

  Object.keys(objectskeys).forEach((key) => {
    objectskeys[key] = evalObject(objectskeys[key]);
  });

  const forIndexes =
    script
      ?.match?.(/index\s+\w+(\s+)?/gi)
      ?.map((item) => item.replace("index", ""))
      .filter(Boolean) || [];
  console.log(
    "for indexes",
    forIndexes,
    script,
    script?.match(/index\s+\w+(\s+)?/gi)
  );

  // script?.match?.(/index\s+\w+(\s+)?/ig)?.map(item=>item.replace('index'))

  return {
    vars,
    params,
    objectskeys,
    forIndexes,
  };
}

/**
 *
 * @param {import('./types').RestAPIModel[]} restModels
 * @param {string} valueToView
 * @returns
 */
export function viewDynamicContent(restModels = [], valueToView = "") {
  try {
    const restModelsContext = restModels
      .map((model) => `var \$${model.varName} = ${model.response}`)
      .join("\n\n");

    valueToView = valueToView.replaceAll(/\[\w+\]/gi, (value) => {
      return value.replaceAll(/\w+/gi, "0");
    });
    valueToView =
      valueToView.startsWith("`") && valueToView.endsWith("`")
        ? valueToView
        : `\`${valueToView}\``;

    if (!restModelsContext) return "";
    const view = new Function(
      `${restModelsContext}\n\n return ${valueToView}`
    )();
    return view;
  } catch (error) {
    console.error(error);
    return "";
  }
}

/**
 *
 * @param {import('./types').CMD[]} cmds
 */
export function parseCmdsFromCMDS(cmds) {
  const vars = {},
    params = [],
    classes = {},
    forVars = {},
    forIndexes = [];

  cmds.forEach((cmd, i) => {
    cmd.params.forEach((param, x) => {
      if (param.role == "varName") {
        vars[param.value] = null;
      }
    });
  });
}

export function flattenObject(arr, prefixVar = "", separator = ".") {
  const schema = {};

  function traverse(obj, prefix = "") {
    if (obj === null || obj === undefined) {
      schema[prefix || prefixVar] = obj;
      return;
    }

    if (typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullPath = prefix
            ? `${prefix}${separator}${key}`
            : `${prefixVar}${separator}${key}`;
          if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key])
          ) {
            traverse(obj[key], fullPath);
          } else {
            schema[fullPath] = obj[key]; // Last value overwrites previous
          }
        }
      }
    }
  }

  if (Array.isArray(arr)) {
    arr.forEach((obj) => traverse(obj));
  } else if (typeof arr === "object") {
    traverse(arr);
  }

  return schema;
}

// export function flatResponse(response, varName) {
//   return flatten(
//     { [varName]: response },
//     {
//       transformKey(key) {
//         return typeof +key == "number" && !Number.isNaN(+key) ? `[index]` : key;
//       },
//       maxDepth: Infinity,
//     }
//   );
// }

export function parseDynamicContent(content = "", dKeyV = {}) {
  let newContent = content;
  for (const key in dKeyV) {
    newContent = newContent.replaceAll(`\${${key}}`, dKeyV[key]);
  }
  return newContent;
}

export const getModelResAndKeys = (models = restModelType) => {
  let keys = [];
  let res = {};
  // modelsName.forEach((model) => {
  //   const currentModel = restModels.filter((md) => md.name == model)[0];
  //   const modelRes = flattenObject(
  //     JSON.parse(currentModel.response),
  //     currentModel.varName
  //   );
  //   keys = keys.concat(Object.keys(modelRes));
  //   res = { ...res, ...modelRes };
  // });
  models.forEach((model) => {
    // console.log();

    // const modelRes = flattenObject(
    //   model?.response ? JSON.parse(model.response) : {},
    //   model.varName
    // );

    const modelRes = flatResponse(
      JSON.parse(model?.response || "{}"),
      model.varName
    );
    keys = keys.concat(Object.keys(modelRes));
    res = { ...res, ...modelRes };
  });
  return { keys, res };
};

/**
 *
 * @param {import('grapesjs').Editor} editor
 * @param {import('./types').ProjectData} currentprojectData
 * @param {(previousProjectData : import('./types').ProjectData )=>import('./types').ProjectData} projectData
 */
export function storeProjectData(
  editor,
  projectData = (previousProjectData) => {}
) {
  editor.Storage.store({
    ...editor.getProjectData(),
    ...projectData({
      ...editor.getProjectData(),
      ...structuredClone(projectDataType),
    }),
  });
}

export function jsToDataURL(jsCode) {
  // Encode the JavaScript code as a URI component
  const encodedJS = encodeURIComponent(jsCode);

  // Create a Data URL with the MIME type `application/javascript`
  const dataURL = `data:application/javascript;charset=utf-8,${encodedJS}`;

  return dataURL;
}

export function cssToDataURL(cssText) {
  const base64Css = btoa(unescape(encodeURIComponent(cssText)));
  return `data:text/css;base64,${base64Css}`;
}

export function transformToJSX(htmlString) {
  // Parse the input HTML string
  return (
    htmlString
      .replace(
        /<(\w+)/g,
        (_, tagName) => `<${tagName[0].toUpperCase()}${tagName.slice(1)}`
      ) // Capitalize the tag name
      // .replace(/="([^"]*)"/g, (_, attrValue) => `=${attrValue}`) // Remove quotes around attribute values
      .replace(
        /<\/(\w+)/g,
        (_, tagName) => `</${tagName[0].toUpperCase()}${tagName.slice(1)}`
      )
  ); // Close the tag with capitalized name
}

/**
 *
 * @param {import('grapesjs').Component} gjsCmp
 * @returns {{isSymbol:boolean , isChild:boolean , mainId:string, childId:string, symbol:import('grapesjs').Component , attrVal:string}}
 */
export function getInfinitelySymbolInfo(gjsCmp) {
  const output = {
    isSymbol: false,
    isChild: false,
    symbol: undefined,
    mainId: "",
    childId: "",
  };
  if (!gjsCmp) return output;
  const attrVal = gjsCmp.getAttributes()[inf_symbol_Id_attribute];
  const parentSymbol = gjsCmp
    .parents()
    .find((cmp) => cmp.getAttributes()[inf_symbol_Id_attribute]);
  if (attrVal) {
    output.isSymbol = true;
    output.symbol = gjsCmp;
    output.mainId = attrVal;
  } else if (parentSymbol) {
    output.isSymbol = true;
    output.isChild = true;
    output.symbol = parentSymbol;
    output.mainId = parentSymbol.getAttributes()[inf_symbol_Id_attribute];
    output.childId = gjsCmp.getAttributes()[inf_bridge_id];
  }
  return output;
}

/**
 *
 * @param {string} id
 * @param {import('grapesjs').Editor} editor
 */
export function initSymbol(id, editor) {
  /**
   *
   * @param {import('grapesjs').Component} sle
   */
  const handler = (id = "", cmp, newContent = "") => {
    if (!id || !newContent) return;
    const symbols = editor
      .getWrapper()
      .find(`[${inf_symbol_Id_attribute}="${id}"]`);
    const selectedCmp = editor.getSelected() || cmp;
    const selectedSymbol = getInfinitelySymbolInfo(selectedCmp);

    if (!selectedSymbol.isSymbol) {
      console.log("not symbol : ");
      return;
    }
    symbols.forEach((symbol) => {
      if (
        symbol.toHTML({ withProps: true, keepInlineStyle: true }) ==
        selectedSymbol.symbol.toHTML({ withProps: true, keepInlineStyle: true })
      ) {
        console.log(
          "hhhhhaaaanddddlerrrr",
          symbols,
          symbol == selectedCmp.symbol,
          symbol.getEl(),
          selectedSymbol.symbol.getEl()
        );
        return;
      } else {
        symbol.replaceWith(JSON.parse(newContent));
        console.log("Replaced");
        // symbol.replaceWith(regenerateSymbol(JSON.parse(newContent)));
        // symbol.set('content', regenerateSymbol(JSON.parse(newContent)));
      }
    });
  };

  editor.on(`${InfinitelyEvents.symbols.update}:${id}`, handler);
}

/**
 *
 * @param {import('./types').JSONComponent} cmp
 */
export function regenerateSymbol(cmp) {
  cmp.type != "textnode" && (cmp.attributes.id = uniqueID());
  if (cmp.components && Object.keys(cmp.components).length) {
    Object.keys(cmp.components).forEach((key) => {
      regenerateSymbol(cmp.components[key]);
    });
  }
  return cmp;
}
// {"background-image":{"fileName":"hero_endframe__cvklg0xk3w6e_large 2.png","media":{"atRuleType":"media","atRuleParams":"(max-width: 360px)"},"rule":".inf-MjgyOQ"}}
{
  /* <section
  data-gjs-highlightable="true"
  id="ixkz"
  data-gjs-type="default"
  draggable="true"
  inf-class-name="inf-MjgyOQ"
  inf-css-urls='{"background-image":{"fileName":"hero_endframe__cvklg0xk3w6e_large 2.png","media":{"atRuleType":"media","atRuleParams":"(max-width: 360px)"},"rule":".inf-MjgyOQ"}}'
  class="parent inf-MjgyOQ"
>
  <section
    data-gjs-highlightable="true"
    id="i421"
    data-gjs-type="dynamic container"
    draggable="true"
    x-data="{
posts : ['post-1' , 'post-2']

}"
    inf-class-name="inf-MjY4NA"
    class="dynamic-temp inf-MjY4NA"
  >
    <template
      data-gjs-highlightable="true"
      id="iuua"
      data-gjs-type="template"
      draggable="true"
      x-for="(post , i) in posts"
      x-text=""
      class="parent minh-60"
    ></template>
  </section>
</section>; */
}
/**
 *
 * @param {string} selector
 * @param {import('grapesjs').Component} cmp
 */
export function getCurrentSelector(selector, cmp) {
  if (!cmp) return "";
  const symbolInfo = getInfinitelySymbolInfo(cmp);
  let currentSelector = null;
  if (selector?.toString()) {
    console.log("selector", selector.toString());

    currentSelector = selector;
  }
  //  else if (symbolInfo.isSymbol && !symbolInfo.isChild) {
  //   currentSelector = `[${inf_symbol_Id_attribute}="${symbolInfo.mainId}"]`;
  // }
  // else if (symbolInfo.isSymbol && symbolInfo.isChild) {
  //   // const childId =
  //   //   cmp.getAttributes()[
  //   //     `[${inf_symbol_instance_Id_attribute}-${symbolInfo.mainId}]`
  //   //   ];
  //   // const uuid = uniqueID();
  //   // if (!childId) {
  //   //   cmp.addAttributes({
  //   //     [`${inf_symbol_instance_Id_attribute}-${symbolInfo.mainId}`]: uuid,
  //   //     [inf_bridge_id]: uuid,
  //   //   });
  //   // }
  //   currentSelector = `[${inf_symbol_instance_Id_attribute}-${symbolInfo.mainId.toLowerCase()}="${
  //     symbolInfo.childId
  //   }"]`;
  // }
  else {
    const newClassName = `inf-${uniqueID()}`;
    const infClassName = cmp.getAttributes()[inf_class_name];

    if (!infClassName) {
      cmp.addAttributes({
        [inf_class_name]: newClassName,
      });
    }
    cmp.addClass(infClassName ? infClassName : newClassName);
    currentSelector = `.${infClassName ? infClassName : newClassName}`;
    // currentSelector = `#${cmp.getId()}`;
    // console.log("else");
  }

  return currentSelector;
}

export async function getProjectData() {
  const projectId = +localStorage.getItem(current_project_id);
  return await db.projects.get(projectId);
}

/**
 *
 * @param {import('grapesjs').Component} component
 */
export function getDynamicComponent(component) {
  if (!component) return null;
  if (component.get("type").toLowerCase() == dynamic_container)
    return component;
  //==== Else
  return component
    .parents()
    .find((cmp) => cmp.get("type").toLowerCase() == dynamic_container);
}

/**
 *
 * @param {import('grapesjs').Component} component
 */
export function getDynamicComponentInfo(component) {
  /**
   * @type {{isDynamic:boolean , isChild:boolean , component:import('grapesjs').Component|null , id:string|null}}
   */
  const info = {
    isDynamic: false,
    isChild: false,
    component: null,
    id: null,
  };
  // const attr = component.getAttributes()[inf_dy ]
  if (component.get("type").toLowerCase() == dynamic_container)
    return component;
  //==== Else
  return component
    .parents()
    .find((cmp) => cmp.get("type").toLowerCase() == dynamic_container);
}

/**
 *
 */
export function getGlobalSettings() {
  /**
   * @type {import('./types').GlobalSettings}
   */
  const globalSettings = JSON.parse(
    localStorage.getItem(global_settings) ||
      JSON.stringify({
        autoSave: true,
        saveDelay: 1000,
      })
  );

  return {
    globalSettings,
    /**
     *
     * @param {import('./types').GlobalSettings} newData
     */
    set(newData) {
      localStorage.setItem(
        global_settings,
        JSON.stringify({
          ...globalSettings,
          ...newData,
        })
      );
    },
  };
}

/**
 *
 */
export function getProjectSettings() {
  /**
   * @type {import('./types').ProjectSetting}
   */
  const projectSettings = JSON.parse(
    localStorage.getItem(project_settings) ||
      JSON.stringify({
        ...projectSettingsType,
      })
  );

  return {
    projectSettings,
    /**
     *
     * @param {import('./types').ProjectSetting} newData
     */
    set(newData) {
      localStorage.setItem(
        project_settings,
        JSON.stringify({
          ...projectSettings,
          ...newData,
        })
      );
    },
  };
}

/**
 *
 * @param {keyof import('./types').ProjectSetting} prop
 * @param {(projectSettings :import('./types').ProjectSetting, set:(newData : import('./types').ProjectSetting))=>void} resolve
 * @param {(projectSettings :import('./types').ProjectSetting, set:(newData : import('./types').ProjectSetting))=>void} reject
 */
export function isProjectSettingPropTrue(
  prop,
  resolve = () => {},
  reject = () => {}
) {
  const projectSettings = getProjectSettings();
  if (projectSettings.projectSettings[prop]) {
    resolve(projectSettings.projectSettings, projectSettings.set);
  } else {
    reject(projectSettings.projectSettings, projectSettings.set);
  }
}

export function debounce(callback, delay) {
  let timer = null; // Explicitly set to null initially
  return function (...args) {
    if (timer) clearTimeout(timer); // Clear the existing timeout
    timer = setTimeout(() => {
      callback.apply(this, args); // Preserve `this` and pass arguments
    }, delay);
  };
}

export function getGlobalSymbolRuleInfo() {
  /**
   * @type {import('./types').GlobalSymbolRule}
   */
  const globalSymbolRuleInfo = JSON.parse(
    sessionStorage.getItem(current_symbol_rule) || "{}"
  );

  return globalSymbolRuleInfo;
}

/**
 *
 * @param {import('./types').LibraryConfig[]} libs
 */
export async function getScripts(libs) {
  const scripts = Promise.all(
    libs.map(async (lib) =>
      lib.isCDN
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
              ${lib.defer && `defer=${lib.defer}`}
              ${lib.async && `async=${lib.async}`}
              name="${lib.name}"
            >
              ${await lib.file.text()};
            </script>
          `
    )
  );

  return (await scripts).join("\n");
}

/**
 *
 * @param {import('./types').LibraryConfig[]} libs
 */
export async function getStyles(libs) {
  const styles = Promise.all(
    libs.map(async (lib) =>
      lib.isCDN
        ? html` <link href="${lib.fileUrl}" name="${lib.name}" /> `
        : html`
            <style name="${lib.name}">
              ${await lib.file.text()};
            </style>
          `
    )
  );

  return (await styles).join("\n");
}

export function jsonToHtml(components) {
  if (!components) return "";

  // Ensure components is an array
  const componentArray = Array.isArray(components) ? components : [components];

  return componentArray
    .map((comp) => {
      const {
        tagName = "div",
        attributes = {},
        components = [],
        content = "",
        type,
      } = comp;

      // Convert attributes object to a string
      const attrString = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

      // Recursively process child components
      const childrenHtml = jsonToHtml(components);

      return type == "textnode"
        ? content
        : `<${tagName} ${attrString}>${content}${childrenHtml}</${tagName}>`;
    })
    .join("");
}

/**
 *
 * @param {import('./types').TraitCallback} callback
 */
export function traitCallback(
  callback = ({ editor, newValue, oldValue, trait }) => {}
) {
  return callback;
}

/**
 *
 * @param {import('./types').InfinitelyTrait[]} traits
 */
export function defineTraits(traits) {
  return traits;
}

export function defineFontFace({ family, url }) {
  return css`
    @font-face {
      font-family: "${family}";
      src: ${url};
    }
  `;
}

export function createFileURL(fileName = "", specificFolder) {
  return `infinitely/${specificFolder ? specificFolder : "assets"}/${fileName}`;
}

export async function parseInfinitelyURL(url = "", specificFolder) {
  const isValidUrl = jsURLRgx.test(url.trim()); //url.trim().toLowerCase().startsWith("infinitely/");
  const outPut = {
    isValidUrl,
    folder: "",
    fileName: "",
    blobUrl: "",
  };
  console.log(
    url,
    isValidUrl,
    url.trim().toLowerCase().startsWith("infinitely/")
  );

  if (!isValidUrl) return outPut;
  const parsedUrl = url.split("/").slice(1);
  // .filter((item) => item.toLowerCase() != "infinitely");
  const folderName = parsedUrl[0];
  const fileName = parsedUrl[1];
  const projectData = await await getProjectData();
  const assets =
    projectData[
      // `${specificFolder ? specificFolder : "assets"}`
      `${folderName}`
    ];
  const fileFromDB = (
    folderName.toLowerCase() == "fonts" ? Object.values(assets) : assets
  ).find((asset) => {
    console.log("real file from db : ", asset.file.name.toLowerCase());

    return asset.file.name.toLowerCase() == fileName.toLowerCase();
  });
  console.log("assets : ", assets, fileFromDB, folderName, fileName);

  const blobUrl = fileFromDB ? URL.createObjectURL(fileFromDB.file) : "";
  outPut.blobUrl = blobUrl;
  outPut.fileName = fileName;
  outPut.folder = folderName;
  return outPut;
}

/**
 *
 * @param {string} url
 * @param {import('./types').InfinitelyAsset[] & import('./types').InfinitelyFonts} assets
 * @returns
 */
export function parseInfinitelyURLForWindow(url = "", assets) {
  // const isValidUrl = url.trim().toLowerCase().startsWith("infinitely/");
  const outPut = {
    folder: "",
    fileName: "",
    blobUrl: "",
  };
  // console.log(
  //   url,
  //   isValidUrl,
  //   url.trim().toLowerCase().startsWith("infinitely/")
  // );

  // if (!isValidUrl) return outPut;
  // const parsedUrl = url
  //   .split("/").slice(1)
  // .filter((item) => item.toLowerCase() != "infinitely");
  // const folderName = parsedUrl[0];
  // const fileName = parsedUrl[1];
  const fileName = url;

  const fileFromDB = assets.find((asset) => {
    return asset.file.name.toLowerCase() == fileName.toLowerCase();
  });
  console.log("assets : ", assets, fileFromDB, fileName);

  const blobUrl = fileFromDB ? URL.createObjectURL(fileFromDB.file) : "";
  outPut.blobUrl = blobUrl;
  outPut.fileName = fileName;
  return outPut;
}

export function executeAndExtractFunctions(jsCode) {
  const functionNames = [];

  // Match function declarations (function xyz() {})
  const functionMatches = jsCode.match(
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
  );
  if (functionMatches) {
    functionMatches.forEach((match) => {
      const name = match.replace(/function\s+|\s*\(/g, "");
      functionNames.push(name);
    });
  }

  // Match function expressions (const xyz = function() {} or xyz = () => {})
  const variableMatches = jsCode.match(
    /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(function|\(\s*\)\s*=>)/g
  );
  if (variableMatches) {
    variableMatches.forEach((match) => {
      const name = match.split("=")[0].trim();
      functionNames.push(name);
    });
  }

  return functionNames;
}

/**
 *
 * @param {HTMLElement} el
 * @param {string} mimeType
 * @returns {Promise<Blob> | null}
 */
export async function getImgAsBlob(el, mimeType = "image/webp") {
  if (!el) {
    throw new Error("No Elememt Founded...")
    // return null;
  }
  return await new Promise(async (res, rej) => {
    await (
      await html2canvas(el, {
        // foreignObjectRendering: true,
        // allowTaint: true,
        useCORS: true,
        // imageTimeout: 200,
        windowWidth: window.innerWidth,
        windowHeight:window.innerHeight,
        
        // windowHeight: 300,
        // width:300,
        // height: 300,
      })
    ).toBlob(
      (blob) => {
        res(blob);
      },
      mimeType,
      // 0.5
    );

  });
  // return await toBlob(el)
}

/**
 *
 * @param {import('grapesjs').Component} cmp
 */
export function getTemplateInfo(cmp) {
  /**
   * @type {{isTemplate:boolean , isChild:boolean , template: import('grapesjs').Component | null, id:string | null}}
   */
  const info = {
    isTemplate: false,
    isChild: false,
    template: null,
    id: null,
  };
  if (!cmp) {
    return info;
  }

  const attr = cmp.getAttributes()[inf_template_id];
  const parent = cmp
    .parents()
    .find((cmp) => cmp.getAttributes()[inf_template_id]);
  if (attr) {
    info.isTemplate = true;
    info.template = cmp;
    info.id = attr;
  } else if (parent) {
    info.isTemplate = true;
    info.isChild = true;
    info.template = parent;
    info.id = parent.getAttributes()[inf_template_id];
  }

  return info;
}

export function getMatchedCSS(html, css) {
  const classesInHTML = new Set(
    html.match(/class="([^"]*)"/g).flatMap((m) =>
      m
        .replace(/class="/, "")
        .replace(/"/g, "")
        .split(" ")
    )
  );
  const idsInHTML = new Set(
    html
      .match(/id="([^"]*)"/g)
      .map((m) => m.replace(/id="/, "").replace(/"/g, ""))
  );

  const matchedCSS = css
    .split("}")
    .filter((rule) => {
      const selector = rule.split("{")[0].trim();
      return selector.split(",").some((sel) => {
        const classMatch = sel.match(/\.([^\s{.:[>+~]+)/);
        const idMatch = sel.match(/#([^\s{.:[>+~]+)/);
        return (
          (classMatch && classesInHTML.has(classMatch[1])) ||
          (idMatch && idsInHTML.has(idMatch[1]))
        );
      });
    })
    .join("}");

  return matchedCSS;
}

/**
 *
 * @param {{editor : import('grapesjs').Editor , cmp: import('grapesjs').Component , nested:boolean , stringRules:string[] , rules:import('grapesjs').CssRule[]}} param0
 */
export function getComponentRules({
  editor,
  cmp,
  nested = false,
  rules = [],
  stringRules = [],
}) {
  // let rules = [];
  // let stringRules = ``;
  const classes = cmp.getClasses() || [];
  const id = cmp.getId() || "";
  const attributes = cmp.getAttributes() || {};

  //For Classes
  classes.forEach((className) => {
    const classesRules = extractRulesByIdWithDetails(
      editor.getCss(),
      `.${className}`
    ).filter(Boolean);
    stringRules.push(...classesRules.map((rule) => rule.fullRule || rule.rule));
    rules.push(...classesRules);
  });

  //For Id
  const rulesById = extractRulesByIdWithDetails(
    editor.getCss(),
    `#${id}`
  ).filter((rule) => rule);
  rules.push(...rulesById);
  stringRules.push(...rulesById.map((rule) => rule.fullRule || rule.rule));

  //For Attributes
  Object.keys(attributes).forEach((key) => {
    const value = attributes[key];
    const attributesRule = extractRulesByIdWithDetails(
      editor.getCss(),
      `[${key}${value && `="${value}"`}]`
    ).filter((rule) => rule);
    rules.push(...(attributesRule || []));
    stringRules.push(
      ...attributesRule.map((rule) => rule.fullRule || rule.rule)
    );
  });

  //IF nested :
  if (nested && cmp.components().models.length) {
    // console.log("length : ", cmp.components().models.length);
    cmp.components().models.forEach((model) => {
      getComponentRules({
        editor,
        stringRules,
        rules,
        cmp: model,
        nested,
      });
    });
    return {
      stringRules: stringRules.join("\n"),
      rules,
    };
  } else {
    return {
      stringRules: stringRules.join("\n"),
      rules,
    };
  }
}

export function downloadFile({ filename, content, mimeType }) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

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

// let pVueApp = createApp()
let vComponents = [],
  vAttributes = {},
  vWrapperAttributes = {};

/**
 *
 * @param {{editor : import('grapesjs').Editor , all:boolean , specificCmp:import('grapesjs').Component}} param0
 */
export const mount = ({ editor, all, specificCmp }) => {
  // if (app) {
  //   app.unmount();
  //   app = null;
  // }
  // app = createApp();
  if (all) {
    const original = editor
      .getWrapper()
      .find("*")
      .filter(
        (cmp) =>
          Object.keys(cmp.getAttributes() || {}).some((key) =>
            key.startsWith("v-")
          ) || /\{\{.+\}\}/gi.test(cmp.getInnerHTML())
      );
    // editor.getWrapper().addAttributes({ "v-scope": "" });
    const wrapperAttrs = editor.getWrapper().getAttributes();
    vComponents = original;
    vAttributes = original.map((cmp) => cmp.getAttributes());
    vWrapperAttributes = wrapperAttrs;
    console.log("rogs : ", original);
    // console.log("PetiteVue.reactiveEffect : ",  , );

    // pVueApp.mount(editor.getWrapper().getEl());
    pvMount(editor.getWrapper().getEl());
    // setTimeout(() => {
    //   editor.getWrapper().addAttributes(wrapperAttrs);
    //   original.forEach((cmp) => cmp.addAttributes(cmp.getAttributes()));
    // }, 0);
  } else {
    const cmpAttrs = specificCmp.getAttributes();
    pvMount(specificCmp.getEl());
    specificCmp.addAttributes(cmpAttrs);
  }
  // reCreatePvApp()
  // if (pVueApp) {
  //   pVueApp.unmount(); // Unmount previous instance to clear scopes
  // }
};

/**
 *
 * @param {{editor : import('grapesjs').Editor , all:boolean , specificCmp:import('grapesjs').Component , selectAfterUnMout:boolean}} param0
 */
export const unMount = ({ editor, all, specificCmp, selectAfterUnMout }) => {
  if (all) {
    pvUnMount(editor.getWrapper().getEl());
    // editor.render();
    const wrapper = editor.getWrapper();
    /**
     *
     * @param {{starter:number , ender:number , components:import('grapesjs').Component[] , attributes : {}[], timeout:number}} param0
     */
    const render = ({
      starter = 0,
      ender,
      components = [],
      attributes,
      timeout = 15,
    }) => {
      // if (components.length <= 100) {
      //   console.log('less than 100');

      //   components.forEach((cmp) => cmp.replaceWith(cmp.clone()));
      // } else {
      setTimeout(() => {
        console.log("render start");
        if (!components.length) return;
        editor.Storage.setAutosave(false);

        const relEnder = starter + 101;
        const slices = components.slice(starter, relEnder);
        slices.forEach((cmp) => cmp.replaceWith(cmp.clone()));
        if (relEnder >= components.length) {
          console.log("render end");
          editor.Storage.setAutosave(true);
          editor.clearDirtyCount();
          vComponents = [];
          vAttributes = {};
          vWrapperAttributes = {};
          return;
        }
        console.log("start new one");
        render({
          starter: relEnder,
          components,
        });
      }, timeout);
      // }
    };

    editor.Storage.setAutosave(false);
    render({
      components: vComponents,
    });
    editor
      .getWrapper()
      .addAttributes(vWrapperAttributes, { avoidStore: true, addStyle: true });
    const el = wrapper.getEl();
    for (const key in vWrapperAttributes) {
      if (!el) continue;
      el.setAttribute(key, vWrapperAttributes[key]);
    }
    console.log(vAttributes, vComponents, "warppaer", vWrapperAttributes);

    editor.Storage.setAutosave(true);
    // editor.store();
    //     const original = editor
    //       .getWrapper()
    //       .components()
    //       .models.filter((cmp) =>
    //         Object.keys(cmp.getAttributes() || {}).some((key) =>
    //           key.startsWith("v-")
    //         )
    //       );
    // console.log('orgs : ' ,editor
    //   .getWrapper()
    //   .components()
    //   .models.map(el=>el.getAttributes()));

    //   editor.getWrapper()
    //   .components()
    //   .models.forEach((cmp) => {
    //       // console.log("re el : ", cmp.getEl(), cmp);
    //       if(cmp.toHTML({withProps:true , keepInlineStyle:true}) == cmp.getEl().outerHTML){
    //         console.log('equal');

    //         return
    //       }
    //       cmp.replaceWith(cmp.clone());
    //     });
    //     editor
    //       .getWrapper()
    //       .addAttributes(
    //         { ...editor.getWrapper().getAttributes() },
    //         { silent: false, avoidStore: true }
    //       );
    //     Object.entries(editor.getWrapper().getAttributes()).forEach(
    //       ([key, value]) => {
    //         editor.getWrapper().getEl().setAttribute(key, value);
    //       }
    //     );
    //     console.log(
    //       "wrapper attrs : ",
    //       editor.getWrapper().getAttributes(),
    //       editor.getWrapper().getEl()
    //     );
    // editor.Storage.setAutosave(false);
    // editor.render();
    // editor.Storage.setAutosave(true);
    // editor.clearDirtyCount()
    // editor.getWrapper().replaceWith(editor.getWrapper().clone())
  } else {
    const newCmp = specificCmp.replaceWith(specificCmp.clone())[0];
    pvUnMount(specificCmp.getEl());
    selectAfterUnMout && editor.select(newCmp);
  }
};
