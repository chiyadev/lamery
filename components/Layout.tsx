import React, { Fragment, memo, ReactNode } from "react";
import Head from "next/head";
import { chakra, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

const Layout = ({
  children,
  title = [],
  footer,
}: {
  children?: ReactNode;
  title?: (string | undefined)[];
  footer?: ReactNode[];
}) => {
  return (
    <>
      <Head>
        <title>
          {[...title.map((x) => x?.trim()).filter((x) => x), process.env.NEXT_PUBLIC_APP_NAME || "lamery"].join(" · ")}
        </title>
      </Head>

      <VStack align="stretch" spacing={4} maxW="1200px" mx="auto" p={4}>
        {children}

        <chakra.div color="gray.500" fontSize="sm">
          <span>
            <span>powered by </span>
            <Link href="https://github.com/chiyadev/lamery" isExternal color="blue.500">
              lamery
            </Link>
          </span>

          <span> · </span>
          <NextLink href="/statistics" passHref>
            <Link>statistics</Link>
          </NextLink>

          <span> · </span>
          <NextLink href="/random" passHref>
            <Link>random</Link>
          </NextLink>

          {footer?.map(
            (node, i) =>
              node && (
                <Fragment key={i}>
                  <span> · </span>
                  {node}
                </Fragment>
              )
          )}
        </chakra.div>
      </VStack>
    </>
  );
};

export default memo(Layout);
