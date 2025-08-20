import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  createContext,
  memo,
} from "react";
import { Icons } from "../Icons/Icons";
import { FitTitle } from "../Editor/Protos/FitTitle";
import { refType } from "../../helpers/jsDocs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AnimatePresence, motion } from "framer-motion";
const AccordionContext = createContext();

export const AccordionProvider = ({ children }) => {
  const [openId, setOpenId] = useState(null);
  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      {children}
    </AccordionContext.Provider>
  );
};

export const DetailsNormal = memo(
  ({
    children,
    label,
    className = "",
    labelClass = "bg-slate-800",
    allowPopupLength = false,
    length,
    mode = "independent",
    id,
  }) => {
    const { openId, setOpenId } = useContext(AccordionContext) || {};
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);
    const [autoAnimate] = useAutoAnimate({ duration: 100 });
    const parentRef = useRef(refType);
    const childRef = useRef(refType);
    const toggle = () => {
      if (mode === "accordion") {
        setOpenId(isOpen ? null : id);
      } else {
        setIsOpen(!isOpen);
      }
    };

    useEffect(() => {
      if (mode === "accordion") {
        setIsOpen(openId === id);
      }
    }, [openId]);

    useEffect(() => {
      parentRef.current && autoAnimate(parentRef.current);
      childRef.current && autoAnimate(childRef.current);
    }, [parentRef , childRef]);

    useEffect(() => {
      if (!(parentRef.current && childRef.current)) return;
      if (isOpen) {
        // console.log(childRef.current.offsetHeight , childRef.current.scrollHeight);
        // parentRef.current.style.height = parentRef.current.offsetHeight +  childRef.current.offsetHeight + "px";
      } else {
        // parentRef.current.style.height = 'auto';
        // childRef.current.style.transition = `0.1s`;
        // childRef.current.style.opacity = 0;
      }
      // parentRef.current.style.overflow = "hidden";
      // childRef.current.style.transition = `0.3s`;
      // childRef.current.style.opacity = 0;
      // parentRef.current.style.height = parentRef.current.offsetHeight +  (childRef.current?.offsetHeight || 0) + "px";
      setTimeout(() => {
        // parentRef.current.style.overflow = "";
        // childRef.current.style.opacity = 1;
        // parentRef.current.style.height = parentRef.current.offsetHeight +  (childRef.current?.offsetHeight || 0) + "px";
        // parentRef.current.style.height = "";
      }, 200);
    }, [isOpen, parentRef, childRef]);

    // useEffect(() => {
    //   const el = contentRef.current;
    //   if (!el) return;

    //   if (isOpen) {
    //     el.style.display = "block";
    //     requestAnimationFrame(() => {
    //       el.style.maxHeight = el.scrollHeight + "px";
    //     });
    //   } else {
    //     el.style.maxHeight = el.scrollHeight + "px";
    //     requestAnimationFrame(() => {
    //       el.style.maxHeight = "0px";
    //     });
    //   }
    // }, [isOpen]);

    // Recalculate height when content changes
    // useEffect(() => {
    //   const observer = new MutationObserver(() => {
    //     if (isOpen) {
    //       const el = contentRef.current;
    //       if (el) el.style.maxHeight = el.scrollHeight + "px";
    //     }
    //   });
    //   const el = contentRef.current;
    //   if (el) {
    //     observer.observe(el, { childList: true, subtree: true });
    //   }
    //   return () => observer.disconnect();
    // }, [isOpen]);

    // useEffect(() => {
    //   const handleResize = () => {
    //     if (isOpen && contentRef.current) {
    //       contentRef.current.style.maxHeight =
    //         contentRef.current.scrollHeight + "px";
    //     }
    //   };
    //   window.addEventListener("resize", handleResize);
    //   return () => window.removeEventListener("resize", handleResize);
    // }, [isOpen]);

    return (
      <section
        ref={parentRef}
        style={{
          transition: ".1s",
          // overflow: "hidden",
          // overflow : !isOpen ? 'hidden' : ''
        }}
        className={`relative rounded-lg  will-change-contents ${
          className ? className : "p-1 bg-slate-800 w-full select-none"
        }`}
      >
        <div
          className={`cursor-pointer flex justify-between items-center text-slate-200 capitalize rounded-lg font-semibold text-[16px] p-1 ${labelClass}`}
          onClick={toggle}
        >
          <h1 className="custom-font-size text-slate-200 font-semibold">
            {label}
          </h1>
          {/* <FitTitle className="custom-font-size">{label}</FitTitle> */}
          <span
            className={`transition-transform duration-100 ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            <i className="rotate-[-90deg] block">{Icons.arrow("")}</i>
          </span>
        </div>
        <div
          // style={{ transition: "5s", transitionDelay: "0", opacity: 0 }}
          ref={childRef}
        >
          {isOpen ? children : null}
        </div>
        {/* {isOpen ? children : null} */}
        {/* (<AnimatePresence initial={false}  >
            {isOpen && <motion.div
              // key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" , }}
            >
              {isOpen && <div className="h-full" ref={contentRef}>{children}</div>}
            </motion.div>}
        </AnimatePresence>) */}

        {/* <div
          ref={contentRef}
          style={{
            maxHeight: "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <div
            className={`mt-2 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {children ? children : "Nothing Here..."}
          </div>
        </div> */}

        {allowPopupLength && !!length && (
          <p className="w-[20px] h-[20px] bg-blue-500 text-white flex justify-center items-center font-semibold rounded-full absolute right-[-5px] top-[-7px]">
            {length}
          </p>
        )}
      </section>

      // <details open={isOpen} onToggle={(ev)=>{
      //   // setIsOpen(ev.target.open)
      //   console.log(ev , ev.target.open);

      // }}>
      //   <summary onClick={()=>{
      //   toggle()

      //   }}>{label}</summary>
      //   {isOpen ? children : null}
      // </details>
    );
  }
);
