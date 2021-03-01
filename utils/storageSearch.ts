import { getRelativeStoragePath, StorageBasePath, StorageItem } from "./storage";
import { watch } from "chokidar";
import { Stats } from "fs";
import { stat } from "fs/promises";
import { MemorySearch } from "./search";
import { parse } from "path";

const promise = new Promise<MemorySearch<StorageItem>>((resolve) => {
  const index = new MemorySearch<StorageItem>({
    idField: "path",
    fields: ["path"],
  });

  const watcher = watch(StorageBasePath, {
    persistent: true,
  });

  async function indexFile(path: string, stats?: Stats) {
    try {
      stats = stats || (await stat(path));
      path = getRelativeStoragePath(path);

      const { base: name, ext } = parse(path);

      index.index({
        type: "file",
        path,
        name,
        ext,
        size: stats.size,
        mtime: stats.mtimeMs,
      });
    } catch {
      // ignored
    }
  }

  async function indexDirectory(path: string) {
    try {
      path = getRelativeStoragePath(path);

      index.index({
        type: "directory",
        path,
        name: parse(path).base,
      });
    } catch {
      // ignored
    }
  }

  async function deleteEntry(path: string) {
    try {
      index.delete(getRelativeStoragePath(path));
    } catch {
      // ignored
    }
  }

  watcher
    .once("ready", () => resolve(index))
    .on("add", indexFile)
    .on("addDir", indexDirectory)
    .on("change", indexFile)
    .on("unlink", deleteEntry)
    .on("unlinkDir", deleteEntry);
});

export function getStorageIndex() {
  return promise;
}
