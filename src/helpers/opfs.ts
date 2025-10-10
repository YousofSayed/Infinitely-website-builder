import { dir, file, OTDir, OTFile, write } from "opfs-tools";

export type OPFSEvents =
  | "fileCreated"
  | "filesCreated"
  | "foldersCreated"
  | "folderCreated"
  | "folderRead"
  | "fileRead"
  | "fileWritten"
  | "entryRemoved"
  | "entriesRemoved"
  | "opfsInitialized"
  | "all"
  | "getFile"
  | "idUpdated"; // New event for id updates

interface FolderCreatedEvent {
  type: "folderCreated";
  folderName: string;
}

interface FileCreatedEvent {
  type: "fileCreated";
  fileName: string;
  folderName: string;
}

interface FoldersCreatedEvent {
  type: "foldersCreated";
  folders: FileSystemDirectoryHandle[];
}

interface FilesCreatedEvent {
  type: "filesCreated";
  files: FileSystemFileHandle[];
  folderName: string;
}

interface FolderReadEvent {
  type: "folderRead";
  folderName: string;
  entries: { name: string; isDirectory: boolean }[];
}

interface FileReadEvent {
  type: "fileRead";
  fileName: string;
  content: string;
}

interface FileWrittenEvent {
  type: "fileWritten";
  fileName: string;
  content: string | Blob | File;
}

interface EntryRemovedEvent {
  type: "entryRemoved";
  entryName: string;
  root: FileSystemDirectoryHandle;
  msg: string;
}

interface EntriesRemoveEvent {
  type: "entriesRemoved";
  done: boolean;
  root: FileSystemDirectoryHandle;
  msg: string;
}

interface All {
  type: "all";
  mainRoot: FileSystemDirectoryHandle;
  currentRoot?: FileSystemDirectoryHandle;
  eventTargetName: OPFSEvents;
}

interface OPFSInitializedEvent {
  type: "opfsInitialized";
  root: FileSystemDirectoryHandle;
}

interface GetFile {
  type: "getFile";
  folderPath: string;
  fileName: string;
  from: string;
  projectId: number;
}

interface IdUpdatedEvent {
  type: "idUpdated";
  id: number | null;
}

type OPFSEventData =
  | FoldersCreatedEvent
  | FolderCreatedEvent
  | FilesCreatedEvent
  | FileCreatedEvent
  | FolderReadEvent
  | FileReadEvent
  | FileWrittenEvent
  | EntryRemovedEvent
  | EntriesRemoveEvent
  | OPFSInitializedEvent
  | All
  | GetFile
  | IdUpdatedEvent;

export class OPFS {
  root: Promise<FileSystemDirectoryHandle> | FileSystemDirectoryHandle;
  opfsBraodcast: BroadcastChannel = new BroadcastChannel("opfs");
  #id: number | null;
  #observerNum: number = 0;
  #root = navigator.storage.getDirectory();
  #encode = (text: string) => {
    const searcher = new URLSearchParams(`text=${text}`);
    return searcher.get("text") || "";
  };
  #broadcast = new BroadcastChannel("opfs");
  #eventTarget = new EventTarget();
  #openedWriters = new Map<
    string,
    {
      write: (
        chunk: string | BufferSource,
        opts?: {
          at?: number;
        }
      ) => Promise<number>;
      truncate: (size: number) => Promise<void>;
      flush: () => Promise<void>;
      close: () => Promise<void>;
    }
  >();

  #emitAllEvent = async (eventTargetName: OPFSEvents, currentRoot?: OTDir) => {
    console.log("emitted");
    const event = {
      type: "all",
      mainRoot: await this.#root,
      currentRoot,
      eventTargetName,
    } as All;
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
  };

  constructor() {
    this.root = this.#root;
    this.opfsBraodcast = this.#broadcast;
    this.#id = null;
    console.log(`Observer number`, this.#observerNum);
    this.#observerNum++;

    // Listen for id updates from other threads
    this.onBroadcast("idUpdated", (data) => {
      this.#id = data.id;
    });
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    if (typeof value !== "number") {
      throw new TypeError("Value must be number");
    }
    this.#id = value;
    // Broadcast the new id to all threads
    const event: IdUpdatedEvent = {
      type: "idUpdated",
      id: this.#id,
    };
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
  }

  async init(id: number) {
    this.root = await this.#root;
    this.id = id;
    if (!this.root) {
      throw new Error("Failed to initialize OPFS root directory");
    }
    const event = {
      type: "opfsInitialized",
      root: this.root,
    } as OPFSInitializedEvent;
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
    await this.#emitAllEvent("opfsInitialized");
  }

  on<T extends OPFSEvents>(
    event: T | T[],
    callback: (data: Extract<OPFSEventData, { type: T }>) => void,
    options?: AddEventListenerOptions
  ): () => void {
    const events = Array.isArray(event) ? event : [event];
    const handler = (ev: CustomEvent) => {
      console.log("Registering EventTarget listener for:", event);
      if (events.includes(ev.detail.type as T)) {
        console.log("handler from event target");
        callback(ev.detail as Extract<OPFSEventData, { type: T }>);
      }
    };
    this.#eventTarget.addEventListener(
      "opfs",
      handler as EventListenerOrEventListenerObject
    );
    return () =>
      this.#eventTarget.removeEventListener(
        "opfs",
        handler as EventListenerOrEventListenerObject
      );
  }

  onBroadcast<T extends OPFSEvents>(
    event: T | T[],
    callback: (data: Extract<OPFSEventData, { type: T }>) => void,
    options?: AddEventListenerOptions
  ): () => void {
    const events = Array.isArray(event) ? event : [event];
    const handler = (ev: MessageEvent<OPFSEventData>) => {
      if (events.includes(ev.data.type as T)) {
        callback(ev.data as Extract<OPFSEventData, { type: T }>);
      }
    };
    this.#broadcast.addEventListener("message", handler, options);
    return () =>
      this.#broadcast.removeEventListener("message", handler, options);
  }

  async createFolder(path: string) {
    const dirhandle = dir(path);
    const isExist = dirhandle.exists();
    if (!isExist) {
      const dirCreated = await dirhandle.create();
      const event = {
        type: "folderCreated",
        folderName: dirCreated.name,
      } as FolderCreatedEvent;
      this.#broadcast.postMessage(event);
      this.#eventTarget.dispatchEvent(
        new CustomEvent("opfs", { detail: event })
      );
      this.#emitAllEvent("folderCreated", dirCreated);
      return dirCreated;
    } else {
      return dirhandle;
    }
  }

  async createFolders(pathes: string[] = []) {
    const createdFolders: OTDir[] = [];
    for (const path of pathes) {
      const dirHandle = await this.createFolder(path);
      createdFolders.push(dirHandle);
    }
    const event = {
      type: "foldersCreated",
      folders: createdFolders as any,
    } as FoldersCreatedEvent;
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
    this.#emitAllEvent("foldersCreated");
    return createdFolders;
  }

  async removeAllFolders(path: string | undefined) {
    try {
      if (typeof path != "string") {
        throw new TypeError(`Path must be string`);
      }
      const folder = await dir(path as string);
      const children = await folder.children();
      for (const child of children) {
        if (child.kind == "file") continue;
        await child.remove();
      }
      const event = {
        type: "entriesRemoved",
        done: true,
        msg: "Entries removed successfully",
        root: folder as any,
      } as EntriesRemoveEvent;
      this.#broadcast.postMessage(event);
      this.#eventTarget.dispatchEvent(
        new CustomEvent("opfs", { detail: event })
      );
      await this.#emitAllEvent("entriesRemoved", folder as any);
    } catch (error) {
      throw new Error(String(error));
    }
  }

  async createFile(
    path: string,
    content: string | BufferSource | ReadableStream<BufferSource>,
    offEvents: boolean = false
  ) {
    if (!path) {
      throw new Error("Path is not defined");
    }
    const fileHandle = await file(path);
    const isExist = await fileHandle.exists();
    if (!isExist) {
      content = content instanceof Blob ? await content.arrayBuffer() : content;
      // const writer = fileHandle.createWriter();
      // (await writer).write(content as any)
      await write(fileHandle, content);
      if (!offEvents) {
        const event = {
          type: "fileCreated",
          fileName: fileHandle.name,
          folderName: fileHandle.parent?.name,
        } as FileCreatedEvent;
        this.#broadcast.postMessage(event);
        this.#eventTarget.dispatchEvent(
          new CustomEvent("opfs", { detail: event })
        );
        await this.#emitAllEvent("fileCreated", fileHandle as any);
      }
      return fileHandle;
    } else {
      return fileHandle;
    }
  }

  async createFiles(
    files: {
      path: string;
      content?: string | BufferSource | ReadableStream<BufferSource>;
    }[] = [],
    offEventsOnSingleFile: boolean = false
  ) {
    if (!files) {
      throw new Error("Files is not defined");
    }
    const createdFiles: OTFile[] = [];
    for (const file of files) {
      const fileHandle = await this.createFile(
        file.path,
        file.content || "",
        offEventsOnSingleFile
      );
      createdFiles.push(fileHandle);
    }
    if (createdFiles.length === 0) {
      throw new Error("No files were created");
    }
    if (createdFiles.length !== files.length) {
      throw new Error("Some files were not created successfully");
    }
    const event = {
      type: "filesCreated",
      files: createdFiles as any,
    } as FilesCreatedEvent;
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
    this.#emitAllEvent("filesCreated");
    return createdFiles;
  }

  async getFolder(path: string) {
    return await dir(path);
  }

  async getFolders(
    // root: FileSystemDirectoryHandle,
    paths: string[] = [],
    returnType: "Array" | "Object" = "Array"
  ) {
    try {
      // if (!(root instanceof FileSystemDirectoryHandle)) {
      //   throw new Error("Root handle is not defined");
      // }
      if (!Array.isArray(paths)) {
        throw new TypeError(`Paths must be array of string`);
      }
      if (paths.length === 0) {
        throw new Error("No paths provided");
      }
      const folders: OTDir[] = [];
      for (const path of paths) {
        const folder = await this.getFolder(path);
        folders.push(folder);
      }
      if (folders.length === 0) {
        throw new Error("No folders found for the provided paths");
      }
      if (folders.length !== paths.length) {
        throw new Error("Some folders were not found for the provided paths");
      }

      const outputObject: { [key: string]: OTDir } = {};
      if (returnType == "Object") {
        for (const [index, handle] of folders.entries()) {
          if (!handle) {
            console.warn(`Can not find file index : ${index}`);
            continue;
          }
          outputObject[handle.name] = handle;
        }
      }
      return returnType == "Array"
        ? folders
        : returnType == "Object"
        ? outputObject
        : undefined;
    } catch (error) {
      console.error("Error getting folders:", error);
      return [];
    }
  }

  async getAllFolders(path: string = "") {
    try {
      return await dir(path).children();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getFolderSize(path: string = "") {
    if (!path) {
      throw new Error("Path is not defined");
    }
    const folder = await dir(path);
    const isExist = folder.exists();
    if (!isExist) {
      throw new Error(`Folder not founded`);
    }

    const files = await this.getAllFiles(folder.path, {
      recursive: true,
    });

    return (
      await Promise.all(files.map(async (file) => await file.getSize()))
    ).reduce((prevV, currentV) => prevV + currentV, 0);
  }

  async getFile(path: string | undefined) {
    if (!path) {
      throw new Error("Path is not defined");
    }

    const fileHandle = await file(path);
    const isExist = fileHandle.exists();

    return fileHandle;
  }

  async getFiles(paths: { path: string; as?: "File" | "Text" }[] = []) {
    try {
      if (!Array.isArray(paths)) {
        throw new TypeError(`Paths must be array of string`);
      }
      if (paths.length === 0) {
        throw new Error("No paths provided");
      }

      const files: OTFile[] = [];
      for (const path of paths) {
        const file = await this.getFile(path.path);
        if (!file) {
          throw new Error(`File not founded for path : ${path}`);
        }
        files.push(file);
      }

      if (files.length === 0) {
        throw new Error("No files found for the provided paths");
      }
      if (files.length !== paths.length) {
        throw new Error("Some files were not found for the provided paths");
      }
      return files;
    } catch (error) {
      console.error("Error getting files:", error.message);
      return [];
    }
  }

  async getAllFiles(
    path: string = "",
    options: {
      chunks?: boolean;
      chunksStart?: number;
      chunksCount?: number;
      chunksDelay?: number;
      onChunk?: (chunk: OTFile[]) => void;
      recursive?: boolean;
    } = {
      recursive: true,
      onChunk: () => {},
      chunksCount: 15,
      chunksDelay: 50,
      chunksStart: 0,
    }
  ) {
    if (!path) {
      throw new Error("Path is not defined");
    }
    const files: OTFile[] = [];
    const dirHandle = await dir(path);
    const children = await dirHandle.children();
    console.log("childens: ", children);

    // if (options.chunks) {
    //   const chunk = children.slice(
    //     options.chunksStart,
    //     (options.chunksCount as number) + 1
    //   );

    //   console.log(
    //     `Chunk : `,
    //     children,
    //     chunk,
    //     options.chunksStart,
    //     (options.chunksCount as number) + 1
    //   );

    //   options = {
    //     ...options,
    //     chunksStart:
    //       (options.chunksStart as number) + (options.chunksCount as number),
    //   };
    //   // await new Promise(async (res, rej) => {
    //   const chunks: OTFile[] = [];
    //   for (const entry of chunk) {
    //     if (entry.kind === "file") {
    //       // const fileHandle = await this.getFile(entry.name);
    //       files.push(entry);
    //       chunks.push(entry);
    //     } else if (entry.kind === "dir" && options.recursive) {
    //       const subFiles = await this.getAllFiles(entry.path, options);
    //       files.push(...subFiles);
    //       chunks.push(...subFiles);
    //     }
    //   }
    //   options?.onChunk?.(chunks);

    //   if ((options.chunksStart as number) < children.length) {
    //     return new Promise((res, rej) => {
    //       setTimeout(
    //         async () => {
    //           console.log("lesss");
    //           // res(chunks)
    //           res(await this.getAllFiles(path, options));
    //         },
    //         options.chunksStart == 0 ? 0 : options.chunksDelay
    //       );
    //     });
    //     // res(files);
    //   }
    //   // });
    //   console.log(`children.length : `, children.length, options.chunksStart);
    // } else {
    for (const entry of children) {
      if (entry.kind === "file") {
        // const fileHandle = await this.getFile(entry.name);
        files.push(entry);
      } else if (entry.kind === "dir" && options.recursive) {
        const subFiles = await this.getAllFiles(entry.path, options);
        console.log("sups  : ", subFiles);

        files.push(...subFiles);
      }
    }
    // }
    return files;
  }

  async removeAllFiles(path: string = "", recursive?: boolean) {
    try {
      console.log("start removing");
      if (!path) {
        throw new Error("Path is not defined");
      }

      const files = await this.getAllFiles(path, {
        recursive: Boolean(recursive),
      });
      for (const file of files) {
        await file.remove();
        // const event = {
        //   type: "entryRemoved",
        //   entryName: file.name,
        //   msg: "Entry removed successfully",
        //   root: file.parent as any,
        // } as EntryRemovedEvent;
        // this.#broadcast.postMessage(event);
        // this.#eventTarget.dispatchEvent(
        //   new CustomEvent("opfs", { detail: event })
        // );
        // await this.#emitAllEvent("entryRemoved");
      }
      const event = {
        type: "entriesRemoved",
        done: true,
        root: (await dir(path)) as any,
        msg: "Files removed successfully",
      } as EntriesRemoveEvent;
      this.#broadcast.postMessage(event);
      this.#eventTarget.dispatchEvent(
        new CustomEvent("opfs", { detail: event })
      );
      console.log("Should be all removed");
      await this.#emitAllEvent("entriesRemoved");
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(String(error));
    }
  }

  async writeFiles(
    pathesAndContents: {
      path: string;
      content: string | BufferSource;
      options?: {
        at?: number;
      };
    }[]
  ) {
    for (const { path, content, options } of pathesAndContents) {
      const file = await this.getFile(path);
      const isExist = file.exists();
      if (!isExist) {
        throw new Error(`File not exist for path : ${path}`);
      }

      if (file) {
        const bufferContent =
          content instanceof Blob ? await content.text() : content;

        // let bufferContent;
        // if (typeof content === "string") {
        //   bufferContent = new TextEncoder().encode(content);
        // } else if (
        //   content instanceof ArrayBuffer ||
        //   ArrayBuffer.isView(content)
        // ) {
        //   bufferContent = content;
        // } else if (content as Blob instanceof Blob) {
        //   // Avoid arrayBuffer() if possible
        //   bufferContent = new Uint8Array(
        //     await (content as Blob).text().then((t) => new TextEncoder().encode(t))
        //   );
        // }

        //  const isSameContent =  await file.arrayBuffer()  == content
        const writer = await file.createWriter();
        const prevWriter = this.#openedWriters.get(file.path);
        prevWriter && prevWriter.close();

        this.#openedWriters.set(file.path, writer);
        await writer.truncate(0); // Clear old content
        await writer.write(bufferContent);
        await writer.close();
        this.#openedWriters.delete(file.path);

        // await write(file, bufferContent);
        const event = {
          type: "fileWritten",
          fileName: (file as any).name,
          content,
        } as FileWrittenEvent;
        this.#broadcast.postMessage(event);
        this.#eventTarget.dispatchEvent(
          new CustomEvent("opfs", { detail: event })
        );
      }
    }

    await this.#emitAllEvent("fileWritten");
  }

  async closeAllOpenedWriters() {
    for (const writer of this.#openedWriters.values()) {
      await writer.close();
    }
  }

  async remove({
    dirOrFile,
  }: // path,
  // file,
  {
    dirOrFile: (OTDir | OTFile) | (OTDir | OTFile)[];
    // path?: string | undefined;
    // file?: FileSystemFileHandle;
  }) {
    if (Array.isArray(dirOrFile)) {
      for (const entry of dirOrFile) {
        await entry.remove();
        const event = {
          type: "entryRemoved",
          entryName: entry.name,
          msg: "Entry removed successfully",
          root: dirOrFile as any,
        } as EntryRemovedEvent;
        this.#broadcast.postMessage(event);
        this.#eventTarget.dispatchEvent(
          new CustomEvent("opfs", { detail: event })
        );
        await this.#emitAllEvent("entryRemoved");
      }
    } else {
      await dirOrFile.remove();
      const event = {
        type: "entryRemoved",
        entryName: dirOrFile.name,
        msg: "Entry removed successfully",
        root: dirOrFile as any,
      } as EntryRemovedEvent;
      this.#broadcast.postMessage(event);
      this.#eventTarget.dispatchEvent(
        new CustomEvent("opfs", { detail: event })
      );
      await this.#emitAllEvent("entryRemoved");
    }

    return true;
  }

  async removeFiles(pathes: string[]) {
    for (const path of pathes) {
      const fileHandle = await this.getFile(path);
      await fileHandle.remove();
    }
    const event = {
      type: "entriesRemoved",
      done: true,
      msg: "Files removed successfully",
    } as EntriesRemoveEvent;
    this.#broadcast.postMessage(event);
    this.#eventTarget.dispatchEvent(new CustomEvent("opfs", { detail: event }));
    console.log("Should be all removed");
    await this.#emitAllEvent("entriesRemoved");
    return true;
  }
}
