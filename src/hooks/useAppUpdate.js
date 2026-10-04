
import { useCallback, useEffect, useState } from "react";

export function useAppUpdate({ enabled = true } = {}) {
  const updater = window.electron?.electronUpdater;

  const [status, setStatus] = useState("idle");
  const [update, setUpdate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const isUpdateAvailable =
    status === "available" ||
    status === "downloading" ||
    status === "downloaded";

  useEffect(() => {
    if (!enabled || !updater) return;

    const cleanups = [
      updater.onChecking?.(() => {
        setStatus("checking");
        setError("");
      }),

      updater.onAvailable?.((info) => {
        setUpdate(info);
        setStatus("available");
      }),

      updater.onNotAvailable?.(() => {
        setUpdate(null);
        setStatus("latest");
      }),

      updater.onProgress?.((info) => {
        setProgress(info?.percent || 0);
        setStatus("downloading");
      }),

      updater.onDownloaded?.((info) => {
        setUpdate(info);
        setProgress(100);
        setStatus("downloaded");
      }),

      updater.onError?.((info) => {
        setError(info?.message || "Failed to check for updates.");
        setStatus("error");
      }),
    ];

    // Check automatically when entering the editor.
    updater.check();

    return () => {
      cleanups.forEach((cleanup) => cleanup?.());
    };
  }, [enabled]);

  const check = useCallback(async () => {
    if (!updater) return;

    setStatus("checking");
    setError("");

    await updater.check();
  }, [updater]);

  const download = useCallback(async () => {
    if (!updater) return;

    setStatus("downloading");
    setProgress(0);

    await updater.download();
  }, [updater]);

  const install = useCallback(async () => {
    if (!updater) return;

    await updater.install();
  }, [updater]);

  return {
    status,
    update,
    progress,
    error,

    isUpdateAvailable,

    check,
    download,
    install,

    isDesktop: !!updater,
  };
}



// import { useState } from "react";
// import { useAppUpdate } from "@/hooks/useAppUpdate";
// import UpdateDialog from "@/components/UpdateDialog";

// export default function Editor() {
//   const [showUpdateDialog, setShowUpdateDialog] = useState(false);

//   const {
//     update,
//     status,
//     isUpdateAvailable,
//   } = useAppUpdate();

//   return (
//     <>
//       {/* Your existing editor */}

//       <button
//         onClick={() => setShowUpdateDialog(true)}
//         className="relative"
//         title={
//           isUpdateAvailable
//             ? `Update available: v${update?.version}`
//             : "Check for updates"
//         }
//       >
//         {/* Your update icon */}
//         <span>↻</span>

//         {isUpdateAvailable && (
//           <span
//             className="
//               absolute
//               -right-1
//               -top-1
//               h-2
//               w-2
//               rounded-full
//               bg-blue-500
//             "
//           />
//         )}
//       </button>

//       <UpdateDialog
//         open={showUpdateDialog}
//         onClose={() => setShowUpdateDialog(false)}
//       />
//     </>
//   );
// }
