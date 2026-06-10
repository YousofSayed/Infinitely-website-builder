import React, { useEffect } from "react";

export const Loader = ({ width = 70, height = 70, zIndex , loaderClassName}) => {
  useEffect(()=>{
    console.log('Loader is in');
    
  })
  return (
    <section
      style={{ zIndex }}
      id="loader"
      className="w-full h-full flex justify-center items-center bg-transparent"
    >
      <div
        style={{
          width,
          height,
          borderRightColor:"transparent"
        }}
        className={`${loaderClassName} rounded-full border-2 border-blue-600 border-r-transparent animate-spin`}
      ></div>
    </section>
  );
};
