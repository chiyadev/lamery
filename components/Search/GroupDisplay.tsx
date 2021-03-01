import React, { memo } from "react";
import { StorageItem } from "../../utils/storage";
import { chakra, Heading, Link, VStack } from "@chakra-ui/react";
import FileItemDisplay from "../Listing/FileItemDisplay";
import DirectoryItemDisplay from "../Listing/DirectoryItemDisplay";
import PathBreadcrumbs from "../Listing/PathBreadcrumbs";
import NextLink from "next/link";
import ListingContainer from "../Listing/ListingContainer";
import { encodeURIPath } from "../../utils/http";

export type GroupDisplayData = {
  parent: string;
  path: string;
  name: string;
  items: StorageItem[];
  score: 0;
};

const GroupDisplay = ({ group, searchPath }: { group: GroupDisplayData; searchPath: string }) => {
  return (
    <ListingContainer
      header={
        group.path !== searchPath && (
          <VStack align="start" spacing={0}>
            {group.name && group.parent !== searchPath && (
              <chakra.div fontSize="xs" color="gray.500">
                <PathBreadcrumbs value={group.parent} />
              </chakra.div>
            )}

            <Heading size="sm">
              <NextLink href={`/list${encodeURIPath(group.path)}`} passHref>
                <Link>{group.name || "/"}</Link>
              </NextLink>
            </Heading>
          </VStack>
        )
      }
    >
      {group.items.map((item) => {
        switch (item.type) {
          case "file":
            return <FileItemDisplay key={item.path} file={item} />;

          case "directory":
            return <DirectoryItemDisplay key={item.path} directory={item} />;
        }
      })}
    </ListingContainer>
  );
};

export default memo(GroupDisplay);
