import React, { memo } from "react";
import { FileItem } from "../../utils/storage";
import CodeViewer, { TextViewerData } from "../Viewer/CodeViewer";
import Markdown from "react-markdown";
import RemarkGfm from "remark-gfm";
import { chakra, HStack, Icon, Link, VStack } from "@chakra-ui/react";
import styles from "./ReadmeDisplay.module.css";
import NextLink from "next/link";
import { FaRegFileAlt } from "react-icons/fa";

const ReadmeDisplay = ({ file, viewer }: { file: FileItem; viewer: TextViewerData }) => {
  return (
    <VStack align="stretch" spacing={2} p={4} borderRadius="md" borderWidth={1} borderColor="gray.200">
      <HStack spacing={2} color="gray.500" fontSize="sm">
        <Icon as={FaRegFileAlt} />

        <NextLink href={`/files${file.path}`} passHref>
          <Link>{file.name}</Link>
        </NextLink>
      </HStack>

      {file.ext === ".md" || file.ext === ".markdown" ? (
        <chakra.div className={styles["markdown-body"]} p={4}>
          <Markdown plugins={[RemarkGfm]}>{viewer.content}</Markdown>
        </chakra.div>
      ) : (
        <CodeViewer file={file} viewer={viewer} />
      )}
    </VStack>
  );
};

export default memo(ReadmeDisplay);
