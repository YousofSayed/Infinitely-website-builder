export const filterTypes = [
  "blur",
  "brightness",
  "contrast",
  "drop-shadow",
  "grayscale",
  "hue-rotate",
  "invert",
  "opacity",
  "saturate",
  "sepia",
];

export const filterUnits = {
  blur: "px",
  brightness: "%", // Typically used with percentages
  contrast: "%", // Typically used with percentages
  "drop-shadow": "px", // For offset and blur radius
  grayscale: "%", // Typically used with percentages
  "hue-rotate": "deg",
  invert: "%", // Typically used with percentages
  opacity: "%", // Typically used with percentages
  saturate: "%", // Typically used with percentages
  sepia: "%", // Typically used with percentages
};

export const pseudoElements = [
  "::after",
  "::before",
  "::first-letter",
  "::first-line",
  "::marker",
  "::placeholder",
  "::selection",
  "::backdrop",
  "::cue",
  "::file-state-button",
  "::part",
  "::slotted",
  "::grammar-error",
  "::spelling-error",
];

export const pseudoClasses = [
  ":active",
  ":any-link",
  ":checked",
  ":default",
  ":defined",
  ":dir()", // Example: :dir(ltr), :dir(rtl)
  ":disabled",
  ":empty",
  ":enabled",
  ":first",
  ":first-child",
  ":first-of-type",
  ":focus",
  ":focus-visible",
  ":focus-within",
  ":fullscreen",
  ":has()", // CSS4
  ":hover",
  ":in-range",
  ":indeterminate",
  ":invalid",
  ":is()", // CSS4
  ":lang()", // Example: :lang(en), :lang(fr)
  ":last-child",
  ":last-of-type",
  ":link",
  ":not()", // Example: :not(.class)
  ":nth-child()", // Example: :nth-child(2n)
  ":nth-last-child()", // Example: :nth-last-child(2n)
  ":nth-last-of-type()", // Example: :nth-last-of-type(2n)
  ":nth-of-type()", // Example: :nth-of-type(2n)
  ":only-child",
  ":only-of-type",
  ":optional",
  ":out-of-range",
  ":placeholder-shown",
  ":read-only",
  ":read-write",
  ":required",
  ":root",
  ":scope",
  ":target",
  ":valid",
  ":visited",
  ":where()", // CSS4
];

export const statesKeys = pseudoElements.concat(pseudoClasses).sort();

export const backgroundRepeatValues = [
  "repeat",
  "repeat-x",
  "repeat-y",
  "no-repeat",
  "space",
  "round",
];

export const backgroundSize = ["auto", "cover", "contain"];

export const backgroundClipValues = [
  "border-box",
  "padding-box",
  "content-box",
  "text",
];

export const backgroundAttachmentValues = ["scroll", "fixed", "local"];

export const backgroundBlendModeValues = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export const animationFillModes = [
  "none", // The animation will not apply any styles to the target when it is not playing.
  "forwards", // The animation will apply the styles of the last keyframe after it ends.
  "backwards", // The animation will apply the styles of the first keyframe before it starts.
  "both", // The animation will follow the rules for both forwards and backwards.
];

export const animationTimingFunctions = [
  "linear", // Animation progresses at a constant speed.
  "ease", // Starts slow, speeds up, and then slows down at the end.
  "ease-in", // Starts slow and accelerates towards the end.
  "ease-out", // Starts fast and decelerates towards the end.
  "ease-in-out", // Starts slow, speeds up, and then slows down.
  "step-start", // Jumps instantly to the final state at the start of the animation.
  "step-end", // Jumps instantly to the final state at the end of the animation.
  "steps(n, start)", // Divides the animation into `n` steps, starting at the beginning of each step.
  "steps(n, end)", // Divides the animation into `n` steps, ending at the end of each step.
  "cubic-bezier(x1, y1, x2, y2)", // Allows custom easing with control points from (0, 0) to (1, 1).
];

export const animationIterationCounts = [
  "1", // Plays once
  "2", // Plays twice
  "3", // Plays three times
  "infinite", // Loops indefinitely
];

export const animationDirections = [
  "normal", // Animation plays forwards each cycle.
  "reverse", // Animation plays backwards each cycle.
  "alternate", // Animation alternates direction, starting forwards, then backwards.
  "alternate-reverse", // Animation alternates direction, starting backwards, then forwards.
];

export const animationPlayStates = [
  "running", // The animation is currently playing.
  "paused", // The animation is paused.
];

export const animationCompositions = [
  "replace", // Each animation replaces the previous one on the same property.
  "add", // Animations are added together, combining effects.
  "accumulate", // Values accumulate, creating a cumulative effect.
];

export const fontWeights = [
  "100 - Thin",
  "200 - Extra Light",
  "300 - Light",
  "400 - Regular",
  "500 - Medium",
  "600 - Semi Bold",
  "700 - Bold",
  "800 - Extra Bold",
  "900 - Black",
];

export const textOverflowValues = ["clip", "ellipsis", "inherit", "unset"];

export const overflowValues = [
  "auto",
  "hidden",
  "visible",
  "scroll",
  "initial",
];

export const displayValues = [
  "block",
  "inline",
  "inline-block",
  "flex",
  "grid",
  "none",
  "list-item",
];

export const flexDirectionValues = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
];

export const cursorValues = [
  "auto",
  "default",
  "none",
  "context-menu",
  "help",
  "pointer",
  "progress",
  "wait",
  "cell",
  "crosshair",
  "text",
  "vertical-text",
  "alias",
  "copy",
  "move",
  "no-drop",
  "not-allowed",
  "grab",
  "grabbing",
  "all-scroll",
  "col-resize",
  "row-resize",
  "n-resize",
  "e-resize",
  "s-resize",
  "w-resize",
  "ne-resize",
  "nw-resize",
  "se-resize",
  "sw-resize",
  "ew-resize",
  "ns-resize",
  "nesw-resize",
  "nwse-resize",
  "zoom-in",
  "zoom-out"
];


export const transformValues = [
  "none", // No transformation
  "matrix", // 2D Matrix transformation
  "matrix3d", // 3D Matrix transformation
  "translate", // 2D translation
  "translateX", // Horizontal translation
  "translateY", // Vertical translation
  "translateZ", // Depth translation (3D)
  "translate3d", // 3D translation
  "scale", // 2D scaling
  "scaleX", // Horizontal scaling
  "scaleY", // Vertical scaling
  "scaleZ", // Depth scaling (3D)
  "scale3d", // 3D scaling
  "rotate", // 2D rotation
  "rotateX", // Rotation around X-axis (3D)
  "rotateY", // Rotation around Y-axis (3D)
  "rotateZ", // Rotation around Z-axis (3D)
  "skew", // 2D skewing
  "skewX", // Horizontal skewing
  "skewY", // Vertical skewing
  "perspective", // Perspective for 3D transformations
];

export  const transformUnits = {
  none: null,         // No value
  matrix: null,       // Complex value (no unit)
  matrix3d: null,     // Complex value (no unit)
  translate: "px",
  translateX: "px",
  translateY: "px",
  translateZ: "px",
  translate3d: "px",
  scale: "",          // Unitless
  scaleX: "",
  scaleY: "",
  scaleZ: "",
  scale3d: "",
  rotate: "deg",
  rotateX: "deg",
  rotateY: "deg",
  rotateZ: "deg",
  skew: "deg",
  skewX: "deg",
  skewY: "deg",
  perspective: "px"
};


export const alignItemsValues = [
  "stretch", // Default. Stretches items to fill the container
  "flex-start", // Aligns items to the start of the container
  "flex-end", // Aligns items to the end of the container
  "center", // Centers items in the container
  "baseline", // Aligns items to the baseline of the container
  "start", // Aligns items to the start of the writing mode direction
  "end", // Aligns items to the end of the writing mode direction
  "self-start", // Aligns items to the start of their margin box
  "self-end", // Aligns items to the end of their margin box
];

export const alignContentValues = [
  "stretch", // Default. Stretches lines to fill the container
  "flex-start", // Packs lines to the start of the container
  "flex-end", // Packs lines to the end of the container
  "center", // Packs lines to the center of the container
  "space-between", // Distributes lines with space between them
  "space-around", // Distributes lines with space around them
  "space-evenly", // Distributes lines with equal space around them
  "start", // Aligns lines to the start of the writing mode direction
  "end", // Aligns lines to the end of the writing mode direction
  "baseline", // Aligns lines to the baseline of the container
];

export const justifyContentValues = [
  "flex-start", // Aligns items to the start of the container
  "flex-end", // Aligns items to the end of the container
  "center", // Centers items in the container
  "space-between", // Distributes items with space between them
  "space-around", // Distributes items with space around them
  "space-evenly", // Distributes items with equal space around them
  "start", // Aligns items to the start of the writing mode direction
  "end", // Aligns items to the end of the writing mode direction
  "left", // Aligns items to the left of the container (for horizontal flex direction)
  "right", // Aligns items to the right of the container (for horizontal flex direction)
  "safe center", // Centers items in the container, but avoids positional instability
  "unsafe center", // Centers items, without avoiding positional instability
];

export const justifySelfValues = [
  "auto", // Default. Aligns the item according to the container's justify-items value
  "start", // Aligns the item to the start of the container
  "end", // Aligns the item to the end of the container
  "center", // Centers the item within the container
  "stretch", // Stretches the item to fill the container
  "self-start", // Aligns the item to the start of its margin box
  "self-end", // Aligns the item to the end of its margin box
  "left", // Aligns the item to the left (for block elements with horizontal direction)
  "right", // Aligns the item to the right (for block elements with horizontal direction)
];

export const justifyItemsValues = [
  "auto", // Default. Uses the alignment defined by the item's container (typically 'stretch')
  "start", // Aligns items to the start of their grid area
  "end", // Aligns items to the end of their grid area
  "center", // Centers items within their grid area
  "stretch", // Stretches items to fill their grid area (default behavior)
];

export const positionValues = [
  "static",
  "relative",
  "absolute",
  "fixed",
  "sticky",
  "initial",
  "inherit",
  "revert",
  "unset",
];

export const borderStyles = [
  "none", // No border
  "hidden", // Hidden border (equivalent to 'none', but used in tables)
  "dotted", // Dotted border
  "dashed", // Dashed border
  "solid", // Solid border
  "double", // Double border
  "groove", // Grooved border (appears as if carved)
  "ridge", // Ridged border (appears as if coming out)
  "inset", // Inset border (appears as if embedded)
  "outset", // Outset border (appears as if coming out)
];

export const textDecorationLineValues = [
  "none", // No text decoration.
  "underline", // Underlines the text.
  "overline", // Adds a line above the text.
  "line-through", // Strikes through the text.
  "blink", // Makes the text blink (not widely supported and considered obsolete).
  "inherit", // Inherits the text-decoration value from its parent element.
  "initial", // Sets the property to its default value.
  "unset", // Removes any inherited value and sets it to initial or inherit, based on context.
];

export const alignSelfValues = [
  'start',
  'center',
  'end',
  'stretch',
  'space-evenly',
]

export const textDecorationStyleValues = [
  "solid", // A solid line (default).
  "double", // A double line.
  "dotted", // A dotted line.
  "dashed", // A dashed line.
  "wavy", // A wavy line.
  "inherit", // Inherits the value from its parent element.
  "initial", // Sets the property to its default value.
  "unset", // Removes any inherited value and sets it to initial or inherit, based on context.
];

export const wordBreakValues = [
  "normal", // Default. Uses the browser's default line break rules.
  "break-all", // Breaks words at any character to prevent overflow.
  "keep-all", // Keeps words unbroken unless a line break opportunity exists.
  "break-word", // Breaks words at the edge of the containing block (not standard, deprecated).
];

export const cssFonts = [
  "Arial",
  "Verdana",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Comic Sans MS",
  "Impact",
  "Palatino Linotype",
  "Lucida Sans",
  "Lucida Console",
  "Arial Black",
  "Century Gothic",
  "Lucida Sans Unicode",
  "Franklin Gothic Medium",
  "Gill Sans",
  "Optima",
  "Futura",
  "Candara",
  "Geneva",
  "Courier",
  "MS Serif",
  "MS Sans Serif",
  "Perpetua",
  "Rockwell",
  "Symbol",
  "Webdings",
  "Wingdings",
  "Zapf Dingbats",
  "Bookman Old Style",
  "Book Antiqua",
  "Calisto MT",
  "Cambria",
  "Consolas",
  "Corbel",
  "Hoefler Text",
  "Minion Pro",
  "Myriad Pro",
  "Adobe Garamond",
  "Avant Garde",
  "Baskerville",
  "Didot",
  "Goudy Old Style",
  "Harrington",
  "ITC Franklin Gothic",
  "Letter Gothic",
  "Old English Text",
  "Stencil",
  "Vivaldi",
  "Monaco",
  "Bodoni MT",
  "Copperplate Gothic Light",
  "Wide Latin",
  "Tw Cen MT",
  "MS Gothic",
  "SimSun",
  "MingLiU",
  "PMingLiU",
  "Microsoft JhengHei",
  "Microsoft YaHei",
  "SimHei",
  "DFKai-SB",
  "Batang",
  "Gulim",
  "Dotum",
  "Gungsuh",
  "Malgun Gothic",
  "Nanum Gothic",
  "Noto Sans",
  "Noto Serif",
  "Roboto",
  "Open Sans",
  "Lato",
  "Oswald",
  "Raleway",
  "PT Sans",
  "PT Serif",
  "Playfair Display",
  "Montserrat",
  "Source Sans Pro",
  "Merriweather",
  "Ubuntu",
  "Nunito",
  "Rubik",
  "Mukta",
  "Poppins",
  "Cabin",
  "Oxygen",
  "Dancing Script",
  "Lobster",
  "Pacifico",
  "Shadows Into Light",
  "Indie Flower",
  "Amatic SC",
  "Josefin Sans",
  "Righteous",
  "Kalam",
  "Permanent Marker",
  "Fredericka the Great",
  "Caveat",
  "Quicksand",
  "Anton",
  "Bungee",
  "Crimson Text",
  "EB Garamond",
  "Cinzel",
  "Play",
  "Fira Sans",
  "Archivo",
  "Sarabun",
  "Asap",
  "Yanone Kaffeesatz",
  "Comfortaa",
  "Muli",
  "Titillium Web",
  "Arvo",
  "Karla",
  "Cormorant Garamond",
  "Bitter",
  "Notable",
  "Kanit",
  "Vollkorn",
  "Abril Fatface",
  "Satisfy",
  "Lobster Two",
  "Bangers",
  "Chewy",
  "Luckiest Guy",
  "Fredoka One",
  "Baloo",
  "Margarine",
  "Cookie",
  "Gloria Hallelujah",
  "Rock Salt",
  "Shadows Into Light Two",
  "Rancho",
  "Pacifico",
  "Great Vibes",
  "Sacramento",
  "Parisienne",
  "Kaushan Script",
  "Norican",
  "Courgette",
  "Lobster",
  "Yellowtail",
  "Dancing Script",
  "Pacifico",
  "Gloria Hallelujah",
  "Shadows Into Light",
];

export const writingModeValues = [
  "horizontal-tb", // Horizontal text flow (default for most Western scripts)
  "vertical-rl", // Vertical text flow from right to left (common in Japanese, Chinese)
  "vertical-lr", // Vertical text flow from left to right
  "sideways-rl", // Horizontal layout with vertical text rotated 90° clockwise
  "sideways-lr", // Horizontal layout with vertical text rotated 90° counterclockwise
];

export const whiteSpaceValues = [
  "normal", // Collapses whitespace and breaks lines as needed
  "nowrap", // Collapses whitespace and prevents line breaks
  "pre", // Preserves all whitespace and line breaks exactly as in HTML
  "pre-wrap", // Preserves whitespace and line breaks, wraps text to fit the container
  "pre-line", // Collapses whitespace but preserves line breaks
];

export const touchActionValues = [
  "auto", // Default, lets the browser decide the behavior
  "none", // Disables all touch gestures
  "manipulation", // Allows manipulation gestures like scroll, but disables zoom
  "pan-x", // Allows horizontal panning, disables vertical gestures
  "pan-y", // Allows vertical panning, disables horizontal gestures
  "pan-left", // Allows panning to the left
  "pan-right", // Allows panning to the right
  "pan-up", // Allows panning upwards
  "pan-down", // Allows panning downwards
  "pinch-zoom", // Allows pinch zoom, disables other gestures like panning
];

export const mixBlendModeValues = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
  "plus-darker",
  "plus-lighter"
];

 export const isolationValues = [
  "auto",
  "isolate"
];



export const wordWrap = [
  "normal",
  "break-word" // alias for overflow-wrap
];

export const whiteSpaceCollapse = [
  "collapse",
  "preserve",
  "preserve-breaks",
  "break-spaces"
];

export const whiteSpaceTrim = [
  "none",
  "start",
  "end",
  "both"
];

export const transformOriginValues = [
  // Keyword values (2D)
  "top",
  "right",
  "bottom",
  "left",
  "center",

  // Paired keyword values (2D)
  "top left",
  "top center",
  "top right",
  "center left",
  "center center",
  "center right",
  "bottom left",
  "bottom center",
  "bottom right",

  // Length values (2D, examples)
  "0px",
  "10px",
  "50px",
  "100px",
  "0px 0px",
  "10px 20px",
  "50px 50px",

  // Percentage values (2D, examples)
  "0%",
  "50%",
  "100%",
  "0% 0%",
  "50% 50%",
  "100% 50%",

  // Mixed length and percentage (2D, examples)
  "10px 50%",
  "50% 20px",

  // 3D transform-origin values (includes z-axis)
  "0px 0px 0px",
  "50% 50% 10px",
  "center center 20px",
  "left top 30px"
];

export const willChangeValues = [
  // Special values
  "auto",
  "scroll-position",
  "contents",

  // Common CSS properties used with will-change
  "transform",
  "opacity",
  "filter",
  "top",
  "left",
  "right",
  "bottom",
  "width",
  "height",
  "background-color",
  "color",
  "font-size",
  "z-index",
  "clip-path",
  "box-shadow",
  "border-radius",
  "perspective",
  "scale",
  "rotate",
  "translate",
  "skew"
];

export const containValues = [
  "none",
  "strict",
  "content",
  "layout",
  "style",
  "paint",
  "size"
];

export const userSelectValues = [
  "auto",
  "none",
  "text",
  "all",
  "contain"
];

export const tabSizeValues = [
  // Integer values (number of spaces)
  "0",
  "1",
  "2",
  "4",
  "8",

  // Length values (examples)
  "8px",
  "16px",
  "1rem",
  "2em",
  "10pt"
];

export const pointerEventsValues = [
  'auto',
  'none',

  // SVG-specific values
  'visiblePainted',
  'visibleFill',
  'visibleStroke',
  'visible',
  'painted',
  'fill',
  'stroke',
  'all',

  // Global CSS values
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset'
];
