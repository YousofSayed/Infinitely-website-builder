import { InfinitelyEvents } from "../constants/infinitelyEvents";
import { getProjectData } from "./functions";

/**
 *
 * @param {{selectedEl:HTMLElement}} param0
 */
export const updateSelectedWrapper = ({ selectedEl }) => {
  const ev = new CustomEvent("updateSelectedWrapper", {
    detail: {
      selectedEl,
    },
  });
  window.dispatchEvent(ev);
};

export const ifrmaWindowFocusChange = () => {
  const ev = new CustomEvent("iframeWindowIn");
  window.dispatchEvent(ev);
};

/**
 *
 * @param {HTMLBodyElement} body
 */
export const undoRedoEvent = (body) => {
  const ev = new CustomEvent("undo:redo", {
    detail: {
      bodyInner: body.innerHTML,
    },
  });
  window.dispatchEvent(ev);
};

/**
 *
 * @param {HTMLElement} el
 */
export const dispatchCurrentEl = (el) => {
  window.parent.dispatchEvent(
    new CustomEvent("currentel", {
      detail: {
        currentEl: el,
      },
    })
  );
};

/**
 *
 * @param {HTMLElement} el
 */
export const dispatchVMount = (el) => {
  window.parent.dispatchEvent(
    new CustomEvent("mount:app", {
      detail: {
        el,
      },
    })
  );
};

/**
 *
 * @param {{title:string , JSXModal:import('react').JSX}} param0
 * @returns
 */
export const openCustomModal = ({ title, JSXModal, width, height }) => {
  return new CustomEvent("open:custom:modal", {
    detail: {
      title,
      JSXModal,
      width,
      height,
    },
  });
};

/**
 *
 * @param {{title:string , JSXModal:import('react').JSX}} param0
 * @returns
 */
export const closeCustomModal = ({ title, JSXModal }) => {
  return new CustomEvent("close:custom:modal", {
    detail: {
      title,
      JSXModal,
    },
  });
};

export const changePageName = ({ pageName }) => {
  return new CustomEvent(InfinitelyEvents.pages.all, {
    detail: {
      pageName,
    },
  });
};

export const naviagatePreview = ({pageName , href})=>{
  return new CustomEvent(InfinitelyEvents.preview.navigate, {
    detail: {
      pageName,
      href
    }, 
  })
}

/**
 *
 * @param {HTMLElement} el
 */
export const pvMount = (el) => {
  const pvMountCm = new CustomEvent("pv:mount", {
    detail: {
      el,
    },
  });
  window.dispatchEvent(pvMountCm);
};

/**
 *
 * @param {HTMLElement} el
 */
export const pvUnMount = (el) => {
  const pvUnMountCm = new CustomEvent("pv:unmount", {
    detail: {
      el,
    },
  });
  window.dispatchEvent(pvUnMountCm);
};

/**
 *
 * @param {string[]} methodName
 * @param {import('./types').MotionType} motion
 */
export const runGsapMethod = (methods, motion, props = []) => {
  const runGsapCm = new CustomEvent("gsap:run", {
    detail: {
      methods,
      motion,
      props,
    },
  });
  window.dispatchEvent(runGsapCm);
};

export const runAllGsapMotions = (motions) => {
  window.dispatchEvent(
    new CustomEvent("gsap:all:run", {
      detail: {
        motions,
        methods:[],
        props:{}
      },
    })
  );
};

export const killAllGsapMotions = (motions) => {
  window.dispatchEvent(
    new CustomEvent("gsap:all:kill", {
      detail: {
        motions,
        methods:[]
      },
    })
  );
};