import { StorageFile } from "../../utils/storage";
import { memo, useEffect, useRef } from "react";
import Plyr, { HTMLPlyrVideoElement } from "plyr-react";
import { Router } from "next/router";
import { encodeURIPath } from "../../utils/http";

const AudioViewer = ({ file }: { file: StorageFile }) => {
  const ref = useRef<HTMLPlyrVideoElement>(null);

  useEffect(() => {
    const plyr = ref.current?.plyr;
    if (!plyr) return;

    const handleRouteStart = () => plyr.pause();

    Router.events.on("routeChangeStart", handleRouteStart);

    return () => {
      Router.events.off("routeChangeStart", handleRouteStart);
    };
  }, [file]);

  return (
    <Plyr
      ref={ref}
      source={{
        type: "audio",
        title: file.name.replace(/\.[^/.]+$/, ""),
        sources: [
          {
            src: `/api/files${encodeURIPath(file.path)}`,
          },
        ],
      }}
      options={{
        autoplay: true,
        disableContextMenu: false,
      }}
    />
  );
};

export default memo(AudioViewer);
