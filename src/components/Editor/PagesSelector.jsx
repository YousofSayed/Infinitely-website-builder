import { select_page } from "@/constants/InfinitelyCommands";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import {
  current_page_id,
  current_project_id,
  wp_page_config,
  wp_rest_base_edite,
} from "@/constants/shared";
import { showPreviewState } from "@/helpers/atoms";
import { db } from "@/helpers/db";
import { Icons } from "@/components/Icons/Icons";
import { Select } from "@/components/Editor/Protos/Select";
import { useEditorMaybe } from "@grapesjs/react";
import { useLiveQuery } from "dexie-react-hooks";
import React, { memo, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  doInNormal,
  doInNormalAsync,
  doInWordpress,
  setWpPostConfig,
} from "@/helpers/functions";
import { useGetInfMetaPostsOnly } from "@/queries/wp.queries";
import { useWordpress } from "@/hooks/useWordpress";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./Protos/ToastMsgInfo";

export const PagesSelector = () => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const showPreview = useRecoilValue(showPreviewState);
  const [pages, setPages] = useState([]);
  const [pageName, setPageName] = useState("");
  const {
    data: wpPosts,
    isPending: isWpPostsLoading,
    isRefetching: isWpPostsRefetching,
  } = useGetInfMetaPostsOnly();

  const navigateToAnotherPage = async (pageId) => {
    editor.runCommand(select_page, { pageId });
  };

  useLiveQuery(async () => {
    await doInNormalAsync(async () => {
      await getAndSetAllPages();
    });
  });

  // ✅ FIX 1: Added [] dependency array.
  // Without this, it runs on EVERY render and overwrites your setPageName(exactTitle) immediately!
  useEffect(() => {
    if (!editor) return;
    setPageName(localStorage.getItem(current_page_id));
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const pageUpdateCallback = async () => {
      console.log("editor is now on from updater");
      const currentId = localStorage.getItem(current_page_id);

      // ✅ FIX 2: Search the loaded pages to find the correct display title instead of just the raw ID
      const matchedPage = pages.find((p) => {
        const pId = typeof p === "string" ? p : p.value?.ID || p.value?.id;
        return String(pId) === String(currentId);
      });

      if (matchedPage) {
        setPageName(
          typeof matchedPage === "string" ? matchedPage : matchedPage.title,
        );
      } else {
        setPageName(currentId);
      }
    };

    editor.on(InfinitelyEvents.pages.all, pageUpdateCallback);

    return () => {
      editor.off(InfinitelyEvents.pages.all, pageUpdateCallback);
    };
  }, [editor, pages]); // Added 'pages' to dependencies so it uses the latest loaded keywords

  useWordpress(() => {
    if (!wpPosts?.length) return;
    console.log("wpPosts :", wpPosts);

    const keywords = wpPosts
      .filter(
        (post) => post.type !== "inf_symbols" && post.type !== "inf_blocks",
      )
      .map((post) => {
        post.id = post.ID;
        return {
          title: `${post.slug} ${post?.["inf_meta"]?.["inf_template_type"] ? ` - (${post?.["inf_meta"]?.["inf_template_type"]})` : ""}`,
          value: post,
        };
      });
    setPages(keywords);
  }, [wpPosts]);

  const getAndSetAllPages = async () => {
    const projectPages = await (await db.projects.get(projectId))?.pages;
    if (!projectPages) return;
    setPages(Object.keys(projectPages) || []);
  };

  const onInput = (value) => {
    // if(!value){
    //   setTimeout(() => {
    //     setPageName(localStorage.getItem(current_page_id));
    //   } , 1500)
    //   return;
    // }
    setPageName(value);
    return;
    doInNormal(() => {
    });

    doInWordpress(() => {
      const exactTitle = `${value.slug} ${value?.["inf_meta"]?.["inf_template_type"] ? ` - (${value?.["inf_meta"]?.["inf_template_type"]})` : ""}`;
      setPageName(exactTitle);
    });
  };



  const onSelectPage = (value) => {
    // In Normal mode, value is a string (the page ID/slug)
    // const value = page?.value;
    if (editor.infLoading) {
      toast.warn(<ToastMsgInfo msg="Please wait for the page to load 😀" />);
      return;
    }

    if (editor.infStore) {
      toast.warn(<ToastMsgInfo msg="Hang tight, saving your work! 😍" />);
      return;
    }

    doInNormal(() => {
      navigateToAnotherPage(
        typeof value === "string" ? value.toLowerCase() : value.id,
      );
    });

    console.log("value page : ", value );

    // return;
    // In WordPress mode, value is the full post object
    doInWordpress(() => {
      setWpPostConfig({
        rest_base: value.rest_base,
        post_id: value.ID,
        type: value.type,
        post: value,
      });

      // ✅ FIX 3: Now this will actually stick because the runaway useEffect is fixed!
      editor.trigger(InfinitelyEvents.storage.loadStart);
      editor.load();
    });
    setPageName(value.slug);
  };

  return (
    <li className="shrink-0 grow-0 w-[180px]">
      <Select
        icon={Icons.stNote()}
        className=" bg-surface-tertiary  "
        containerClassName="bg-surface-secondary "
        // preventInput={true}
        keywords={pages} // Cleaned up redundant .map()
        value={pageName}
        onInput={onInput}
        onEnterPress={onSelectPage}
        onItemClicked={onSelectPage}
        onBlur={() => {
          setPageName(localStorage.getItem(current_page_id));
        }}
      />
    </li>
  );
};
