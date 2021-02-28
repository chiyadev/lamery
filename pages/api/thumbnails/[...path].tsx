import { NextApiRequest, NextApiResponse } from "next";
import { getFileInfo } from "../../../utils/storage";
import { ReadStream, Stats } from "fs";
import { mkdir, rename, stat } from "fs/promises";
import getEtag from "etag";
import { join, parse } from "path";
import { file, root } from "tempy";
import { getFileType } from "../../../utils/file";
import { generateImageThumbnail, generateVideoThumbnail, ThumbnailFormat } from "../../../utils/thumbnail";
import { createReadStreamAsync, pipeAsync } from "../../../utils/stream";

export type GetThumbnailResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetThumbnailResponse>) => {
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

  // stat file first to retrieve metadata
  let stats: Stats;

  try {
    stats = await getFileInfo(pathStr);

    if (!stats.isFile()) {
      res.status(404).json({
        type: "failure",
        message: `Not a file: ${pathStr}`,
      });

      return;
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

  // compute cache-related fields
  const lastModified = stats.mtime.toUTCString();
  const etag = getEtag(stats);

  const ifModifiedSince = req.headers["if-modified-since"];
  const ifNoneMatch = req.headers["if-none-match"];

  // if-none-match has precedence
  if (ifNoneMatch === etag || (!ifNoneMatch && ifModifiedSince === lastModified)) {
    res.status(304).end();
    return;
  }

  const cachePath = join(root, "lamery", "thumbs", formatStr, stats.mtimeMs.toString(), pathStr);
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
      const tempPath = file({
        extension: pathObj.ext,
      });

      switch (getFileType(pathObj.ext)) {
        case "image":
          await generateImageThumbnail(pathStr, tempPath, formatStr);
          break;

        case "video":
          await generateVideoThumbnail(pathStr, tempPath, formatStr);
          break;

        default:
          res.status(400).json({
            type: "failure",
            message: `Cannot generate thumbnail for file: ${pathStr}`,
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
    res.setHeader("content-type", "image/jpeg");
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
