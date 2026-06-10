import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { refType } from "../../../helpers/jsDocs";
import { HighlightContentEditable } from "./HighlightContentEditable";
import { Virtuoso } from "react-virtuoso";
import { VirtosuoVerticelWrapper } from "../../Protos/VirtosuoVerticelWrapper";
import { FitTitle } from "./FitTitle";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader } from "../../Loader";

/**
 *
 * @param   {{keywords: string[] ,  onScrollEnd?: () => void, className:string, placeholder:string ,isDynamic:boolean , innerStt:string ,onMenuScroll:(ev:UIEvent)=>void , onKeyDown : (ev:KeyboardEvent)=>void, onInput:(ev:InputEvent)=>void,  onInputClick:(ev:MouseEvent)=>void , dynamicInputClassName:string ,choosenKeyword:string, currentChoose:number, menuRef : {[current:string] :HTMLElement} , editorRef : {current : HTMLElement | null} , onItemClicked:(ev:MouseEvent , keyword:string ,i:number , keywordsLength:number)=>void}} param0
 * @returns
 */
export const Menu = ({
  keywords = [],
  className = "",
  choosenKeyword = "",
  currentChoose = 0,
  menuRef,
  editorRef,
  isOpen = false,
  isDynamic = false,
  innerStt = "",
  onInput = (ev) => { },
  onKeyDown = (ev) => { },
  onInputClick = (ev) => { },
  onMenuScroll = (ev) => { },
  onScrollEnd = () => { },
  placeholder = "",
  dynamicInputClassName = "",
  onItemClicked,
  i,
}) => {
  const refs = useRef([]); // Create a ref array
  const listRef = useRef();
  const [animatRef] = useAutoAnimate();

  const safeKeywords = keywords.filter((k) => k !== "__inf_loading__");

  useEffect(() => {
    // Ensure the current item is scrolled into view
    // refs.current[currentChoose]?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // });
    console.log("scrolll : ", listRef.current, currentChoose);

    if (!listRef.current) {
      console.log("Not founded list ref", currentChoose);

      return;
    }
    // listRef.current.scrollTo({top: currentChoose * 50, behavior: 'smooth'});
    listRef.current.scrollToIndex({
      index: currentChoose,
      align: "center", // or 'center', 'end'
      behavior: "smooth", // or 'auto'
      // offset: 1000,
      // alignToTop: true, // Aligns the item to the top of the viewport
      // offset: 0, //
    });

    choosenKeyword.current = safeKeywords[currentChoose];
    // console.log('content : ', refs.current[currentChoose]?.textContent);
    // menuRef, choosenRef, currentChoose , isOpen ,
  }, [currentChoose, safeKeywords]);

  if (keywords.length === 1 && keywords[0] === "__inf_loading__") {
    return (
      <section className="w-full h-full flex items-center justify-center min-h-[100px]">
        <Loader width={40} height={40} />
      </section>
    );
  }

  if (safeKeywords.length === 0) {
    return (
      <section className="w-full h-full flex items-center justify-center min-h-[50px] p-4 text-text-primary opacity-60 font-semibold">
        No items here
      </section>
    );
  }

  return isDynamic ? (
    <section
      ref={animatRef}
      className={`w-full shadow-lg flex gap-2  shadow-gray-950 border-[1px] max-h-[300px] border-border-default rounded-lg   bg-surface-secondary overflow-hidden   ${className ? className : "w-full"
        }`}
    >
      <section className="w-[500px] h-[300px] overflow-y-auto" ref={menuRef}>
        <Virtuoso
          ref={listRef}
          totalCount={safeKeywords.length}
          itemContent={(index) => {
            const item = safeKeywords[index];
            return (
              <li
                key={index}
                id={`list-item-${index}`}
                ref={(el) => (refs.current[index] = el)}
                onClick={(ev) => {
                  onItemClicked(ev, item, index, safeKeywords.length);
                }}
                className={`${currentChoose == index
                  ? "bg-brand-primary hover:bg-brand-primary"
                  : "bg-transparent hover:bg-gray-700"
                  } ${item.toLowerCase() == "No Items Founded...".toLowerCase()
                    ? "pointer-events-none bg-transparent"
                    : ""
                  }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-border-default  text-text-primary  text-[16px] font-semibold `}
              >
                {item}
              </li>
            );
          }}
        />
      </section>

      <HighlightContentEditable
        editorRef={editorRef}
        innerStt={innerStt}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onClick={onInputClick}
        placeholder={placeholder}
        // autoFocus={true}

        className={dynamicInputClassName}
      />
    </section>
  ) : (
    <section className="w-full h-full overflow-x-auto" ref={menuRef}>
      <Virtuoso
        ref={listRef}
        initialTopMostItemIndex={currentChoose < 0 ? 0 : currentChoose}
        totalCount={safeKeywords.length}
        style={{ gap: "unset", marginBottom: "unset" }}
        endReached={(index) => {
          console.log('scroll end index : ', index);
          console.log(onScrollEnd);

          onScrollEnd?.()
        }}
        components={{ Item: (props) => <div className="flex flex-col gap-2" {...props}></div> }}
        itemContent={(index) => {
          const item = safeKeywords[index]; // || "No Items Founded...";
          return (
            <li
              key={index}
              id={`list-item-${index}`}
              ref={(el) => (refs.current[index] = el)}
              onClick={(ev) => {
                onItemClicked(ev, item, index, keywords.length);
              }}
              style={
                {
                  // height: "50px",
                  // borderBottom: "1px solid #475569"
                }
              }
              className={`flex items-center    p-2 text-nowrap w-full  overflow-x-auto  transition-all cursor-pointer   text-text-primary  text-[16px] font-semibold `}
            >
              <h1
                // style={{
                //   backgroundColor:currentChoose == index ? 'transparent' : '#2563eb'
                // }}
                className={`
                  font-semibold w-full p-2
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                  text-ellipsis   
                  transition-colors
                  ${currentChoose == index
                    ? "bg-brand-primary "
                    : "bg-surface-tertiary hover:bg-brand-primary"
                  }`}
              >
                {" "}
                {new String(item)}
              </h1>
            </li>
          );
        }}
      />
    </section>
  );
};
