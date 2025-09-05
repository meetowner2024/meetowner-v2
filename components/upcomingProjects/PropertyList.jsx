"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Grid3X3, List, Eye } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { Pagination } from "./Pagination";
import theme from "../utils/theme.json";
export const PropertyList = ({
  properties,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  setShowQuickView,
  selectedCategory,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 639px)");
    const handleMediaChange = (e) => {
      if (e.matches) {
        setViewMode("list");
      }
    };
    handleMediaChange(mobileMediaQuery);
    mobileMediaQuery.addEventListener("change", handleMediaChange);
    return () =>
      mobileMediaQuery.removeEventListener("change", handleMediaChange);
  }, [setViewMode]);
  const sortedProperties = useMemo(() => {
    const sorted = [...properties];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => {
          const priceA = a.sizes?.length
            ? Math.min(
                ...a.sizes.map(
                  (size) =>
                    parseFloat(size.sqft_price) * parseFloat(size.buildup_area)
                )
              )
            : 0;
          const priceB = b.sizes?.length
            ? Math.min(
                ...a.sizes.map(
                  (size) =>
                    parseFloat(size.sqft_price) * parseFloat(size.buildup_area)
                )
              )
            : 0;
          return priceA - priceB;
        });
      case "price-high":
        return sorted.sort((a, b) => {
          const priceA = a.sizes?.length
            ? Math.min(
                ...a.sizes.map(
                  (size) =>
                    parseFloat(size.sqft_price) * parseFloat(size.buildup_area)
                )
              )
            : 0;
          const priceB = b.sizes?.length
            ? Math.min(
                ...b.sizes.map(
                  (size) =>
                    parseFloat(size.sqft_price) * parseFloat(size.buildup_area)
                )
              )
            : 0;
          return priceB - priceA;
        });
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return sorted;
    }
  }, [properties, sortBy]);
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const currentProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl text-left font-bold text-gray-800 tracking-tight">
              Upcoming {selectedCategory || "Residential"} Projects
            </h1>
            <p className="text-sm text-left text-gray-500 mt-1">
              {sortedProperties.length} Projects | {selectedCategory || ""}{" "}
              Properties
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  viewMode === "grid"
                    ? `${theme.button.secondary.bg} ${theme.button.secondary.text}`
                    : "text-gray-500 hover:text-indigo-600"
                }`}
                aria-label="Grid View"
              >
                <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                aria-label="List View"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  viewMode === "list"
                    ? "bg-[#3D90D7] text-white"
                    : "text-gray-500 hover:text-indigo-600"
                }`}
              >
                <List className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-white border border-gray-200 rounded-full px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <button
              aria-label="Quick View"
              onClick={() => setShowQuickView(true)}
              className={`${theme.button.secondary.bg} ${theme.button.secondary.hover} text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center`}
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Quick View
            </button>
          </div>
        </div>
      </div>
      {currentProperties.length > 0 ? (
        <div
          className={`space-y-6 mb-8 ${
            viewMode === "grid" ? "gap-6" : "max-w-4xl"
          }`}
        >
          {currentProperties.map((property) => (
            <PropertyCard
              key={property.unique_property_id}
              property={property}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="flex margin-auto justify-center items-center h-100">
          <h1 className="text-2xl text-blue-900 font-bold">
            Oops, No Properties Found!
          </h1>
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={sortedProperties.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};
