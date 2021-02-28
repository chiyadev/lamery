import { FileItem } from "../../utils/storage";
import React, { memo } from "react";
import { VStack } from "@chakra-ui/react";
import prettyBytes from "next/dist/lib/pretty-bytes";
import { getFileType } from "../../utils/file";

const FileInfoText = ({ file }: { file: FileItem }) => {
  return (
    <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
      <div>Type: {getFileType(file.ext)}</div>
      <div>Size: {prettyBytes(file.size)}</div>
      <div>Last modified: {new Date(file.mtime).toLocaleString()}</div>
    </VStack>
  );
};

export default memo(FileInfoText);
