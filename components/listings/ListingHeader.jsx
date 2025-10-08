"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  MapPin,
  Building,
  Building2,
  Home,
  Landmark,
  Filter,
  X,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "../../app/assets/Images/Untitled-22.png";
import favicon from "../../app/assets/Images/Favicon@10x.png";
import { Input } from "@/components/ui/input";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  setBHK,
  setBudget,
  setFurnishedStatus,
  setOccupancy,
  setPropertyIn,
  setSubType,
  setTab,
  setSearchData,
  clearSearch,
} from "../store/slices/searchSlice";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "lodash";
import axios from "axios";
import config from "../utils/config";
import { toast } from "react-toastify";
import { IoIosHeartEmpty } from "react-icons/io";
import PromotionalBanner from "./PromotionalBanner";
import { setPropertyDetails } from "../store/slices/propertyDetails";
import theme from "../utils/theme.json";
const commercialSubTypes = [
  { id: "Office", label: "Office", icon: Building },
  { id: "Retail Shop", label: "Retail Shop", icon: Home },
  { id: "Show Room", label: "Showroom", icon: Building2 },
  { id: "Warehouse", label: "Warehouse", icon: Landmark },
  { id: "Plot", label: "Plot", icon: MapPin },
  { id: "Others", label: "Others", icon: MapPin },
];
const furnishingOptions = [
  { label: "Unfurnished", value: "Unfurnished" },
  { label: "Semi Furnished", value: "Semi" },
  { label: "Fully Furnished", value: "Fully" },
];
const ListingHeader = ({ setShowLoginModal, ads }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchData = useSelector((state) => state.search);
  const [searchInput, setSearchInput] = useState(searchData.location || "");
  const Data = useSelector((state) => state.auth.loggedIn);
  const [city, setCity] = useState(searchData.city || "");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [localities, setLocalities] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const searchRef = useRef(null);
  const commandRef = useRef(null);
  const [localStorageUser, setLocalStorageUser] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLocalStorageUser(user);
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
        const propertyFor = property?.property_for === "Rent" ? "Rent" : "Buy";
        const propertyId = property?.unique_property_id || "N/A";
        const bedrooms = property?.bedrooms || "N/A";
        const propertyNameSlug = (property?.property_name || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^-|-$)/g, "");
        const locationSlug = (property?.location_id || "unknown")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/(^-|-$)/g, "");
        const typeSegment =
          property?.sub_type === "Apartment"
            ? `${bedrooms}_BHK_${property.sub_type}`
            : property?.sub_type || "";
        const seoUrl = `${propertyFor}_${typeSegment}_${propertyNameSlug}_in_${locationSlug}_${
          searchData?.city || "unknown"
        }_Id_${propertyId}`;
        router.push(`/property?${seoUrl}`, { state: property });
      } catch (navError) {
        console.error("Navigation error:", navError);
      }
    },
    [router, dispatch, searchData]
  );
  useEffect(() => {
    setCity(searchData.city);
  }, [searchData.city]);
  useEffect(() => {
    if (searchData.sub_type === "Plot" && searchData.plot_subType) {
      dispatch(setTab(searchData.plot_subType));
    } else if (
      commercialSubTypes.map((st) => st.id).includes(searchData.sub_type) &&
      searchData.commercial_subType
    ) {
      dispatch(setTab(searchData.commercial_subType));
    } else if (searchData.tab === "Latest") {
      dispatch(setTab("Buy"));
    }
  }, [
    searchData.sub_type,
    searchData.plot_subType,
    searchData.commercial_subType,
    dispatch,
  ]);

  useEffect(() => {
    setSearchInput(searchData.location || "");
  }, [searchData.location]);
  const selectedFilters = useMemo(
    () => ({
      tab: searchData.tab === "Latest" ? "Buy" : searchData.tab || "Buy",
      bhk: searchData.bhk || null,
      budget: searchData.budget || "",
      propertyIn: searchData.property_in || "Residential",
      subType: searchData.sub_type || "",
      occupancy: searchData.occupancy || "",
      furnishedStatus: searchData.furnished_status || "",
    }),
    [searchData]
  );
  const fetchCities = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://api.meetowner.in/api/v1/getAllCities"
      );
      const activeCities =
        response.data
          ?.filter((city) => city.status === "active")
          ?.map((item) => item.city) || [];
      setCitiesList(activeCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  }, []);
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  const fetchLocalities = useCallback(
    debounce(async (city, query) => {
      if (!city || !query) {
        setLocalities([]);
        return;
      }
      try {
        const response = await fetch(
          `${config.awsApiUrl}/api/v1/search?city=${city}&query=${query}`
        );
        const data = await response.json();
        setLocalities(data);
      } catch (err) {
        console.error("Failed to fetch localities:", err);
        setLocalities([]);
      }
    }, 500),
    []
  );
  useEffect(() => {
    fetchLocalities(city, searchInput);
  }, [searchInput, city, fetchLocalities]);
  const updateUrlWithSearchData = useCallback(() => {
    if (pathname !== "/listings") return;
    const validPropertyIn = ["Residential", "Commercial", "Plot"];
    const normalizedSearchData = {
      ...searchData,
      property_in: validPropertyIn.includes(searchData.property_in)
        ? searchData.property_in
        : "Residential",
      location: searchData.location || "",
    };
    const queryParts = Object.entries(normalizedSearchData)
      .filter(
        ([key, value]) =>
          ![
            "loading",
            "error",
            "userCity",
            "plot_subType",
            "commercial_subType",
          ].includes(key) &&
          value !== null &&
          value !== "" &&
          value !== undefined
      )
      .map(([key, value]) => `${key}-${encodeURIComponent(value)}`);
    const queryString = queryParts.join("&");
    router.replace(`/listings?${queryString}`, { scroll: false });
  }, [router, searchData, pathname]);
  useEffect(() => {
    updateUrlWithSearchData();
  }, [searchData, updateUrlWithSearchData]);
  useEffect(() => {
    if (
      ["Plot", "Land"].includes(selectedFilters.subType) &&
      selectedFilters.furnishedStatus
    ) {
      dispatch(setFurnishedStatus(""));
    }
    if (
      selectedFilters.propertyIn === "Commercial" &&
      !commercialSubTypes.some(
        (subtype) => subtype.id === selectedFilters.subType
      )
    ) {
      dispatch(setSubType(""));
    } else if (
      selectedFilters.propertyIn === "Residential" &&
      ![
        "Apartment",
        "Independent House",
        "Independent Villa",
        "Plot",
        "Land",
        "Others",
      ].includes(selectedFilters.subType)
    ) {
      dispatch(setSubType(""));
    }
    if (
      ["Plot", "Land"].includes(selectedFilters.subType) &&
      !["Immediate", "Future"].includes(selectedFilters.occupancy)
    ) {
      dispatch(setOccupancy(""));
    } else if (
      !["Plot", "Land"].includes(selectedFilters.subType) &&
      !["Ready to Move", "Under Construction"].includes(
        selectedFilters.occupancy
      )
    ) {
      dispatch(setOccupancy(""));
    }
  }, [selectedFilters, dispatch]);
  const dropdownOptions = useMemo(
    () => ({
      Buy: ["Buy", "Rent"],
      BHK: [1, 2, 3, 4, 5, 6, 7, 8],
      Budget: [
        { label: "Up to 50 Lakhs", value: "50" },
        { label: "50-75 Lakhs", value: "50-75" },
        { label: "75 Lakhs+", value: "75+" },
      ],
      "Property In": ["Residential", "Commercial"],
      Type:
        selectedFilters.propertyIn === "Commercial"
          ? commercialSubTypes.map((subtype) => subtype.id)
          : [
              "Apartment",
              "Independent House",
              "Independent Villa",
              "Plot",
              "Land",
              "Others",
            ],
      Status: ["Plot", "Land"].includes(selectedFilters.subType)
        ? ["Immediate", "Future"]
        : ["Ready to Move", "Under Construction"],
      Furnishing: furnishingOptions.map((opt) => opt.value),
    }),
    [selectedFilters.propertyIn, selectedFilters.subType]
  );
  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedFilters.bhk) filters.push(`${selectedFilters.bhk} BHK`);
    if (selectedFilters.budget)
      filters.push(
        dropdownOptions.Budget.find(
          (opt) => opt.value === selectedFilters.budget
        )?.label || selectedFilters.budget
      );
    if (selectedFilters.subType) {
      const subtypeLabel =
        commercialSubTypes.find((st) => st.id === selectedFilters.subType)
          ?.label || selectedFilters.subType;
      filters.push(subtypeLabel);
    }
    if (selectedFilters.furnishedStatus)
      filters.push(
        furnishingOptions.find(
          (opt) => opt.value === selectedFilters.furnishedStatus
        )?.label || selectedFilters.furnishedStatus
      );
    if (selectedFilters.occupancy) filters.push(selectedFilters.occupancy);
    return filters;
  }, [selectedFilters, dropdownOptions]);
  const handleUserSearched = useCallback(
    async (searchValue) => {
      let userDetails = null;
      try {
        const data = localStorage.getItem("user");
        if (data) userDetails = JSON.parse(data);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
      if (userDetails?.user_id && city) {
        const viewData = {
          user_id: userDetails.user_id,
          searched_location: searchValue || "N/A",
          searched_for: selectedFilters.tab || "N/A",
          name: userDetails?.name || "N/A",
          mobile: userDetails?.mobile || "N/A",
          email: userDetails?.email || "N/A",
          searched_city: city || "N/A",
          property_in: selectedFilters.propertyIn || "N/A",
          sub_type: selectedFilters.subType || "N/A",
          occupancy: selectedFilters.occupancy || "N/A",
          furnished_status: selectedFilters.furnishedStatus || "N/A",
        };
        try {
          await axios.post(
            `${config.awsApiUrl}/enquiry/v1/userActivity`,
            viewData
          );
        } catch (error) {
          console.error("Failed to record property view:", error);
        }
      }
    },
    [city, selectedFilters]
  );
  const debouncedUserActivity = useCallback(
    debounce(handleUserSearched, 1000),
    [handleUserSearched]
  );
  const handleValueChange = useCallback(
    (value) => {
      setSearchInput(value);
      dispatch(setSearchData({ location: value }));
      debouncedUserActivity(value);
    },
    [dispatch, debouncedUserActivity]
  );
  const handleClear = useCallback(() => {
    setSearchInput("");
    dispatch(setSearchData({ location: "" }));
    setLocalities([]);
    debouncedUserActivity("");
    if (pathname === "/listings") {
      router.replace("/listings", { scroll: false });
    }
  }, [dispatch, debouncedUserActivity, pathname, router]);
  const clearFilter = useCallback(
    (filterText) => {
      if (filterText.includes("BHK")) {
        dispatch(setBHK(null));
      } else if (
        dropdownOptions.Budget.some((opt) => opt.label === filterText)
      ) {
        dispatch(setBudget(""));
      } else if (
        commercialSubTypes.some((st) => st.label === filterText) ||
        dropdownOptions.Type.includes(filterText)
      ) {
        dispatch(setSubType(""));
      } else if (furnishingOptions.some((opt) => opt.label === filterText)) {
        dispatch(setFurnishedStatus(""));
      } else if (
        ["Immediate", "Future", "Ready to Move", "Under Construction"].includes(
          filterText
        )
      ) {
        dispatch(setOccupancy(""));
      }
    },
    [dispatch, dropdownOptions]
  );
  const clearAllFilters = useCallback(() => {
    dispatch(clearSearch());
    setSearchInput("");
    setCity("");
    setLocalities([]);
    debouncedUserActivity("");
    if (pathname === "/listings") {
      router.replace("/listings", { scroll: false });
    }
  }, [dispatch, debouncedUserActivity, pathname, router]);
  const handleRouteHome = useCallback(() => {
    router.push("/");
  }, [router]);
  const handleFavRoute = () => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.success("Login to get personalised feed!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    router.push("/favourites");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        commandRef.current &&
        !commandRef.current.contains(event.target)
      ) {
        setIsCommandOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const shouldShowFurnishing = !["Plot", "Land"].includes(
    selectedFilters.subType
  );
  return (
    <>
      <PromotionalBanner
        ads={ads}
        showPromoBanner={showPromoBanner}
        setShowPromoBanner={setShowPromoBanner}
        handleNavigation={handleNavigation}
      />
      <header className="sticky z-50 w-full border-b-2 border-[#F0AA00] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-700 top-0">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="hidden lg:flex items-center justify-between gap-6">
            <div
              className="flex items-center cursor-pointer"
              onClick={handleRouteHome}
            >
              <Image
                width={100}
                height={100}
                src={logoImage.src}
                alt="Meet Owner Logo"
                className="h-10 w-auto max-w-[140px]"
              />
            </div>
            <div className="flex-1 max-w-2xl" ref={searchRef}>
              <div className="relative">
                <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 focus-within:border-blue-500 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="bg-gray-100 rounded-lg m-1 p-1">
                    {dropdownOptions.Buy.map((tab) => (
                      <Button
                        key={tab}
                        variant={
                          selectedFilters.tab === tab ? "default" : "ghost"
                        }
                        size="sm"
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          selectedFilters.tab === tab
                            ? `${theme.button.secondary.bg}  text-white shadow-sm`
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                        onClick={() => dispatch(setTab(tab))}
                      >
                        {tab}
                      </Button>
                    ))}
                  </div>
                  <Separator orientation="vertical" className="h-8 mx-2" />
                  <div className="flex-1 flex items-center">
                    <Search className="w-5 h-5 text-gray-400 ml-4" />
                    <Input
                      placeholder="Search localities, landmarks, projects..."
                      value={searchInput}
                      onChange={(e) => handleValueChange(e.target.value)}
                      onFocus={() => setIsCommandOpen(true)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500 px-3"
                      aria-label="Search properties"
                    />
                    {searchInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-6 w-6 p-0 mr-2"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Separator orientation="vertical" className="h-8 mx-2" />
                  <div className="flex items-center mr-3">
                    <MapPin className="w-4 h-4 text-red-500 mr-2" />
                    <Select
                      value={city}
                      onValueChange={(value) => {
                        setCity(value);
                        dispatch(setSearchData({ city: value, location: "" }));
                        setSearchInput("");
                        debouncedUserActivity("");
                      }}
                    >
                      <SelectTrigger className="border-0 bg-white w-[140px] text-sm text-gray-700">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-none max-h-[200px] overflow-y-auto">
                        {citiesList.map((city) => (
                          <SelectItem
                            key={city}
                            value={city}
                            className="text-sm"
                          >
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isCommandOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl max-h-[400px] overflow-y-auto"
                    ref={commandRef}
                  >
                    <Command className="rounded-xl">
                      <div className="border-b-2 border-[#F0AA00] p-4 pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            Filters
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCommandOpen(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {activeFilters.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter) => (
                              <Badge
                                key={filter}
                                variant="secondary"
                                className={`${theme.button.secondary.bg}  text-white hover:bg-blue-700 cursor-pointer rounded-full px-3 py-1 text-sm`}
                                onClick={() => clearFilter(filter)}
                              >
                                {filter}
                                <X className="w-3 h-3 ml-1" />
                              </Badge>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                            >
                              Clear all
                            </Button>
                          </div>
                        )}
                      </div>
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        {localities.length > 0 && (
                          <CommandGroup
                            heading="Locations"
                            className="px-4 py-2"
                          >
                            <div className="grid grid-cols-1 gap-2">
                              {localities.slice(0, 6).map((locality) => (
                                <button
                                  key={locality.locality}
                                  onClick={() => {
                                    setSearchInput(locality.locality);
                                    dispatch(
                                      setSearchData({
                                        location: locality.locality,
                                      })
                                    );
                                    setIsCommandOpen(false);
                                    debouncedUserActivity(locality.locality);
                                  }}
                                  className="flex items-center bg-gray-50 hover:bg-blue-50 rounded-lg p-3 text-sm font-medium transition-colors duration-200 text-left"
                                >
                                  <MapPin className="w-4 h-4 mr-3 text-red-500" />
                                  <span className="flex-1">
                                    {locality.locality}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-gray-300"
                                  >
                                    Locality
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </CommandGroup>
                        )}
                        <CommandGroup heading="BHK" className="px-4 py-2">
                          <div className="grid grid-cols-4 gap-2">
                            {dropdownOptions.BHK.map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setBHK(option))}
                                className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.bhk === option
                                    ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                {option} BHK
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                        <CommandGroup heading="Budget" className="px-4 py-2">
                          <div className="grid grid-cols-1 gap-2">
                            {dropdownOptions.Budget.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  dispatch(setBudget(option.value))
                                }
                                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.budget === option.value
                                    ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <span
                                  className={`${theme.button.secondary.text} mr-2`}
                                >
                                  ₹
                                </span>
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                        <CommandGroup
                          heading="Property Type"
                          className="px-4 py-2"
                        >
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {dropdownOptions["Property In"].map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setPropertyIn(option))}
                                className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.propertyIn === option
                                    ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Building2 className="w-4 h-4 mr-2" />
                                {option}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {dropdownOptions.Type.map((option) => {
                              const subtypeLabel =
                                commercialSubTypes.find(
                                  (st) => st.id === option
                                )?.label || option;
                              const IconComponent =
                                commercialSubTypes.find(
                                  (st) => st.id === option
                                )?.icon || Building2;
                              return (
                                <button
                                  key={option}
                                  onClick={() => dispatch(setSubType(option))}
                                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                    selectedFilters.subType === option
                                      ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4 mr-2" />
                                  <span className="truncate">
                                    {subtypeLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </CommandGroup>
                        {shouldShowFurnishing && (
                          <CommandGroup
                            heading="Furnishing"
                            className="px-4 py-2"
                          >
                            <div className="grid grid-cols-3 gap-2">
                              {dropdownOptions.Furnishing.map((option) => {
                                const furnishingLabel =
                                  furnishingOptions.find(
                                    (opt) => opt.value === option
                                  )?.label || option;
                                return (
                                  <button
                                    key={option}
                                    onClick={() =>
                                      dispatch(setFurnishedStatus(option))
                                    }
                                    className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                      selectedFilters.furnishedStatus === option
                                        ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    <Filter className="w-4 h-4 mr-2" />
                                    <span className="truncate">
                                      {furnishingLabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </CommandGroup>
                        )}
                        <CommandGroup heading="Status" className="px-4 py-2">
                          <div className="grid grid-cols-2 gap-2">
                            {dropdownOptions.Status.map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setOccupancy(option))}
                                className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.occupancy === option
                                    ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Filter className="w-4 h-4 mr-2" />
                                {option}
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {Data ||
                (localStorageUser && (
                  <button
                    className="flex items-center gap-2 font-medium border border-[#F0AA00] hover:bg-[#F0AA00] px-4 py-2 rounded-full transition-all duration-200 group"
                    onClick={handleFavRoute}
                  >
                    <IoIosHeartEmpty className="w-5 h-5 text-red-600 group-hover:text-red-500" />
                    <span>Favourites</span>
                  </button>
                ))}
              <button
                onClick={() =>
                  window.open("https://sellers.meetowner.in/", "_blank")
                }
                className="px-6 py-2 rounded-full text-black font-medium border border-[#F0AA00] hover:bg-[#F0AA00] hover:text-black transition-all group"
              >
                Add Property
                <span className="ml-1 text-[#F0AA00] group-hover:text-black">
                  | Free
                </span>
              </button>
              {!Data ||
                (!localStorageUser && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className={`${theme.button.secondary.bg} 
             ${theme.button.secondary.text} 
             px-6 py-2 rounded-full font-medium 
             hover:opacity-90 transition-all duration-300`}
                  >
                    Login
                  </button>
                ))}
            </div>
          </div>
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center cursor-pointer flex-shrink-0"
                onClick={handleRouteHome}
              >
                <Image
                  width={32}
                  height={32}
                  src={favicon.src}
                  alt="Meet Owner"
                  className="w-8 h-8 sm:hidden"
                />
                <Image
                  width={100}
                  height={100}
                  src={logoImage.src}
                  alt="Meet Owner Logo"
                  className="h-8 w-auto max-w-[100px] hidden sm:block"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {Data ||
                  (localStorageUser && (
                    <button
                      className="p-2 border border-[#F0AA00] hover:bg-[#F0AA00] rounded-full transition-all duration-200"
                      onClick={handleFavRoute}
                    >
                      <IoIosHeartEmpty className="w-5 h-5 text-red-600" />
                    </button>
                  ))}
                {!Data ||
                  (!localStorageUser && (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className={`${theme.button.secondary.bg} px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-[#F0AA00] hover:text-black transition-all`}
                    >
                      Login
                    </button>
                  ))}
              </div>
            </div>
            <div className="space-y-2" ref={searchRef}>
              <div className="hidden lg:flex bg-gray-100 rounded-lg p-1 w-fit">
                {dropdownOptions.Buy.map((tab) => (
                  <Button
                    key={tab}
                    variant={selectedFilters.tab === tab ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      selectedFilters.tab === tab
                        ? `${theme.button.secondary.bg} text-white shadow-sm`
                        : "text-gray-600"
                    }`}
                    onClick={() => dispatch(setTab(tab))}
                  >
                    {tab}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-200 focus-within:border-blue-500 shadow-sm">
                  <Search className="w-4 h-4 text-gray-400 ml-3" />
                  <Input
                    placeholder="Search localities..."
                    value={searchInput}
                    onChange={(e) => handleValueChange(e.target.value)}
                    onFocus={() => setShowMobileSearch(true)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm placeholder:text-gray-500 px-2"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-6 w-6 p-0 mr-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3">
                  <MapPin className="w-3 h-3 text-red-500 mr-1" />
                  <Select
                    value={city}
                    onValueChange={(value) => {
                      setCity(value);
                      dispatch(setSearchData({ city: value, location: "" }));
                      setSearchInput("");
                    }}
                  >
                    <SelectTrigger className="border-0 bg-transparent w-[80px] text-xs p-0">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                      {citiesList.map((city) => (
                        <SelectItem key={city} value={city} className="text-xs">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="px-3 py-2 border-gray-200 hover:bg-gray-50 relative"
                >
                  <Filter className="w-4 h-4" />
                  {activeFilters.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {activeFilters.length}
                    </div>
                  )}
                </Button>
              </div>
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {activeFilters.slice(0, 2).map((filter) => (
                    <Badge
                      key={filter}
                      variant="secondary"
                      className="bg-blue-900 text-white rounded-full px-2 py-0.5 text-xs cursor-pointer flex-shrink-0"
                      onClick={() => clearFilter(filter)}
                    >
                      {filter}
                      <X className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  ))}
                  {activeFilters.length > 2 && (
                    <Badge
                      variant="outline"
                      className="rounded-full px-2 py-0.5 text-xs cursor-pointer flex-shrink-0"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      +{activeFilters.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              {showMobileSearch && localities.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-lg max-h-[200px] overflow-y-auto">
                  {localities.slice(0, 4).map((locality) => (
                    <button
                      key={locality.locality}
                      onClick={() => {
                        setSearchInput(locality.locality);
                        dispatch(
                          setSearchData({ location: locality.locality })
                        );
                        setShowMobileSearch(false);
                        debouncedUserActivity(locality.locality);
                      }}
                      className="w-full flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-red-500" />
                      <span className="text-sm flex-1">
                        {locality.locality}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isFilterModalOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-[999] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-screen overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto"></div>
                <h3 className="font-bold text-lg">Filters</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterModalOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex bg-gray-100 gap-4 mt-6 ml-6 rounded-lg p-1 w-fit">
              {dropdownOptions.Buy.map((tab) => (
                <Button
                  key={tab}
                  variant={selectedFilters.tab === tab ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedFilters.tab === tab
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-gray-600"
                  }`}
                  onClick={() => dispatch(setTab(tab))}
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  BHK Configuration
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {dropdownOptions.BHK.slice(0, 8).map((option) => (
                    <button
                      key={option}
                      onClick={() => dispatch(setBHK(option))}
                      className={`rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                        selectedFilters.bhk === option
                          ? "bg-blue-900 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Budget Range
                </h4>
                <div className="space-y-2">
                  {dropdownOptions.Budget.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => dispatch(setBudget(option.value))}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                        selectedFilters.budget === option.value
                          ? "bg-blue-900 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>₹ {option.label}</span>
                      {selectedFilters.budget === option.value && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Property Category
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {dropdownOptions["Property In"].map((option) => (
                    <button
                      key={option}
                      onClick={() => dispatch(setPropertyIn(option))}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                        selectedFilters.propertyIn === option
                          ? "bg-blue-900 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dropdownOptions.Type.map((option) => {
                    const subtypeLabel =
                      commercialSubTypes.find((st) => st.id === option)
                        ?.label || option;
                    return (
                      <button
                        key={option}
                        onClick={() => dispatch(setSubType(option))}
                        className={`rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedFilters.subType === option
                            ? "bg-blue-900 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className="truncate">{subtypeLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Availability Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {dropdownOptions.Status.map((option) => (
                    <button
                      key={option}
                      onClick={() => dispatch(setOccupancy(option))}
                      className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                        selectedFilters.occupancy === option
                          ? "bg-blue-900 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.7s ease-out;
        }
        @media (max-width: 640px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>
    </>
  );
};
export default ListingHeader;
