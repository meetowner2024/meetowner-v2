import { useState, useEffect } from "react";
import axios from "axios";
import config from "./config";

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${config.awsApiUrl}/upcoming/v1/getAllUpComingProjects`
        );
        if (response.data.status === "success") {
          setProperties(response.data.data || []);
        } else {
          setProperties([]);
          setError("API returned unsuccessful status");
        }
      } catch (err) {
        setError(
          err.message ||
            err.response?.data?.message ||
            "Failed to fetch properties"
        );
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);
  return { properties, loading, error };
};
