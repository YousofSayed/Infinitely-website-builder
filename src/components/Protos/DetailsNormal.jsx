import { refType } from "@/helpers/jsDocs";
import { Icons } from "@/components/Icons/Icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  createContext,
  memo,
} from "react";

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
    labelClass = "bg-surface-tertiary",
    allowPopupLength = false,
    length,
    mode = "independent",
    notify,
    notifyBg = "bg-brand-primary",
    onSwitch = (state) => {},
    id,
  }) => {
    const { openId, setOpenId } = useContext(AccordionContext) || {};
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);
    const [autoAnimate] = useAutoAnimate({ duration: 200 });
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
      // childRef.current && autoAnimate(childRef.current);
    }, [parentRef, childRef]);

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

    useEffect(() => {
      onSwitch(isOpen);
      if (isOpen && parentRef.current) {
        console.log("isOpen : ", isOpen);

        parentRef.current.scrollIntoView({
          behavior: "smooth",
          // block: "start",
          // inline: "start",
        });
      }
    }, [isOpen]);

    return (
      <section
        ref={parentRef}
        style={{
          transition: ".1s",
          willChange: "transform , opacity , height",
          // overflow: "hidden",
          // overflow : !isOpen ? 'hidden' : ''
        }}
        className={`relative rounded-lg  will-change-contents ${
          className ? className : "p-1 bg-surface-tertiary w-full select-none"
        }`}
      >
        <div
          className={`cursor-pointer flex justify-between items-center text-text-primary capitalize rounded-lg font-semibold text-[16px] p-1 ${labelClass}`}
          onClick={toggle}
        >
          <h1 className="custom-font-size text-text-primary font-semibold flex gap-2 items-center  justify-between">
            <span className="custom-font-size">{label}</span>
            {notify && (
              <span
                className={`w-[7.5px] h-[7.5px] block animate-pulse  ${notifyBg} rounded-full`}
              ></span>
            )}
          </h1>
          {/* <FitTitle className="custom-font-size">{label}</FitTitle> */}
          <div className="flex items-center gap-2">
            {/* {notify && (
              <span
                className={`w-[7.5px] h-[7.5px] block animate-pulse  ${notifyBg} rounded-full`}
              ></span>
            )} */}
            <span
              className={`transition-transform duration-100 ${
                isOpen ? "rotate-90" : ""
              }`}
            >
              <i className="rotate-[-90deg] block">{Icons.arrow("")}</i>
            </span>
          </div>
        </div>
        {isOpen ? (
          <div
            // style={{ transition: "5s", transitionDelay: "0", opacity: 0 }}
            ref={childRef}
            className="animate-to-go"
          >
            {children}
          </div>
        ) : null}
        {/* <div
          // style={{ transition: "5s", transitionDelay: "0", opacity: 0 }}
          ref={childRef}
        >
          {isOpen ? children : null}
        </div> */}

        {allowPopupLength && !!length && (
          <p className="w-[20px] h-[20px] bg-blue-500  text-white flex justify-center items-center font-semibold rounded-full absolute right-[-3px] top-[-7px]">
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
  },
);
