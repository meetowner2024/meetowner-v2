"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import config from "./config";
import { decryptData } from "./crypto";
const useWhatsappHook = (selectedPropertyId) => {
  const [owner, setOwner] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUserDetails(JSON.parse(data));
    } else {
      setError("User not logged in!");
    }
  }, []);
  const getOwnerDetails = async (property) => {
    if (!property?.unique_property_id) {
      setError("Property ID is required");
      throw new Error("Property ID is required");
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `/api/getSingleProperty?unique_property_id=${property.unique_property_id}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || "Failed to fetch owner details";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const decryptedData = decryptData(data);
      const propertyData = decryptedData.property;
      if (!propertyData?.user) {
        setError("No seller data found for the property");
        throw new Error("No seller data found for the property");
      }
      const sellerData = propertyData.user;
      setOwner(sellerData);
      return sellerData;
    } catch (err) {
      console.error("Error fetching owner details:", err);
      setError(`Error fetching owner details: ${err.message}`);
      throw err;
    }
  };
  const GOOGLE_SHEET_WEBHOOK =
    "https://script.google.com/macros/s/AKfycbwuo6oiOB7j4sVU_WjZ-2iFUzHUhMQnrjkI342M9S1YyvOzuQIdk_Ey4ruxKWMgCKM/exec";
  const handleAPI = async (property) => {
    if (!userDetails) {
      setError("User details not available");
      return;
    }
    let ownerData = {};
    try {
      ownerData = await getOwnerDetails(property);
    } catch (err) {
      console.error("Owner fetch failed:", err);
    }
    const whatsappPayload = {
      name: userDetails?.name || "N/A",
      mobile: userDetails?.mobile,
      ownerName: ownerData?.name || "N/A",
      ownerMobile: ownerData?.mobile || "N/A",
      property_name: property?.property_name || "N/A",
      sub_type: property?.sub_type || "N/A",
      google_address:
        property?.google_address ||
        property?.location_id ||
        property?.city_id ||
        "N/A",
    };
    const sheetParams = new URLSearchParams({
      name: userDetails?.name || "N/A",
      mobile: userDetails?.mobile || "N/A",
      property_name: property?.property_name || "N/A",
      sub_type: property?.sub_type || "N/A",
      google_address:
        property?.google_address ||
        property?.location_id ||
        property?.city_id ||
        "N/A",
      unique_property_id: property?.unique_property_id || "N/A",
    }).toString();
    const results = await Promise.allSettled([
      axios.post(
        `${config.awsApiUrl}/auth/v1/sendWhatsappLeads`,
        whatsappPayload
      ),
      fetch(GOOGLE_SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: sheetParams,
      }),
    ]);
    const isAnySuccess = results.some(
      (r) =>
        r.status === "fulfilled" &&
        (r.value?.status === 200 || r.value instanceof Response)
    );
    if (!isAnySuccess) {
      toast.error("Failed to submit details. Please try again.");
    }
  };
  return { owner, handleAPI, error };
};
export default useWhatsappHook;
