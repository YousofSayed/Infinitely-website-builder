import { wp_toast_handler } from "@/Apps/wordpress/functions_ui";
import { apps } from "@/constants/shared";
import { isProjectInitedState, showCrtModalState } from "@/helpers/atoms";
import { db } from "@/helpers/db";
import {
  getProjectId,
  getProjectSettings,
  workerCallbackMakerWithProps,
  wpWorkerCallbackMaker,
} from "@/helpers/functions";
import { infinitelyWorker } from "@/helpers/infinitelyWorker";
import { opfs } from "@/helpers/initOpfs";
import { Select } from "@/components/Editor/Protos/Select";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import {
  useConnectWpMutation,
  useGetWpOptionQueryMutation,
} from "@/queries/wp.queries";
import { urlRgx } from "@/constants/rgxs";

export const CreateProjectModal = ({
  onCloseClick = (ev) => {},
  onButtonClick = (ev) => {},
  onInput = (value = "") => {},
  onInputTextarea = (value = "") => {},
  onSelecttingApp = (value = "") => {},
  onWebsiteURLEnter = (value = "") => {},
  onUserNameEnter = (value = "") => {},
  onPasswordEnter = (value = "") => {},
  showState = false,
}) => {
  const showCrtModal = useRecoilValue(showCrtModalState);
  const setShowCrtModal = useSetRecoilState(showCrtModalState);
  const [animatedRed] = useAutoAnimate();
  const [isProjectInited, setIsProjectInited] =
    useRecoilState(isProjectInitedState);

  const [loading, setLoading] = useState(false);

  const { mutateAsync: wp_connect, isPending: isWpConnectPending } =
    useConnectWpMutation();

  const { mutateAsync: wp_get_option, isPending: isWpGetOptionPending } =
    useGetWpOptionQueryMutation();

  const [data, setData] = useState({
    name: "",
    description: "",
    app_type: "",
    wp_meta: {
      website_url: "",
      username: "",
      password: "",
    },
  });

  const addProject = async () => {
    if (data.app_type == "wordpress") {
      if (
        !(
          data.wp_meta.username &&
          data.wp_meta.password &&
          data.wp_meta.website_url
        )
      ) {
        toast.error(<ToastMsgInfo msg={`Wordpress meta data is missed 😩`} />);
        throw new Error(`Wordpress meta data is missed`);
      }

      if (!data.wp_meta.website_url.match(urlRgx)) {
        toast.error(
          <ToastMsgInfo msg={`Wordpress website url is invalid 😩`} />,
        );
        throw new Error(`Wordpress website url is invalid`);
      }
      data.wp_meta.website_url = new URL(data.wp_meta.website_url).origin;

      console.log("origin : ", data.wp_meta.website_url);

      const tId = toast.loading(
        <ToastMsgInfo msg={`Connecting to your wordpress website...`} />,
      );

      await wp_connect(
        {
          username: data.wp_meta.username,
          password: data.wp_meta.password,
          website_url: data.wp_meta.website_url,
        },
        {
          onSuccess: async (jsonRes) => {
            console.log("Connected to WordPress successfully 💙", jsonRes);
            toast.done(tId);
            toast.success(
              <ToastMsgInfo msg={`Connected to wordpress successfully 💙`} />,
            );

            const tIdConfig = toast.loading(
              <ToastMsgInfo msg={`Checking config...`} />,
            );
            await wp_get_option(
              {
                optionName: "inf_config",
                // projectId :
                wp_meta_data: {
                  ...data.wp_meta,
                  app_password: jsonRes.app_password,
                },
              },
              {
                onSuccess: (res) => {
                  console.log("exsitedConfig", res);
                  toast.done(tIdConfig);
                  wpWorkerCallbackMaker(
                    infinitelyWorker,
                    "createWpProject",
                    {
                      data: {
                        ...data,
                        exsitedConfig: res?.value || {},
                        projectSetting: getProjectSettings().projectSettings,
                        wp_meta: {
                          ...data.wp_meta,
                          app_password: jsonRes.app_password,
                        },
                      },
                    },
                    (props) => {
                      if (props?.done) {
                        setShowCrtModal(false);
                        setData({ name: "", description: "" });
                      }
                    },
                  );
                },
                onError: (error) => {
                  console.error("Error getting inf_config:", error);
                  toast.done(tIdConfig);
                  toast.error(
                    <ToastMsgInfo msg={`Failed to get inf_config 😩`} />,
                  );
                  error.message &&
                    toast.error(<ToastMsgInfo msg={error.message} />);
                },
              },
            );
          },
          onError: (error) => {
            console.error("Error connecting to WordPress:", error);
            toast.done(tId);
            toast.error(
              <ToastMsgInfo msg={`Failed to connect to WordPress 😩`} />,
            );
            error.message && toast.error(<ToastMsgInfo msg={error.message} />);
          },
        },
      );

      // wp_toast_handler({
      //   returnCallback: async () =>
      //     await wp_connect({
      //       username: data.wp_meta.username,
      //       password: data.wp_meta.password,
      //       website_url: data.wp_meta.website_url,
      //     }),

      //   toast_loading_msg: `Connecting to your wordpres website`,
      //   toast_success_msg: `Connected to wordpress successfully 💙`,
      //   toast_error_msg: `Faild to connect to wordpress 😩`,
      //   async onSuccess(jsonRes) {
      //     const tId = toast.loading(
      //       <ToastMsgInfo msg={`Checking config...`} />,
      //     );
      //     const exsitedConfig = await (async () => {
      //       try {
      //         const res = await wp_get_option({
      // optionName: "inf_config",
      // wp_meta_data: {
      //   ...data.wp_meta,
      //   app_password: jsonRes.app_password,
      // },
      //         });

      //         if (!res?.success) {
      //           return {};
      //         } else {
      //           return res.value;
      //         }
      //       } catch (error) {
      //         throw new Error(error);
      //       } finally {
      //         toast.done(tId);
      //       }
      //     })();

      //     console.log("exsitedConfig", exsitedConfig);

      //     infinitelyWorker.postMessage({
      //       command: "createWpProject",
      //       props: {
      //         data: {
      //           ...data,
      //           exsitedConfig: exsitedConfig,
      //           projectSetting: getProjectSettings().projectSettings,
      //           wp_meta: {
      //             ...data.wp_meta,
      //             app_password: jsonRes.app_password,
      //           },
      //         },
      //       },
      //     });
      //   },
      // });
    } else {
      setLoading(true);
      workerCallbackMakerWithProps(
        infinitelyWorker,
        "createProject",
        {data},
        (props) => {
          if (props?.done) {
            setShowCrtModal(false);
            setData({ name: "", description: "" });
            setLoading(false);
          }
        },
      );
      // infinitelyWorker.postMessage({
      //   command: "createProject",
      //   props: {
      //     data,
      //   },
      // });
    }
    // setIsProjectInited(true);
  };

  return (
    <>
      {showCrtModal && (
        <section
          onClick={(ev) => {
            setShowCrtModal(false);
          }}
          className={
            `
            fixed ${window?.electron?.isDesktop ? "top-[40px]" : "top-0"} left-0 w-full h-full bg-blue-950/40 backdrop-blur-sm flex items-center justify-center z-50
            `
          }
          id="createProjectModal"
        >
          <section
            onClick={(ev) => {
              console.log(ev.currentTarget, ev.target);

              ev.stopPropagation();

              ev.preventDefault();
            }}
            className="bg-surface-main text-text-primary rounded-lg shadow-lg shadow-slate-950 max-w-lg w-full p-6"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  onCloseClick();
                  setShowCrtModal(false);
                }}
                className="text-text-primary hover:text-blue-500 transition duration-150"
                id="closeModalButton"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <form id="createProjectForm" ref={animatedRed}>
                <div className="mb-4">
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium mb-1"
                  >
                    Project Name
                  </label>
                  <input
                    onInput={(ev) => {
                      onInput(ev.target.value);
                      setData({ ...data, name: ev.target.value });
                    }}
                    autoFocus
                    type="text"
                    id="projectName"
                    name="projectName"
                    placeholder="Enter project name"
                    className="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="projectDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    onInput={(ev) => {
                      onInputTextarea(ev.target.value);
                      setData({ ...data, description: ev.target.value });
                    }}
                    id="projectDescription"
                    name="projectDescription"
                    placeholder="Enter project description"
                    rows="3"
                    className="w-full resize-none bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 min-h-[65px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="projectDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    App type
                  </label>
                  <Select
                    id="projectDescription"
                    name="projectDescription"
                    placeholder="Enter app type"
                    keywords={apps}
                    value={data.app_type}
                    onAll={(value) => {
                      onSelecttingApp(value);
                      setData({ ...data, app_type: value });
                    }}
                    inputClassName="w-full bg-surface-tertiary text-text-primary   focus:outline-none focus:ring-2 focus:ring-blue-600"
                    containerClassName="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded  focus:outline-none focus:ring-2 focus:ring-blue-600"
                    // className="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></Select>
                </div>

                {data.app_type == "wordpress" && (
                  <section className="flex gap-2 flex-wrap">
                    <div className="mb-4 flex-grow">
                      <label
                        htmlFor="websiteUrl"
                        className="block text-sm font-medium mb-1"
                      >
                        Website url
                      </label>
                      <input
                        onInput={(ev) => {
                          onWebsiteURLEnter(ev.target.value);
                          setData({
                            ...data,
                            wp_meta: {
                              ...data.wp_meta,
                              website_url: ev.target.value,
                            },
                          });
                        }}
                        autoFocus
                        type="text"
                        id="websiteUrl"
                        name="websiteUrl"
                        placeholder="your-site.com"
                        className="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="mb-4 flex-grow">
                      <label
                        htmlFor="userName"
                        className="block text-sm font-medium mb-1"
                      >
                        User name
                      </label>
                      <input
                        onInput={(ev) => {
                          onUserNameEnter(ev.target.value);
                          setData({
                            ...data,
                            wp_meta: {
                              ...data.wp_meta,
                              username: ev.target.value,
                            },
                          });
                        }}
                        autoFocus
                        type="text"
                        id="userName"
                        name="userName"
                        placeholder="Enter your user name"
                        className="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="mb-4 flex-grow">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium mb-1"
                      >
                        Password
                      </label>
                      <input
                        onInput={(ev) => {
                          onPasswordEnter(ev.target.value);
                          setData({
                            ...data,
                            wp_meta: {
                              ...data.wp_meta,
                              password: ev.target.value,
                            },
                          });
                        }}
                        autoFocus
                        type="text"
                        id="password"
                        name="password"
                        placeholder="Enter your wordpress password"
                        className="w-full bg-surface-tertiary text-text-primary border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </section>
                )}

                <div className="mt-6">
                  <button
                    disabled={
                      loading || isWpConnectPending || isWpGetOptionPending
                    }
                    onClick={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onButtonClick(ev);
                      addProject();
                    }}
                    type="submit"
                    className="w-full bg-brand-primary text-text-primary hover:bg-blue-500 font-semibold py-2 rounded-md transition duration-150"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </section>
        </section>
      )}
    </>
  );
};
