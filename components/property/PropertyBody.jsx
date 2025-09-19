import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  Building,
  ChevronUp,
  Droplet,
  Dumbbell,
  Landmark,
  Medal,
  MonitorCheck,
  PawPrint,
  Phone,
  ShieldCheck,
  Palmtree as TreePalm,
  Users,
  Waves,
  DollarSign,
  IndianRupee,
  Bed,
  Bath,
  Home,
  PersonStanding,
  Table,
  Calendar,
  Lock,
  Car,
  Bike,
  ParkingCircle,
  DoorOpen,
  Ruler,
  Shield,
  ShoppingBag,
  MapPin as MapPinIcon,
} from "lucide-react";
import {
  FaBorderAll,
  FaExpandArrowsAlt,
  FaDoorOpen,
  FaRulerCombined,
  FaSchool,
  FaHospital,
  FaShoppingCart,
  FaFootballBall,
  FaPlane,
  FaTree,
  FaTrain,
  FaHotel,
  FaUniversity,
  FaMapMarkerAlt,
  FaAngleLeft,
  FaAngleRight,
  FaBasketballBall,
  FaCogs,
  FaShieldAlt,
} from "react-icons/fa";
import {
  FaBatteryFull,
  FaBicycle,
  FaChild,
  FaFilter,
  FaFireExtinguisher,
  FaLeaf,
  FaPlug,
  FaShuttleSpace,
  FaSolarPanel,
  FaToolbox,
  FaWater,
  FaWifi,
} from "react-icons/fa6";
import Login from "../auth/Login";
import config from "../utils/config";
import Image from "next/image";
import AmenitiesColor from "../utils/dynamic-colors/AmenitiesColor.json";
import AroundTheme from "../utils/dynamic-colors/AroundProperty.json";
import PropertyDetails from "./PropertyDetails";
const PropertyBody = ({ handleLoading ,propertyDataDetails }) => {
 const [property, setProperty] = useState(propertyDataDetails); 
  const modalRef = useRef(null);
  const maplocation = `${property?.location_id},${property?.city_id},${property?.state_id}`;
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [floorplan, setFloorPlan] = useState("");
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [aroundProperty, setAroundProperty] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
   useEffect(() => {
    setProperty(propertyDataDetails);
  }, [propertyDataDetails]);

 
  useEffect(() => {
    if (property) {
      handleLoading(false); 
    }
  }, [property, handleLoading]);
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (property?.unique_property_id) {
        try {
          const floorPlansResponse = await fetch(
            `${config.awsApiUrl}/listings/v1/getAllFloorPlans/${property.unique_property_id}`
          );
          const floorPlansData = await floorPlansResponse.json();
          setFloorPlan(floorPlansData[0]);
          const imagesResponse = await fetch(
            `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${property.unique_property_id}`
          );
          const imagesData = await imagesResponse.json();
          setImages(imagesData?.images);
          setMainImage(imagesData?.images[0]?.url);
          const aroundResponse = await fetch(
            `${config.awsApiUrl}/listings/v1/getAroundThisProperty?id=${property.unique_property_id}`
          );
          const aroundData = await aroundResponse.json();
          setAroundProperty(aroundData.results);
        } catch (error) {
          console.error("Error fetching property data:", error);
        } finally {
          handleLoading(false);
          setLoading(false);
        }
      }
    };
    fetchPropertyData();
  }, [property?.unique_property_id,propertyDataDetails]);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  const facilityIconMap = {
    Lift: <Building />,
    CCTV: <MonitorCheck />,
    Gym: <Dumbbell />,
    Garden: <TreePalm />,
    "Club House": <Users />,
    Sports: <Medal />,
    "Swimming Pool": <Waves />,
    Intercom: <Phone />,
    "Gated Community": <ShieldCheck />,
    "Regular Water": <Droplet />,
    "Community Hall": <Landmark />,
    "Pet Allowed": <PawPrint />,
    "Half Basket Ball Court": <FaBasketballBall />,
    "Power Backup": <FaBatteryFull />,
    "Entry / Exit": <FaDoorOpen />,
    "Badminton Court": <FaShuttleSpace />,
    "Children Play Area": <FaChild />,
    "Water Harvesting Pit": <FaWater />,
    "Water Softener": <FaFilter />,
    "Solar Fencing": <FaSolarPanel />,
    "Security Cabin": <FaShieldAlt />,
    Lawn: <FaLeaf />,
    "Transformer Yard": <FaPlug />,
  };
  const fallbackIcons = [
    <FaWifi />,
    <FaBicycle />,
    <FaFireExtinguisher />,
    <FaToolbox />,
    <FaCogs />,
    <FaWater />,
    <FaSolarPanel />,
    <FaShieldAlt />,
  ];
  const getFallbackIcon = (name) => {
    const hash = [...name].reduce(
      (acc, c, i) => acc + c.charCodeAt(0) * (i + 1),
      0
    );
    return fallbackIcons[hash % fallbackIcons.length];
  };
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const formatToIndianCurrency = (value) => {
    if (!value || isNaN(value)) return "N/A";
    const numValue = parseFloat(value);
    if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
    if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
    if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
    return numValue.toString();
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const getPlaceIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("school") || lowerTitle.includes("college"))
      return <FaSchool />;
    if (lowerTitle.includes("hospital") || lowerTitle.includes("medical"))
      return <FaHospital />;
    if (lowerTitle.includes("market") || lowerTitle.includes("mall"))
      return <FaShoppingCart />;
    if (lowerTitle.includes("sports") || lowerTitle.includes("arena"))
      return <FaFootballBall />;
    if (lowerTitle.includes("airport") || lowerTitle.includes("travel"))
      return <FaPlane />;
    if (lowerTitle.includes("park") || lowerTitle.includes("zone"))
      return <FaTree />;
    if (lowerTitle.includes("railway") || lowerTitle.includes("station"))
      return <FaTrain />;
    if (lowerTitle.includes("hotel")) return <FaHotel />;
    if (lowerTitle.includes("university")) return <FaUniversity />;
    return <FaMapMarkerAlt />;
  };
  const formatDistance = (distance) => {
    const d = parseInt(distance, 10);
    if (isNaN(d)) return "";
    return d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${d} m`;
  };
  const formatValue = (value) => {
    return value % 1 === 0
      ? parseInt(value)
      : parseFloat(value).toFixed(2).replace(/\.00$/, "");
  };
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };
  const isResidential = property?.property_in === "Residential";
  const isCommercial = property?.property_in === "Commercial";
  const isSell = property?.property_for === "Sell";
  const isRent = property?.property_for === "Rent";
  const propertySubtype = property?.sub_type;
  const isUnderConstruction = property?.occupancy === "Under Construction";
  const isFuture = property?.possession_status === "Future";

  const fieldVisibility = useMemo(
    () => ({
      ...(isResidential &&
        isSell && {
          Apartment: {
            rera_approved: true,
            occupancy: true,
            bedrooms: true,
            bathroom: true,
            balconies: true,
            furnished_status: true,
            property_age: !isUnderConstruction,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            facilities: true,
            investor_property: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
          "Independent House": {
            rera_approved: true,
            occupancy: true,
            bedrooms: true,
            bathroom: true,
            balconies: true,
            furnished_status: true,
            property_age: !isUnderConstruction,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            pent_house: true,
            property_cost: true,
            facilities: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
          "Independent Villa": {
            rera_approved: true,
            occupancy: true,
            bathroom: true,
            balconies: true,
            furnished_status: true,
            property_age: !isUnderConstruction,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            pent_house: true,
            property_cost: true,
            facilities: true,
            investor_property: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
          Plot: {
            rera_approved: true,
            property_age: !isFuture,
            area_units: true,
            length_area: true,
            builtup_unit: true,
            width_area: true,
            plot_area: true,
            total_project_area: true,
            property_cost: true,
            possession_status: true,
            investor_property: true,
            loan_facility: true,
            facing: true,
            around_places: true,
            description: true,
            plot_number: true,
          },
          Land: {
            rera_approved: true,
            area_units: true,
            length_area: true,
            builtup_unit: true,
            width_area: true,
            total_project_area: true,
            property_cost: true,
            possession_status: true,
            loan_facility: true,
            facing: true,
            around_places: true,
            description: true,
            plot_number: true,
            land_sub_type: true,
          },
        }),
      ...(isCommercial &&
        isSell && {
          Office: {
            rera_approved: true,
            occupancy: true,
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            ownership_type: true,
            facilities: true,
            unit_flat_house_no: true,
            zone_types: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
          "Retail Shop": {
            rera_approved: true,
            occupancy: true,
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            ownership_type: true,
            facilities: true,
            unit_flat_house_no: true,
            suitable: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            description: true,
          },
          "Show Room": {
            rera_approved: true,
            occupancy: true,
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            ownership_type: true,
            facilities: true,
            unit_flat_house_no: true,
            suitable: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
          Warehouse: {
            rera_approved: true,
            occupancy: true,
            area_units: true,
            plot_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            ownership_type: true,
            unit_flat_house_no: true,
            zone_types: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            description: true,
          },
          Plot: {
            rera_approved: true,
            area_units: true,
            length_area: true,
            width_area: true,
            plot_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            possession_status: true,
            ownership_type: true,
            unit_flat_house_no: true,
            suitable: true,
            investor_property: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            description: true,
          },
          Others: {
            rera_approved: true,
            occupancy: true,
            area_units: true,
            plot_area: true,
            total_project_area: true,
            builtup_unit: true,
            property_cost: true,
            ownership_type: true,
            unit_flat_house_no: true,
            suitable: true,
            loan_facility: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
        }),
      ...(isResidential &&
        isRent && {
          Apartment: {
            bedrooms: true,
            bathroom: true,
            balconies: true,
            furnished_status: true,
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            types: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            facilities: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
          "Independent House": {
            bedrooms: true,
            furnished_status: true,
            available_from: true,
            bathroom: true,
            balconies: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            types: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            plot_area: true,
            total_project_area: true,
            pent_house: true,
            facilities: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
          "Independent Villa": {
            bedrooms: true,
            furnished_status: true,
            bathroom: true,
            balconies: true,
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            types: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            plot_area: true,
            total_project_area: true,
            pent_house: true,
            facilities: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            servant_room: true,
            description: true,
            unit_flat_house_no: true,
          },
        }),
      ...(isCommercial &&
        isRent && {
          Office: {
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            facilities: true,
            unit_flat_house_no: true,
            zone_types: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
          "Retail Shop": {
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            facilities: true,
            unit_flat_house_no: true,
            suitable: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            description: true,
          },
          "Show Room": {
            passenger_lifts: true,
            service_lifts: true,
            stair_cases: true,
            private_parking: true,
            public_parking: true,
            private_washrooms: true,
            public_washrooms: true,
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            builtup_area: true,
            carpet_area: true,
            total_project_area: true,
            facilities: true,
            unit_flat_house_no: true,
            suitable: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
          Warehouse: {
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            plot_area: true,
            total_project_area: true,
            unit_flat_house_no: true,
            zone_types: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            description: true,
          },
          Plot: {
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            length_area: true,
            width_area: true,
            plot_area: true,
            total_project_area: true,
            unit_flat_house_no: true,
            suitable: true,
            facing: true,
            around_places: true,
            description: true,
          },
          Others: {
            available_from: true,
            monthly_rent: true,
            maintenance: true,
            security_deposit: true,
            lock_in: true,
            brokerage_charge: true,
            area_units: true,
            plot_area: true,
            total_project_area: true,
            unit_flat_house_no: true,
            suitable: true,
            facing: true,
            car_parking: true,
            bike_parking: true,
            open_parking: true,
            around_places: true,
            pantry_room: true,
            description: true,
          },
        }),
    }),
    [isResidential, isCommercial, isRent, isSell]
  );
  const fieldConfigs = {
    monthly_rent: {
      label: "Expected Monthly Rent",
      value: (prop) => `₹ ${formatToIndianCurrency(prop.monthly_rent)}`,
      icon: <DollarSign className="w-5 h-5" />,
    },
    property_cost: {
      label: "Property Cost",
      value: (prop) => (
        <div className="flex flex-col">
          <span>₹ {formatToIndianCurrency(prop.property_cost)}</span>
          <span className="text-xs text-gray-500">
            ({prop.property_cost_type || "Cost may vary"})
          </span>
        </div>
      ),
      icon: <IndianRupee className="w-5 h-5" />,
    },
    bedrooms: {
      label: "Bedrooms",
      value: (prop) => prop.bedrooms,
      icon: <Bed className="w-5 h-5" />,
    },
    bathroom: {
      label: "Bathrooms",
      value: (prop) => prop.bathroom,
      icon: <Bath className="w-5 h-5" />,
    },
    balconies: {
      label: "Balconies",
      value: (prop) => prop.balconies,
      icon: <Home className="w-5 h-5" />,
    },
    types: {
      label: "Preferred Tenant",
      value: (prop) => prop.types,
      icon: <PersonStanding className="w-5 h-5" />,
    },
    furnished_status: {
      label: "Furnished Status",
      value: (prop) => prop.furnished_status,
      icon: <Table className="w-5 h-5" />,
    },
    total_project_area: {
      label: "Project Area",
      value: (prop) =>
        `${formatValue(prop.total_project_area)} ${
          prop.total_project_area_type || "Acres"
        }`,
      icon: <FaBorderAll className="w-5 h-5" />,
    },
    plot_area: {
      label: "Plot Area",
      value: (prop) =>
        `${formatValue(prop.plot_area)} ${prop.area_units || "Sq.yd"}`,
      icon: <FaExpandArrowsAlt className="w-5 h-5" />,
    },
    length_area: {
      label: "Dimensions",
      value: (prop) => (
        <span>
          <strong className="text-blue-900">L</strong>-
          {formatValue(prop.length_area)} x{" "}
          <strong className="text-blue-900">W</strong>-
          {formatValue(prop.width_area)}
        </span>
      ),
      icon: <FaRulerCombined className="w-5 h-5" />,
    },
    builtup_area: {
      label: "Built-up Area",
      value: (prop) =>
        `${formatValue(prop.builtup_area)} ${prop.area_units || "Sq.ft"}`,
      icon: <Home className="w-5 h-5" />,
    },
    carpet_area: {
      label: "Carpet Area",
      value: (prop) =>
        `${formatValue(prop.carpet_area)} ${prop.area_units || "Sq.ft"}`,
      icon: <Ruler className="w-5 h-5" />,
    },
    occupancy: {
      label: (prop) =>
        prop.occupancy === "Under Construction"
          ? "Possession Starts"
          : "Occupancy Status",
      value: (prop) =>
        ["Apartment", "Independent House", "Independent Villa"].includes(
          prop.sub_type
        )
          ? prop.occupancy === "Under Construction"
            ? prop.under_construction
              ? ` ${formatDate(prop.under_construction)}`
              : ""
            : "Ready to Move"
          : "",
      icon: <DoorOpen className="w-5 h-5" />,
    },
    possession_status: {
      label: "Possession Status",
      value: (prop) =>
        prop.possession_status?.toLowerCase() === "immediate"
          ? "Immediate"
          : "Future",
      icon: <Calendar className="w-5 h-5" />,
    },
    available_from: {
      label: "Available From",
      value: (prop) => formatDate(prop.available_from),
      icon: <Calendar className="w-5 h-5" />,
    },
    maintenance: {
      label: "Maintenance (Monthly)",
      value: (prop) => `₹ ${formatToIndianCurrency(prop.maintenance)}`,
      icon: <IndianRupee className="w-5 h-5" />,
    },
    security_deposit: {
      label: "Security Deposit",
      value: (prop) => prop.security_deposit,
      icon: <Lock className="w-5 h-5" />,
    },
    lock_in: {
      label: "Lock-in Period",
      value: (prop) => prop.lock_in,
      icon: <Lock className="w-5 h-5" />,
    },
    brokerage_charge: {
      label: "Brokerage Charge",
      value: (prop) => prop.brokerage_charge,
      icon: <IndianRupee className="w-5 h-5" />,
    },
    facing: {
      label: "Facing",
      value: (prop) => prop.facing,
      icon: <Home className="w-5 h-5" />,
    },
    car_parking: {
      label: "Car Parking",
      value: (prop) => prop.car_parking,
      icon: <Car className="w-5 h-5" />,
    },
    bike_parking: {
      label: "Bike Parking",
      value: (prop) => prop.bike_parking,
      icon: <Bike className="w-5 h-5" />,
    },
    open_parking: {
      label: "Open Parking",
      value: (prop) => prop.open_parking,
      icon: <ParkingCircle className="w-5 h-5" />,
    },
    pent_house: {
      label: "Pent House",
      value: (prop) => prop.pent_house,
      icon: <Home className="w-5 h-5" />,
    },
    servant_room: {
      label: "Servant Room",
      value: (prop) => prop.servant_room,
      icon: <PersonStanding className="w-5 h-5" />,
    },
    pantry_room: {
      label: "Pantry Room",
      value: (prop) => prop.pantry_room,
      icon: <Home className="w-5 h-5" />,
    },
    passenger_lifts: {
      label: "Passenger Lifts",
      value: (prop) => prop.passenger_lifts,
      icon: <Building className="w-5 h-5" />,
    },
    service_lifts: {
      label: "Service Lifts",
      value: (prop) => prop.service_lifts,
      icon: <Building className="w-5 h-5" />,
    },
    stair_cases: {
      label: "Stair Cases",
      value: (prop) => prop.stair_cases,
      icon: <Home className="w-5 h-5" />,
    },
    private_parking: {
      label: "Private Parking",
      value: (prop) => prop.private_parking,
      icon: <Car className="w-5 h-5" />,
    },
    public_parking: {
      label: "Public Parking",
      value: (prop) => prop.public_parking,
      icon: <ParkingCircle className="w-5 h-5" />,
    },
    private_washrooms: {
      label: "Private Washrooms",
      value: (prop) => prop.private_washrooms,
      icon: <Bath className="w-5 h-5" />,
    },
    public_washrooms: {
      label: "Public Washrooms",
      value: (prop) => prop.public_washrooms,
      icon: <Bath className="w-5 h-5" />,
    },
    property_age: {
      label: "Property Age",
      value: (prop) => `${formatValue(prop.property_age)} Years`,
      icon: <Home className="w-5 h-5" />,
    },
    unit_flat_house_no: {
      label: "Unit/Flat/House No",
      value: (prop) => prop.unit_flat_house_no,
      icon: <Home className="w-5 h-5" />,
    },
    plot_number: {
      label: "Plot Number",
      value: (prop) => prop.plot_number,
      icon: <MapPinIcon className="w-5 h-5" />,
    },
    ownership_type: {
      label: "Ownership Type",
      value: (prop) => prop.ownership_type,
      icon: <Shield className="w-5 h-5" />,
    },
    zone_types: {
      label: "Zone Types",
      value: (prop) => prop.zone_types,
      icon: <MapPinIcon className="w-5 h-5" />,
    },
    suitable: {
      label: "Suitable For",
      value: (prop) => prop.business_types || prop.suitable,
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    land_sub_type: {
      label: "Land Sub Type",
      value: (prop) => prop.land_sub_type,
      icon: <MapPinIcon className="w-5 h-5" />,
    },
    investor_property: {
      label: "Investor Property",
      value: (prop) => prop.investor_property,
      icon: <DollarSign className="w-5 h-5" />,
    },
    loan_facility: {
      label: "Loan Facility",
      value: (prop) => prop.loan_facility,
      icon: <IndianRupee className="w-5 h-5" />,
    },
    builtup_unit: {
      label: "Unit Cost",
      value: (prop) => (
        <span>
          ₹ {formatToIndianCurrency(prop.builtup_unit)}{" "}
          <span className="text-xs text-gray-500">
            ({prop.unit_cost_type || "Cost may vary"})
          </span>
        </span>
      ),
      icon: <IndianRupee className="w-5 h-5" />,
    },
  };
  const overviewItems = useMemo(() => {
    const items = [];
    const visibleFields = fieldVisibility[propertySubtype] || {};
    Object.keys(visibleFields).forEach((field) => {
      if (
        visibleFields[field] &&
        fieldConfigs[field] &&
        property?.[field] &&
        field !== "facilities" &&
        field !== "around_places" &&
        field !== "description"
      ) {
        items.push({
          label:
            typeof fieldConfigs[field].label === "function"
              ? fieldConfigs[field].label(property)
              : fieldConfigs[field].label,
          value:
            typeof fieldConfigs[field].value === "function"
              ? fieldConfigs[field].value(property)
              : fieldConfigs[field].value,
          icon: fieldConfigs[field].icon,
        });
      }
    });
    if (
      visibleFields.length_area &&
      visibleFields.width_area &&
      property?.length_area &&
      property?.width_area
    ) {
      const dimIndex = items.findIndex((item) => item.label === "Dimensions");
      if (dimIndex !== -1) {
        items.splice(dimIndex, 1);
      }
      items.push({
        label: fieldConfigs.length_area.label,
        value: fieldConfigs.length_area.value(property),
        icon: fieldConfigs.length_area.icon,
      });
    }
    return items;
  }, [property, propertySubtype, fieldVisibility]);
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          <p className="font-bold">Error loading property</p>
          <p>{error || "Property information not available"}</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }
  const facilitiesList = property?.facilities?.split(",").map((f) => f.trim());
  const description = property?.description || "";
  const isLong = description.length > 320;
  const shortText = description.slice(0, 320);
  const toggleReadMore = () => setIsExpanded(!isExpanded);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        {}
        <div className="block md:hidden h-full w-full max-w-sm space-y-6">
          {}
          <div className="bg-white rounded-xl shadow-md p-2">
            <div className="w-full h-[250px] bg-gray-300 rounded-2xl animate-pulse"></div>
          </div>
          {}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex justify-center items-center gap-6 mt-4">
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-20 h-2 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          {}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
          {}
          {floorplan?.image && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              <div className="w-full h-64 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          )}
          {}
          {property?.facilities && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 bg-gray-300 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          )}
          {}
          {aroundProperty && aroundProperty.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-100 rounded-lg animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg animate-pulse"
                >
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            <div className="w-full h-64 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
        {}
        <div className="hidden h-screen md:block w-full max-w-6xl">
          <div className="bg-white rounded-xl shadow-md p-8 space-y-6 animate-pulse">
            {}
            <div className="flex gap-4">
              <div className="w-24 space-y-2">
                <div className="h-24 bg-gray-300 rounded-lg"></div>
                <div className="h-24 bg-gray-300 rounded-lg"></div>
                <div className="h-24 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="flex-grow h-[450px] bg-gray-300 rounded-lg"></div>
            </div>
            {}
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            {}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            {}
            <div className="grid grid-cols-4 gap-4">
              <div className="h-16 bg-gray-300 rounded-lg"></div>
              <div className="h-16 bg-gray-300 rounded-lg"></div>
              <div className="h-16 bg-gray-300 rounded-lg"></div>
              <div className="h-16 bg-gray-300 rounded-lg"></div>
            </div>
            {}
            <div className="h-80 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative p-1   w-full px-4 rounded-xl shadow-sm space-y-4">
      <div className="hidden md:block font-['Inter']">
        <div className="flex flex-col md:flex-row gap-2">
          {}
          {images.length > 1 && (
            <div className="flex flex-col w-full md:w-24 lg:w-30 gap-2 overflow-y-auto max-h-[450px] hide-scrollbar p-2 md:p-0">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-full md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-md overflow-hidden cursor-pointer border-2 ${
                    mainImage === img.url
                      ? "border-blue-500"
                      : "border-gray-200"
                  } hover:border-blue-700 transition-all duration-200`}
                  onClick={() => {
                    setMainImage(img.url || "");
                  }}
                >
                  <Image
                    width={112}
                    height={112}
                    unoptimized
                    src={
                      img.url && typeof img.url === "string" && img.url.trim()
                        ? img.url
                        : `https://placehold.co/112x112?text=Thumbnail+${
                            index + 1
                          }`
                    }
                    alt={`Thumbnail ${index + 1}`}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Thumbnail image failed to load:", img.url);
                      e.target.src = `https://placehold.co/112x112?text=Thumbnail+${
                        index + 1
                      }`;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {}
          <div className="relative rounded-lg overflow-hidden shadow-md border border-teal-100/50 flex-grow">
            <Image
              key={mainImage || "default"}
              width={112}
              height={112}
              unoptimized
              src={
                mainImage && typeof mainImage === "string" && mainImage.trim()
                  ? mainImage.trim()
                  : `https://placehold.co/600x400?text=${encodeURIComponent(
                      (property?.property_name || "No Image Found").trim()
                    )}`
              }
              alt="Property Image"
              className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error("Main image failed to load:", mainImage);
                e.currentTarget.src = `https://placehold.co/600x400?text=${encodeURIComponent(
                  (property?.property_name || "No Image Found").trim()
                )}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div>
          </div>
        </div>
      </div>
      <div className="block md:hidden mt-6 font-['Inter']">
        <div className="mt-6">
          <Image
            width={600}
            height={400}
            unoptimized
            src={
              mainImage && typeof mainImage === "string" && mainImage.trim()
                ? mainImage.trim()
                : `https://placehold.co/600x400?text=${encodeURIComponent(
                    (property?.property_name || "No Image Found").trim()
                  )}`
            }
            alt="Property Image"
            className="w-full h-auto md:h-[500px] object-cover rounded-2xl shadow-md"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = `https://placehold.co/600x400?text=${encodeURIComponent(
                (property?.property_name || "No Image Found").trim()
              )}`;
            }}
          />
          {images.length > 1 && (
            <div className="mt-4">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  nextEl: ".swiper-button-next-custom",
                  prevEl: ".swiper-button-prev-custom",
                }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-custom",
                }}
                slidesPerView={4}
                spaceBetween={16}
                className="mySwiper"
              >
                {images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <Image
                      width={600}
                      height={400}
                      quality={100}
                      src={`${img.url}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-20 md:h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-all"
                      onClick={() => setMainImage(`${img.url}`)}
                    />
                  </SwiperSlide>
                ))}
                <div className="flex justify-center items-center gap-6 mt-6 max-w-fit mx-auto">
                  <button className="swiper-button-prev-custom">
                    <FaAngleLeft className="w-6 h-6 p-1 border border-gray-400 rounded-full hover:bg-gray-200" />
                  </button>
                  <div className="swiper-pagination-custom flex justify-center"></div>
                  <button className="swiper-button-next-custom">
                    <FaAngleRight className="w-6 h-6 p-1 border border-gray-400 rounded-full hover:bg-gray-200" />
                  </button>
                </div>
              </Swiper>
            </div>
          )}
        </div>
      </div>
      <div className="text-gray-700 text-justify">
        <h2
          style={{ color: AmenitiesColor.header.text }}
          className="text-xl text-left font-bold mb-10 tracking-tight relative"
        >
          Property Description
          <svg
            viewBox="0 0 120 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -bottom-3 left-0 w-50 h-4 mt-2"
          >
            <path
              d="M2 6 C20 14, 50 -6, 118 6"
              stroke={AmenitiesColor.header.underline}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </h2>
        <p>
          {isExpanded || !isLong ? description : `${shortText}... `}
          {isLong && (
            <span
              onClick={toggleReadMore}
              className="text-cyan-600 text-sm cursor-pointer"
            >
              {isExpanded ? "Read Less" : "Read More..."}
            </span>
          )}
        </p>
        <div className=" w-[100%] block lg:hidden">
          <PropertyDetails />
        </div>
      </div>
      {floorplan?.image && (
        <div className="rounded-xl  ">
          <h2
            style={{ color: AmenitiesColor.header.text }}
            className="text-xl text-left font-bold mb-6 sm:mb-10 tracking-tight relative"
          >
            Floor Plan
            <svg
              viewBox="0 0 120 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-3 left-0 w-30 h-4 mt-2"
            >
              <path
                d="M2 6 C20 14, 50 -6, 118 6"
                stroke={AmenitiesColor.header.underline}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </h2>
          <div className="bg-[#F9F9F9] rounded-xl border border-gray-300 shadow-sm px-2 py-2  sm:px-6 sm:py-5 hover:shadow-md transition">
            <Image
              width={600}
              height={400}
              src={`https://api.meetowner.in/assets/v1/serve/${floorplan?.image}`}
              alt="FloorPlan"
              crossOrigin="anonymous"
              className="w-full object- h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/600x400?text=${"No Floor Plan Found"}`;
              }}
            />
          </div>
        </div>
      )}
      {facilitiesList && facilitiesList.length > 0 && (
        <div className="mb-12 rounded-3xl">
          <h2
            style={{ color: AmenitiesColor.header.text }}
            className="text-xl text-left font-bold mb-6 sm:mb-10 tracking-tight relative"
          >
            Amenities
            <svg
              viewBox="0 0 120 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-3 left-0 w-24 h-4 mt-2"
            >
              <path
                d="M2 6 C20 14, 50 -6, 118 6"
                stroke={AmenitiesColor.header.underline}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </h2>
          <div className="relative px-1  sm:rounded-3xl sm:border sm:border-gray-200 sm:shadow-xl w-full  sm:p-8 transition-all duration-500 hover:shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {facilitiesList.map((facility, index) => (
                <div
                  key={index}
                  style={{
                    borderColor: AmenitiesColor.card.border,
                  }}
                  className="group relative rounded-xl p-4 border bg-white shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div
                    style={{
                      background: `linear-gradient(to right, ${AmenitiesColor.card.gradientFrom}, ${AmenitiesColor.card.gradientTo})`,
                    }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex items-center   gap-3">
                    <div
                      style={{ color: AmenitiesColor.card.icon }}
                      className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
                    >
                      {facilityIconMap[facility] || getFallbackIcon(facility)}
                    </div>
                    <span
                      style={{ color: AmenitiesColor.card.text }}
                      className="font-semibold text-sm"
                    >
                      {facility}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                backgroundColor: AmenitiesColor.decor.background,
                opacity: AmenitiesColor.decor.opacity,
              }}
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -z-10"
            />
          </div>
        </div>
      )}
      {aroundProperty && aroundProperty.length > 0 && (
        <div className="mt-12 max-w-6xl mx-auto rounded-3xl">
          {}
          <h2
            style={{ color: AroundTheme.header.text }}
            className="text-xl text-left font-bold mb-4 tracking-tight relative"
          >
            Property Location
            <svg
              viewBox="0 0 120 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -bottom-4 left-0 w-42 h-4 mt-2"
            >
              <path
                d="M2 6 C20 14, 50 -6, 118 6"
                stroke={AmenitiesColor.header.underline}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </h2>
          {}
          <p
            style={{ color: AroundTheme.card.text }}
            className="text-left text-base mb-6 font-medium tracking-wide"
          >
            {property?.google_address}
          </p>
          {}
          <div className="relative sm:rounded-3xl  sm:hadow-xl sm:p-8 transition-all duration-500 hover:shadow-xl">
            <h3
              style={{ color: AroundTheme.header.text }}
              className="text-xl text-center font-bold mb-6"
            >
              Around This Property
            </h3>
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {aroundProperty.map((place, index) => (
                <div
                  key={index}
                  style={{
                    borderColor: AroundTheme.card.border,
                    background: AroundTheme.card.background,
                  }}
                  className="group  relative rounded-xl p-4 border shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {}
                  <div
                    style={{
                      background: `linear-gradient(to right, ${AroundTheme.card.gradientFrom}, ${AroundTheme.card.gradientTo})`,
                    }}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ color: AroundTheme.card.icon }}
                        className="text-xl group-hover:scale-110 transition-transform duration-200"
                      >
                        {getPlaceIcon(place.title)}
                      </div>
                      <span
                        style={{ color: AroundTheme.card.text }}
                        className="font-semibold text-sm"
                      >
                        {place.title}
                      </span>
                    </div>

                    <span
                      style={{
                        background: AroundTheme.badge.background,
                        color: AroundTheme.badge.text,
                      }}
                      className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    >
                      {formatDistance(place.distance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: AroundTheme.decor.background,
                opacity: AroundTheme.decor.opacity,
              }}
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -z-10"
            />
          </div>
        </div>
      )}
      <div className="mt-12 max-w-6xl mx-auto rounded-3xl">
        <h2 className="text-xl text-left font-bold text-slate-900 mb-8 sm:mb-10  tracking-tight relative">
          Property Overview
          <svg
            viewBox="0 0 120 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -bottom-4 left-0 w-44 h-4 mt-2"
          >
            <path
              d="M2 6 C20 14, 50 -6, 118 6"
              stroke={AmenitiesColor.header.underline}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </h2>
        <div className="bg-white sm:rounded-3xl sm:border sm:border-gray-200 sm:shadow-lg sm:p-8 transition-all duration-500 hover:shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {overviewItems.map((item, idx) => (
              <div
                key={idx}
                className="group relative w- rounded-xl  p-5 border border-gray-100 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4">
                  <div className="text-2xl text-blue-900 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-slate-800 font-semibold text-md mt-1">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded ">
        <h2 className="text-xl text-left font-bold text-slate-900 mb-8 tracking-tight relative">
          Explore Map
          <svg
            viewBox="0 0 120 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -bottom-3 left-0 w-30 h-4 mt-2"
          >
            <path
              d="M2 6 C20 14, 50 -6, 118 6"
              stroke={AmenitiesColor.header.underline}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </h2>
        <div className="w-full h-87 rounded overflow-hidden shadow">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              property?.google_address || maplocation
            )}&output=embed`}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
      {showScrollTop && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-5 left-1/2 bg-white transform -translate-x-1/2 w-36 h-12 flex items-center justify-center  rounded-full shadow-md cursor-pointer  transition-all duration-300 z-50"
        >
          <div className="flex items-center space-x-2">
            <ChevronUp className="w-5 h-5 text-black" />
            <span className="text-black text-sm font-semibold">
              Back to Top
            </span>
          </div>
        </div>
      )}
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
    </div>
  );
};
export default PropertyBody;
