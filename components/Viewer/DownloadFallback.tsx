import { FileItem } from "../../utils/storage";
import React, { memo } from "react";
import { Button, Icon } from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";

const DownloadFallback = ({ file }: { file: FileItem }) => {
  return (
    <Button as="a" size="sm" leftIcon={<Icon as={FaDownload} />} href={`/api/files${file.path}?attach=true`}>
      Download
    </Button>
  );
};

export default memo(DownloadFallback);
