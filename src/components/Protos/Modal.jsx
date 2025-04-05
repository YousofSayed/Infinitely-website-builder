import React, { useState } from 'react'
import { Icons } from '../Icons/Icons';

export const Modal = ({
    title = '',
    children ,
    onBlurryClick = (ev , setShowModalController)=>{},
    onCloseClick = (ev , setShowModalController)=>{},
}) => {
    const [showModal , setShowModal ] = useState(false);

    const setShowModalController = (booleanValue = false)=>{
        setShowModal(booleanValue)
    }

  return (
      <section
          onClick={
            (ev)=>{
                onBlurryClick(ev , setShowModalController)
            }
          }
          className={`fixed  z-[55] bg-blur right-0 left-0 top-0 w-full h-full flex justify-center items-center`}
        >
          <main
            onClick={(ev) => {
              ev.stopPropagation();
              document.body.click();
            }}
            className="w-[65%] z-[55] rounded-lg flex flex-col justify-between bg-slate-900"
          >
            <header className="w-full flex items-center rounded-lg rounded-br-none  h-[60px] border-l-[5px] border-l-blue-600 border-b-2 bg-slate-900 border-b-slate-600">
              <section className="w-full flex justify-between  items-center p-2">
                <section className="text-slate-300 capitalize select-none font-semibold">
                  {title}
                </section>
                <button
                  onClick={(ev) => {
                    addClickClass(ev.currentTarget, "click");
                    onCloseClick(ev , setShowModalController);
                  }}
                  className="cursor-pointer z-50 flex items-center  justify-center w-[27px] h-[27px] bg-blue-600 rounded-full"
                >
                  {Icons.close("white", 2, "blue")}
                </button>
              </section>
            </header>
    
            <section className="h-[calc(100%-70px)] p-2 rounded-bl-lg rounded-br-lg bg-slate-900">
              {children}
              {/* <RestAPIModels/> */}
            </section>
          </main>
        </section>
  )
}
