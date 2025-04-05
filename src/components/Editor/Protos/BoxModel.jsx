import React from "react";

export const BoxModel = () => {
  return (
    <section className="flex justify-center ">
      <div className="relative min-w-[100%] max-w-[300px] min-h-[250px] max-h-[300px] flex justify-center items-center bg-slate-800">
        <BorderLabel borderColor={"slate-400"} label={"margin"} />
        <Dimantions top={0} right={0} bottom={0} left={0} />
        <div className="relative w-[calc(100%-60px)] h-[calc(100%-60px)] flex justify-center items-center bg-slate-700">
          <BorderLabel borderColor={"slate-400"} label={"padding"} />
          <Dimantions top={0} right={0} bottom={0} left={0} />
          <div
            className={`relative w-[calc(100%-60px)] h-[calc(100%-60px)] flex justify-center items-center bg-slate-600`}
          >
            <BorderLabel borderColor={"slate-400"} label={"border"} />
            <Dimantions top={0} right={0} bottom={0} left={0} />
            <div className="w-[80px] h-[35px] text-slate-200 flex justify-center items-center border-2 border-dotted  bg-slate-500">
              0 X 0
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
