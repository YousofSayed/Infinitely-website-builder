import { accorddingState } from "@/helpers/atoms";
import { Icons } from "@/components/Icons/Icons";
import { P } from "@/components/Protos/P";
import { uniqueId } from "lodash";
import React, { useRef, useState, useTransition } from "react";
import { useRecoilState } from "recoil";

export const Details = ({ children, label, ref, id , setIsShow = (_)=>{} , className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [accorddingId , setAccorddingId] = useRecoilState(accorddingState);
  const arrowIcon = useRef();
  const uuid = useRef(uniqueId());

  return (
    <section
      ref={ref}
      className={`bg-surface-main w-full   transition-[padding] rounded-lg select-none ${className}`}
      onContextMenu={(ev)=>{ev.preventDefault()}}
    >  
      <div
        onClick={(ev) => {
          // setShowDetails(!showDetails);
          console.log('bool value' , Boolean(uuid.current == accorddingId ? false : true));
          
          setIsShow(Boolean(uuid.current == accorddingId));
          // arrowIcon.current.classList.toggle("rotate-180");
          setAccorddingId(uuid.current == accorddingId ? 0 : uuid.current)
          ev.currentTarget.parentNode.scrollIntoView({behavior:'smooth' , block:'center'})
          
        }}
        className={`flex cursor-pointer items-center border-l-[5px] border-l-blue-600  justify-between p-2 rounded-lg text-slate-300 text-lg font-bold ${
          uuid.current == accorddingId ? "bg-surface-tertiary " : "bg-surface-tertiary"
        }`}
      >
        <p className="capitalize text-[15px]">{label} </p>
        <span ref={arrowIcon} className={`group transition-all cursor-pointer ${uuid.current == accorddingId && 'rotate-180'}`}>
          {Icons.arrow(undefined , 3)}
        </span>
      </div>
  
          {/* {uuid.current == accorddingId && children} */}
          {uuid.current == accorddingId && children}
      {/* <section id={id} className={containerClassName + `${showDetails ? ' ' : ' hidden '} mt-2  `}>{ children}</section> */}
    </section>
  );
};
