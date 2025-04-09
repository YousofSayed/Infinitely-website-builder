import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Icons } from "../../Icons/Icons";
import {
  advancedSearchSuggestions,
  replaceLastWord,
} from "../../../helpers/functions";
import { Menu } from "./Menu";
import { P } from "../../Protos/P";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { popoverRefState, popoverState } from "../../../helpers/atoms";
import { Popover } from "../Popover";
import { CodeEditor } from "./CodeEditor";

/**
 *
 * @param {{label:string , keywords:string[], ignoreCurlyBrackets:boolean , allowCmdsContext:boolean, allowRestAPIModelsContext:boolean, setValue : (value:string)=>void , onValue:(value:string)=>void , isTextarea:false ,className:string , inputClassName:string ,containerClassName:string, placeholder:string, isCode:boolean , isTemplateEngine:boolean, codeProps:import('@monaco-editor/react').EditorProps, language:string,  replaceLastWorld:boolean, preventInput:boolean, icon:import('react').ReactNode, value:string , setValue:Function , isRelative : boolean, onKeywordsSeted : (keywords:string[])=>void, onItemClicked:(keyword ,index : number)=>void , onAll : (value:string)=>void, onMenuOpen : ({menu , setKeywords , keywords } : {menu:HTMLElement , setKeywords : Function , keywords: string[]})=>void , onMenuClose:({menu , setKeywords , keywords } : {menu:HTMLElement , setKeywords : Function , keywords: string[]})=>void, onEnterPress: (keyword:string )=>void,  onInput:(value:string)=>void, wrap:boolean, setKeyword:(keyword:string )=>void , respectParenthesis : boolean,splitHyphen:boolean}} param0
 * @returns
 */
export const Select = ({
  label,
  keywords = [],
  className = "",
  inputClassName = "",
  containerClassName = "",
  setKeyword = (_, _2) => {},
  onItemClicked = (_) => {},
  onInput = (_) => {},
  onEnterPress = (_, _2) => {},
  onAll = (value) => {},
  onMenuOpen = (_) => {},
  onMenuClose = (_) => {},
  onKeywordsSeted = (_) => {},
  placeholder = "",
  wrap = false,
  respectParenthesis = false,
  icon,
  isRelative = true,
  preventInput = false,
  isTextarea = false,
  isCode = false,
  allowCmdsContext = false,
  allowRestAPIModelsContext = false,
  isTemplateEngine = false,
  language = "",
  codeProps = {},
  value = "",
  replaceLastWorld = false,
  setValue = (value = "") => {},
  onValue = (value = "") => {},
  singlevalueInInput = true,
  ignoreCurlyBrackets = false,
  splitHyphen = false,
}) => {
  const [showMenu, setMenu] = useState(false);
  const [newKeywords, setNewKeywords] = useState([...keywords]);
  const [isPending, setTransition] = useTransition();
  const [currentChoose, setCurrentChoose] = useState(0);
  const setPopoverData = useSetRecoilState(popoverState);
  const popoverData = useRecoilValue(popoverState);
  // const [value, setValue] = useState(value);
  const inputRef = useRef();
  const selectRef = useRef();
  const menuRef = useRef();
  const choosenKeyword = useRef();
  const editorRef = useRef();
  const btnRef = useRef();
  const popoverRef = useRecoilValue(popoverRefState);


  useEffect(() => {
    if (
      respectParenthesis &&
      inputRef.current.value.lastIndexOf(")") ==
        inputRef.current.value.length - 1
    ) {
      respectParenthesisHandler();
    }
    onValue(value);
  }, [value]);

  useEffect(() => {
    onKeywordsSeted(newKeywords);
    // console.log('keys for select : ' , keywords);

    // filterKeywords(isTextarea ? value.endsWith(' ') ? '' :  : value);
    // console.log('keyws updated ...');
  }, [keywords]);

  useEffect(() => {
    showMenu
      ? onMenuOpen({
          menu: menuRef.current,
          setKeywords: setNewKeywords,
          keywords: newKeywords,
        })
      : onMenuClose({
          menu: menuRef.current,
          setKeywords: setNewKeywords,
          keywords: newKeywords,
        });
    if (showMenu) {
      console.log("ref : ", editorRef.current, inputRef?.current);
      if (!editorRef?.current || !inputRef?.current) return;
      isTextarea ? editorRef.current.focus() : inputRef.current.focus();
      const currentRefView = isTextarea ? editorRef.current : inputRef.current;
      currentRefView.setSelectionRange(
        currentRefView.value.length,
        currentRefView.value.length
      );
    }
  }, [showMenu]);

  useEffect(() => {
    const closeMenuCallback = () => {
      setMenu(false);
    };
    document.addEventListener("click", closeMenuCallback);
    return () => {
      document.removeEventListener("click", closeMenuCallback);
    };
  });

  useEffect(() => {
    setValue(value);
  }, [value]);

  useEffect(() => {
    if (!popoverRef) return;
    popoverRef.innerHTML = "";
  }, []);

  const showMenuCallback = () => {
    // isTextarea ? editorRef.current.focus() : inputRef.current.focus();
    setTransition(() => {
      setMenu(!showMenu);
    });
  };

  function findIndex(keywords = [], serachvalue) {
    const index = keywords.findIndex((value, i) =>
      value.toLowerCase().includes(serachvalue)
    );

    return index;
  }

  /**
   *
   * @param {InputEvent} ev
   */
  const filterKeywords = (
    value,
    allowSetKeywords = true,
    ignoreLastSpace = true
  ) => {
    const newKeyW = advancedSearchSuggestions(keywords, value, ignoreLastSpace);

    console.log(newKeyW, "newwww", value);

    if (!newKeyW.length) {
      !isTextarea && setMenu(false);
      setNewKeywords([]);
      return;
    }

    allowSetKeywords && setNewKeywords(newKeyW);
    const index = findIndex(newKeyW, value);

    if (index == -1 && newKeyW.length) {
      setCurrentChoose(0);
      choosenKeyword.current = newKeyW[0]; //no items founded
    } else {
      setCurrentChoose(index);
      choosenKeyword.current = newKeyW[index];
    }
    // setMenu(true);
  };

  const respectParenthesisHandler = () => {
    const value = inputRef.current.value;
    const openIndex = value.lastIndexOf("(");
    const closeIndex = value.lastIndexOf(")");
    if (openIndex !== -1 && closeIndex !== -1 && closeIndex > openIndex) {
      // Place the cursor right after the last opening parenthesis
      const cursorPosition = openIndex + 1;
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  /**
   *
   * @param {KeyboardEvent} ev
   */
  const handleChooses = (ev) => {
    let cloneCurrentChooseNum = currentChoose;

    console.log(ev.key);
    //Arrow Down
    if (ev.key == "ArrowDown") {
      // if (isTextarea && !ev.ctrlKey) return;
      isTextarea && newKeywords.length && ev.preventDefault();
      cloneCurrentChooseNum++;

      if (cloneCurrentChooseNum >= newKeywords.length) {
        console.log("we got finall");

        setCurrentChoose(0);
        return;
      }
      setCurrentChoose(cloneCurrentChooseNum);
      // setValue(choosenKeyword.current)
    }
    //Ctrl & Sapce
    else if (ev.ctrlKey && ev.key == " ") {
      ev.preventDefault();
      const values = ev.target.value.split(" ");
      console.log("value : ", values, values[values.length - 1]);
      setNewKeywords(keywords);

      !isTextarea && showMenuCallback();
    }
    //ArrowUp
    else if (ev.key == "ArrowUp") {
      // if (isTextarea && !ev.ctrlKey) return;

      isTextarea && newKeywords.length && ev.preventDefault();
      cloneCurrentChooseNum--;
      if (cloneCurrentChooseNum < 0) {
        console.log("we fucken got it from arrow up : ", cloneCurrentChooseNum);

        setCurrentChoose(new Number(newKeywords.length - 1));
        return;
      }
      setCurrentChoose(cloneCurrentChooseNum);
      // setValue(choosenKeyword.current)
    }
    //Enter
    else if (ev.key == "Enter") {
      isTextarea && newKeywords.length && ev.preventDefault();
      const finalvalue = splitHyphen
        ? choosenKeyword.current.split("-")[0]
        : choosenKeyword.current || value;

      const textareavalue = isTextarea
        ? replaceLastWord(value, finalvalue, ignoreCurlyBrackets)
        : value;

      setKeyword(textareavalue);
      onAll(!replaceLastWorld ? finalvalue : textareavalue);
      onEnterPress(!replaceLastWorld ? finalvalue : textareavalue);
      setValue(textareavalue);
      console.log("choosen keyword  : ", choosenKeyword.current, finalvalue);
      console.log("finalvalue : ", textareavalue);
      console.log("value : ", value);

      !isTextarea && setMenu(false);
      // inputRef.current.focus();
    }

    // showPopover(true);
  };

  // const setShowPopover = () => {
  //   showPopover({
  //     element: selectRef,
  //     isTextarea,
  //     content: (
  //       <>
  //         {" "}
  //         <Menu
  //           // key={uniqueID()}
  //           isDynamic={isTextarea}
  //           keywords={newKeywords}
  //           menuRef={menuRef}
  //           choosenKeyword={choosenKeyword}
  //           currentChoose={currentChoose}
  //           innerStt={value}
  //           onInput={(ev) => {
  //             setValue(ev.target.value);
  //             onInput(ev.target.value);
  //             onAll(ev.target.value);
  //             filterKeywords(ev.target.value.trim());
  //           }}
  //           onKeyDown={(ev) => {
  //             handleChooses(ev);
  //           }}
  //           onItemClicked={(ev, keyword, i) => {
  //             ev.stopPropagation();
  //             const nkeyw = splitHyphen ? keyword.split("-")[0] : keyword;
  //             setValue(nkeyw);
  //             onAll(nkeyw);
  //             onItemClicked(nkeyw, i);
  //             setKeyword(nkeyw);
  //             setMenu(false);
  //             inputRef.current.focus();
  //           }}
  //         />
  //       </>
  //     ),
  //   });
  // };

  return (
    <section
      ref={selectRef}
      className={`w-full p-1  h-fit rounded-lg flex ${
        wrap && "flex-wrap gap-3 py-1 pl-2"
      }  justify-between gap-3 items-center  ${
        className ? className : "bg-slate-800"
      } h-full`}
    >
      {icon}
      {label ? <P>{label.replaceAll(/(\s+)?\:/ig ,'')} : </P> : null}
      <div
        className={`h-full ${label ? "w-[55%]" : "w-full"} ${
          isRelative ? "relative" : ""
        }  flex items-center flex-nowrap justify-center  bg-slate-900  rounded-lg ${
          containerClassName ? containerClassName : ""
        }`}
        onClick={(ev) => {
          selectRef.current.click();
          preventInput &&
            setTimeout(() => {
              setMenu(!showMenu);
              setNewKeywords(keywords);
              setCurrentChoose(findIndex(keywords, value));
            }, 0);
          // setShowPopover();
        }}
        onDoubleClick={(ev) => {
          preventInput && inputRef.current.focus();
        }}
      >
        <input
          value={value}
          ref={inputRef}
          className={`w-full h-full  font-semibold   focus:border-blue-600  rounded-lg   p-2   outline-none text-white ${
            preventInput ? "pointer-events-none" : ""
          } ${inputClassName ? inputClassName : "bg-slate-900"} `}
          type="text"
          placeholder={placeholder}
          onClick={(ev) => {
            ev.stopPropagation();
            selectRef.current.click();
            setNewKeywords(keywords);
            setCurrentChoose(
              newKeywords.findIndex((keyword) =>
                keyword
                  .toLowerCase()
                  .includes(ev.target.value.trim().toLowerCase())
              )
            );
            !isTextarea && !keywords.length
              ? setMenu(false)
              : setMenu(!showMenu);
            isTextarea && editorRef?.current?.focus();

            // showPopover({ element: selectRef, isTextarea });
            // setShowPopover();
            isCode && showMenuCallback()
          }}
          onInput={(ev) => {
            setValue(ev.target.value);
            onInput(ev.target.value);
            onAll(ev.target.value);
            filterKeywords(ev.target.value.trim());
            // showPopover(true);
          }}
          onKeyDown={(ev) => {
            handleChooses(ev);
            // showPopover(true);
          }}
          // onFocus={(ev)=>{
          //   if(!isCode)return
          //   btnRef.current.click()
          //   // ev.stopPropagation()
          //   // setMenu(true)
          // }}
        />

        <button
          title="Type Dynamic Content"
          ref={btnRef}
          onClick={(ev) => {
            ev.stopPropagation();
            selectRef.current.click();
            console.log("dsad:", keywords, choosenKeyword.current, value);
            const index = findIndex(keywords, value);
            setCurrentChoose(index);
            if (index <= -1) {
              choosenKeyword.current = keywords[index];
            } else {
              choosenKeyword.current = '';
            }
            setNewKeywords(keywords)
            // filterKeywords(value || "", true);
            showMenuCallback();
            // setShowPopover();
          }}
          className={`group   ${
            showMenu ? "rotate-180" : "rotate-0"
          } transition-all cursor-pointer flex-grow-0`}
        >
          {!isTextarea && !isCode && Icons.arrow()}
          {isCode && Icons.code({ width: 25, strokWidth: 3 })}
          {isTextarea && Icons.edite({ width: 25 })}
          {/* {isTextarea ? Icons.edite({ width: 25 }) : Icons.arrow()} */}
        </button>

        {showMenu && (
          <Popover
            targetRef={selectRef}
            isTextarea={isTextarea}
            isCode={isCode}
            width={isCode ? 600 : isTextarea ? 600 : 300}
            height={isCode ? Math.trunc(window.innerHeight * (45 / 100)) : 0}
            isOpen={showMenu}
            setIsOpen={setMenu}
          >
            {!isCode && (
              <Menu
                isDynamic={isTextarea}
                keywords={
                  newKeywords.length ? newKeywords : ["No Items Founded..."]
                }
                menuRef={menuRef}
                editorRef={editorRef}
                choosenKeyword={choosenKeyword}
                currentChoose={currentChoose}
                innerStt={value}
                dynamicInputClassName="bg-slate-800"
                placeholder="Type Dynamic Content"
                onInputClick={(ev) => {
                  ev.stopPropagation();
                  selectRef.current.click();
                  setNewKeywords(keywords);
                  setCurrentChoose(
                    newKeywords.findIndex((keyword) =>
                      keyword
                        .toLowerCase()
                        .includes(ev.target.value.trim().toLowerCase())
                    )
                  );
                  setMenu(true);
                }}
                onInput={(ev) => {
                  setValue(ev.target.value);
                  onInput(ev.target.value);
                  onAll(ev.target.value);
                  if (ev.target.value.endsWith(" ")) {
                    // setNewKeywords(keywords);
                    if (ev.target.value.endsWith(" ")) {
                      console.log("ends with noo");

                      // return''
                    }
                    filterKeywords("");
                    setCurrentChoose(0);
                  } else {
                    console.log("else");
                    const values = ev.target.value.split(" ");
                    console.log("value : ", values, values[values.length - 1]);

                    filterKeywords(values[values.length - 1]);
                  }
                }}
                onKeyDown={(ev) => {
                  handleChooses(ev);
                }}
                onItemClicked={(ev, keyword, i) => {
                  ev.stopPropagation();
                  const nkeyw = splitHyphen ? keyword.split("-")[0] : keyword;
                  const finalvalue = isTextarea
                    ? replaceLastWord(value, nkeyw, ignoreCurlyBrackets)
                    : nkeyw;
                  setValue(finalvalue);
                  onAll(finalvalue);
                  onItemClicked(!replaceLastWorld ? nkeyw : finalvalue, i);
                  setKeyword(finalvalue);
                  isTextarea ? undefined : setMenu(false);
                  inputRef.current.focus();
                }}
              />
            )}

            {isCode && (
              <CodeEditor
                isTemplateEngine={isTemplateEngine}
                allowCmdsContext={allowCmdsContext}
                allowRestAPIModelsContext={allowRestAPIModelsContext}
                props={{ ...codeProps }}
              />
            )}
          </Popover>
        )}

        {/* <section className="w-[300px] h-[300px] bg-slate-800 fixed left-0 top-0 z-[500]  "></section> */}
      </div>
    </section>
  );
};
