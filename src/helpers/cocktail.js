"use strict";
/*cocktail (typeScript version) library created at 3/10/2023 - Devloped by yousef sayed*/
/*===================(Start Dom)===================*/
const _callbacksContainer = {};
/**
 * It is define the callback event
 * @param {(
 * ev: Event |
 *  DragEvent |
 *  MouseEvent |
 *  TouchEvent |
 *  AnimationEvent |
 *  FocusEvent |
 *  TrackEvent |
 *  InputEvent |
 *  WheelEvent |
 *  {target:Element |
 *  HTMLElement |
 *  HTMLAudioElement |
 *  HTMLVideoElement |
 *  HTMLIFrameElement |
 *  HTMLBodyElement |
 *  HTMLAreaElement |
 *  HTMLImageElement
 *  } )} callback
 * @returns
 */
export const def = (callback) => {
  const uuid = crypto.randomUUID().replaceAll("-", "");
  _callbacksContainer[uuid] = callback;
  return uuid;
};

// const domObserver = new MutationObserver((nodes) => {
//   nodes.forEach((node) => {
//     const chlds = Array.from(node.addedNodes);
//     chlds
//       .filter((chld) => chld instanceof HTMLElement)
//       .forEach((chld) => {
//         //Start handelling parent child
//         const parentChildAttrs = Array.from(chld.getAttributeNames())
//           .filter((attr) => attr.startsWith("@"))
//           .forEach((attr) => {
//             const eventName = attr.replace("@", "");
//             chld.addEventListener(
//               eventName,
//               _callbacksContainer[chld.getAttribute(attr)]
//             );
//             chld.removeAttribute(attr);
//           });

//         //Start handelling childs
//         const chldNodes = Array.from(chld.querySelectorAll("*"));
//         const tes = chldNodes.map((chldNode) => {
//           const filterAttr = Array.from(chldNode.getAttributeNames()).filter(
//             (attr) => attr.startsWith("@")
//           );
//           return filterAttr.length > 0
//             ? { chldNode, filterAttr }
//             : { chldNode, filterAttr: [] };
//         });
//         tes.forEach(({ chldNode, filterAttr }) => {
//           filterAttr.forEach((evAttr) => {
//             const eventName = evAttr.replace("@", "");
//             chldNode.addEventListener(
//               eventName,
//               _callbacksContainer[chldNode.getAttribute(evAttr)]
//             );
//             chldNode.removeAttribute(evAttr);
//           });
//         });
//       });
//   });
// });

// domObserver.observe(document.body, {
//   characterData: true,
//   childList: true,
//   attributes: true,
//   subtree: true,
// });

export const html = String.raw;
export const css = String.raw;

/**
 *
 * @param {string} root
 * @returns {Element | HTMLElement | HTMLVideoElement | HTMLImageElement |HTMLDivElement}
 */
export const $ = (root) => {
  const el = document.querySelector(root);
  return el;
};

/**
 *
 * @param {string} root
 * @returns
 */
export function $a(root) {
  return document.querySelectorAll(root);
}

/**
 * Parse Html to document
 * @param {string} text
 * @returns {HTMLElement}
 */
export function parseToHTML(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.children[0];
}

/**
 *
 * @param {{[key]:string}} components
 */
export function renderTemplates(components) {
  const rgx = /{{.+}}/gi;
  const templates = Array.from(document.querySelectorAll("template"));
  const templatesFilter = templates.filter((template) =>
    template.innerHTML.match(rgx)
  );
  console.log(templates, templatesFilter);
  templatesFilter.forEach((template) => {
    const templateParent = template.parentElement;
    const componentName = template.innerHTML.replaceAll(/{|}/gi, "");
    template.insertAdjacentHTML("beforebegin", components[componentName]);
    template.remove();
  });
}

/*===================(End Dom)===================*/

/*===================(Start Animtaion)===================*/

const _Animations = {};
const animateObserver = new IntersectionObserver(
  (nodes) => {
    nodes.forEach((node) => {
      const animtaionName = node.target.getAttribute("animate");
      if (node.isIntersecting) {
        node.target.classList.add(animtaionName);
        if (node.target.getAttribute("once") != "false")
          animateObserver.unobserve(node.target);
      } else if (!node.isIntersecting) {
        node.target.classList.remove(animtaionName);
      }
    });
  },
  { threshold: 0.1 }
);

const domObserverForAnimtaions = new MutationObserver((nodes) => {
  nodes.forEach((node) => {
    const childs = Array.from(node.addedNodes)
      .filter((nodeChild) => nodeChild instanceof HTMLElement)
      .forEach((nodeChild) => {
        const animatedElements = [
          nodeChild.hasAttribute("animate") ? nodeChild : null,
          ...nodeChild.querySelectorAll("[animate]"),
        ];
        animatedElements[0] ? observeAnimatedElement(animatedElements) : null;
      });
  });
});

/**
 *
 * @param {{
 * names:string ,
 * options : KeyframeAnimationOptions
 * }} param0
 */
export function defineAnimation({ name, options }) {
  _Animations[name] = options;
}

function observeAnimatedElement(els) {
  Array.from(els).forEach((el) => {
    animateObserver.observe(el);
  });
}

/**
 *
 * @param {number} thresholdNum
 */
export function useAnimation(thresholdNum) {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<style id="animationsClasses"></style>'
  );

  Object.keys(_Animations).forEach((animationName) => {
    let animProp = `animation: ${animationName} `;

    for (const option in _Animations[animationName]) {
      animProp += _Animations[animationName][option] + " ";
    }

    $("#animationsClasses").insertAdjacentHTML(
      "beforeend",
      ` 
        .${animationName}{
          ${animProp};
        }
      `
    );
  });

  const animatedElements = Array.from(
    document.body.querySelectorAll("[animate]")
  );
  observeAnimatedElement(animatedElements);
}

domObserverForAnimtaions.observe(document.body, {
  characterData: true,
  childList: true,
  attributes: true,
  subtree: true,
});

/*===================(End Animtaion)===================*/

/**
 * Returns get method to get specific query that you want
 * @returns
 */

export function useQueries() {
  const queries = new URLSearchParams(window.location.search);
  return {
    /**
     * Returns value of query name that you inserted as param
     * @param {string} name
     * @returns {string}
     */
    get: (name) => queries.get(name),
  };
}

/*******************@Start_Array_prototypes ==========================*/
/**
 * Returns specific item
 * @param {number} index
 * @returns
 */
Array.prototype.at = function at(index) {
  if (index >= 0) {
    return this[index];
  }
  return this[this.length + index];
};

/**
 * Returns array without removed items
 * @param  {number[]} indexs
 * @returns
 */
Array.prototype.remove = function remove(...indexs) {
  for (let i = 0; i < indexs.length; i++) {
    if (indexs[i] >= 0) {
      this[indexs[i]] = null;
    } else {
      this[this.length + indexs[i]] = null;
    }
  }
  return this.filter((e) => e !== null);
};

/*******************@End_Array_prototypes ==========================*/

/**
 * Returns random number
 * @param {number} length
 * @returns {number}
 */
export function random(length) {
  return Math.trunc(Math.random() * length);
}

/**
 * Returns a new detached object from main object
 * @param {object} obj
 * @returns @param {obj}
 */
export function cloneObject(obj) {
  if (!obj) return {};
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

/**
 * Returns an unique number with specific length
 * @param {number} length
 * @returns {number}
 */
export function OTP(length) {
  const code = [];
  for (let i = 0; i < length; i++) {
    code.push(random(10));
  }
  return code.join("");
}

export function uniqueID() {
  return (
    hash(
      random(20) +
        random(500) +
        crypto.randomUUID() +
        random(20) +
        random(500) +
        crypto.randomUUID()
    ).replaceAll("=", "") +
    random(20) +
    random(500)
  );
}

/**
 *
 * @param {{where:HTMLElement , els : HTMLElement[] , starterIndex:number , delay:number}} param0
 */
export const appendWithDelay = ({ where, els, starterIndex, delay }) => {
  let cloneStarterIndex = starterIndex;

  setTimeout(() => {
    if (cloneStarterIndex > els.length - 1) return;
    where.appendChild(els[starterIndex]);
    cloneStarterIndex++;
    appendWithDelay({
      where,
      els,
      starterIndex: cloneStarterIndex,
      delay,
    });
  }, delay);
};

/**
 * Scroll to an element without any effort
 * @param {HTMLElement} element
 */
export function scrollTo(element) {
  if (element.id) {
    location.href = `#${element.id}`;
  } else {
    element.id = `scrollTo-function`;
    location.href = `#${element.id}`;
    element.removeAttribute("id");
  }
}

/**
 * Scroll to specific element by his id
 * @warn Don’t pass id with hash just pass his name
 * @param {string} id
 */
export function scrollToRoot(id) {
  location.href = `#${id}`;
}

/**
 * Returns data that you passed into array with your specific length
 * @param {any} data
 * @param {number} length
 * @returns {any[]}
 */
export function repeatAsArray(data, length) {
  return Array(length).fill(data);
}

/**
 * copy the text into clipboard
 * @param {string} text
 * @returns {void}
 */
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

/**
 * Returns Blob object from data that passed
 * @param {any} data
 * @param {string} mimeType
 * @returns {Blob}
 */
export function createBlobFileAs(data, mimeType) {
  try {
    return new Blob([data], { type: mimeType });
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}

/**
 *
 * @param {any[]} oldArray
 * @param {any[]} newArray
 * @returns
 */
export function getDifferences(oldArray, newArray) {
  const differences = [];

  // Loop through the new array
  for (let i = 0; i < newArray.length; i++) {
    if (newArray[i] !== oldArray[i]) {
      differences.push(newArray[i]);
    }
  }

  return differences;
}

/**
 * Transform value of text inputs to just numbers
 * @param {HTMLInputElement} inputElement
 */
export function transformToNumInput(inputElement) {
  const rgx = /(-)?(\d+)?/gi;
  // console.log(inputElement.value.match(rgx)[0]);
  console.log(parseFloat(inputElement.value));
  console.log(inputElement.value.split(/[a-z]/gi));

  inputElement.value =
    parseFloat(inputElement.value) + 1 ? parseFloat(inputElement.value) : "";
  // inputElement.value = rgx.test(inputElement.value)
  //   ? inputElement.value?.match(rgx)[0]
  //   : "";
}

/**
 *
 * @param {{blob:Blob , videoEl:HTMLVideoElement , width:number , height:number}} param0
 * @returns
 */
export function generateThumnail({ blob, videoEl, width, height }) {
  if (blob && videoEl)
    throw new Error(`Just pass one argument videoEl or blob object`);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const video = videoEl || document.createElement("video");
  canvas.width = width;
  canvas.height = height;
  !videoEl && (video.src = URL.createObjectURL(blob));
  ctx.drawImage(video, 0, 0, width, height);

  return {
    dataURL: canvas.toDataURL("image/png"),
    async blob() {
      canvas.toBlob;
    },
  };
}

/**
 * It make your specific element responsive with window height and width
 * @advice If you wanna use it so use it with "body" element and make your render element like "#app" | "#root" whatever take all width and hight by css.
 * @param {string} root
 */
export function makeAppResponsive(root) {
  const el = document.querySelector(root);
  if (!el) throw new Error(`Your element root "${root}" is ${el}`);
  el.style.height = `${window.innerHeight}px`;
  window.addEventListener(
    "resize",
    () => (el.style.height = `${window.innerHeight}px`)
  );
}

/**
 * Returns formate number (it usually used in social media apps)
 * @example 1K or +1K (if number more than 1000 and less than 1000000)
 * @param {string | number} num
 * @returns {string}
 */
export function nFormatter(num) {
  num = num.toString();
  if (+num >= 1000000000) {
    return +num == 1000000000
      ? `${+num.split("0")[0]}G`
      : `+${num.slice(0, 1)}G`;
  } else if (+num >= 1000000) {
    return +num == 1000000 ? `${+num.split("0")[0]}M` : `+${+num.slice(0, 1)}M`;
  } else if (+num >= 1000) {
    return +num == 1000 ? `${+num[0]}K` : `+${+num.slice(0, 1)}K`;
  } else {
    return num;
  }
}

export function insertProperty(obj, key, value, afterKey) {
  const newObj = {};
  for (const [k, v] of Object.entries(obj)) {
    newObj[k] = v;
    if (k === afterKey) {
      newObj[key] = value;
    }
  }
  return newObj;
}

/**
 * It is make for
 * @param {number} start
 * @param {number} end
 * @param {number} duration
 * @param {void} method
 */
export function forInterval(start, end, duration, method) {
  const interval = setInterval(() => {
    if (start >= end) {
      clearInterval(interval);
      return;
    }
    method(start);
    start++;
  }, duration);
}

/**
 * It handle click class that you created by css
 * @param {HTMLElement} element
 * @param {string} clickClass
 */
export function addClickClass(element, clickClass) {
  element.classList.add(clickClass);
  element.addEventListener("animationend", () => {
    element.classList.remove(clickClass);
  });
}

/**
 * Returns current time
 * @returns {string}
 */
export function getCurrentTime(formate = `en-US`) {
  const currentDate = new Date();
  return currentDate.toLocaleString(formate);
}

/**
 * Returns current date
 * @returns {string}
 */
export function getLocalDate(formate = `en-US`) {
  return new Date().toLocaleDateString(formate);
}

/**
 * Returns boolean value if the element param is element or not
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isHTMLElement(element) {
  return element instanceof HTMLElement;
}

/**
 * Returns boolean value if the element param is DocumentFragment or not
 * @param {DocumentFragment} element
 * @returns {boolean}
 */
export function isFragment(fragment) {
  return fragment instanceof DocumentFragment;
}

/**
 * Returns boolean value if the data param is function or not
 * @param {()=>any} data
 * @returns {boolean}
 */
export function isFunction(data) {
  return typeof data === "function";
}

/**
 * Returns boolean value if the data param is string or not
 * @param {string} data
 * @returns {boolean}
 */
export function isString(string) {
  return typeof string == typeof "string";
}

/**
 * Returns boolean value if the data param is array or not
 * @param {any[]} data
 * @returns {boolean}
 */
export function isArray(data) {
  return data instanceof Array;
}

/**
 * Returns boolean value if the data param is undefined or not
 * @param {undefined} data
 * @returns {boolean}
 */
export function isUndefined(data) {
  return typeof data === "undefined";
}

/**
 * Returns boolean value if the data param is undefined or not
 * @param {number | string} data
 * @returns {boolean}
 */
export function isNumber(data) {
  return typeof +data === "number";
}

/*******************@End_functions ==========================*/

//send to server
/**
 * Returns Post response
 * @param {{url:string , data:{[key : symbol]: any} , json:boolean , headers:HeadersInit ,queries:{[key]:string} }} param0
 * @returns {Promise<Response> | string}
 */
export async function POST({
  url,
  data = {},
  json = true,
  headers = { "content-type": "Application/json" },
  queries,
}) {
  try {
    if (queries && typeof queries == "object") {
      url += "?";
      for (const key in queries) {
        url += `${key}=${queries[key]}&`;
      }
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return json ? await response.json() : response;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns Get response
 * @param {{url:string , headers:HeadersInit , queries:{[key]:string} , json:boolean }} param0
 * @returns {Promise<Response> }
 */
export async function GET({
  url,
  headers = { "content-type": "Application/json" },
  queries,
  json,
}) {
  try {
    if (queries && typeof queries == "object") {
      url += "?";
      for (const key in queries) {
        url += `${key}=${queries[key]}&`;
      }
    }
    const response = await fetch(url, { method: "GET", headers });
    return json ? await response.json() : response;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns Put response
 * @param {{url:string , headers:HeadersInit , queries:{[key]:string} , data:object , json:boolean}} param0
 * @returns {Promise<Response> }
 */
export async function PUT({
  url,
  headers = { "content-type": "Application/json" },
  json,
  data,
  queries,
}) {
  try {
    if (queries && typeof queries == "object") {
      url += "?";
      for (const key in queries) {
        url += `${key}=${queries[key]}&`;
      }
    }
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return json ? await response.json() : response;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 *
 * @param {{url:string , headers:HeadersInit , queries:{[key]:string} , data:object}} param0
 * @returns {Promise<Response> }
 */
export async function DELETE({
  url,
  headers = { "content-type": "Application/json" },
  data,
  queries,
  json,
}) {
  try {
    if (queries && typeof queries == "object") {
      url += "?";
      for (const key in queries) {
        url += `${key}=${queries[key]}&`;
      }
    }
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify(data),
    });
    return json ? await response.json() : response;
  } catch (error) {
    throw new Error(error.message);
  }
}

//Email validation
/**
 * Check if email is valid and returns data as object
 * @param {string} emailText
 * @returns
 */
export function isValidEmail(emailText) {
  const matching = emailText?.trim().match(/\w+(\.\w+)?@\w+\.\w+$/gi);
  const dotComMatch = matching?.join("")?.match(/\.\w+/gi);

  if (!matching) {
    return { valid: false, msg: "Email is not a valid" };
  } else if (dotComMatch && dotComMatch[dotComMatch.length - 1] != ".com") {
    return { valid: false, msg: "We just accept .com" };
  } else {
    return { valid: true, type: "email", msg: "Email is valid" };
  }
}

//Name validation
/**
 * Check if name is valid and returns data as object
 * @param {string} text
 * @returns
 */
export function isValidName(text) {
  // const specialCharMatch = text?.trim().match(/\w+/ig);
  // console.log(specialCharMatch);
  if (text?.trim().length > 15 || text?.trim() === "" || !text) {
    return { valid: false, msg: "Invalid name" };
  } else {
    return { valid: true, msg: "Valid name" };
  }
}

//Date validation
/**
 * Check if date is valid and returns data as object
 * @param {string} date
 * @returns
 */
export function isValidDate(date) {
  const userDate = new Date(date);
  if (
    +userDate.getFullYear > +new Date().getFullYear() ||
    userDate.toLocaleDateString() === "Invalid Date"
  )
    return { valid: false, msg: `Invalid Date..!` };
  return { valid: true, msg: "Valid Date" };
}

//Password validation
/**
 * Check if password is valid and returns data as object
 * @param {string} text
 * @returns
 */
export function isValidPassword(text) {
  const password = text.trim();
  const specialCharMatch = password?.match(/[^a-z0-9\.\s+]/gi);
  const numsMatch = password?.match(/[0-9]/gi);
  const upperCharMatch = password?.match(/[A-Z]/gi);
  const lowerrCharMatch = password?.match(/[a-z]/gi);
  const spaces = password?.match(/[\s+]/gi);

  switch (true) {
    case !password:
      return { valid: false, msg: "Password must not be empty" };

    case !upperCharMatch || upperCharMatch.length < 1:
      return {
        valid: false,
        msg: "Password must be at least 1 capital letter",
      };

    case !lowerrCharMatch || lowerrCharMatch.length < 1:
      return { valid: false, msg: "Password must be at least 1 small letter" };

    case !numsMatch || numsMatch.length < 4:
      return { valid: false, msg: "Password must be at least 4 digits" };

    case !specialCharMatch:
      return { valid: false, msg: "Password must have special characters" };

    case spaces !== null:
      return { valid: false, msg: "Password must not have spaces" };

    case password.length < 8:
      return { valid: false, msg: "Password must be at least 8 characters" };

    default:
      return { valid: true, msg: "Password is valid" };
  }
}

//Re password validation
/**
 * Compare the main password with the re password and return data as object
 * @param {string} mainPassword
 * @param {string} rePassword
 * @returns
 */
export function isValidRePassword(mainPassword, rePassword) {
  return rePassword == mainPassword
    ? { valid: true, msg: "valid" }
    : { valid: false, msg: "Re password does not match" };
}

/**
 * Returns true if text language is English
 * @param {string} text
 * @returns
 */
export function isEnglishLang(text) {
  const rgx = /[a-zA-Z]/gi;
  return {
    ok: rgx.test(text),
    length: text.match(rgx)?.length || false,
  };
}

/**
 * Returns true if text language is Arabic
 * @param {string} text
 * @returns
 */
export function isArabicLang(text) {
  const arRgx = /[\u0600-\u06FF\u0750-\u077F]+/gi;
  return {
    ok: arRgx.test(text),
    length: text.match(arRgx)?.length || false,
  };
}

/**
 * Returns true if text contain special chars
 * @param {string} text
 * @returns
 */
export function isSpecialChars(text) {
  const rgx = /\W+/gi;
  return {
    ok: rgx.test(text),
    length: text.match(rgx)?.length || false,
  };
}

//encode & decode
/**
 * Returns hashed text
 * @param {string} text
 * @param {string} password
 * @returns
 */
export function hash(text, password = "") {
  text += password;
  const textEncoder = new TextEncoder().encode(encodeURIComponent(text));
  const ys7 = textEncoder.reduce((num1, num2) => {
    return num1 + num2;
  });

  return btoa(encodeURI(ys7.toString()));
}

/**
 * Compare the text with his hashed one
 * @param {{text:string , hashText:string , password:string}} param0
 * @returns
 */
export function compare({ text, hashText, password = "" }) {
  return hash(text, password) === hashText
    ? { ok: true, msg: "It is matched" }
    : { ok: false, msg: "It is not matched" };
}

export class CocktailDB {
  /**
   * @param {string} dbname
   */
  constructor(dbname = "string") {
    this._updateI = +localStorage.getItem("IDBV") || 1;
    this.dbname = dbname;
    this.handlers = {
      /**
       *
       * @param {(db:IDBDatabase)=>void} callback
       * @param {number} collectionVersion
       * @returns {Promise<IDBDatabase>}
       */
      doRequest: async (callback = (db) => {}, collectionVersion) => {
        const request = indexedDB.open(
          dbname,
          collectionVersion ? collectionVersion : this.updateI
        );

        let returnedDB;
        return new Promise((res, rej) => {
          request.addEventListener("success", function () {
            // Use request.result instead of this.result
            returnedDB = request.result;
            res(callback(returnedDB));
          });

          request.addEventListener("error", function () {
            returnedDB = request.error;
            rej(new Error("Error : " + request.error));
          });
        });

        // return db; // Return the resolved promise
      },

      /**
       *
       * @param {string} name
       * @param {IDBOpenDBRequest} request
       */
      createObjectStore: async (name, request) => {
        // request.addEventListener("upgradeneeded", function (ev) {

        // });
        // request.result.createObjectStore(name, {
        //   keyPath: "id",
        //   autoIncrement: true,
        // });
        console.log("upgrade");
        // const db = await this.handlers.doRequest((db)=>db);
        // await db.createObjectStore(name, {
        //   keyPath: "id",
        //   autoIncrement: true,
        // })

        // close request if it seccesded and to if we wanna to create new collection
        request.addEventListener("success", function () {
          console.log("success");

          request.result.close();
        });
      },

      returnData: async (data) => {
        try {
          return new Promise((res, rej) => {
            data.addEventListener("success", function () {
              res(this.result);
            });
            data.addEventListener("error", function () {
              rej(this.errorCode);
            });
          });
        } catch (error) {
          throw new Error(error.message);
        }
      },

      findHandler: async (name, key, cb) => {
        try {
          return await this.handlers.doRequest(async (db) => {
            const objectStore = db
              .transaction(name, "readwrite")
              .objectStore(name)
              .getAll();
            const data = await this.handlers.returnData(objectStore),
              matches = [];
            if (key) {
              data.forEach((val) => {
                for (const prop1 in val) {
                  for (const prop2 in key) {
                    if (prop1 == prop2 && val[prop1] == key[prop2]) {
                      matches.push(val);
                    }
                  }
                }
              });
              return cb(matches);
            } else {
              return cb(data);
            }
          });
        } catch (error) {
          throw new Error(error.message);
        }
      },
    };

    this.collectionHandler = (name) => {
      const methods = {
        /**
         * Returns all documents in your collection after your update
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        set: async (query) => {
          try {
            await this.handlers.doRequest(async (db) => {
              let lastId = await methods.find();
              query.id = lastId.at(-1) ? lastId[lastId.length - 1].id + 1 : 0;
              db.transaction(name, "readwrite").objectStore(name).add(query);
              db.close();
            });
            return await methods.find();
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * Returns first document which match in your collection
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        findOne: async (query) => {
          try {
            if (query instanceof Object && !Object.entries(query)[0]) {
              throw new Error(`query must not be an empty`);
            }
            if (typeof query !== typeof {}) {
              throw new Error(`query type must be an object`);
            }
            return await this.handlers.findHandler(
              name,
              query,
              (matches) => matches[0]
            );
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * It find all document that matches your query and update it
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        findOneAndUpdate: async (oldQuery, newQuery) => {
          try {
            this.handlers.doRequest(async (db) => {
              let key = await methods.findOne(oldQuery);
              newQuery.id = key.id;
              db.transaction(name, "readwrite").objectStore(name).put(newQuery);
            });
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * It find all documents that matche your query
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        find: async (query) => {
          try {
            if (query && typeof query !== typeof {}) {
              throw new TypeError(
                `Query type must be an object like that => {Query}`
              );
            }
            return await this.handlers.findHandler(
              name,
              query,
              (matches) => matches
            );
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * It find all documents that matche your query and update them all
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        findAndUpdate: async (oldQuery, newQuery) => {
          try {
            this.handlers.doRequest(async (db) => {
              let key = await methods.find(oldQuery);
              for (let i = 0; i < key.length; i++) {
                newQuery.id = key[i].id;
                db.transaction(name, "readwrite")
                  .objectStore(name)
                  .put(newQuery);
              }
            });
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * It find all documents that matches your query and delete them all
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        delete: async (query) => {
          try {
            this.handlers.doRequest(async (db) => {
              let targetQuery = await methods.find(query);
              for (let i = 0; i < targetQuery.length; i++) {
                db.transaction(name, "readwrite")
                  .objectStore(name)
                  .delete(targetQuery[i].id);
              }
            });
          } catch (error) {
            throw new Error(error.message);
          }
        },

        /**
         * It find first document that matche your query and delete it
         * @param {object} query
         * @example
         * set({text : uniqueText})
         * @returns
         */
        deleteOne: async (query) => {
          try {
            return await this.handlers.doRequest(async (db) => {
              let targetQuery = await methods.findOne(query);
              const res = db
                .transaction(name, "readwrite")
                .objectStore(name)
                .delete(targetQuery.id);
              return await methods.find();
            });
          } catch (error) {
            throw new Error(error.message);
          }
        },
      };
      return methods;
    };
  }

  /**
   * @param {number | undefined} value
   */
  set updateI(value) {
    this._updateI = value; // Assign the value to the internal property
  }

  /**
   * @param {number | undefined} value
   */
  get updateI() {
    return this._updateI; // Assign the value to the internal property
  }

  /**
   * Create collection at your db
   * @param {string} name
   * @returns
   */
  async createCollection(name) {
    try {
      // Open the database in a way that allows version changes (this triggers onupgradeneeded)

      const request = indexedDB.open(this.dbname, this.updateI);

      // This event triggers when the database version changes or is created
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store only if it doesn't already exist
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };

      // After the object store is created (or already exists), use the db
      localStorage.setItem("IDBV", this.updateI);

      return this.collectionHandler(name);
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  }

  async openCollection(name) {
    return this.collectionHandler(name);
  }

  deleteDatabase() {
    indexedDB.deleteDatabase(dbname);
  }

  async deleteCollection(name) {
    const db = this.handlers.doRequest((db) => db);
    (await db).deleteObjectStore(name);
    (await db).close(name);
  }

  async getCollectionLength() {
    try {
      const db = await this.handlers.doRequest((db) => db);
      const clsNames = db.objectStoreNames; // Directly access the DOMStringList
      return clsNames.length; // Return the length of objectStoreNames
    } catch (error) {
      console.error("Error getting collection length:", error);
    }
  }

  async getAllCollections() {
    try {
      const db = await this.handlers.doRequest((db) => db);
      const clsNames = db.objectStoreNames; // Directly access the DOMStringList
      return clsNames; // Return the length of objectStoreNames
    } catch (error) {
      console.error("Error getting collection length:", error);
    }
  }
}

export class TelegramBot {
  /**
   *
   * @param {string | number} token
   * @param {string | number} chatId
   */
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
  }

  //compress url to more sequrity
  /**
   * Returns normal url , compressed url and main id
   * @advice If you wanna hide id so use "compresedURl" prop (but it will give slow response) , if you don’t care about show or hidden your id and wanna fast response so use "normalUrl" prop
   * @param {string} fileId
   * @returns
   */
  async compressURL(fileId) {
    const tinyUrl = `https://tinyurl.com/api-create.php?url=${await this.getFileFromBot(
      fileId
    )}`;
    const compresedURl = await (await fetch(tinyUrl)).text();
    return {
      compresedURl: compresedURl,
      normalUrl: await this.getFileFromBot(fileId),
      id: fileId,
      ok: true,
    };
  }

  /**
   * Returns normal id (Fast)
   * @param {string} fileId
   * @returns
   */
  async getFileFromBot(fileId) {
    try {
      const url1 = `https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`;
      const getFile = await (await fetch(url1)).json();
      const file_path = getFile.result.file_path;
      const fileURL = `https://api.telegram.org/file/bot${this.token}/${file_path}`;
      return fileURL;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * It send file as Blob and returns response as object with ok , id and normal id
   * @param {Blob} blob
   * @returns
   */
  async sendFile(blob) {
    try {
      const formData = new FormData();
      formData.append("document", blob, `${blob.name}`);
      formData.append("chat_id", this.chatId);
      const options = { method: "POST", body: formData };
      console.log(this.token);
      const data = await (
        await fetch(
          `https://api.telegram.org/bot${this.token}/sendDocument`,
          options
        )
      ).json();
      const fileId = data.result.document.file_id;
      return { ok: true, id: fileId, url: await this.getFileFromBot(fileId) };
    } catch (error) {
      return {
        ok: false,
        msg: `Faild to upload : ${error.message}`,
        url: null,
      };
    }
  }

  /**
   * It send image as Blob and returns response as object with ok , id and normal id
   * @param {Blob} blob
   * @returns
   */
  async sendImage(blob) {
    return await this.sendFile(blob);
  }

  /**
   * It send video as Blob and returns response as object with ok , id and normal id
   * @param {Blob} blob
   * @returns
   */
  //send video
  async sendVideo(blob) {
    try {
      const formData = new FormData();
      formData.append("video", blob, `${blob.name}`);
      const sendVideoURL = `https://api.telegram.org/bot${this.token}/sendVideo?chat_id=${this.chatId}`;
      const response = await (
        await fetch(sendVideoURL, { method: "POST", body: formData })
      ).json();
      const fileId = response.result.video.file_id;
      return {
        ok: true,
        msg: `Successfully uploaded`,
        id: fileId,
        url: await this.getFileFromBot(fileId),
      };
    } catch (error) {
      return {
        ok: false,
        msg: `Faild to upload  : ${error.message}`,
        url: null,
      };
    }
  }

  /**
   * It send audio as Blob and returns response as object with ok , id and normal id
   * @param {Bolb} blob
   * @returns
   */
  //send audio
  async sendAudio(blob) {
    try {
      const sendAudioURL = `https://api.telegram.org/bot${this.token}/sendAudio?chat_id=${this.chatId}`;
      const formData = new FormData();
      formData.append("audio", blob, `${blob.name}`);
      const response = await (
        await fetch(sendAudioURL, { method: "POST", body: formData })
      ).json();
      const fileId = response.result.audio.file_id;
      return { ok: true, id: fileId, url: await this.getFileFromBot(fileId) };
    } catch (error) {
      return {
        ok: false,
        msg: `Faild to upload : ${error.message}`,
        url: null,
      };
    }
  }

  /**
   * It send message to bot
   * @param {string} text
   * @returns
   */
  //sendMessage
  async sendMessage(text = "string") {
    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage?chat_id=${this.chatId}&text=${text}`;
      const message = await (await fetch(url)).json();
      return message;
    } catch (error) {
      return {
        ok: false,
        msg: `Faild to upload : ${error.message}`,
        url: "No url Fethced",
      };
    }
  }

  //get updates
  async getUpdates() {
    return await (
      await fetch(`https://api.telegram.org/bot${this.token}/getUpdates`)
    ).json();
  }

  //get messages
  async getMessages() {
    return (await this.getUpdates()).result[0].message;
  }
}
/**
 * Returns string object
 * @param {object} obj
 * @returns
 */
export function stringify(value , space) {
  try {
    return JSON.stringify(value , undefined , space);
  } catch (error) {
    return undefined;
  }
}

/**
 * Returns object from string
 * @param {string} obj
 * @returns {any | undefined}
 */
export function parse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}

/**
 *
 * @param {WebSocket} wss
 * @param {object} msg
 */
export function wssEmit(wss, type, msg) {
  wss.send(stringify(msg));

  return new Promise((res, rej) => {
    const getMsg = (ev) => {
      if (parse(ev.data).type !== type) return;
      if (!parse(ev.data)) {
        rej(`No data founded :(`);
        return;
      }
      res(parse(ev.data));
      wss.removeEventListener("message", getMsg);
    };

    wss.addEventListener("message", getMsg);
  });
}

/**
 * Returns all cookie as key & value in object
 * @returns {object}
 */
export function getCookies() {
  const { cookie } = document;
  const ckValues = cookie.split(/\s+|\;/gi);
  const obj = {};

  ckValues.forEach((val) => {
    if (!val) {
      return;
    }
    const key = val.match(/\w+\=/gi) ? val.match(/\w+\=/gi)[0] : null;
    if (!key) return;
    obj[key.replace("=", "")] = val.replace(key, "");
  });

  return obj;
}

/**
 * It is delete cookie by his key(name)
 * @param {string} key
 */
export function deleteCookie(key) {
  const value = getCookies()[key];
  document.cookie = `${key}=${value}; Expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

/**
 *
 * @param {{arr:array , oldContent:any , content:any}} param0
 * @returns
 */
export function pushBetween({ arr, oldContent, content }) {
  const newArr = [...arr];

  const index = newArr.indexOf(oldContent);

  if (index !== -1) {
    newArr.splice(index + 1, 0, content);
  }
  return newArr;
}
