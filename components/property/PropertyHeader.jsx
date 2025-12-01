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
import theme from "../utils/theme.json";
import { setCities } from "../store/slices/locationSlice";
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
const PropertyHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchData = useSelector((state) => state.search);
  const [searchInput, setSearchInput] = useState(searchData.location || "");
  const reduxCities = useSelector((state) => state.location.cities);

  const [city, setCity] = useState(searchData.city || "");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [localities, setLocalities] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const commandRef = useRef(null);
  const selectedFilters = useMemo(
    () => ({
      tab: searchData.tab || "",
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
    if (reduxCities?.length > 0) {
      setCitiesList(reduxCities);
      return;
    }

    try {
      const response = await axios.get(
        "https://api.meetowner.in/api/v1/getAllCities"
      );
      const activeCities = response.data?.filter(
        (city) => city.status === "active"
      );
      const cityNames = activeCities.map((item) => item.city);
      setCitiesList(cityNames);
      dispatch(setCities(cityNames));
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  }, [reduxCities, dispatch]);
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  const fetchLocalities = useCallback(async (city, query) => {
    try {
      const response = await fetch(
        `${config.awsApiUrl}/api/v1/search?city=${city}&query=${query}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLocalities(data);
    } catch (err) {
      console.error("Failed to fetch localities:", err);
      setLocalities([]);
      toast.error("Failed to fetch localities. Please try again.");
    }
  }, []);
  const debouncedFetchLocalities = useCallback(
    debounce((city, query) => {
      if (!city || !query) {
        setLocalities([]);
        return;
      }
      fetchLocalities(city, query);
    }, 500),
    [fetchLocalities]
  );
  useEffect(() => {
    debouncedFetchLocalities(city, searchInput);
  }, [searchInput, city, debouncedFetchLocalities]);
  const updateUrlWithSearchData = useCallback(() => {
    if (!pathname.startsWith("/listings")) return;
    const { city, location, type, bhk, tab } = searchData;
    const formattedCity = city
      ? city.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "all";
    const formattedLocation = location
      ? location.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "all";
    const formattedType = type
      ? type.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "all";
    const formattedBhk = bhk ? `${bhk}-bhk` : "all";
    const formattedTab = tab ? tab.toLowerCase() : "all";
    const newUrl = `/listings/${formattedCity}/${formattedLocation}/${formattedType}/${formattedBhk}/${formattedTab}`;
    router.replace(newUrl, { scroll: false });
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
          sendUserSearchActivity(viewData);
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
  const handleRouteListings = useCallback(() => {
    dispatch(setSearchData({ location: searchData.location }));
    const cleanSeoUrl = buildListingsSeoUrl(searchData);
    router.push(cleanSeoUrl);
  }, [router, searchData]);
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
  const handleRouteHome = useCallback(() => {
    router.push("/");
  }, [router]);
  const shouldShowFurnishing = !["Plot", "Land"].includes(
    selectedFilters.subType
  );
  const handleClose = () => {
    setIsCommandOpen(false);
    setIsFilterModalOpen(false);
  };
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-[#F0AA00] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleRouteHome}
              >
                <Image
                  width={100}
                  height={100}
                  src={logoImage.src}
                  alt="Meet Owner Logo"
                  className="h-8 sm:h-10 w-auto max-w-[120px] hidden sm:block"
                />
              </div>
            </div>
            <div className="flex-1 w-full sm:max-w-4xl" ref={searchRef}>
              <div className="relative">
                <div className="hidden md:flex flex-col sm:flex-row items-center bg-white rounded-xl border-2 border-gray-200 focus-within:border-blue-500 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="hidden sm:flex bg-gray-100 rounded-lg m-1 p-1">
                    {dropdownOptions.Buy.map((tab) => (
                      <Button
                        key={tab}
                        variant={
                          selectedFilters.tab === tab ? "default" : "ghost"
                        }
                        size="sm"
                        className={`rounded-lg px-3 py-1 text-sm font-medium transition-all 
                          ${
                            selectedFilters.tab === tab
                              ? `${theme.button.secondary.bg} text-white shadow-sm`
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        onClick={() => dispatch(setTab(tab))}
                      >
                        {tab}
                      </Button>
                    ))}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="hidden sm:block h-8 mx-2"
                  />
                  <div className="flex-1 flex items-center px-2 sm:px-0">
                    <Search className="w-4 h-4 text-gray-400 ml-2 sm:ml-4" />
                    <Input
                      placeholder="Search localities, landmarks, projects..."
                      value={searchInput}
                      onChange={(e) => handleValueChange(e.target.value)}
                      onFocus={() => setIsCommandOpen(true)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base placeholder:text-gray-500 px-2 sm:px-3"
                      aria-label="Search properties"
                    />
                    {searchInput && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClear}
                          className="h-6 w-6 p-0"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 w-18 p-1 rounded-full text-white ${theme.button.secondary.bg}`}
                          onClick={handleRouteListings}
                        >
                          Search
                        </Button>
                      </>
                    )}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="hidden sm:block h-8 mx-2"
                  />
                  <div className="flex items-center mr-2">
                    <MapPin className="w-4 h-4 text-red-500 mr-1 sm:mr-2" />
                    <Select
                      value={city}
                      onValueChange={(value) => {
                        setCity(value);
                        dispatch(setSearchData({ city: value, location: "" }));
                        setSearchInput("");
                        debouncedUserActivity("");
                      }}
                    >
                      <SelectTrigger className="border-0 bg-white w-[100px] sm:w-[120px] text-xs sm:text-sm text-gray-700">
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-none max-h-[200px] overflow-y-auto">
                        {citiesList.map((city) => (
                          <SelectItem
                            key={city}
                            value={city}
                            className="text-xs sm:text-sm"
                          >
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {}
                <div
                  className="flex md:hidden items-center space-x-2"
                  ref={searchRef}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={handleRouteHome}
                    >
                      <Image
                        width={32}
                        height={32}
                        src={favicon.src}
                        alt="Meet Owner"
                        className="w-8 h-8"
                      />
                    </div>
                  </div>
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
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClear}
                          className="h-6 w-6 p-0"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 w-18 p-1 rounded-full text-white ${theme.button.secondary.bg}`}
                          onClick={handleRouteListings}
                        >
                          Search
                        </Button>
                      </>
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
                          <SelectItem
                            key={city}
                            value={city}
                            className="text-xs"
                          >
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
                {showMobileSearch && localities.length > 0 && (
                  <div className="bg-white absolute w-full mt-2 rounded-lg border border-gray-200 shadow-lg max-h-[200px] overflow-y-auto">
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
                {activeFilters.length > 0 && (
                  <div className="flex md:hidden items-center gap-1.5 mt-2 overflow-x-auto">
                    {activeFilters.slice(0, 2).map((filter) => (
                      <Badge
                        key={filter}
                        variant="secondary"
                        className={`text-white rounded-full px-2 py-0.5 text-xs cursor-pointer flex-shrink-0 ${theme.button.secondary.bg}`}
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
                {(isCommandOpen || isFilterModalOpen) && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-2xl max-h-[70vh] sm:max-h-[400px] overflow-y-auto sm:overflow-y-visible ${
                      isFilterModalOpen ? "fixed inset-0 m-4" : ""
                    }`}
                  >
                    <Command ref={commandRef} className="rounded-xl">
                      <div className="border-b-2 border-[#F0AA00] p-3 sm:p-4 pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            Filters
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-6 w-6 p-0"
                            aria-label="Close filters"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {activeFilters.length > 0 && (
                          <div className="hidden md:flex items-center gap-1.5 mt-2 overflow-x-auto">
                            {activeFilters.slice(0, 2).map((filter) => (
                              <Badge
                                key={filter}
                                variant="secondary"
                                className={`text-white rounded-full px-2 py-0.5 text-xs cursor-pointer flex-shrink-0 ${theme.button.secondary.bg}`}
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
                      <CommandList className="max-h-[60vh] sm:max-h-[300px] overflow-y-auto">
                        <CommandGroup
                          heading="Listing Type"
                          className="px-3 sm:px-4 py-2 lg:hidden"
                        >
                          <div className="flex flex-wrap gap-2">
                            {dropdownOptions.Buy.map((tab) => (
                              <button
                                key={tab}
                                onClick={() => dispatch(setTab(tab))}
                                className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.tab === tab
                                    ? `${theme.button.secondary.bg} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Home className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                {tab}
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                        {localities.length > 0 && (
                          <CommandGroup
                            heading="Locations"
                            className="px-3 sm:px-4 py-2"
                          >
                            <div className="flex flex-wrap gap-2">
                              {localities.map((locality) => (
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
                                    setIsFilterModalOpen(false);
                                    debouncedUserActivity(locality.locality);
                                  }}
                                  className="flex items-center bg-gray-100 hover:bg-blue-100 rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200"
                                >
                                  <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-red-500" />
                                  <span>{locality.locality}</span>
                                  <Badge
                                    variant="outline"
                                    className="ml-1 sm:ml-2 text-xs border-gray-300"
                                  >
                                    Locality
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </CommandGroup>
                        )}
                        <CommandGroup
                          heading="BHK"
                          className="px-3 sm:px-4 py-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            {dropdownOptions.BHK.map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setBHK(option))}
                                className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.bhk === option
                                    ? `${theme.button.secondary.bg} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Home className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                {option} BHK
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                        <CommandGroup
                          heading="Budget"
                          className="px-3 sm:px-4 py-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            {dropdownOptions.Budget.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  dispatch(setBudget(option.value))
                                }
                                className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.budget === option.value
                                    ? `${theme.button.secondary.bg} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <span className="text-gray-600 mr-1 sm:mr-2">
                                  ₹
                                </span>
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </CommandGroup>
                        <CommandGroup
                          heading="Property Type"
                          className="px-3 sm:px-4 py-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            {dropdownOptions["Property In"].map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setPropertyIn(option))}
                                className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.propertyIn === option
                                    ? `${theme.button.secondary.bg} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Building2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                {option}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
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
                                  className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                    selectedFilters.subType === option
                                      ? `${theme.button.secondary.bg} text-white`
                                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                  }`}
                                >
                                  <IconComponent className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                  {subtypeLabel}
                                </button>
                              );
                            })}
                          </div>
                        </CommandGroup>
                        {shouldShowFurnishing && (
                          <CommandGroup
                            heading="Furnishing"
                            className="px-3 sm:px-4 py-2"
                          >
                            <div className="flex flex-wrap gap-2">
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
                                    className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                      selectedFilters.furnishedStatus === option
                                        ? `${theme.button.secondary.bg} text-white`
                                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                    {furnishingLabel}
                                  </button>
                                );
                              })}
                            </div>
                          </CommandGroup>
                        )}
                        <CommandGroup
                          heading="Status"
                          className="px-3 sm:px-4 py-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            {dropdownOptions.Status.map((option) => (
                              <button
                                key={option}
                                onClick={() => dispatch(setOccupancy(option))}
                                className={`flex items-center rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                  selectedFilters.occupancy === option
                                    ? `${theme.button.secondary.bg} text-white`
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                              >
                                <Filter className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
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
          </div>
        </div>
      </header>
      {isFilterModalOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-[999] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-screen overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
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
                      ? `${theme.button.secondary.bg} text-white shadow-sm`
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
                          ? `${theme.button.secondary.bg} text-white shadow-lg scale-105`
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
                          ? `${theme.button.secondary.bg} text-white shadow-lg`
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
                          ? `${theme.button.secondary.bg} text-white shadow-lg`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dropdownOptions.Type.slice(0, 6).map((option) => {
                    const subtypeLabel =
                      commercialSubTypes.find((st) => st.id === option)
                        ?.label || option;
                    return (
                      <button
                        key={option}
                        onClick={() => dispatch(setSubType(option))}
                        className={`rounded-xl px-2 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedFilters.subType === option
                            ? `${theme.button.secondary.bg} text-white shadow-lg`
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
                          ? `${theme.button.secondary.bg} text-white shadow-lg`
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
    </>
  );
};
export default PropertyHeader;
