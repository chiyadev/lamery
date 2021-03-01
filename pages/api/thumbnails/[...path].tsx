import { NextApiRequest, NextApiResponse } from "next";
import { getFileWeakHash, getStorageIndex } from "../../../utils/storage";
import { ReadStream, Stats } from "fs";
import { mkdir, rename, stat } from "fs/promises";
import { join, parse } from "path";
import { file as tempFile, root } from "tempy";
import { getFileType } from "../../../utils/file";
import { generateImageThumbnail, generateVideoThumbnail, ThumbnailFormat } from "../../../utils/thumbnail";
import { createReadStreamAsync, pipeAsync } from "../../../utils/stream";

export type GetThumbnailResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetThumbnailResponse>) => {
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
  const formatStr = ((Array.isArray(format) ? format[0] : format) || "jpeg") as ThumbnailFormat;

  switch (formatStr) {
    case "jpeg":
    case "webp":
      break;

    default:
      res.status(400).json({
        type: "failure",
        message: `Unsupported thumbnail format: ${formatStr}`,
      });

      return;
  }

  const storage = await getStorageIndex();
  const file = storage.getFile(pathStr);

  if (!file) {
    res.status(404).json({
      type: "failure",
      message: `No such file: ${pathStr}`,
    });

    return;
  }

  const lastModified = new Date(file.mtime).toUTCString();
  const hash = getFileWeakHash(file);
  const etag = `W/"${hash}"`;

  // handle cache headers
  const ifModifiedSince = req.headers["if-modified-since"];
  const ifNoneMatch = req.headers["if-none-match"];

  if (ifNoneMatch === etag || (!ifNoneMatch && ifModifiedSince === lastModified)) {
    res.status(304).end();
    return;
  }

  const cachePath = join(root, "lamery", "thumbs", hash, formatStr);

  let cacheStats: Stats;
  let stream: ReadStream | undefined;

  try {
    // try opening cache
    stream = await createReadStreamAsync(cachePath);
    cacheStats = await stat(cachePath);
  } catch {
    try {
      stream?.close();

      // cache does not exist, so write a new one
      await mkdir(parse(cachePath).dir, {
        recursive: true,
      });

      // we will write to a temporary place then move it to cache path on success
      const tempPath = tempFile({
        extension: file.ext,
      });

      switch (getFileType(file.ext)) {
        case "image":
          await generateImageThumbnail(file.path, tempPath, formatStr);
          break;

        case "video":
          await generateVideoThumbnail(file.path, tempPath, formatStr);
          break;

        default:
          res.status(400).json({
            type: "failure",
            message: `Could generate thumbnail for file: ${pathStr}`,
          });

          return;
      }

      await rename(tempPath, cachePath);

      // open the new cache file again for transfer
      stream = await createReadStreamAsync(cachePath);
      cacheStats = await stat(cachePath);
    } catch (e) {
      stream?.close();

      res.status(500).json({
        type: "failure",
        message: e.message,
      });

      return;
    }
  }

  try {
    res.statusCode = 200;

    res.setHeader("cache-control", "private, max-age=0, must-revalidate");
    res.setHeader("content-type", `image/${formatStr}`);
    res.setHeader("content-length", cacheStats.size);
    res.setHeader("last-modified", lastModified);
    res.setHeader("etag", etag);

    await pipeAsync(stream, res);
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({
        type: "failure",
        message: e.message,
      });
    }
  } finally {
    stream.close();
  }
};
