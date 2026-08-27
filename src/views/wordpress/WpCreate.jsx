import {
  wp_create_single,
  wp_get,
  wp_insert_post,
  wp_update_meta,
  wp_update_single,
} from "@/Apps/wordpress/functions";
import { wp_toast_handler } from "@/Apps/wordpress/functions_ui";
import { config } from "@/config/brand";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import {
  current_page_id,
  current_project_id,
  types_not_allowed,
  WP_DEFAULT_TEMPLATES,
} from "@/constants/shared";
import { currentWpPageNameState } from "@/helpers/atoms";
import { fetcherWorker } from "@/helpers/defineWorkers";
import { wpWorkerCallbackMaker } from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { wp_page, wp_pages } from "@/helpers/jsDocs";
import { useOnline } from "@/hooks/useOnline";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { isArray, isNaN, isNumber, isPlainObject } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";
import { useInsertPostsMutation, useWpGet } from "@/queries/wp.queries";
import { ShowIf } from "@/components/ShowIf";

export const CreateWpPost = () => {
  // const [types, setTypes] = useState(wp_pages);
  const [postType, setPostType] = useState(wp_page);
  const [posts, setPosts] = useState(wp_pages);
  const [post, setPost] = useState(wp_page);
  const [postName, setPostName] = useState("");
  // const [templates, setTemplates] = useState(wp_pages);
  const [template, setTemplate] = useState(wp_page);
  const [done, setDone] = useState(false);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );

  // Fetch raw data directly via TanStack Query
  const { data: rawTypes, isPending: isTypesLoading } = useWpGet("types");
  const { data: templates, isPending: isTemplatesLoading } =
    useWpGet("inf_template");

  console.log("templates is : ", templates);

  // Filter out disallowed types from the raw API response using useMemo
  const types = useMemo(() => {
    if (!rawTypes || !isPlainObject(rawTypes)) return {};
    const filteredTypes = { ...rawTypes };
    types_not_allowed.forEach((type) => {
      delete filteredTypes[type];
    });
    return filteredTypes;
  }, [rawTypes]);

  const {
    mutateAsync: insertPosts,
    isLoading: isInserting,
    isError: isInsertingError,
  } = useInsertPostsMutation();

  const [animatedRef] = useAutoAnimate();

  const createPage = async () => {
    if (!template.slug) {
      toast.error(<ToastMsgInfo msg={`Template name is required 😒`} />);
      return;
    }

    const tid = toast.loading(
      <ToastMsgInfo msg={`Creating ${postName} post`} />,
    );

    await insertPosts(
      {
        projectId,
        endpoint: postType.rest_base,
        posts: [
          {
            post: {
              post_title: postName,
              post_name: postName,
              post_type: postType.slug,
              post_content: "",
              post_status: "publish",
            },
            meta: {
              inf_template_type: template.slug || "",
              inf_meta: {},
            },
          },
        ],
      },
      {
        onSuccess(res) {
          const {post_name} = res?.results?.[0];
          setPostName(post_name || postName);
          setTemplate({});
          setPostType({});
          toast.done(tid);
          toast.success(
            <ToastMsgInfo msg={`${post_name} created successfully`} />,
          );
          ///save to dexei db next step (ان شاء الله)
        },
        onError() {
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo msg={`Faild to create ${postName} post`} />,
          );
        },
      },
    );
  };

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    // ❌ REMOVED ref from the outermost section
    <section className="w-full h-[100%] flex flex-col justify-center items-center bg-slate-950 p-2 rounded-lg ">
      <section className="w-full inf-blur h-full bg-slate-950 rounded-lg flex flex-col gap-3 justify-center items-center">
        {/* ✅ MOVED ref HERE! This section directly contains the ShowIf components */}
        <section
          ref={animatedRef}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-lg"
        >
          <figure>
            <img src={config.logo} alt="inf-logo" />
          </figure>
          <h1 className="capitalize text-slate-200 text-2xl font-semibold shadow-lg">
            Create New Wordpress Post
          </h1>

          <div className="w-[25%] h-[3px] bg-blue-600 shadow-xl"></div>

          <FitTitle>Select post type</FitTitle>
          <section className="w-[300px]">
            <Select
              useLoader={isTypesLoading}
              inputClassName="text-center bg-slate-900"
              placeholder="Select post type"
              keywords={Object.keys(types)}
              onKeywordsSeted={(ks, setKs) => {
                setKs(Object.keys(types));
              }}
              value={postType?.slug || ""}
              onAll={(value) => {
                setPostType(types[value]);
              }}
            />
          </section>

          <ShowIf
            condition={
              postType?.slug && isArray(templates) && !isTemplatesLoading
            }
          >
            {/* ✅ Wrapped in a div so they animate together as one block */}
            <div className="flex flex-col items-center justify-center gap-3">
              <FitTitle>Select template</FitTitle>
              <section className="w-[300px]">
                <Select
                  useLoader={isTemplatesLoading}
                  inputClassName="text-center bg-slate-900"
                  placeholder="Select template"
                  keywords={templates?.map?.((temp) => temp.slug)}
                  onKeywordsSeted={(ks, setKs) => {
                    setKs(templates.map((temp) => temp.slug));
                  }}
                  value={template?.slug || ""}
                  onAll={(value) => {
                    setTemplate(templates.find((temp) => temp.slug === value));
                  }}
                />
              </section>
            </div>
          </ShowIf>

          <ShowIf condition={template.slug}>
            {/* ✅ Wrapped in a div */}
            <div className="flex flex-col items-center justify-center gap-3">
              <FitTitle>Enter new page name</FitTitle>
              <section className="w-[300px]">
                <Input
                  autoFocus
                  className="text-center bg-slate-900 w-full border-[5px] border-[#1e293b!important]"
                  placeholder="Enter new page name"
                  value={postName}
                  onInput={(ev) => {
                    setPostName(ev.target.value);
                  }}
                />
              </section>
            </div>
          </ShowIf>

          <ShowIf condition={postName}>
            <section>
              <Button
                disabled={done}
                onClick={async () => {
                  await createPage();
                }}
              >
                Create
              </Button>
            </section>
          </ShowIf>
        </section>
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const CreateWpTemplate = () => {
  const [tempVale, setTempVale] = useState("");
  const [postName, setPostName] = useState("");
  const [template, setTemplate] = useState(wp_page);
  const [done, setDone] = useState(false);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );

  // Fetch raw templates directly via TanStack Query
  // const { data: templates, isPending: loading } = useWpGet("inf_template");
   const templates = WP_DEFAULT_TEMPLATES

  // Filter out modified templates and merge with local defaults using useMemo
  // const templates = useMemo(() => {
  //   const fetchedTemplates = isArray(rawTemplates)
  //     ? rawTemplates.filter((temp) => !temp.modified)
  //     : [];
  //   return [...WP_DEFAULT_TEMPLATES, ...fetchedTemplates];
  // }, [rawTemplates]);

  const {
    mutateAsync: createWpTemplate,
    isLoading: isCreatingTemplate,
    isError: isCreatingTemplateError,
    isSuccess: isCreatingTemplateSuccess,
  } = useInsertPostsMutation("inf_template");

  // ✅ Initialize auto-animate
  const [animatedRef] = useAutoAnimate();

  const createTemplate = async () => {
    // Updated check to account for typed values (tempVale)
    if (!template.slug && !tempVale) {
      toast.error(<ToastMsgInfo msg={`Template name is required 😒`} />);
      return;
    }

    const tid = toast.loading(
      <ToastMsgInfo msg={`Creating ${template?.slug || tempVale} template`} />,
    );

    await createWpTemplate(
      {
        projectId,
        posts: [
          {
            post: {
              post_title: template?.slug || tempVale,
              post_name: template?.slug || tempVale,
              post_type: 'inf_template',
              post_content: "",
              post_status: "publish",
            },
            meta: {
              inf_meta: {
                inf_template_type : template?.slug || tempVale
              },
            },
          },
        ],
      },
      {
        onSuccess(res) {
          setDone(true); // Set done to true to trigger the Edit button animation
          setTemplate(res);
          toast.done(tid);
          toast.success(
            <ToastMsgInfo msg={`${res.results[0].slug} template created successfully`} />,
          );
          ///save to dexei db next step (ان شاء الله)
        },
        onError() {
          setDone(true);
          toast.dismiss(tid);
          toast.error(
            <ToastMsgInfo
              msg={`Faild to create ${template?.slug || tempVale} template`}
            />,
          );
        },
      },
    );
  };

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full h-[100%] flex flex-col justify-center items-center bg-slate-950 p-2 rounded-lg">
      <section className="w-full inf-blur h-full bg-slate-950 rounded-lg flex flex-col gap-3 justify-center items-center">
        {/* ✅ Attach ref to the innermost section that directly holds the elements */}
        <section
          ref={animatedRef}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-lg"
        >
          <figure>
            <img src={config.logo} alt="inf-logo" />
          </figure>
          <h1 className="capitalize text-slate-200 text-2xl font-semibold shadow-lg">
            Create New Wordpress Template
          </h1>

          <div className="w-[25%] h-[3px] bg-blue-600 shadow-xl "></div>

          <FitTitle>Select template</FitTitle>
          <section className="w-[300px]">
            <Select
              // useLoader={loading}
              inputClassName="text-center bg-slate-900"
              placeholder="Select or type template name"
              keywords={templates.map((temp) => temp.slug)}
              value={template?.slug || tempVale}
              onKeywordsSeted={(ks, setKs) => {
                setKs(templates.map((temp) => temp.slug));
              }}
              onAll={(value) => {
                setTemplate(templates.find((temp) => temp.slug === value));
                setTempVale(value);
                setPostName(value);
              }}
            />
          </section>

          {/* ✅ Wrap the button in ShowIf so it animates in when a template is selected/typed */}
          <ShowIf condition={Boolean(template?.slug || tempVale)}>
            <section>
              <Button
                onClick={async () => {
                  await createTemplate();
                }}
              >
                Create
              </Button>
            </section>
          </ShowIf>

          {/* ✅ Uncommented and wrapped in ShowIf so it animates smoothly when creation finishes */}
          {/* <ShowIf condition={done}>
            <section>
              <Button
                onClick={async () => {
                  localStorage.setItem(current_page_id, postName);
                  setCurrentWpPageName(postName);
                  navigate("/add-blocks");
                }}
              >
                Edit {template?.slug || tempVale} page
              </Button>
            </section>
          </ShowIf> */}
        </section>
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const WpCreate = () => {
  const cmps = useMemo(() => {
    return {
      template: <CreateWpTemplate />,
      post: <CreateWpPost />,
    };
  }, []);
  const navigate = useNavigate();
  const [key, setKey] = useState("post");
  const [animateRef] = useAutoAnimate();

  return (
    <section className="flex flex-col gap-2 justify-center items-center h-full">
      {/* <ToastContainer
        // toastStyle={{ background: "transparent" }}

        autoClose={3000}
        draggable={true}
        theme="dark"
        limit={10}
        pauseOnHover={true}
        position="top-left"
        toastClassName={`bg-surface-main`}
        className={`z-[1000000]  `}
      // containerId={`main-toast-container`}

      // stacked={true}
      /> */}
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
            navigate("/wordpress/select");
          }}
        >
          Select
          <span className="rotate-[-90deg]">{Icons.arrow("white")}</span>{" "}
        </Button>
      </section>

      <section className="flex justify-center gap-5 p-2 container mx-auto items-center bg-slate-950 rounded-lg">
        {Object.keys(cmps).map((keyCmp, i) => (
          <Button
            key={i}
            className={`${
              key === keyCmp ? "bg-blue-600" : "bg-slate-800"
            } font-semibold capitalize`}
            onClick={() => {
              setKey(keyCmp);
            }}
          >
            Create {keyCmp}
          </Button>
        ))}
      </section>

      <main ref={animateRef} className="min-h-[70%] container mx-auto">
        {Boolean(key) && cmps[key]}
      </main>
    </section>
  );
};
