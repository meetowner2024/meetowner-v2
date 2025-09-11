import { IoClose } from "react-icons/io5";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import axios from "axios";

import { toast } from "react-toastify";
import { ArrowDownRight, LogOutIcon, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import config from "./config";
import Image from "next/image";
import { Button } from "../ui/button";
import theme from "./theme.json";
const Sidebar = ({
  menuOpen,
  setMenuOpen,
  setShowLoginModal,
  isLoggedIn,
  user,
  handleLogout,
  favourites,
}) => {
  const [openSections, setOpenSections] = useState([1]);
  const Data = useSelector((state) => state.auth.loggedIn);
  const intrested = useSelector((state) => state.property.intrested);
  const sidebarRef = useRef();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, setMenuOpen]);
  const playStoreUrl = "https://meetowner.in/app";
  const appStoreUrl = "https://meetowner.in/app";
  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };
  const getRecentActivity = (apiData, reduxData) => {
    if (apiData?.length) return apiData;
    if (reduxData?.length) return reduxData;
    return null;
  };
  const getUserDetails = () => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };
  const slugify = (text) =>
    text
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^|$)/g, "");
  const handleNavigation = useCallback(async (property) => {
    const userDetails = getUserDetails();
    if (!userDetails?.user_id) {
      console.warn("User details are missing or invalid.");
      return;
    }
    const viewData = {
      user_id: userDetails.user_id,
      property_id: property?.unique_property_id || "N/A",
      name: userDetails?.name || "N/A",
      mobile: userDetails?.mobile || "N/A",
      email: userDetails?.email || "N/A",
      property_name: property?.property_name || "N/A",
    };
    try {
      await axios.post(
        `${config.awsApiUrl}/listings/v1/propertyViewed`,
        viewData
      );
    } catch (error) {
      console.error("Failed to record property view:", error);
    }
    dispatch(
      setPropertyDetails({
        property,
      })
    );
    const propertyFor = property?.property_for === "Rent" ? "rent" : "buy";
    const propertyId = property.unique_property_id;
    const propertyNameSlug = slugify(property.property_name);
    const locationSlug = slugify(property.location_id);
    const seoUrl = `${propertyFor}_${property.sub_type}_${propertyNameSlug}_in_${locationSlug}_${searchData?.city}_Id_${propertyId}`;
    router.push(`/property?${seoUrl}`, { state: property });
  }, []);
  const [likedProperties, setLikedProperties] = useState([]);
  useEffect(() => {
    const liked = favourites;
    if (liked && Array.isArray(liked)) {
      setLikedProperties(liked);
    }
  }, [favourites]);
  const RecentActivitySwiper = ({ data }) => {
    if (!data?.length) {
      return <p className="text-sm text-gray-400 px-4">No found.</p>;
    }
    const formatToIndianCurrency = (value) => {
      if (!value || isNaN(value)) return "N/A";
      const numValue = parseFloat(value);
      if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
      if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
      if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
      return numValue.toString();
    };
    return (
      <Swiper
        spaceBetween={10}
        slidesPerView={1.8}
        freeMode
        className="w-full py-4 "
      >
        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-2 shadow-[0_0_10px_rgba(29,58,118,0.3)] w-[140px] ">
              <Image
                width={600}
                height={400}
                src={
                  item.image
                    ? `https://api.meetowner.in/assets/v1/serve/${item.image}`
                    : `https://placehold.co/600x400?text=${
                        item?.property_name || "No Image"
                      }`
                }
                alt="Property"
                crossOrigin="anonymous"
                className="rounded-lg w-full h-20 object-cover mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/600x400?text=${
                    item?.property_name || "No Image"
                  }`;
                }}
              />
              <div
                className="flex flex-col items-start cursor-pointer"
                onClick={() => handleNavigation(item)}
              >
                <p className="font-semibold text-xs text-black line-clamp-1">
                  {item.property_name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatToIndianCurrency(item.property_cost)}
                </p>
              </div>
              <button
                onClick={() => handleContactSeller(item)}
                className="w-full bg-[#1D3A76] cursor-pointer text-white text-xs font-medium px-3 py-1 rounded-lg mt-2 hover:shadow-[0_0_8px_rgba(29,58,118,0.7)] transition-all duration-200"
              >
                Contact
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };
  const url = "https://meetowner.in/app";
  const recentData = getRecentActivity(likedProperties, intrested);
  const sidebarItems = [
    {
      title: "Recent Activity",
      content: <RecentActivitySwiper data={recentData} />,
    },
    {
      title: "Download App",
      content: (
        <div className="flex justify-center">
          <QRCodeSVG
            value={url}
            size={180}
            includeMargin
            bgColor="transparent"
            fgColor="#1D3A76"
          />
        </div>
      ),
    },
  ];
  const handleContactSeller = async (property) => {
    try {
      const data = localStorage.getItem("user");
      if (!data) {
        toast.error("Please Login to Contact!");
        return;
      }
      const userDetails = JSON.parse(data);
      const payload = {
        unique_property_id: property.property_id,
        user_id: userDetails.user_id,
        fullname: userDetails.name,
        mobile: userDetails.mobile,
        email: userDetails.email,
      };
      await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, payload);
      toast.success("Contact request sent!");
    } catch (err) {
      toast.error("Failed to contact seller.");
    }
  };
  const handleRoute = () => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.info("Please Login!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    router.push("/profile");
  };
  const handleListings = () => {
    router.push("/pre-launch");
  };
  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 right-0 z-[9999] h-full w-72 bg-white bg-opacity-5 overflow-y-scroll scrollbar-hidden backdrop-blur-md shadow-[0_0_15px_rgba(29,58,118,0.5)] transform transition-transform duration-500 ${
        menuOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center px-4 py-4 border-b border-[#1D3A76] border-opacity-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#1D3A76] bg-opacity-20 flex items-center justify-center text-white text-lg font-bold">
            {isLoggedIn && user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            {isLoggedIn ? (
              <>
                <p className="text-xs text-black">Hello!</p>
                <p className="text-sm text-black font-semibold">
                  {user?.name || "Welcome back!"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-black font-semibold">
                  Sign in to get
                </p>
                <p className="text-xs text-gray-400">Personalised feed!</p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(false)}
          className="text-black hover:text-[#1D3A76] transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>
      </div>
      <div className="px-4 py-4 h-full scrollbar-hidden">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className="border-b border-[#1D3A76] border-opacity-20 "
          >
            <div
              onClick={() => toggleSection(index)}
              className="flex items-center justify-between py-4 cursor-pointer text-sm font-medium text-black hover:text-[#1D3A76] transition-colors duration-200"
            >
              <span>{item.title} </span>
              <span className="text-gray-400 text-xl">
                {openSections.includes(index) ? "−" : "›"}
              </span>
            </div>
            {openSections.includes(index) && (
              <div className="pb-4 transition-all duration-300">
                {item.content}
                {item.title === "Download App" && (
                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => window.open(playStoreUrl, "_blank")}
                      className="flex items-center flex-1 space-x-2 px-4 py-2 rounded-lg bg-yellow-500 text-black"
                    >
                      <FaGooglePlay className="h-5 w-5" />
                      <div className="flex flex-col text-left">
                        <span className="text-[10px]">Get it on</span>
                        <span className="text-[10px] font-semibold">
                          Google Play
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => window.open(appStoreUrl, "_blank")}
                      className="flex items-center flex-1 space-x-2 sm:space-x-3 px-4 py-2 rounded-lg bg-yellow-500 text-black"
                    >
                      <FaApple className="h-5 w-5" />
                      <div className="flex flex-col text-left">
                        <span className="text-[10px]">Available on </span>
                        <span className="text-[10px] font-semibold">
                          App Store
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <Button
          aria-label="Upcoming Projects"
          onClick={handleListings}
          className={`w-full mt-6 ${theme.button.secondary.bg}  ${theme.button.secondary.text} text-white font-medium py-2 rounded-lg hover:shadow-[0_0_12px_rgba(29,58,118,0.7)] transition-all duration-300 flex items-center justify-center`}
        >
          <ArrowDownRight className="w-5 h-5 mr-2" />
          Upcoming Projects
        </Button>
        <Button
          aria-label="Profile"
          onClick={handleRoute}
          className={`w-full ${theme.button.secondary.bg}  ${theme.button.secondary.text} mt-4  text-white font-medium py-2 rounded-lg hover:bg-opacity-30 hover:shadow-[0_0_12px_rgba(29,58,118,0.7)] transition-all duration-300 flex items-center justify-center`}
        >
          <User2Icon className="w-5 h-5 mr-2" />
          Profile
        </Button>
        <Button
          aria-label="Logout"
          onClick={() => {
            if (isLoggedIn) {
              handleLogout();
            } else {
              setShowLoginModal(true);
            }
            setMenuOpen(false);
          }}
          className={`w-full mt-4 ${
            isLoggedIn ? "bg-red-500" : "bg-green-500"
          } text-white font-medium py-2 rounded-lg hover:shadow-[0_0_12px_rgba(29,58,118,0.7)] transition-all duration-300 flex items-center justify-center`}
        >
          <LogOutIcon className="w-5 h-5 mr-2" />
          {isLoggedIn ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
};
export default Sidebar;
