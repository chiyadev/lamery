import { memo } from "react";
import { StorageFile } from "../../utils/storage";
import ImageViewer from "./ImageViewer";
import VideoViewer, { VideoViewerData } from "./VideoViewer";
import DownloadFallback from "./DownloadFallback";
import CodeViewer, { TextViewerData } from "./CodeViewer";
import { getFileType } from "../../utils/file";
import AudioViewer from "./AudioViewer";

export type ViewerData = TextViewerData | VideoViewerData;

const FileViewer = ({ file, viewer, next }: { file: StorageFile; viewer?: ViewerData; next?: StorageFile }) => {
  switch (getFileType(file.ext)) {
    case "image":
      return <ImageViewer file={file} />;

    case "audio":
      return <AudioViewer file={file} autoplay={next} />;

    case "video":
      if (viewer?.type === "video") {
        return <VideoViewer file={file} viewer={viewer} autoplay={next} />;
      }

      break;

    case "text":
    case "code":
      if (viewer?.type === "text") {
        return <CodeViewer file={file} viewer={viewer} />;
      }

      break;
  }

  return <DownloadFallback file={file} />;
};

export default memo(FileViewer);
