// import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { VideoResponse } from "../types/invidious";
import { useLocalStorage } from "react-use";
import { useEffect, useState } from "react";
import {
  PauseIcon,
  ForwardIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

axios.interceptors.request.use(function (config) {
  /**
   * List of instances
   * https://docs.invidious.io/instances/
   */
  config.baseURL = "https://invidious.drivet.xyz/";
  return config;
});

const getVideoInfo = async (videoId: string) => {
  if (!videoId) {
    throw new Error("Missing query key!");
  }
  const res = await axios<VideoResponse>("/api/v1/videos/" + videoId);
  return res.data;
};

const skeleton = Array.from({ length: 7 }).map((_, i) => i);

function WatchPage() {
  const router = useRouter();
  const [cacheVideoId, setCacheVideoId] = useLocalStorage(
    "videoId",
    "4lNAEnqZ7XA"
  );
  const { v: videoId } = router.query as { v: string };

  function goToVideo(videoId: string) {
    setCacheVideoId(videoId);
    return router.push({ pathname: router.pathname, query: { v: videoId } });
  }

  useEffect(() => {
    if (cacheVideoId && !videoId) {
      goToVideo(cacheVideoId);
    }
  }, [cacheVideoId, videoId]);

  const { data, isLoading, isError } = useQuery(
    ["videoInfo", videoId],
    () => getVideoInfo(videoId),
    {
      enabled: !!videoId,
      staleTime: Infinity,
      // refetchOnMount: false,
      // refetchOnWindowFocus: false,
      // refetchOnReconnect: false,
    }
  );

  const { recommendedVideos = [] } = data || {};

  const iframeUrl = new URL(videoId, "https://www.youtube.com/embed/");
  iframeUrl.searchParams.append("autoplay", "1");
  iframeUrl.searchParams.append("controls", "0");
  iframeUrl.searchParams.append("disablekb", "1");
  iframeUrl.searchParams.append("enablejsapi", "1");
  iframeUrl.searchParams.append("modestbranding", "1");
  iframeUrl.searchParams.append("playsinline", "1");

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div
      data-theme="light"
      className="text-sm w-full max-h-screen overflow-hidden"
    >
      <main className="">
        <div className="flex flex-col xl:flex-row">
          <div className="flex flex-col w-full h-screen xl:pb-0 pb-20">
            <div className="flex flex-row gap-2 p-1 justify-between items-center bg-primary">
              <div className="dropdown flex-1">
                <div className="form-control">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search…"
                      className="input input-bordered w-full"
                      onSubmit={(e) => setSearchTerm(e.currentTarget.value)}
                    />
                    <button className="btn btn-square btn-accent">
                      <MagnifyingGlassIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full"
                >
                  <li>
                    <a>Item 1</a>
                  </li>
                  <li>
                    <a>Item 2</a>
                  </li>
                </ul>
              </div>
            </div>
            {/* Recommend Videos List */}
            <div className="relative flex flex-row gap-4 w-full flex-wrap overflow-y-auto max-h-full p-4 bg-base-300 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300 scrollbar-thumb-rounded hover:scrollbar-track-gray-400">
              {/* Video Row Item */}
              {recommendedVideos?.map((rcm) => {
                const thumbnail = rcm.videoThumbnails?.[4];
                return (
                  <div
                    key={rcm.videoId}
                    className="card bg-white rounded-md shadow-md cursor-pointer flex-auto w-1/3 md:w-1/4"
                    onClick={() => goToVideo(rcm.videoId)}
                  >
                    <figure className="relative w-full aspect-video">
                      <Image
                        unoptimized
                        priority
                        src={thumbnail?.url}
                        alt={thumbnail?.quality}
                        width={160}
                        height={90}
                        layout="fill"
                        className="bg-base-300"
                      />
                    </figure>
                    <div className="card-body p-4">
                      <h2 className="card-title text-sm line line-clamp-2">
                        {rcm.title}
                      </h2>
                      <p>{rcm.author}</p>
                      <div className="card-actions justify-end">
                        <button className="btn btn-primary">Phát ngay</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* END Video Row Item */}
            </div>
          </div>
          {/* END Recommend Videos List */}
          {/* Video Player */}
          <div className="absolute bottom-0 left-0 right-0 h-20 flex flex-row xl:flex-col xl:static gap-1">
            <iframe
              src={iframeUrl.toString()}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="bg-base-300 w-auto xl:w-full aspect-video"
            />
            <div className="flex flex-row gap-1 px-1 ml-auto items-center">
              {[
                {
                  icon: PauseIcon,
                  label: "Dừng",
                },
                {
                  icon: ForwardIcon,
                  label: "Qua bài",
                },
                {
                  icon: SpeakerXMarkIcon,
                  label: "Tắt tiếng",
                },
                {
                  icon: SpeakerWaveIcon,
                  label: "Giảm âm",
                },
                {
                  icon: SpeakerWaveIcon,
                  label: "Tăng âm",
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  className="btn btn-ghost text-primary flex xl:gap-1 h-16 xl:h-20 w-16 overflow-hidden xl:w-20 text-[10px] xl:text-xs p-0 hover:bg-base-200"
                >
                  <btn.icon className="w-10 h-10" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WatchPage;
