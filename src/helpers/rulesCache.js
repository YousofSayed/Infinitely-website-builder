import { getComponentRules } from "@/helpers/functions";

let rulesCache = {
  componentId: null,
  rules: [],
  stringRules: "",
  version: 0,
};

let cacheVersion = 0;

export const invalidateRulesCache = () => {
  cacheVersion++;
};

export const getCachedComponentRules = ({ editor, cmp, nested = true }) => {
  if (!cmp) return { rules: [], stringRules: "" };

  const cmpId = cmp.getId?.() || cmp.cid;

  if (
    rulesCache.componentId === cmpId &&
    rulesCache.version === cacheVersion
  ) {
    return { rules: rulesCache.rules, stringRules: rulesCache.stringRules };
  }

  const result = getComponentRules({ editor, cmp, nested });

  rulesCache.componentId = cmpId;
  rulesCache.rules = result.rules || [];
  rulesCache.stringRules = result.stringRules || "";
  rulesCache.version = cacheVersion;

  return result;
};