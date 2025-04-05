// db.ts
import Dexie, { type EntityTable } from "dexie";
import { db_name } from "../constants/dbName";
import { ProjectData } from "grapesjs";
import { Project } from "./types";



const db = new Dexie(db_name) as Dexie & {
  projects: EntityTable< 
    Project,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  projects: "++id, name, type , data", // primary key "id" (for the runtime!)
});



export type { Project };
export { db };
