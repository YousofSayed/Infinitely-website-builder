export const hsVariablesRgx =
  /set(\s+)?(\$|\:)\w+(\s+)?to(\s+)?(\'|\`|\")?\w+(\'|\`|\")?|/gi;
export const jsURLRgx = /(\.+)?(?:\/[\w-]+)*\/[^\/"]+\.\w+/g;
export const commentRgx = /\/\*[\s\S]*?\*\//g;
export const DollarBracePlaceholderRgx =
  /\${[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*}/g;

export const DoubleBracePlaceholderRgx =
  /{{[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*}}/g;

export const styleRgx = /\{(?:(?!\s*--_init\s*:\s*[^;]+;\s*\}).)+:[^;]+/i;
