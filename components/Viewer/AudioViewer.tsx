import { StorageFile } from "../../utils/storage";
import { memo, useEffect, useRef } from "react";
import Plyr, { HTMLPlyrVideoElement } from "plyr-react";
import { Router, useRouter } from "next/router";
import { encodeURIPath } from "../../utils/http";

const AudioViewer = ({ file, autoplay }: { file: StorageFile; autoplay?: StorageFile }) => {
  const ref = useRef<HTMLPlyrVideoElement>(null);
  const { push } = useRouter();

  useEffect(() => {
    const plyr = ref.current?.plyr;
    if (!plyr) return;

    if (autoplay) {
      plyr.on("ended", () => {
        push(`/files${encodeURIPath(autoplay.path)}`).catch();
      });
    }

    const handleRouteStart = plyr.pause.bind(plyr);

    Router.events.on("routeChangeStart", handleRouteStart);

    return () => {
      Router.events.off("routeChangeStart", handleRouteStart);
      plyr.destroy();
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
        keyboard: {
          global: true,
        },
      }}
    />
  );
};

export default memo(AudioViewer);
