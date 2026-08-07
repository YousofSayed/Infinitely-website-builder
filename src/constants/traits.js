import { inputTypes, tagNames } from "@/constants/hsValues";

export const selectTagName = {
  placeholder: "select tag",
  label: "Select tag",
  name: "select-tag",
  role: "attribute",

  keywords: tagNames,
  type: "select",
  callback({ editor, trait, newValue }) {
    editor.getSelected().set("tagName", newValue || "div");
  },
};

export const selectInputType = {
  name: "type",
  label: "select type",
  type: "select",
  role: "attribute",
  keywords: inputTypes,
};
