import React, { useEffect, useState } from "react";
import { currentElState, showsState } from "../../helpers/atoms";
import { useRecoilState } from "recoil";
import { useUndoRedo } from "@anandarizki/use-undo-redo";
import { cloneDeep } from "lodash";

/**
 *
 * @param {{
 *   children : React.JSX.Element ,
 *    showProp :
 *    state : any
 * }} param0
 * @returns
 */

/**
 * @typedef {Object} Props
 * @property {keyof import('../../helpers/types').ShowProps} showProp
 * @property {any} state
 * @property {any} defaultValue
 * @property {React.JSX.Element} children
 * @param {React.HTMLAttributes<HTMLDivElement> & Props} props
 * @returns
 */
export const UndoRedoContainer = ({ children, showProp, state,defaultValue = {}, ...props }) => {
  const [undo, redo, { reset, history }] = useUndoRedo(state);
  const [st, setSt] = state;
  const [isReset, setReset] = useState(false);
  const [shows, setShows] = useRecoilState(showsState);
  const [currentEl, setCurretEl] = useRecoilState(currentElState);

  useEffect(() => {
    if (!shows[showProp]) return;
    window.undo = undo;
    window.redo = redo;
    return () => {
      window.undo = null;
      window.redo = null;
    };
  }, [undo, redo, shows]);

  useEffect(() => {
    if (!currentEl?.currentEl) return;
    console.log("history[0]",history?.[0]?.value);
    
    // clear undo/redo history and set a fresh state
    // history?.length && history?.[0]?.value?.constructor?.name ? new Function(`return new ${history[0]?.value?.constructor?.name}()`) : 
    reset();
    setSt(cloneDeep(defaultValue)); // or the default initial state for this element
    // history.length = 0;
  }, [currentEl]);

  useEffect(() => {
    return () => {
      setShows((old) => ({ ...old, [showProp]: false }));
    };
  }, []);

  return (
    <div
      {...props}
      onPointerEnter={(ev) => {
        console.log("pointer is enter : ", showProp);

        setShows((old) => ({
          ...Object.fromEntries(Object.keys(old).map((key) => [key, false])),
          [showProp]: true,
        }));
      }}
    >
      {children}
    </div>
  );
};
