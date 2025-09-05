"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import config from "./config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
const UserProfileCheckWrapper = ({ children, profileData }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    city: "",
    address: "",
    photo: "",
    user_type: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    city: "",
  });
  const isProfileIncomplete = (userDetails) => {
    return !userDetails?.name?.trim() || !userDetails?.city?.trim();
  };
  useEffect(() => {
    if (profileData && profileData.id) {
      const initialUser = {
        user_id: profileData.id || "",
        name: profileData.name || "",
        email: profileData.email || "",
        mobile: profileData.mobile || "",
        photo: profileData.photo || "",
        city: profileData.city || "",
        user_type: profileData.user_type || "",
        address: profileData.address || "",
        password: "",
      };
      setUser(initialUser);
      localStorage.setItem("user", JSON.stringify(initialUser));
      if (isProfileIncomplete(initialUser)) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [profileData]);
  const validateForm = useCallback(() => {
    const newErrors = { name: "", email: "", city: "" };
    let isValid = true;
    if (!user.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!user.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!user.city.trim()) {
      newErrors.city = "City is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  }, [user]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setLoading(true);
    const payload = {
      id: user.user_id,
      name: user.name,
      email: user.email,
      password: user.password || undefined,
      city: user.city,
      address: user.address,
    };
    try {
      const res = await fetch(`${config.awsApiUrl}/user/v1/updateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      setShowModal(false);
      setErrors({ name: "", email: "", city: "" });
    } catch (error) {
      toast.error(
        error.message || "Something went wrong while updating profile."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
  };
  return (
    <>
      <Dialog open={showModal}>
        <DialogContent className="max-w-[600px] p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Update Your Profile
            </DialogTitle>
            {/* <DialogClose className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" /> */}
          </DialogHeader>
          <DialogDescription className="text-sm text-gray-600 mb-6">
            This action is required. Please add your name, email, and city to
            complete your profile and access all features.
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-[#1D3A76]"
                >
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                  aria-label="Full Name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-[#1D3A76]"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                  aria-label="Email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="mobile"
                  className="text-sm font-medium text-[#1D3A76]"
                >
                  Mobile
                </Label>
                <Input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={user.mobile}
                  onChange={handleChange}
                  disabled
                  placeholder="Mobile"
                  className="mt-1"
                  aria-label="Mobile"
                />
              </div>
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-[#1D3A76]"
                >
                  City
                </Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={user.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`mt-1 ${errors.city ? "border-red-500" : ""}`}
                  aria-label="City"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && (
                  <p id="city-error" className="text-red-500 text-xs mt-1">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="submit"
                className="bg-[#1D3A76] text-white hover:bg-blue-700 disabled:bg-gray-500"
                disabled={loading}
                aria-label="Update Profile"
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
};
export default UserProfileCheckWrapper;
