import React, { memo } from "react";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { FaDownload, FaSearch } from "react-icons/fa";
import { useRouter } from "next/router";
import { DirectoryItem } from "../../utils/storage";

const HeaderButtons = ({ directory }: { directory: DirectoryItem }) => {
  const router = useRouter();

  return (
    <>
      <Tooltip label="Search">
        <IconButton
          as="a"
          aria-label="Search"
          icon={<Icon as={FaSearch} />}
          variant="ghost"
          href={`/search${directory.path}`}
          onClick={async (e) => {
            e.preventDefault();
            await router.push(`/search${directory.path}`);
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
            href={`/api/archive${directory.path}`}
          />
        </Tooltip>
      )}
    </>
  );
};

export default memo(HeaderButtons);
