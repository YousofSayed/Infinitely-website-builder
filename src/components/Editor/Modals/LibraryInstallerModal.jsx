import React from "react";
import { MultiTab } from "../../Protos/Multitabs";
import { LibraryInstaller } from "../Protos/LibraryInstaller";
import { InstalledLibraries } from "../Protos/InstalledLibraries";
import { Icons } from "../../Icons/Icons";
import { LibraryUploader } from "../Protos/LibraryUploader";
import { TabLabel } from "../Protos/TabLabel";
import { useLiveQuery } from "dexie-react-hooks";
import { getProjectData } from "../../../helpers/functions";


export const LibraryInstallerModal = () => {
  useLiveQuery(async()=>{
    console.log(await getProjectData());
    
  })
  return (
    <MultiTab
      tabs={[
        {
          title: (
            <TabLabel
              icon={Icons.export('white')}
              label="Installed"
            />
          ),
          content: <InstalledLibraries />,
        },
        {
          title: <TabLabel icon={Icons.plus("white")} label="Add New" />,
          content: <LibraryInstaller />,
        },
        {
          title:<TabLabel icon={Icons.upload({strokeColor:'white'})} label="Upload New"/>,
          content:<LibraryUploader />
        }
      ]}
    />
  );
};
