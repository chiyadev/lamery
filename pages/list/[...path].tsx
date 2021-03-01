import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";
import { getStorageIndex, normalizePath, StorageDirectory, StorageEntry, StorageFile } from "../../utils/storage";
import FileItemDisplay from "../../components/Listing/FileItemDisplay";
import DirectoryItemDisplay from "../../components/Listing/DirectoryItemDisplay";
import ListingContainer from "../../components/Listing/ListingContainer";
import BackItemDisplay from "../../components/Listing/BackItemDisplay";
import React from "react";
import { chakra, Heading, Link, VStack } from "@chakra-ui/react";
import PathBreadcrumbs from "../../components/Listing/PathBreadcrumbs";
import { MaxTextViewerSize, TextViewerData } from "../../components/Viewer/CodeViewer";
import { getFileType } from "../../utils/file";
import ReadmeDisplay from "../../components/Listing/ReadmeDisplay";
import Header from "../../components/Header";
import HeaderButtons from "../../components/Listing/HeaderButtons";
import { encodeURIPath } from "../../utils/http";
import { compare } from "natural-orderby";

type Props = {
  directory: StorageDirectory;
  entries: StorageEntry[];
  readme: null | ReadmeData;
};

type ReadmeData = {
  file: StorageFile;
  viewer: TextViewerData;
};

const readmeNames = ["readme", "index"];

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { path } }) => {
  const pathStr = normalizePath(`/${(Array.isArray(path) ? path.join("/") : path) || ""}`);
  const storage = await getStorageIndex();

  const directory = storage.getDirectory(pathStr);

  if (!directory) {
    return {
      redirect: {
        permanent: false,
        destination: `/files${encodeURIPath(pathStr)}`,
      },
    };
  }

  const comparer = compare();
  const entries = storage
    .filterEntries(directory.path + "/")
    .filter((entry) => entry !== directory)
    .sort((a, b) => {
      const type = a.type.localeCompare(b.type);
      if (type) return type;

      return comparer(a.name, b.name);
    });

  let readme: ReadmeData | null = null;
  const readmeEntry = entries.find(
    (entry) =>
      entry.type === "file" &&
      readmeNames.includes(entry.name.substr(0, entry.name.length - entry.ext.length).toLowerCase()) &&
      getFileType(entry.ext) === "text" &&
      entry.size <= MaxTextViewerSize
  );

  if (readmeEntry) {
    readme = {
      file: readmeEntry as StorageFile,
      viewer: {
        type: "text",
        content: await storage.getFileAsString(readmeEntry.path),
      },
    };
  }

  return {
    props: {
      directory,
      entries,
      readme,
    },
  };
};

const ListPage = ({ directory, entries, readme }: Props) => {
  return (
    <Layout title={[directory.name]}>
      <Header buttons={<HeaderButtons directory={directory} />}>
        <VStack align="stretch" spacing={0}>
          {directory.path !== "/" && (
            <chakra.div fontSize="sm" color="gray.500">
              <PathBreadcrumbs value={directory.parent} />
            </chakra.div>
          )}

          <Heading size="md" isTruncated>
            <Link href={`/list${encodeURIPath(directory.path)}`} isExternal>
              {directory.name || "/"}
            </Link>
          </Heading>
        </VStack>
      </Header>

      <ListingContainer>
        {directory.name && <BackItemDisplay path={directory.parent} />}

        {entries.map((item) => {
          switch (item.type) {
            case "file":
              return <FileItemDisplay key={item.path} file={item} />;

            case "directory":
              return <DirectoryItemDisplay key={item.path} directory={item} />;
          }
        })}
      </ListingContainer>

      {readme && <ReadmeDisplay file={readme.file} viewer={readme.viewer} />}
    </Layout>
  );
};

export default ListPage;
