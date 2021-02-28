import iso6392 from "iso-639-2";

export const iso6392Map = iso6392.reduce((a, b) => {
  a[b.iso6392B] = b.name;
  return a;
}, {} as Record<string, string>);
