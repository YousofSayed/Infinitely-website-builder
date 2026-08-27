import { refType } from "@/helpers/jsDocs";
import { Loader } from "@/components/Loader";
import { VirtosuoVerticelWrapper } from "@/components/Protos/VirtosuoVerticelWrapper";
import { FitTitle } from "@/components/Editor/Protos/FitTitle";
import { HighlightContentEditable } from "@/components/Editor/Protos/HighlightContentEditable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Virtuoso } from "react-virtuoso";

/**
 *
 * @param {{keywords: (string | {value: string, icon?: import('react').ReactNode, title?: string})[] ,  onScrollEnd?: () => void, className:string, placeholder:string ,isDynamic:boolean , innerStt:string ,onMenuScroll:(ev:UIEvent)=>void , onKeyDown : (ev:KeyboardEvent)=>void, onInput:(ev:InputEvent)=>void,  onInputClick:(ev:MouseEvent)=>void , dynamicInputClassName:string ,choosenKeyword:any, currentChoose:number, menuRef : {[current:string] :HTMLElement} , editorRef : {current : HTMLElement | null} , onItemClicked:(ev:MouseEvent , keyword: any ,i:number , keywordsLength:number)=>void}} param0
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
  isFetchingNext = false,
  innerStt = "",
  onInput = (ev) => {},
  onKeyDown = (ev) => {},
  onInputClick = (ev) => {},
  onMenuScroll = (ev) => {},
  onScrollEnd = () => {},
  placeholder = "",
  dynamicInputClassName = "",
  onItemClicked,
  i,
}) => {
  const getStr = (item) =>
    typeof item === "string" ? item : item?.value || "";
  const getIcon = (item) => (typeof item === "string" ? null : item?.icon);
  const getTitle = (item) =>
    typeof item === "string" ? item : item?.title || item?.value || "";

  const refs = useRef([]);
  const listRef = useRef();
  const [animatRef] = useAutoAnimate();

  const safeKeywords = useMemo(
    () => keywords.filter((k) => getStr(k) !== "__inf_loading__"),
    [keywords],
  );
  const prevChooseRef = useRef(currentChoose);

  useEffect(() => {
    // Always keep the ref updated with the latest keyword object/string
    choosenKeyword.current = safeKeywords[currentChoose ?? 0];

    // ✅ FIX: ONLY trigger a scroll if the selected index actually changed
    if (prevChooseRef.current !== currentChoose) {
      if (listRef.current && safeKeywords.length > 0) {
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollToIndex({
              index: currentChoose,
              align: "auto", // 'auto' prevents jumping if item is already visible
              behavior: "auto",
            });
          }
        });
      }
      prevChooseRef.current = currentChoose;
    }
  }, [currentChoose, safeKeywords]);

  // Optional: Scroll into view exactly once when the menu first opens
  useEffect(() => {
    if (isOpen && listRef.current && safeKeywords.length > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: currentChoose,
          align: "auto",
          behavior: "auto",
        });
      });
    }
  }, [isOpen]);

  if (keywords.length === 1 && getStr(keywords[0]) === "__inf_loading__") {
    return (
      <section className="w-full h-full flex items-center justify-center min-h-[100px]">
        <Loader loaderClassName={`h-[30px!important] w-[30px!important]`} />
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

  const CustomScroller = React.forwardRef(({ style, ...props }, ref) => (
    <div {...props} ref={ref} style={{ ...style, paddingBottom: "140px" }} />
  ));

  return (
    <section className="w-full h-full overflow-x-auto  " ref={menuRef}>
      <Virtuoso
        ref={listRef}
        initialTopMostItemIndex={currentChoose < 0 ? 0 : currentChoose}
        totalCount={safeKeywords.length}
        // ✅ Pre-render items above and below viewport to prevent measurement jumps
        // increaseViewportBy={{ top: 300, bottom: 1300 }}
        style={{ gap: "unset", marginBottom: "unset" }}
        // className="hideScrollBar"
        endReached={(index) => {
          onScrollEnd?.();
        }}
        components={{
          Item: (props) => (
            <div className="flex flex-col my-2 px-2" {...props}></div>
          ),

          // Footer: (props) => <div className="flex flex-col my-2 px-2 bg-red-700" {...props}></div>,
          // List: (props) => <div className="pb-2" {...props}></div>,
          // Scroller: CustomScroller
        }}
        itemContent={(index) => {
          const item = safeKeywords[index];
          return (
            <>
              <li
                key={index}
                id={`list-item-${index}`}
                ref={(el) => (refs.current[index] = el)}
                onClick={(ev) => {
                  onItemClicked(ev, item, index, keywords.length);
                }}
                className={`flex items-center text-nowrap w-full overflow-x-auto transition-all cursor-pointer text-text-primary text-[16px] font-semibold`}
              >
                <h1
                  className={`
                  font-semibold w-full p-2
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  text-ellipsis
                  transition-all
                  capitalize
                  ${
                    currentChoose == index
                      ? "bg-brand-primary "
                      : "bg-surface-tertiary hover:bg-brand-primary"
                  }`}
                >
                  {getIcon(item)}
                  <span className="truncate">{getTitle(item)}</span>
                </h1>
              </li>
              {index + 1 == safeKeywords.length && (
                <div
                  className={`${isFetchingNext ? "h-4" : "h-2"} w-full`}
                ></div>
              )}
              {isFetchingNext && index + 1 == safeKeywords.length && (
                <Loader height={30} width={30} />
              )}
              {isFetchingNext && index + 1 == safeKeywords.length && (
                <div className="h-4 w-full"></div>
              )}
            </>
          );
        }}
      />
    </section>
  );
};

// import { refType } from "@/helpers/jsDocs";
// import { Loader } from "@/components/Loader";
// import { VirtosuoVerticelWrapper } from "@/components/Protos/VirtosuoVerticelWrapper";
// import { FitTitle } from "@/components/Editor/Protos/FitTitle";
// import { HighlightContentEditable } from "@/components/Editor/Protos/HighlightContentEditable";
// import { useAutoAnimate } from "@formkit/auto-animate/react";
// import React, {
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
//   useMemo,
// } from "react";
// import { Virtuoso } from "react-virtuoso";

// export const Menu = ({
//   keywords = [],
//   className = "",
//   choosenKeyword = "",
//   currentChoose = 0,
//   menuRef,
//   editorRef,
//   isOpen = false,
//   isDynamic = false,
//   isFetchingNext = false,
//   innerStt = "",
//   onInput = (ev) => {},
//   onKeyDown = (ev) => {},
//   onInputClick = (ev) => {},
//   onMenuScroll = (ev) => {},
//   onScrollEnd = () => {},
//   placeholder = "",
//   dynamicInputClassName = "",
//   onItemClicked,
//   i,
// }) => {
//   const getStr = (item) =>
//     typeof item === "string" ? item : item?.value || "";
//   const getIcon = (item) => (typeof item === "string" ? null : item?.icon);
//   const getTitle = (item) =>
//     typeof item === "string" ? item : item?.title || item?.value || "";

//   const refs = useRef([]);
//   const listRef = useRef();
//   const [animatRef] = useAutoAnimate();

//   const safeKeywords = useMemo(
//     () => keywords.filter((k) => getStr(k) !== "__inf_loading__"),
//     [keywords],
//   );

//   // FIX 1: Prevent negative indices from breaking Virtuoso
//   const safeCurrentChoose = Math.max(0, currentChoose);
//   const prevChooseRef = useRef(safeCurrentChoose);

//   useEffect(() => {
//     // Always keep the ref updated with the latest keyword object/string
//     choosenKeyword.current = safeKeywords[safeCurrentChoose];

//     // ONLY trigger a scroll if the selected index actually changed
//     if (prevChooseRef.current !== safeCurrentChoose) {
//       if (listRef.current && safeKeywords.length > 0) {
//         const raf = requestAnimationFrame(() => {
//           if (listRef.current) {
//             listRef.current.scrollToIndex({
//               index: safeCurrentChoose,
//               align: "auto",
//               behavior: "auto",
//             });
//           }
//         });

//         prevChooseRef.current = safeCurrentChoose;
//         return () => cancelAnimationFrame(raf);
//       }
//     }
//   }, [safeCurrentChoose, safeKeywords]);

//   if (keywords.length === 1 && getStr(keywords[0]) === "__inf_loading__") {
//     return (
//       <section className="w-full h-full flex items-center justify-center min-h-[100px]">
//         <Loader loaderClassName={`h-[30px!important] w-[30px!important]`} />
//       </section>
//     );
//   }

//   if (safeKeywords.length === 0) {
//     return (
//       <section className="w-full h-full flex items-center justify-center min-h-[50px] p-4 text-text-primary opacity-60 font-semibold">
//         No items here
//       </section>
//     );
//   }

//   const CustomScroller = React.forwardRef(({ style, ...props }, ref) => (
//     <div {...props} ref={ref} style={{ ...style, paddingBottom: "140px" }} />
//   ));

//   return isDynamic ? (
//     <section
//       ref={animatRef}
//       className={`w-full shadow-lg flex gap-2 shadow-gray-950 border-[1px] max-h-[300px] border-border-default rounded-lg bg-surface-secondary overflow-hidden ${className ? className : "w-full"}`}
//     >
//       {/* FIX 4: Changed overflow-y-auto to overflow-hidden. Virtuoso MUST be the only scroller. */}
//       <section className="w-[500px] h-[300px] overflow-hidden" ref={menuRef}>
//         <Virtuoso
//           ref={listRef}
//           totalCount={safeKeywords.length}
//           increaseViewportBy={{ top: 300, bottom: 300 }}
//           style={{ height: "100%", width: "100%" }}
//           components={{
//             Scroller: CustomScroller,
//           }}
//           itemContent={(index) => {
//             const item = safeKeywords[index];
//             return (
//               <li
//                 key={index}
//                 id={`list-item-${index}`}
//                 ref={(el) => (refs.current[index] = el)}
//                 onClick={(ev) => {
//                   onItemClicked(ev, item, index, safeKeywords.length);
//                 }}
//                 className={`${
//                   currentChoose == index
//                     ? "bg-brand-primary hover:bg-brand-primary"
//                     : "bg-transparent hover:bg-gray-700"
//                 } ${
//                   getStr(item).toLowerCase() ==
//                   "No Items Founded...".toLowerCase()
//                     ? "pointer-events-none bg-transparent"
//                     : ""
//                 } py-[12px] px-2 text-nowrap w-full overflow-x-auto transition-all cursor-pointer [&:not(:last-child)]:border-b-[1px] border-border-default text-text-primary text-[16px] font-semibold flex items-center gap-2`}
//               >
//                 {getIcon(item)}
//                 <span className="truncate">{getTitle(item)}</span>
//               </li>
//             );
//           }}
//         />
//       </section>

//       <HighlightContentEditable
//         editorRef={editorRef}
//         innerStt={innerStt}
//         onInput={onInput}
//         onKeyDown={onKeyDown}
//         onClick={onInputClick}
//         placeholder={placeholder}
//         className={dynamicInputClassName}
//       />
//     </section>
//   ) : (
//     // FIX 5: Changed overflow-x-auto to overflow-hidden
//     <section className="w-full h-full overflow-hidden" ref={menuRef}>
//       <Virtuoso
//         ref={listRef}
//         initialTopMostItemIndex={safeCurrentChoose}
//         totalCount={safeKeywords.length}
//         // FIX 6: Uncommented! Virtuoso needs this to calculate scroll heights correctly
//         increaseViewportBy={{ top: 600, bottom: 600 }}
//         style={{
//           height: "100%",
//           width: "100%",
//           gap: "unset",
//           marginBottom: "unset",
//         }}
//         endReached={(index) => {
//           onScrollEnd?.();
//         }}
//         components={{
//           Item: (props) => (
//             <div className="flex flex-col my-2 px-2" {...props}></div>
//           ),
//         }}
//         itemContent={(index) => {
//           const item = safeKeywords[index];
//           return (
//             <>
//               <li
//                 key={index}
//                 id={`list-item-${index}`}
//                 ref={(el) => (refs.current[index] = el)}
//                 onClick={(ev) => {
//                   onItemClicked(ev, item, index, keywords.length);
//                 }}
//                 className={`flex items-center text-nowrap w-full overflow-x-auto transition-all cursor-pointer text-text-primary text-[16px] font-semibold`}
//               >
//                 <h1
//                   className={`
//                   font-semibold w-full p-2
//                   rounded-lg
//                   flex
//                   items-center
//                   justify-center
//                   gap-2
//                   overflow-hidden
//                   text-ellipsis
//                   transition-all
//                   capitalize
//                   ${
//                     currentChoose == index
//                       ? "bg-brand-primary "
//                       : "bg-surface-tertiary hover:bg-brand-primary"
//                   }`}
//                 >
//                   {getIcon(item)}
//                   <span className="truncate">{getTitle(item)}</span>
//                 </h1>
//               </li>
//               {index + 1 == safeKeywords.length && (
//                 <div
//                   className={`${isFetchingNext ? "h-4" : "h-2"} w-full`}
//                 ></div>
//               )}
//               {isFetchingNext && index + 1 == safeKeywords.length && (
//                 <Loader height={30} width={30} />
//               )}
//               {isFetchingNext && index + 1 == safeKeywords.length && (
//                 <div className="h-4 w-full"></div>
//               )}
//             </>
//           );
//         }}
//       />
//     </section>
//   );
// };
