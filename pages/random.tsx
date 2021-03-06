import { GetServerSideProps } from "next";
import { memo } from "react";
import { getStorageIndex, StorageFile } from "../utils/storage";
import { encodeURIPath } from "../utils/http";

export const getServerSideProps: GetServerSideProps = async () => {
  const index = await getStorageIndex();
  const files = Array.from(index.store.values()).filter((item) => item.type === "file") as StorageFile[];
  const selected = files[Math.floor(Math.random() * files.length)];

  return {
    redirect: {
      permanent: false,
      destination: selected ? `/files${encodeURIPath(selected.path)}` : "/list",
    },
  };
};

const RandomPage = () => null;
export default memo(RandomPage);
