import { GetServerSideProps } from "next";
import { memo } from "react";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      permanent: false,
      destination: "/list"
    }
  };
};

const IndexPage = () => null;
export default memo(IndexPage);
