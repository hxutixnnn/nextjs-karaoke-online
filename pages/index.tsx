import { ListBulletIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DebounceInput } from "react-debounce-input";
import BottomNavigation from "../components/BottomNavigation";
import SearchResultGrid from "../components/SearchResultGrid";
import VideoHorizontalCard from "../components/VideoHorizontalCard";
import YoutubePlayer from "../components/YoutubePlayer";
import { useKaraokeState } from "../hooks/karaoke";
import { RecommendedVideo, SearchResult } from "../types/invidious";

const ListSingerGrid = dynamic(() => import("../components/ListSingerGrid"), {
  loading: () => <div>Loading...</div>,
});
const ListTopicsGrid = dynamic(() => import("../components/ListTopicsGrid"), {
  loading: () => <div>Loading...</div>,
});
const UserAccount = dynamic(() => import("../components/UserAccount"), {
  loading: () => <div>Loading...</div>,
});

function HomePage() {
  const {
    playlist,
    curVideoId,
    searchTerm,
    isKaraoke,
    activeIndex,
    setPlaylist,
    setCurVideoId,
    setSearchTerm,
    setIsKaraoke,
    setActiveIndex,
  } = useKaraokeState();

  const [selectedVideo, setSelectedVideo] = useState<
    SearchResult | RecommendedVideo
  >();

  useEffect(() => {
    if (playlist?.length && !curVideoId) {
      // playing first video
      const [video, ...newPlaylist] = playlist;
      setCurVideoId(video.videoId);
      // then remove it from playlist
      setPlaylist(newPlaylist);
    }
  }, [playlist, curVideoId]);

  function addVideoToPlaylist(video: SearchResult | RecommendedVideo) {
    setPlaylist(playlist?.concat([{ key: new Date().getTime(), ...video }]));
  }

  function priorityVideo(
    video: SearchResult | RecommendedVideo,
    videoIndex?: number
  ) {
    if (!curVideoId) setCurVideoId(video.videoId);
    // move `videoId` to the top of the playlist
    const newPlaylist = playlist?.filter((_, index) => index !== videoIndex);
    setPlaylist([{ key: new Date().getTime(), ...video }, ...newPlaylist]);
  }

  useEffect(() => {
    if (searchTerm) setActiveIndex(0);
  }, [searchTerm]);

  const scrollbarCls =
    "scrollbar scrollbar-w-1 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 scrollbar-track-base-300 scrollbar-thumb-rounded";

  const PlaylistScreen = (
    <>
      <div className="flex flex-row font-bold">
        <span className="text-primary">
          BÀI KẾ TIẾP ({playlist?.length || 0})
        </span>
        {!playlist?.length ? null : (
          <div className="dropdown dropdown-end ml-auto">
            <label
              tabIndex={0}
              className="btn btn-xs btn-ghost text-error 2xl:text-xl"
            >
              Xóa tất cả
            </label>
            <div
              tabIndex={0}
              className="card compact dropdown-content shadow bg-white ring-1 ring-primary rounded-box w-60"
            >
              <div className="card-body">
                <h2 className="card-title text-sm 2xl:text-xl">
                  Bạn có chắc muốn xóa tất cả bài hát?
                </h2>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-xs btn-ghost text-primary 2xl:text-xl"
                    onClick={() => setPlaylist([])}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={`flex-shrink-0 h-full overflow-y-auto pt-2 pb-12 ${scrollbarCls}`}
      >
        <div className="grid grid-cols-1 gap-2">
          {playlist?.map((video, videoIndex) => (
            <VideoHorizontalCard
              key={video.key}
              video={video}
              onSelect={() => priorityVideo(video, videoIndex)}
              onDelete={() =>
                setPlaylist(playlist.filter((_, index) => index !== videoIndex))
              }
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="text-sm 2xl:text-xl w-full max-h-screen overflow-hidden">
      <main className="bg-base-300 h-full">
        <div className="relative flex flex-col sm:flex-row h-screen overflow-hidden">
          {/* START Recommend Videos List */}
          <div className="order-2 sm:order-1 flex flex-col h-full w-full overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              {/* START Search Bar */}
              <div className="flex flex-row gap-2 p-1 justify-between items-center bg-primary">
                {/* START Search Input */}
                <div className="form-control flex-1">
                  <div className="input-group">
                    <span className="px-2 sm:px-4">
                      <MagnifyingGlassIcon className="w-6 h-6" />
                    </span>
                    <DebounceInput
                      type="search"
                      placeholder="TÌM BÀI HÁT YOUTUBE"
                      className="input w-full appearance-none rounded-l xl:text-xl"
                      value={searchTerm}
                      debounceTimeout={1000}
                      onChange={(ev) => setSearchTerm(ev.target.value)}
                      inputMode="search"
                    />
                  </div>
                </div>
                {/* END Search Input */}
                {/* START Karaoke Switch */}
                <div className="form-control">
                  <label className="cursor-pointer label flex-col lg:flex-row gap-1">
                    <input
                      type="checkbox"
                      className="toggle toggle-success toggle-sm"
                      checked={isKaraoke}
                      onChange={(e) => setIsKaraoke(e.target.checked)}
                    />
                    <span className="label-text text-primary-content ml-2 text-xs 2xl:text-xl">
                      KARAOKE
                    </span>
                  </label>
                </div>
                {/* END Karaoke Switch */}
                <label
                  htmlFor="modal-playlist"
                  className="btn btn-ghost text-primary-content flex-col gap-1 w-20 p-0 sm:hidden"
                >
                  <div className="relative">
                    <ListBulletIcon className="h-6 w-6" />
                    <span className="badge absolute -top-2 -right-2 text-xs p-1">
                      {playlist?.length || 0}
                    </span>
                  </div>
                  <span className="text-[10px] leading-none">Đã chọn</span>
                </label>
              </div>
              {/* END Search Bar */}
              {/* Recommend Videos List */}
              <div
                className={`relative grid grid-cols-2 xl:grid-cols-3 auto-rows-min gap-2 w-full overflow-y-auto h-full p-2 ${scrollbarCls}`}
              >
                {/* START Video Row Item */}

                {
                  [
                    <SearchResultGrid
                      key={0}
                      onClick={(video) => setSelectedVideo(video)}
                    />,
                    <ListSingerGrid key={1} />,
                    <ListTopicsGrid key={2} />,
                    <UserAccount key={3} />,
                  ][activeIndex]
                }

                {/* END Video Row Item */}
              </div>
              {/* Put this part before </body> tag */}
              <input
                type="checkbox"
                id="modal-playlist"
                className="modal-toggle"
              />
              <label
                htmlFor="modal-playlist"
                className="modal modal-bottom sm:modal-middle cursor-pointer"
              >
                <label
                  className="flex flex-col modal-box max-h-[50%] overflow-hidden bg-base-300 p-2"
                  htmlFor=""
                >
                  <div className="relative h-full overflow-y-auto flex flex-col">
                    {PlaylistScreen}
                  </div>
                </label>
              </label>
              <input
                type="checkbox"
                id="modal-video"
                className="modal-toggle"
              />
              <label
                htmlFor="modal-video"
                className="modal modal-bottom sm:modal-middle cursor-pointer"
              >
                <label
                  className="modal-box relative px-2 py-4 pb-12 sm:p-4"
                  htmlFor=""
                >
                  <div className="card gap-2">
                    <h2 className="card-title text-sm 2xl:text-2xl">
                      {selectedVideo?.title}
                    </h2>
                    <figure className="relative w-full aspect-video">
                      <Image
                        unoptimized
                        src={`https://yt.funami.tech/vi/${selectedVideo?.videoId}/mqdefault.jpg`}
                        priority
                        alt={selectedVideo?.title}
                        layout="fill"
                        className="bg-gray-400"
                      />
                    </figure>
                    <div className="card-body p-0">
                      <div className="card-actions">
                        <label
                          htmlFor="modal-video"
                          className="btn btn-primary flex-1 2xl:text-2xl"
                          onClick={() => addVideoToPlaylist(selectedVideo)}
                        >
                          Chọn
                        </label>
                        <label
                          htmlFor="modal-video"
                          className="btn btn-primary flex-1 2xl:text-2xl"
                          onClick={() => priorityVideo(selectedVideo)}
                        >
                          Ưu tiên
                        </label>
                      </div>
                    </div>
                  </div>
                </label>
              </label>
            </div>

            <BottomNavigation />
          </div>
          {/* END Recommend Videos List */}
          {/* Video Player */}
          <div className="relative order-1 sm:order-2 w-full flex flex-row sm:flex-col flex-grow flex-shrink-0 sm:max-w-[50vw] lg:max-w-[50vw] 2xl:max-w-[50vw] sm:min-w-[400px] sm:h-screen overflow-hidden">
            <YoutubePlayer
              videoId={curVideoId}
              nextSong={() => setCurVideoId("")}
              className="flex flex-col flex-1 sm:flex-grow-0"
            />
            <div className="max-h-full w-full p-2 overflow-hidden hidden sm:flex flex-col">
              {PlaylistScreen}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
