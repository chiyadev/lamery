import { FileItem } from "../../utils/storage";
import { memo, useEffect, useRef } from "react";
import Plyr, { HTMLPlyrVideoElement } from "plyr-react";
import { Router } from "next/router";
import { SubtitleStreamInfo } from "../../utils/subtitle";

export type VideoViewerData = {
  type: "video";
  subtitles: SubtitleStreamInfo[];
};

type PlayerState = Partial<{
  time: number;
  track: number;
}>;

function getPlayerState(key: string): PlayerState {
  try {
    return JSON.parse(window.localStorage.getItem(`plyr_state_${key}`) || "");
  } catch {
    return {};
  }
}

function setPlayerState(key: string, state: PlayerState) {
  window.localStorage.setItem(`plyr_state_${key}`, JSON.stringify(state));
}

const VideoViewer = ({ file, viewer }: { file: FileItem; viewer: VideoViewerData }) => {
  const ref = useRef<HTMLPlyrVideoElement>(null);

  useEffect(() => {
    const plyr = ref.current?.plyr;
    if (!plyr) return;

    const stateKey = `${file.mtime}_${file.path.replace(/[\/\\]/g, "_")}`;

    plyr.once("playing", () => {
      const state = getPlayerState(stateKey);

      if (typeof state.time === "number") {
        plyr.currentTime = state.time;
      }

      if (typeof state.track === "number") {
        plyr.currentTrack = state.track;
      } else {
        plyr.currentTrack = viewer.subtitles.length ? 0 : -1;
      }
    });

    plyr.on("pause", () => {
      setPlayerState(stateKey, {
        time: plyr.currentTime,
        track: plyr.currentTrack,
      });
    });

    const handleRouteStart = () => plyr.pause();

    Router.events.on("routeChangeStart", handleRouteStart);

    return () => {
      Router.events.off("routeChangeStart", handleRouteStart);
    };
  }, []);

  return (
    <Plyr
      ref={ref}
      source={{
        type: "video",
        title: file.name.replace(/\.[^/.]+$/, ""),
        sources: [
          {
            src: `/api/files${file.path}`,
          },
        ],
        tracks: viewer.subtitles.map((subtitle, i) => ({
          kind: "subtitles",
          src:
            subtitle.type === "external"
              ? `/api/subtitles${subtitle.path}`
              : subtitle.type === "embedded"
              ? `/api/subtitles${file.path}?stream=${subtitle.stream}`
              : "",
          label: subtitle.language,
          default: i === 0,
        })),
      }}
      options={{
        autoplay: true,
        disableContextMenu: false,
        fullscreen: {
          iosNative: true,
        },
      }}
    />
  );
};

export default memo(VideoViewer);
