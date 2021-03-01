import React, { memo } from "react";
import ListingContainer from "../Listing/ListingContainer";
import { chakra, Heading, HStack, Icon, Link } from "@chakra-ui/react";
import { getFileIcon } from "../Listing/FileItemDisplay";
import NextLink from "next/link";
import prettyBytes from "next/dist/lib/pretty-bytes";

export type ExtensionInfo = {
  name: string;
  count: number;
  size: number;
};

const CommonExtensionsList = ({ items }: { items: ExtensionInfo[] }) => {
  return (
    <ListingContainer header={<Heading size="sm">Common file types</Heading>}>
      {items.map((item) => (
        <HStack key={item.name} spacing={2}>
          <Icon as={getFileIcon({ ext: item.name })} color="gray.500" />

          <chakra.div flex={1} isTruncated minW={0}>
            <NextLink href={`/search?query=${encodeURIComponent(item.name)}`} passHref>
              <Link>
                <code>{item.name}</code>
              </Link>
            </NextLink>{" "}
            <chakra.span color="gray.500" fontSize="sm">
              ({item.count})
            </chakra.span>
          </chakra.div>

          <chakra.span color="gray.500" fontSize="xs">
            {prettyBytes(item.size)}
          </chakra.span>
        </HStack>
      ))}
    </ListingContainer>
  );
};

export default memo(CommonExtensionsList);
