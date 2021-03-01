import { chakra, Link } from "@chakra-ui/react";
import React, { memo } from "react";
import NextLink from "next/link";
import { encodeURIPath } from "../../utils/http";

const PathBreadcrumbs = ({ value }: { value: string }) => {
  const parts = value === "/" ? [""] : value.split("/");

  return (
    <chakra.div minW={0} isTruncated>
      {parts.map((part, i) => {
        const href = `/list/${encodeURIPath(parts.slice(1, i + 1).join("/"))}`;

        return (
          <NextLink key={i} href={href} passHref>
            <Link>{part} / </Link>
          </NextLink>
        );
      })}
    </chakra.div>
  );
};

export default memo(PathBreadcrumbs);
