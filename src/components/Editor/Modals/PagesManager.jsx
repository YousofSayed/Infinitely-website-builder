import { useEditorMaybe } from "@grapesjs/react";
import React, { useEffect, useState } from "react";
import { Input } from "../Protos/Input";
import { Button } from "../../Protos/Button";
import { dbPagesType, pagesType } from "../../../helpers/jsDocs";
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

export const PagesManager = () => {
  const editor = useEditorMaybe();
  const [pages, setPages] = useState(pagesType);
  const [dbPages, setDbPages] = useState(dbPagesType);
  const [searchValue, setSearchValue] = useState("");
  const [pageName, setPageName] = useState(new String(""));
  const projectId = +localStorage.getItem(current_project_id);

  useLiveQuery(async () => {
    const projectData = await getProjectData();
    console.log(Object.values(projectData.pages) , searchValue);

    searchValue
      ? search(searchValue, projectData.pages)
      : setPages(Object.values(await projectData.pages));
    setDbPages(projectData.pages);
    return projectData.pages;
  },[searchValue]);

  const createPage = async (pageName = new String("")) => {
    if (!pageName.toString()) return;
    const projectData = await getProjectData();
    setSearchValue("");
    const name = pageName.trim().toLowerCase()
    await db.projects.update(projectId, {
      pages: {
        ...projectData.pages,
        [`${name}`]: {
          components: [],
          html: new Blob([""], { type: "text/html" }),
          css: new Blob([""], { type: "text/css" }),
          js: new Blob([""], { type: "application/javascript" }),
          helmet: {
            author: "",
            description: "",
            keywords: "",
            customMetaTags: "",
            title: "",
            robots: "",
          },
          id: uniqueID(),
          name:name,
        },
      },
    });

    // editor.Pages.add({
    //   id: pageName,
    //   name: pageName,
    // });
    setPageName(new String(""));
    // setPages(await (await getProjectData()).pages);
  };

  const deletePage = async (pageName) => {
    const projectData = await getProjectData();
    const clone = structuredClone(await projectData.pages);
    delete clone[pageName];
    await db.projects.update(projectId, {
      pages: clone,
    });
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
          <Button
            onClick={(ev) => {
              createPage(pageName);
            }}
          >
            Create
          </Button>
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
                <section className="flex items-center gap-2">
                  {Icons.stNote()}
                  <p className="capitalize font-bold text-slate-200">
                    {page.name}
                  </p>
                </section>

                <section className="flex items-center gap-2">
                  <Button
                    title={
                      (page.name.toLowerCase() == "index" &&
                        "Not Allowed To Delete Index Page") ||
                      `Delete ${page.name}`
                    }
                    className={`group bg-transparent transition-all p-2 hover:bg-blue-600 ${
                      page.name.toLowerCase() == "index" && "cursor-not-allowed"
                    }`}
                    onClick={(ev) => {
                      if (page.name.toLowerCase() == "index") return;
                      deletePage(page.name);
                    }}
                  >
                    {Icons.trash()}
                  </Button>

                  <Button
                    className={`group bg-transparent transition-all p-2 hover:bg-blue-600 `}
                    onClick={() => {
                      sessionStorage.setItem(current_page_helmet, page.name);
                      editor.runCommand(open_page_helmet_modal, {});
                    }}
                  >
                    {Icons.setting()}
                  </Button>
                </section>
              </article>
            );
          })}
      </main>
    </section>
  );
};
