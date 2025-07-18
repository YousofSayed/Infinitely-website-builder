import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../Protos/Input";
import { Button } from "../../Protos/Button";
import { dbPagesType, pagesType, refType } from "../../../helpers/jsDocs";
import { Icons } from "../../Icons/Icons";
import { useLiveQuery } from "dexie-react-hooks";
import {
  advancedSearchSuggestions,
  getProjectData,
} from "../../../helpers/functions";
import { db } from "../../../helpers/db";
import {
  current_page_helmet,
  current_project_id,
} from "../../../constants/shared";
import { uniqueID } from "../../../helpers/cocktail";
import { open_page_helmet_modal } from "../../../constants/InfinitelyCommands";
import { FitTitle } from "../Protos/FitTitle";
import { SmallButton } from "../Protos/SmallButton";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "../Protos/ToastMsgInfo";
import { Hr } from "../../Protos/Hr";
import { buildPage, defineRoot } from "../../../helpers/bridge";
import { opfs } from "../../../helpers/initOpfs";

export const PagesManager = () => {
  const editor = useEditorMaybe();
  const [pages, setPages] = useState(pagesType);
  const [dbPages, setDbPages] = useState(dbPagesType);
  const [searchValue, setSearchValue] = useState("");
  const [pageName, setPageName] = useState(new String(""));
  const pagesInputUploader = useRef(refType);
  const projectId = +localStorage.getItem(current_project_id);

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    console.log(Object.values(projectData.pages), searchValue);

    searchValue
      ? search(searchValue, projectData.pages)
      : setPages(Object.values(await projectData.pages));
    setDbPages(projectData.pages);
    return projectData.pages;
  }, [searchValue]);

  const createPage = async (pageName = new String("")) => {
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
      Object.values(pathes).map((path) => ({ path : defineRoot(path), content: "" }))
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
          id: uniqueID(),
          name: name,
        },
      },
    });

    // editor.Pages.add({
    //   id: pageName,
    //   name: pageName,
    // });
    setPageName(new String(""));
    toast.success(<ToastMsgInfo msg={`Page created successfully 👍`} />);
    // setPages(await (await getProjectData()).pages);
  };

  const deletePage = async (pageName) => {
    const projectData = await getProjectData();
    const clone = structuredClone(await projectData.pages);
    const page = clone[pageName];
    await opfs.removeFiles(Object.values(page.pathes).map(path=>defineRoot(path)));
    delete clone[pageName];
    await db.projects.update(projectId, {
      pages: clone,
    });

    toast.success(<ToastMsgInfo msg={`Page removed successfully 👍`} />);
    // setPages(await (await getProjectData()).pages);
  };

  useEffect(() => {
    // if (!editor) return;
    const getPages = async () => {
      setPages((await getProjectData()).pages);
    };
    getPages();
  }, []);

  const search = (value, pages = dbPages) => {
    if (!value) {
      setPages(Object.values(pages));
      return;
    }
    const keys = advancedSearchSuggestions(
      Object.values(pages).map((page) => page.name),
      value
    );
    const searchedPages = {};
    keys.forEach((key) => (searchedPages[key] = pages[key]));
    setPages(Object.values(searchedPages));
  };

  /**
   *
   * @param {import("react").ChangeEvent} ev
   */
  const uploadPages = async (ev) => {
    const files = [...ev.target.files];
    if (!files.length) return;
    const pagesUploaded = await Promise.all(
      files.map(async (file) =>
        buildPage({
          file,
          pageName: file.name.replace(".html", "").replace(".htm", ""),
        })
      )
    );

    // const pagesToUpload = Object.fromEntries(
    //   pagesUploaded.map((page) => {
    //     return [page.name, page];
    //   })
    // );
    const projectData = await getProjectData();
    for (const page of pagesUploaded) {
      if (projectData.pages[page.name]) {
        toast.error(
          <ToastMsgInfo
            msg={`Page ${page.name} already exists, skipping upload.`}
          />
        );
        continue;
      }
      await opfs.writeFiles([
        {
          path: defineRoot(`editor/pages/${page.name}.html`),
          content: page.html,
        },
        {
          path: defineRoot(`css/${page.name}.css`),
          content: page.css,
        },
        {
          path: defineRoot(`js/${page.name}.js`),
          content: page.js,
        },
      ]);

      ["html", "css", "js"].forEach((key) => {
        delete page[key];
      });
      projectData.pages[page.name] = page;
    }

    await db.projects.update(projectId, {
      pages: projectData.pages,
    });

    toast.success(<ToastMsgInfo msg={`Pages uploaded successfully 👍`} />);

    console.log("Files to upload: ", pagesUploaded);
  };

  return (
    <section className="flex flex-col gap-3">
      <header className="w-full p-2 bg-slate-800 rounded-lg flex flex-col  gap-2 ">
        <Input
          className="w-full bg-slate-900"
          placeholder="Search"
          value={searchValue}
          onInput={(ev) => {
            console.log(ev.target.value);

            setSearchValue(ev.target.value);
            search(ev.target.value);
          }}
        />
        <section className="flex  justify-between gap-2 ">
          <Input
            className="bg-slate-900 h-full w-full"
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
            className="bg-blue-600"
            onClick={(ev) => {
              createPage(pageName);
            }}
          >
            {Icons.edite({ fill: "white" })}
          </SmallButton>
          <SmallButton
            tooltipTitle="Upload pages"
            className="bg-blue-600"
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
            accept=".html,.htm"
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
      <main className="flex flex-col gap-2">
        {!!pages.length &&
          pages?.map((page, i) => {
            return (
              <article
                key={i}
                className={`flex items-center justify-between p-1 bg-slate-800 rounded-lg  `}
              >
                <FitTitle className="flex items-center gap-2 min-w-[20%!important] p-1 py-2 flex-shrink-0 overflow-hidden text-ellipsis">
                  <div className="flex-shrink-0">{Icons.stNote("white", undefined, 18, 18)}</div>
                  <p className="capitalize font-bold text-slate-200">
                    {page.name}
                  </p>
                </FitTitle>

                <section className="flex  gap-2  bg-slate-900 rounded-lg">
                  <SmallButton
                    title={
                      (page.name.toLowerCase() == "index" &&
                        "Not Allowed To Delete Index Page") ||
                      `Delete ${page.name}`
                    }
                    className={`group h-full w-fit bg-transparent  p-2  hover:bg-[crimson!important] ${
                      page.name.toLowerCase() == "index" &&
                      "cursor-[not-allowed!important]"
                    }`}
                    onClick={(ev) => {
                      if (page.name.toLowerCase() == "index") return;
                      deletePage(page.name);
                    }}
                  >
                    {Icons.trash(undefined, undefined, 18, 18)}
                  </SmallButton>

                  <Hr />

                  <SmallButton
                    className={`group h-full w-fit bg-transparent p-2  hover:bg-blue-600 `}
                    onClick={() => {
                      sessionStorage.setItem(current_page_helmet, page.name);
                      editor.runCommand(open_page_helmet_modal, {});
                    }}
                  >
                    {Icons.setting(undefined, undefined, 18, 18)}
                  </SmallButton>
                </section>
              </article>
            );
          })}
      </main>
    </section>
  );
};
