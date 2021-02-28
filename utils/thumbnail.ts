import sharp from "sharp";
import { getFileAsStream, getStoragePath } from "./storage";
import { createWriteStreamAsync, pipeAsync } from "./stream";
import { execFfmpeg, ffprobeAsync } from "./ffmpeg";
import ffmpeg from "fluent-ffmpeg";

export type ThumbnailFormat = "jpeg" | "webp";
export const MaxThumbnailDimension = 300;
export const MaxThumbnailQuality = 60;

export function createImageThumbnailTransform(format: ThumbnailFormat) {
  return sharp()
    .resize(MaxThumbnailDimension, MaxThumbnailDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(format, {
      quality: MaxThumbnailQuality,
    });
}

export async function generateImageThumbnail(path: string, destination: string, format: ThumbnailFormat) {
  const transform = createImageThumbnailTransform(format);
  const src = await getFileAsStream(path);
  const dest = await createWriteStreamAsync(destination);

  await pipeAsync(src.pipe(transform), dest);
}

export async function generateVideoThumbnail(path: string, destination: string, format: ThumbnailFormat) {
  const {
    streams,
    format: { duration },
  } = await ffprobeAsync(getStoragePath(path));

  let { width, height } = streams.find((stream) => stream.codec_type === "video") || {};

  if (!width || !height || !duration) {
    throw Error(`Video has no valid streams: ${path}`);
  }

  const scale = Math.min(1, Math.min(MaxThumbnailDimension / width, MaxThumbnailDimension / height));
  width *= scale;
  height *= scale;

  let ffFormat: string;

  switch (format) {
    case "jpeg":
      ffFormat = "mjpeg";
      break;

    case "webp":
      ffFormat = "webp";
      break;
  }

  await execFfmpeg(
    ffmpeg(getStoragePath(path))
      .seekInput(duration / 2)
      .noAudio()
      .format(ffFormat)
      .output(destination)
      .outputOption("-map", "0:v:0")
      .outputOption("-q", (10 - MaxThumbnailQuality / 10).toFixed(0))
      .frames(1)
      .size(`${Math.floor(width)}x${Math.floor(height)}`)
  );
}
