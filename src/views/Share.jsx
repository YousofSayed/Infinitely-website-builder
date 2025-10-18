import React, { useEffect, useState } from "react";
import { useQueries } from "../helpers/cocktail";
import {
  getDropboxFileBlob,
  getDropboxFileMeta,
} from "../helpers/dropboxHandlers";
import { dropbox_refresh_token, dropbox_token } from "../constants/shared";
import { infinitelyWorker } from "../helpers/infinitelyWorker";
import { loadProject, workerCallbackMaker } from "../helpers/functions";

export const Share = () => {
  const [preview, setPreview] = useState(false);
  const quereis = useQueries();
  useEffect(() => {
    console.log(quereis.get("file_path"));
  }, [quereis]);

  const handleFile = async () => {
    //The next two steps for developer if have already tokens
    const main_access_token = localStorage.getItem(dropbox_token);
    const main_refresh_token = localStorage.getItem(dropbox_refresh_token);

    const access_token = atob(quereis.get("access_token"));
    const refreshToken = atob(quereis.get("refresh_token"));

    localStorage.setItem(dropbox_token, access_token);
    localStorage.setItem(dropbox_refresh_token, refreshToken);

    const filePath = quereis.get("file_path");
    const previewFile = await getDropboxFileBlob(filePath);
    const fileMeta = await getDropboxFileMeta(filePath);

    const loadedData = await new Promise(async (res, rej) => {
      workerCallbackMaker(infinitelyWorker, "loadProject", (props) => {
        res(props);
      });
      await loadProject(
        previewFile,
        {
          apps: "Dropbox",
          dropboxFileMeta: fileMeta,
        },
        undefined,
        true,
        "views/view"
      );
    });


    if(!loadedData.done){
      throw new Error(`Faild to load project 🥺`);
    }

    
  };


  return <div>Share</div>;
};
