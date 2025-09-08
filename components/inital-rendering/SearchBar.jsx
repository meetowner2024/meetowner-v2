const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);
const TABS = ["Buy", "Rent", "New Launch", "Plot", "Commercial"];
const OPTIONS = ["Buy", "Rent"];
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  IoChevronDownOutline,
  IoCloseCircleOutline,
  IoSearch,
} from "react-icons/io5";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { setSearchData } from "../store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import config from "../utils/config";
import ad1 from "../../app/assets/FAMILY MEETOWNER (1).jpg";
import axios from "axios";
import Image from "next/image";
import theme from "../utils/theme.json";
const PrevArrow = (props) => {
  const { currentSlide, slideCount, ...rest } = props;
  return <FaAngleLeft {...rest} />;
};
const NextArrow = (props) => {
  const { currentSlide, slideCount, ...rest } = props;
  return <FaAngleRight {...rest} />;
};
export default function SearchBar() {
  const searchData = useSelector((state) => state.search);
  const [activeTab, setActiveTab] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const videoRefs = useRef([]);
  const sliderRef = useRef(null);
  const [selected, setSelected] = useState("Buy");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState(searchData.city || "");
  const [citiesList, setCitiesList] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [plotSubType, setPlotSubType] = useState("Buy");
  const [commercialSubType, setCommercialSubType] = useState("Buy");
  const dispatch = useDispatch();
  const [mediaList, setMediaList] = useState([
    { id: 1, order: 1, video_url: ad1 },
  ]);
  const [localites, setLocalities] = useState([]);
  const [isError, setIsError] = useState(false);
  const containerRef = useRef(null);
  const [city, setCity] = useState(searchData.city || "");
  const filteredLocations = useMemo(
    () =>
      citiesList.filter((loc) =>
        loc.toLowerCase().includes(city.toLowerCase())
      ),
    [citiesList, city]
  );
  const router = useRouter();
  const settings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      pauseOnHover: true,
      arrows: true,
      prevArrow: (
        <PrevArrow className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 p-1 text-white hover:text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all duration-300" />
      ),
      nextArrow: (
        <NextArrow className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 p-1 text-white hover:text-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all duration-300" />
      ),
      beforeChange: () => {
        videoRefs.current.forEach((video) => {
          if (video) video.pause();
        });
      },
      afterChange: (current) => {
        if (videoRefs.current[current]) {
          videoRefs.current[current].play();
        }
      },
    }),
    []
  );
  const handleUserSearched = useCallback(async () => {
    let userDetails = null;
    try {
      const data = localStorage.getItem("user");
      if (data) userDetails = JSON.parse(data) || null;
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      userDetails = null;
    }
    if (userDetails?.user_id) {
      const viewData = {
        user_id: userDetails.user_id,
        searched_location: searchInput || "N/A",
        searched_for: selected || "N/A",
        name: userDetails?.name || "N/A",
        mobile: userDetails?.mobile || "N/A",
        email: userDetails?.email || "N/A",
        searched_city: location || "N/A",
        property_in: searchData.property_in || "N/A",
        sub_type: searchData.sub_type || "",
      };
      try {
        await axios.post(
          `${config.awsApiUrl}/enquiry/v1/userActivity`,
          viewData
        );
      } catch (error) {
        console.error("Failed to record property view:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    }
  }, [searchInput, selected, location, searchData]);
  useEffect(() => {
    const selectedTab = TABS[activeTab];
    dispatch(
      setSearchData({
        city: location,
        tab: selectedTab,
        property_for: selectedTab === "Rent" ? "Rent" : "Sell",
        property_in:
          selectedTab === "Commercial" ? "Commercial" : "Residential",
        sub_type:
          selectedTab === "Plot"
            ? "Plot"
            : selectedTab === "Commercial"
            ? "Others"
            : "",
        location: searchInput,
        plot_subType: plotSubType,
        commercial_subType: commercialSubType,
      })
    );
  }, [
    location,
    activeTab,
    selected,
    searchInput,
    plotSubType,
    commercialSubType,
    dispatch,
  ]);
  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch(
        `${config.awsApiUrl}/adAssets/v1/getAds?ads_page=main_slider&city=${location}`
      );
      const data = await response.json();
      if (data.ads?.length > 0) {
        const formatted = data.ads
          .sort((a, b) => a.ads_order - b.ads_order)
          .map((item) => ({
            id: item.id,
            order: item.ads_order,
            video_url: `https://api.meetowner.in/aws/v1/s3/${item.image}`,
          }));
        setMediaList(formatted);
      } else {
        setMediaList([{ id: 1, order: 1, video_url: ad1 }]);
      }
    } catch (error) {
      setIsError(true);
    }
  }, [location]);
  const fetchCities = useCallback(async () => {
    setIsLoadingCities(true);
    try {
      const response = await axios.get(
        "https://api.meetowner.in/api/v1/getAllCities"
      );
      const activeCities = response.data?.filter(
        (city) => city.status === "active"
      );
      const cityNames = activeCities.map((item) => item.city);
      setCitiesList(cityNames);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setIsError(true);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);
  useEffect(() => {
    if (!location) return;
    const fetchLocalities = async () => {
      try {
        const response = await fetch(
          `${config.awsApiUrl}/api/v1/search?city=${location}&query=${searchInput}`
        );
        const data = await response.json();
        setLocalities([{ locality: "Most Searched" }, ...data]);
      } catch (err) {
        console.error("Failed to fetch localities:", err);
        setLocalities([]);
      }
    };
    fetchLocalities();
  }, [searchInput, location]);
  useEffect(() => {
    fetchMedia();
    fetchCities();
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location, fetchMedia, fetchCities]);
  const handleNavigation = useCallback(() => {
    const propertyFor = TABS[activeTab] === "Rent" ? "rent" : "sale";
    const propertyType = (() => {
      switch (TABS[activeTab]) {
        case "Plot":
          return "plots";
        case "Commercial":
          return "commercial-properties";
        case "Rent":
        case "Buy":
        default:
          return "apartments";
      }
    })();
    const citySlug = location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");
    const locationSlug = searchInput
      ? searchInput
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^_|_$)/g, "")
      : "";
    const seoUrl = `?${propertyType}_for_${propertyFor}_in_${citySlug}${
      locationSlug ? `_${locationSlug}` : ""
    }`;
    const params = {
      city: location,
      property_for: selected === "Rent" ? "Rent" : "Sell",
      property_type:
        TABS[activeTab] === "Plot"
          ? "Plot"
          : TABS[activeTab] === "Commercial"
          ? "Commercial"
          : "Apartment",
      location: searchInput,
    };
    router.push(`/listings${seoUrl}`, { state: params });
  }, [activeTab, location, searchInput, selected, handleUserSearched, router]);
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
      },
      () => {
        alert("Please enable location services.");
      }
    );
  }, []);
  return (
    <div
      className="w-full relative z-50 lg:h-[510px] md:h-[500px] sm:h-[200px]"
      ref={containerRef}
    >
      <Slider {...settings} ref={sliderRef}>
        {mediaList.map((item, index) => (
          <div key={index} className="relative">
            <div className="relative">
              {isVideo(item.video_url) ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  autoPlay
                  loop
                  muted
                  className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover"
                >
                  <source src={item.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  unoptimized
                  width={600}
                  height={400}
                  src={item.video_url}
                  crossOrigin="anonymous"
                  alt={`media-${index}`}
                  className="w-full h-[300px] sm:h-[300px] md:h-[400px] object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          </div>
        ))}
      </Slider>

      <div className="relative bottom-15 sm:bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 md:w-3/4 lg:w-2/3">
        <div className="bg-white/30 flex justify-center rounded-t-2xl shadow-lg  p-3 sm:p-4 border border-white/20">
          <div className="inline-flex flex-wrap justify-center bg-white  rounded-full p-1 sm:p-2">
            {TABS.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`relative z-10 w-auto px-4 py-1 cursor-pointer rounded-full text-xs sm:text-sm duration-300 ${
                  activeTab === index
                    ? `${theme.button.secondary.bg}  ${theme.button.secondary.text} `
                    : "text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center backdrop-blur-none justify-between space-x-1 bg-white p-2 sm:p-3 rounded-b-lg shadow-sm border border-white">
          <div className="flex items-center space-x-1 sm:space-x-2 w-full">
            <div className="relative w-auto inline-block">
              <div
                className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded bg-white text-[#1D3A76] cursor-pointer"
                onClick={() => setIsLocationOpen((prev) => !prev)}
              >
                <div className="flex items-center mr-1 sm:mr-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      dispatch(
                        setSearchData({
                          location: e.target.value,
                        })
                      );
                      if (!isLocationOpen) setIsLocationOpen(true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => setIsLocationOpen(true)}
                    placeholder="Search City..."
                    className="bg-transparent w-24 sm:w-30 text-sm sm:text-base text-[#1D3A76] focus:outline-none"
                  />
                  {city && (
                    <IoCloseCircleOutline
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer hover:text-[#1D3A76]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCity("");
                        dispatch(
                          setSearchData({
                            location: "",
                            city: "",
                          })
                        );
                      }}
                    />
                  )}
                </div>
                <IoChevronDownOutline className="w-3 h-3 sm:w-4 sm:h-4 text-[#1D3A76]" />
              </div>
              {isLocationOpen && (
                <ul
                  className="absolute left-0 top-10 sm:top-12 mt-1 w-full z-50 bg-white rounded-md shadow-md border border-gray-300 max-h-48 sm:max-h-60 overflow-y-auto hide-scrollbar text-sm sm:text-base"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {isLoadingCities ? (
                    <li className="px-3 py-2 text-gray-400 text-sm">
                      Loading...
                    </li>
                  ) : filteredLocations.length > 0 ? (
                    filteredLocations.map((option) => (
                      <li
                        key={option}
                        onClick={() => {
                          setLocation(option);
                          setCity(option);
                          setIsLocationOpen(false);
                          setSearchInput("");
                        }}
                        className={`px-3 py-1 text-left rounded-md ${theme.button.secondary.hover} ${theme.button.secondary.hoverText} cursor-pointer transition-all duration-200`}
                      >
                        {option}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-400 text-sm">
                      No results found
                    </li>
                  )}
                </ul>
              )}
            </div>
            <span className="hidden md:block text-gray-400">
              <div style={{ border: "0.5px solid #ddd", height: 40 }}></div>
            </span>
            <div className="relative flex-1 items-start text-left">
              <input
                type="text"
                placeholder="Search Locality, City, Property..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setIsSearchDropdownOpen(false), 200)
                }
                className="w-full outline-none bg-transparent text-gray-800 placeholder-gray-500 text-sm sm:text-base px-2 py-1"
              />
              {searchInput && (
                <IoCloseCircleOutline
                  className="absolute w-4 h-4 sm:w-4 sm:h-4 right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchInput("");
                  }}
                />
              )}
              {isSearchDropdownOpen && (
                <ul className="absolute z-1000 left-0 top-11 sm:top-13 w-full bg-white rounded-md shadow-md border border-gray-300 max-h-48 sm:max-h-60 overflow-y-auto text-sm sm:text-base">
                  {searchInput.trim() === "" ? (
                    localites.length > 0 ? (
                      localites.map((item) => {
                        const isDisabled = item.locality === "Most Searched";
                        return (
                          <li
                            key={item.locality}
                            onClick={() => {
                              if (!isDisabled) {
                                setSearchInput(item.locality);
                                setIsSearchDropdownOpen(false);
                              }
                            }}
                            className={`px-3 py-1 text-left rounded-md transition-all duration-200 ${
                              isDisabled
                                ? "text-gray-400 cursor-default"
                                : `${theme.button.secondary.hover} ${theme.button.secondary.hoverText} cursor-pointer`
                            }`}
                          >
                            <div className="flex justify-between">
                              <div>{item.locality}</div>
                              <p
                                className="text-sm text-gray-300"
                                style={{
                                  display:
                                    item.locality === "Most Searched"
                                      ? "none"
                                      : "",
                                }}
                              >
                                Locality
                              </p>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-3 py-1 text-gray-500">
                        No matching localities
                      </li>
                    )
                  ) : localites.length > 0 ? (
                    localites.map((item) => (
                      <li
                        key={item.locality}
                        onClick={() => {
                          setSearchInput(item.locality);
                          setIsSearchDropdownOpen(false);
                        }}
                        className={`px-3 flex flex-row justify-between py-1 text-left ${theme.button.secondary.hover} ${theme.button.secondary.hoverText} rounded-md cursor-pointer transition-all duration-200`}
                      >
                        {item.locality}{" "}
                        <p className="text-sm text-gray-300">Locality</p>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-1 text-gray-500">
                      No matching localities
                    </li>
                  )}
                </ul>
              )}
            </div>
            <IoSearch
              className="w-5 h-5 text-gray-600 cursor-pointer md:hidden"
              onClick={handleNavigation}
            />
          </div>
          <div className="hidden md:flex space-x-1 sm:space-x-2 items-center flex-shrink-0">
            <span className="hidden md:block text-gray-400">
              <div style={{ border: "0.1px solid #ddd", height: 40 }}></div>
            </span>
            {(activeTab === 3 || activeTab === 4) && (
              <div className="relative inline-block w-32">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full text-left px-3 py-1 rounded bg-transparent text-[#1D3A76] focus:outline-none flex justify-between items-center text-sm sm:text-base"
                >
                  {selected}
                  <IoChevronDownOutline className="w-4 h-4 text-[#1D3A76]" />
                </button>
                {isOpen && (
                  <ul className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-md border border-gray-300 text-sm sm:text-base">
                    {OPTIONS.map((option) => (
                      <li
                        key={option}
                        onClick={() => {
                          if (activeTab === 2) setPlotSubType(option);
                          else if (activeTab === 3)
                            setCommercialSubType(option);
                          setSelected(option);
                          setIsOpen(false);
                        }}
                        className={`px-3 py-1 text-left ${theme.button.secondary.hover} ${theme.button.secondary.hoverText}  cursor-pointer rounded-md transition-all duration-200`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <FaLocationCrosshairs
              onClick={getCurrentLocation}
              className="hidden md:block p-1 sm:p-2 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full hover:bg-gray-300 transition-all duration-300 cursor-pointer"
            />
            <button
              className={`hidden md:block ${theme.button.secondary.bg}  ${theme.button.secondary.text} px-3 sm:px-4 py-1 rounded-full shadow-lg ${theme.button.secondary.hover}  hover:border-1 hover:border-black transition-all duration-300 cursor-pointer text-sm sm:text-base whitespace-nowrap`}
              onClick={handleNavigation}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
