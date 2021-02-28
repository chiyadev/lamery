import { readFile, stat } from "fs/promises";
import { resolve, sep } from "path";
import { fdir } from "fdir";
import { compare } from "natural-orderby";
import { createReadStreamAsync } from "./stream";

export let StorageBasePath = resolve(process.env.LISTING_PATH || ".");

if (StorageBasePath.endsWith(sep)) {
  StorageBasePath = StorageBasePath.slice(0, -1);
}

export type StorageItem = FileItem | DirectoryItem;

export type FileItem = {
  type: "file";
  name: string;
  path: string;
  ext: string;
  size: number;
  mtime: number;
};

export type DirectoryItem = {
  type: "directory";
  name: string;
  path: string;
};

const sepRegex = /[\/\\]/g;

export function getRelativeStoragePath(path: string) {
  return path.substr(StorageBasePath.length).replace(sepRegex, "/");
}

export async function listFilesRaw(path: string, depth = 0) {
  const paths = await new fdir().withMaxDepth(depth).withBasePath().crawl(getStoragePath(path)).withPromise();
  const results: string[] = [];

  if (Array.isArray(paths)) {
    for (const item of paths) {
      if (typeof item === "string") {
        results.push(getRelativeStoragePath(item));
      }
    }
  }

  return results.sort(compare());
}

export async function listDirectoriesRaw(path: string, depth = 0) {
  const paths = await new fdir()
    .onlyDirs()
    .withMaxDepth(depth + 1)
    .withBasePath()
    .crawl(getStoragePath(path))
    .withPromise();

  const results: string[] = [];

  if (Array.isArray(paths)) {
    for (const item of paths) {
      if (typeof item === "string") {
        results.push(getRelativeStoragePath(item));
      }
    }
  }

  return results.slice(1).sort(compare()); // slice(1) because the first result is crawl directory itself
}

export async function listFiles(path: string, depth = 0) {
  try {
    const results: StorageItem[] = [];
    const namePrefix = path === "/" ? 1 : path.length + 1;

    (await listDirectoriesRaw(path, depth)).forEach((path) => {
      results.push({
        type: "directory",
        name: path.substr(namePrefix),
        path,
      });
    });

    await Promise.all(
      (await listFilesRaw(path, depth)).map(async (path) => {
        try {
          const stats = await getFileInfo(path);
          const ext = path.lastIndexOf(".");

          results.push({
            type: "file",
            name: path.substr(namePrefix),
            path,
            ext: ext === -1 ? "" : path.substr(ext),
            size: stats.size,
            mtime: stats.mtimeMs,
          });
        } catch {
          // ignored
        }
      })
    );

    const comparer = compare();

    return results.sort((a, b) => {
      const type = a.type.localeCompare(b.type);
      if (type) return type;

      return comparer(a.path, b.path);
    });
  } catch {
    // ignored
    return [];
  }
}

export async function getFileInfo(path: string) {
  return await stat(getStoragePath(path));
}

export function getFileAsStream(path: string, range?: [number, number | undefined]) {
  return createReadStreamAsync(getStoragePath(path), {
    start: range ? range[0] : undefined,
    end: range && range[1] ? range[1] : undefined,
  });
}

export async function getFileAsString(path: string) {
  const buffer = await readFile(getStoragePath(path));
  return buffer.toString("utf-8");
}

export function getStoragePath(...parts: string[]) {
  const segments: string[] = [StorageBasePath];

  for (const part of parts) {
    for (const segment of part.split("/")) {
      segment && segments.push(segment);
    }
  }

  return segments.join("/");
}
