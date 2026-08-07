import { db_name } from "@/constants/dbName";
import { InfinitelyAsset, Project, WpProject } from "@/helpers/types";
import Dexie, { type EntityTable } from "dexie";
import { ProjectData } from "grapesjs";

// db.ts







const db = new Dexie(db_name) as Dexie & {
  projects: EntityTable< 
    Project & WpProject,
    "id" // primary key "id" (for the typings only)
  >;
  // assets:EntityTable< 
  //   InfinitelyAsset,
  //   "id" // primary key "id" (for the typings only)
  // >
};

// Schema declaration:
db.version(1).stores({
  projects: "++id, name, type , data", // primary key "id" (for the runtime!)
  // assets: "++id, name, type , data", // primary key "id" (for the runtime!)
});



export type { Project , WpProject };
export { db };
// (await db.assets.get('1'))
