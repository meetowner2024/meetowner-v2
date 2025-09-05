"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useProfileCheck() {
  const [userProfile, setUserProfile] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const fetchProfile = useCallback(async () => {
    const storedUser = localStorage.getItem("userDetails");
    let userId;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userId = parsedUser.user_id;
      } catch (error) {
        console.error("Error parsing userDetails from localStorage:", error);
        setError("Failed to parse user details");
        return;
      }
    } else {
      setError("User ID not found. Please log in again.");
      return;
    }
    if (!userId) {
      setError("User ID not found. Please log in again.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.meetowner.in/user/v1/getProfile?user_id=${userId}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }
      setUserProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred while fetching the profile");
    } finally {
      setIsLoading(false);
    }
  }, []);
  const checkProfileFields = useCallback(() => {
    if (!userProfile) return false;
    const requiredFields = ["name", "mobile", "email"];
    return requiredFields.some((field) => {
      const value = userProfile[field];
      return value === null || value === undefined || value === "";
    });
  }, [userProfile]);
  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    const excludedRoutes = ["/login", "/signup", "/loginotp"];
    if (storedUser && !excludedRoutes.includes(pathname)) {
      fetchProfile();
    }
  }, [pathname, fetchProfile]);
  useEffect(() => {
    if (!userProfile || isLoading || error) return;
    const hasEmptyFields = checkProfileFields();
    if (hasEmptyFields) {
      setIsAlertOpen(true);
      const intervalId = setInterval(() => {
        setIsAlertOpen(true);
      }, 600000);
      return () => clearInterval(intervalId);
    } else {
      setIsAlertOpen(false);
    }
  }, [userProfile, isLoading, error, checkProfileFields]);
  const handleUpdateProfile = () => {
    setIsAlertOpen(false);
    router.push("/profile");
  };
  const handleCancel = () => {
    setIsAlertOpen(false);
  };
  return {
    isAlertOpen,
    setIsAlertOpen,
    userProfile,
    isLoading,
    error,
    handleUpdateProfile,
    handleCancel,
  };
}
