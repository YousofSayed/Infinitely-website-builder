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



export const html = String.raw;
export const css = String.raw;



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
  const callback = () => (el.style.height = `${window.innerHeight}px`)
  window.addEventListener(
    "resize",
    callback
  );

  return ()=>{
    window.removeEventListener('resize' , callback);
  }
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
export function stringify(value, space) {
  try {
    return JSON.stringify(value, undefined, space);
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

export function parseAndReturnInputIfNot(value) {
  return parse(value) || value;
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
