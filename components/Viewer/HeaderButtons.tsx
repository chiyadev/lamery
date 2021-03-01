import React, { memo } from "react";
import { StorageFile } from "../../utils/storage";
import { FaDownload } from "react-icons/fa";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { encodeURIPath } from "../../utils/http";

const HeaderButtons = ({ file }: { file: StorageFile }) => {
  return (
    <Tooltip label="Download">
      <IconButton
        as="a"
        aria-label="Download"
        icon={<Icon as={FaDownload} />}
        variant="ghost"
        href={`/api/files${encodeURIPath(file.path)}?attach=true`}
      />
    </Tooltip>
  );
};

export default memo(HeaderButtons);
