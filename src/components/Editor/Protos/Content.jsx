import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentElState, undoAndRedoStates } from "../../../helpers/atoms";
import { updateSelectedWrapper } from "../../../helpers/customEvents";

export const Content = () => {
  const currentElObj = useRecoilValue(currentElState);
  const setUndoAndRedoState = useSetRecoilState(undoAndRedoStates);;
  const undoAndRedoStatesVal = useRecoilValue(undoAndRedoStates);
  const [showTextArea, setShowTextArea] = useState(false);
  const [warnning, setWarnning] = useState("");
  const [val , setVal] = useState();


  useEffect(() => {
    if (currentElObj.currentEl) {
      setShowTextArea(true);
      setWarnning(false);
      setVal(currentElObj.currentEl.childNodes[0].textContent)
      updateSelectedWrapper({selectedEl:currentElObj.currentEl})
      
    } else {
      setShowTextArea(false); 
      setWarnning(`⚠ Choose an element`);
    }
  }, [currentElObj]);
  
  /**
   *
   * @param {InputEvent} ev
  */
 const onInput = (ev) => {
   console.log('loer');
   ev.preventDefault();
   ev.stopPropagation();
   currentElObj.currentEl.childNodes[0].textContent = ev.target.value;
   updateSelectedWrapper({selectedEl:currentElObj.currentEl})
   setVal(ev.target.value);
   setUndoAndRedoState({isStyle:false , isDropping:false });
  };

  return (
    <section className="w--full mt-3  flex flex-col gap-2 p-2 rounded-lg bg-slate-900">
      {warnning.length && (
        <p className="font-semibold text-[18px] text-yellow-300 ">{warnning}</p>
      )}
      {showTextArea && (
        <textarea
        value={val}
          onInput={onInput}
          className="h-[300px] max-h-[300px] w-full bg-slate-900 rounded-lg p-2 outline-none text-white"
        ></textarea>
      )}
    </section>
  );
};
