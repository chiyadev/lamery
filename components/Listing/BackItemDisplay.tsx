import { Link } from "@chakra-ui/react";
import React, { memo } from "react";
import NextLink from "next/link";

const BackItemDisplay = ({ path }: { path: string }) => {
  return (
    <NextLink href={`/list${path}`} passHref>
      <Link>...</Link>
    </NextLink>
  );
};

export default memo(BackItemDisplay);
