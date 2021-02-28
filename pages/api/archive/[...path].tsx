import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "path";
import { getFileInfo, getStoragePath, listFilesRaw } from "../../../utils/storage";
import { Stats } from "fs";
import archiver, { Archiver } from "archiver";
import { pipeAsync } from "../../../utils/stream";

export type GetArchiveResponse = {
  type: "failure";
  message: string;
};

function addArchiveFile(archive: Archiver, base: string, path: string, stats: Stats) {
  archive.file(getStoragePath(base, path), {
    name: path,
    date: stats.mtime,
    stats,
  });
}

async function addArchiveDirectory(archive: Archiver, base: string) {
  await Promise.all(
    (await listFilesRaw(base, Infinity)).map(async (path) => {
      try {
        const stats = await getFileInfo(path);

        if (stats.isFile()) {
          addArchiveFile(archive, base, path.substr(base.length), stats);
        }
      } catch {
        // ignored
      }
    })
  );
}

export default async (req: NextApiRequest, res: NextApiResponse<GetArchiveResponse>) => {
  // only allow GET
  if (req.method !== "GET") {
    res.status(405).json({
      type: "failure",
      message: "Only GET method is allowed.",
    });

    return;
  }

  const { path, format } = req.query;
  const pathStr = `/${(Array.isArray(path) ? path.join("/") : path) || ""}`;
  const pathObj = parse(pathStr);
  const formatStr = (Array.isArray(format) ? format[0] : format) || "zip";

  switch (formatStr) {
    case "zip":
    case "tar":
      break;

    default:
      res.status(400).json({
        type: "failure",
        message: `Unsupported archive format: ${formatStr}`,
      });

      return;
  }

  // stat file first to retrieve metadata
  let stats: Stats;
  let archive: Archiver;

  try {
    stats = await getFileInfo(pathStr);

    archive = archiver("zip", {
      comment: req.url,
      zlib: {
        level: 9,
      },
    });

    if (stats.isFile()) {
      addArchiveFile(archive, pathObj.dir, pathObj.base, stats);
    } else if (stats.isDirectory()) {
      await addArchiveDirectory(archive, pathStr);
    }
  } catch (e) {
    switch (e.code) {
      case "ENOENT":
        res.status(404).json({
          type: "failure",
          message: `No such file: ${pathStr}`,
        });

        return;

      default:
        res.status(500).json({
          type: "failure",
          message: e.message,
        });

        return;
    }
  }

  try {
    res.setHeader("cache-control", "private, no-store");
    res.setHeader("content-type", "application/zip");
    res.setHeader("content-disposition", "attachment");

    await Promise.all([archive.finalize(), pipeAsync(archive, res)]);
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({
        type: "failure",
        message: e.message,
      });
    }
  } finally {
    archive.destroy();
  }
};
