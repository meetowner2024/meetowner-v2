"use client";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("./Header"), { ssr: false });
const SearchBar = dynamic(
  () => import("../components/inital-rendering/SearchBar"),
  { ssr: false }
);
const Slider = dynamic(() => import("../components/inital-rendering/Slider"), {
  ssr: false,
});
const Dealproperties = dynamic(
  () => import("../components/inital-rendering/Dealproperties"),
  { ssr: false }
);
const HousingPicks = dynamic(
  () => import("../components/inital-rendering/HousingPicks"),
  { ssr: false }
);
const HighDemandProjects = dynamic(
  () => import("../components/inital-rendering/HighdemandProjects"),
  { ssr: false }
);
const RecommendedSellers = dynamic(
  () => import("../components/inital-rendering/RecommendedSellers"),
  { ssr: false }
);
const ExclussiveCards = dynamic(
  () => import("../components/inital-rendering/ExclussiveCards"),
  { ssr: false }
);
const FooterLinks = dynamic(() => import("./FooterLinks"), {
  ssr: false,
});
const Footer = dynamic(() => import("./Footer"), {
  ssr: false,
});
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSlider } from "./store/slices/adSlice";
const Dashboard = ({
  latestProperties,
  bestDealProperties,
  bestMeetownerProperties,
  highDemandProperties,
  recommendedSellers,
  meetownerExclusive,
  favourites = [],
  formatted = [],
  contactedIds = [],
  mediaList = [],
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [renderBelowFold, setRenderBelowFold] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (mediaList) {
      dispatch(setSlider(mediaList));
    }
  }, [mediaList]);
  useEffect(() => {
    const ric =
      window.requestIdleCallback ||
      function (cb) {
        return setTimeout(() => cb(), 1);
      };

    ric(() => setRenderBelowFold(true));
  }, []);
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
  const [contacted, setContacted] = useState([]);
  useEffect(() => {
    if (contactedIds) {
      setContacted(contactedIds);
    }
  }, [contactedIds]);
  const footerLinks = {
    "Properties for Buy": [
      {
        name: "Hyderabad",
        listings: [
          "House For Sale In Hyderabad",
          "House For Sale In LB Nagar",
          "House For Sale In Kondapur",
          "House For Sale In Gachibowli",
          "House For Sale In Kukatpally",
          "Flat For Sale In Manikonda",
          "Flat For Sale In Ameerpet",
          "Villa For Sale In Kompally",
          "Commercial Office For Sale In Hyderabad",
          "Commercial Office For Sale In LB Nagar",
          "Commercial Shop For Sale In Kondapur",
          "Office Space For Sale In Gachibowli",
          "Shop For Sale In Ameerpet",
          "Showroom For Sale In Kukatpally",
          "Commercial Space For Sale In Habsiguda",
          "Upcoming Project In Hyderabad",
          "Upcoming Project In LB Nagar",
          "Upcoming Project In Kondapur",
          "Upcoming Project In Bachupally",
          "Upcoming Project In Kompally",
          "Upcoming Project In Nallagandla",
          "Upcoming Project In TSPA Junction",
        ],
      },
    ],
    "Properties for Rent": [
      {
        name: "Hyderabad",
        listings: [
          "House for Rent in Hi-Tech City",
          "House for Rent in Kollur",
          "House for Rent in Patancheru",
          "House for Rent in Madhapur",
          "Flat for Rent in Kukatpally",
          "Flat for Rent in Gachibowli",
          "House for Rent in Tarnaka",
          "PG for Rent in SR Nagar",
          "Flat for Rent in Uppal",
          "Commercial Office For Rent In Hyderabad",
          "Commercial Office For Rent In LB Nagar",
          "Commercial Shop For Rent In Kondapur",
          "Office Space For Rent In Gachibowli",
          "Showroom For Rent In Madhapur",
          "Shop For Rent In Kukatpally",
          "Retail Space For Rent In KPHB",
          "Independent House For Rent In Hyderabad",
          "Independent House For Rent In LB Nagar",
          "Independent House For Rent In Kondapur",
          "Independent House For Rent In Gachibowli",
          "Independent House For Rent In Miyapur",
          "Independent House For Rent In Uppal",
        ],
      },
    ],
  };
  return (
    <div className="overflow-x-hidden">
      <Header favourites={favourites} />
      <SearchBar formatted={formatted} />
      <Slider
        latestProperties={latestProperties}
        favourites={favourites}
        contacted={contacted}
        setContacted={setContacted}
      />
      <Dealproperties
        bestDealProperties={bestDealProperties}
        contacted={contacted}
        setContacted={setContacted}
      />
      {}
      {renderBelowFold && (
        <>
          <HousingPicks bestMeetownerProperties={bestMeetownerProperties} />
          <HighDemandProjects highDemandProperties={highDemandProperties} />
          <RecommendedSellers recommendedSellers={recommendedSellers} />
          <ExclussiveCards meetownerExclusive={meetownerExclusive} />
          <FooterLinks links={footerLinks} basePath="/listings" />
          <Footer />
        </>
      )}
      {showScrollTop && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-5 left-1/2 bg-white transform -translate-x-1/2 w-36 h-12 flex items-center justify-center rounded-full shadow-md cursor-pointer transition-all duration-300 z-50"
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
};
export default Dashboard;
