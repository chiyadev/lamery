import { GetServerSideProps } from "next";
import React, { memo } from "react";
import Layout from "../../components/Layout";
import { getStorageIndex } from "../../utils/storageSearch";
import GroupDisplay, { GroupDisplayData } from "../../components/Search/GroupDisplay";
import { chakra, Heading, Link, VStack } from "@chakra-ui/react";
import { compare } from "natural-orderby";
import QueryInput from "../../components/Search/QueryInput";
import { performance } from "perf_hooks";
import Header from "../../components/Header";
import PathBreadcrumbs from "../../components/Listing/PathBreadcrumbs";
import { parse } from "path";
import { DirectoryItem } from "../../utils/storage";
import NextLink from "next/link";
import HeaderButtons from "../../components/Listing/HeaderButtons";
import { encodeURIPath } from "../../utils/http";

type Props = {
  directory: DirectoryItem;
  parent: string;
  query: string;
  total: number;
  elapsed: number;
  results: GroupDisplayData[];
};

export const MaxSearchResults = 1000;

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { query, path } }) => {
  const pathStr = `/${(Array.isArray(path) ? path.join("/") : path) || ""}`;
  const pathObj = parse(pathStr);
  const queryStr = (Array.isArray(query) ? query[0] : query) || "";
  const start = performance.now();

  const index = await getStorageIndex();
  const { matches } = await index.search(queryStr, {
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

    const groupPath = parse(doc.path).dir;
    let group = groups.get(groupPath);

    if (!group) {
      groups.set(
        groupPath,
        (group = {
          parent: parse(groupPath).dir,
          path: groupPath,
          name: parse(groupPath).base,
          items: [],
          score: 0,
        })
      );
    }

    group.items.push(doc);
    group.score += score;

    total++;
  }

  const comparer = compare();
  let filtered = 0;

  const results = Array.from(groups.values())
    .sort((a, b) => {
      const depth = a.path.split("/").length - b.path.split("/").length;
      if (depth) return depth;

      const score = b.score / b.items.length - a.score / a.items.length;
      if (score) return score;

      return comparer(a.path, b.path);
    })
    .filter(({ items }, i) => !i || (filtered += items.length) <= MaxSearchResults);

  for (const group of results) {
    group.items.sort((a, b) => {
      const type = a.type.localeCompare(b.type);
      if (type) return type;

      return comparer(a.path, b.path);
    });
  }

  return {
    props: {
      directory: {
        type: "directory",
        path: pathStr,
        name: pathObj.base,
      },
      parent: pathObj.dir,
      query: queryStr,
      total,
      elapsed: performance.now() - start,
      results,
    },
  };
};

const SearchPage = ({ directory, parent, query, total, elapsed, results }: Props) => {
  return (
    <Layout title={[query || "Search"]}>
      <Header buttons={<HeaderButtons directory={directory} />}>
        <VStack align="stretch" spacing={0}>
          {directory.name && (
            <chakra.div fontSize="sm" color="gray.500">
              <PathBreadcrumbs value={parent} />
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
