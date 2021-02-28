import { createReadStream, createWriteStream, PathLike, ReadStream, WriteStream } from "fs";

export function createReadStreamAsync(path: PathLike, options?: Parameters<typeof createReadStream>[1]) {
  return new Promise<ReadStream>((resolve, reject) => {
    const stream = createReadStream(path, options);

    stream
      .once("ready", () => {
        resolve(stream);
      })
      .once("error", () => {
        stream.close();
        reject();
      });
  });
}

export function createWriteStreamAsync(path: PathLike, options?: Parameters<typeof createWriteStream>[1]) {
  return new Promise<WriteStream>((resolve, reject) => {
    const stream = createWriteStream(path, options);

    stream
      .once("ready", () => {
        resolve(stream);
      })
      .once("error", () => {
        stream.close();
        reject();
      });
  });
}

export function pipeAsync(from: NodeJS.ReadableStream, to: NodeJS.WritableStream, options?: { end?: boolean }) {
  return new Promise<void>((resolve, reject) => {
    from.once("error", reject).pipe(to, options).once("finish", resolve).once("error", reject);
  });
}
