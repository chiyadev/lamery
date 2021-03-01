import React, { memo } from "react";
import { StorageFile } from "../../utils/storage";
import CodeViewer, { TextViewerData } from "../Viewer/CodeViewer";
import { chakra, HStack, Icon, Link, VStack } from "@chakra-ui/react";
import styles from "./ReadmeDisplay.module.css";
import NextLink from "next/link";
import { FaRegFileAlt } from "react-icons/fa";
import { encodeURIPath } from "../../utils/http";
import Markdown from "../Markdown";

const ReadmeDisplay = ({ file, viewer }: { file: StorageFile; viewer: TextViewerData }) => {
  return (
    <VStack align="stretch" spacing={2} p={4} borderRadius="md" borderWidth={1} borderColor="gray.200">
      <HStack spacing={2} color="gray.500" fontSize="sm">
        <Icon as={FaRegFileAlt} />

        <NextLink href={`/files${encodeURIPath(file.path)}`} passHref>
          <Link>{file.name}</Link>
        </NextLink>
      </HStack>

      {file.ext === ".md" || file.ext === ".markdown" ? (
        <chakra.div className={styles["markdown-body"]} p={4}>
          <Markdown basePath={file.parent}>{viewer.content}</Markdown>
        </chakra.div>
      ) : (
        <CodeViewer file={file} viewer={viewer} />
      )}
    </VStack>
  );
};

export default memo(ReadmeDisplay);
