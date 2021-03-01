import { StorageFile } from "../../utils/storage";
import React, { memo } from "react";
import { Button, Icon } from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";
import { encodeURIPath } from "../../utils/http";

const DownloadFallback = ({ file }: { file: StorageFile }) => {
  return (
    <Button
      as="a"
      size="sm"
      leftIcon={<Icon as={FaDownload} />}
      href={`/api/files${encodeURIPath(file.path)}?attach=true`}
    >
      Download
    </Button>
  );
};

export default memo(DownloadFallback);
