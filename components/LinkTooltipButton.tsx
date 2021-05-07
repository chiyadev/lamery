import { ComponentProps, forwardRef, memo } from "react";
import { Button, Tooltip } from "@chakra-ui/react";
import NextLink from "next/link";

// makes Next.js link and chakra Button+Tooltip work together in harmony
const LinkTooltipButton = ({
  tooltip,
  link,
  label,
  href,
  children,
  ...props
}: {
  tooltip?: Partial<ComponentProps<typeof Tooltip>>;
  link?: Partial<ComponentProps<typeof NextLink>>;
  label?: ComponentProps<typeof Tooltip>["label"];
  href?: ComponentProps<typeof NextLink>["href"];
} & ComponentProps<typeof Button>) => {
  let node: JSX.Element;

  href = link?.href || href;
  label = tooltip?.label || label;

  if (href) {
    node = (
      <Forward>
        {(props2: any) => (
          <NextLink href={href as any} passHref {...link}>
            <Button as="a" {...props2} {...props}>
              {children}
            </Button>
          </NextLink>
        )}
      </Forward>
    );
  } else {
    node = (
      <Button as="a" {...props}>
        {children}
      </Button>
    );
  }

  if (label) {
    node = (
      <Tooltip label={label} {...tooltip}>
        {node}
      </Tooltip>
    );
  }

  return node;
};

const Forward = forwardRef(({ children, ...props }: { children: (props: any) => JSX.Element } & any, ref) => {
  return children({ ...props, ref });
});

export default memo(LinkTooltipButton);
