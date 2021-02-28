import React, { memo } from "react";
import { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Head from "next/head";
import "inter-ui/inter.css";
import "../components/NProgress.css";
import "focus-visible";
import NProgress from "../components/NProgress";
import { useScrollPreserver } from "../utils/scrollPreserver";
import "plyr-react/dist/plyr.css";

const fallbackFonts =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

function App({ Component, pageProps }: AppProps) {
  useScrollPreserver();

  return (
    <ChakraProvider
      resetCSS
      theme={extendTheme({
        fonts: {
          body: `Inter, ${fallbackFonts}`,
          heading: `Inter, ${fallbackFonts}`,
        },
        fontSizes: {
          xs: "10px",
          sm: "12px",
          md: "14px",
          lg: "16px",
          xl: "18px",
        },
        styles: {
          global: {
            body: {
              fontSize: "md",
            },
          },
        },
      })}
    >
      <Head>
        <meta charSet="utf-8" />

        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="theme-color" content="#2e313d" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2e313d" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </Head>

      <NProgress />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default memo(App);
