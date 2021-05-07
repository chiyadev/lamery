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
  components,
  ...props
}: ComponentProps<typeof MarkdownCore> & { basePath?: string }) => {
  if (basePath === "/") {
    basePath = "";
  } else if (!basePath?.startsWith("/")) {
    basePath = "/" + basePath;
  }

  return (
    <MarkdownCore
      plugins={[RemarkGfm]}
      transformLinkUri={(uri, children, title) => {
        if (transformLinkUri) {
          return transformLinkUri(uri, children, title);
        }

        if (isAbsoluteUrl(uri)) {
          return uri;
        }

        if (!uri.startsWith("/")) {
          uri = `${basePath}/${uri}`;
        }

        return "/list" + uri;
      }}
      transformImageUri={(uri, children, title) => {
        if (transformImageUri) {
          return transformImageUri(uri, children, title);
        }

        if (isAbsoluteUrl(uri)) {
          return uri;
        }

        if (!uri.startsWith("/")) {
          uri = `${basePath}/${uri}`;
        }

        return "/api/files" + uri;
      }}
      components={{
        code: ({ key, language, children }: any) => {
          return (
            <SyntaxHighlighter
              key={key}
              style={ghcolors}
              language={language}
              customStyle={{
                backgroundColor: undefined,
                border: undefined,
                padding: undefined,
                margin: undefined,
              }}
              wrapLongLines
            >
              {children}
            </SyntaxHighlighter>
          );
        },
        a: ({ href, children }: any) => {
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
        ...components,
      }}
      {...props}
    />
  );
};

export default memo(Markdown);
