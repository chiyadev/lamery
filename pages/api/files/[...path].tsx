import { NextApiRequest, NextApiResponse } from "next";
import { getFileWeakHash, getStorageIndex } from "../../../utils/storage";
import { contentType } from "mime-types";
import parseRange from "range-parser";
import { pipeAsync } from "../../../utils/stream";

export type GetFileResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetFileResponse>) => {
  // only accept GET
  if (req.method !== "GET") {
    res.status(405).json({
      type: "failure",
      message: "Only GET method is allowed.",
    });

    return;
  }

  const { path, attach } = req.query;
  const pathStr = (Array.isArray(path) ? path.join("/") : path) || "";
  const attachFlag = (Array.isArray(attach) ? attach[0] : attach) === "true";

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
  const etag = `W/"${getFileWeakHash(file)}"`;

  // range handling
  let start = 0;
  let end = file.size - 1;
  let partial = false;

  if (req.headers.range) {
    const ifRange = req.headers["if-range"];

    if (!ifRange || ifRange === lastModified || ifRange === etag) {
      // parse range header
      const result = parseRange(file.size, req.headers.range, {
        combine: true,
      });

      if (result === -2) {
        res.status(400).json({
          type: "failure",
          message: `Invalid range header: ${req.headers.range}`,
        });

        return;
      }

      if (result === -1 || result.type !== "bytes" || result.length !== 1) {
        res.setHeader("content-range", `bytes */${file.size}`);
        res.status(416).json({
          type: "failure",
          message: `Specified range is not satisfiable.`,
        });

        return;
      }

      ({ start, end } = result[0]);
      partial = true;
    }
  } else {
    // handle cache headers
    const ifModifiedSince = req.headers["if-modified-since"];
    const ifNoneMatch = req.headers["if-none-match"];

    if (ifNoneMatch === etag || (!ifNoneMatch && ifModifiedSince === lastModified)) {
      res.status(304).end();
      return;
    }
  }

  try {
    // open file as stream
    const stream = await storage.getFileAsStream(file.path, { start, end });

    try {
      if (partial) {
        res.statusCode = 206;

        res.setHeader("content-range", `bytes ${start}-${end}/${file.size}`);
        res.setHeader("vary", "range");
      } else {
        res.statusCode = 200;
      }

      res.setHeader("accept-ranges", "bytes");
      res.setHeader("cache-control", "private, max-age=0, must-revalidate");
      res.setHeader("content-type", contentType(file.ext) || "application/octet-stream");
      res.setHeader("content-length", end - start + 1);
      res.setHeader("content-disposition", attachFlag ? "attachment" : "inline");
      res.setHeader("last-modified", lastModified);
      res.setHeader("etag", etag);

      await pipeAsync(stream, res);
    } finally {
      stream.close();
    }
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({
        type: "failure",
        message: e.message,
      });
    }
  }
};
