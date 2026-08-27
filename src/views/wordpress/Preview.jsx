import { Loader } from "@/components/Loader";
import { ShowIf } from "@/components/ShowIf";
import { useQueries } from "@/helpers/cocktail";
import { iframeType } from "@/helpers/jsDocs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, { useEffect, useRef, useState } from "react";

const buildPreviewUrl = (baseUrl, saveState, mode) =>
  `${baseUrl}?save_state=${saveState}&mode=${mode}`;

export const Preview = () => {
  const params = useQueries();
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(iframeType);
  const [animatedRef] = useAutoAnimate();

  useEffect(() => {
    if (!params && !iframeRef.current) return;
    console.log(params);

    const handleLoad = () => {
      if (!iframeRef.current?.src) return;
      setLoading(false);
      console.log("iframe loading ....");
    };

    // iframeRef.current.addEventListener("load", handleLoad);

    setLoading(true);
    setSrc(
      buildPreviewUrl(
        params.get("url"),
        params.get("save_state"),
        params.get("mode"),
      ),
    );

    return () => {
      // iframeRef.current?.removeEventListener("load", handleLoad);
    };
  }, [iframeRef]);

  // useEffect(() => {
  //   if (!src) return;
  //   setLoading(true);
  // }, [src]);

  useEffect(() => {
    const bc = new BroadcastChannel("wp-preview");
    const cb = (ev) => {
      console.log("Received preview URL:", ev.data);
      const { props } = ev.data;
      const nextSrc = `${props.url}?save_state=${props.save_state}&mode=${props.mode}&reload=${Date.now()}`;
      console.log(ev.data, nextSrc);
      setLoading(true);
      setSrc(nextSrc);
    };

    const messageCallback = (event) => {
      if (event.data && event.data.type === "INF_HMR_UPDATE") {
        console.log("🔥 HMR update received from iframe!");
        setLoading(false);
        // Trigger your builder's reload or state-refresh logic here
        // Example: window.location.reload();
        // Or trigger your specific HMR state manager
      }
    };
    // Add this to your main builder app's initialization code
    window.addEventListener("message", messageCallback);
    bc.addEventListener("message", cb);

    return () => {
      bc.removeEventListener("message", cb);
      window.removeEventListener("message", messageCallback);
      bc.close();
    };
  }, []);

  console.log("preview :");

  useEffect(() => {
    console.log("loading : ", loading);
  }, [loading]);

  return (
    <section ref={animatedRef} className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={src}
        // onLoad={() => {
        //   console.log("iframe loaded");
        // }}
        className={`w-full h-full ${loading ? "hidden" : "block"}`}
        // allowFullScreen
        // security="restricted"
        // about="target"
        // allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        // unselectable="on"
        // style={{
        //   willChange: "transform",
        //   contain: `strict`,
        //   transform: `translateZ(0)`,
        // }}
      ></iframe>
      {loading && <Loader />}
    </section>
  );
};
