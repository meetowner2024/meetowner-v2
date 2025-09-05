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
  const handleAPI = async (property) => {
    if (!userDetails) {
      setError("User details not available");
      return;
    }
    try {
      const ownerData = await getOwnerDetails(property);
      const payload = {
        name: userDetails?.name || "N/A",
        mobile: userDetails?.mobile,
        ownerName: ownerData?.name || "N/A",
        ownerMobile: ownerData?.mobile,
        property_name: property?.property_name || "N/A",
        sub_type: property?.sub_type || "N/A",
        google_address:
          property?.google_address ||
          property?.location_id ||
          property?.city_id ||
          "N/A",
      };
      const response = await axios.post(
        `${config.awsApiUrl}/auth/v1/sendWhatsappLeads`,
        payload
      );

      if (response.status === 200) {
        toast.success("Details Submitted Successfully!");
      }
    } catch (error) {
      setError("Error sending WhatsApp message");
    }
  };
  return { owner, handleAPI, error };
};
export default useWhatsappHook;
