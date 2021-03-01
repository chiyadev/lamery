import { Link } from "@chakra-ui/react";
import React, { memo } from "react";
import NextLink from "next/link";
import { encodeURIPath } from "../../utils/http";

const BackItemDisplay = ({ path }: { path: string }) => {
  return (
    <NextLink href={`/list${encodeURIPath(path)}`} passHref>
      <Link>...</Link>
    </NextLink>
  );
};

export default memo(BackItemDisplay);
