"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import countries from "./countryCodes.json";
const CountryCodeSelector = ({ selectedCode, onSelect, setCountry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search)
  );
  const [flag, setFlag] = useState("🇮🇳");
  const handleSelect = (item) => {
    onSelect(item.dial_code);
    setCountry(item.name);
    setFlag(item.flag);
    setIsOpen(false);
    setSearch("");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  return (
    <div className="relative inline-block z-9999" ref={wrapperRef}>
      <div
        className="flex items-center p-1 cursor-pointer text-sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span className="font-semibold text-black flex items-center">
          {flag} {selectedCode}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
      </div>
      {isOpen && (
        <div className="absolute left-0 mt-1 w-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto  z-9999">
          <input
            type="text"
            placeholder="Search country"
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          {filteredCountries.map((item) => (
            <div
              key={item.code}
              className="p-2 text-left hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSelect(item)}
            >
              <span className="text-gray-800">
                {item.flag} {item.name} ({item.dial_code})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default CountryCodeSelector;
