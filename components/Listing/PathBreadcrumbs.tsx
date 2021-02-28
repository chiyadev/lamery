import { Link, Wrap, WrapItem } from "@chakra-ui/react";
import React, { memo } from "react";
import NextLink from "next/link";

const PathBreadcrumbs = ({ value }: { value: string }) => {
  const parts = value === "/" ? [""] : value.split(/[\/\\]/g);

  return (
    <Wrap spacing={1}>
      {parts.map((part, i) => {
        const href = `/list/${parts.slice(1, i + 1).join("/")}`;

        return (
          <WrapItem key={i}>
            <NextLink href={href} passHref>
              <Link>{part} /</Link>
            </NextLink>
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default memo(PathBreadcrumbs);
