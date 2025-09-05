"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import config from "../../components/utils/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // Adjust the import path based on your Shadcn UI setup
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function ScheduleFormModal({ isOpen, onClose, onSubmit }) {
  const [userDetails, setUserDetails] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [agreeCall, setAgreeCall] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.error("Please Login to Schedule Visits!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    const userDetails = JSON.parse(data);
    setUserDetails(userDetails);
    setFormData((prev) => ({
      ...prev,
      name: userDetails.name || "",
      email: userDetails.email || "",
      phone: userDetails.mobile || "",
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      let updatedUserDetails = { ...storedUser };
      const missingName =
        !updatedUserDetails?.name || updatedUserDetails.name === "N/A";
      const missingEmail =
        !updatedUserDetails?.email || updatedUserDetails.email === "N/A";
      const missingMobile =
        !updatedUserDetails?.mobile || updatedUserDetails.mobile === "N/A";
      if (missingName || missingEmail || missingMobile) {
        const updatePayload = {
          id: updatedUserDetails.user_id,
          name: formData.name,
          email: formData.email,
          mobile: formData.phone,
        };
        const res = await fetch(`${config.awsApiUrl}/user/v1/updateUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error("Failed to update user");
        const updatedUser = await res.json();
        updatedUserDetails = {
          ...updatedUserDetails,
          name: updatedUser.name || formData.name,
          email: updatedUser.email || formData.email,
          mobile: updatedUser.mobile || formData.phone,
        };
        const newUserData = {
          ...storedUser,
          userDetails: updatedUserDetails,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));
        onClose();
      }
      onSubmit({
        ...formData,
        name: updatedUserDetails.name,
        email: updatedUserDetails.email,
        phone: updatedUserDetails.mobile,
      });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Something went wrong while saving your details.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-yellow-500">
            Please Confirm Your Details
          </DialogTitle>
          <DialogClose className="absolute top-3 right-3 text-blue-900 font-bold" />
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              disabled
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeCall"
              checked={agreeCall}
              onCheckedChange={() => setAgreeCall(!agreeCall)}
            />
            <Label htmlFor="agreeCall" className="text-sm text-gray-700">
              I agree to contact me via mobile or whatsapp
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeToTerms"
              checked={agreeToTerms}
              onCheckedChange={() => setAgreeToTerms(!agreeToTerms)}
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 underline">
                terms and conditions
              </a>
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded"
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
