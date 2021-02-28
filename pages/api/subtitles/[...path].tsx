import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "path";
import { getFileInfo } from "../../../utils/storage";
import { Stats } from "fs";
import getEtag from "etag";
import { getEmbeddedSubtitleStream, getSubtitleStream, SubtitleExtensions } from "../../../utils/subtitle";
import { getFileType } from "../../../utils/file";
import { FfmpegCommand } from "fluent-ffmpeg";
import { pipeFfmpeg } from "../../../utils/ffmpeg";

export type GetSubtitleResponse = {
  type: "failure";
  message: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<GetSubtitleResponse>) => {
  // only allow GET
  if (req.method !== "GET") {
    res.status(405).json({
      type: "failure",
      message: "Only GET method is allowed.",
    });

    return;
  }

  const { path, stream } = req.query;
  const pathStr = `/${(Array.isArray(path) ? path.join("/") : path) || ""}`;
  const pathObj = parse(pathStr);
  const streamIndex = parseInt((Array.isArray(stream) ? stream[0] : stream) || "0");

  if (isNaN(streamIndex)) {
    res.status(400).json({
      type: "failure",
      message: "Invalid stream index.",
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

  let command: FfmpegCommand | undefined;

  try {
    // if path points to a subtitle file, convert it to webvtt
    if (SubtitleExtensions.includes(pathObj.ext)) {
      command = await getSubtitleStream(pathStr, "webvtt");
    }

    // if path points to a video file, read embedded subtitle as webvtt
    else if (getFileType(pathObj.ext) === "video") {
      command = await getEmbeddedSubtitleStream(pathStr, "webvtt", streamIndex);
    }

    //
    else {
      throw Error(`Unsupported subtitle file: ${pathStr}`);
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
