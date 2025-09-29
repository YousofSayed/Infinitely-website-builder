import React, { useEffect } from "react";

export const Loader = ({ width = 70, height = 70, zIndex }) => {
  useEffect(()=>{
    console.log('Loader is in');
    
  })
  return (
    <section
      style={{ zIndex }}
      id="loader"
      className="w-full h-full flex justify-center items-center bg-slate-900"
    >
      <div
        style={{
          width,
          height,
        }}
        className={` rounded-full border-2 border-blue-600 border-r-transparent animate-spin`}
      ></div>
    </section>
  );
};
