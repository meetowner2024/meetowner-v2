"use client"
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import meetlogo from "../../app/assets/Images/Favicon@10x.png";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaHouse } from "react-icons/fa6";
import config from "../utils/config";
const AdsCard = memo(() => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [property, setProperty] = useState([]);
  const fetchLatestProperties = async () => {
    setProperty([]);
    try {
      const response = await fetch(
        `${config.awsApiUrl}/listings/v1/getRandomPropertiesAds`
      );
      const data = await response.json();
      setProperty(data.results);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    }
  };
  useEffect(() => {
    fetchLatestProperties();
  }, []);
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };

  const router = useRouter();
  const handleNavigation = useCallback(
    (property) => {
      router.push("/property", { state: property });
    },
    [router]
  );
  return (
    <div className="bg-white rounded-lg shadow-md relative p-2  max-w-4xl mt-8">
      <h2 className="text-xl text-left md:text-xl font-semibold text-[#1E2A53] mb-4">
        Featured Projects Based on your search
      </h2>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        pagination={{ clickable: true }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
        }}
        className="pb-0 overflow-hidden h-[300px]"
      >
        {property?.map((project, index) => (
          <SwiperSlide key={index}>
            <div className="rounded-xl border border-gray-200 md:p-4 p-2 relative bg-white flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[250px]">
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <Image
                
                  width={600}
                  height={400}
                  src={
                    project?.image
                      ? `https://api.meetowner.in/assets/v1/serve/${project?.image}`
                      : `https://placehold.co/600x400?text=${project?.property_name || "No Image Found"
                      }`
                  }
                  alt="Property"
                  crossOrigin="anonymous"
                  className="w-full h-[200px] md:h-[220px] object-contain rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/600x400?text=${project?.property_name || "No Image Found"
                      }`;
                  }}
                />
              </div>
              <div
                className="w-full md:w-1/2 flex flex-col justify-between cursor-pointer px-1 md:px-2"
                onClick={() => handleNavigation(project)}
              >
                <div className="flex flex-col gap-2 flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-blue-900 text-left">
                    {project?.property_name}
                  </h3>
                  <p className="text-md md:text-lg font-semibold text-gray-600 text-left">
                    Rs:{" "}
                    {formatToIndianCurrency(project?.property_cost) || "N/A"}
                  </p>
                  <p className="text-gray-600 text-left text-sm md:text-base mt-1 mb-2 md:mb-4 line-clamp-3">
                    {project?.description?.length > 100
                      ? project?.description.slice(0, 150) + "..."
                      : project?.description}
                  </p>
                </div>
                <div className="flex justify-end items-center mt-2">
                  <button className="flex items-center gap-2 px-5 py-2 bg-[#1D3A76] hover:bg-blue-800 text-white rounded-xl shadow text-sm md:text-base">
                    <FaHouse />
                    View Property
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <button
            ref={prevRef}
            className="text-gray-500 text-1xl bg-white shadow rounded-full p-2 ml-2 hover:bg-gray-100"
          >
            <FaChevronLeft />
          </button>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <button
            ref={nextRef}
            className="text-gray-500 text-1xl bg-white shadow rounded-full p-2 mr-2 hover:bg-gray-100"
          >
            <FaChevronRight />
          </button>
        </div>
      </Swiper>
      <div className="flex justify-center items-center gap-2 text-sm text-[#1E2A53] font-medium">
        <Image
         
        width={100}
        height={100}
          src={meetlogo}
          alt="Meet Owner"
          crossOrigin="anonymous"
          className="w-6 h-6"
        />
        <span className="text-[#FFC107] font-bold">MEET OWNER</span>
      </div>
    </div>
  );
});
export default AdsCard;
