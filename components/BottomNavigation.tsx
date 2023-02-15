import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import { useKaraokeState } from "../hooks/karaoke";

export default function BottomNavigation() {
  const { activeIndex, setActiveIndex } = useKaraokeState();
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
      <button
        className={`text-primary ${activeIndex === 3 ? "active" : ""}`}
        onClick={() => setActiveIndex(3)}
      >
        <UserIcon className="w-6 h-6" />
        <span className="btm-nav-label">Tài khoản</span>
      </button>
    </div>
  );
}
