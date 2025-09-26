"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import { X, Play, Volume2, RotateCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";
import config from "./config";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import axios from "axios";
const AdVideoPlayer = ({ initialPosition = { x: 100, y: 100 } }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [videoData, setVideoData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [videoList, setVideoList] = useState([]);
  const [triedVideos, setTriedVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 320, height: 360 });
  const videoRef = useRef(null);
  const nodeRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const initialDimensions = useRef({ width: 320, height: 360 });
  useEffect(() => {
    const updateDimensions = () => {
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      if (!isMaximized) {
        const calculatedHeight = Math.max(
          350,
          Math.min(screenHeight * 0.45, 650)
        );
        const calculatedWidth = (calculatedHeight * 320) / 360;
        setDimensions({ width: calculatedWidth, height: calculatedHeight });
        initialDimensions.current = {
          width: calculatedWidth,
          height: calculatedHeight,
        };
      } else {
        const maxHeight = Math.min(650, screenHeight * 0.9);
        const maxWidth = (maxHeight * 320) / 360;
        const finalWidth = Math.min(maxWidth, screenWidth * 0.95);
        setDimensions({ height: maxHeight, width: finalWidth });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isMaximized]);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(
        `${config.awsApiUrl}/adAssets/v1/getPropertyVideos`,
        {
          cache: "force-cache",
        }
      );
      const data = await res.json();

      if (data?.data?.length > 0) {
        setVideoList(data.data);
        pickRandomVideo(data.data, []);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  }, []);
  const pickRandomVideo = (list, tried) => {
    const remaining = list.filter((v) => !tried.includes(v.video_url));
    if (remaining.length === 0) {
      console.warn("No working videos found.");
      setIsOpen(false);
      return;
    }
    const randomVideo = remaining[Math.floor(Math.random() * remaining.length)];
    const fullUrl = `https://api.meetowner.in/aws/v1/s3/uploads/${randomVideo.video_url}`;
    setVideoData({ ...randomVideo, videoUrl: fullUrl });
    setIsOpen(true);
    setTriedVideos([...tried, randomVideo.video_url]);
  };

  const handleVideoError = () => {
    console.warn("Video failed to load, trying another...");
    if (videoList.length > 0) {
      pickRandomVideo(videoList, triedVideos);
    }
  };
  useEffect(() => {
    if (!isMobile) {
      fetchVideos();
    }
  }, [fetchVideos, isMobile]);
  useEffect(() => {
    if (isOpen) setPosition(initialPosition);
  }, [isOpen, initialPosition.x, initialPosition.y]);
  const handleDrag = useCallback((_, data) => {
    setPosition({ x: data.x, y: data.y });
  }, []);
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
      });
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying]);
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    setIsMuted((prev) => !prev);
  }, []);
  const rotateVideo = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);
  const maximizeSize = useCallback(() => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const maxHeight = Math.min(600, screenHeight * 0.9);
    const maxWidth = (maxHeight * 320) / 380;
    const finalWidth = Math.min(maxWidth, screenWidth * 0.95);
    setDimensions({ height: maxHeight, width: finalWidth });
    setIsMaximized(true);
  }, []);
  const minimizeSize = useCallback(() => {
    setDimensions(initialDimensions.current);
    setIsMaximized(false);
  }, []);
  const handleNavigation = useCallback(
    async (property) => {
      dispatch(
        setPropertyDetails({
          property,
        })
      );
      const propertyFor = property?.property_for === "Rent" ? "rent" : "buy";
      const propertyId = property?.property_id || property.unique_property_id;
      const propertyNameSlug = property.property_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^-|-$)/g, "");
      const locationSlug = property.location_id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/(^-|-$)/g, "");
      const seoUrl = `${propertyFor}_${property.sub_type}_${propertyNameSlug}_in_${locationSlug}_Id_${propertyId}`;
      router.push(`/property?${seoUrl}`, { state: property });
    },
    [router, dispatch]
  );

  if (isMobile || !isOpen || !videoData) return null;
  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={handleDrag}
      bounds="body"
       cancel=".no-drag" 
    >
      <div
        ref={nodeRef}
        className="hidden lg:flex fixed bottom-28 right-28 z-[1000] cursor-pointer animate-float "
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div className="relative w-full h-full bg-glass-bg backdrop-blur-xl rounded-3xl overflow-hidden animate-glow shadow-3xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 no-drag  right-3 bg-video-overlay hover:bg-white hover:text-black text-white border-0 rounded-full w-8 h-8 z-[1001] transition-all duration-200 hover:scale-110"
            onClick={() => setIsOpen(false)}
            aria-label="Close video player"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative w-full h-full overflow-hidden rounded-3xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: `rotate(${rotation}deg)` }}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              crossOrigin="anonymous"
              preload="auto"
              onError={handleVideoError}
            >
              <source src={videoData.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div
              className="absolute top-0 no-drag left-0 right-0 bg-gradient-to-b from-video-overlay to-transparent p-4 pt-12"
              onClick={() => handleNavigation(videoData)}
            >
              <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
                {videoData.property_name}
              </h3>
              <div className="inline-flex items-center bg-accent-glow/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">
                  {videoData.city_id}
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-video-overlay to-transparent p-4 flex justify-between items-center">
              <div
                className="bg-white/10 no-drag  backdrop-blur-sm border border-white/20 rounded-full px-3 py-1"
                onClick={() => handleNavigation(videoData)}
              >
                <span className="text-white text-xs font-semibold">
                  {videoData.sub_type === "Apartment"
                    ? `${videoData.bedrooms} BHK - ${videoData.sub_type}`
                    : videoData.sub_type === "Plot"
                    ? "Plot for Sale"
                    : videoData.sub_type || ""}
                </span>
              </div>

              <div className="flex no-drag  items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="bg-white/20 hover:bg-white hover:text-black rounded-full w-8 h-8"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  <Volume2
                    className={`h-4 w-4 ${
                      isMuted ? "opacity-50" : "opacity-100"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="bg-white/20 hover:bg-white hover:text-black rounded-full w-8 h-8"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  <Play
                    className={`h-4 w-4 ${
                      isPlaying ? "opacity-50" : "opacity-100"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={rotateVideo}
                  className="bg-white/20 hover:bg-white hover:text-black rounded-full w-8 h-8"
                  aria-label="Rotate video"
                >
                  <RotateCw
                    className={`h-4 w-4 ${
                      rotation !== 0 ? "opacity-100" : "opacity-50"
                    }`}
                  />
                </Button>
                {isMaximized ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={minimizeSize}
                    className="bg-white/20 hover:bg-white hover:text-black rounded-full w-8 h-8"
                    aria-label="Minimize video size"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={maximizeSize}
                    className="bg-white/20 hover:bg-white hover:text-black rounded-full w-8 h-8"
                    aria-label="Maximize video size"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};
export default React.memo(AdVideoPlayer);
