import { FileItem } from "../../utils/storage";
import { memo } from "react";

const ImageViewer = ({ file }: { file: FileItem }) => {
  return <img alt={file.name} src={`/api/files${file.path}`} />;
};

export default memo(ImageViewer);
