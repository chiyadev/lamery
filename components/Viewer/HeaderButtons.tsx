import React, { memo } from "react";
import { FileItem } from "../../utils/storage";
import { FaDownload } from "react-icons/fa";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";

const HeaderButtons = ({ file }: { file: FileItem }) => {
  return (
    <Tooltip label="Download">
      <IconButton
        as="a"
        aria-label="Download"
        icon={<Icon as={FaDownload} />}
        variant="ghost"
        href={`/api/files${file.path}?attach=true`}
      />
    </Tooltip>
  );
};

export default memo(HeaderButtons);
