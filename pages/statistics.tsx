import Layout from "../components/Layout";
import { GetServerSideProps } from "next";
import React from "react";
import { Heading, Link, VStack } from "@chakra-ui/react";
import Header from "../components/Header";
import { getStorageIndex } from "../utils/storageSearch";
import { DirectoryItem, FileItem } from "../utils/storage";
import { performance } from "perf_hooks";
import LargeFileList from "../components/Statistics/LargeFileList";
import CommonExtensionsList, { ExtensionInfo } from "../components/Statistics/CommonExtensionsList";
import prettyBytes from "next/dist/lib/pretty-bytes";

type Props = {
  commonExtensions: ExtensionInfo[];
  largeFiles: FileItem[];
  total: {
    files: number;
    directories: number;
  };
  elapsed: number;
  aggregateSize: number;
};

export const MaxExtensionCount = 10;
export const MaxLargeFileCount = 200;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const start = performance.now();

  const index = await getStorageIndex();
  const items = Array.from(index.store.values());
  const files = items.filter((item) => item.type === "file") as FileItem[];
  const directories = items.filter((item) => item.type === "directory") as DirectoryItem[];

  const commonExtensions: ExtensionInfo[] = Object.values(
    files.reduce((a, b) => {
      let entry = a[b.ext];

      if (!entry) {
        a[b.ext] = entry = {
          name: b.ext,
          count: 0,
          size: 0,
        };
      }

      entry.count++;
      entry.size += b.size;

      return a;
    }, {} as Record<string, ExtensionInfo>)
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, MaxExtensionCount);

  const largeFiles = files.sort((a, b) => b.size - a.size).slice(0, MaxLargeFileCount);

  return {
    props: {
      commonExtensions,
      largeFiles,
      total: {
        files: files.length,
        directories: directories.length,
      },
      elapsed: performance.now() - start,
      aggregateSize: files.reduce((a, b) => a + b.size, 0),
    },
  };
};

const ListPage = ({ commonExtensions, largeFiles, total, elapsed, aggregateSize }: Props) => {
  return (
    <Layout title={["Statistics"]}>
      <Header>
        <Heading size="md" isTruncated>
          <Link href="/statistics" isExternal>
            Statistics
          </Link>
        </Heading>
      </Header>

      <VStack align="start" spacing={1} fontSize="sm" color="gray.500">
        <VStack align="start" spacing={0}>
          <div>
            {total.files + total.directories} results ({(elapsed / 1000).toFixed(2)} seconds)
          </div>
          <div>
            {total.files} files and {total.directories} directories
          </div>
        </VStack>

        <div>
          <strong>{prettyBytes(aggregateSize)}</strong> in total
        </div>
      </VStack>

      {!!commonExtensions.length && <CommonExtensionsList items={commonExtensions} />}
      {!!largeFiles.length && <LargeFileList items={largeFiles} />}
    </Layout>
  );
};

export default ListPage;
