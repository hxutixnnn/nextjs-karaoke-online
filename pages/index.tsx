import {
  ListBulletIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useLocalStorageValue } from "@react-hookz/web";
import { DebounceInput } from "react-debounce-input";
import { VideoHorizontalCard } from "../components/VideoHorizontalCard";
import YoutubePlayer from "../components/YoutubePlayer";
import { RecommendedVideo, SearchResult } from "../types/invidious";
import {
  getSearchResult,
  getSkeletonItems,
  getVideoInfo,
  getArtists,
  getTopics,
} from "../utils/api";

function HomePage() {
  const { value: playlist, set: setPlaylist } = useLocalStorageValue(
    "playlist",
    { defaultValue: [] }
  );
  const { value: curVideoId, set: setCurVideoId } = useLocalStorageValue(
    "videoId",
    { defaultValue: "" }
  ); // TODO: make a video instruction and put it as a initial here
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

  const { value: searchTerm, set: setSearchTerm } = useLocalStorageValue(
    "searchTerm",
    { defaultValue: "" }
  );
  const { value: isKaraoke, set: setIsKaraoke } = useLocalStorageValue(
    "isKaraoke",
    { defaultValue: true }
  );
  const { value: activeIndex, set: setActiveIndex } = useLocalStorageValue(
    "activeIndex",
    { defaultValue: 0 }
  );

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
                className={`relative grid grid-cols-2 xl:grid-cols-3 auto-rows-min gap-2 w-full overflow-y-auto max-h-full p-2 ${scrollbarCls}`}
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

function SearchResultGrid({
  onClick = () => {},
}: {
  onClick?: (video: SearchResult | RecommendedVideo) => void;
}) {
  const { value: searchTerm, set: setSearchTerm } = useLocalStorageValue(
    "searchTerm",
    { defaultValue: "" }
  );
  const { value: curVideoId, set: setCurVideoId } = useLocalStorageValue(
    "videoId",
    { defaultValue: "" }
  ); // TODO: make a video instruction and put it as a initial here
  const { value: isKaraoke, set: setIsKaraoke } = useLocalStorageValue(
    "isKaraoke",
    { defaultValue: true }
  );
  const prefix = isKaraoke ? '"karaoke" ' : "";

  const titleIncludesKaraoke = ({ title }) => {
    const lcTitle = title.toLowerCase();
    return lcTitle.includes("karaoke") || lcTitle.includes("beat");
  };

  const { data: recommendedVideos, isLoading: infoLoading } = useQuery(
    ["videoInfo", curVideoId],
    () => getVideoInfo(curVideoId),
    {
      enabled: !!curVideoId,
      select: ({ recommendedVideos }) => {
        if (isKaraoke) {
          return recommendedVideos.filter(titleIncludesKaraoke);
        }

        return recommendedVideos;
      },
    }
  );

  const { data: searchResults, isFetching: searchLoading } = useQuery(
    ["searchResult", prefix + searchTerm],
    () => getSearchResult({ q: prefix + searchTerm }),
    {
      select: (results) => {
        if (isKaraoke) {
          return results.filter(titleIncludesKaraoke);
        }

        return results;
      },
    }
  );
  const isLoading = searchLoading || infoLoading;
  const renderList =
    searchTerm || !recommendedVideos?.length
      ? searchResults
      : recommendedVideos;

  return (
    <>
      {isLoading && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-base-300 z-50" />
          {getSkeletonItems(16).map((s) => (
            <div
              key={s}
              className="card bg-gray-300 animate-pulse w-full aspect-w-4 aspect-h-3"
            />
          ))}
        </>
      )}
      {renderList?.map((rcm) => {
        return !rcm ? null : (
          <Fragment key={rcm.videoId}>
            {/* The button to open modal */}
            <label htmlFor="modal-video" onClick={() => onClick(rcm)}>
              <div className="card overflow-hidden bg-white shadow hover:shadow-md cursor-pointer flex-auto">
                <figure className="relative w-full aspect-video">
                  <Image
                    unoptimized
                    src={`https://yt.funami.tech/vi/${rcm.videoId}/mqdefault.jpg`}
                    priority
                    alt={rcm.title}
                    layout="fill"
                    className="bg-gray-400"
                  />
                </figure>
                <div className="card-body p-2">
                  <h2 className="font-semibold text-sm 2xl:text-2xl line-clamp-2 h-[2.7em]">
                    {rcm.title}
                  </h2>
                  <p className="text-xs 2xl:text-xl truncate">{rcm.author}</p>
                </div>
              </div>
            </label>
          </Fragment>
        );
      })}
    </>
  );
}

function ListSingerGrid() {
  const [gender, setGender] = useState(1);
  const { data: topartists, isLoading } = useQuery(["getArtists", gender], () =>
    getArtists(gender)
  );
  const { value: activeIndex, set: setActiveIndex } = useLocalStorageValue(
    "activeIndex",
    { defaultValue: 0 }
  );
  const { value: searchTerm, set: setSearchTerm } = useLocalStorageValue(
    "searchTerm",
    { defaultValue: "" }
  );
  const { artist } = topartists || {};

  return (
    <>
      <div className="tabs tabs-boxed col-span-full justify-center bg-transparent">
        <div
          className={`tab ${gender === 1 ? "tab-active" : ""}`}
          onClick={() => setGender(1)}
        >
          Nam
        </div>
        <div
          className={`tab ${gender === 2 ? "tab-active" : ""}`}
          onClick={() => setGender(2)}
        >
          Nữ
        </div>
        <div
          className={`tab ${gender === 3 ? "tab-active" : ""}`}
          onClick={() => setGender(3)}
        >
          Nhóm nhạc
        </div>
      </div>
      {isLoading && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-base-300 z-50" />
          {getSkeletonItems(16).map((s) => (
            <div
              key={s}
              className="card bg-gray-300 animate-pulse w-full aspect-w-4 aspect-h-3"
            />
          ))}
        </>
      )}
      {artist?.map((artist) => {
        return (
          <Fragment key={artist.name}>
            <div
              className="card overflow-hidden bg-white shadow hover:shadow-md cursor-pointer flex-auto"
              onClick={() => {
                setSearchTerm(artist.name);
              }}
            >
              <figure className="relative w-full aspect-square">
                <Image
                  unoptimized
                  src={artist.imageUrl}
                  priority
                  alt={artist.name}
                  layout="fill"
                  className="animate-pulse bg-gray-400"
                  onLoad={(ev) =>
                    ev.currentTarget.classList.remove("animate-pulse")
                  }
                  onErrorCapture={(ev) => {
                    ev.currentTarget.src = "/assets/avatar.jpeg";
                  }}
                />
              </figure>
              <div className="card-body p-2">
                <h2 className="font-semibold text-sm 2xl:text-2xl line-clamp-2 h-[2.7em]">
                  {artist.name}
                </h2>
              </div>
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
function ListTopicsGrid() {
  const { data, isLoading } = useQuery(["getTopics"], getTopics);
  const { value: activeIndex, set: setActiveIndex } = useLocalStorageValue(
    "activeIndex",
    { defaultValue: 0 }
  );
  const { value: searchTerm, set: setSearchTerm } = useLocalStorageValue(
    "searchTerm",
    { defaultValue: "" }
  );
  const { topic: topics } = data || {};

  return (
    <>
      {isLoading && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-base-300 z-50" />
          {getSkeletonItems(16).map((s) => (
            <div
              key={s}
              className="card bg-gray-300 animate-pulse w-full aspect-w-4 aspect-h-3"
            />
          ))}
        </>
      )}
      {topics?.map((topic) => {
        return (
          <Fragment key={topic.key}>
            <div
              className="card overflow-hidden bg-white shadow hover:shadow-md cursor-pointer flex-auto"
              onClick={() => {
                setSearchTerm(topic.title);
                setActiveIndex(0);
              }}
            >
              <figure className="relative w-full aspect-w-16 aspect-h-5">
                <Image
                  unoptimized
                  src={topic.coverImageURL}
                  priority
                  alt={topic.title}
                  layout="fill"
                  className="animate-pulse bg-gray-400"
                  onLoad={(ev) =>
                    ev.currentTarget.classList.remove("animate-pulse")
                  }
                  onErrorCapture={(ev) => {
                    ev.currentTarget.src = "/assets/avatar.jpeg";
                  }}
                />
              </figure>
              <div className="card-body p-2">
                <h2 className="font-semibold text-sm 2xl:text-2xl line-clamp-2 h-[2.7em]">
                  {topic.title}
                </h2>
              </div>
            </div>
          </Fragment>
        );
      })}
    </>
  );
}

function BottomNavigation() {
  const { value: activeIndex, set: setActiveIndex } = useLocalStorageValue(
    "activeIndex",
    { defaultValue: 0 }
  );
  return (
    <div className="btm-nav static flex-shrink-0">
      <button
        className={`text-primary ${activeIndex === 0 ? "active" : ""}`}
        onClick={() => setActiveIndex(0)}
      >
        <MagnifyingGlassIcon className="w-6 h-6" />
        <span className="btm-nav-label">Tìm kiếm</span>
      </button>
      <button
        className={`text-primary ${activeIndex === 1 ? "active" : ""}`}
        onClick={() => setActiveIndex(1)}
      >
        <MusicalNoteIcon className="w-6 h-6" />
        <span className="btm-nav-label">Ca sĩ</span>
      </button>
      <button
        className={`text-primary ${activeIndex === 2 ? "active" : ""}`}
        onClick={() => setActiveIndex(2)}
      >
        <RectangleStackIcon className="w-6 h-6" />
        <span className="btm-nav-label">Thể loại</span>
      </button>
    </div>
  );
}

export default HomePage;
