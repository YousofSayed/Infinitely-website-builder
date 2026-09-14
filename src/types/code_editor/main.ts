type AllHTMLElements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap] &
  HTMLElement &
  Element &
  HTMLObjectElement;
var $el: AllHTMLElements;
var $event: GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap];

type CSSProperties = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends Function
    ? never
    : K]?: string | number;
} & {
  [key: `--${string}`]: string | number | undefined;
};

interface ExplicitKeyframes {
  from?: CSSProperties;
  to?: CSSProperties;
  duration?: string | number;
  easing?: string;
}

interface InlineKeyframes extends CSSProperties {
  to?: CSSProperties;
  duration?: string | number;
  easing?: string;
}

type AnimationObject = ExplicitKeyframes | InlineKeyframes;

type AnimationValue = string | AnimationObject;
