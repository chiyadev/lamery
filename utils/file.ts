export type FileType =
  | "word"
  | "text"
  | "video"
  | "powerpoint"
  | "pdf"
  | "image"
  | "excel"
  | "code"
  | "audio"
  | "archive"
  | "other";

export function getFileType(ext: string): FileType {
  switch (ext.toLowerCase()) {
    case ".doc":
    case ".docx":
    case ".gdoc":
    case ".odt":
    case ".rtf":
    case ".wpd":
      return "word";

    case ".tex":
    case ".text":
    case ".txt":
    case ".md":
    case ".markdown":
    case ".json":
    case ".cfg":
    case ".config":
    case ".ini":
    case ".info":
    case ".log":
    case ".inf":
    case ".xml":
    case ".yml":
    case ".yaml":
    case ".tml":
    case ".toml":
      return "text";

    case ".3g2":
    case ".3gp":
    case ".avi":
    case ".flv":
    case ".h264":
    case ".m4v":
    case ".mkv":
    case ".mov":
    case ".mp4":
    case ".mpg":
    case ".mpeg":
    case ".rm":
    case ".swf":
    case ".vob":
    case ".wmv":
    case ".webm":
      return "video";

    case ".pot":
    case ".potm":
    case ".potx":
    case ".ppa":
    case ".ppam":
    case ".pps":
    case ".ppsm":
    case ".ppsx":
    case ".ppt":
    case ".pptm":
    case ".pptx":
      return "powerpoint";

    case ".pdf":
      return "pdf";

    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
    case ".webp":
    case ".tif":
    case ".tiff":
    case ".bmp":
    case ".heif":
    case ".svg":
    case ".eps":
    case ".ps":
    case ".psd":
    case ".ai":
    case ".xcf":
    case ".indd":
    case ".ico":
    case ".img":
    case ".raw":
    case ".sai":
      return "image";

    case ".csv":
    case ".ods":
    case ".xls":
    case ".xlsm":
    case ".xlsx":
      return "excel";

    case ".bat":
    case ".c":
    case ".cgi":
    case ".class":
    case ".cmd":
    case ".cpp":
    case ".cs":
    case ".css":
    case ".d":
    case ".go":
    case ".h":
    case ".hpp":
    case ".java":
    case ".js":
    case ".jsx":
    case ".kt":
    case ".m":
    case ".make":
    case ".php":
    case ".pl":
    case ".py":
    case ".r":
    case ".rb":
    case ".rs":
    case ".scala":
    case ".sh":
    case ".sql":
    case ".swift":
    case ".ts":
    case ".tsx":
    case ".vb":
    case ".xaml":
      return "code";

    case ".aif":
    case ".cda":
    case ".flac":
    case ".mid":
    case ".midi":
    case ".mp3":
    case ".mpa":
    case ".ogg":
    case ".wav":
    case ".wma":
    case ".wpl":
      return "audio";

    case ".7z":
    case ".arj":
    case ".deb":
    case ".gz":
    case ".pkg":
    case ".rar":
    case ".rpm":
    case ".tar":
    case ".z":
    case ".zip":
      return "archive";

    default:
      return "other";
  }
}

export function getFileHighlighter(ext: string) {
  switch (ext) {
    case ".tex":
      return "latex";

    case ".md":
    case ".markdown":
      return "markdown";

    case ".json":
      return "json";

    case ".ini":
      return "ini";

    case ".xml":
      return "xml";

    case ".yml":
    case ".yaml":
      return "yaml";

    case ".tml":
    case ".toml":
      return "toml";

    case ".bat":
    case ".cmd":
      return "batch";

    case ".c":
    case ".h":
      return "c";

    case ".cpp":
    case ".hpp":
      return "cpp";

    case ".cs":
      return "csharp";

    case ".css":
      return "css";

    case ".d":
      return "d";

    case ".go":
      return "go";

    case ".java":
      return "java";

    case ".js":
      return "js";

    case ".jsx":
      return "jsx";

    case ".kt":
      return "kotlin";

    case ".m":
      return "objectivec";

    case ".make":
      return "makefile";

    case ".php":
      return "php";

    case ".pl":
      return "perl";

    case ".py":
      return "python";

    case ".r":
      return "r";

    case ".rb":
      return "ruby";

    case ".rs":
      return "rust";

    case ".scala":
      return "scala";

    case ".sh":
      return "bash";

    case ".sql":
      return "sql";

    case ".swift":
      return "swift";

    case ".ts":
      return "typescript";

    case ".tsx":
      return "tsx";

    case ".vb":
      return "visual-basic";
  }
}
