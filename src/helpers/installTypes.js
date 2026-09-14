
/**
 *
 * @param {{code:string , projectId:number , libConfig : import('@/helpers/types').LibraryConfig }} props
 */
export async function installTypes({ projectId, code, libConfig }) {
  if (!code) return;
  const ts = (await import("typescript")).default;
  const { setupTypeAcquisition } = await import("@typescript/ata");
  const { uniqueId } = await import("lodash");
  const opfs = (await import("@/helpers/initOpfs")).opfs;
  const db = (await import("@/helpers/db")).db;
  const tId = uniqueId("install-types-id-");
  const { workerSendToast, initOPFS } = await import("@/helpers/workerCommands");
  const { defineRoot, needsWrapping, wrapModule } = await import("@/helpers/bridge");
  const projectData = await db.projects.get(projectId);
  await initOPFS({ id: +projectId });

  return await new Promise(async (res, rej) => {
    let done = false;
    const resolveOnce = (val) => {
      if (!done) {
        done = true;
        res(val);
      }
    };

    const rejectOnce = (err) => {
      if (!done) {
        done = true;
        rej(err);
      }
    };
    // try {
    const ata = setupTypeAcquisition({
      projectName: projectData.name,
      logger: console,
      typescript: ts,
      delegate: {

        errorMessage: (userErrorMessage, error) => {
          workerSendToast({
            isNotMessage: true,
            msg: tId,
            type: "dismiss",
            dataProps: {
              progressClassName: "bg-[crimson]",
            },
          });
          workerSendToast({
            msg: userErrorMessage,
            type: "error",
          });

          rejectOnce(new Error(userErrorMessage || "Failed to install types"));
        },

        started: () => {
          workerSendToast({
            msg: `Installing ${libConfig.nameWithoutExt} types...`,
            type: "loading",
            dataProps: {
              toastId: tId,
            },
          });
        },

        finished: async (files) => {
          const filesObj = Object.fromEntries(files);
          for (const path in filesObj) {
            const value = filesObj[path];
            await opfs.writeFiles([
              {
                path: `projects/project-${projectId}/types/${libConfig.nameWithoutExt}${path}`, // defineRoot(`types/${libConfig.nameWithoutExt}${path}`),
                content:
                  needsWrapping(value) && libConfig.globalName
                    ? wrapModule(
                        libConfig.nameWithoutExt,
                        value
                        // hasExportDefault(value)
                        //   ? value.replace("export default", "export")
                        //   : value
                      )
                    : value,
              },
            ]);
          }
          // files.forEach((value, path) => {});
          console.log("Type installed successfully");
          workerSendToast({
            isNotMessage: true,
            msg: tId,
            type: "done",
            dataProps: {
              progressClassName: "bg-green-500",
            },
          });
          resolveOnce(true);
        },
      },
    });
    console.log("from types installer : ", projectId, code, libConfig);

    try {
      // 1. Add 'await' here so the catch block can handle promise rejections
      await ata(code);
      
      // 2. Fallback: If 'finished' wasn't called (e.g., no types needed downloading),
      // we must resolve the promise manually so offlineInstaller doesn't hang.
      resolveOnce(true);
    } catch (error) {
      console.error("Type Acquisition Error:", error);
      
      // Dismiss the loading toast if it was shown
      workerSendToast({
        isNotMessage: true,
        msg: tId,
        type: "dismiss",
        dataProps: {
          progressClassName: "bg-[crimson]",
        },
      });
      
      // Show error toast
      workerSendToast({
        msg: error?.message || "Failed to install types",
        type: "error",
      });

      // Reject the promise to stop the current installation process
      rejectOnce(error instanceof Error ? error : new Error(String(error)));
    }
    // } catch (error) {
    //   workerSendToast({
    //     isNotMessage: true,
    //     msg: tId,
    //     type: "dismiss",
    //     dataProps: {
    //       progressClassName: "bg-[crimson]",
    //     },
    //   });

    //   workerSendToast({
    //     msg: error.message,
    //     type: "error",
    //   });
    //   rej(false);
    //   throw new Error(error);
    // }
  });
}
