import { HStack, Icon, Link } from "@chakra-ui/react";
import React, { memo } from "react";
import { DirectoryItem } from "../../utils/storage";
import NextLink from "next/link";
import { FaFolder } from "react-icons/fa";

const DirectoryItemDisplay = ({ directory }: { directory: DirectoryItem }) => {
  return (
    <HStack spacing={2}>
      <Icon as={FaFolder} color="blue.300" />

      <NextLink href={`/list${directory.path}`} passHref>
        <Link isTruncated>{directory.name}</Link>
      </NextLink>
    </HStack>
  );
};

export default memo(DirectoryItemDisplay);
