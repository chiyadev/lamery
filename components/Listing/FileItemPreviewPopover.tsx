import React, { memo, ReactNode, useState } from "react";
import { chakra, Popover, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import { FileItem } from "../../utils/storage";
import { getFileType } from "../../utils/file";
import { encodeURIPath } from "../../utils/http";

const FileItemPreviewPopover = ({
  visible,
  file,
  children,
}: {
  visible: boolean;
  file: FileItem;
  children?: ReactNode;
}) => {
  const [loaded, setLoaded] = useState(false);

  switch (getFileType(file.ext)) {
    case "image":
    case "video":
      return (
        <Popover isOpen={visible && loaded} trigger="hover" placement="bottom-start" isLazy={!visible}>
          <PopoverTrigger>{children}</PopoverTrigger>
          <PopoverContent overflow="hidden" d="inline-block">
            <picture>
              <source type="image/webp" srcSet={`/api/thumbnails${encodeURIPath(file.path)}?format=webp`} />

              <chakra.img
                ref={(element) => {
                  if (element) {
                    element.addEventListener("load", () => setLoaded(true));
                  }
                }}
                alt={file.name}
                src={`/api/thumbnails${encodeURIPath(file.path)}`}
                maxH="xs"
              />
            </picture>
          </PopoverContent>
        </Popover>
      );

    default:
      return <>{children}</>;
  }
};

export default memo(FileItemPreviewPopover);
