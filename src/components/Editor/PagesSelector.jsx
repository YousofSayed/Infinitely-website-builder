import React, { memo, useEffect, useState } from "react";
import { Select } from "./Protos/Select";
import { useEditorMaybe } from "@grapesjs/react";
import { Icons } from "../Icons/Icons";
import { current_page_id, current_project_id } from "../../constants/shared";
import { db } from "../../helpers/db";
import { InfinitelyEvents } from "../../constants/infinitelyEvents";
import { select_page } from "../../constants/InfinitelyCommands";
import { useLiveQuery } from "dexie-react-hooks";
import { useRecoilValue } from "recoil";
import { showPreviewState } from "../../helpers/atoms";

export const PagesSelector = memo(() => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const showPreview = useRecoilValue(showPreviewState);
  const [pages, setPages] = useState([]);
  const [pageName, setPageName] = useState("");

  const navigateToAnotherPage = async (pageId) => {
    editor.runCommand(select_page, { pageId });
    // const navPage = editor.Pages.get(pageId);
    // editor.Pages.select(navPage);
    // setPageName(navPage.id);
  };

  useLiveQuery(async () => {
    // setPageName()
    await getAndSetAllPages();
  });

  useEffect(() => {
    if (!editor) {
      // console.log("whyyyyyyy");
      return;
    }
    // console.log("editor is now on");

    const pageUpdateCallback = async () => {
      console.log("editor is now on from updater");

      setPageName(localStorage.getItem(current_page_id));
      // localStorage.setItem(current_page_id, currentPage.id);
    };

    // const windowCallback = (ev) => {
    //   console.log("111111111111: details", ev.detail);
    //   setPageName(new String(ev.detail.pageName));
    // };
    // window.addEventListener(InfinitelyEvents.pages.all, pageUpdateCallback);
    editor.on(InfinitelyEvents.pages.all, pageUpdateCallback);
    // window.addEventListener(InfinitelyEvents.pages.all, windowCallback);
    return () => {
      // window.removeEventListener(
      //   InfinitelyEvents.pages.all,
      //   windowCallback
      // );
      editor.off(InfinitelyEvents.pages.all, pageUpdateCallback);
    };
    // setPageName(localStorage.getItem(current_page_id))
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      // console.log("whyyyyyyy");
      return;
    }
    console.log("editor is now on");
    setPageName(localStorage.getItem(current_page_id));
  });

  const getAndSetAllPages = async () => {
    const pages = await (await db.projects.get(projectId)).pages;
    // console.log("pages names : ", Object.keys(pages));

    setPages(Object.keys(pages));
  };

  return (
    <Select
      icon={Icons.stNote()}
      className=" bg-slate-800  w-full h-full p-1 "
      containerClassName="bg-slate-900 w-[120px!important]"
      preventInput={true}
      keywords={pages.map((page) => page)}
      value={pageName}
      // onMenuOpen={({ setKeywords }) => {
      //   setPages(editor.Pages.getAll().map((page) => page.id));
      // }}
      onAll={(value) => {
        navigateToAnotherPage(value.toLowerCase());
      }}
    />
  );
});
