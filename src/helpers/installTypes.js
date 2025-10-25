/**
 *
 * @param {{code:string , projectId:number , libConfig : import('./types').LibraryConfig }} props
 */
export async function installTypes({ projectId, code, libConfig }) {
  if (!code) return;
  const ts = (await import("typescript")).default;
  const { setupTypeAcquisition } = await import("@typescript/ata");
  const { uniqueId } = await import("lodash");
  const opfs = (await import("./initOpfs")).opfs;
  const db = (await import("./db")).db;
  const tId = uniqueId("install-types-id-");
  const { workerSendToast, initOPFS } = await import("./workerCommands");
  const { defineRoot, needsWrapping, wrapModule } = await import("./bridge");
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

          rejectOnce(false);
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

    ata(code);
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
