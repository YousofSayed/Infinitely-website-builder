import { getProjectData, getProjectId } from "@/helpers/functions";
import { useWordpress } from "@/hooks/useWordpress";
import { useWpGetInfinite } from "@/queries/wp.queries";
import React, { useState } from "react";

export const useWordpressAssets = ({ params = {}, callback = async (array = []) => {}  , deps = []}) => {
  const projectId = getProjectId();
  const [queryParams, setQueryParams] = useState({
    // page: 1,
    // per_page: 100,
    search: "",
    mime_type: "",
    orderby: "date",
    order: "desc",
    ...params,
  });

  const {
    data: mediaFilesData,
    isLoading: mediaFilesLoading,
    isRefetching: mediaFilesRefetching,
    fetchNextPage: mediaFilesFetchNextPage,
    isFetchingNextPage: mediaFilesIsFetchingNextPage,
    hasNextPage: mediaFilesHasNextPage,
  } = useWpGetInfinite("media", queryParams);

  useWordpress(async () => {
    // if (
    //   mediaFilesIsFetchingNextPage ||
    //   mediaFilesRefetching ||
    //   mediaFilesLoading
    // )
    //   return;
    if (!mediaFilesData?.pages?.length) return;
    const projectData = await getProjectData(projectId);
    const excludes = projectData.mainEditorScripts.footer
      .concat(projectData.mainEditorScripts.header)
      .concat(projectData.jsHeaderLibs)
      .concat(projectData.jsFooterLibs)
      .concat(projectData.cssLibs)
      .concat(projectData.globalCss)
      .concat(projectData.globalJs)
      .concat(projectData.mainEditorStyles);

    const mFilesDataFlat = mediaFilesData.pages.flat();

    if (isArray(mediaFilesData.pages)) {
      const willBe = mFilesDataFlat
        .flat()
        .filter((item) => !excludes.some((ex) => ex.id === item.id));

      console.log("files is :", willBe, excludes);
      callback(willBe);
    }
  }, [
    mediaFilesData,
    mediaFilesLoading,
    mediaFilesRefetching,
    mediaFilesIsFetchingNextPage,
    ...deps
  ]);

  return {
    mediaFilesData,
    mediaFilesLoading,
    mediaFilesRefetching,
    mediaFilesFetchNextPage,
    mediaFilesIsFetchingNextPage,
    mediaFilesHasNextPage,
    queryParams,
    setQueryParams,
  }
};
