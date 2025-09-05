"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";
import { MdDateRange } from "react-icons/md";

const categories = [
  "Development",
  "Design",
  "Marketing",
  "Customer Service",
  "Operations",
  "Finance",
  "Management",
];

const CareersClient=({ careers })=> {
  const [selectedCategory, setSelectedCategory] = useState("View all");

  const filteredCareers =
    selectedCategory === "View all"
      ? careers
      : careers.filter((career) => career.category === selectedCategory);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <button
        aria-label="View all"
          onClick={() => setSelectedCategory("View all")}
          className={`px-4 py-2 rounded-full border ${
            selectedCategory === "View all"
              ? "bg-black text-white"
              : "border-black text-black"
          }`}
        >
          View all
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === cat
                ? "bg-black text-white"
                : "border-black text-black"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredCareers.length > 0 ? (
          filteredCareers.map((career, i) => (
            <div key={i} className="border-t pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg text-left font-semibold">
                    {career.job_title || "No job title"}
                  </h3>
                  <p className="text-sm text-left text-gray-600 mt-1">
                    {career.description || "No description available."}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <span className="flex items-center gap-1 text-sm px-3 py-1 border rounded-full">
                      <MapPin size={14} />{" "}
                      {career.preferred_location || "Not specified"}
                    </span>
                    <span className="flex items-center gap-1 text-sm px-3 py-1 border rounded-full">
                      <Clock size={14} /> {career.job_type || "Full-time"}
                    </span>
                    <span className="flex items-center gap-1 text-sm px-3 py-1 border rounded-full">
                      <MdDateRange size={14} />{" "}
                      {career.upload_date
                        ? new Date(career.upload_date).toLocaleDateString()
                        : "Not specified"}
                    </span>
                  </div>
                </div>
                <a
                  href={career.apply_url || "#"}
                  className="text-sm font-medium flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Apply <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 mt-10">
            <p className="text-lg font-medium">
              Sorry, we're currently not hiring.
            </p>
            <p className="text-sm mt-2">
              You can still send your CV to{" "}
              <a
                href="mailto:careers@example.com"
                className="text-blue-600 hover:underline"
              >
                meetowner.in@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareersClient