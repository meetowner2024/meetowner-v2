"use client";
const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Ruler, Home, Key, Building, BathIcon, BedDouble } from "lucide-react";
import { IoIosHeart } from "react-icons/io";
import { MdOutlineVerified } from "react-icons/md";
import { useRouter } from "next/navigation";
import config from "../../components/utils/config";
import axios from "axios";
import ScheduleFormModal from "../../components/utils/ScheduleForm";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DynamicAds from "../../components/utils/DynamicAds";
import useWhatsappHook from "../../components/utils/useWhatsappHook";
import Login from "../../components/auth/Login";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import whatsappIcon from "../../app/assets/Images/whatsapp (3).png";
import { Pagination } from "swiper/modules";
import postIcon from "../../app/assets/Images//post.gif";
import CryptoJS from "crypto-js";
import { setPropertyDetails } from "@/components/store/slices/propertyDetails";
import { useDispatch } from "react-redux";
import Image from "next/image";
const PropertyCard = memo(
  ({
    property,
    handleNavigation,
    handleLike,
    handleScheduleVisit,
    submittedState,
    contacted,
    getOwnerDetails,
    setShowLoginModal,
  }) => {
    const handleChatClick = async (e) => {
      e.stopPropagation();
      const data = localStorage.getItem("user");
      const userData = JSON.parse(data);
      if (!data) {
        toast.info("Please Login to Schedule Visits!", {
          position: "top-right",
          autoClose: 3000,
        });
        setShowLoginModal(true);
        return;
      }
      try {
        const sellerData = await getOwnerDetails(property);
        const phone = sellerData?.mobile || sellerData?.phone;
        const name = sellerData?.name || "";
        if (phone) {
          const propertyFor =
            property.property_for === "Rent" ? "rent" : "sale";
          const propertyId = property.unique_property_id;
          const bhkPart = property.bedrooms ? `${property.bedrooms}-bhk-` : "";
          const subTypePart = property.sub_type ? `${property.sub_type}-` : "";
          const propertyNameSlug = property.property_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const builderNameSlug = property.builder_name
            ? `-by-${property.builder_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")}`
            : "";
          const locationSlug = property.location_id
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const citySlug = property.city
            ? property.city
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
            : "hyderabad";
          const forPart = `for-${propertyFor}-`;
          const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
          const fullUrl = `${window.location.origin}/property/${seoSlug}/${propertyId}`;
          const encodedMessage = encodeURIComponent(
            `Hi ${name},\nI'm interested in this property: ${property.property_name}.\n${fullUrl}\nI look forward to your assistance in the home search. Please get in touch with me at ${userData.mobile} to initiate the process.`
          );
          const whatsappUrl = `https://wa.me/+91${phone}?text=${encodedMessage}`;
          window.open(whatsappUrl, "_blank");
        } else {
          toast.error("Owner's phone number is not available.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error("Failed to fetch owner's contact details.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    const handleContactClick = (e) => {
      e.stopPropagation();
      handleScheduleVisit(property);
    };
    return (
      <div
        className="flex flex-col w-full max-w-[900px] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-shadow duration-300 bg-white cursor-pointer mb-6 mx-auto"
        onClick={() => handleNavigation(property)}
      >
        <div className="bg-white rounded-[20px] p-4 w-full">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="w-full lg:w-[300px]">
              <div className="rounded-lg overflow-hidden mb-4 relative">
                <Image
                  width={600}
                  height={600}
                  src={
                    property.image
                      ? `https://api.meetowner.in/assets/v1/serve/${property.image}`
                      : `https://placehold.co/600x400?text=${
                          property?.image || "No Image Found"
                        }`
                  }
                  alt="Property"
                  crossOrigin="anonymous"
                  className="w-full h-48 lg:h-60 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/600x400?text=${
                      property?.property_name || "No Image Found"
                    }`;
                  }}
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="mb-3 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <p className="text-blue-900 font-bold text-[18px] mb-2 sm:mb-0">
                    {property.property_name}
                  </p>
                  <div className="flex items-center gap-2 text-[#1D3A76] text-sm font-medium">
                    <IoIosHeart
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(property);
                      }}
                      className="p-1 w-7 h-7 bg-white rounded-2xl text-red-600 cursor-pointer"
                    />
                    <MdOutlineVerified className="text-xl text-green-500" />
                    <p>Verified</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between">
                  <p className="text-[#1D3A76] font-semibold text-[18px]">
                    {property.project_name || ""}{" "}
                    <span className="text-blue-900 font-medium text-[15px]">
                      Rs: {formatToIndianCurrency(property.property_cost)}{" "}
                      {property.price_negotiable && " (Negotiable)"}
                    </span>
                    <span className="text-[#A4A4A4] font-medium text-[15px] ml-2">
                      {property?.loan_facility === "Yes"
                        ? "EMI option Available"
                        : ""}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[#A4A4A4] font-medium text-[15px]">
                    Property Details
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 w-full">
                  {[
                    {
                      icon: <BedDouble className="w-4 h-4" />,
                      title: "BHK",
                      value: property?.bedrooms,
                      shouldDisplay: !!property?.bedrooms,
                    },
                    {
                      icon: <BathIcon className="w-4 h-4" />,
                      title: "Bathrooms",
                      value: property?.bathroom,
                      shouldDisplay: !!property?.bathroom,
                    },
                    {
                      icon: <Ruler className="w-4 h-4" />,
                      title: property?.builtup_area
                        ? "Built-up Area"
                        : "Built-up Units",
                      value: `${
                        property?.builtup_area ||
                        property?.builtup_unit ||
                        "N/A"
                      } ${property?.area_units || ""}`,
                      shouldDisplay: true,
                    },
                    {
                      icon: <Home className="w-4 h-4" />,
                      title: "Facing",
                      value: property?.facing || "N/A",
                      shouldDisplay: true,
                    },
                    {
                      icon: <Key className="w-4 h-4" />,
                      title: "Property In",
                      value: property?.property_in || "N/A",
                      shouldDisplay: true,
                    },
                    {
                      icon: <Building className="w-4 h-4" />,
                      title: "Sub Type",
                      value: property?.sub_type || "N/A",
                      shouldDisplay: true,
                    },
                  ]
                    .filter((item) => item.shouldDisplay)
                    .map((detail, idx) => (
                      <div
                        key={idx}
                        className="rounded-md bg-gray-50 p-2 text-xs flex flex-col justify-between min-h-[60px]"
                      >
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                          {detail.icon}
                          {detail.title}
                        </span>
                        <div className=" text-[#1D3A76] font-medium truncate">
                          <span className="flex items-center gap-1 text-[13px]">
                            {detail.value}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={handleChatClick}
                  className="flex items-center cursor-pointer justify-center gap-1 border border-[#25D366] text-[#25D366] px-6 py-2 rounded-full text-sm font-medium"
                >
                  <Image
                    width={100}
                    height={100}
                    src={whatsappIcon?.src}
                    alt="WhatsApp"
                    className="w-4 h-4"
                  />
                  Chat
                </button>
                <button
                  onClick={handleContactClick}
                  className="bg-blue-900 hover:bg-blue-900  text-white px-6 py-2 rounded-full text-sm font-semibold"
                  disabled={
                    submittedState?.contact ||
                    contacted.includes(property.unique_property_id)
                  }
                >
                  {contacted.includes(property.unique_property_id) ||
                  submittedState?.contact
                    ? "Submitted"
                    : "Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
PropertyCard.displayName = "PropertyCard";
const Favourites = () => {
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET).toString();
  function decrypt(encryptedText) {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      CryptoJS.enc.Hex.parse(ENCRYPTION_KEY),
      { iv }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  const dispatch = useDispatch();
  const [likedProperties, setLikedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readMoreStates, setReadMoreStates] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const modalRef = useRef(null);
  const [contacted, setContacted] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [submittedStates, setSubmittedStates] = useState({});
  const [owner, setOwner] = useState("");
  const { handleAPI } = useWhatsappHook();
  const router = useRouter();
  const fetchLikedProperties = useCallback(async () => {
    const data = localStorage.getItem("user");
    if (!data) return;
    const userDetails = JSON.parse(data);
    try {
      const response = await axios.get(
        `${config.awsApiUrl}/fav/v1/getAllFavourites?user_id=${userDetails.user_id}`
      );
      const liked = response.data.favourites || [];
      setLikedProperties(liked);
    } catch (error) {
      console.error("Failed to fetch liked properties:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchContactedProperties = useCallback(async () => {
    const data = localStorage.getItem("user");
    if (!data) return;
    const userDetails = JSON.parse(data);
    try {
      const response = await axios.get(
        `${config.awsApiUrl}/enquiry/v1/getUserContactSellers?user_id=${userDetails.user_id}`
      );
      const contacts = response?.data || {};
      const contactIds = contacts.results
        ? contacts.results.map((contact) => contact.unique_property_id)
        : [];
      setContacted(contactIds);
    } catch (error) {
      console.error("Failed to fetch contacted properties:", error);
    }
  }, []);
  useEffect(() => {
    fetchLikedProperties();
    fetchContactedProperties();
  }, [fetchLikedProperties, fetchContactedProperties]);
  const toggleReadMore = useCallback((index) => {
    setReadMoreStates((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);
  const toggleFacilities = useCallback((index) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);
  const handleClose = useCallback(() => {
    setShowLoginModal(false);
  }, []);
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const getOwnerDetails = useCallback(async (property) => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/v1/gspmeet?unique_property_id=${property.unique_property_id}`
      );
      const data = await response.json();
      const propertydata = data.property;
      const decryptedJson = decrypt(propertydata);
      const parsed = decryptedJson ? JSON.parse(decryptedJson) : null;
      const sellerdata = parsed.user;
      if (response.ok) {
        setOwner(sellerdata);
        return sellerdata;
      } else {
        throw new Error("Failed to fetch owner details");
      }
    } catch (err) {}
  }, []);
  const handleNavigation = useCallback(
    async (property) => {
      let userDetails = null;
      try {
        const data = localStorage.getItem("user");
        if (data) {
          const parsedData = JSON.parse(data);
          userDetails = parsedData || null;
        }
      } catch (error) {
        userDetails = null;
      }
      if (userDetails?.user_id) {
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
          console.error("Failed to record property view:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
      }
      try {
        dispatch(setPropertyDetails({ property }));
        const propertyFor = property?.property_for === "Rent" ? "rent" : "sale";
        const propertyId = property?.unique_property_id || "N/A";
        const bhkPart = property.bedrooms ? `${property.bedrooms}-bhk-` : "";
        const subTypePart = property.sub_type ? `${property.sub_type}-` : "";
        const propertyNameSlug = (property?.property_name || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const builderNameSlug = property.builder_name
          ? `-by-${property.builder_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")}`
          : "";
        const locationSlug = (property?.location_id || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const citySlug = (property?.city_id || "hyderabad")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const forPart = `for-${propertyFor}-`;
        const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
        const cleanSeoUrl = `/property/${seoSlug}/${propertyId}`;
        router.push(cleanSeoUrl, { state: property });
      } catch (navError) {
        console.error("Navigation error:", navError);
      }
    },
    [router, dispatch]
  );
  const handleLike = useCallback(
    async (property) => {
      const data = localStorage.getItem("user");
      if (!data) {
        toast.error("Please Login to Contact!");
        return;
      }
      const userDetails = JSON.parse(data);
      const payload = {
        user_id: userDetails.user_id,
        unique_property_id: property.unique_property_id,
        property_name: property.property_name,
      };
      try {
        await axios.post(`${config.awsApiUrl}/fav/v1/postIntrest`, payload);
        fetchLikedProperties();
      } catch (err) {
        console.error("Error updating interest:", err);
      }
    },
    [fetchLikedProperties]
  );
  const handleScheduleVisit = useCallback((property) => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.info("Please Login to Schedule Visits!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    const userDetails = JSON.parse(data);
    setSelectedProperty(property);
    const alreadySubmitted = localStorage.getItem("visit_submitted") === "true";
    const isNameMissing = !userDetails?.name || userDetails.name === "N/A";
    const isEmailMissing = !userDetails?.email || userDetails.email === "N/A";
    const isMobileMissing =
      !userDetails?.mobile || userDetails.mobile === "N/A";
    if (
      !isNameMissing &&
      !isEmailMissing &&
      !isMobileMissing &&
      alreadySubmitted
    ) {
      handleModalSubmit(property);
    } else {
      setModalOpen(true);
    }
  }, []);
  const handleModalSubmit = useCallback(
    async (property) => {
      try {
        const userDetails = JSON.parse(localStorage.getItem("user"));
        const payload = {
          unique_property_id: property.unique_property_id,
          user_id: userDetails.user_id,
          fullname: userDetails.name,
          mobile: userDetails.mobile,
          email: userDetails.email,
        };
        await axios.post(
          `${config.awsApiUrl}/enquiry/v1/contactSeller`,
          payload
        );
        await handleAPI(property);
        localStorage.setItem("visit_submitted", "true");
        setSubmittedStates((prev) => ({
          ...prev,
          [property.unique_property_id]: {
            ...prev[property.unique_property_id],
            contact: true,
          },
        }));
        setModalOpen(false);
      } catch (err) {
        toast.error("Something went wrong!");
      }
    },
    [handleAPI]
  );
  const handleContactSeller = useCallback(
    async (property) => {
      try {
        const data = localStorage.getItem("user");
        if (!data) {
          toast.info("Please Login to Contact!");
          setShowLoginModal(true);
          return;
        }
        const userDetails = JSON.parse(data);
        const payload = {
          unique_property_id: property.unique_property_id,
          user_id: userDetails.user_id,
          fullname: userDetails.name,
          mobile: userDetails.mobile,
          email: userDetails.email,
        };
        await axios.post(
          `${config.awsApiUrl}/enquiry/v1/contactSeller`,
          payload
        );
        await handleAPI(property);
        setSubmittedStates((prev) => ({
          ...prev,
          [property.unique_property_id]: {
            ...prev[property.unique_property_id],
            chat: true,
          },
        }));
      } catch (err) {
        toast.error("Something went wrong while submitting enquiry");
      }
    },
    [handleAPI]
  );
  if (!likedProperties.length) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <Image
            width={600}
            height={600}
            src={postIcon?.src}
            alt="No favourites"
            className="w-55 h-55 mb-4 opacity-80"
          />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Favourites Yet
          </h2>
          <p className="text-gray-500 text-md">
            Looks like you haven't liked any properties yet.
          </p>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row justify-center px-4  sm:px-6 lg:px-10 py-6 pb-10 gap-6">
        <div className="w-full lg:w-3/4 max-w-[900px] ">
          {isMobileView ? (
            <Swiper
              modules={[Pagination]}
              direction="horizontal"
              spaceBetween={24}
              slidesPerView={1}
              pagination={{
                clickable: true,
              }}
              className="w-full"
            >
              {likedProperties.map((property, index) => (
                <SwiperSlide key={index} className="w-full">
                  <PropertyCard
                    property={property}
                    index={index}
                    toggleReadMore={toggleReadMore}
                    toggleFacilities={toggleFacilities}
                    handleNavigation={handleNavigation}
                    readMoreStates={readMoreStates}
                    expandedCards={expandedCards}
                    likedProperties={likedProperties}
                    handleLike={handleLike}
                    handleScheduleVisit={handleScheduleVisit}
                    handleContactSeller={handleContactSeller}
                    submittedState={
                      submittedStates[property.unique_property_id] || {}
                    }
                    setShowLoginModal={setShowLoginModal}
                    contacted={contacted}
                    getOwnerDetails={getOwnerDetails}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="flex flex-col gap-6">
              {likedProperties.map((property, index) => (
                <PropertyCard
                  key={index}
                  property={property}
                  index={index}
                  toggleReadMore={toggleReadMore}
                  toggleFacilities={toggleFacilities}
                  handleNavigation={handleNavigation}
                  readMoreStates={readMoreStates}
                  expandedCards={expandedCards}
                  likedProperties={likedProperties}
                  handleLike={handleLike}
                  handleScheduleVisit={handleScheduleVisit}
                  handleContactSeller={handleContactSeller}
                  submittedState={
                    submittedStates[property.unique_property_id] || {}
                  }
                  setShowLoginModal={setShowLoginModal}
                  contacted={contacted}
                  getOwnerDetails={getOwnerDetails}
                />
              ))}
            </div>
          )}
        </div>
        <DynamicAds />
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-xs">
          <div ref={modalRef} className="relative w-[90%] max-w-sm">
            <Login
              setShowLoginModal={setShowLoginModal}
              showLoginModal={showLoginModal}
              onClose={handleClose}
              modalRef={modalRef}
            />
          </div>
        </div>
      )}
      {modalOpen && (
        <ScheduleFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
      <ToastContainer />
      <Footer />
    </>
  );
};
export default Favourites;
