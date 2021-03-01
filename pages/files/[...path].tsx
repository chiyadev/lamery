import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";
import { FileItem, getFileAsString, getFileInfo } from "../../utils/storage";
import { parse } from "path";
import React from "react";
import { Button, chakra, Code, Heading, Icon, Link, VStack } from "@chakra-ui/react";
import { Stats } from "fs";
import PathBreadcrumbs from "../../components/Listing/PathBreadcrumbs";
import FileViewer, { ViewerData } from "../../components/Viewer/FileViewer";
import { FaChevronLeft } from "react-icons/fa";
import NextLink from "next/link";
import { getFileType } from "../../utils/file";
import { getSubtitleList } from "../../utils/subtitle";
import { MaxTextViewerSize } from "../../components/Viewer/CodeViewer";
import FileInfoText from "../../components/Viewer/FileInfoText";
import Header from "../../components/Header";
import HeaderButtons from "../../components/Viewer/HeaderButtons";
import { encodeURIPath } from "../../utils/http";

type Props =
  | SuccessProps
  | {
      type: "notFound";
      path: string;
      parent: string;
    }
  | {
      type: "failure";
      message: string;
      parent: string;
    };

type SuccessProps = {
  type: "success";
  file: FileItem;
  parent: string;
  viewer: ViewerData | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { path }, res }) => {
  const pathStr = `/${(Array.isArray(path) ? path.join("/") : path) || ""}`;
  const pathObj = parse(pathStr);

  let stats: Stats;
  let viewer: SuccessProps["viewer"] = null;

  try {
    stats = await getFileInfo(pathStr);

    if (!stats.isFile()) {
      res.statusCode = 404;

      return {
        props: {
          type: "notFound",
          path: pathStr,
          parent: pathObj.dir,
        },
      };
    }

    switch (getFileType(pathObj.ext)) {
      case "text":
      case "code":
        if (stats.size <= MaxTextViewerSize) {
          viewer = {
            type: "text",
            content: await getFileAsString(pathStr),
          };
        }

        break;

      case "video":
        viewer = {
          type: "video",
          subtitles: await getSubtitleList(pathStr),
        };

        break;
    }
  } catch (e) {
    switch (e.code) {
      case "ENOENT":
        res.statusCode = 404;

        return {
          props: {
            type: "notFound",
            path: pathStr,
            parent: pathObj.dir,
          },
        };

      default:
        res.statusCode = 500;

        return {
          props: {
            type: "failure",
            message: e.message,
            parent: pathObj.dir,
          },
        };
    }
  }

  return {
    props: {
      type: "success",
      file: {
        type: "file",
        name: pathObj.base,
        path: pathStr,
        ext: pathObj.ext,
        size: stats.size,
        mtime: stats.mtimeMs,
      },
      viewer,
      parent: pathObj.dir,
    },
  };
};

const FilePage = (props: Props) => {
  switch (props.type) {
    case "success":
      return <Content {...props} />;

    default:
      return (
        <Layout title={["Not Found"]}>
          <VStack align="start" spacing={4}>
            {props.type === "notFound" ? (
              <>
                <Heading size="md">404 Not Found</Heading>
                <div>Could not find the requested file.</div>
                <Code>{props.path}</Code>
              </>
            ) : (
              <>
                <Heading size="md">500 Internal Server Error</Heading>
                <div>Please try again later.</div>
                <Code>{props.message}</Code>
              </>
            )}

            <NextLink href={`/list${encodeURIPath(props.parent)}`} passHref>
              <Button as="a" size="sm" leftIcon={<Icon as={FaChevronLeft} />}>
                Back
              </Button>
            </NextLink>
          </VStack>
        </Layout>
      );
  }
};

const Content = ({ file, parent, viewer }: SuccessProps) => {
  return (
    <Layout title={[file.name]}>
      <Header buttons={<HeaderButtons file={file} />}>
        <VStack align="stretch" spacing={0}>
          <chakra.div fontSize="sm" color="gray.500">
            <PathBreadcrumbs value={parent} />
          </chakra.div>

          <Heading size="md" isTruncated>
            <Link href={`/api/files${encodeURIPath(file.path)}`} isExternal>
              {file.name}
            </Link>
          </Heading>
        </VStack>
      </Header>

      <FileInfoText file={file} />

      <div key={file.path}>
        <FileViewer file={file} viewer={viewer || undefined} />
      </div>
    </Layout>
  );
};

export default FilePage;
