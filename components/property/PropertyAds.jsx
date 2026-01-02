import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  VolumeX,
  Volume2,
  Eye,
  MapPin,
  User,
  ArrowRight,
  Maximize,
  Minimize,
  RotateCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchData } from "../store/slices/searchSlice";
import { useRouter } from "next/navigation";
import theme from "../utils/theme.json";
import PropertyListingAds from "./PropertyListingAds";
import Image from "next/image";
const AdItem = ({ propertyItem, index, handleRender }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adImageLoader = ({ src }) => {
    if (!src || src === "placeholder_image") {
      const text = encodeURIComponent(
        (propertyItem?.property_name || "Details")
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .slice(0, 20)
      );
      return `https://placehold.co/600x400/f3f4f6/1d3a76?text=${text}`;
    }
    return `https://api.meetowner.in/assets/v1/serve/${src}`;
  };
  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      onClick={() => handleRender(propertyItem)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-linear-to-br from-white to-slate-50 border border-slate-200/50 rounded-xl p-4 transition-all duration-300 group-hover:border-blue-300/50 group-hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="relative overflow-hidden rounded-lg shrink-0 w-16 h-16">
            <Image
              width={600}
              height={600}
              loader={adImageLoader}
              src={
                !imageFailed && propertyItem.image
                  ? propertyItem.image
                  : "placeholder_image"
              }
              alt="Property"
              crossOrigin="anonymous"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                isLoading && !imageFailed ? "opacity-0" : "opacity-100"
              }`}
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => {
                if (!imageFailed) {
                  setImageFailed(true);
                  setIsLoading(false);
                }
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Eye className="w-3 h-3 text-white drop-shadow-lg" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-md font-semibold text-blue-900 truncate pr-2">
                {propertyItem?.property_name}
              </p>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 transition-all duration-300 group-hover:text-blue-600 group-hover:translate-x-1" />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                {propertyItem?.bedrooms}{" "}
                {propertyItem?.sub_type === "Apartment"
                  ? "BHK"
                  : propertyItem?.sub_type === "Plot"
                  ? "Plot"
                  : "Land"}
              </span>
              {propertyItem.location_id && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate text-xs">
                    {propertyItem.location_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const PropertyAds = ({ handleRender, propertyDataDetails }) => {
  const { userProperties, videos } = useSelector((state) => state.ads);
  const router = useRouter();
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [property, setProperty] = useState();
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  useEffect(() => {
    setProperty(propertyDataDetails);
  }, [propertyDataDetails]);
  useEffect(() => {
    if (property?.unique_property_id) {
      if (userProperties) {
        setProperties(userProperties);
      }
    }
  }, [
    property?.unique_property_id,
    property?.user_id,
    propertyDataDetails,
    userProperties,
  ]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const updateTime = () => {
      if (!isSeeking && video.currentTime !== undefined) {
        setCurrentTime(video.currentTime);
      }
    };
    const setVideoDuration = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handleLoadedData = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleSeeked = () => {
      setCurrentTime(video.currentTime);
      setIsSeeking(false);
    };
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", setVideoDuration);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", setVideoDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", setVideoDuration);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", setVideoDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [videos, isSeeking]);
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      video.play().catch((err) => console.error("Error playing video:", err));
    } else {
      video.pause();
    }
  };
  const toggleMute = () => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };
  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  const handleForward = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const totalDuration = video.duration || duration || 0;
    if (totalDuration > 0) {
      const newTime = Math.min(video.currentTime + 10, totalDuration);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleBackward = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const newTime = Math.max(video.currentTime - 10, 0);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const [rotation, setRotation] = useState(0);
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };


  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
      if (videoRef.current && screen.orientation) {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } else {
      document.exitFullscreen();
      if (screen.orientation) {
        screen.orientation.unlock();
      }
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);


  const handleNavigation = useCallback(() => {
    dispatch(
      setSearchData({
        pathname: property?.property_name,
      })
    );
    router.push("/listings");
  }, [router, dispatch, property?.property_name]);

  if (error || !property) {
    return null;
  }

  return (
    <>
      <div className="hidden lg:block sticky top-6">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          {/* Main Video Section */}
          <div
            className="relative bg-black"
            onClick={toggleControls}
            ref={containerRef}
          >
            {videos[0]?.url ? (
              <>
                <video
                  ref={videoRef}
                  src={videos[0]?.url || null}
                  className={`w-full object-contain transition-all duration-300 ${
                    isFullScreen ? "h-screen" : "h-52"
                  }`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  autoPlay
                  crossOrigin="anonymous"
                  muted={muted}
                  loop
                  playsInline
                  controls
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20"></div>

                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent">
                  <div className="px-4 pb-3 pt-6">
                    <div className="mb-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onInput={(e) => {
                          if (isSeeking) {
                            setCurrentTime(parseFloat(e.target.value));
                          }
                        }}
                        onMouseDown={(e) => {
                          setIsSeeking(true);
                          setWasPlaying(!videoRef.current?.paused);
                          if (!videoRef.current?.paused) {
                            videoRef.current.pause();
                          }
                        }}
                        onMouseUp={(e) => {
                          const seekTime = parseFloat(e.target.value);
                          if (videoRef.current && !isNaN(seekTime)) {
                            videoRef.current.currentTime = seekTime;
                            const handleSeeked = () => {
                              videoRef.current.removeEventListener(
                                "seeked",
                                handleSeeked
                              );
                              if (wasPlaying) {
                                videoRef.current
                                  .play()
                                  .catch((err) =>
                                    console.error("Resume error:", err)
                                  );
                              }
                              setIsSeeking(false);
                            };
                            videoRef.current.addEventListener(
                              "seeked",
                              handleSeeked
                            );
                          } else {
                            setIsSeeking(false);
                          }
                        }}
                        onTouchStart={(e) => {
                          setIsSeeking(true);
                          setWasPlaying(!videoRef.current?.paused);
                          if (!videoRef.current?.paused) {
                            videoRef.current.pause();
                          }
                        }}
                        onTouchEnd={(e) => {
                          const seekTime = parseFloat(e.target.value);
                          if (videoRef.current && !isNaN(seekTime)) {
                            videoRef.current.currentTime = seekTime;
                            const handleSeeked = () => {
                              videoRef.current.removeEventListener(
                                "seeked",
                                handleSeeked
                              );
                              if (wasPlaying) {
                                videoRef.current
                                  .play()
                                  .catch((err) =>
                                    console.error("Resume error:", err)
                                  );
                              }
                              setIsSeeking(false);
                            };
                            videoRef.current.addEventListener(
                              "seeked",
                              handleSeeked
                            );
                          } else {
                            setIsSeeking(false);
                          }
                        }}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background:
                            duration > 0
                              ? `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                                  (currentTime / duration) * 100
                                }%, rgba(255,255,255,0.3) ${
                                  (currentTime / duration) * 100
                                }%, rgba(255,255,255,0.3) 100%)`
                              : "rgba(255,255,255,0.3)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBackward();
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
                        >
                          <Rewind className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayPause();
                          }}
                          className="p-2 rounded-full bg-blue-600/80 backdrop-blur-md transition-all duration-200 hover:bg-blue-600 hover:scale-110"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForward();
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
                        >
                          <FastForward className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-white/90 bg-black/30 px-2 py-1 rounded-full">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
                        >
                          {muted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotate();
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
                          title="Rotate Video"
                        >
                          <RotateCw className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullScreen();
                          }}
                          className="p-2 rounded-full bg-white/10 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:scale-110"
                        >
                          {isFullScreen ? (
                            <Minimize className="w-4 h-4 text-white" />
                          ) : (
                            <Maximize className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-52 flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                <div className="text-center text-slate-600">
                  <p className="text-lg font-semibold">No Video Available</p>
                  <p className="text-sm">
                    Check back later for property videos!
                  </p>
                </div>
              </div>
            )}
          </div>
          {properties?.length > 0 && (
            <div className="p-6">
              {}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-md font-medium bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text  text-black">
                    More by {property?.user?.name || property?.property_name}
                  </h3>
                </div>
                <div className="w-12 h-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-full"></div>
              </div>
              {}
              <div className="space-y-4 mb-6">
                {properties?.slice(0, 3).map((propertyItem, index) => (
                  <AdItem
                    key={index}
                    propertyItem={propertyItem}
                    index={index}
                    handleRender={handleRender}
                  />
                ))}
              </div>
              {}
              <button
                onClick={handleNavigation}
                className={`w-full group relative overflow-hidden  ${theme.button.secondary.bg}              ${theme.button.secondary.text} font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  View All Properties
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:block mt-10 ">
        <PropertyListingAds />
      </div>
    </>
  );
};
export default PropertyAds;
