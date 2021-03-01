import React, { memo } from "react";
import { StorageEntry } from "../../utils/storage";
import { chakra, Heading, Link, VStack } from "@chakra-ui/react";
import FileItemDisplay from "../Listing/FileItemDisplay";
import DirectoryItemDisplay from "../Listing/DirectoryItemDisplay";
import PathBreadcrumbs from "../Listing/PathBreadcrumbs";
import NextLink from "next/link";
import ListingContainer from "../Listing/ListingContainer";
import { encodeURIPath } from "../../utils/http";

export type GroupDisplayData = {
  path: string;
  parent: string;
  depth: number;
  name: string;
  entries: StorageEntry[];
  score: 0;
};

const GroupDisplay = ({ group, searchPath }: { group: GroupDisplayData; searchPath: string }) => {
  return (
    <ListingContainer
      header={
        group.path !== searchPath && (
          <VStack align="start" spacing={0}>
            {group.parent !== searchPath && (
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
      {group.entries.map((entry) => {
        switch (entry.type) {
          case "file":
            return <FileItemDisplay key={entry.path} file={entry} />;

          case "directory":
            return <DirectoryItemDisplay key={entry.path} directory={entry} />;
        }
      })}
    </ListingContainer>
  );
};

export default memo(GroupDisplay);
