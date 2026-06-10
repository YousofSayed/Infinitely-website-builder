import React, { useEffect, useRef, useState } from "react";
import { useQueries } from "../helpers/cocktail";
import { iframeType } from "../helpers/jsDocs";
import { Loader } from "../components/Loader";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const Preview = () => {
  const params = useQueries();
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(iframeType);
  const [animatedRef] = useAutoAnimate();

  const buildPreviewUrl = (baseUrl, saveState, mode) =>
    `${baseUrl}?save_state=${saveState}&mode=${mode}`;

  useEffect(() => {
    if (!params && !iframeRef.current) return;
    console.log(params);

    const handleLoad = () => {
      if (!iframeRef.current?.src) return;
      setLoading(false);
      console.log("iframe loading ....");
    };

    iframeRef.current.addEventListener("load", handleLoad);

    setLoading(true);
    setSrc(
      buildPreviewUrl(
        params.get("url"),
        params.get("save_state"),
        params.get("mode"),
      ),
    );

    return () => {
      iframeRef.current?.removeEventListener("load", handleLoad);
    };
  }, [params]);

  useEffect(() => {
    if (!src) return;
    setLoading(true);
  }, [src]);

  useEffect(() => {
    const bc = new BroadcastChannel("wp-preview");
    const cb = (ev) => {
      const { props } = ev.data;
      const nextSrc = `${props.url}?save_state=${props.save_state}&mode=${props.mode}&reload=${Date.now()}`;
      console.log(ev.data, nextSrc);
      setLoading(true);
      setSrc(nextSrc);
    };

    bc.addEventListener("message", cb);

    return () => {
      bc.removeEventListener("message", cb);
      bc.close();
    };
  }, []);

  console.log("preview :");

  return (
    <section ref={animatedRef} className="w-full h-full">
      <iframe
        key={src}
        ref={iframeRef}
        src={src}
        onLoad={() => setLoading(false)}
        className={`w-full h-full ${loading && "hidden"}`}
      ></iframe>
      {loading && <Loader />}
    </section>
  );
};
