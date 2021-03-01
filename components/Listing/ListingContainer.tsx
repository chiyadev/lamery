import { chakra, StackDivider, VStack } from "@chakra-ui/react";
import React, { memo, ReactNode } from "react";

const ListingContainer = ({ header, children }: { header?: ReactNode; children?: ReactNode }) => {
  if (header) {
    return (
      <VStack align="stretch" spacing={0} borderRadius="md" borderWidth={1} borderColor="gray.200">
        <chakra.div bg="gray.100" p={4}>
          {header}
        </chakra.div>

        <VStack align="stretch" spacing={2} px={4} py={2} divider={<StackDivider />}>
          {children}
        </VStack>
      </VStack>
    );
  } else {
    return (
      <VStack
        align="stretch"
        spacing={2}
        px={4}
        py={2}
        borderRadius="md"
        borderWidth={1}
        borderColor="gray.200"
        divider={<StackDivider />}
      >
        {children}
      </VStack>
    );
  }
};

export default memo(ListingContainer);
