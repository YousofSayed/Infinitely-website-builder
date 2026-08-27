import { showWpTokensPickerState } from "@/helpers/atoms";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useWordpress } from "./useWordpress";
import { doInWordpress, isWordpress } from "@/helpers/functions";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "@/components/Editor/Protos/ToastMsgInfo";
import { useEditorMaybe } from "@grapesjs/react";

export const useShortcuts = () => {
  const editor = useEditorMaybe();
  const [showWpToken, setShowWpToken] = useRecoilState(showWpTokensPickerState);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const warners = () => {
      if (editor.infLoading) {
        toast.warn(
          <ToastMsgInfo msg={`Please wait while the editor is loading 😀`} />,
        );
        return;
      }

      if (editor.infStore) {
        toast.warn(
          <ToastMsgInfo msg={`Please wait while the editor is saving 😀`} />,
        );
        return;
      }
    };
    /**
     *
     * @param {KeyboardEvent} e
     */
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === "w") {
        doInWordpress(() => {
          warners();
          setShowWpToken(true);
        });
      }
    };
    // window.addEventListener("keydown", handleKeyDown);

    return () => {
    //   window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);
};
