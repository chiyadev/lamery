import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";
import { getStorageIndex, normalizePath, StorageFile } from "../../utils/storage";
import { parse } from "path";
import React from "react";
import { Button, ButtonGroup, chakra, Code, Heading, Icon, Link, VStack } from "@chakra-ui/react";
import PathBreadcrumbs from "../../components/Listing/PathBreadcrumbs";
import FileViewer, { ViewerData } from "../../components/Viewer/FileViewer";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import NextLink from "next/link";
import { getFileType } from "../../utils/file";
import { getSubtitleList } from "../../utils/subtitle";
import { MaxTextViewerSize } from "../../components/Viewer/CodeViewer";
import FileInfoText from "../../components/Viewer/FileInfoText";
import Header from "../../components/Header";
import HeaderButtons from "../../components/Viewer/HeaderButtons";
import { encodeURIPath } from "../../utils/http";
import { compare } from "natural-orderby";
import LinkTooltipButton from "../../components/LinkTooltipButton";

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
  file: StorageFile;
  previous: StorageFile | null;
  next: StorageFile | null;
  viewer: ViewerData | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { path }, res }) => {
  const pathStr = normalizePath(`/${(Array.isArray(path) ? path.join("/") : path) || ""}`);
  const storage = await getStorageIndex();

  const file = storage.getFile(pathStr);
  let viewer: SuccessProps["viewer"] = null;

  if (!file) {
    if (storage.getDirectory(pathStr)) {
      return {
        redirect: {
          permanent: false,
          destination: `/list${encodeURIPath(pathStr)}`,
        },
      };
    }

    res.statusCode = 404;

    return {
      props: {
        type: "notFound",
        path: pathStr,
        parent: parse(pathStr).dir,
      },
    };
  }

  try {
    switch (getFileType(file.ext)) {
      case "text":
      case "code":
        if (file.size <= MaxTextViewerSize) {
          viewer = {
            type: "text",
            content: await storage.getFileAsString(file.path),
          };
        }

        break;

      case "video":
        viewer = {
          type: "video",
          subtitles: await getSubtitleList(file.path),
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
            parent: parse(pathStr).dir,
          },
        };

      default:
        res.statusCode = 500;

        return {
          props: {
            type: "failure",
            message: e.message,
            parent: parse(pathStr).dir,
          },
        };
    }
  }

  const comparer = compare();
  const siblings = storage.filterFiles(file.parent + "/").sort((a, b) => {
    const type = a.type.localeCompare(b.type);
    if (type) return type;

    return comparer(a.name, b.name);
  });

  const index = siblings.indexOf(file);
  const previous = siblings[index - 1] || null;
  const next = siblings[index + 1] || null;

  return {
    props: {
      type: "success",
      file,
      previous,
      next,
      viewer,
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

const Content = ({ file, previous, next, viewer }: SuccessProps) => {
  return (
    <Layout title={[file.name]}>
      <Header buttons={<HeaderButtons file={file} />}>
        <VStack align="stretch" spacing={0}>
          <chakra.div fontSize="sm" color="gray.500">
            <PathBreadcrumbs value={file.parent} />
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
        <FileViewer file={file} viewer={viewer || undefined} next={next || undefined} />
      </div>

      <ButtonGroup isAttached>
        <LinkTooltipButton
          href={previous ? `/files${encodeURIPath(previous.path)}` : undefined}
          label={previous?.name}
          tooltip={{ placement: "bottom-start" }}
          size="sm"
          leftIcon={<Icon as={FaChevronLeft} />}
          isDisabled={!previous}
        >
          Previous
        </LinkTooltipButton>

        <LinkTooltipButton
          href={next ? `/files${encodeURIPath(next.path)}` : undefined}
          label={next?.name}
          tooltip={{ placement: "bottom-start" }}
          size="sm"
          rightIcon={<Icon as={FaChevronRight} />}
          isDisabled={!next}
          colorScheme="blue"
        >
          Next
        </LinkTooltipButton>
      </ButtonGroup>
    </Layout>
  );
};

export default FilePage;
