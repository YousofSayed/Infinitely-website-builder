import { useUndoRedo } from "@anandarizki/use-undo-redo";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { showsState } from "../helpers/atoms";

export const useInfinitelyUndoRedo = (state) => {
  const [undo, redo] = useUndoRedo(state);
  const [shows, setShows] = useRecoilState(showsState);

  useEffect(() => {
    window.undo = undo;
    window.redo = redo;
    return () => {
      window.undo = null;
      window.redo = null;
    };
  }, [undo, redo , shows]);

  // useEffect(() => {
  //   setShows((prev) => ({ ...prev, motionBuilder: true }));
  //   return () => {
  //     // setGlobalUndoAndRedo({ undo: () => {}, redo: () => {} });
  //     setShows((prev) => ({ ...prev, motionBuilder: false }));
  //   };
  // }, []);
};
