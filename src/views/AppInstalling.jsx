import React, { useEffect, useRef, useState } from "react";
import { Loader } from "../components/Loader";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const words = [
  "Preparing files",
  "Installing app",
  "Setting things up",
  "Almost ready",
  "Finalizing setup",
  "Hang tight",
  "Just a moment",
  "Please wait",
  "Loading magic",
  "Almost there",
];

export const AppInstalling = () => {
  const [state, setState] = useState(words[0]);
  const [animatedRef] = useAutoAnimate({duration:500});
  const [index, setIndex] = useState(0);
  const timeout = useRef();

  useEffect(() => {
    timeout.current = setTimeout(() => {
      const newVal = index + 1;
      const finalVal = newVal >= words.length ? 0 : newVal;
      setIndex(finalVal);
      setState(words[finalVal]);
    }, 5000);

    return () => {
      clearTimeout(timeout.current);
    };
  }, [index]);

  return (
    <section className="fixed h-full w-full bg-slate-900 flex justify-center items-center">
      <dialog
        ref={animatedRef}
        className="p-2 overflow-hidden rounded-lg bg-slate-800 flex justify-center items-center gap-3 w-[300px] sm:w-[450px]"
      >
        <h1
          key={state}
          className="text-slate-200 font-bold text-4xl flex-shrink-0  animate-pulse capitalize"
        >
          {state}
        </h1>
        {/* <section className="flex-grow-0">
          <Loader width={30} height={30} />
        </section> */}
      </dialog>
    </section>
  );
};
