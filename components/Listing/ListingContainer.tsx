import { StackDivider, VStack } from "@chakra-ui/react";
import React, { memo, ReactNode } from "react";

const ListingContainer = ({ children }: { children?: ReactNode }) => {
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
};

export default memo(ListingContainer);
