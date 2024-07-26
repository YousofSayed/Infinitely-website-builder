import { html, parse, parseToHTML, stringify, uniqueID } from "./cocktail";
import { iframeBodyChange } from "./customEvents";

/**
 *
 * @param {string} scriptContent
 * @param {HTMLIFrameElement} iframeEl
 */
export const appendScript = (scriptContent, iframeEl) => {
  const script = document.createElement("script");
  script.innerHTML = scriptContent;
  script.className = "main-script";
  iframeEl.contentDocument.body.appendChild(script);
};

/**
 *
 * @param {string} styleContent
 * @param {HTMLIFrameElement} iframeEl
 */
export const appendStyle = (styleContent, iframeEl) => {
  const style = document.createElement("style");
  style.innerHTML = styleContent;
  iframeEl.contentDocument.body.appendChild(style);
};

/**
 *
 * @param {HTMLIFrameElement} iframeEl
 */
export const removeOldScriptsAndStyles = (iframeEl) => {
  const allScriptsAdded = iframeEl.contentDocument.querySelectorAll("script");
  allScriptsAdded.forEach((script, i) => {
    script.innerHTML = "";
    script.remove();
  });
  const allStylesAdded = iframeEl.contentDocument.querySelectorAll("style");
  allStylesAdded.forEach((style, i) => {
    style.remove();
  });
};

let gElement,
  body = document.body,
  frameWindow,
  historyI = 0,
  isInWindow = false;
const history = [""];
let eventsWillClear = {
  drop: () => {},
  dragstart: () => {},
  dragenter: () => {},
  dragleave: () => {},
  dragend: () => {},
};

/**
 *
 * @param {HTMLBodyElement} element
 */
const handleHistory = (element) => {
  window.parent.addEventListener("keyup", (ev) => {
    console.log(ev);
    // ctrlKey
  });
};

/**
 *
 * @param {HTMLIFrameElement} iframeEl
 */
export const iframeHandler = (iframeEl) => {
  body = iframeEl.contentDocument.body;
  frameWindow = iframeEl.contentWindow;
  body.style.height = frameWindow.innerHeight;

  body.addEventListener("drop", dropCallback);

  initDragAndDrop(body);
};

/**
 *
 * @param {DragEvent} ev
 */
function dropCallback(ev) {
  ev.stopPropagation();
  const data = parse(ev.dataTransfer.getData("application/json"));
  const droppedEl = document.createElement(data.tagType);
  body.appendChild(droppedEl);
  body.classList.remove("ondragover");
  initSeperators(initDropEl(droppedEl, data));
  data.oldId ? body.querySelector(`#${data.oldId}`).remove() : "";
  iframeBodyChange(body.innerHTML);
}

/**
 *
 * @param {HTMLElement} el
 * @param {{tagType:string , inner:string , classes:string,oldId:string}} data
 * @returns
 */
function initDropEl(el, data) {
  el.id = uniqueID();
  el.setAttribute("draggable", "true");
  el.setAttribute("editable", "true");
  el.innerHTML = data.inner;
  data.classes && el.classList.add(...data.classes.split(" "));
  // el.textContent
  //   ? ""
  //   : el.insertAdjacentText("beforeend", `Hello i am ${data.tagType}`);
  el.insertAdjacentHTML(
    "beforeend",
    html`
      <div class="seperator top"></div>
      <div class="seperator bottom"></div>
    `
  );

  initDragAndDrop(el);

  /**
   *
   * @param {DragEvent} ev
   */
  const dropCallback = (ev) => {
    ev.stopPropagation();
    const data = parse(ev.dataTransfer.getData("application/json"));
    if (
      (data.oldId &&
        body
          .querySelector(`#${data.oldId}`)
          .querySelector(`#${ev.currentTarget.id}`)) ||
      data.oldId == ev.currentTarget.id
    ) {
      ev.target.classList.remove("ondragover", "prevent");
      return;
    }

    const newEl = document.createElement(data.tagType);

    if (ev.target.className.includes("seperator top")) {
      ev.currentTarget.insertAdjacentElement("beforebegin", newEl);
    } else if (ev.target.className.includes("seperator bottom")) {
      ev.currentTarget.insertAdjacentElement("afterend", newEl);
    } else {
      ev.target.appendChild(newEl);
    }

    ev.target.classList.remove("ondragover");
    initSeperators(initDropEl(newEl, data));
    data.oldId ? body.querySelector(`#${data.oldId}`).remove() : "";
   iframeBodyChange(body.innerHTML);
  };
  eventsWillClear = { ...eventsWillClear, drop: dropCallback };
  document.body.parentElement;

  el.addEventListener("drop", dropCallback);

  return [
    el.querySelector(".seperator.top"),
    el.querySelector(".seperator.bottom"),
  ];
}

/**
 *
 * @param {HTMLElement} el
 */
function initDragAndDrop(el) {
  /**
   *
   * @param {DragEvent} ev
   */
  const dragStartCallback = (ev) => {
    ev.stopPropagation();

    const elData = {
      tagType: ev.target.tagName,
      inner: ev.target.innerHTML,
      oldId: ev.target.id,
      classes: ev.target.className,
    };
    ev.dataTransfer.setData("application/json", stringify(elData));
  };

  /**
   *
   * @param {DragEvent} ev
   */
  const dragEnterCallback = (ev) => {
    ev.stopPropagation();
    const data = parse(ev.dataTransfer.getData("application/json"));
    (data.oldId &&
      ev.currentTarget.id &&
      body
        .querySelector(`#${data.oldId}`)
        .querySelector(`#${ev.currentTarget.id}`)) ||
    (data.oldId && data.oldId == ev.currentTarget.id)
      ? ev.target.classList.add("ondragover", "prevent")
      : ev.target.classList.add("ondragover");
  };

  const dragLeaveCallback = (ev) => {
    ev.stopPropagation();
    ev.target.classList.remove("ondragover", "prevent");
  };

  const dragOverCallback = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  el.addEventListener("dragstart", dragStartCallback);

  el.addEventListener("dragenter", dragEnterCallback);

  el.addEventListener("dragleave", dragLeaveCallback);

  el.addEventListener("dragover", dragOverCallback);

  eventsWillClear = {
    ...eventsWillClear,
    dragstart: dragStartCallback,
    dragenter: dragEnterCallback,
    dragleave: dragLeaveCallback,
    dragover: dragOverCallback,
  };
}

/**
 *
 * @param {HTMLElement[]} els
 */
function initSeperators(els) {
  const preventDefautlt = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    return;
  };
  els.forEach((el) => {
    el.addEventListener("drag", preventDefautlt);
    el.addEventListener("dragover", preventDefautlt);
    el.addEventListener("dragenter", (ev) => {
      ev.stopPropagation();
      const data = parse(ev.dataTransfer.getData("application/json"));
      (data.oldId &&
        body
          .querySelector(`#${data.oldId}`)
          .querySelector(`#${ev.currentTarget.parentNode.id}`)) ||
      data.oldId == ev.currentTarget.parentNode.id
        ? ev.target.classList.add("ondragover", "prevent")
        : ev.target.classList.add("ondragover");
    });
    el.addEventListener("dragleave", (ev) => {
      ev.stopPropagation();
      ev.target.classList.remove("ondragover", "prevent");
    });
  });
}

export const cleaner = () => {
  body.removeEventListener("drop", dropCallback);
};

//trash
// if (ev.target.classList.contains("ondragover") && gElement == ev.target) {
//   return;
// }
