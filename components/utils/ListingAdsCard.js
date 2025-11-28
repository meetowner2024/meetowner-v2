"use client";
import {
  MapPin,
  Home,
  IndianRupee,
  Calendar,
  Building2,
  Zap,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  setBHK,
  setBudget,
  setOccupancy,
  setSubType,
  setSearchData,
} from "../store/slices/searchSlice";
import React from "react";

export default function ListingAdsCard({ ad, onApplyFilters }) {
  const dispatch = useDispatch();
  if (ad.ad_type === "popular_filters") {
    const handleFilterClick = (filter) => {
      if (filter.type === "location")
        dispatch(setSearchData({ location: filter.value }));
      else if (filter.type === "bhk") dispatch(setBHK(filter.value));
      else if (filter.type === "budget") dispatch(setBudget(filter.value));
      else if (filter.type === "occupancy")
        dispatch(setOccupancy(filter.value));
      else if (filter.type === "subtype") dispatch(setSubType(filter.value));
      onApplyFilters?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const getIcon = (type) => {
      const icons = {
        bhk: Home,
        budget: IndianRupee,
        occupancy: Calendar,
        subtype: Building2,
      };
      return icons[type] ? (
        React.createElement(icons[type], { className: "w-4 h-4" })
      ) : (
        <MapPin className="w-4 h-4" />
      );
    };
    return (
      <div className="my-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#1D3A76] flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#3A59D1]" />
              Popular Searches in {ad.title}
            </h3>
            <span className="bg-linear-to-r from-[#3A59D1] to-[#3D90D7] text-white text-xs font-bold px-4 py-1.5 rounded-full">
              Quick Filters
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {ad.filters.map((f, i) => (
              <button
                key={i}
                onClick={() => handleFilterClick(f)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95 shadow-md ${
                  i === 0
                    ? "bg-linear-to-r from-[#3A59D1] to-[#3D90D7] text-white"
                    : "bg-white text-[#1D3A76] border-2 border-gray-300 hover:border-[#3A59D1]"
                }`}
              >
                {getIcon(f.type)}
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
