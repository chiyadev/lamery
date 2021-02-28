import { memo, useEffect } from "react";
import Router from "next/router";
import { done, start } from "nprogress";
import Head from "next/head";
import { useToken } from "@chakra-ui/system";

const NProgress = () => {
  const [color] = useToken("colors", ["blue.500"]);

  useEffect(() => {
    // timeout prevents shallow routing from causing the progress bar to show
    let startTimeout: number;

    const handleStart = () => {
      clearTimeout(startTimeout);
      startTimeout = window.setTimeout(start);
    };

    const handleEnd = () => {
      clearTimeout(startTimeout);
      done();
    };

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleEnd);
    Router.events.on("routeChangeError", handleEnd);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleEnd);
      Router.events.off("routeChangeError", handleEnd);
    };
  }, []);

  return (
    <Head>
      <style>{`
        :root {
          --nprogress-color: ${color};
        }
      `}</style>
    </Head>
  );
};

export default memo(NProgress);
