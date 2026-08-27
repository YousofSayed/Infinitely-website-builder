import { open_page_helmet_modal } from "@/constants/InfinitelyCommands";
import {
  current_page_helmet,
  current_project_id,
  current_wp_page_helmet_id,
} from "@/constants/shared";
import { buildPage, defineRoot } from "@/helpers/bridge";
import { uniqueID } from "@/helpers/cocktail";
import { db } from "@/helpers/db";
import { assetsWorker } from "@/helpers/defineWorkers";
import {
  advancedSearchSuggestions,
  doInNormal,
  doInNormalAsync,
  doInWordpress,
  doInWordpressAsync,
  downloadFile,
  getProjectData,
  getProjectId,
  getWpPageConfig,
  isNormal,
  isWordpress,
} from "@/helpers/functions";
import { opfs } from "@/helpers/initOpfs";
import { dbPagesType, pagesType, refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { Button } from "@/components/Protos/Button";
import { Hr } from "@/components/Protos/Hr";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Input } from "@/components/Editor/Protos/Input";
import { SmallButton } from "@/components/Editor/Protos/SmallButton";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import { cloneDeep } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ShowIf } from "@/components/ShowIf";
import { useNormal } from "@/hooks/useNormal";
import { SearchHeader } from "@/components/Protos/SearchHeader";
import {
  useDeletePostsMutation,
  useGetInfMetaPostsOnly,
  useInsertPostsMutation,
} from "@/queries/wp.queries";
import { useWordpress } from "@/hooks/useWordpress";
import { Wordpress } from "@/components/Protos/wordpress/Wordpress";
import { useNavigate } from "react-router-dom";
import { Normal } from "@/components/Protos/Normal";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "@/components/Loader";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { For } from "million/react";
import { VirtuosoGrid } from "react-virtuoso";
import { GridComponents } from "@/components/Protos/VirtusoGridComponent";

// million-ignore
export const PagesManager = () => {
  const editor = useEditorMaybe();
  const [pages, setPages] = useState(pagesType);
  const [dbPages, setDbPages] = useState(dbPagesType);
  const [searchValue, setSearchValue] = useState("");
  const [pageName, setPageName] = useState(new String(""));
  const pagesInputUploader = useRef(refType);
  const projectId = getProjectId();
  const pagesSearchRef = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [animatedRef] = useAutoAnimate();

  const {
    data: wpMetaPosts,
    isLoading: isWpMetaPostsLoading,
    isError: isWpMetaPostsError,
    isRefetching: isWpMetaPostsRefetching,
  } = useGetInfMetaPostsOnly();

  const {
    mutateAsync: insertPosts,
    isPending: isInsertingPosts,
    isError: isInsertingPostsError,
  } = useInsertPostsMutation("inf_meta_posts");

  const {
    mutateAsync: deletePosts,
    isPending: isDeletingPosts,
    isError: isDeletingPostsError,
  } = useDeletePostsMutation("inf_meta_posts");

  useWordpress(() => {
    if (!isWpMetaPostsLoading && !isWpMetaPostsError) {
      const postsFiltered = wpMetaPosts.filter(
        (page) => page.type !== "inf_symbols" && page.type !== "inf_blocks",
      );
      setPages(postsFiltered);
      pagesSearchRef.current = postsFiltered;
    }
  }, [wpMetaPosts]);

  useLiveQuery(async () => {
    return await doInNormalAsync(async () => {
      const projectData = await getProjectData();
      console.log(Object.values(projectData.pages), searchValue);

      searchValue
        ? search(searchValue, projectData.pages)
        : setPages(Object.values(await projectData.pages));
      setDbPages(projectData.pages);
      return projectData.pages;
    });
  }, [searchValue]);

  useNormal(() => {
    // if (!editor) return;
    const getPages = async () => {
      setPages((await getProjectData()).pages);
    };
    getPages();
  }, []);

  const createPage = async (pageName = new String("")) => {
    await doInNormalAsync(async () => {
      if (!pageName.toString()) return;
      const projectData = await getProjectData();
      setSearchValue("");
      const name = pageName.trim().toLowerCase();
      const pathes = {
        html: `editor/pages/${name}.html`,
        css: `css/${name}.css`,
        js: `js/${name}.js`,
      };

      await opfs.writeFiles(
        Object.values(pathes).map((path) => ({
          path: defineRoot(path),
          content: "",
        })),
      );
      await db.projects.update(projectId, {
        pages: {
          ...projectData.pages,
          [`${name}`]: {
            components: [],
            pathes,
            helmet: {
              author: "",
              description: "",
              keywords: "",
              customMetaTags: "",
              title: "",
              robots: "",
            },
            symbols: [],
            bodyAttributes: {},
            id: uniqueID(),
            name: name,
          },
        },
      });

      setPageName(new String(""));
      toast.success(<ToastMsgInfo msg={`Page created successfully 👍`} />);
    });

    await doInWordpressAsync(async () => {
      navigate(`wordpress/create`, { viewTransition: true });
    });
  };

  const deletePage = async (pageName) => {
    await doInNormalAsync(async () => {
      if (pageName?.toLowerCase?.() == "index") {
        toast.error(<ToastMsgInfo msg={`Not allowed delete index page`} />);
        return;
      }

      const toastId = toast.loading(<ToastMsgInfo msg={`Removing...`} />);
      const projectData = await getProjectData();
      const clone = structuredClone(await projectData.pages);
      const page = clone[pageName];
      await opfs.removeFiles(
        Object.values(page.pathes).map((path) => defineRoot(path)),
      );
      delete clone[pageName];
      await db.projects.update(projectId, {
        pages: clone,
      });

      toast.done(toastId);
      toast.success(<ToastMsgInfo msg={`Page removed successfully 👍`} />);
    });

    await doInWordpressAsync(async () => {
      const wp_config = getWpPageConfig();
      if (wp_config.id === pageName) {
        toast.error(
          <ToastMsgInfo msg={`Not allowed delete current editing page`} />,
        );
        return;
      }
      const toastId = toast.loading(<ToastMsgInfo msg={`Removing...`} />);
      await deletePosts({
        projectId,
        ids: [pageName],
      });
      toast.done(toastId);
      toast.success(<ToastMsgInfo msg={`Page removed successfully 👍`} />);
    });
    // setPages(await (await getProjectData()).pages);
  };

  /**
   *
   * @param {import("react").ChangeEvent} ev
   */
  const uploadPages = async (ev) => {
    // ev.target.value = "";
    /**
     * @type {File[]}
     */
    const files = [...ev.target.files];
    if (!files.length) return;
    await doInNormalAsync(async () => {
      const tId = toast.loading(<ToastMsgInfo msg={`Uploading...`} />);
      const projectData = await getProjectData();
      const mime = await (await import("mime")).default;
      const htmlFiles = files.filter(
        (file) => file.name.endsWith(".html") || file.name.endsWith(".htm"),
      );
      const cssFiles = files.filter((file) => file.name.endsWith(".css"));
      const jsFiles = files.filter((file) => file.name.endsWith(".js"));
      const otherFiles = files.filter(
        (file) =>
          !file.name.endsWith(".js") &&
          !file.name.endsWith(".css") &&
          !file.name.endsWith(".html") &&
          !file.name.endsWith(".htm"),
      );
      console.log("files : ", htmlFiles);

      const pagesUploaded = await Promise.all(
        htmlFiles.map(async (file) =>
          buildPage({
            file,
            pageName: file.name.replace(".html", "").replace(".htm", ""),
          }),
        ),
      );

      for (const page of pagesUploaded) {
        // console.log('paaaaaaage : ' , page , await page.html.text());
        if (page.html.size == 0) {
          toast.warn(
            <ToastMsgInfo msg={`File is empty , maybe it is corrupted!`} />,
          );
        }
        if (projectData.pages[page.name]) {
          const cnfrm = confirm(
            `Page ${page.name} already exists, are you wanna to overwrite it ?`,
          );
          if (!cnfrm) continue;
        }
        await opfs.writeFiles([
          {
            path: defineRoot(page.pathes.html),
            content: page.html,
          },
          {
            path: defineRoot(page.pathes.css),
            content: page.css,
          },
          {
            path: defineRoot(page.pathes.js),
            content: page.js,
          },
        ]);

        projectData.pages[page.name] = cloneDeep(page);
      }

      const assetsWorkerWillUpload = [];

      for (const file of [...cssFiles, ...jsFiles, ...otherFiles]) {
        const ext = mime.getExtension(file.type);
        const fileName = file.name.replace(`.${ext}`, "");
        const page = projectData.pages[fileName];
        if (page) {
          await opfs.writeFiles([
            {
              path: defineRoot(page.pathes[ext]),
              content: file,
            },
          ]);
        } else {
          assetsWorkerWillUpload.push(file);
        }
        console.log("fileNAme = ", fileName);
      }

      assetsWorker.postMessage({
        command: "uploadAssets",
        props: {
          projectId,
          // toastId: id,
          assets: assetsWorkerWillUpload,
        },
      });

      for (const page of Object.values(projectData.pages)) {
        ["html", "css", "js"].forEach((key) => {
          delete page[key];
        });
      }
      await db.projects.update(projectId, {
        pages: projectData.pages,
      });
      console.log("Files to upload: ", pagesUploaded);
      toast.done(tId);
      toast.success(<ToastMsgInfo msg={`Pages uploaded successfully 👍`} />);
    });

    await doInWordpressAsync(async () => {
      const toastId = toast.loading(<ToastMsgInfo msg={`Uploading...`} />);
      const filesAsJson = await (
        await Promise.all(
          files.map(async (file) => JSON.parse(await file.text())),
        )
      ).map((fileJson) => ({
        post: {
          post_type: fileJson.type,
          post_title: fileJson.title,
          post_content: fileJson.content,
          post_name: fileJson.name,
          post_status: "publish",
        },
        meta: fileJson.meta,
      }));

      await insertPosts(
        {
          projectId: projectId,
          posts: filesAsJson,
        },
        {
          onSuccess: async () => {
            toast.done(toastId);
            toast.success(
              <ToastMsgInfo msg={`Posts uploaded successfully 👍`} />,
            );
          },
          onError: async () => {
            toast.done(toastId);
            toast.error(<ToastMsgInfo msg={`Posts uploaded failed! 😦`} />);
          },
        },
      );
    });

    ev.target.value = "";
  };

  const search = (value) => {
    setSearchValue(value);
    doInNormal(() => {
      const pages = dbPages;
      if (!value) {
        setPages(Object.values(pages));
        return;
      }
      const keys = advancedSearchSuggestions(
        Object.values(pages).map((page) => page.name),
        value,
      );
      const searchedPages = {};
      keys.forEach((key) => (searchedPages[key] = pages[key]));
      setPages(Object.values(searchedPages));
    });

    doInWordpress(() => {
      if (!value) {
        setPages(pagesSearchRef.current);
        return;
      }
      const newPages = advancedSearchSuggestions(pages, value, undefined, [
        "name",
        "ID",
        "title",
        "slug",
      ]);
      setPages(newPages);
    });
  };

  const downloadPage = async (page) => {
    await doInNormalAsync(async () => {});

    await doInWordpressAsync(async () => {
      const toastId = toast.loading(
        <ToastMsgInfo msg={`Downloading ${page.name}...`} />,
      );
      await downloadFile({
        filename: `${page.name}.json`,
        content: JSON.stringify(page),
        mimeType: "application/json",
      });
      toast.done(toastId);
      toast.success(
        <ToastMsgInfo msg={`${page.name} downloaded successfully 🥰`} />,
      );
    });
  };

  return (
    <section
      className={`flex flex-col gap-3 h-full w-full  overflow-hidden m-auto animate-go-to`}
      // ref={animatedRef}
    >
      <header
        className={`
      w-full p-2 bg-surface-tertiary rounded-lg flex flex-col  gap-2
         ${isWordpress() && `flex !flex-row w-full justify-between`}
         `}
      >
        {/* <Input
          className="w-full bg-surface-secondary"
          placeholder="Search"
          value={searchValue}
          onInput={(ev) => {
            console.log(ev.target.value);

            setSearchValue(ev.target.value);
            search(ev.target.value);
          }}
        /> */}
        <SearchHeader
          search={search}
          className={`!bg-surface-secondary ${isNormal() ? "w-full" : '!w-[calc(100%-55px)]'}`}
          inputProps={{
            className: "!bg-surface-secondary",
            value: searchValue,
          }}
          iconProps={{ className: "!bg-surface-secondary" }}
          allowTimeout={false}
        />

        <section
          className={`
          flex  justify-between gap-2 
          ${isWordpress() && `grow-0 !w-fit`}
          `}
        >
          <Normal>
            <Input
              className="bg-surface-secondary h-full w-full"
              placeholder="Page Name"
              value={pageName}
              onInput={(ev) => {
                setPageName(new String(ev.target.value));
              }}
              onKeyUp={(ev) => {
                ev.key.toLocaleLowerCase() == "enter" && createPage(pageName);
              }}
            />

            <SmallButton
              tooltipTitle="Create page"
              className="bg-brand-primary"
              onClick={(ev) => {
                createPage(pageName);
              }}
            >
              {Icons.edite({ fill: "white" })}
            </SmallButton>
          </Normal>

          <SmallButton
            tooltipTitle="Upload pages"
            className="bg-brand-primary"
            onClick={(ev) => {
              pagesInputUploader.current.click();
            }}
          >
            {Icons.upload({ strokeColor: "white" })}
          </SmallButton>
          <input
            ref={pagesInputUploader}
            type="file"
            hidden
            multiple
            accept="*"
            onChange={uploadPages}
          />
          {/* <Button
            onClick={(ev) => {
              createPage(pageName);
            }}
          >
            Create
          </Button> */}
        </section>
      </header>

      <ShowIf condition={isWpMetaPostsLoading || isWpMetaPostsRefetching}>
        <Loader className={`animate-go-to`} />
      </ShowIf>

      <ShowIf condition={!(isWpMetaPostsLoading || isWpMetaPostsRefetching)}>
        <VirtuosoGrid
          totalCount={pages?.length}
          components={GridComponents}
          style={{
            height: "100%",
            width: "100%",
          }}
          // className="h-full"
          className="p-[unset] h-full w-full  animate-go-to"
          // itemClassName="p-[unset]"
          listClassName={`${pages.length > 3 ? " pr-2" : ""}`}
          itemContent={(index) => {
            const i = index,
              page = pages[index];
            // console.log("files from virtuso : ", asset);

            return (
              <article
                key={i}
                className={`animate-go-to z-10 flex flex-col h-fit items-center gap-5 justify-between p-2 bg-surface-tertiary rounded-lg  `}
              >
                <div className="shrink-0">
                  {Icons.stNote("white", undefined, 68, 68)}
                </div>
                <FitTitle className="flex items-center gap-2 min-w-[20%!important] max-w-[95%] text-nowrap  p-1 py-2 shrink-0 ">
                  {/* <div className="shrink-0">
                    {Icons.stNote("white", undefined, 18, 18)}
                  </div> */}
                  <p className="capitalize font-bold text-text-primary overflow-hidden text-ellipsis">
                    {page.name} <Wordpress> - ({page.type})</Wordpress>
                  </p>
                </FitTitle>

                <section className="flex  gap-2 p-2 shrink-0   bg-surface-secondary rounded-lg">
                  <SmallButton
                    disabled={isWordpress() && isDeletingPosts}
                    title={
                      (page.name.toLowerCase() == "index" &&
                        "Not Allowed To Delete Index Page") ||
                      `Delete ${page.name}`
                    }
                    className={`group h-full w-fit bg-transparent shrink-0  p-2  hover:bg-[crimson!important] ${
                      page.name.toLowerCase() == "index" &&
                      isNormal() &&
                      "cursor-[not-allowed!important]"
                    }`}
                    tooltipClassName="!bg-[crimson] z-[20000]"
                    onClick={(ev) => {
                      deletePage(
                        isNormal() ? page.name : isWordpress() ? page.ID : null,
                      );
                    }}
                  >
                    {Icons.trash(undefined, undefined, 18, 18)}
                  </SmallButton>

                  <Hr />

                  <SmallButton
                    className={`group h-full w-fit bg-transparent p-2 shrink-0  hover:bg-brand-primary `}
                    tooltipTitle="Settings"
                    onClick={() => {
                      doInNormal(() => {
                        sessionStorage.setItem(current_page_helmet, page.name);
                      });

                      doInWordpress(() => {
                        sessionStorage.setItem(current_page_helmet, page.name);
                        sessionStorage.setItem(
                          current_wp_page_helmet_id,
                          page.ID,
                        );
                      });
                      editor.runCommand(open_page_helmet_modal, {});
                    }}
                  >
                    {Icons.setting(undefined, undefined, 18, 18)}
                  </SmallButton>

                  <Hr />

                  <SmallButton
                    className={`group h-full w-fit bg-transparent p-2 shrink-0 hover:bg-brand-primary `}
                    tooltipTitle="Download page"
                    onClick={async () => {
                      await downloadPage(page);
                    }}
                  >
                    {Icons.export(undefined, undefined, 18, 18)}
                  </SmallButton>
                </section>
              </article>
            );
          }}
        />
      </ShowIf>
    </section>
  );
};
