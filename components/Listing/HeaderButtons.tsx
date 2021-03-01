import React, { memo } from "react";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { FaDownload, FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";
import { StorageDirectory } from "../../utils/storage";
import { encodeURIPath } from "../../utils/http";

const HeaderButtons = ({ directory }: { directory: StorageDirectory }) => {
  const router = useRouter();

  return (
    <>
      <Tooltip label="Search">
        <IconButton
          as="a"
          aria-label="Search"
          icon={<Icon as={FaSearch} />}
          variant="ghost"
          href={`/search${encodeURIPath(directory.path)}`}
          onClick={async (e) => {
            e.preventDefault();
            await router.push(`/search${encodeURIPath(directory.path)}`);
          }}
        />
      </Tooltip>

      {directory.path !== "/" && (
        <Tooltip label="Download all">
          <IconButton
            as="a"
            aria-label="Download"
            icon={<Icon as={FaDownload} />}
            variant="ghost"
            href={`/api/archives${encodeURIPath(directory.path)}`}
          />
        </Tooltip>
      )}
    </>
  );
};

export default memo(HeaderButtons);
