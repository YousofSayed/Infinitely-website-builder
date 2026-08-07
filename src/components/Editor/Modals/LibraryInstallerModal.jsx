import { getProjectData } from "@/helpers/functions";
import { Icons } from "@/components/Icons/Icons";
import { MultiTab } from "@/components/Protos/Multitabs";
import { InstalledLibraries } from "@/components/Editor/Protos/InstalledLibraries";
import { LibraryInstaller } from "@/components/Editor/Protos/LibraryInstaller";
import { LibraryUploader } from "@/components/Editor/Protos/LibraryUploader";
import { TabLabel } from "@/components/Editor/Protos/TabLabel";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";

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
