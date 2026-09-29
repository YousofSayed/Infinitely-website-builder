import { defineRoot } from "@/helpers/bridge";
import { getCurrentPageName } from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { useNormal } from "@/hooks/useNormal";
import { isFunction, uniqueId } from "lodash";
import React, { useState } from "react";

export const useNormalAssets = ({
  callback = async (files = []) => {},
  deps = [],
}) => {
  const [loading, setLoading] = useState(true);

  useNormal(async () => {
    const getAndSet = async (data) => {
      console.log("data from assetes", data);

      setLoading(true);
      const currentPageName = getCurrentPageName();

      const filesHandlers = await opfs.getAllFiles(defineRoot(`/assets`));

      console.log("filesHandlers", filesHandlers);

      const files = await Promise.all(
        filesHandlers.map(async (handle) => {
          const file = await handle.getOriginFile();
          const link = currentPageName.includes(`index.html`)
            ? `./assets/${file.name}`
            : `../assets/${file.name}`;

          const output =
            /** @type {import('@/helpers/types').InfinitelyNormalMedia} */ ({
              file,
              name: file.name,
              slug: file.name,
              path: handle.path,
              id: `${file.name}-${handle.path}-`,
              type: file.type,
              size: file.size,
              link,
              source_url: link,
            });
          return output;
        }),
      );

      console.log("normal mode files", files);

      if (isFunction(callback)) {
        await callback(files);
      }
      // unSelectAll();
      // setMediaFiles((old) => [...files]);
      // setMediaFilesInitialized(true);
      // allMediaRef.current = files;
      setLoading(false);
    };

    await getAndSet();

    const evCleaner = opfs.on(
      [
        "fileCreated",
        "filesCreated",
        "folderCreated",
        "foldersCreated",
        "entryRemoved",
        "entriesRemoved",
      ],
      getAndSet,
    );

    const brCleaner = opfs.onBroadcast(
      [
        "fileCreated",
        "filesCreated",
        "folderCreated",
        "foldersCreated",
        "entryRemoved",
        "entriesRemoved",
      ],
      getAndSet,
    );

    return () => {
      evCleaner();
      brCleaner();
    };
  }, [...deps]);

  return { loading };
};
