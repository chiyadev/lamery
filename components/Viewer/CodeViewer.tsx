import { chakra } from "@chakra-ui/react";
import React, { memo } from "react";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { ghcolors } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { StorageFile } from "../../utils/storage";
import { getFileHighlighter } from "../../utils/file";

export type TextViewerData = {
  type: "text";
  content: string;
};

export const MaxTextViewerSize = 1024 * 1024;

const CodeViewer = ({ file, viewer }: { file: StorageFile; viewer: TextViewerData }) => {
  return (
    <chakra.div fontSize="lg">
      <SyntaxHighlighter
        language={getFileHighlighter(file.ext)}
        style={ghcolors}
        customStyle={{
          border: undefined,
          padding: undefined,
          margin: undefined,
        }}
        wrapLongLines
      >
        {viewer.content}
      </SyntaxHighlighter>
    </chakra.div>
  );
};

export default memo(CodeViewer);
