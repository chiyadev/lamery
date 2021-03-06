import { NextApiRequest, NextApiResponse } from "next";
import { getFileWeakHash, getStorageIndex } from "../../../utils/storage";
import { getEmbeddedSubtitleStream, getSubtitleStream, SubtitleExtensions } from "../../../utils/subtitle";
import { getFileType } from "../../../utils/file";
import { FfmpegCommand } from "fluent-ffmpeg";
import { pipeFfmpeg } from "../../../utils/ffmpeg";

export type GetSubtitleResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetSubtitleResponse>) => {
  // only accept GET
  if (req.method !== "GET") {
    res.status(405).json({
      type: "failure",
      message: "Only GET method is allowed.",
    });

    return;
  }

  const { path, stream } = req.query;
  const pathStr = (Array.isArray(path) ? path.join("/") : path) || "";
  const streamIndex = parseInt((Array.isArray(stream) ? stream[0] : stream) || "0");

  if (isNaN(streamIndex)) {
    res.status(400).json({
      type: "failure",
      message: "Invalid stream index.",
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
  const etag = `W/"${getFileWeakHash(file)}"`;

  // handle cache headers
  const ifModifiedSince = req.headers["if-modified-since"];
  const ifNoneMatch = req.headers["if-none-match"];

  if (ifNoneMatch === etag || (!ifNoneMatch && ifModifiedSince === lastModified)) {
    res.status(304).end();
    return;
  }

  let command: FfmpegCommand | undefined;

  try {
    // if path points to a subtitle file, convert it to webvtt
    if (SubtitleExtensions.includes(file.ext)) {
      command = await getSubtitleStream(file.path, "webvtt");
    }

    // if path points to a video file, read embedded subtitle as webvtt
    else if (getFileType(file.ext) === "video") {
      command = await getEmbeddedSubtitleStream(file.path, "webvtt", streamIndex);
    }

    //
    else {
      res.status(400).json({
        type: "failure",
        message: `Unsupported subtitle file: ${pathStr}`,
      });

      return;
    }

    await pipeFfmpeg(command, res, {
      onStart: () => {
        res.statusCode = 200;

        res.setHeader("cache-control", "private, max-age=0, must-revalidate");
        res.setHeader("content-type", "text/vtt");
        res.setHeader("last-modified", lastModified);
        res.setHeader("etag", etag);
      },
    });
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({
        type: "failure",
        message: e.message,
      });
    }
  } finally {
    command?.kill("SIGKILL");
  }
};
