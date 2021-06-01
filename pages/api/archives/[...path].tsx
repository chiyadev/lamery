import { NextApiRequest, NextApiResponse } from "next";
import { getStorageIndex, storagePathToAbsolute } from "../../../utils/storage";
import archiver from "archiver";
import { pipeAsync } from "../../../utils/stream";

export type GetArchiveResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetArchiveResponse>) => {
  // only accept GET
  if (req.method !== "GET") {
    res.status(405).json({
      type: "failure",
      message: "Only GET method is allowed.",
    });

    return;
  }

  const { path, format } = req.query;
  const pathStr = (Array.isArray(path) ? path.join("/") : path) || "";
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

  const storage = await getStorageIndex();
  const entry = storage.get(pathStr);

  if (!entry) {
    res.status(404).json({
      type: "failure",
      message: `No such file: ${pathStr}`,
    });

    return;
  }

  const archive = archiver("zip", {
    zlib: {
      level: 9,
    },
  });

  switch (entry.type) {
    case "file":
      archive.file(storagePathToAbsolute(entry.path), {
        name: entry.name,
        date: new Date(entry.mtime),
      });

      break;

    case "directory":
      const prefix = entry.path + "/";

      for (const file of storage.filterFiles(prefix, Infinity)) {
        archive.file(storagePathToAbsolute(file.path), {
          name: file.path.substr(prefix.length),
          date: new Date(file.mtime),
        });
      }

      break;
  }

  try {
    res.setHeader("cache-control", "private, no-store");
    res.setHeader("content-type", "application/zip");
    res.setHeader("content-disposition", `attachment; filename*=UTF-8''${entry.name}.zip`);

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
