import blankImg from "@/assets/images/blank.jpg";
import { open_pages_manager_modal } from "@/constants/InfinitelyCommands";
import {
  current_page_helmet,
  current_page_id,
  current_project_id,
  current_wp_page_helmet_id,
} from "@/constants/shared";
import { defineRoot } from "@/helpers/bridge";
import { html, uniqueID } from "@/helpers/cocktail";
import {
  doInNormalAsync,
  doInWordpressAsync,
  getProjectData,
  getProjectId,
  getWpPageConfig,
  isNormal,
  isWordpress,
  store,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { pageHelmetType, refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { Select } from "@/components/Editor/Protos/Select";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { random, uniqueId } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNormal } from "@/hooks/useNormal";
import {
  useGetPostHelemt,
  usePosts,
  useUpdatePostHelemtMutation,
  useWpGet,
} from "@/queries/wp.queries";
import { useWordpress } from "@/hooks/useWordpress";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { Normal } from "@/components/Protos/Normal";
import { ShowIf } from "@/components/ShowIf";

//million-ignore
export const PageHelmetModal = () => {
  const [helmet, setHelmet] = useState({
    logo: null,
    ...pageHelmetType,
  });
  const [siteLogo, setSiteLogo] = useState(null);
  const [siteLogoFile, setSiteLogoFile] = useState();
  const [logoKeyRefresher, setLogoKeyRefresher] = useState("");
  const currentPageHelmetName = sessionStorage.getItem(current_page_helmet);
  const currentPageHelmetId = sessionStorage.getItem(current_wp_page_helmet_id);
  const projectId = +localStorage.getItem(current_project_id);
  const inputFileRef = useRef();
  const editor = useEditorMaybe();
  const inputTimeoutRef = useRef(null);
  const [isHelmetDataChanged, setIsHelmetDataChanged] = useState(false);
  // const original = useRef(URL.createObjectURL);
  const logosURLs = useRef([]);
  const firstLoad = useRef(0);
  const logoRef = useRef(refType);

  const {
    data: postHelmet,
    isLoading: isPostHelmetLoading,
    isRefetching: isPostHelmetRefetching,
    isError: isPostHelmetError,
  } = useGetPostHelemt(currentPageHelmetId);

  const {
    data: templates,
    isPending: loadingTemplates,
    isRefetching: isRefetchingTemplates,
  } = usePosts("inf_template");

  const {
    mutateAsync: updatePostHelemt,
    isPending: isUpdatePostHelemtPending,
  } = useUpdatePostHelemtMutation();

  useLiveQuery(async () => {
    await doInNormalAsync(async () => {
      const projectData = await getProjectData();
      const projectId = projectData.id;
      const currentPageName = localStorage.getItem(current_page_id);
      const helmetFromDB = projectData.pages[`${currentPageHelmetName}`].helmet;

      if (!siteLogo) {
        const projectLogo = await opfs.getFile(defineRoot(projectData.logo));
        const isReal =
          projectLogo &&
          projectLogo.exists() &&
          Boolean(await projectLogo.getSize());
        const iconUrl =
          helmetFromDB.icon && helmetFromDB.icon instanceof Blob
            ? URL.createObjectURL(helmetFromDB.icon)
            : projectData.logo
              ? projectData.logo
              : "";
        logosURLs.current.push(iconUrl);
        setSiteLogo(isReal ? iconUrl : "");
      }

      setHelmet({
        ...helmet,
        ...helmetFromDB,
        icon:
          helmetFromDB.icon && helmetFromDB.icon instanceof Blob
            ? helmetFromDB
            : undefined,
        customMetaTags:
          helmetFromDB.customMetaTags instanceof Blob
            ? await helmetFromDB.customMetaTags.text()
            : helmetFromDB.customMetaTags
              ? helmetFromDB.customMetaTags
              : "",
      });
      console.log("custom meta tags : ", helmetFromDB.customMetaTags);
    });
  }, []);

  useNormal(() => {
    // getAndSetHelmetData();
    return () => {
      // Clean up URLs created by createObjectURL
      logosURLs.current.forEach((url) => URL.revokeObjectURL(url));
      logosURLs.current = [];
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      // URL.createObjectURL = original.current;
    };
  }, []);

  useNormal(() => {
    return () => {
      URL.revokeObjectURL(siteLogo);
    };
  }, [siteLogo]);

  useWordpress(() => {
    if (postHelmet?.helmet) {
      setHelmet({
        ...helmet,
        ...postHelmet?.helmet,
      });

      setSiteLogo(postHelmet?.helmet.logo);
    }
  }, [postHelmet]);

  const setHelmetToDB = useCallback(async () => {
    console.log("setting helmet", helmet);
    await doInNormalAsync(async () => {
      const tId = toast.loading(<ToastMsgInfo msg={`Saving helmet...`} />);
      try {
        const projectData = await getProjectData();
        siteLogoFile &&
          (await opfs.writeFiles([
            {
              path: defineRoot(`logo.png`),
              content: siteLogoFile,
            },
          ]));

        helmet.logo && (projectData.logo = helmet.logo);
        const currentPageId = localStorage.getItem(current_page_id);
        projectData.pages[`${currentPageHelmetName}`].helmet = {
          ...projectData.pages[`${currentPageHelmetName}`].helmet,
          ...helmet,
          ...(helmet.customMetaTags && typeof helmet.customMetaTags == "string"
            ? {
                customMetaTags: new Blob([helmet.customMetaTags], {
                  type: "text/html",
                }),
              }
            : {
                customMetaTags: helmet.customMetaTags
                  ? helmet.customMetaTags
                  : "",
              }),
        };

        const props = {
          data: {
            ...((helmet.logo && { logo: helmet.logo }) || {}),
            pages: projectData.pages,
          },
          projectId: +localStorage.getItem(current_project_id),
          updatePreviewPages: true,
          pageName: currentPageId,
          pageUrl: `pages/${currentPageId}.html`,
          editorData: {
            canvasCss: editor.config.canvasCss,
          },
          afterSave() {
            setIsHelmetDataChanged(false);
            toast.done(tId);
            toast.success(<ToastMsgInfo msg={`Helmet saved successfully💙`} />);
          },
        };

        console.log("First load  : ", firstLoad.current);

        await store(props, editor);
      } catch (error) {
        setIsHelmetDataChanged(false);
        toast.dismiss(tId);
        toast.error(<ToastMsgInfo msg={`Faild to save helmet😩`} />);
      }
    });

    await doInWordpressAsync(async () => {
      const tid = toast.loading(<ToastMsgInfo msg={`Saving helmet...`} />);

      console.log("helmet before save", helmet);

      await updatePostHelemt(
        {
          projectId: getProjectId(),
          post_id: getWpPageConfig().id,
          helmet: helmet,
          fileBlob: helmet.logo,
        },
        {
          onSuccess: () => {
            setIsHelmetDataChanged(false);
            toast.done(tid);
            toast.success(
              <ToastMsgInfo msg={`Helmet saved successfully 💙`} />,
            );
          },
          onError: (err) => {
            toast.dismiss(tid);
            toast.error(<ToastMsgInfo msg={`Faild to save helmet 😩`} />);
            console.error(err.message);
            throw err;
          },
        },
      );
    });
  }, [helmet]);

  /**
   *
   * @param {{key:keyof import('@/helpers/types').PageHelmet , value:string , isBlob:boolean , mimeType:string , isLogo:boolean}} param0
   */
  const updatePageHelmet = useCallback(
    async ({ key, value, isBlob = false, mimeType, isLogo = false }) => {
      firstLoad.current++;
      if (isLogo) {
        setSiteLogoFile(new File([value], "logo.png", { type: "image/png" }));
        URL.revokeObjectURL(siteLogo);
        const url = URL.createObjectURL(value);

        setSiteLogo(url);
        setLogoKeyRefresher(
          `${uniqueId(`-${uniqueID()}`)}-${random(10, 99999999)}`,
        );
      }

      setHelmet({
        ...helmet,
        ...(isNormal() && { logo: `logo.png` }),
        [key]: isBlob ? new Blob([value], { type: mimeType }) : value,
        // ...projectData.pages[currentPageHelmetName].helmet,
      });

      setIsHelmetDataChanged(true);
    },
    [projectId, currentPageHelmetName, helmet],
  );

  return (
    <section className="flex flex-col gap-3 h-full max-h-full overflow-y-auto animate-go-to hideScrollBar">
      <header className="flex h-[45px] gap-3 justify-between p-1 rounded-lg bg-surface-tertiary sticky left-0 top-0">
        <section className="group p-1 bg-surface-secondary text-[14px] font-semibold rounded-lg flex items-center gap-2 text-text-primary">
          <button
            className="flex items-center gap-2 p-1"
            onClick={(ev) => {
              editor.runCommand(open_pages_manager_modal);
            }}
          >
            <i className="rotate-[90deg] block">{Icons.arrow()}</i>
            <Normal>Pages</Normal>
            <Wordpress>Posts</Wordpress>
          </button>
        </section>

        <section className="flex items-center gap-2">
          <ShowIf
            condition={
              isPostHelmetLoading ||
              isPostHelmetRefetching ||
              isUpdatePostHelemtPending
            }
          >
            <Wordpress>
              <i className="block animate-spin">
                <Icons.refresh width={20} height={20} />
              </i>
            </Wordpress>
          </ShowIf>

          <FitTitle className="flex items-center gap-2 text-lg font-semibold h-full shrink-0 capitalize">
            <Icons.helmet fill="white" />
            {currentPageHelmetName}
          </FitTitle>
        </section>
      </header>

      <section className="flex gap-2 ">
        <section className="w-full flex flex-col gap-2 bg-surface-tertiary p-2  rounded-lg">
          <FitTitle className="flex items-center justify-center shrink-0 ">
            <Normal>Page</Normal> <Wordpress>Post</Wordpress> Title{" "}
          </FitTitle>
          <Input
            placeholder="Page Title"
            className="bg-surface-secondary py-2 w-full"
            value={helmet.title || ""}
            onInput={(ev) => {
              updatePageHelmet({
                key: "title",
                value: ev.target.value,
              });
            }}
          />
        </section>
        <section className="w-full flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg">
          <FitTitle className="capitalize  flex justify-center items-center shrink-0">
            author
          </FitTitle>
          <Input
            placeholder="Author"
            className="bg-surface-secondary py-2 w-full rounded-lg"
            value={helmet.author || ""}
            onInput={(ev) => {
              updatePageHelmet({
                key: "author",
                value: ev.target.value,
              });
            }}
          />
        </section>
      </section>

      <section className="flex w-full justify-between  gap-2 ">
        <section className="h-full flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg">
          <FitTitle className="flex   items-center justify-center shrink-0 ">
            <Normal>Site Icon</Normal>

            <Wordpress>Featured Image</Wordpress>
          </FitTitle>
          <figure
            className="rounded-lg overflow-hidden w-[130px] h-[130px] cursor-pointer"
            onClick={(ev) => {
              inputFileRef.current.click();
            }}
          >
            <img
              // ref={logoRef}
              onClick={() => {
                inputFileRef.current.click();
              }}
              // key={logoKeyRefresher}
              src={siteLogo ? siteLogo : blankImg}
              // src={blankImg}
              className=" object-cover w-full h-full max-h-full"
            />
          </figure>
          <input
            type="file"
            className="hidden bg-surface-secondary"
            accept="image/*"
            ref={inputFileRef}
            onChange={(ev) => {
              const file = ev.target.files[0];
              updatePageHelmet({
                key: isNormal() ? "icon" : "logo",
                value: file,
                isLogo: true,
              });
              ev.target.value = "";
            }}
          />
        </section>

        <section className="w-full h-full flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg">
          <FitTitle className="capitalize">description</FitTitle>
          <textarea
            placeholder="Description"
            className="bg-surface-secondary min-h-[130px]  px-2 py-3 rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
            value={helmet.description || ""}
            onInput={(ev) => {
              console.log(ev.target.value);
              updatePageHelmet({
                key: "description",
                value: ev.target.value,
              });
            }}
          />
        </section>
      </section>

      <section className="flex gap-2">
        <section className="flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg w-full">
          <FitTitle className="capitalize">keywords</FitTitle>
          <textarea
            placeholder="keywords Ex : keywords , keyword1 , keyword2"
            className="bg-surface-secondary p-2 min-h-[50px] rounded-lg text-white font-semibold outline-none border-2 border-transparent focus:border-blue-600"
            value={helmet.keywords || ""}
            onInput={(ev) => {
              updatePageHelmet({
                key: "keywords",
                value: ev.target.value,
              });
            }}
          />
        </section>
        <Wordpress>
          <section className="flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg w-full">
            <FitTitle className="capitalize">Template</FitTitle>
            <Select
              useLoader={
                isPostHelmetLoading ||
                isPostHelmetRefetching ||
                loadingTemplates ||
                isRefetchingTemplates
              }
              placeholder="Template"
              value={helmet.template}
              keywords={templates?.data.map((template) => template.slug)}
              onAll={(value) => {
                console.log("template value", value);

                updatePageHelmet({
                  key: "template",
                  value: value,
                });
              }}
            />
          </section>
        </Wordpress>
      </section>
      <section className=" flex flex-col gap-2 bg-surface-tertiary p-2 rounded-lg">
        <FitTitle>Custom Meta Tags</FitTitle>
        <Select
          isCode
          placeholder="Custom meta tags"
          value={helmet.customMetaTags}
          zIndex={1000000}
          codeProps={{
            // value: helmet.customMetaTags,
            // height:`100%`,
            language: "html",
            onMount(mEditor) {
              mEditor.setValue(helmet.customMetaTags || "");
            },
            onChange: (value) => {
              updatePageHelmet({
                key: "customMetaTags",
                value: value,
                // isBlob: true,
                // mimeType: "text/html",
              });
            },
          }}
        />
        {/* <CodeEditor
          props={{
            value: helmet.customMetaTags,
            height:`100%`,
            language:'html',
            onChange: (value) => {
              updatePageHelmet({
                key: "customMetaTags",
                value: value,
                isBlob: true,
                mimeType: "text/html",
              });
            },
          }}
        /> */}
        {/* <Editor
          theme="vs-dark"
          width={"100%"}
          height={"400px"}
          language="html"
          options={{
            fontSize: 20,
            minimap: {
              autohide: true,
              enabled: false,
            },
          }}
          value={helmet.customMetaTags}
          onChange={(value) => {
            updatePageHelmet({
              key: "customMetaTags",
              value: value,
              isBlob: true,
              mimeType: "text/html",
            });
          }}
        /> */}
      </section>
      <section className="w-full sticky bottom-0">
        <Button
          className="w-full font-bold flex justify-center items-center"
          disabled={
            !isHelmetDataChanged ||
            isPostHelmetLoading ||
            isUpdatePostHelemtPending ||
            isPostHelmetRefetching
          }
          onClick={async () => {
            await setHelmetToDB();
          }}
        >
          Save Helmet
        </Button>
      </section>
    </section>
  );
};
