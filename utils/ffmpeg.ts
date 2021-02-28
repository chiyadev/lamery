import { FfmpegCommand, ffprobe, FfprobeData, setFfmpegPath, setFfprobePath } from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

setFfmpegPath(ffmpegPath);
setFfprobePath(ffprobePath);

export async function pipeFfmpeg(
  command: FfmpegCommand,
  to: NodeJS.WritableStream,
  options?: {
    onStart?: () => void;
    onData?: (chunk: any) => void;
    end?: boolean;
  }
) {
  return new Promise<void>((resolve, reject) => {
    command
      .once("error", reject)
      .once("end", () => {
        const end = options?.end;

        if (typeof end === "undefined" || end) {
          to.end();
        }

        resolve();
      })
      .pipe()
      .once("data", () => options?.onStart?.())
      .on("data", (chunk) => {
        to.write(chunk);
        options?.onData?.(chunk);
      });
  });
}

export function execFfmpeg(command: FfmpegCommand) {
  return new Promise<void>((resolve, reject) => {
    command.once("end", resolve).once("error", reject).run();
  });
}

export function ffprobeAsync(file: string, ...options: string[]) {
  return new Promise<FfprobeData>((resolve, reject) => {
    ffprobe(file, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
