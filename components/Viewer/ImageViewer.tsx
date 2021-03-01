import { StorageFile } from "../../utils/storage";
import { memo } from "react";
import { encodeURIPath } from "../../utils/http";

const ImageViewer = ({ file }: { file: StorageFile }) => {
  return <img alt={file.name} src={`/api/files${encodeURIPath(file.path)}`} />;
};

export default memo(ImageViewer);
