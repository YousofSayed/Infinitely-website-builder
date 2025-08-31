import React, { useState } from "react";
import { generateBeautifulHexColor } from "../../helpers/functions";
import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 *
 * @param {{tabs : { title: React.JSX, content: React.JSX }[] , style:CSSStyleDeclaration , preventViewScroll:boolean , onTabClick : (ev:MouseEvent , index:number)=>void}} param0
 * @returns
 */
export const MultiTab = ({
  tabs = [{ title: "", content: "" }],
  style,
  preventViewScroll = false,
  onTabClick = (ev, i) => {},
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [animatRef] = useAutoAnimate();

  return (
    <section
      ref={animatRef}
      style={style}
      className=" flex overflow-hidden  flex-col bg-slate-900 rounded-lg h-full  text-slate-200 border-[1.5px] border-slate-600 "
    >
      <nav
        style={
          {
            // background:generateBeautifulHexColor(true , .1),
          }
        }
        className="group flex  h-[50px] border-b backdrop-blur-md border-slate-800 rounded-tl-lg rounded-tr-lg overflow-hidden"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(ev) => {
              onTabClick(ev, index);
              setActiveTab(index);
            }}
            className={`w-1/4 py-3 text-center backdrop-blur-md  border-r-2 capitalize border-r-slate-600 font-semibold text-slate-200 hover:bg-blue-700  hover:text-slate-200  transition duration-300 ${
              activeTab === index
                ? "  bg-blue-600 font-bold "
                : "text-slate-400"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </nav>
      <div
        key={activeTab}
        className={`h-full ${
          preventViewScroll ? "overflow-hidden" : " overflow-y-auto"
        } p-1`}
      >
        {tabs[activeTab].content}
      </div>
    </section>
  );
};
