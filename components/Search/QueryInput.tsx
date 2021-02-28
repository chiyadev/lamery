import { Icon, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { memo, useState } from "react";
import { useRouter } from "next/router";
import { FaSearch } from "react-icons/fa";

const QueryInput = ({ query }: { query: string }) => {
  const [value, setValue] = useState(query);
  const router = useRouter();

  return (
    <InputGroup maxW="md" variant="filled">
      <InputLeftElement>
        <Icon as={FaSearch} color="gray.500" />
      </InputLeftElement>

      <Input
        placeholder="Search anything in the filesystem..."
        value={value}
        onChange={({ currentTarget: { value } }) => setValue(value)}
        onKeyDown={async (e) => {
          switch (e.code) {
            case "Enter":
              await router.push({
                query: {
                  ...router.query,
                  query: value,
                },
              });

              break;

            default:
              return;
          }

          e.preventDefault();
        }}
      />
    </InputGroup>
  );
};

export default memo(QueryInput);
