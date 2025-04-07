import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { refType } from "../../../helpers/jsDocs";
import { HighlightContentEditable } from "./HighlightContentEditable";
import { ViewportList } from "react-viewport-list";

/**
 *
 * @param   {{keywords: string[] ,className:string, placeholder:string ,isDynamic:boolean , innerStt:string ,onMenuScroll:(ev:UIEvent)=>void , onKeyDown : (ev:KeyboardEvent)=>void, onInput:(ev:InputEvent)=>void,  onInputClick:(ev:MouseEvent)=>void , dynamicInputClassName:string ,choosenKeyword:string, currentChoose:number, menuRef : {[current:string] :HTMLElement} , editorRef : {current : HTMLElement | null} , onItemClicked:(ev:MouseEvent , keyword:string ,i:number , keywordsLength:number)=>void}} param0
 * @returns
 */
export const Menu = ({
  keywords = [],
  className = "",
  choosenKeyword = "",
  currentChoose = 0,
  menuRef,
  editorRef,
  isDynamic = false,
  innerStt = "",
  onInput = (ev) => {},
  onKeyDown = (ev) => {},
  onInputClick = (ev) => {},
  onMenuScroll = (ev) => {},
  placeholder = "",
  dynamicInputClassName = "",
  onItemClicked,
  i,
}) => {
  const [keywordsState, setKeywordsState] = useState([]);
  const choosenRef = useRef(refType);
  const unChoosenRef = useRef();
  const keywordsLengthRef = useRef(0);
  const refs = useRef([]); // Create a ref array
  const [scrollValue, setScollValue] = useState();
  const prevNumber = useRef();
  const listRef = useRef();

  // useEffect(() => {
  //   console.log("length ooo : ", keywords.length, keywords.slice(100, 5000));
  //   const newValue = keywordsLengthRef.current + 100;
  //   if (keywords.length && keywords.length >= 100) {
  //     const preKeywords =
  //       keywordsLengthRef.current >= 100 ? [...keywordsState] : [];

  //     console.log("fuuuu : ", [
  //       ...preKeywords,
  //       ...keywords.slice(keywordsLengthRef.current, newValue),
  //     ]);
  //     setKeywordsState([
  //       ...preKeywords,
  //       ...keywords.slice(keywordsLengthRef.current, newValue),
  //     ]);
  //     keywordsLengthRef.current = newValue;
  //   } else {
  //     setKeywordsState(keywords.length ? keywords : ["No Items Founded..."]);
  //   }
  // }, []);

  // useLayoutEffect(() => {
  //   refs.current[currentChoose]?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "center",
  //     // inline: "center",
  //   });

  //   if (menuRef.current) {
  //     const totalHeight = keywords.length * 50; // Total height = itemCount * itemSize
  //     if (currentChoose == 0 && prevNumber.current == keywords.length - 1) {
  //       menuRef.current.scrollTo(0);
  //     } else if (
  //       currentChoose == keywords.length - 1 &&
  //       prevNumber.current == 0
  //     ) {
  //       menuRef.current.scrollTo(totalHeight);
  //     }
  //     console.log("currentChoose from cond", currentChoose);
  //   }

  //   prevNumber.current = currentChoose; // == 0 || currentChoose == keywords.length-1 ? currentChoose : null;

  //   choosenKeyword.current = refs.current[currentChoose]?.textContent;
  // }, [menuRef, choosenRef, currentChoose]);

  // useLayoutEffect(() => {
  //   const totalHeight = keywords.length * 50; // Total height = itemCount * itemSize
  //   console.log('totalHeight :' , totalHeight );

  //   if (!menuRef || !menuRef.current || totalHeight < 300) return;
  //   if (currentChoose == 0) {
  //     menuRef.current.scrollTo(0);
  //   } else if (currentChoose == keywords.length - 1) {
  //     menuRef.current.scrollTo(totalHeight);
  //   }
  // }, [keywords]);

  useLayoutEffect(() => {
    // Ensure the current item is scrolled into view
    // refs.current[currentChoose]?.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // });
    console.log('scrolll : ' ,listRef.current);
    
    if(!listRef.current)return;
    listRef.current.scrollToIndex({
      index: currentChoose,
      // offset: 1000,
      alignToTop: true, // Aligns the item to the top of the viewport
      offset: 0, //
    });

    // document.body.scrollIntoView({
    //   block:'end'
    // })

    // if (menuRef.current) {
    //   const totalHeight = keywords.length * 50; // Total height = itemCount * itemSize
    //   if (currentChoose === 0 && prevNumber.current === keywords.length - 1) {
    //     menuRef.current.scrollTo(0); // Scroll to top
    //   } else if (
    //     currentChoose === keywords.length - 1 &&
    //     prevNumber.current === 0
    //   ) {
    //     menuRef.current.scrollTo(totalHeight); // Scroll to bottom
    //   }
    //   console.log("currentChoose from cond", currentChoose);
    // }

    // prevNumber.current = currentChoose;
    
    choosenKeyword.current = refs.current[currentChoose]?.textContent;
    console.log('content : ', refs.current[currentChoose]?.textContent);
  }, [menuRef, choosenRef, currentChoose]);

  // useLayoutEffect(() => {
  //   const totalHeight = keywords.length * 50; // Total height = itemCount * itemSize
  //   console.log("totalHeight:", totalHeight);

  //   if (!menuRef || !menuRef.current || totalHeight < 300) return;
  //   if (currentChoose === 0) {
  //     menuRef.current.scrollTo(0); // Scroll to top
  //   } else if (currentChoose === keywords.length - 1) {
  //     menuRef.current.scrollTo(totalHeight); // Scroll to bottom
  //   }
  // }, [keywords]);

  return isDynamic ? (
    <section
      className={`w-full shadow-lg flex gap-2  shadow-gray-950 border-[1px] max-h-[300px] border-slate-600 rounded-lg   bg-slate-900 overflow-hidden   ${
        className ? className : "w-full"
      }`}
    >
      {/* <menu
        onScroll={(ev) => {
          console.log(ev.target.scrollHeight);
          console.log(ev.target.scrollTop);
        }}
        // style={{clipPath:'inset(2px)' left-0}}
        className={` h-full  grid grid-cols-1   border-r-[1px] max-h-[300px] overflow-y-auto border-slate-600 rounded-lg   bg-slate-900  p-1 w-[100%]`}
      >
        {keywordsState.map((keyword, i) => (
          <li
            id={i}
            ref={currentChoose == i ? choosenRef : unChoosenRef}
            onClick={(ev) => {
              onItemClicked(ev, keyword, i, keywordsState.length);
            }}
            className={`${
              currentChoose == i
                ? "bg-blue-600 hover:bg-blue-600"
                : "bg-transparent hover:bg-gray-700"
            } ${
              keyword.toLowerCase() == "No Items Founded...".toLowerCase()
                ? "pointer-events-none bg-transparent"
                : ""
            }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200 rounded-md  text-[16px] font-semibold `}
            key={i}
          >
            {keyword}
          </li>
        ))}
      </menu> */}

      <section className="w-[500px] h-[300px] overflow-y-auto" ref={menuRef}>
        <ViewportList
          items={keywords}
          // itemSize={50}
          viewportRef={menuRef}
          ref={listRef}
          // axis="y"
          // itemMargin={8}
        >
          {(item, index) => (
            <li
              key={index}
              id={`list-item-${index}`}
              ref={(el) => (refs.current[index] = el)}
              onClick={(ev) => {
                onItemClicked(ev, item, index, keywords.length);
              }}
              className={`${
                currentChoose == index
                  ? "bg-blue-600 hover:bg-blue-600"
                  : "bg-transparent hover:bg-gray-700"
              } ${
                item.toLowerCase() == "No Items Founded...".toLowerCase()
                  ? "pointer-events-none bg-transparent"
                  : ""
              }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200  text-[16px] font-semibold `}
            >
              {item}
            </li>
          )}
        </ViewportList>
      </section>

      {/* <List
        width={500} // Width of the list container
        height={300} // Total height of the list container
        itemCount={keywords.length} // Number of rows
        itemSize={50} // Height of each row
        ref={menuRef}
        direction="vertical"
        layout="vertical"
        // rowRenderer={rowRenderer}
      >
        {({ index, style, isScrolling, data }) => (
          <li
            key={index}
            id={`list-item-${index}`}
            style={style}
            ref={(el) => (refs.current[index] = el)}
            onClick={(ev) => {
              onItemClicked(ev, keywords[index], index, keywords.length);
            }}
            className={`${
              currentChoose == index
                ? "bg-blue-600 hover:bg-blue-600"
                : "bg-transparent hover:bg-gray-700"
            } ${
              keywords[index].toLowerCase() ==
              "No Items Founded...".toLowerCase()
                ? "pointer-events-none bg-transparent"
                : ""
            }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200  text-[16px] font-semibold `}
          >
            {keywords[index]}
          </li>
        )}
      </List> */}

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
    <ViewportList
      items={keywords}
      itemSize={50}
      ref={listRef}
      viewportRef={menuRef}
      axis="y"
      // itemMargin={8}
    >
      {(item, index) => (
        <li
          key={index}
          id={`list-item-${index}`}
          ref={(el) => (refs.current[index] = el)}
          onClick={(ev) => {
            onItemClicked(ev, item, index, keywords.length);
          }}
          className={`${
            currentChoose == index
              ? "bg-blue-600 hover:bg-blue-600"
              : "bg-transparent hover:bg-gray-700"
          } ${
            item.toLowerCase() == "No Items Founded...".toLowerCase()
              ? "pointer-events-none bg-transparent"
              : ""
          }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200  text-[16px] font-semibold `}
        >
          {item}
        </li>
      )}
    </ViewportList>
  </section>
    // <menu
    //   ref={menuRef}
    //   // style={{clipPath:'inset(2px)' left-0}}
    //   onScroll={(ev) => {
    //     console.log(ev.target.scrollHeight);
    //     console.log(ev.target.scrollTop - 300);
    //   }}
    //   className={` grid grid-cols-1   max-h-[300px] overflow-y-auto border-slate-600 rounded-lg   bg-slate-900  p-1 ${
    //     className ? className : "w-full"
    //   }`}
    // >
    //   {keywordsState.map((keyword, i) => (
    //     <li
    //       key={i}
    //       id={i}
    //       ref={currentChoose == i ? choosenRef : unChoosenRef}
    //       onClick={(ev) => {
    //         onItemClicked(ev, keyword, i, keywordsState.length);
    //       }}
    //       className={`${
    //         currentChoose == i
    //           ? "bg-blue-600 hover:bg-blue-600"
    //           : "bg-transparent hover:bg-gray-700"
    //       } ${
    //         keyword.toLowerCase() == "No Items Founded...".toLowerCase()
    //           ? "pointer-events-none bg-transparent"
    //           : ""
    //       }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200   text-[16px] font-semibold `}
    //     >
    //       {keyword}
    //     </li>
    //   ))}
    // </menu>
    // <List
    //   width={300} // Width of the list container
    //   height={300} // Total height of the list container
    //   itemCount={keywords.length} // Number of rows
    //   itemSize={50} // Height of each row
    //   ref={menuRef}

    //   // rowRenderer={rowRenderer}
    // >
    //   {({ index, style, isScrolling, data }) => (
    //     <li
    //       key={index}
    //       id={`list-item-${index}`}
    //       style={style}
    //       ref={(el) => (refs.current[index] = el)}
    //       onClick={(ev) => {
    //         onItemClicked(ev, keywords[index], index, keywords.length);
    //       }}
    //       className={`${
    //         currentChoose == index
    //           ? "bg-blue-600 hover:bg-blue-600"
    //           : "bg-transparent hover:bg-gray-700"
    //       } ${
    //         keywords[index].toLowerCase() == "No Items Founded...".toLowerCase()
    //           ? "pointer-events-none bg-transparent"
    //           : ""
    //       }  py-[12px] px-2 text-nowrap w-full  overflow-x-auto   transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-slate-600  text-slate-200  text-[16px] font-semibold `}
    //     >
    //       {keywords[index]}
    //     </li>
    //   )}
    // </List>
  );
};
