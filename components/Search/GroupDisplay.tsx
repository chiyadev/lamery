import React, { memo } from "react";
import { StorageItem } from "../../utils/storage";
import { chakra, Heading, Link, StackDivider, VStack } from "@chakra-ui/react";
import FileItemDisplay from "../Listing/FileItemDisplay";
import DirectoryItemDisplay from "../Listing/DirectoryItemDisplay";
import PathBreadcrumbs from "../Listing/PathBreadcrumbs";
import NextLink from "next/link";

export type GroupDisplayData = {
  parent: string;
  path: string;
  name: string;
  items: StorageItem[];
};

const GroupDisplay = ({ group, searchPath }: { group: GroupDisplayData; searchPath: string }) => {
  console.log("group path", group.path, searchPath);

  return (
    <VStack align="stretch" spacing={0} borderRadius="md" borderWidth={1} borderColor="gray.200">
      {group.path !== searchPath && (
        <VStack align="start" spacing={0} bg="gray.100" p={4}>
          {group.name && group.parent !== searchPath && (
            <chakra.div fontSize="xs" color="gray.500">
              <PathBreadcrumbs value={group.parent} />
            </chakra.div>
          )}

          <Heading size="sm">
            <NextLink href={`/list${group.path}`} passHref>
              <Link>{group.name || "/"}</Link>
            </NextLink>
          </Heading>
        </VStack>
      )}

      <VStack align="stretch" spacing={2} px={4} py={2} divider={<StackDivider />}>
        {group.items.map((item) => {
          switch (item.type) {
            case "file":
              return <FileItemDisplay key={item.path} file={item} />;

            case "directory":
              return <DirectoryItemDisplay key={item.path} directory={item} />;
          }
        })}
      </VStack>
    </VStack>
  );
};

export default memo(GroupDisplay);
