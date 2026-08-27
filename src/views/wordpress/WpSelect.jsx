import { config } from "@/config/brand";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/Protos/Button";
import {
  current_page_id,
  current_project_id,
  types_not_allowed,
  wp_edite_mode,
  wp_page_config,
  wp_rest_base_edite,
} from "@/constants/shared";
import { currentWpPageNameState } from "@/helpers/atoms";
import { db } from "@/helpers/db";
import { wp_page } from "@/helpers/jsDocs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { isPlainObject, isNumber, isNaN } from "lodash";
import React, { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { ShowIf } from "@/components/ShowIf";
// ✅ Import both hooks
import { usePosts, useWpGet, useWpGetInfinite } from "@/queries/wp.queries";
import { setWpPostConfig } from "@/helpers/functions";

export const SelectWpTemplate = () => {
  const [template, setTemplate] = useState(wp_page);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const [animateRef] = useAutoAnimate();

  // ✅ Use the new infinite hook (uses your worker under the hood!)
  const {
    data: templatesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isTemplatesLoading,
    isRefetching: isTemplatesRefetching,
  } = useWpGetInfinite("inf_template");

  // Flatten all pages into a single array
  const templates = useMemo(
    () => templatesData?.pages.flat() || [],
    [templatesData],
  );

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full flex flex-col h-full justify-center items-center">
      <section className="w-full h-full bg-slate-950 rounded-lg flex flex-col gap-5 justify-center items-center p-5">
        <section
          ref={animateRef}
          className="flex flex-col gap-3 items-center justify-center p-5 inf-blur bg-slate-800 w-full h-full rounded-lg"
        >
          <figure>
            <img src={config.logo} alt="inf-logo" />
          </figure>
          <h1 className="capitalize text-slate-200 text-2xl font-semibold shadow-lg">
            Select Template To edite
          </h1>

          <FitTitle>Select Template</FitTitle>
          <section className="w-[300px]">
            <Select
              useLoader={isTemplatesLoading || isTemplatesRefetching}
              isFetchingNext={isFetchingNextPage}
              value={template?.slug || ""}
              inputClassName="text-center bg-slate-900"
              placeholder="Select Template"
              keywords={templates.map((temp) => temp.slug)}
              onScrollEnd={() => {
                // ✅ Safely fetch next page via your worker
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              // onKeywordsSeted={(kws, setNewKeywords) => {
              //   setNewKeywords(templates.map((temp) => temp.slug));
              // }}
              onAll={(value) => {
                const temp = templates.find((temp) => temp.slug === value);
                setTemplate(temp || {});
              }}
            />
          </section>

          <ShowIf condition={Boolean(template?.slug)}>
            <section className="flex flex-col gap-2 items-center px-2 py-5 rounded-lg bg-slate-900 w-[300px]">
              <Button
                onClick={() => {
                  if (!template.slug) {
                    toast.warn(
                      <ToastMsgInfo
                        msg={`Please Select Template to edite 😒`}
                      />,
                    );
                    return;
                  }

                  const tempCopy = { ...template };
                  delete tempCopy.meta;
                  delete tempCopy.inf_meta;

                  if (!isPlainObject(tempCopy)) {
                    toast.error(
                      <ToastMsgInfo
                        msg={`Page not found , this is tricky 🤨`}
                      />,
                    );
                    return;
                  }

                  console.log("template.rest_base", template);

                  localStorage.setItem(current_page_id, template.slug);
                  localStorage.setItem(
                    wp_page_config,
                    JSON.stringify(tempCopy),
                  );
                  localStorage.setItem(wp_edite_mode, template.type);
                  localStorage.setItem(wp_rest_base_edite, "inf_template");
                  setCurrentWpPageName(template.slug);
                  navigate("/add-blocks");
                }}
              >
                Edite
              </Button>
              <h1 className="text-slate-200 font-semibold">OR</h1>

              <Link
                to={"/wordpress/create"}
                className="font-semibold text-white p-2 rounded-lg bg-green-600"
              >
                Create New Template
              </Link>
            </section>
          </ShowIf>
        </section>
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const SelectWpPost = () => {
  const [postType, setPostType] = useState("");
  const [postTypeName, setPostTypeName] = useState("");
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const [animateRef] = useAutoAnimate();
  const [pageSlug, setPageSlug] = useState("");

  // Standard query for Types
  const { data: rawTypes, isPending: isTypesLoading } = useWpGet("types");

  const types = useMemo(() => {
    if (!rawTypes || !isPlainObject(rawTypes)) return {};
    const filteredTypes = { ...rawTypes };
    types_not_allowed.forEach((type) => delete filteredTypes[type]);
    return filteredTypes;
  }, [rawTypes]);

  // ✅ Infinite query for Posts (Automatically disables if postType is "")
  // const {
  //   data: postsData,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   isPending: isPostsLoading,
  // } = useWpGetInfinite(postType);

  const {
    data: postsDataRes2,
    isPending: isPostsLoading2,
    isRefetching: isPostsRefetching2,
  } = usePosts(postType);

  const postsData2 = postsDataRes2?.data;

  console.log("postsData2", postsData2, postType, types);

  // Flatten all pages into a single array
  // const posts = useMemo(() => postsData?.pages.flat() || [], [postsData]);

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full flex flex-col h-full justify-center items-center">
      <section className="w-full overflow-auto h-full bg-slate-950 rounded-lg flex flex-col gap-5 justify-center items-center p-5">
        <section
          ref={animateRef}
          className="flex flex-col gap-3 items-center justify-center p-5 inf-blur bg-slate-800 w-full h-full rounded-lg"
        >
          <figure>
            <img src={config.logo} alt="inf-logo" />
          </figure>
          <h1 className="capitalize text-slate-200 text-2xl font-semibold shadow-lg">
            Select Post To edite
          </h1>

          <FitTitle>Select Post Type</FitTitle>
          <section className="w-[300px]">
            <Select
              useLoader={isTypesLoading}
              value={postTypeName}
              inputClassName="text-center bg-slate-900"
              placeholder="Select Post Type"
              keywords={Object.keys(types)}
              // onKeywordsSeted={(kws, setNewKeywords) => setNewKeywords(Object.keys(types))}
              onAll={(value) => {
                try {
                  setPostTypeName(value);
                  // const type = Object.values(types).find(
                  //   (type) => type.slug === value,
                  // );
                  setPostType(value);
                } catch (error) {
                  setPostType("");
                } finally {
                  setPageSlug("");
                }
              }}
            />
          </section>

          <ShowIf condition={Boolean(postType)}>
            <FitTitle>Select post</FitTitle>
            <section className="w-[300px]">
              <Select
                useLoader={isPostsLoading2}
                // isFetchingNext={isPostsRefetching2}
                value={pageSlug}
                inputClassName="text-center bg-slate-900"
                placeholder="Select post"
                keywords={
                  postsData2?.map?.((post) => post.slug).filter?.(Boolean) ?? []
                }
                onAll={(value) => setPageSlug(value)}
                // onScrollEnd={() => {
                //   // ✅ Safely fetch next page without wiping data or causing 400 errors
                //   if (hasNextPage && !isFetchingNextPage) {
                //     fetchNextPage();
                //   }
                // }}
              />
            </section>
          </ShowIf>

          <ShowIf condition={Boolean(pageSlug) && Boolean(postType)}>
            <section className="flex flex-col gap-2 items-center px-2 py-5 rounded-lg bg-slate-900 w-[300px]">
              <Button
                onClick={async () => {
                  if (!pageSlug) {
                    toast.warn(
                      <ToastMsgInfo msg={`Please Select Page to edite 😒`} />,
                    );
                    return;
                  }
                  const page = postsData2.find((page) => page.slug === pageSlug);

                  if (!page) {
                    toast.error(
                      <ToastMsgInfo
                        msg={`Page not found , this is tricky 🤨`}
                      />,
                    );
                    return;
                  }

                  const save_state = isPlainObject(page?.inf_meta?.before_save)
                    ? "before_save"
                    : "saved";

                  // Clone to avoid mutating TanStack Query cache directly
                  const pageCopy = { ...page };
                  delete pageCopy.meta;

                  await db.projects.update(projectId, {
                    current_inf_meta: page?.meta?.inf_meta || {},
                    currentEditingPage: {
                      name: pageSlug,
                      save_state,
                      ...(page?.meta?.inf_meta?.[save_state] || {
                        bodyAttributes: {},
                        cmds: {},
                        helmet: {},
                        libs: {},
                        pathes: {},
                        id: pageSlug,
                        components: [],
                        symbols: [],
                        fonts: {},
                        name: pageSlug,
                        js: "",
                        css: "",
                        motions: "",
                        tailwind: "",
                        rest_base: postType,
                        need_publish_to_wp: false,
                      }),
                    },
                  });

                  // localStorage.setItem(current_page_id, pageSlug);
                  // localStorage.setItem(wp_rest_base_edite, postType);
                  // localStorage.setItem(
                  //   wp_page_config,
                  //   JSON.stringify(pageCopy),
                  // );
                  // localStorage.setItem(wp_edite_mode, page.type);
                  setWpPostConfig({
                    rest_base:page.rest_base,
                    post_id: page.slug,
                    type: page.type,
                    post: page,
                  });

                  // setCurrentWpPageName(pageSlug);
                  navigate("/add-blocks");
                }}
              >
                Edite
              </Button>
              <h1 className="text-slate-200 font-semibold">OR</h1>

              <Link
                to={"/wordpress/create"}
                className="font-semibold text-white p-2 rounded-lg bg-green-600"
              >
                Create New Post
              </Link>
            </section>
          </ShowIf>
        </section>
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const WpSelect = () => {
  const cmps = useMemo(() => {
    return {
      template: <SelectWpTemplate />,
      post: <SelectWpPost />,
    };
  }, []);

  const navigate = useNavigate();
  const [key, setKey] = useState("post");
  const [animateRef] = useAutoAnimate();

  return (
    <section className="flex flex-col gap-2 justify-center items-center h-full shrink-0">
      <section className="flex justify-center gap-5 p-2 container mx-auto items-center bg-slate-950 rounded-lg">
        <Button
          className="bg-slate-800 font-bold transition-colors hover:bg-blue-600"
          onClick={() => navigate("/workspace")}
        >
          <span className="rotate-[90deg]">{Icons.arrow("white")}</span>{" "}
          Workspace
        </Button>
        <Button
          className="bg-slate-800 font-bold transition-colors hover:bg-blue-600"
          onClick={() => navigate("/wordpress/create")}
        >
          Create
          <span className="rotate-[-90deg]">{Icons.arrow("white")}</span>{" "}
        </Button>
      </section>

      <section className="flex justify-center gap-5 p-2 container mx-auto items-center bg-slate-950 rounded-lg">
        {Object.keys(cmps).map((keyCmp, i) => (
          <Button
            key={i}
            className={`${key === keyCmp ? "bg-blue-600" : "bg-slate-800"} font-semibold capitalize`}
            onClick={() => setKey(keyCmp)}
          >
            Select {keyCmp}
          </Button>
        ))}
      </section>

      <main ref={animateRef} className="min-h-[70%] container mx-auto">
        {Boolean(key) && cmps[key]}
      </main>
    </section>
  );
};
