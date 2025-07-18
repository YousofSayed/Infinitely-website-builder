import React from "react";
import { Icons } from "react-toastify";
// import { Icons } from "../../Icons/Icons";

export const ToastMsgInfo = ({ msg, onClick = (ev) => {} }) => {
  return (
    <section className="flex justify-between px-2 gap-2 w-full items-center">
      <p className="text-slate-200   text-sm  font-medium">{msg}</p>
      {/* <button className="cursor-pointer w-fit" onClick={onClick}>
        {Icons.info({ theme:'colored' , width:'18px' , height:18 })}
      </button> */}
    </section>
  );
};
