import { getStoragePath, listFiles } from "./storage";
import { ffprobeAsync } from "./ffmpeg";
import { iso6392Map } from "./language";
import ffmpeg from "fluent-ffmpeg";
import { parse } from "path";

export const SubtitleExtensions = [".ass", ".ssa", ".srt", ".vtt"];

export type SubtitleEncodeFormat = "webvtt";
export type SubtitleStreamInfo =
  | {
      type: "embedded";
      language: string;
      stream: number;
    }
  | {
      type: "external";
      language: string;
      path: string;
    };

export async function getSubtitleList(path: string): Promise<SubtitleStreamInfo[]> {
  const { streams } = await ffprobeAsync(getStoragePath(path));
  const results: SubtitleStreamInfo[] = [];

  // self contained subtitles
  let streamId = 0;

  for (const stream of streams) {
    if (stream.codec_type === "subtitle") {
      results.push({
        type: "embedded",
        language: iso6392Map[stream.tags?.language] || "Unknown",
        stream: streamId++,
      });
    }
  }

  // external subtitles
  const pathObj = parse(path);

  for (const item of await listFiles(pathObj.dir)) {
    if (item.type === "file" && SubtitleExtensions.includes(item.ext) && parse(item.path).name === pathObj.name) {
      results.push({
        type: "external",
        language: `Unknown (${item.ext})`,
        path: item.path,
      });
    }
  }

  return results;
}

export function getEmbeddedSubtitleStream(path: string, format: SubtitleEncodeFormat, stream?: number) {
  return ffmpeg(getStoragePath(path))
    .outputOption(typeof stream === "number" ? [`-map 0:s:${stream}`] : [])
    .format(format);
}

export function getSubtitleStream(path: string, format: SubtitleEncodeFormat) {
  return ffmpeg(getStoragePath(path)).format(format);
}
