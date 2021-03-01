import { chakra, HStack, Icon, Link } from "@chakra-ui/react";
import React, { memo, ReactNode, useState } from "react";
import { FileItem } from "../../utils/storage";
import {
  FaRegFile,
  FaRegFileAlt,
  FaRegFileArchive,
  FaRegFileAudio,
  FaRegFileCode,
  FaRegFileExcel,
  FaRegFileImage,
  FaRegFilePdf,
  FaRegFilePowerpoint,
  FaRegFileVideo,
  FaRegFileWord,
} from "react-icons/fa";
import NextLink from "next/link";
import { FileType, getFileType } from "../../utils/file";
import FileItemPreviewPopover from "./FileItemPreviewPopover";
import { encodeURIPath } from "../../utils/http";

export function getFileIcon(type: FileType) {
  switch (type) {
    case "word":
      return FaRegFileWord;

    case "text":
      return FaRegFileAlt;

    case "video":
      return FaRegFileVideo;

    case "powerpoint":
      return FaRegFilePowerpoint;

    case "pdf":
      return FaRegFilePdf;

    case "image":
      return FaRegFileImage;

    case "excel":
      return FaRegFileExcel;

    case "code":
      return FaRegFileCode;

    case "audio":
      return FaRegFileAudio;

    case "archive":
      return FaRegFileArchive;

    default:
      return FaRegFile;
  }
}

const FileItemDisplay = ({ file, info }: { file: FileItem; info?: ReactNode }) => {
  const [preview, setPreview] = useState(false);

  return (
    <FileItemPreviewPopover visible={preview} file={file}>
      <HStack spacing={2}>
        <Icon as={getFileIcon(getFileType(file.ext))} color="gray.500" />

        <chakra.div flex={1} isTruncated minW={0}>
          <NextLink href={`/files${encodeURIPath(file.path)}`} passHref>
            <Link
              onMouseEnter={() => setPreview(true)}
              onMouseMove={() => setPreview(true)}
              onMouseLeave={() => setPreview(false)}
            >
              {file.name}
            </Link>
          </NextLink>
        </chakra.div>

        {info}
      </HStack>
    </FileItemPreviewPopover>
  );
};

export default memo(FileItemDisplay);
