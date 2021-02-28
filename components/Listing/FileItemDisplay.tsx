import { HStack, Icon, Link } from "@chakra-ui/react";
import React, { memo, useState } from "react";
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

function getIcon(type: FileType) {
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

const FileItemDisplay = ({ file }: { file: FileItem }) => {
  const [preview, setPreview] = useState(false);

  return (
    <FileItemPreviewPopover visible={preview} file={file}>
      <HStack spacing={2}>
        <Icon as={getIcon(getFileType(file.ext))} color="gray.500" />

        <NextLink href={`/files${file.path}`} passHref>
          <Link
            isTruncated
            onMouseEnter={() => setPreview(true)}
            onMouseMove={() => setPreview(true)}
            onMouseLeave={() => setPreview(false)}
          >
            {file.name}
          </Link>
        </NextLink>
      </HStack>
    </FileItemPreviewPopover>
  );
};

export default memo(FileItemDisplay);
