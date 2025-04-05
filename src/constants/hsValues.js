export const inputTypes = [
  "button", // Button element that triggers actions
  "checkbox", // Checkbox for binary choices (true/false)
  "color", // Color picker input
  "date", // Date input without time (YYYY-MM-DD)
  "datetime-local", // Date and time input without timezone
  "email", // Email address input
  "file", // File upload input
  "hidden", // Hidden input that holds data without display
  "image", // Submit button that uses an image as the button
  "month", // Month and year selector (YYYY-MM)
  "number", // Numeric input with constraints
  "password", // Password input with masked characters
  "radio", // Radio button for selecting one option from a group
  "range", // Slider control for numeric input
  "reset", // Reset button that clears form values
  "search", // Search field with specific styling
  "submit", // Submit button for form submission
  "tel", // Telephone number input
  "text", // Standard single-line text input
  "time", // Time input (HH:MM format)
  "url", // URL input for web addresses
  "week", // Week selector (Week number and year)
];

export const eventNames = [
  ...new Set([
    // Mouse events
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "contextmenu",
    "wheel",

    // Keyboard events
    "keydown",
    "keyup",
    "keypress",

    // Form events
    "submit",
    "change",
    "input",
    "focus",
    "blur",
    "reset",
    "select",

    // Focus events
    "focusin",
    "focusout",

    // Touch events (for mobile)
    "touchstart",
    "touchend",
    "touchmove",
    "touchcancel",

    // Pointer events
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointerover",
    "pointerout",
    "pointerenter",
    "pointerleave",
    "pointercancel",
    "gotpointercapture",
    "lostpointercapture",

    // Drag and drop events
    "drag",
    "dragstart",
    "dragend",
    "dragenter",
    "dragover",
    "dragleave",
    "drop",

    // Clipboard events
    "copy",
    "cut",
    "paste",

    // Media events
    "play",
    "pause",
    "playing",
    "ended",
    "volumechange",
    "waiting",
    "durationchange",
    "timeupdate",
    "canplay",
    "canplaythrough",
    "seeking",
    "seeked",
    "loadeddata",
    "loadedmetadata",
    "progress",
    "stalled",
    "suspend",
    "ratechange",

    // Animation events
    "animationstart",
    "animationend",
    "animationiteration",

    // Transition events
    "transitionstart",
    "transitionend",
    "transitionrun",
    "transitioncancel",

    // Page events
    "DOMContentLoaded",
    "load",
    "beforeunload",
    "unload",
    "resize",
    "scroll",
    "error",
    "hashchange",
    "popstate",

    // Network events
    "online",
    "offline",

    // Storage events
    "storage",

    // Print events
    "beforeprint",
    "afterprint",

    // Miscellaneous events
    "abort",
    "canplay",
    "canplaythrough",
    "change",
    "close",
    "contextmenu",
    "cuechange",
    "error",
    "input",
    "invalid",
    "open",
    "pause",
    "play",
    "playing",
    "ratechange",
    "readystatechange",
    "reset",
    "seeked",
    "seeking",
    "stalled",
    "submit",
    "suspend",
    "toggle",
    "visibilitychange",

    // Sensor events
    "deviceorientation",
    "devicemotion",

    // Speech recognition events (if supported by the browser)
    "speechstart",
    "speechend",
    "result",
    "nomatch",
    "error",

    // Other specialized events
    "wheel",
    "message",
    "messageerror",
    "rejectionhandled",
    "unhandledrejection",
  ]),
];

export const hsZoo = [
  "result",
  "it",
  "its",
  "me",
  "my",
  "I",
  "the last",
  "the first",
  "the first of",
  "the last of",
  "the next of me",
  "the previous of me",
  "<css selector />",
  "event",
  "body",
  "target",
  "detail",
  "sender",
];

export const operators = [
  "==",
  "!=",
  "===",
  "!==",
  "<",
  "<=",
  ">",
  ">=",
  "is",
  "is not",
  "no",
  "matches",
  "exists",
  "is greater than",
  "is less than",
  "is empty",
];

export const httpSetterMethods = [
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "CONNECT",
  "TRACE",
];
export const httpGetterMethods = ["GET", "HEAD"];

export const defaultAttributeNames = [
  // Global attributes
  "id",
  "class",
  "style",
  "title",
  "lang",
  "dir",
  "tabindex",
  "role",
  "hidden",
  "data-*",
  "draggable",
  "contenteditable",
  "spellcheck",

  // // Event attributes
  // "onclick", "onchange", "onmouseover", "onmouseout", "onkeydown",
  // "onkeyup", "onfocus", "onblur", "onsubmit", "onload",

  // Link-related
  "href",
  "target",
  "rel",
  "type",
  "download",

  // Form-related
  "action",
  "method",
  "name",
  "value",
  "placeholder",
  "maxlength",
  "min",
  "max",
  "step",
  "autocomplete",
  "checked",
  "disabled",
  "readonly",
  "required",
  "multiple",
  "pattern",
  "size",

  // Image-related
  "src",
  "alt",
  "width",
  "height",
  "loading",

  // Media-related
  "controls",
  "autoplay",
  "loop",
  "muted",
  "poster",
  "preload",

  // Table-related
  "colspan",
  "rowspan",
  "scope",

  // Miscellaneous
  "async",
  "defer",
  "charset",
  "content",
  "http-equiv",
  "integrity",
  "crossorigin",
];

export const conversions = [
  "Array",
  "Date",
  "Float",
  "Fragment",
  "HTML",
  "Int",
  "JSON",
  "Number",
  "Object",
  "String",
  "Values",
];

export const fetchConversions = ["json", "Object", "html", "response"];

export const eventsModifiers = [
  "every",
  "queue all",
  "queue none",
  "queue first",
  "queue last",
];

export const putPositions = [
  "before",
  "after",
  "at the start of",
  "at the end of",
  "into",
];

export const measure = [
  "bounds",
  "bottom",
  "height",
  "left",
  "right",
  "scroll",
  "scrollHeight",
  "scrollLeft",
  "scrollLeftMax",
  "scrollTop",
  "scrollTopMax",
  "scrollWidth",
  "top",
  "width",
  "x",
  "y",
];

export const tagNames = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];
