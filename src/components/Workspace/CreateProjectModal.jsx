import { wp_connect, wp_get_option } from "@/apps/wordpress/functions";
import { wp_toast_handler } from "@/apps/wordpress/functions_ui";
import { apps } from "@/constants/shared";
import { isProjectInitedState, showCrtModalState } from "@/helpers/atoms";
import { db } from "@/helpers/db";
import { getProjectSettings } from "@/helpers/functions";
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

      data.wp_meta.website_url = (new URL(data.wp_meta.website_url)).origin.replace(/http(\s)?\:\/\//ig , '') ;

      console.log('origin : ' ,  data.wp_meta.website_url);
      
      wp_toast_handler({
        returnCallback: async () =>
          await wp_connect({
            username: data.wp_meta.username,
            password: data.wp_meta.password,
            website_url: data.wp_meta.website_url,
          }),

        toast_loading_msg: `Connecting to your wordpres website`,
        toast_success_msg: `Connected to wordpress successfully 💙`,
        toast_error_msg: `Faild to connect to wordpress 😩`,
        async onSuccess(jsonRes) {
          const tId = toast.loading(
            <ToastMsgInfo msg={`Checking config...`} />
          );
          const exsitedConfig = await (async () => {
            try {
              const res = await wp_get_option({
                optionName: "inf_config",
                wp_meta_data: {
                  ...data.wp_meta,
                  app_password: jsonRes.app_password,
                },
              });

              if (!res?.success) {
                return {};
              } else {
                return res.value;
              }
            } catch (error) {
              throw new Error(error);
            } finally {
              toast.done(tId);
            }
          })();

          console.log("exsitedConfig", exsitedConfig);

          infinitelyWorker.postMessage({
            command: "createWpProject",
            props: {
              data: {
                ...data,
                exsitedConfig: exsitedConfig,
                projectSetting: getProjectSettings().projectSettings,
                wp_meta: {
                  ...data.wp_meta,
                  app_password: jsonRes.app_password,
                },
              },
            },
          });
        },
      });
      // const tid = toast.loading(
      //   <ToastMsgInfo msg={`Connecting to your wordpres website`} />
      // );
      // try {
      //   // const appPasswordRes = await fetch(
      //   //   `https://${data.wp_meta.website_url}/wp-json/infinitley-api/v1/connect`,
      //   //   {
      //   //     method: "POST",
      //   //     headers: {
      //   //       "Content-Type": "application/json",
      //   //     },
      //   //     body: JSON.stringify({
      //   //       username: data.wp_meta.username,
      //   //       password: data.wp_meta.password,
      //   //     }),
      //   //   }
      //   // );
      //   const jsonRes = await wp_connect({
      //     username: data.wp_meta.username,
      //     password: data.wp_meta.password,
      //     website_url: data.wp_meta.website_url,
      //   });
      //   if (jsonRes.success) {
      //     toast.done(tid);
      //     console.log("app psw : ", jsonRes);
      //     toast.success(
      //       <ToastMsgInfo msg={`Connected to wordpress successfully`} />
      //     );
      //     infinitelyWorker.postMessage({
      //       command: "createProject",
      //       props: {
      //         data: {
      //           ...data,
      //           wp_meta: {
      //             ...data.wp_meta,
      //             app_password: jsonRes.app_password,
      //           },
      //         },
      //       },
      //     });
      //   } else {
      //     toast.dismiss(tid);
      //     toast.error(<ToastMsgInfo msg={jsonRes.message} />);
      //   }
      // } catch (error) {
      //   toast.dismiss(tid);
      //   toast.error(<ToastMsgInfo msg={`Faild to connect to wordpress 😩`} />);
      //   throw new Error(error);
      // }
    } else {
      infinitelyWorker.postMessage({
        command: "createProject",
        props: {
          data,
        },
      });
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
          className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm flex items-center justify-center z-50"
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
                    onClick={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onButtonClick(ev);
                      addProject();
                      setShowCrtModal(false);
                      setData({ name: "", description: "" });
                    }}
                    type="submit"
                    className="w-full bg-brand-primary text-text-primary hover:bg-slate-600 py-2 rounded-md transition duration-150"
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
