
export const hsVariablesRgx =
  /set(\s+)?(\$|\:)\w+(\s+)?to(\s+)?(\'|\`|\")?\w+(\'|\`|\")?|/gi;
export const jsURLRgx = /(\.+)?(?:\/[\w-]+)*\/[^\/"]+\.\w+/g;
export const commentRgx = /\/\*[\s\S]*?\*\//g;
export const DollarBracePlaceholderRgx =
  /\${[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*}/g;

export const DoubleBracePlaceholderRgx =
  /{{[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*}}/g;

export const styleRgx = /\{(?:(?!\s*--_init\s*:\s*[^;]+;\s*\}).)+:[^;]+/i;

export const urlRgx = /^https:\/\/(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+(?::\d{1,5})?(?:[/?#][^\s]*)?$/ig;


export const RTL_SCRIPTS = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u;
export const LETTER = /\p{L}/u;
