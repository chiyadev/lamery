import { GetServerSideProps } from "next";
import React, { memo } from "react";
import Layout from "../../components/Layout";
import GroupDisplay, { GroupDisplayData } from "../../components/Search/GroupDisplay";
import { chakra, Heading, Link, VStack } from "@chakra-ui/react";
import { compare } from "natural-orderby";
import QueryInput from "../../components/Search/QueryInput";
import { performance } from "perf_hooks";
import Header from "../../components/Header";
import PathBreadcrumbs from "../../components/Listing/PathBreadcrumbs";
import { parse } from "path";
import { getStorageIndex, normalizePath, StorageDirectory } from "../../utils/storage";
import NextLink from "next/link";
import HeaderButtons from "../../components/Listing/HeaderButtons";
import { encodeURIPath } from "../../utils/http";

type Props = {
  directory: StorageDirectory;
  query: string;
  total: number;
  elapsed: number;
  results: GroupDisplayData[];
};

export const MaxSearchResults = 500;

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { query, path } }) => {
  const pathStr = normalizePath(`/${(Array.isArray(path) ? path.join("/") : path) || ""}`);
  const queryStr = (Array.isArray(query) ? query[0] : query) || "";

  const start = performance.now();
  const storage = await getStorageIndex();
  const directory = storage.getDirectory(pathStr);

  if (!directory) {
    return {
      redirect: {
        permanent: false,
        destination: "/search",
      },
    };
  }

  const { matches } = await storage.search(queryStr, {
    prefix: true,
    fuzzy: 1 / 3,
    combineWith: "AND",
  });

  const groups = new Map<string, GroupDisplayData>();
  let total = 0;

  for (const { doc, score } of matches) {
    if (doc.path === pathStr || !doc.path.startsWith(pathStr)) {
      continue;
    }

    let group = groups.get(doc.parent);

    if (!group) {
      const groupPath = parse(doc.parent);

      groups.set(
        doc.parent,
        (group = {
          path: doc.parent,
          parent: groupPath.dir,
          depth: doc.depth - 1,
          name: groupPath.base,
          entries: [],
          score: 0,
        })
      );
    }

    group.entries.push(doc);
    group.score += score;

    total++;
  }

  const comparer = compare();
  let filtered = 0;

  const results = Array.from(groups.values())
    .sort((a, b) => {
      const depth = a.depth - b.depth;
      if (depth) return depth;

      const score = b.score / b.entries.length - a.score / a.entries.length;
      if (score) return score;

      return comparer(a.path, b.path);
    })
    .filter(({ entries }, i) => !i || (filtered += entries.length) <= MaxSearchResults);

  for (const group of results) {
    group.entries.sort((a, b) => {
      const type = a.type.localeCompare(b.type);
      if (type) return type;

      return comparer(a.path, b.path);
    });
  }

  return {
    props: {
      directory,
      query: queryStr,
      total,
      elapsed: performance.now() - start,
      results,
    },
  };
};

const SearchPage = ({ directory, query, total, elapsed, results }: Props) => {
  return (
    <Layout title={[query || "Search"]}>
      <Header buttons={<HeaderButtons directory={directory} />}>
        <VStack align="stretch" spacing={0}>
          {directory.path !== "/" && (
            <chakra.div fontSize="sm" color="gray.500">
              <PathBreadcrumbs value={directory.parent} />
            </chakra.div>
          )}

          <Heading size="md" isTruncated>
            <NextLink href={`/list${encodeURIPath(directory.path)}`} passHref>
              <Link>{directory.name || "/"}</Link>
            </NextLink>
          </Heading>
        </VStack>
      </Header>

      <VStack align="stretch" spacing={2}>
        <chakra.div fontSize="sm" color="gray.500">
          {total} results ({(elapsed / 1000).toFixed(2)} seconds)
        </chakra.div>

        <QueryInput query={query} />
      </VStack>

      {results.map((group) => (
        <GroupDisplay key={group.path} group={group} searchPath={directory.path} />
      ))}
    </Layout>
  );
};

export default memo(SearchPage);
