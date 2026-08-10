import {
  wp_create_single,
  wp_get,
  wp_insert_post,
  wp_update_meta,
  wp_update_single,
} from "@/apps/wordpress/functions";
import { wp_toast_handler } from "@/apps/wordpress/functions_ui";
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

export const CreateWpPost = () => {
  const [types, setTypes] = useState(wp_pages);
  const [postType, setPostType] = useState(wp_page);
  const [posts, setPosts] = useState(wp_pages);
  const [post, setPost] = useState(wp_page);
  const [postName, setPostName] = useState("");
  const [templates, setTemplates] = useState(wp_pages);
  const [template, setTemplate] = useState(wp_page);
  const [done, setDone] = useState(false);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );
  const [loaders, setLoaders] = useState({
    post_types: true,
    templates: true,
  })

  const handler = () => {

    setLoaders({
      post_types: true,
      templates: true,
    })

    wpWorkerCallbackMaker(
      fetcherWorker,
      "wp_get",
      {
        projectId,
        endpoint: "types",
      },
      (props) => {
        console.log("props from worker : ", props);
        if (props.done && isPlainObject(props.res)) {
          types_not_allowed.forEach((type) => {
            delete props.res[type];
          });
          setTypes(props.res);
          setLoaders((old) => ({ ...old, post_types: false }))
        }
      },
    );

    wpWorkerCallbackMaker(
      infinitelyWorker,
      "wp_get",
      {
        projectId,
        endpoint: "inf_template",
      },
      (props) => {
        console.log("props from worker : ", props);
        if (props.done && isArray(props.res)) {
          setTemplates(props.res);
          setLoaders((old) => ({ ...old, templates: false }))
        }
      },
    );
  }

  useOnline({
    online: handler,
    defaultCallback: handler
  },[])
  // useEffect(()=>{handler()}, []);

  // return <h1>Hello</h1>;
  // const getTypes = async () => {
  //   const types = await wp_get({
  //     endpoint: "types",
  //     projectId,
  //   });
  // types_not_allowed.forEach((type) => {
  //   delete types[type];
  // });
  // setTypes(types);
  // };

  const createPage = async () => {
    if (!template.slug) {
      toast.error(<ToastMsgInfo msg={`Template name is required 😒`} />)
      return;
    }
    console.log({
      projectId,
      endpoint: postType.rest_base,
      body: {
        title: postName,
        slug: postName,
        type: postType.slug,
        template: template.slug || "",
        content: "",
        status: "publish",
        meta: {
          inf_meta: {},
        },
      },
    });

    wp_toast_handler({
      returnCallback: async () =>
        await wp_insert_post({
          projectId,
          endpoint: postType.rest_base,
          post_data: {
            post_title: postName,
            post_name: postName,
            post_type: postType.slug,
            post_content: "",
            post_status: "publish",
          },
          meta_data: {
            inf_template_type: template.slug || "",
            inf_meta: {},
          },
        }),
      // body: {
      //   title: postName,
      //   slug: postName,
      //   type: postType.slug,
      //   template: template.slug || "",
      //   content: "",
      //   status: "publish",
      //   meta: {
      //     inf_meta: {},
      //   },
      // },

      toast_loading_msg: `Creating ${postName} post`,
      toast_error_msg: `Faild to create ${postName} post`,
      toast_success_msg: (res) => `${res.post.post_name} created successfully`,
      onSuccess(res) {
        setDone(true);
        setPostName(res.post.post_name || postName);
        setTemplate({});
        setPostType({});
        ///save to dexei db next step (ان شاء الله)
      },
    });
  };
  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full h-[100%] flex flex-col justify-center items-center bg-slate-950 p-2 rounded-lg ">
      <section className="w-full inf-blur h-full  bg-slate-950 rounded-lg flex flex-col gap-3 justify-center items-center">
        {
          <section className="w-full flex flex-col items-center justify-center gap-3   rounded-lg">
            <figure>
              <img src={config.logo} alt="inf-logo" />
            </figure>
            <h1 className="capitalize text-slate-200 text-2xl font-semibold shadow-lg">
              Create New Wordpress Post
            </h1>

            <div className="w-[25%] h-[3px] bg-blue-600 shadow-xl"></div>

            {/* <h1 className="">Select post type</h1> */}
            <FitTitle>Select post type</FitTitle>
            <section className="w-[300px]">
              <Select
                useLoader={loaders.post_types}
                inputClassName="text-center bg-slate-900"
                placeholder="Select post type"
                keywords={Object.keys(types)}
                onKeywordsSeted={(ks, setKs) => {
                  setKs(Object.keys(types))
                }}
                value={postType?.slug || ""}
                onAll={(value) => {
                  setPostType(types[value]);
                }}
              />
            </section>

            <FitTitle>Select template</FitTitle>
            <section className="w-[300px]">
              <Select
                useLoader={loaders.templates}
                inputClassName="text-center bg-slate-900"
                placeholder="Select template"
                keywords={templates.map((temp) => temp.slug)}
                onKeywordsSeted={(ks, setKs) => {
                  setKs(templates.map((temp) => temp.slug))
                }}
                value={template?.slug || ""}
                onAll={(value) => {
                  setTemplate(templates.find((temp) => temp.slug === value));
                }}
              />
            </section>

            <FitTitle>Enter new page name</FitTitle>
            <section className="w-[300px]">
              <Input
                autoFocus
                className="text-center  bg-slate-900 w-full border-[5px] border-[#1e293b!important]"
                placeholder="Enter new page name"
                value={postName}
                onInput={(ev) => {
                  setPostName(ev.target.value);
                }}
              />
            </section>

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
          </section>
        }

        {/* {done && (
          <section>
            <Button
              onClick={async () => {
                localStorage.setItem(current_page_id, postName);
                setCurrentWpPageName(postName);
                navigate("/add-blocks");
              }}
            >
              Edite {postName} page
            </Button>
          </section>
        )} */}
      </section>
    </section>
  ) : (
    <Navigate to={"/workspace"} />
  );
};

export const CreateWpTemplate = () => {
  const [tempVale, setTempVale] = useState("");
  const [postName, setPostName] = useState("");
  const [templates, setTemplates] = useState(WP_DEFAULT_TEMPLATES);
  const [template, setTemplate] = useState(wp_page);
  const [done, setDone] = useState(false);
  const projectIdFromStorage = localStorage.getItem(current_project_id);
  const projectId = +localStorage.getItem(current_project_id);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentWpPageName, setCurrentWpPageName] = useRecoilState(
    currentWpPageNameState,
  );

  useEffect(() => {


    setLoading(true);
    wpWorkerCallbackMaker(
      fetcherWorker,
      "wp_get",
      {
        projectId,
        endpoint: "inf_template",
      },
      (props) => {
        if (props.done) {
          const template_should_be = props.res.filter((temp) => !temp.modified);
          setTemplates((old) => [...old, ...(template_should_be || [])]);
        }
        setLoading(false);
        console.log("props from worker : ", props);
      },
    );
  }, []);


  const createTemplate = async () => {
    setDone(false);

    wp_toast_handler({
      returnCallback: async () =>
        await wp_create_single({
          projectId,
          endpoint: "inf_template",
          body: {
            title: template?.slug || tempVale,
            slug: template?.slug || tempVale,
            type: template?.slug || tempVale,
            content: "",
            status: "publish",
            meta: {
              inf_meta: {},
            },
          },
        }),

      toast_loading_msg: `Creating ${template?.slug || tempVale} template`,
      toast_error_msg: `Faild to create ${template?.slug || tempVale} template`,
      toast_success_msg: (res) => `${res.slug} template created successfully`,
      onSuccess(res) {
        setDone(true);
        setTemplate(res);
        ///save to dexei db next step (ان شاء الله)
      },
      onError() {
        setDone(true);
      },
    });
  };

  return isNumber(parseFloat(projectIdFromStorage)) &&
    !isNaN(projectIdFromStorage) ? (
    <section className="w-full h-[100%] flex flex-col justify-center items-center bg-slate-950 p-2 rounded-lg">
      <section className="w-full inf-blur h-full  bg-slate-950 rounded-lg flex flex-col gap-3 justify-center items-center">
        {
          <section className="w-full flex flex-col items-center justify-center gap-3   rounded-lg">
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
                useLoader={loading}
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
                }}
              />
            </section>

            <section>
              <Button
                onClick={async () => {
                  if (!(template?.slug || tempVale)) {
                    toast.error(
                      <ToastMsgInfo msg={`Please select or type template`} />,
                    );
                    return;
                  }
                  await createTemplate();
                }}
              >
                Create
              </Button>
            </section>
          </section>
        }

        {/* {done && (
          <section>
            <Button
              onClick={async () => {
                localStorage.setItem(current_page_id, postName);
                setCurrentWpPageName(postName);
                navigate("/add-blocks");
              }}
            >
              Edite {postName} page
            </Button>
          </section>
        )} */}
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
        className={`z-[1000000]  `}
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
            className={`${key === keyCmp ? "bg-blue-600" : "bg-slate-800"
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
