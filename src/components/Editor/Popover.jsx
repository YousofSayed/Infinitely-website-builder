import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  popoverRefState,
  popoverState,
  showDragLayerState,
} from "../../helpers/atoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { uniqueID } from "../../helpers/cocktail";
import { currentRefType, refType } from "../../helpers/jsDocs";
import Portal from "./Portal";
import { Icons } from "../Icons/Icons";
import interact from "interactjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const Popover = ({
  targetRef = currentRefType,
  isTextarea = false,
  isCode = false,
  language = "",
  width = 0,
  height = 0,
  isOpen = false,
  setIsOpen = (value = false) => {},
  children,
}) => {
  console.log("widthhhh : ", width);
  const isDrag = useRef(false);
  /**
   * @type {{current:HTMLElement}}
   */
  const popoverRef = useRef();
  /**
   * @type {{current:HTMLElement}}
   */
  const dragHandleRef = useRef();
  const [isResize, setIsResize] = useState(false);
  const [autoAnimate] = useAutoAnimate();
  const [showDragLayer, setShowDragLayer] = useRecoilState(showDragLayerState);
  const popoverResizeDataRef = useRef({
    width,
    height,
    left: 0,
    top: 0,
  });
  const [popoverData, setPopoverData] = useState({
    isOpen: isOpen,
    parentWidth: 0,
    parentHeight: 0,
    width: width,
    height: height,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    realRight: 0,
  });

  useLayoutEffect(() => {
    popoverRef.current && autoAnimate(popoverRef.current);
  }, [popoverRef]),
    useLayoutEffect(() => {
      console.log(
        "popoverdata : ",
        popoverData,
        window.innerWidth,
        popoverData.left + popoverData.width - window.innerWidth
      );

      setPopoverData({
        ...popoverData,
        isOpen: isOpen,
      });
    }, [isOpen]);

  useLayoutEffect(() => {
    const closeMenuCallback = () => {
      setIsOpen(false);
    };
    document.addEventListener("click", closeMenuCallback);
    window.addEventListener("resize", calcWhereAmI);
    return () => {
      window.removeEventListener("resize", calcWhereAmI);
      document.removeEventListener("click", closeMenuCallback);
    };
  }, []);

  useLayoutEffect(() => {
    if (
      !popoverRef ||
      !popoverRef.current ||
      !dragHandleRef ||
      !dragHandleRef.current
    )
      return;

    window.dragMoveListener = function (event) {
      var target = event.target;
      var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

      target.style.transform = "translate(" + x + "px, " + y + "px)";
      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    };

    interact(popoverRef.current).resizable({
      // resize from all edges and corners
      edges: { bottom: true, top: true, left: true, right: true },
      // left: true, right: true,
      // margin: 155,
      listeners: {
        move(event) {
          var target = event.target;
          var x = parseFloat(target.getAttribute("data-x")) || 0;
          var y = parseFloat(target.getAttribute("data-y")) || 0;

          // update the element's style
          target.style.width = event.rect.width + "px";
          target.style.height = event.rect.height + "px";

          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.transform = "translate(" + x + "px," + y + "px)";

          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
          setIsResize(true);
          setShowDragLayer(true);
          // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
        },
        end() {
          console.log("up");
          setIsResize(false);
          setShowDragLayer(false);
        },
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: "parent",
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 },
        }),
      ],

      inertia: true,
    });

    interact(dragHandleRef.current).draggable({
      listeners: {
        move: function (event) {
          var target = popoverRef.current;
          var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
          var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

          target.style.transform = "translate(" + x + "px, " + y + "px)";
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        },
      },
      inertia: true,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
      ],
    });
    // const resizeObserver = new ResizeObserver((entries) => {
    //   console.log("draaaaaaaaag : ", isDrag);

    //   entries.forEach((entry) => {
    //     if (isDrag.current) return;
    //     const { width, height } = entry.contentRect;
    //     console.log("resize : ", width, height);
    //     popoverResizeDataRef.current = {
    //       ...popoverResizeDataRef.current,
    //       width,
    //       height,
    //     };
    //   });
    // });

    // resizeObserver.observe(popoverRef.current);

    // /**
    //  *
    //  * @param {MouseEvent} ev
    //  */
    // const handleDrag = (ev) => {
    //   ev.stopPropagation();
    //   ev.preventDefault();
    //   // console.log("mooooooooooove", isDrag);
    //   if (!isDrag.current) return;

    //   const { clientX, clientY } = ev;
    //   // popoverRef.current.style.width =
    //   //   popoverResizeDataRef.current.width + "px";
    //   // popoverRef.current.style.height =
    //   //   popoverResizeDataRef.current.height + "px";
    //   // popoverRef.current.style.left = clientX - popoverData.width + 15 + "px";
    //   // popoverRef.current.style.top = clientY - 15 + "px";

    //   popoverResizeDataRef.current = {
    //     ...popoverResizeDataRef.current,
    //     left: clientX - popoverData.width + 15,
    //     top: clientY - 15,
    //   };
    //   setPopoverData({
    //     ...popoverData,
    //     width: popoverResizeDataRef.current.width,
    //     height: popoverResizeDataRef.current.height,
    //     left: ev.clientX + 15,
    //     top: ev.clientY - 15,
    //   });
    // };
    // window.addEventListener("mousemove", handleDrag);
    // const closeDragMode = () => {
    //   isDrag.current = false;
    //   setShowDragLayer(false);
    //   // setPopoverData({
    //   //   ...popoverData,
    //   //   width: popoverResizeDataRef.current.width,
    //   //   height: popoverResizeDataRef.current.height,
    //   //   left: popoverResizeDataRef.current.left,
    //   //   top: popoverResizeDataRef.current.top,
    //   // });
    // };
    // window.addEventListener("mouseup", closeDragMode);
    // return () => {
    //   popoverRef.current && resizeObserver.unobserve(popoverRef.current);
    //   resizeObserver.disconnect();
    //   window.removeEventListener("mousemove", handleDrag);
    //   window.removeEventListener("mouseup", closeDragMode);
    // };
  }, [popoverRef]);

  useLayoutEffect(() => {
    if (!targetRef || !targetRef.current) return;
    calcWhereAmI();

    const scrolledElement = getParentScroll(targetRef.current);
    if (!scrolledElement) return;
    const inObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target == targetRef.current && !entry.isIntersecting) {
          setIsOpen(false);
        }
      });
    });
    inObserver.observe(targetRef.current);

    /**
     *
     * @param {UIEvent} ev
     */
    const cb = (ev) => {
      calcWhereAmI();
    };
    scrolledElement.addEventListener("scroll", cb);
    return () => {
      scrolledElement.removeEventListener("scroll", cb);
      if (!targetRef.current) {
        inObserver?.disconnect();
        return;
      }
      inObserver?.unobserve(targetRef?.current);
      inObserver?.disconnect();
    };
  }, [targetRef]);

  const calcWhereAmI = () => {
    const { top, left, right, bottom } =
      targetRef.current.getBoundingClientRect();
    console.log(width, height, "reals");

    setPopoverData({
      ...popoverData,
      parentWidth: targetRef.current.offsetWidth,
      parentHeight: targetRef.current.offsetHeight,
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      width: width || 300,
      realRight: Math.ceil(window.innerWidth - right),
      height: height || 300,
    });
  };

  const getParentScroll = (el = refType) => {
    if (el.tagName.toLowerCase() == "body") return null;
    const cptStyle = getComputedStyle(el);
    const overflowYStyle = cptStyle.overflowY;
    const overflowXStyle = cptStyle.overflowX;
    if (overflowXStyle != "visible" || overflowYStyle != "visible") {
      console.log("over : ", overflowXStyle, overflowYStyle);

      return el;
    } else {
      return getParentScroll(el.parentNode);
    }
  };

  return (
    <>
      {isOpen && (
        <Portal container={document.querySelector("#root")}>
          <section
            ref={popoverRef}
            onClick={(ev) => {
              ev.stopPropagation();
            }}
            id="popover"
            className={`${
              isResize && `[&_*]:select-none`
            }  fixed zoom-80  resize ${
              !isCode && `overflow-hidden`
            } bg-slate-900 border border-slate-600 shadow-md shadow-slate-950 rounded-lg  z-[1000] ${
              popoverData.isOpen ? "block" : "hidden"
            } ${popoverData.className}`}
            style={{
              top:
                popoverData.top <= (height || 300)
                  ? popoverData.top + popoverData.parentHeight + 3
                  : popoverData.top - popoverData.height,
              // bottom :popoverData.top >= 300 ? popoverData.top + popoverData.parentHeight : null,
              left:
                popoverData.realRight <= popoverData.width
                  ? popoverData.left -
                    popoverData.width +
                    popoverData.parentWidth
                  : popoverData.left,
              width: popoverData.width || 400,
              height: popoverData.height || 300,
            }}
          >
            {isCode && (
              <div
                style={{ cursor: "none" }}
                className="z-20 absolute left-[-30px] top-0 bg-slate-800 rounded-tl-md rounded-bl-md overflow-hidden flex flex-col justify-center"
              >
                {/* <button
                style={{ cursor: "pointer!important" }}
                className="w-[30px] h-[30px] flex justify-center items-center cursor-pointer"
              >
                {Icons.minimize({ strokeColor: "white", width: 15 })}
              </button> */}

                <button
                  className="w-[30px] h-[30px] flex justify-center items-center"
                  onClick={(ev) => {
                    // setPopoverData({
                    //   ...popoverData,
                    //   width: window.innerWidth,
                    //   height: window.innerHeight,
                    //   left: 0,
                    //   top: 0,
                    // });
                    popoverRef.current.requestFullscreen();
                  }}
                >
                  {Icons.fullscreen({ fill: "white", width: 15 })}
                </button>

                <button
                  ref={dragHandleRef}
                  className=" w-[30px] h-[30px]  flex justify-center items-center  transition-all hover:opacity-[1] cursor-grab"
                  onMouseDown={(ev) => {
                    setShowDragLayer(true);
                    isDrag.current = true;
                  }}
                  onMouseUp={(ev) => {
                    setShowDragLayer(false);
                    isDrag.current = false;
                  }}
                >
                  {Icons.drag({ fill: "white", width: 15, height: 20 })}
                </button>
              </div>
            )}

            {/* <section key={popoverData.content?.toString()}>{popoverData.content}</section> */}
            {children}
            {/* <section
        ref={popoverRef}
        id="popover-portal"
        className="w-full h-full"
      ></section> */}
          </section>
        </Portal>
      )}
    </>
  );
};
