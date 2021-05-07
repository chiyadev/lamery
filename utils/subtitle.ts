import { getStorageIndex, StorageFile, storagePathToAbsolute } from "./storage";
import { ffprobeAsync } from "./ffmpeg";
import { iso6391Map, iso6392Map } from "./language";
import ffmpeg from "fluent-ffmpeg";
import { parse } from "path";

export const SubtitleExtensions = [".ass", ".ssa", ".srt", ".vtt"];

export type SubtitleEncodeFormat = "webvtt";
export type SubtitleInfo =
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

export async function getSubtitleList(path: string): Promise<SubtitleInfo[]> {
  const { streams } = await ffprobeAsync(storagePathToAbsolute(path));
  const results: SubtitleInfo[] = [];

  // find self contained subtitles
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

  // find external subtitles
  const storage = await getStorageIndex();
  const pathObj = parse(path);

  // all external subtitles starting with the same name as the video are eligible
  for (const item of storage.filterFiles(`${pathObj.dir}/${pathObj.name}`)) {
    if (SubtitleExtensions.includes(item.ext)) {
      results.push({
        type: "external",
        language: `${inferLangFromFile(item) || "Unknown"} (${item.ext})`,
        path: item.path,
      });
    }
  }

  return results;
}

function inferLangFromFile(file: StorageFile) {
  const name = file.name.substr(0, file.name.length - file.ext.length);
  const lang = parse(name).ext.substr(1); // [video name].[lang].(vtt/ssa/etc)

  return iso6391Map[lang] || iso6392Map[lang];
}

export function getEmbeddedSubtitleStream(path: string, format: SubtitleEncodeFormat, stream?: number) {
  return ffmpeg(storagePathToAbsolute(path))
    .outputOption(typeof stream === "number" ? [`-map 0:s:${stream}`] : [])
    .format(format);
}

export function getSubtitleStream(path: string, format: SubtitleEncodeFormat) {
  return ffmpeg(storagePathToAbsolute(path)).format(format);
}
