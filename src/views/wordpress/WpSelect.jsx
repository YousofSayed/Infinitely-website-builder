import {
  wp_create_option,
  wp_create_single,
  wp_delete_single,
  wp_get,
  wp_get_media_as_blob,
  wp_get_meta,
  wp_get_option,
  wp_read_files,
  wp_update_meta,
  wp_update_single,
  wp_write_files,
} from "@/apps/wordpress/functions";
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
  WP_DEFAULT_TEMPLATES,
  wp_edite_mode,
  wp_page_config,
  wp_rest_base_edite,
} from "@/constants/shared";
import { currentWpPageNameState } from "@/helpers/atoms";
import { functionToString } from "@/helpers/bridge";
import { db } from "@/helpers/db";
import {
  wpWorkerCallbackListener,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { wp_page, wp_pages } from "@/helpers/jsDocs";
import { useOnline } from "@/hooks/useOnline";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { isArray, isNaN, isNumber, isPlainObject } from "lodash";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";

export const SelectWpTemplate = () => {
  const [template, setTemplate] = useState(wp_page);
  const [templates, setTemplates] = useState(wp_pages);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [postLoader, setPostsLoader] = useState(true);
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const [animateRef] = useAutoAnimate();
  const paramsRef = useRef({ per_page: 100, page: 1 });
  console.log("projectId", projectId, localStorage.getItem(current_project_id));

  const [pageSlug, setPageSlug] = useState("");
  const getTemplates = useCallback(async () => {
    const templates = await wp_get({
      endpoint: "inf_template",
      projectId,
      params: paramsRef.current
    });

    setTemplates((old) => [...old, ...templates]);
    return templates;
  }, [paramsRef.current]);

  // useEffect(() => {
  //   getTemplates();
  // }, []);

  useOnline({
    online: async () => await getTemplates(),
    defaultCallback: async () => await getTemplates(),
  }, [])

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full  flex flex-col h-full justify-center items-center ">
      <section className="w-full h-full  bg-slate-950 rounded-lg flex flex-col gap-5 justify-center items-center p-5">
        <section
          ref={animateRef}
          className="flex flex-col gap-3 items-center justify-center p-5 inf-blur bg-slate-800 w-full h-full   rounded-lg"
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
              // key={pages.length}
              useLoader={!Boolean(Object.keys(templates).length)}
              value={template?.slug || ""}
              inputClassName="text-center bg-slate-900"
              placeholder="Select Template"
              keywords={Object.values(templates).map((temp) => temp.slug)}
              onScrollEnd={async () => {
                console.log("scroll end");
                // posts_params.current.per_page += 100;
                if (paramsRef.current.end) {
                  return;
                }
                const tid = toast.loading(
                  <ToastMsgInfo msg={`Loading templates...`} />,
                );
                paramsRef.current.page += 1;

                const templates = await wp_get({
                  endpoint: 'inf_template',
                  projectId,
                  params: paramsRef.current,
                });
                isArray(templates)
                  ? setTemplates((old) => [...old, ...templates])
                  : (paramsRef.current.end = true);
                toast.done(tid);
              }}
              onKeywordsSeted={(kws, setNewKeywords) => {
                setNewKeywords(
                  Object.values(templates).map((temp) => temp.slug),
                );
              }}
              onAll={(value) => {
                try {
                  const temp = Object.values(templates).find(
                    (temp) => temp.slug === value,
                  );
                  setTemplate(temp);
                } catch (error) {
                  setTemplate({});
                  throw new Error(error);
                }
              }}
            />
          </section>

          {Boolean(template?.slug) && isArray(templates) ? (
            <>
              <section className="flex flex-col gap-2 items-center px-2 py-5 rounded-lg bg-slate-900 w-[300px]">
                <Button
                  onClick={async () => {
                    if (!template.slug) {
                      toast.warn(
                        <ToastMsgInfo
                          msg={`Please Select Template to edite 😒`}
                        />,
                      );
                      return;
                    }
                    template.meta && delete template.meta;
                    template.inf_meta && delete template.inf_meta;

                    if (!isPlainObject(template)) {
                      toast.error(
                        <ToastMsgInfo
                          msg={`Page not found , this is tricky 🤨`}
                        />,
                      );
                      throw new Error(`Page not found , this is tricky 🤨`);
                    }

                    localStorage.setItem(current_page_id, template.slug);
                    localStorage.setItem(
                      wp_page_config,
                      JSON.stringify(template),
                    );
                    localStorage.setItem(wp_edite_mode, template.type);
                    setCurrentWpPageName(template.slug);
                    navigate("/add-blocks");
                  }}
                >
                  Edite
                </Button>
                <h1 className="text-slate-200 font-semibold">OR</h1>

                <Link
                  to={"/wordpress/create"}
                  className="font-semibold text-white  p-2 rounded-lg bg-green-600"
                >
                  Create New Template
                </Link>
              </section>
            </>
          ) : null}
        </section>
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const SelectWpPost = () => {
  const [pages, setPages] = useState(wp_pages);
  const [postType, setPostType] = useState("");
  const [postTypeName, setPostTypeName] = useState("");
  const [types, setTypes] = useState({});
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [postLoader, setPostsLoader] = useState(true);
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const [animateRef] = useAutoAnimate();

  const [pageSlug, setPageSlug] = useState("");
  const posts_params = useRef({ per_page: 100, page: 1 });

  const getTypes = async () => {
    try {
      const types = await wp_get({
        endpoint: "types",
        projectId,
      });

      types_not_allowed.forEach((type) => {
        delete types[type];
      });
      setTypes(types);
    } catch (error) {
      throw new Error(error);
    }
  };

  const getPages = async (rest_base, params = {}) => {
    try {
      setPostsLoader(true);
      if (!rest_base) {
        throw new Error("Rest base is empty 😩");
      }
      const pages = await wp_get({
        endpoint: rest_base,
        projectId,
        params: posts_params.current,
      });
      // posts_params.current.per_page += 100;
      // posts_params.current.page += 1;
      isArray(pages) && setPages((old) => [...old, ...pages]);
    } catch (error) {
      toast.error(<ToastMsgInfo msg={error.message} />);
      throw new Error(error);
    } finally {
      setPostsLoader(false);
    }
  };

  useOnline(
    {
      online: getTypes,
      defaultCallback: getTypes,
    },
    [],
  );

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const types = await wp_get({
  //         endpoint: "types",
  //         projectId,
  //       });

  //       types_not_allowed.forEach((type) => {
  //         delete types[type];
  //       });
  //       setTypes(types);
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   })();
  // }, []);

  // useEffect(() => {
  //   if (!postType) return;
  //   getPages(postType);
  // }, [postType]);

  useOnline(
    {
      online: () => {
        if (!postType) return;
        getPages(postType);
      },
      defaultCallback: () => {
        if (!postType) return;
        getPages(postType);
      },
    },
    [postType],
  );

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full  flex flex-col h-full justify-center items-center ">
      <section className="w-full overflow-auto h-full  bg-slate-950 rounded-lg flex flex-col gap-5 justify-center items-center p-5">
        <section
          ref={animateRef}
          className="flex flex-col gap-3 items-center justify-center p-5 inf-blur bg-slate-800 w-full h-full   rounded-lg"
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
              // key={pages.length}
              useLoader={!Boolean(Object.keys(types).length)}
              value={postTypeName}
              inputClassName="text-center bg-slate-900"
              placeholder="Select Post Type"
              keywords={Object.keys(types)
              }
              onKeywordsSeted={(kws, setNewKeywords) => {
                setNewKeywords(
                  Object.keys(types)
                  ,
                );
              }}
              onAll={(value) => {
                try {
                  setPostTypeName(value);
                  const type = Object.values(types).find(
                    (type) => type.slug === value,
                  );
                  setPostType(type.rest_base);
                } catch (error) {
                  setPostType("");
                  throw new Error(error);
                } finally {
                  setPageSlug("");
                  setPages([]);
                }
              }}
            />
          </section>

          {Boolean(postType) && isArray(pages) ? (
            <>
              <FitTitle>Select post</FitTitle>
              <section className="w-[300px]">
                <Select
                  // key={pages.length}
                  useLoader={postLoader}
                  value={pageSlug}
                  inputClassName="text-center bg-slate-900"
                  placeholder="Select post"
                  keywords={pages.map((page) => page.slug).filter(Boolean)}
                  onMenuOpen={({ setKeywords }) => {
                    setKeywords(pages.map((page) => page.slug).filter(Boolean));
                  }}
                  onKeywordsSeted={(kws, setNewKeywords) => {
                    setNewKeywords(
                      pages.map((page) => page.slug).filter(Boolean),
                    );
                  }}
                  onAll={(value) => setPageSlug(value)}
                  onScrollEnd={async () => {
                    console.log("scroll end");
                    // posts_params.current.per_page += 100;
                    if (posts_params.current.end) {
                      return;
                    }
                    const tid = toast.loading(
                      <ToastMsgInfo msg={`Loading ${postType}...`} />,
                    );
                    posts_params.current.page += 1;

                    const pages = await wp_get({
                      endpoint: postType,
                      projectId,
                      params: posts_params.current,
                    });
                    isArray(pages)
                      ? setPages((old) => [...old, ...pages])
                      : (posts_params.current.end = true);
                    toast.done(tid);
                  }}
                />
              </section>
              {Boolean(pageSlug) && Boolean(postType) && (
                <section className="flex flex-col gap-2 items-center px-2 py-5 rounded-lg bg-slate-900 w-[300px]">
                  <Button
                    onClick={async () => {
                      if (!pageSlug) {
                        toast.warn(
                          <ToastMsgInfo
                            msg={`Please Select Page to edite 😒`}
                          />,
                        );
                        return;
                      }
                      const page = pages.find((page) => page.slug === pageSlug);
                      console.log('page selected :', page);
                      const save_state = isPlainObject(page?.inf_meta?.before_save) ? 'before_save' : 'saved';
                      delete page.meta;

                      if (!page) {
                        toast.error(
                          <ToastMsgInfo
                            msg={`Page not found , this is tricky 🤨`}
                          />,
                        );
                        throw new Error(`Page not found , this is tricky 🤨`);
                      }
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
                      localStorage.setItem(current_page_id, pageSlug);
                      localStorage.setItem(wp_rest_base_edite, postType);
                      localStorage.setItem(
                        wp_page_config,
                        JSON.stringify(page),
                      );
                      localStorage.setItem(wp_edite_mode, page.type);
                      setCurrentWpPageName(pageSlug);
                      navigate("/add-blocks");
                    }}
                  >
                    Edite
                  </Button>
                  <h1 className="text-slate-200 font-semibold">OR</h1>

                  <Link
                    to={"/wordpress/create"}
                    className="font-semibold text-white  p-2 rounded-lg bg-green-600"
                  >
                    Create New Post
                  </Link>
                </section>
              )}
            </>
          ) : Boolean(postType) ? (
            <section className="p-2 rounded-lg bg-slate-900 flex items-center justify-center w-[300px] h-full">
              <Loader />
            </section>
          ) : null}
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
  });
  const navigate = useNavigate();
  const [key, setKey] = useState("post");
  const [animateRef] = useAutoAnimate();

  return (
    <section className="flex flex-col gap-2 justify-center items-center h-full">
      <ToastContainer
        // toastStyle={{ background: "transparent" }}

        autoClose={3000}
        draggable={true}
        theme="dark"
        limit={10}
        pauseOnHover={true}
        position="top-left"
        toastClassName={`bg-surface-main`}
        className={`z-[1000000]    `}
      // containerId={`main-toast-container`}

      // stacked={true}
      />
      <section className="flex justify-center gap-5 p-2 container mx-auto items-center bg-slate-950 rounded-lg">
        <Button
          className="bg-slate-800 font-bold transition-colors hover:bg-blue-600"
          onClick={() => {
            navigate("/workspace");
          }}
        >
          <span className="rotate-[90deg]">{Icons.arrow("white")}</span>{" "}
          Workspace
        </Button>
        <Button
          className="bg-slate-800 font-bold transition-colors hover:bg-blue-600"
          onClick={() => {
            navigate("/wordpress/create");
          }}
        >
          Create
          <span className="rotate-[-90deg]">{Icons.arrow("white")}</span>{" "}
        </Button>
      </section>

      <section className="flex justify-center gap-5 p-2 container mx-auto items-center bg-slate-950 rounded-lg">
        {Object.keys(cmps).map((keyCmp, i) => (
          <Button
            key={i}
            className={`${key === keyCmp ? "bg-blue-600" : "bg-slate-800"
              } font-semibold capitalize`}
            onClick={() => {
              setKey(keyCmp);
            }}
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
