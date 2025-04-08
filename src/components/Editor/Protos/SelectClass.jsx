import React, { memo, useEffect, useState } from "react";
import { Select } from "./Select";
import { useEditorMaybe } from "@grapesjs/react";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Choices } from "./Choices";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentElState, selectorState } from "../../../helpers/atoms";
import { current_project_id } from "../../../constants/shared";
import { db } from "../../../helpers/db";

export const SelectClass = memo(() => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const setSelector = useSetRecoilState(selectorState);
  const selectedEl = useRecoilValue(currentElState);
  const selector = useRecoilValue(selectorState);
  const [value, setvalue] = useState("");
  const [classesKeywrods, setClassesKeywords] = useState([]);
  const [allStyleSheetClasses, setAllStyleSheetClasses] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState({
    className: "bg-slate-900",
    index: null,
  });

  useEffect(() => {
    if (!selectedEl || !selectedEl.currentEl) {
      setClassesKeywords(getELClasses());
      setSelector("");
      return;
    }
    setClassesKeywords(getELClasses());
    console.log('select is rerendered');
    
    // setSelector("");
  }, [selectedEl]);

  useEffect(()=>{
    if(!editor)return;
    const cb=()=>{
      console.log('selector setted');
      
      setSelector('');
    }
    editor.on('component:selected',cb)
    
    return ()=>{
      editor.off('component:selected',cb)

    }
  },[editor])

  useEffect(() => {
    if (!editor) return;
    setClassesKeywords(getELClasses());
    // setAllStyleSheetClasses(
    //   editor
    //     .getCss({ clearStyles: false, keepUnusedStyles: true })
    //     .match(/\.\w+/gi)
    //     ?.map((className) => className.replace(".", "")) || []
    // );
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const callAsync = async () => {
      setAllStyleSheetClasses(await getAllStyleSheetClasses());
    };
    callAsync();
  }, []);

  useEffect(() => {
    if (!editor) return;
    const callbackUndo = () => {
      console.log("undo");
      setClassesKeywords(getELClasses());
    };

    const callbackRedo = () => {
      console.log("redo");
      setClassesKeywords(getELClasses());
    };

    // Listen for the undo command
    editor.on("command:run:core:undo", callbackUndo);

    // Listen for the redo command
    editor.on("command:run:core:redo", callbackRedo);

    return () => {
      editor.off("command:run:core:redo", callbackRedo);
      editor.off("command:run:core:undo", callbackUndo);
      // editor.off("undo", callback);
    };
  }, [editor]);

  const addClass = (classNameKeyword) => {
    const newArr = [...classesKeywrods, classNameKeyword];
    setClassesKeywords(Array.from(new Set(newArr)));
    editor.getSelected().addClass(newArr);
    setvalue(new String(""));
  };

  const removeClass = (classNameKeyword = "") => {
    editor.getSelected().removeClass(classNameKeyword);
    setClassesKeywords(getELClasses());
  };

  const getELClasses = () => {
    return (
      editor
        .getSelected()
        ?.getClasses()
        ?.filter((className) => !className.startsWith("gjs")) || []
    );
  };

  const getAllStyleSheetClasses = async () => {
    const per1 = performance.now();
    console.log(per1);
    const calssRgx = /(?<=\s|^)\.[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*{)/g;

    const prjectData = await await db.projects.get(projectId);
    const cssLibsClasses = await (
      (await Promise.all(
        [...prjectData.cssLibs].map(async (lib) => await lib.file.text())
      )) || []
    )
      .join("\n")
      .match(calssRgx);

    const editorClasses =
      editor
        .getCss({ clearStyles: false, keepUnusedStyles: true })
        .match(calssRgx) || [];

    const inlineStyles = [
      ...(editor?.Canvas?.getDocument?.()?.querySelectorAll?.("style") || []),
    ]
      .map((styleEl) => styleEl.innerHTML)
      .join("\n")
      .match(calssRgx);

    const allClasses = [
      ...(cssLibsClasses || []),
      ...(editorClasses || []),
      ...(inlineStyles || []),
    ].sort();

    const per2 = performance.now();
    console.log(per2);
    console.log("Classes : ", allClasses);

    return allClasses.map((className) => className.replace(".", "")) || [];
  };

  // const getSh

  return (
    <section className="mt-3 flex flex-col gap-3 p-2">
      <section className="flex gap-2">
        <Select
          value={value}
          onInput={(value) => {
            console.log("log classes : ", editor.getCss().match(/\.\w+/gi));
            console.log("log classes css: ", editor.getCss());

            setvalue(value);
          }}
          onEnterPress={(value) => {
            console.log("valuevalue : ", value);

            addClass(value);
          }}
          onItemClicked={(value) => {
            // setvalue(value);
            addClass(value);
          }}
          placeholder="Calss name"
          keywords={allStyleSheetClasses}
          // onMenuOpen={({ menu, setKeywords, keywords }) => {
          //   setKeywords(
          //     editor.getCss().match(/\.\w+/gi) || []
          //   );
          // }}

          // onMenuOpen={async ({ setKeywords }) => {
          //   setKeywords(await getAllStyleSheetClasses());
          // }}
        />

        <SmallButton
          className="flex-shrink-0 bg-slate-800"
          onClick={(ev) => {
            addClass(value);
          }}
        >
          {Icons.plus("#fff")}
        </SmallButton>
      </section>

      {classesKeywrods[0] ? (
        <section>
          <Choices
            keywords={classesKeywrods}
            className="flex-wrap flex-center bg-slate-800"
            onCloseClick={(ev, keyword) => {
              removeClass(keyword);
            }}
            onActive={({ keyword, index }) => {
              console.log("keeeeyword : ", keyword, "active");

              // setSelector(keyword ? `.${keyword}` : null);
            }}
            onUnActive={({ keyword, index }) => {
              console.log("keeeeyword : ", keyword, "unActive");
              // setSelector(new String(""));
            }}
            enableSelecting={true}
          />
        </section>
      ) : null}
    </section>
  );
});
