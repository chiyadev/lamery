import { chakra, HStack, Icon, Link } from "@chakra-ui/react";
import React, { memo, ReactNode } from "react";
import { StorageDirectory } from "../../utils/storage";
import NextLink from "next/link";
import { FaFolder } from "react-icons/fa";
import { encodeURIPath } from "../../utils/http";
import prettyBytes from "next/dist/lib/pretty-bytes";

const DirectoryItemDisplay = ({ directory, info }: { directory: StorageDirectory; info?: ReactNode }) => {
  return (
    <HStack spacing={2}>
      <Icon as={FaFolder} color="blue.300" />

      <chakra.div flex={1} isTruncated minW={0}>
        <NextLink href={`/list${encodeURIPath(directory.path)}`} passHref>
          <Link>{directory.name}</Link>
        </NextLink>
      </chakra.div>

      {info || (
        <chakra.div fontSize="xs" color="gray.500">
          {prettyBytes(directory.size)}
        </chakra.div>
      )}
    </HStack>
  );
};

export default memo(DirectoryItemDisplay);
