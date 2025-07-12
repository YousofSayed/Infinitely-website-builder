import { useEffect } from "react";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { ToastMsgInfo } from "../components/Editor/Protos/ToastMsgInfo";
import { toast } from "react-toastify";
import { parse } from "../helpers/cocktail";
import { assetsWorker } from "../helpers/defineWorkers";

export function useWorkerToast() {
    useEffect(() => {
    /**
     *
     * @param {MessageEvent} ev
     */
    const cb = (ev) => {
      const { command, props } = ev.data;
      if (command != "toast") return;
      const { msg, type , isNotMessage , dataProps } = props;
      console.log('from toast : ', msg, type , isNotMessage , dataProps , msg);
      toast[type](isNotMessage ? parse(msg) || msg : <ToastMsgInfo msg={msg}  />, dataProps || {});
    };
    infinitelyWorker.addEventListener("message", cb);
    assetsWorker.addEventListener("message", cb);

    return () => {
      infinitelyWorker.removeEventListener("message", cb);
      assetsWorker.removeEventListener("message", cb);
    };
  }, []);
}