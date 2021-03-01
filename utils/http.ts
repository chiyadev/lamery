export function encodeURIPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function decodeURIPath(path: string) {
  return path.split("/").map(decodeURIComponent).join("/");
}
