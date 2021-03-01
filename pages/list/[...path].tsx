import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";
import { DirectoryItem, FileItem, getFileAsString, getFileInfo, listFiles, StorageItem } from "../../utils/storage";
import FileItemDisplay from "../../components/Listing/FileItemDisplay";
import DirectoryItemDisplay from "../../components/Listing/DirectoryItemDisplay";
import ListingContainer from "../../components/Listing/ListingContainer";
import { parse } from "path";
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

type Props = {
  directory: DirectoryItem;
  parent: string;
  results: StorageItem[];
  readme: null | ReadmeData;
};

type ReadmeData = {
  file: FileItem;
  viewer: TextViewerData;
};

const readmeFilenames = ["readme", "index"];

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { path } }) => {
  const pathStr = `/${(Array.isArray(path) ? path.join("/") : path) || ""}`;
  const pathObj = parse(pathStr);

  try {
    const stats = await getFileInfo(pathStr);

    if (!stats.isDirectory()) {
      return {
        redirect: {
          permanent: false,
          destination: `/files${encodeURIPath(pathStr)}`,
        },
      };
    }
  } catch (e) {
    switch (e.code) {
      case "ENOENT":
        return {
          redirect: {
            permanent: false,
            destination: `/files${encodeURIPath(pathStr)}`,
          },
        };

      default:
        // ignored
        break;
    }
  }

  const results = await listFiles(pathStr);

  let readme: null | ReadmeData = null;

  for (const item of results) {
    if (item.type === "file") {
      const { name, ext } = parse(item.name);

      if (
        readmeFilenames.includes(name.toLowerCase()) &&
        getFileType(ext) === "text" &&
        item.size <= MaxTextViewerSize
      ) {
        readme = {
          file: item,
          viewer: {
            type: "text",
            content: await getFileAsString(item.path),
          },
        };

        break;
      }
    }
  }

  return {
    props: {
      directory: {
        type: "directory",
        path: pathStr,
        name: pathObj.base,
      },
      parent: pathObj.dir,
      results,
      readme,
    },
  };
};

const ListPage = ({ directory, parent, results, readme }: Props) => {
  return (
    <Layout title={[directory.name]}>
      <Header buttons={<HeaderButtons directory={directory} />}>
        <VStack align="stretch" spacing={0}>
          {directory.name && (
            <chakra.div fontSize="sm" color="gray.500">
              <PathBreadcrumbs value={parent} />
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
        {directory.name && <BackItemDisplay path={parent} />}

        {results.map((item) => {
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
