import { ButtonGroup, chakra, HStack } from "@chakra-ui/react";
import React, { memo, ReactNode } from "react";

const Header = ({ buttons, children }: { buttons?: ReactNode; children?: ReactNode }) => {
  return (
    <HStack spacing={4}>
      <chakra.nav flex={1} minW={0}>
        {children}
      </chakra.nav>

      {buttons && <ButtonGroup isAttached>{buttons}</ButtonGroup>}
    </HStack>
  );
};

export default memo(Header);
