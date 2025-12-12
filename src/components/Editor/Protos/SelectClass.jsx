import React, { memo, useEffect, useState } from "react";
import { Select } from "./Select";
import { useEditorMaybe } from "@grapesjs/react";
import { SmallButton } from "./SmallButton";
import { Icons } from "../../Icons/Icons";
import { Choices } from "./Choices";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentElState, selectorState } from "../../../helpers/atoms";
import { current_project_id, inf_class_name } from "../../../constants/shared";
import { db } from "../../../helpers/db";
import { classesFinderWorker } from "../../../helpers/defineWorkers";
import { getProjectSettings } from "../../../helpers/functions";
import { infinitelyCallback } from "../../../helpers/bridge";
import { InfinitelyEvents } from "../../../constants/infinitelyEvents";

export const SelectClass = () => {
  const editor = useEditorMaybe();
  const projectId = +localStorage.getItem(current_project_id);
  const [selector, setSelector] = useRecoilState(selectorState);
  const selectedEl = useRecoilValue(currentElState);
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
    console.log("select is rerendered");

    // setSelector("");
  }, [selectedEl]);

  useEffect(() => {
    if (!editor) return;
    const cb = () => {
      // console.log("selector setted");

      setSelector("");
    };
    editor.on("component:selected", cb);

    return () => {
      editor.off("component:selected", cb);
    };
  }, [editor]);

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

    const callback = (ev) => {
      const { command, props } = ev.data;
      if (command === "classes-chunks" && props.classes) {
        infinitelyCallback(() => {
          setAllStyleSheetClasses((prev) => [
            ...new Set([...prev, ...props.classes]),
          ]);
        }, 10);
      }
    };

    classesFinderWorker.addEventListener("message", callback);
    return () => classesFinderWorker.removeEventListener("message", callback);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    if (!selectedEl.currentEl) return;
    getClassFromInlineWorker();
  }, [editor, selectedEl]);

  useEffect(() => {
    if (!editor) return;
    const selected = editor.getSelected();
    if (!selected) return;
    const callback = () => {
      console.log("undo");
      setClassesKeywords(getELClasses());
    };

    // const callbackRedo = () => {
    //   console.log("redo");
    //   setClassesKeywords(getELClasses());
    // };

    // Listen for the undo command
    editor.on("command:run:core:undo", callback);
    selected.on("change:attributes", callback);
    // Listen for the redo command
    editor.on("command:run:core:redo", callback);

    return () => {
      editor.off("command:run:core:redo", callback);
      editor.off("command:run:core:undo", callback);
      selected.off("change:attributes", callback);
      // editor.off("undo", callback);
    };
  }, [editor]);

  const addClass = (classNameKeyword) => {
    const newArr = [...classesKeywrods, classNameKeyword];
    setClassesKeywords(Array.from(new Set(newArr)));
    editor.getSelected().addClass(newArr);
    setvalue(new String(""));
    editor.getSelected().view.render();
  };

  const removeClass = (classNameKeyword = "") => {
    const selected = editor.getSelected();
    selected.removeClass([classNameKeyword]);
    // if (`.${classNameKeyword}` == selector.toString()) {
    //   setSelector(new String(""));
    // }
    setSelector(new String(""));
    const infClassName = selected.getAttributes()[inf_class_name];
    if (infClassName == classNameKeyword) {
      selected.removeAttributes([inf_class_name]);
    }
    setClassesKeywords(getELClasses());
    // preventSelectNavigation(editor , selected)
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
    //   const myLol = 'myLol'
    //  console.log(eval(` console.log(myLol)`));

    const per1 = performance.now();
    console.log(per1);
    const calssRgx = /(?<!\/\*.*)\.[a-zA-Z_][a-zA-Z0-9_-]*(?=[,{\s:])/gi; ///(?<=\s|^)\.[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*{)/g;
    const commentRgx = /\/\*[\s\S]*?\*\//g;
    const prjectData = await await db.projects.get(projectId);
    const cssLibsClasses = await (
      (await Promise.all(
        [...prjectData.cssLibs].map(async (lib) => await lib.file.text())
      )) || []
    )
      .join("\n")
      .replaceAll(commentRgx, "")
      .match(calssRgx);

    const editorClasses =
      editor
        .getCss({ clearStyles: false, keepUnusedStyles: true })
        .replaceAll(commentRgx, "")
        .match(calssRgx) || [];

    const inlineStyles = [
      ...(editor?.Canvas?.getDocument?.()?.querySelectorAll?.("style") || []),
    ]
      .map((styleEl) => styleEl.innerHTML)
      .join("\n")
      .replaceAll(commentRgx, "")
      .match(calssRgx);

    const allClasses = [
      ...new Set([
        ...(cssLibsClasses || []),
        ...(editorClasses || []),
        ...(inlineStyles || []),
      ]),
    ].sort();

    const per2 = performance.now();
    console.log(per2);
    // console.log("Classes : ", allClasses);
    const classes =
      allClasses.map((className) => className.replace(".", "")) || [];
    self.postMessage({ command: "classes", props: { classes } });
    return classes;
  };

  const getClassFromInlineWorker = () => {
    // const { worker, revoker } = inlineWorker(() => {}, {
    //   editorCss: editor.getCss({ clearStyles: false, keepUnusedStyles: true }),
    //   inlineStylesInner: [
    //     ...(editor?.Canvas?.getDocument?.()?.querySelectorAll?.("style") || []),
    //   ],
    // });

    classesFinderWorker.postMessage({
      command: "getAllStyleSheetClasses",
      props: {
        projectId,
        editorCss: editor.getCss({
          keepUnusedStyles: true,
          clearStyles: false,
          onlyMatched: false,
          avoidProtected: true,
        }),
        projectSettings: getProjectSettings().projectSettings,
        // inlineStylesInners: [
        //   ...(editor?.Canvas?.getBody?.()?.querySelectorAll?.("style") || []),
        // ].map((styleEl) => styleEl.innerHTML),
      },
    });
    console.log(
      "postting message"
      //  parse(editor.getCss({
      //     keepUnusedStyles: true,
      //   })).stylesheet.rules
    );
  };
  // const getSh

  return (
    <section className="mt-3 flex flex-col gap-3 p-1 bg-slate-900 rounded-lg">
      <section className="flex gap-2">
        <Select
          value={value}
          onInput={(value) => {
            // console.log("log classes : ", editor.getCss().match(/\.\w+/gi));
            // console.log("log classes css: ", editor.getCss());

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
              editor.trigger(InfinitelyEvents.ruleTitle.update , keyword)
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
};
