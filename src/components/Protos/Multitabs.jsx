import { generateBeautifulHexColor } from "@/helpers/functions";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, { useState } from "react";

/**
 *
 * @param {{tabs : { title: React.JSX, content: React.JSX }[] , style:CSSStyleDeclaration , preventViewScroll:boolean , onTabClick : (ev:MouseEvent , index:number)=>void}} param0
 * @returns
 */
export const MultiTab = ({ 
  tabs = [{ title: "", content: "" }],
  style,
  preventViewScroll = false,
  onTabClick = (ev, i) => { },
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [animatRef] = useAutoAnimate();

  return (
    <section
      ref={animatRef}
      style={style}
      className=" flex overflow-hidden  flex-col bg-surface-secondary rounded-lg h-full  text-text-primary border-[1.5px] border-border-default "
    >
      <nav
        style={
          {
            // background:generateBeautifulHexColor(true , .1),
          }
        }
        className="group flex w-full   border-b backdrop-blur-md border-slate-800 rounded-tl-lg rounded-tr-lg overflow-hidden"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(ev) => {
              onTabClick(ev, index);
              setActiveTab(index);
            }}
            style={{
              width : tabs.length === 1 ? "fit-content" :  `calc(100% / ${tabs.length})`
            }}
            className={` px-2 py-3 text-center backdrop-blur-md  border-r-2 capitalize border-r-slate-600 font-semibold text-text-primary   hover:text-text-primary  transition duration-300 ${
              activeTab === index
              ? "  bg-brand-primary font-bold "
              : "text-slate-300 hover:bg-slate-700"
              }`}
          >
            {tab.title}
          </button>
        ))}
      </nav>
      <div
        key={activeTab}
        className={`h-full ${preventViewScroll ? "overflow-hidden" : " overflow-y-auto"
          } p-1`}
      >
        {tabs[activeTab].content}
      </div>
    </section>
  );
};
