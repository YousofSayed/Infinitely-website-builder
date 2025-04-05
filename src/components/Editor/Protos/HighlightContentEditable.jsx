import React, { useEffect, useRef, useState } from "react";
import { refType } from "../../../helpers/jsDocs";

const HighlightContentEditable = ({
  innerStt = "",
  onInput = (value = "") => {},
  onKeyDown = (value = "") => {},
  onKeyUp = (value = "") => {},
  onClick = (ev) => {},
  editorRef,
  autoFocus = false,
  placeholder = "",
  className = "",
}) => {
  const [inner, setInner] = useState(innerStt);
  const editableRef = useRef(refType);

  useEffect(() => {
    if (!editableRef || !editableRef.current) return;
    const editable = editableRef.current;
    console.log("innner : ", inner);

    const highlightableText = inner.replaceAll(
      /\$\{(\W+)?\w+((\W+)?(\w+)?)+?\}/gi,
      (word) => {
        return `<span class="text-blue-500 ">${word}</span>`;
      }
    );

    editable.innerHTML = highlightableText || "";
  }, [inner]);

  useEffect(() => {
    setInner(innerStt);
  }, [innerStt]);

  return (
    <article className="relative w-full min-h-[300px] bg-slate-900 rounded-lg  overflow-hidden">
      <p
        ref={editableRef}
        spellCheck="false"
        className={`h-full w-full p-2 font-bold select-none absolute left-0 top-0 bottom-0 right-0 outline-none text-wrap overflow-auto break-all text-[#e2e8f0!important] ${className}`}
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: "1.5", // Match the line-height with the textarea
          fontSize: "1rem", // Match the font-size with the textarea
          padding: "0.5rem", // Match padding with the textarea
        }}
      ></p>

      <textarea
        autoFocus={autoFocus}
        ref={editorRef}
        onScroll={(ev) => {
          console.log(ev.target.scrollTop);
          // editableRef.current.scrollTop = ev.target.scrollTop
          // editableRef.current.scrollLeft = ev.target.scrollLeft
          editableRef.current.scrollTo({
            behavior: "instant",
            left: ev.target.scrollLeft,
            top: ev.target.scrollTop,
          });
        }}
        spellCheck="false"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={onClick}
        placeholder={placeholder}
        value={inner}
        className="relative p-2 font-bold min-h-[300px] w-full outline-none h-full text-transparent bg-transparent caret-blue-500"
        onInput={(ev) => {
          setInner(ev.target.value);
          onInput(ev);
        }}
        style={{
          lineHeight: "1.5", // Match the line-height with the p element
          fontSize: "1rem", // Match the font-size with the p element
          padding: "0.5rem", // Match padding with the p element
        }}
      ></textarea>
    </article>
  );
};

export { HighlightContentEditable };
