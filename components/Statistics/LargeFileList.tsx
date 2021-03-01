import React, { memo } from "react";
import ListingContainer from "../Listing/ListingContainer";
import { chakra, Heading, Progress } from "@chakra-ui/react";
import FileItemDisplay from "../Listing/FileItemDisplay";
import prettyBytes from "next/dist/lib/pretty-bytes";
import { FileItem } from "../../utils/storage";

const LargeFileList = ({ items }: { items: FileItem[] }) => {
  return (
    <ListingContainer header={<Heading size="sm">Largest files</Heading>}>
      {items.map((file) => (
        <FileItemDisplay
          key={file.path}
          file={file}
          info={
            <>
              <chakra.span color="gray.500" fontSize="xs">
                {prettyBytes(file.size)}
              </chakra.span>

              <Progress max={1} w={32} value={file.size / items[0].size} colorScheme="cyan" borderRadius="full" />
            </>
          }
        />
      ))}
    </ListingContainer>
  );
};

export default memo(LargeFileList);
