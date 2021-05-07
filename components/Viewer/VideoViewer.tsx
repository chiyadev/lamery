import { StorageFile } from "../../utils/storage";
import { memo, useEffect, useRef } from "react";
import Plyr, { HTMLPlyrVideoElement } from "plyr-react";
import { Router, useRouter } from "next/router";
import { SubtitleInfo } from "../../utils/subtitle";
import { encodeURIPath } from "../../utils/http";

export type VideoViewerData = {
  type: "video";
  subtitles: SubtitleInfo[];
};

type PlayerState = {
  currentTime: number;
  currentTrack: number;
};

function getPlayerState(key: string): PlayerState {
  try {
    return JSON.parse(window.localStorage.getItem(`plyr_state_${key}`) || "");
  } catch {
    return {
      currentTime: 0,
      currentTrack: 0,
    };
  }
}

function setPlayerState(key: string, state: PlayerState) {
  window.localStorage.setItem(`plyr_state_${key}`, JSON.stringify(state));
}

const VideoViewer = ({
  file,
  viewer,
  autoplay,
}: {
  file: StorageFile;
  viewer: VideoViewerData;
  autoplay?: StorageFile;
}) => {
  const ref = useRef<HTMLPlyrVideoElement>(null);
  const { push } = useRouter();

  useEffect(() => {
    const plyr = ref.current?.plyr;
    if (!plyr) return;

    const stateKey = `${file.mtime}_${file.path.replace("/", "_")}`;

    plyr.on("loadedmetadata", () => {
      ({ currentTime: plyr.currentTime, currentTrack: plyr.currentTrack } = getPlayerState(stateKey));
    });

    plyr.on("timeupdate", () => {
      setPlayerState(stateKey, {
        currentTime: plyr.currentTime >= plyr.duration - 5 ? 0 : plyr.currentTime,
        currentTrack: plyr.currentTrack,
      });
    });

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
  }, []);

  return (
    <Plyr
      key="plyr"
      ref={ref}
      source={{
        type: "video",
        title: file.name.replace(/\.[^/.]+$/, ""),
        sources: [
          {
            src: `/api/files${encodeURIPath(file.path)}`,
          },
        ],
        tracks: viewer.subtitles.map((subtitle, i) => ({
          kind: "subtitles",
          src:
            subtitle.type === "external"
              ? `/api/subtitles${encodeURIPath(subtitle.path)}`
              : subtitle.type === "embedded"
              ? `/api/subtitles${encodeURIPath(file.path)}?stream=${subtitle.stream}`
              : "",
          srcLang: subtitle.lang,
          label: subtitle.langName || "Unknown",
          default: i === 0,
        })),
      }}
      options={{
        autoplay: true,
        disableContextMenu: false,
        fullscreen: {
          iosNative: true,
        },
        keyboard: {
          global: true,
        },
      }}
    />
  );
};

export default memo(VideoViewer);
