import MarkdownCore from "react-markdown";
import React, { ComponentProps, memo } from "react";
import RemarkGfm from "remark-gfm";
import isAbsoluteUrl from "is-absolute-url";
import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { ghcolors } from "react-syntax-highlighter/dist/cjs/styles/prism";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

const Markdown = ({
  basePath = "",
  transformLinkUri,
  transformImageUri,
  renderers,
  ...props
}: ComponentProps<typeof MarkdownCore> & { basePath?: string }) => {
  return (
    <MarkdownCore
      plugins={[RemarkGfm]}
      transformLinkUri={(uri) => {
        if (transformLinkUri) {
          return transformLinkUri(uri);
        }

        if (isAbsoluteUrl(uri)) {
          return uri;
        }

        if (!uri.startsWith("/")) {
          uri = `${basePath}/${uri}`;
        }

        return "/list" + uri;
      }}
      transformImageUri={(uri) => {
        if (transformImageUri) {
          return transformImageUri(uri);
        }

        if (isAbsoluteUrl(uri)) {
          return uri;
        }

        if (!uri.startsWith("/")) {
          uri = `${basePath}/${uri}`;
        }

        return "/api/files" + uri;
      }}
      renderers={{
        code: ({ language, value }) => {
          return (
            <SyntaxHighlighter
              style={ghcolors}
              language={language}
              customStyle={{
                backgroundColor: undefined,
                border: undefined,
                padding: undefined,
                margin: undefined,
              }}
              wrapLongLines
              children={value}
            />
          );
        },
        link: ({ href, children }) => {
          if (isAbsoluteUrl(href)) {
            return <a href={href}>{children}</a>;
          } else {
            return (
              <NextLink href={href} passHref>
                <Link>{children}</Link>
              </NextLink>
            );
          }
        },
        ...renderers,
      }}
      {...props}
    />
  );
};

export default memo(Markdown);
