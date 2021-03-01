import { chakra, HStack, Icon, Link } from "@chakra-ui/react";
import React, { memo, ReactNode, useState } from "react";
import { StorageFile } from "../../utils/storage";
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
import { getFileType } from "../../utils/file";
import FileItemPreviewPopover from "./FileItemPreviewPopover";
import { encodeURIPath } from "../../utils/http";
import prettyBytes from "next/dist/lib/pretty-bytes";

export function getFileIcon(file: Pick<StorageFile, "ext">) {
  switch (getFileType(file.ext)) {
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

const FileItemDisplay = ({ file, info }: { file: StorageFile; info?: ReactNode }) => {
  const [preview, setPreview] = useState(false);

  return (
    <FileItemPreviewPopover visible={preview} file={file}>
      <HStack spacing={2}>
        <Icon as={getFileIcon(file)} color="gray.500" />

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

        {info || (
          <chakra.div fontSize="xs" color="gray.500">
            {prettyBytes(file.size)}
          </chakra.div>
        )}
      </HStack>
    </FileItemPreviewPopover>
  );
};

export default memo(FileItemDisplay);
