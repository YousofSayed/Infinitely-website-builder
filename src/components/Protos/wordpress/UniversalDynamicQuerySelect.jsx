// components/Protos/wordpress/UniversalDynamicSelect.jsx
import { Select } from "@/components/Editor/Protos/Select";
import {
  useWpAllCategories,
  useWpAllPosts,
  useWpAllTags,
  useWpAuthors,
  useWpPostTypes,
} from "@/queries/wp.queries";

import { isArray } from "lodash";
import { useMemo } from "react";

// Hook router: maps resource string to the correct TanStack hook
const useResourceData = (resource) => {
  const postTypes = useWpPostTypes({exclude :["inf_symbols", "inf_blocks", "inf_template", "inf_motions"].join(",")});
  const authors = useWpAuthors({});
  const posts = useWpAllPosts({});
  const categories = useWpAllCategories();
  const tags = useWpAllTags(); // 🔥 NEW

  switch (resource) {
    case "postTypes":
      return postTypes;
    case "authors":
      return authors;
    case "posts":
      return posts;
    case "categories":
      return categories;
    case "tags":
      return tags; // 🔥 NEW
    default:
      return { data: null, isPending: false, isRefetching: false };
  }
};

export const UniversalDynamicQuerySelect = ({ setting, wpQuery, setWpQuery }) => {
  const {
    data: response,
    isPending,
    isRefetching,
  } = useResourceData(setting.resource);

  // Map data to keywords using the setting's getOption or a default fallback
  const keywords = useMemo(() => {
    if (!response?.success || !response?.data) return [];

    return response.data.map((item) => {
      if (setting.getOption) return setting.getOption(item);

      // Default fallback mapper
      return {
        value: item.id || item.name || item.slug,
        title: item.label || item.display_name || item.post_title || item.name,
      };
    });
  }, [response, setting]);

  const currentValue = wpQuery[setting.key];

  // Handle state updates (Single vs Multiple)
  const handleChange = (value) => {
    setWpQuery((old) => {
      if (setting.multiple) {
        let currentArr = old[setting.key];
        if (!isArray(currentArr)) currentArr = currentArr ? [currentArr] : [];
        return {
          ...old,
          [setting.key]: [...new Set([...currentArr, value])],
        };
      }
      return { ...old, [setting.key]: value };
    });
  };

  // Format value for the Select component display
  const displayValue =
    setting.multiple && isArray(currentValue)
      ? currentValue.join(",")
      : currentValue;

  return (
    <Select
      placeholder={setting.placeholder || `Select ${setting.title}`}
      useLoader={isPending || isRefetching}
      keywords={keywords}
      value={displayValue}
      onAll={setting.multiple ? undefined : handleChange}
      onItemClicked={setting.multiple ? handleChange : undefined}
      onEnterPress={setting.multiple ? handleChange : undefined}
    />
  );
};
