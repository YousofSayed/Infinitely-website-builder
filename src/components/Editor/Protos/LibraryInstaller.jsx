import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ToastMsgInfo } from "./ToastMsgInfo";
import { JSLibrariesType } from "../../../helpers/jsDocs";
import { JsLibrary } from "./JsLibrary";
import { Loader } from "../../Loader";
import { MultiTab } from "../../Protos/Multitabs";
import { ViewportList } from "react-viewport-list";

export const LibraryInstaller = () => {
  const [libraries, setLibraries] = useState(JSLibrariesType);
  const [showLoader, setShowLoader] = useState(false);
  const timeout = useRef();
  const searchOnlibrary = async (libraryName = "") => {
    try {
      if (!libraryName) {
        setShowLoader(false);
        setLibraries([]);
        return;
      }
      setShowLoader(true);
      const searchEndPoint = `https://api.cdnjs.com/libraries?search=${libraryName}&fields=filename,description,version,github`;
      const response = (await fetch(searchEndPoint)).json();
      /**
       * @type {import('../../../helpers/types').JSLibrary[]}
       */
      const results = await (await response).results;

      setLibraries(
        results.filter(
          (lib) =>
            lib?.latest &&
            (lib.latest.endsWith("js") || lib.latest.endsWith("css"))
        )
      );
      setShowLoader(false);
    } catch (error) {
      toast.error(<ToastMsgInfo msg={"Faild To Get Library"} />);
      setShowLoader(false);
      setLibraries([])
      throw new Error(`From Library Installer : ${error}`);
    }
  };

  const onInput = (value) => {
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      await searchOnlibrary(value);
    }, 700);
  };

  return (
    <section className="  bg-gradient-to-b from-slate-900 mb-3 to-slate-950 text-slate-200 p-2 rounded-lg">
      {/* <header className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-600">
          JavaScript Library Installer
        </h1>
      </header> */}

      <main className="flex flex-col gap-2">
        <div className=" sticky top-0 left-0">
          <input
            id="search"
            type="text"
            placeholder="Search by library name..."
            className="w-full  p-4 rounded-lg bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none  font-semibold placeholder-slate-500"
            onInput={(ev) => {
              onInput(ev.target.value);
            }}
          />
          <div className="absolute  inset-y-0 right-3 flex items-center gap-2">
            {showLoader && <Loader width={15} height={15} />}
            <svg
              width={27.5}
              height={27.5}
              className=" text-slate-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m-6.65 1.35a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
              />
            </svg>
          </div>
        </div>

        <section className="h-full overflow-auto  flex flex-col gap-2">
         <ViewportList items={libraries} axis="y" >
         {(lib , i)=>(<JsLibrary key={i} library={lib} />)}
         </ViewportList>
        </section>
      </main>
    </section>
  );
};
