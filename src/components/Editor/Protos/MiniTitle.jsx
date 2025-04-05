import React from 'react'

export const MiniTitle = ({ children , className}) => {
    return (
      <section className={`bg-blue-700 p-1 capitalize text-[16px] text-center rounded-lg  ${className ? className : 'w-full'}`}>
        <p className="text-white font-bold">{children}</p>
      </section>
    );
  };
  