"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import theme from "../utils/theme.json";
const parseAmountToNumber = (text) => {
  if (!text) return null;
  const cleaned = text.toLowerCase().replace(/[,\s]+/g, "");
  const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(l|lac|lakh|lakhs)/);
  const crMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(cr|crore|crores)/);
  const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(k|thousand)/);
  const plain = cleaned.match(/\b(\d{5,9})\b/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100000);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  if (plain) return parseInt(plain[1]);
  return null;
};
const buildSeoUrl = (origin, property) => {
  const propertyFor = property?.property_for === "Rent" ? "rent" : "sale";
  const bhkPart = property?.bedrooms ? `${property.bedrooms}-bhk-` : "";
  const subTypePart = property?.sub_type
    ? `${String(property.sub_type).toLowerCase().replace(/\s+/g, "-")}-`
    : "";
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const propertyNameSlug = slugify(property?.property_name || "");
  const builderNameSlug = property?.builder_name
    ? `-by-${slugify(property?.builder_name)}`
    : "";
  const locationSlug = slugify(
    property?.location_id ||
      property?.locality_name ||
      property?.google_address ||
      ""
  );
  const citySlug = slugify(property?.city || property?.city_id || "hyderabad");
  const forPart = `for-${propertyFor}-`;
  const seoSlug = `${bhkPart}${subTypePart}${propertyNameSlug}${builderNameSlug}-${forPart}in-${locationSlug}-${citySlug}`;
  const id = property?.unique_property_id;
  return `${origin}/property/${seoSlug}/${id}`;
};
const normalizeNumber = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const imageSrcFor = (p) => {
  if (!p) return "https://placehold.co/600x400/gray/white?text=No+Image";
  return p?.image
    ? `https://api.meetowner.in/assets/v1/serve/${p.image}`
    : "https://placehold.co/600x400/gray/white?text=No+Image";
};
const Price = ({ p }) => {
  const value =
    normalizeNumber(p?.property_cost) || normalizeNumber(p?.monthly_rent);
  if (!value) return <span className="text-gray-500">N/A</span>;
  const formatToIndianCurrency = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + " L";
    if (num >= 1000) return (num / 1000).toFixed(2) + " K";
    return num.toString();
  };
  const label = p?.property_for === "Rent" ? "/month" : "";
  return (
    <span>
      ₹ {formatToIndianCurrency(value)} {label}
    </span>
  );
};
const AiChat = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Tell me what you’re looking for (e.g., 2 BHK apartment in Hitech City under 1 Cr).",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [userName, setUserName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const nameCandidate =
        parsed?.name ||
        parsed?.user_details?.name ||
        parsed?.user?.name ||
        parsed?.user_details?.user_name ||
        "";
      if (nameCandidate) setUserName(String(nameCandidate));
    } catch {}
  }, []);
  const handleNavigate = useCallback(
    (p) => {
      if (!p?.unique_property_id) return;
      const url = buildSeoUrl(window.location.origin, p);
      router.push(url);
    },
    [router]
  );
  const onSend = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsThinking(true);
    setInput("");
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, userName }),
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Try again!" },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [input, userName]);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1D3A76] text-white flex items-center justify-center text-xs">
                AI
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Meet AI</p>
                <p className="text-[11px] text-gray-500">
                  Ask anything about properties
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh] bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "assistant"
                    ? "flex gap-2"
                    : "flex gap-2 justify-end"
                }
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#1D3A76] text-white flex items-center justify-center text-xs flex-shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={
                    m.role === "assistant"
                      ? "max-w-[85%] bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-2xl"
                      : "max-w-[85%] bg-[#1D3A76] text-white px-4 py-3 rounded-2xl"
                  }
                >
                  <span className="text-[13px] leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </span>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1D3A76] text-white flex items-center justify-center text-xs">
                  AI
                </div>
                <div className="max-w-[85%] bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            {suggestions?.length ? (
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((p, idx) => (
                  <div
                    key={`${p?.unique_property_id}-${idx}`}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow cursor-pointer"
                    onClick={() => handleNavigate(p)}
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={imageSrcFor(p)}
                          alt={p?.property_name || "Property"}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1D3A76] font-semibold text-sm truncate">
                          {p?.sub_type === "Apartment" && p?.bedrooms
                            ? `${p?.bedrooms} BHK ${p?.sub_type}`
                            : p?.sub_type || "Property"}
                          {p?.property_for ? ` for ${p?.property_for}` : ""}
                        </p>
                        <p className="text-[12px] text-gray-600 truncate">
                          {p?.property_name}{" "}
                          {p?.location_id ? `• ${p.location_id}` : ""}
                        </p>
                        <p className="text-[12px] text-gray-900 font-medium">
                          <Price p={p} />
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          ID: {p?.unique_property_id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="p-3 border-t bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Ask: 2 BHK in Hitech City with pool under 1Cr"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A76]/30"
            />
            <button
              onClick={onSend}
              disabled={isThinking}
              className={`${theme.button.secondary.bg} ${theme.button.secondary.text} ${theme.button.secondary.hover} ${theme.button.secondary.hoverText} px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50`}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`${theme.button.secondary.bg} ${theme.button.secondary.text} ${theme.button.secondary.hover} ${theme.button.secondary.hoverText} rounded-full shadow-[0_8px_24px_rgba(16,24,40,0.2)] px-5 py-3 text-sm font-semibold`}
        >
          Ask AI for Properties
        </button>
      )}
    </div>
  );
};
export default AiChat;
