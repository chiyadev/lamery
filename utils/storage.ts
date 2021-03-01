import { readFile, stat } from "fs/promises";
import { parse, resolve, sep } from "path";
import { createReadStreamAsync } from "./stream";
import { MemorySearch } from "./search";
import { watch } from "chokidar";
import { Stats } from "fs";
import { createHash } from "crypto";

export const StorageBasePath = resolve(process.env.LISTING_PATH || ".");

// converts a relative storage path to an absolute filesystem path
export function storagePathToAbsolute(path: string) {
  return normalizePath(`${StorageBasePath}/${path}`).replace("/", sep);
}

// converts an absolute filesystem path to a relative storage path
export function absolutePathToStorage(path: string) {
  if (path.startsWith(StorageBasePath)) {
    path = path.substr(StorageBasePath.length);
  }

  return normalizePath("/" + path);
}

const sepRegex = /[\/\\]+/g;

// unifies separators with forward slashes
export function normalizePath(path: string) {
  return path.replace(sepRegex, "/");
}

// calculates the depth of a path (number of slashes - 2); assumes input is already normalized
export function getPathDepth(path: string) {
  return path.split("/").length - 2;
}

// https://stackoverflow.com/a/28503130/13160620
export function getParentPaths(path: string) {
  const parts: string[] = [];
  let i = 1;

  while ((i = path.indexOf("/", i) + 1)) {
    parts.push(path.substr(0, i - 1));
  }

  return parts;
}

export type StorageEntry = StorageFile | StorageDirectory;

export type StorageFile = {
  type: "file";
  path: string;
  parent: string;
  depth: number;
  name: string;
  ext: string;
  size: number;
  mtime: number;
};

export type StorageDirectory = {
  type: "directory";
  path: string;
  parent: string;
  depth: number;
  name: string;
  size: number;
  mtime: number;
};

export class StorageIndex extends MemorySearch<StorageEntry> {
  constructor() {
    super({
      idField: "path",
      fields: ["path"],
    });
  }

  get entries() {
    return Array.from(this.store.values());
  }

  get files() {
    return this.entries.filter((entry) => entry.type === "file") as StorageFile[];
  }

  get directories() {
    return this.entries.filter((entry) => entry.type === "directory") as StorageDirectory[];
  }

  get(path: string) {
    return super.get(normalizePath("/" + path));
  }

  getFile(path: string) {
    const entry = this.get(path);

    if (entry?.type === "file") {
      return entry;
    }
  }

  getDirectory(path: string) {
    const entry = this.get(path);

    if (entry?.type === "directory") {
      return entry;
    }
  }

  filterEntries(prefix: string, depth = 0) {
    prefix = normalizePath("/" + prefix);

    const minDepth = getPathDepth(prefix);
    const maxDepth = minDepth + depth;

    return this.entries.filter(
      (entry) => entry.path.startsWith(prefix) && minDepth <= entry.depth && entry.depth <= maxDepth
    );
  }

  filterFiles(prefix: string, depth = 0) {
    return this.filterEntries(prefix, depth).filter((entry) => entry.type === "file") as StorageFile[];
  }

  filterDirectories(prefix: string, depth = 0) {
    return this.filterEntries(prefix, depth).filter((entry) => entry.type === "directory") as StorageDirectory[];
  }

  async getFileAsStream(path: string, options?: Parameters<typeof createReadStreamAsync>[1]) {
    return createReadStreamAsync(storagePathToAbsolute(path), options);
  }

  async getFileAsString(path: string) {
    const buffer = await readFile(storagePathToAbsolute(path));
    return buffer.toString("utf-8");
  }
}

const indexPromise = new Promise<StorageIndex>((resolve) => {
  const index = new StorageIndex();

  const watcher = watch(StorageBasePath, {
    persistent: true,
  });

  const indexFile = async (path: string, stats?: Stats) => {
    try {
      stats = stats || (await stat(path));
      path = absolutePathToStorage(path);

      const { base, dir, ext } = parse(path);

      index.index({
        type: "file",
        path,
        parent: dir,
        depth: getPathDepth(path),
        name: base,
        ext,
        size: stats.size,
        mtime: stats.mtimeMs,
      });

      for (const parentPath of getParentPaths(path)) {
        const parent = index.getDirectory(parentPath);
        parent && (parent.size += stats.size);
      }
    } catch {
      // ignored
    }
  };

  const deleteFile = (path: string) => {
    const file = index.delete(absolutePathToStorage(path));

    if (file) {
      for (const parentPath of getParentPaths(file.path)) {
        const parent = index.getDirectory(parentPath);
        parent && (parent.size -= file.size);
      }
    }
  };

  const reindexFile = async (path: string, stats?: Stats) => {
    deleteFile(path);
    await indexFile(path, stats);
  };

  const indexDirectory = async (path: string, stats?: Stats) => {
    stats = stats || (await stat(path));
    path = absolutePathToStorage(path);

    const { base, dir } = parse(path);

    index.index({
      type: "directory",
      path,
      parent: dir,
      depth: getPathDepth(path),
      name: base,
      size: 0,
      mtime: stats.mtimeMs,
    });
  };

  const deleteDirectory = (path: string) => {
    index.delete(absolutePathToStorage(path));
  };

  watcher
    .once("ready", () => resolve(index))
    .on("add", indexFile)
    .on("change", reindexFile)
    .on("unlink", deleteFile)
    .on("addDir", indexDirectory)
    .on("unlinkDir", deleteDirectory);
});

export function getStorageIndex() {
  return indexPromise;
}

export function getFileWeakHash(file: StorageFile) {
  return createHash("sha1")
    .update(`${file.mtime.toString(36)}-${file.size.toString(36)}-${file.path}`)
    .digest("base64")
    .substr(0, 27)
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
