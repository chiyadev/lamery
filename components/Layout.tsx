import React, { memo, ReactNode } from "react";
import Head from "next/head";
import { chakra, Link, VStack } from "@chakra-ui/react";

const Layout = ({ children, title = [] }: { children?: ReactNode; title?: (string | undefined)[] }) => {
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
            <Link href="https://github.com/chiyadev/lamery" isExternal>
              lamery
            </Link>
          </span>
        </chakra.div>
      </VStack>
    </>
  );
};

export default memo(Layout);
