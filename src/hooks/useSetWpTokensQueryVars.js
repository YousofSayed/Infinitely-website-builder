import React from "react";
import { useWordpress } from "./useWordpress";
import { wpTokensState } from "@/helpers/atoms";
import { useRecoilState } from "recoil";
import { InfinitelyEvents } from "@/constants/infinitelyEvents";
import { getTokensQueryVars } from "@/helpers/functions";
import { useEditorMaybe } from "@grapesjs/react";

export const useSetWpTokensQueryVars = () => {
  const [tokensVars, setTokensVars] = useRecoilState(wpTokensState);
  const editor = useEditorMaybe();
  useWordpress(() => {
    if (!editor) return;
    const callback = () => {
      setTokensVars(getTokensQueryVars());
    };
    editor.on(InfinitelyEvents.tokens.update, callback);
    editor.onReady(callback);
    return () => {
      editor.off(InfinitelyEvents.tokens.update, callback);
    };
  }, [editor]);
};
