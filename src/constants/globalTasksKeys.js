import { uniqueId } from "lodash";

export const Media_Manager_keys = {
  deleteAll: uniqueId("deleteAll-"),
  deleteSelected:  uniqueId("deleteSelected-"),
  upload: uniqueId("upload-"),
};

export const File_View_keys = {
  delete: uniqueId("delete-"),
};

export const Fonts_manager_keys = {
  install: uniqueId("install-"),
}

export const Pages_manager_keys = {
  delete: uniqueId("delete-"),
  upload: uniqueId("upload-"),
  create: uniqueId("create-"),
}