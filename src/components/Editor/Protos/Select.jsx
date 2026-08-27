import { popoverRefState, popoverState } from "@/helpers/atoms";
import {
  advancedSearchSuggestions,
  replaceLastWord,
} from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { Loader } from "@/components/Loader";
import { P } from "@/components/Protos/P";
import { Popover } from "@/components/Editor/Popover";
import { CodeEditor } from "@/components/Editor/Protos/CodeEditor";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { Menu } from "@/components/Editor/Protos/Menu";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export const Select = ({
  label,
  keywords = [],
  className = "",
  inputClassName = "",
  containerClassName = "",
  zIndex = 10,
  setKeyword = (_, _2) => {},
  onItemClicked = (_) => {},
  onInput = (_) => {},
  onEnterPress = (_, _2) => {},
  onBlur = (_) => {},
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
  useLoader = false,
  ignoreCurlyBrackets = false,
  onScrollEnd = () => {},
  splitHyphen = false,
  isFetchingNext = false,
  closeAfterPressEnter = true,
  supportTokens = false,
}) => {
  const getLabel = (item) => {
    if (typeof item === "string") return item;
    return item?.title || (typeof item?.value === "string" ? item.value : "");
  };

  const getValue = (item) => {
    if (typeof item === "string") return item;
    if (item?.value !== undefined) return item.value;
    return item;
  };

  // Map the incoming value (ID) back to its display label (slug/title)
  const displayValue = useMemo(() => {
    if (value === "" || value === null || value === undefined) return "";

    const matchedItem = keywords.find((k) => {
      const kValue = getValue(k);
      return kValue == value;
    });

    if (matchedItem) {
      return getLabel(matchedItem);
    }
    return value;
  }, [value, keywords]);

  const [showMenu, setMenu] = useState(false);
  const [newKeywords, setNewKeywords] = useState(
    Array.from(keywords).filter(Boolean),
  );
  const [currentChoose, setCurrentChoose] = useState(0);
  const setPopoverData = useSetRecoilState(popoverState);
  const popoverData = useRecoilValue(popoverState);
  const inputRef = useRef();
  const selectRef = useRef();
  const containerRef = useRef();
  const menuRef = useRef();
  const choosenKeyword = useRef();
  const editorRef = useRef();
  const btnRef = useRef();
  const popoverRef = useRecoilValue(popoverRefState);
  const [animatRef] = useAutoAnimate();
  const [zIndexValue, setZIndexValue] = useState(zIndex);
  const lastKeywordsRef = useRef([]);

  useLayoutEffect(() => {
    selectRef.current && animatRef(selectRef.current);
    containerRef.current && animatRef(containerRef.current);
    if (selectRef.current && document.body.querySelector(`#main-modal`)) {
      setZIndexValue(2000);
    }
  }, [selectRef, containerRef]);

  useEffect(() => {
    if (
      respectParenthesis &&
      inputRef.current?.value?.lastIndexOf(")") ==
        inputRef.current.value.length - 1
    ) {
      respectParenthesisHandler();
    }
  }, [value, respectParenthesis]);

  useEffect(() => {
    onValue(value);
  }, [value]);

  // ✅ FIX 1: The Infinite Scroll Bug
  // We removed the filtering logic from here.
  // When fetchNextPage adds new items, we just append them and update the highlighted index.
  useEffect(() => {
    onKeywordsSeted(keywords, setNewKeywords);

    const hasChanged =
      keywords.length !== lastKeywordsRef.current.length ||
      !keywords.every(
        (kw, i) => getLabel(kw) === getLabel(lastKeywordsRef.current[i]),
      );

    if (hasChanged) {
      lastKeywordsRef.current = keywords;
      filterKeywords(value, true);
      // // Stop filtering the list when new API data arrives!
      // setNewKeywords(keywords.filter(Boolean));

      // // Just re-highlight the currently selected item in the new list
      // const index = findIndex(keywords, value);
      // setCurrentChoose(index === -1 ? 0 : index);
      // choosenKeyword.current = index === -1 ? keywords[0] : keywords[index];
    }
  }, [keywords, value]);

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
      if (!editorRef?.current || !inputRef?.current) return;
      isTextarea ? editorRef.current.focus() : inputRef.current.focus();
      const currentRefView = isTextarea ? editorRef.current : inputRef.current;
      currentRefView.setSelectionRange(
        currentRefView.value.length,
        currentRefView.value.length,
      );
    }
  }, [showMenu]);

  useEffect(() => {
    setValue(value);
  }, [value]);

  useEffect(() => {
    if (!popoverRef) return;
    popoverRef.innerHTML = "";
  }, [popoverRef]);

  const showMenuCallback = () => {
    setMenu((old) => !old);
  };

  function findIndex(keywords = [], searchvalue) {
    if (searchvalue === "" || searchvalue === null || searchvalue === undefined)
      return -1;

    const index = keywords.findIndex((item) => {
      const label = getLabel(item).toString().toLowerCase().trim();
      const val = getValue(item);
      const searchStr = searchvalue.toString().toLowerCase().trim();

      return label === searchStr || val == searchvalue;
    });
    return index;
  }

  const filterKeywords = (
    searchValue = "",
    allowSetKeywords = true,
    ignoreLastSpace = true,
  ) => {
    // ✅ FIX 2: If search is empty, just show all keywords in their original API order
    console.log("keywords after upadte", searchValue);
    if (!searchValue || !searchValue?.trim?.()) {
      allowSetKeywords && setNewKeywords(keywords.filter(Boolean));
      const idx = findIndex(keywords, searchValue ?? value);
      setCurrentChoose(idx === -1 ? 0 : idx);
      choosenKeyword.current = idx === -1 ? keywords[0] : keywords[idx];
      return;
    }

    const stringKeywords = keywords.map(getLabel);
    const findedKeywords = stringKeywords.find(
      (item) => item.toLowerCase() === searchValue.toLowerCase(),
    );
    const newKeyWStrings = findedKeywords
      ? [findedKeywords]
      : advancedSearchSuggestions(stringKeywords, searchValue, ignoreLastSpace);

    console.log(
      "keywords after upadte",
      stringKeywords,
      findedKeywords,
      newKeyWStrings,
    );

    if (!newKeyWStrings.length) {
      !isTextarea && setMenu(false);
      setNewKeywords([]);
      return;
    }

    const newKeyW = newKeyWStrings
      .map((str) => {
        const lowerStr = str.toLowerCase().trim();
        return keywords.find(
          (k) => getLabel(k).toLowerCase().trim() === lowerStr,
        );
      })
      .filter(Boolean);

    allowSetKeywords && setNewKeywords(newKeyW);
    !allowSetKeywords && setNewKeywords(keywords);
    const index = findIndex(allowSetKeywords ? newKeyW : keywords, searchValue);

    if (index == -1 && newKeyW.length) {
      setCurrentChoose(0);
      choosenKeyword.current = searchValue;
    } else {
      setCurrentChoose(index);
      choosenKeyword.current = newKeyW[index];
    }
  };

  const respectParenthesisHandler = () => {
    const value = inputRef.current.value;
    const openIndex = value.lastIndexOf("(");
    const closeIndex = value.lastIndexOf(")");
    if (openIndex !== -1 && closeIndex !== -1 && closeIndex > openIndex) {
      const cursorPosition = openIndex + 1;
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  const handleChooses = (ev) => {
    let cloneCurrentChooseNum = currentChoose;

    if (ev.key == "ArrowDown") {
      isTextarea && newKeywords.length && ev.preventDefault();
      cloneCurrentChooseNum++;

      if (cloneCurrentChooseNum >= newKeywords.length) {
        setCurrentChoose(0);
        return;
      }
      setCurrentChoose(cloneCurrentChooseNum);
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === " ") {
      ev.stopPropagation();
      selectRef.current.click();

      filterKeywords(ev.target.value.trim(), true);
      setMenu(true);
    } else if (ev.key == "ArrowUp") {
      isTextarea && newKeywords.length && ev.preventDefault();
      cloneCurrentChooseNum--;
      if (cloneCurrentChooseNum < 0) {
        setCurrentChoose(newKeywords.length - 1);
        return;
      }
      setCurrentChoose(cloneCurrentChooseNum);
    } else if (ev.key == "Enter") {
      isTextarea && newKeywords.length && ev.preventDefault();

      const chosenItem = choosenKeyword.current;
      const chosenLabel = chosenItem ? getLabel(chosenItem) : "";
      const chosenValue = chosenItem ? getValue(chosenItem) : "";

      const finalvalue = splitHyphen ? chosenLabel.split("-")[0] : chosenValue;

      // const textareavalue = isTextarea
      //   ? replaceLastWord(value, chosenLabel, ignoreCurlyBrackets)
      //   : value;

      console.log(`You selected `, chosenLabel, finalvalue);
      setKeyword(finalvalue);
      onAll(finalvalue);
      onEnterPress(finalvalue);

      setValue(finalvalue);

      closeAfterPressEnter && setMenu(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <section
      ref={selectRef}
      className={`w-full p-1 relative  h-fit rounded-lg flex  ${
        wrap && "flex-wrap gap-3 py-1 pl-2"
      }  gap-2  ${className ? className : "bg-surface-tertiary"} h-full flex ${
        label ? `p-1 flex-col` : `items-center p-1 `
      }`}
    >
      {icon}
      {label ? (
        <FitTitle className="capitalize flex items-center justify-center overflow-hidden text-ellipsis custom-font-size w-fit shrink-0 ">
          {label.replaceAll(/(\s+)?\:/gi, "")}{" "}
        </FitTitle>
      ) : null}
      <div
        data-ignore-popover
        ref={containerRef}
        className={` h-full w-full ${
          isRelative ? "relative" : ""
        }  flex items-center flex-nowrap justify-center    rounded-lg ${
          containerClassName ? containerClassName : "bg-surface-secondary"
        }`}
        onClick={(ev) => {
          // selectRef.current.click();
          // !preventInput && inputRef.current.click();
          // preventInput &&
          //   setTimeout(() => {
          //     setMenu(!showMenu);
          //     setNewKeywords(keywords);
          //     setCurrentChoose(findIndex(keywords, value));
          //   }, 0);

          preventInput && inputRef.current.click() && inputRef.current.focus();
        }}
        // onDoubleClick={(ev) => {
        //   preventInput && inputRef.current.focus();
        // }}
      >
        <input
          {...(supportTokens && { "data-support-tokens": supportTokens })}
          data-ignore-popover
          value={displayValue}
          ref={inputRef}
          className={`w-full h-full  font-semibold   focus:border-blue-600  rounded-lg   px-2 py-2   outline-none text-white ${
            preventInput ? "pointer-events-none" : ""
          } ${inputClassName ? inputClassName : "bg-surface-secondary"} `}
          type="text"
          placeholder={placeholder || label}
          onClick={(ev) => {
            // ev.stopPropagation();
            // selectRef.current.click();

            // ✅ FIX 3: If clicking to open, show ALL keywords instead of filtering by the selected value
            if (ev.target.value === displayValue) {
              setNewKeywords(keywords.filter(Boolean));
              setCurrentChoose(findIndex(keywords, value));
              // alert("equal value");
            } else {
              filterKeywords(ev.target.value, true);
              // alert(`not equal value ${ev.target.value}`);
            }

            setMenu((old) => !old);
            isTextarea && editorRef?.current?.focus();
          }}
          onInput={(ev) => {
            if (useLoader || isFetchingNext) return;
            setValue(ev.target.value);
            onInput(ev.target.value);
            onAll(ev.target.value);
            filterKeywords(ev.target.value.trim(), true);
          }}
          onBlur={onBlur}
          onKeyDown={(ev) => {
            handleChooses(ev);
          }}
        />

        <button
          title="Type Dynamic Content"
          data-ignore-popover
          ref={btnRef}
          className={`group absolute right-2 top-1/2 transform -translate-y-1/2   ${
            showMenu ? "rotate-180" : "rotate-0"
          } transition-all cursor-pointer flex-grow-0`}
          onClick={(ev) => {
            // ev.stopPropagation();
            // ev.preventDefault();
            // selectRef.current.click();

            // ✅ FIX 4: Show ALL keywords when clicking the arrow button
            setNewKeywords(keywords.filter(Boolean));

            const index = findIndex(keywords, value);
            setCurrentChoose(index <= -1 ? 0 : index);
            choosenKeyword.current =
              index <= -1 ? keywords[0] : keywords[index];

            showMenuCallback();
          }}
        >
          <div className="pointer-events-none">
            {!isTextarea && !isCode && Icons.arrow()}
            {isCode && Icons.code({ width: 25, strokWidth: 3 })}
            {isTextarea && Icons.edite({ width: 25 })}
          </div>
        </button>

        {showMenu && (
          <Popover
            targetRef={selectRef}
            isTextarea={isTextarea}
            isCode={isCode}
            zIndex={zIndexValue}
            width={
              isCode
                ? 600
                : isTextarea
                  ? 600
                  : selectRef.current.clientWidth <= 300
                    ? 300
                    : selectRef.current.clientWidth
            }
            height={isCode ? Math.trunc(window.innerHeight * (45 / 100)) : 0}
            isOpen={showMenu}
            setIsOpen={setMenu}
          >
            {!isCode &&
              (useLoader ? (
                <Loader width={30} height={30} />
              ) : (
                <Menu
                  onScrollEnd={onScrollEnd}
                  isFetchingNext={isFetchingNext}
                  isDynamic={isTextarea}
                  keywords={newKeywords}
                  menuRef={menuRef}
                  editorRef={editorRef}
                  isOpen={showMenu}
                  choosenKeyword={choosenKeyword}
                  currentChoose={currentChoose}
                  innerStt={displayValue}
                  dynamicInputClassName="bg-surface-tertiary"
                  placeholder="Type Dynamic Content"
                  onInputClick={(ev) => {
                    ev.stopPropagation();
                    selectRef.current.click();
                    setNewKeywords(keywords);
                    const index = keywords.findIndex(
                      (k) =>
                        getLabel(k).toLowerCase() ===
                        ev.target.value.trim().toLowerCase(),
                    );
                    const choose = index <= -1 ? 0 : index;
                    setCurrentChoose(choose);
                    setKeyword(getLabel(keywords[choose]));
                    choosenKeyword.current = keywords[choose];
                    setMenu(true);
                  }}
                  onInput={(ev) => {
                    setValue(ev.target.value);
                    onInput(ev.target.value);
                    onAll(ev.target.value);
                    if (ev.target.value.endsWith(" ")) {
                      if (ev.target.value.endsWith(" ")) {
                        console.log("ends with noo");
                      }
                      filterKeywords("");
                      setCurrentChoose(0);
                    } else {
                      const values = ev.target.value.split(" ");
                      filterKeywords(values[values.length - 1]);
                    }
                  }}
                  onKeyDown={(ev) => {
                    handleChooses(ev);
                  }}
                  onItemClicked={(ev, keyword, i) => {
                    ev.stopPropagation();
                    const kLabel = getLabel(keyword);
                    const kValue = getValue(keyword);
                    console.log("kValue", kValue);

                    const nkeyw = splitHyphen ? kLabel.split("-")[0] : kValue;
                    const finalvalue = isTextarea
                      ? replaceLastWord(value, kLabel, ignoreCurlyBrackets)
                      : nkeyw;

                    setValue(isTextarea ? finalvalue : kLabel);
                    onAll(finalvalue);
                    onItemClicked(finalvalue, i);
                    setKeyword(finalvalue);

                    setMenu(false);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                />
              ))}

            {isCode && (
              <CodeEditor
                isTemplateEngine={isTemplateEngine}
                allowCmdsContext={allowCmdsContext}
                allowRestAPIModelsContext={allowRestAPIModelsContext}
                showEditorState={showMenu}
                props={{ ...codeProps }}
              />
            )}
          </Popover>
        )}
      </div>
    </section>
  );
};
