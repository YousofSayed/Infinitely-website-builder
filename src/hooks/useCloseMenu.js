import { useEffect } from "react";

export function useCloseMenu(ref, setMenu) {
  useEffect(() => {
    if (ref.current) {
      const docClickCallback = (ev) => {
        if (!ref.current.contains(ev.target)) {
          setMenu(false);
        }
      };
      document.addEventListener("click", docClickCallback);

      return () => {
        document.removeEventListener("click", docClickCallback);
      };
    }
  });
}
