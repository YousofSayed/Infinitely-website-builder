import { Icons } from "@/components/Icons/Icons";
import {
  defaultIsSupportedField,
  TokenPicker,
} from "@/components/Protos/TokenPicker";
import {
  inf_css_tokens_container,
  inf_css_tokens_ignore,
  inf_tokens_container,
  inf_tokens_ignore,
} from "@/constants/shared";
import { getParentNode, getProjectData } from "@/helpers/functions";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";

const isSupportedField = (el) => {
  // 1. App specific rules
  if (!getParentNode((n) => n.hasAttribute(inf_css_tokens_container), el))
    return false;
  if (el.hasAttribute(inf_css_tokens_ignore)) return false;

  // 2. Delegate generic DOM rules to the base component
  return defaultIsSupportedField(el);
};

export const CssTokenPicker = () => {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const themes = useLiveQuery(
    async () => await (await getProjectData()).themes,
    [],
  );
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const projectData = await getProjectData();
      const themes = projectData.themes;
      if (!themes) {
        setTokens([]);
        setIsLoading(false);
        return;
      }
      const tokens = themes.config
        .map((theme) => Object.values(theme.modes))
        .flat()
        .map((mode) => {
          return mode.categories;
        })
        .concat(themes.root.root_categories || [])
        .flat()
        .map((category) => {
          const vars = category.vars || {};
          const tokens = Object.entries(vars).map(
            ([key, value]) => `--${category.name}-${key}`,
          );
          return tokens;
        })
        .flat();

      setTokens([...new Set(tokens)]);
      //   console.log(
      //     "css vars : ",
      //     tokens,
      //     themes.config
      //       .map((theme) => Object.values(theme.modes))
      //       .flat()
      //       .concat(themes.root.root_categories || []),
      //   );

      setIsLoading(false);
    })();
  }, [themes]);

  return (
    <TokenPicker
      items={tokens}
      starter={`--|var`}
      ender={``}
      prefix={(value) => `var(${value})`}
      isSupportedField={isSupportedField}
      getItemId={(token) => token}
      extractValue={(token) => token}
      isLoading={isLoading}
      placeholder="Search css variables..."
      headerIcon={<Icons.code width={16} height={16} strokeColor="#e2e8f0" />}
      refreshIcon={<Icons.refresh width={15} height={15} />}
      emptyState="No css variables found"
    />
  );
};
