"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { MapPin, ChevronDown, ChevronUp, X } from "lucide-react";
import noPropertiesFound from "../../app/assets/Images/14099.jpg";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  List,
  AutoSizer,
  WindowScroller,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import axios from "axios";
import useWhatsappHook from "../utils/useWhatsappHook";
import Breadcrumb from "../utils/BreadCrumb";
import { toast } from "react-toastify";
import PropertyCard from "./PropertyCard";
import SkeletonPropertyCard from "./SkeletonPropertyCard";
import config from "../utils/config";
import Image from "next/image";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import dynamic from "next/dynamic";
import { dummyAds } from "../utils/dummyAds";
import ListingAdsCard from "../utils/ListingAdsCard";
import CryptoJS from "crypto-js";
import { clearSearch } from "../store/slices/searchSlice";
const ScheduleFormModal = dynamic(() => import("../utils/ScheduleForm"), {
  ssr: false,
});
const AdsCard = dynamic(() => import("./AdsCard"), {
  ssr: false,
});
const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 320,
  minHeight: 300,
});
function ListingsBody({ setShowLoginModal, initialized = false }) {
  const JWT_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
  const ENCRYPTION_KEY = CryptoJS.SHA256(JWT_SECRET);
  function decrypt(encryptedText) {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      ENCRYPTION_KEY,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  const [modalOpen, setModalOpen] = useState(false);
  const searchData = useSelector((state) => state.search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [readMoreStates, setReadMoreStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const maxLimit = 500;
  const [likedProperties, setLikedProperties] = useState([]);
  const [contacted, setContacted] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Relevance");
  const router = useRouter();
  const pathname = usePathname();
  const seoSlug = useMemo(() => {
    const { bhk, property_in, sub_type, tab, location, city } = searchData;
    if (!city) return null;
    if (
      !bhk &&
      !sub_type &&
      !location &&
      property_in === "Residential" &&
      tab === "Buy"
    ) {
      return "/listings";
    }
    const slugify = (text) => {
      if (!text) return "";
      return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    };
    const bhkPart = bhk ? `${bhk}-bhk` : "";
    const propertyInPart =
      property_in?.toLowerCase() === "commercial"
        ? "commercial"
        : property_in?.toLowerCase() === "plot"
        ? "plot"
        : "residential";
    const subTypePart = sub_type ? slugify(sub_type) : "";
    const propertyForPart = tab === "Rent" ? "rent" : "sale";
    const locationPart = location ? slugify(location) : "";
    const cityPart = slugify(city);
    const parts = [
      bhkPart,
      propertyInPart,
      subTypePart,
      `for-${propertyForPart}`,
    ].filter(Boolean);
    const locationSegment = locationPart
      ? `in-${locationPart}-${cityPart}`
      : `in-${cityPart}`;
    return `/listings/${parts.join("-")}-${locationSegment}`;
  }, [
    searchData.bhk,
    searchData.property_in,
    searchData.sub_type,
    searchData.tab,
    searchData.location,
    searchData.city,
  ]);
  useEffect(() => {
    if (!initialized || !seoSlug || seoSlug === pathname) return;
    router.replace(seoSlug, { scroll: false });
  }, [seoSlug, pathname, router, initialized]);
  const options = [
    "Relevance",
    "Price: Low to High",
    "Price: High to Low",
    "Newest First",
  ];
  const sendUserSearchActivity = (viewData) => {
    try {
      const blob = new Blob([JSON.stringify(viewData)], {
        type: "application/json",
      });
      navigator.sendBeacon(`${config.awsApiUrl}/enquiry/v1/userActivity`, blob);
    } catch (error) {
      console.error("Beacon send failed:", error);
    }
  };
  const handleUserSearched = async () => {
    let userDetails = null;
    try {
      const data = localStorage.getItem("user");
      if (data) {
        const parsedData = JSON.parse(data);
        userDetails = parsedData || null;
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      userDetails = null;
    }
    if (userDetails?.user_id && searchData?.city) {
      const viewData = {
        user_id: userDetails.user_id,
        searched_location: searchData?.location || "N/A",
        searched_for: searchData?.tab || "N/A",
        name: userDetails?.name || "N/A",
        mobile: userDetails?.mobile || "N/A",
        email: userDetails?.email || "N/A",
        searched_city: searchData?.city || "N/A",
        property_in: searchData?.property_in || "N/A",
        sub_type: searchData?.sub_type || "N/A",
      };
      try {
        sendUserSearchActivity(viewData);
      } catch (error) {
        console.error("Failed to record property view:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    }
  };
  useEffect(() => {
    const fetchLikedProperties = async () => {
      const data = localStorage.getItem("user");
      if (!data?.user_id) {
        return;
      }
      const userDetails = JSON.parse(data);
      try {
        const response = await axios.get(
          `${config.awsApiUrl}/fav/v1/getAllFavourites?user_id=${userDetails?.user_id}`
        );
        const liked = response.data.favourites || [];
        const likedIds = liked?.map((fav) => fav.unique_property_id);
        setLikedProperties(likedIds);
      } catch (error) {
        console.error("Failed to fetch liked properties:", error);
      }
    };
    fetchLikedProperties();
  }, []);
  const slugify = (value) => {
    return (
      value
        ?.toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || ""
    );
  };
  const buildListingsSeoUrl = (data) => {
    const citySlug = slugify(data.city || "hyderabad");
    const locationSlug = slugify(data.location || "all");
    const propertyInSlug = slugify(data.property_in || "residential");
    const subType = slugify(data.sub_type || data.property_type || "");
    const typePart = subType ? `${propertyInSlug}-${subType}` : propertyInSlug;
    const propertyFor = data.property_for === "Rent" ? "rent" : "sale";
    const seoSlug = `${typePart}-for-${propertyFor}-in-${locationSlug}-${citySlug}`;
    return `/listings/${seoSlug}`;
  };
  const fetchProperties = useCallback(
    async (currentPage = 1, reset = false) => {
      let apiUrl;
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        handleUserSearched();
        const validPropertyIn = ["Residential", "Commercial", "Plot"];
        if (
          searchData?.property_in &&
          !validPropertyIn.includes(searchData.property_in)
        ) {
          toast.error("Invalid property type provided");
          router.push(
            buildListingsSeoUrl({
              ...searchData,
              property_in: "Residential",
              location: "",
            })
          );
          return;
        }
        if (
          searchData?.location &&
          !/^[a-zA-Z\s]+$/.test(searchData.location)
        ) {
          router.push(
            buildListingsSeoUrl({
              ...searchData,
              location: "",
            })
          );
          return;
        }
        const isPlot = searchData?.sub_type === "Plot";
        const statusParam = isPlot
          ? `possession_status=${searchData?.possession_status || ""}`
          : `occupancy=${searchData?.occupancy || ""}`;
        const queryParams = {
          page: currentPage,
          limit: 70,
          property_for:
            searchData?.tab === "Latest"
              ? "Sell"
              : searchData.tab === "Buy"
              ? "Sell"
              : searchData?.tab === "Rent"
              ? "Rent"
              : searchData?.tab === "Plot"
              ? "Sell"
              : "Sell",
          property_in: searchData?.property_in || "Residential",
          sub_type:
            searchData?.sub_type === "Others" ? "" : searchData?.sub_type,
          search: searchData?.location || "",
          bedrooms: searchData?.bhk || "",
          property_cost: searchData?.budget || "",
          priceFilter: encodeURIComponent(selected),
          property_status: "1",
          city: searchData?.city,
          furnished_status: searchData?.furnished_status || "",
          extra_filters: searchData?.tab === "New Launch" ? "new_launches" : "",
        };
        const queryString =
          new URLSearchParams(
            Object.entries(queryParams).filter(
              ([_, value]) => value !== "" && value !== undefined
            )
          ).toString() + (isPlot ? `&${statusParam}` : `&${statusParam}`);
        apiUrl = `${config.awsApiUrl}/listings/v1/gapbType?${queryString}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const res = await response.json();
        if (!res.data) {
          setHasMore(false);
          return;
        }
        let decrypted;
        try {
          decrypted = decrypt(res.data);
        } catch (error) {
          console.error("Decryption failed:", error);
          throw new Error("Failed to decrypt API response");
        }
        let parsed;
        try {
          parsed = JSON.parse(decrypted);
        } catch (error) {
          console.error(
            "JSON parse error:",
            error,
            "Decrypted data:",
            decrypted
          );
          throw new Error("Invalid decrypted JSON");
        }
        const newData = parsed.properties || [];
        setData((prevData) => {
          if (reset) {
            return newData.slice(0, maxLimit);
          }
          const combined = [
            ...prevData,
            ...newData.filter(
              (newItem) =>
                !prevData.some(
                  (prevItem) =>
                    prevItem.unique_property_id === newItem.unique_property_id
                )
            ),
          ].slice(0, maxLimit);
          return combined;
        });
        setHasMore(newData.length > 0 && currentPage * 70 < maxLimit);
      } catch (error) {
        console.error("Failed to fetch properties:", error, "URL:", apiUrl);
        if (reset) {
          setData([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [searchData, selected, router, decrypt]
  );
  const fetchContactedProperties = async () => {
    const data = localStorage.getItem("user");
    if (!data) {
      return null;
    }
    const userDetails = JSON.parse(data);
    try {
      const response = await axios.get(
        `${config.awsApiUrl}/enquiry/v1/getUserContactSellers?user_id=${userDetails?.user_id}`
      );
      const contacts = response?.data?.results || response?.data || [];
      const contactIds = Array.isArray(contacts)
        ? contacts.map((contact) => contact.unique_property_id)
        : [];
      setContacted(contactIds);
    } catch (error) {
      console.error("Failed to fetch contacted properties:", error);
    }
  };
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchProperties(1, true);
    fetchContactedProperties();
  }, [
    searchData?.location,
    searchData?.bhk,
    searchData?.city,
    searchData?.property_in,
    searchData?.tab,
    searchData?.occupancy,
    searchData?.sub_type,
    searchData?.budget,
    searchData?.furnished_status,
    searchData?.occupancy,
    searchData?.possession_status,
    selected,
  ]);
  useEffect(() => {
    if (page > 1) fetchProperties(page);
  }, [page]);
  const toggleReadMore = useCallback((index) => {
    setReadMoreStates((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);
  const toggleFacilities = useCallback((index) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);
  const dispatch = useDispatch();
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
        console.error("Error parsing localStorage data:", error);
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
        dispatch(
          setPropertyDetails({
            property,
          })
        );
        const propertyFor = property?.property_for === "Rent" ? "rent" : "sale";
        const propertyId = property?.unique_property_id || "N/A";
        const bhkPart = property?.bedrooms ? `${property.bedrooms}-bhk-` : "";
        const subTypePart = property?.sub_type
          ? `${property.sub_type.toLowerCase().replace(/\s+/g, "-")}-`
          : "";
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
        const citySlug = (searchData?.city || "hyderabad")
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
    [router, dispatch, searchData, selected]
  );
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [submittedStates, setSubmittedStates] = useState({});
  const [shouldSubmit, setShouldSubmit] = useState(false);
  useEffect(() => {
    if (selectedProperty && shouldSubmit) {
      handleModalSubmit();
      setShouldSubmit(false);
    }
  }, [selectedProperty, shouldSubmit]);
  const { handleAPI } = useWhatsappHook(selectedProperty);
  const handleLike = useCallback(
    async (property) => {
      const data = localStorage.getItem("user");
      if (!data) {
        toast.info("Please Login to Save Property!");
        setShowLoginModal(true);
        return;
      }
      const userDetails = JSON.parse(data);
      const isAlreadyLiked = likedProperties.includes(
        property.unique_property_id
      );
      setLikedProperties((prev) =>
        isAlreadyLiked
          ? prev.filter((id) => id !== property.unique_property_id)
          : [...prev, property.unique_property_id]
      );
      const payload = {
        user_id: userDetails.user_id,
        unique_property_id: property.unique_property_id,
        property_name: property.property_name,
      };
      try {
        await axios.post(`${config.awsApiUrl}/fav/v1/postIntrest`, payload);
      } catch (err) {
        setLikedProperties((prev) =>
          isAlreadyLiked
            ? [...prev, property.unique_property_id]
            : prev.filter((id) => id !== property.unique_property_id)
        );
      }
    },
    [likedProperties]
  );
  const getOwnerDetails = useCallback(async (property) => {
    if (!property?.unique_property_id) {
      console.error("Invalid property in getOwnerDetails:", property);
      throw new Error("Invalid property data");
    }
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/v1/gspmeet?unique_property_id=${property.unique_property_id}`
      );
      const data = await response.json();
      const propertydata = data?.property;
      const decryptedJson = decrypt(propertydata);
      const parsed = decryptedJson ? JSON.parse(decryptedJson) : null;
      const sellerData = parsed.user;
      if (response.ok && sellerData) {
        return sellerData;
      } else {
        console.error("Failed to fetch owner details:", data);
        throw new Error("Failed to fetch owner details");
      }
    } catch (err) {
      console.error("Error fetching owner details:", err, { property });
      throw err;
    }
  }, []);
  const handleModalSubmit = useCallback(async () => {
    if (!selectedProperty?.unique_property_id) {
      toast.error("No property selected!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(
        "No selectedProperty in handleModalSubmit:",
        selectedProperty
      );
      return;
    }
    try {
      const userDetails = JSON.parse(localStorage.getItem("user"));
      if (!userDetails) {
        toast.info("Please Login to Schedule Visits!", {
          position: "top-right",
          autoClose: 3000,
        });
        setShowLoginModal(true);
        return;
      }
      const payload = {
        unique_property_id: selectedProperty.unique_property_id,
        user_id: userDetails?.user_id || "N/A",
        fullname: userDetails?.name || "N/A",
        mobile: userDetails?.mobile || "N/A",
        email: userDetails?.email || "N/A",
      };
      const sellerData = await getOwnerDetails(selectedProperty);
      const SubType =
        selectedProperty.sub_type === "Apartment"
          ? `${selectedProperty.sub_type} ${selectedProperty.bedrooms || ""}BHK`
          : selectedProperty.sub_type || "N/A";
      const smspayload = {
        name: userDetails?.name || "N/A",
        mobile: userDetails?.mobile || "N/A",
        sub_type: SubType,
        location: selectedProperty.location_id?.split(/[\s,]+/)[0] || "N/A",
        property_cost: formatToIndianCurrency(
          selectedProperty.property_cost || 0
        ),
        ownerMobile: sellerData?.mobile || sellerData?.phone || "N/A",
      };
      await axios.post(
        `${config.awsApiUrl}/enquiry/v1/sendLeadTextMessage`,
        smspayload
      );
      await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, payload);
      await handleAPI(selectedProperty);
      fetchContactedProperties();
      localStorage.setItem("visit_submitted", "true");
      setSubmittedStates((prev) => ({
        ...prev,
        [selectedProperty.unique_property_id]: {
          ...prev[selectedProperty.unique_property_id],
          contact: true,
        },
      }));
      setContacted((prev) =>
        prev.includes(selectedProperty.unique_property_id)
          ? prev
          : [...prev, selectedProperty.unique_property_id]
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Error in handleModalSubmit:", err, { selectedProperty });
      toast.error("Something went wrong while scheduling visit", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [
    handleAPI,
    selectedProperty,
    setSubmittedStates,
    setModalOpen,
    setShowLoginModal,
    fetchContactedProperties,
  ]);
  const handleScheduleVisit = useCallback(
    (property) => {
      if (!property?.unique_property_id) {
        toast.error("Invalid property data!", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Invalid property in handleScheduleVisit:", property);
        return;
      }
      setSelectedProperty(property);
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
      const alreadySubmitted =
        localStorage.getItem("visit_submitted") === "true";
      const isNameMissing = !userDetails?.name || userDetails?.name === "N/A";
      const isEmailMissing =
        !userDetails?.email || userDetails?.email === "N/A";
      const isMobileMissing =
        !userDetails?.mobile || userDetails?.mobile === "N/A";
      if (
        !isNameMissing &&
        !isEmailMissing &&
        !isMobileMissing &&
        alreadySubmitted
      ) {
        setShouldSubmit(true);
      } else {
        setModalOpen(true);
      }
    },
    [setShowLoginModal, setSelectedProperty, setModalOpen]
  );
  const cards = useMemo(() => {
    const result = [...data];
    if (result?.length >= 6 && dummyAds?.length >= 1) {
      const minPosition = 6;
      const maxPosition = Math.min(12, result?.length - 1);
      const randomPosition =
        Math.floor(Math.random() * (maxPosition - minPosition + 1)) +
        minPosition;
      result?.splice(randomPosition, 0, {
        ...dummyAds[0],
        isAd: true,
        key: "ad-popular-filters-random",
      });
    }
    if (loading && hasMore) {
      result?.push(...Array(3).fill({ type: "skeleton" }));
    }
    return result;
  }, [data, loading, hasMore]);
  const rowRenderer = useCallback(
    ({ index, key, style, parent }) => {
      const item = cards[index];
      return (
        <CellMeasurer
          cache={cache}
          columnIndex={0}
          rowIndex={index}
          parent={parent}
          key={key}
        >
          {({ registerChild }) => (
            <div
              key={key}
              style={{
                ...style,
                paddingBottom: window.innerWidth < 768 ? "24px" : "32px",
                marginBottom: window.innerWidth < 768 ? "16px" : "24px",
              }}
              className="w-full flex justify-center px-2 mt-3"
            >
              <div className="w-full">
                {item.type === "skeleton" ? (
                  <SkeletonPropertyCard />
                ) : item.isAd ? (
                  <div className="m-0 p-0">
                    <ListingAdsCard
                      ad={item}
                      onPropertyClick={handleNavigation}
                    />
                  </div>
                ) : (
                  <PropertyCard
                    property={item}
                    index={index}
                    toggleReadMore={toggleReadMore}
                    toggleFacilities={toggleFacilities}
                    handleNavigation={handleNavigation}
                    readMoreStates={readMoreStates}
                    expandedCards={expandedCards}
                    likedProperties={likedProperties}
                    contacted={contacted}
                    handleLike={handleLike}
                    handleScheduleVisit={handleScheduleVisit}
                    submittedState={
                      submittedStates[item.unique_property_id] || {}
                    }
                    getOwnerDetails={getOwnerDetails}
                    setShowLoginModal={setShowLoginModal}
                  />
                )}
              </div>
            </div>
          )}
        </CellMeasurer>
      );
    },
    [
      cards,
      cache,
      toggleReadMore,
      toggleFacilities,
      handleNavigation,
      readMoreStates,
      expandedCards,
      likedProperties,
      contacted,
      handleLike,
      handleScheduleVisit,
      submittedStates,
      getOwnerDetails,
      setShowLoginModal,
    ]
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="min-h-screen relative z-0 overflow-visible">
      <div className="hidden md:block sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="w-full px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base font-medium text-[#1D3A76] leading-tight truncate">
                    {searchData?.property_in === "Commercial"
                      ? "Commercial"
                      : searchData?.property_in === "Plot"
                      ? "Plot"
                      : "Residential"}{" "}
                    {searchData?.sub_type && (
                      <span className="font-semibold">
                        {searchData.sub_type}
                      </span>
                    )}{" "}
                    For{" "}
                    <span className="font-semibold">
                      {searchData?.tab === "Rent" ? "Rent" : "Sell"}
                    </span>{" "}
                    in{" "}
                    <span className="font-bold text-[#1D3A76]">
                      {searchData?.city || "India"}
                    </span>
                  </p>
                </div>

                <div className="hidden md:block">
                  <Breadcrumb />
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="md:hidden flex-1">
                  <Breadcrumb />
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-linear-to-r from-[#3A59D1] to-[#3D90D7] 
                         text-white font-medium px-5 py-2.5 rounded-xl 
                         shadow-lg hover:shadow-xl transition-all duration-300 
                         whitespace-nowrap text-sm min-w-max"
                  >
                    <span>Sort</span>
                    <span className="font-bold max-w-[100px] truncate">
                      {selected}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      {options.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelected(option);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-sm font-medium transition-all
                      ${
                        selected === option
                          ? "bg-linear-to-r from-[#3A59D1]/10 to-[#3D90D7]/10 text-[#3A59D1] font-bold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {data?.length > 0 ? (
        <WindowScroller>
          {({ height, isScrolling, scrollTop }) => (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  autoHeight
                  height={height}
                  isScrolling={isScrolling}
                  scrollTop={scrollTop}
                  width={width}
                  rowCount={cards?.length}
                  deferredMeasurementCache={cache}
                  rowHeight={cache.rowHeight}
                  rowRenderer={rowRenderer}
                  overscanRowCount={10}
                />
              )}
            </AutoSizer>
          )}
        </WindowScroller>
      ) : !loading ? (
        <div className="text-center mt-5 flex flex-col gap-4">
          <Image
            width={600}
            height={400}
            src={noPropertiesFound?.src}
            alt="Property"
            crossOrigin="anonymous"
            className="w-full h-[280px] object-contain rounded-md"
          />
          <h1 className="text-2xl text-blue-900 font-bold">
            Oops, No Properties Found!
          </h1>
          <div className="border border-gray-300 rounded-xl p-4">
            <p className="text-base font-semibold text-gray-600">
              Adjust your filters to find the perfect property.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {searchData &&
                Object.entries(searchData)
                  .filter(
                    ([key, value]) =>
                      ![
                        "loading",
                        "error",
                        "userCity",
                        "tab",
                        "property_status",
                        "plot_subType",
                      ].includes(key) &&
                      value !== null &&
                      value !== "" &&
                      value !== undefined
                  )
                  .map(([key, value]) => {
                    const labels = {
                      city: "City",
                      property_for: "Property For",
                      property_in: "Property In",
                      bhk: "BHK",
                      budget: "Budget",
                      sub_type: "Property Type",
                      commercial_subType: "Commercial Type",
                      occupancy: "Occupancy",
                      location: "Location",
                      furnished_status: "Furnished Status",
                    };
                    const colors = {
                      city: "bg-blue-100 text-blue-800",
                      property_for: "bg-green-100 text-green-800",
                      property_in: "bg-yellow-100 text-yellow-800",
                      bhk: "bg-red-100 text-red-800",
                      budget: "bg-indigo-100 text-indigo-800",
                      sub_type: "bg-teal-100 text-teal-800",
                      commercial_subType: "bg-orange-100 text-orange-800",
                      occupancy: "bg-cyan-100 text-cyan-800",
                      location: "bg-lime-100 text-lime-800",
                      furnished_status: "bg-rose-100 text-rose-800",
                    };
                    return (
                      <span
                        key={key}
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          colors[key] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {labels[key]}: {value}
                      </span>
                    );
                  })}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="flex flex-row items-center cursor-pointer gap-2 bg-blue-900 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
                onClick={() => {
                  dispatch(clearSearch());
                  router.push("/listings");
                }}
                aria-label="Clear all applied filters"
              >
                Reset All Filters
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <AdsCard />
        </div>
      ) : null}
      {loading && hasMore && (
        <>
          <div className="flex flex-col gap-4">
            {Array(2)
              .fill(0)
              .map((_id, index) => (
                <SkeletonPropertyCard key={index} />
              ))}
          </div>
          <div className="w-full py-4 flex justify-center items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-[#1D3A76]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-[#1D3A76] font-medium">
              Loading more properties...
            </span>
          </div>
        </>
      )}
      {!hasMore && data?.length > 0 && (
        <div className="w-full py-4 text-center text-[#1D3A76] font-medium">
          No more properties to load.
        </div>
      )}
      {hasMore && data?.length > 0 && !loading && (
        <div className="w-full py-4 flex justify-center">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-[#1D3A76] text-white rounded hover:bg-[#162f5c] transition"
            disabled={loading}
          >
            Load More Properties
          </button>
        </div>
      )}
      {modalOpen && (
        <ScheduleFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
      {showScrollTop && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-36 h-12 flex items-center justify-center bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300 z-50"
        >
          <div className="flex items-center space-x-2">
            <ChevronUp className="w-5 h-5 text-black" />
            <span className="text-black text-sm font-semibold">
              Back to Top
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
export default ListingsBody;
