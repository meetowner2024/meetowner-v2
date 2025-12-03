"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import axios from "axios";
import config from "./config";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { setProfileData } from "../store/slices/profileSlice";
import { useDispatch } from "react-redux";
export default function ProfilePage({ serverProfile }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(serverProfile);
  const [profileImage, setProfileImage] = useState(
    "https://placehold.co/200x200?text=Upload+Image"
  );
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (serverProfile) {
      dispatch(setProfileData(serverProfile));
      localStorage.setItem("user", JSON.stringify(serverProfile));
    }
  }, [serverProfile]);
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const tempImageUrl = URL.createObjectURL(file);
    setProfileImage(tempImageUrl);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("user_id", user.id);
    try {
      const response = await axios.post(
        `${config.awsApiUrl}/user/v1/uploadUserImage`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const photoUrl = response.data.photo;
      if (!photoUrl) throw new Error("No photo URL returned");
      setProfileImage(photoUrl);
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Failed to upload photo.");
      setProfileImage(user.photo || profileImage);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.name.trim() || !user.city.trim() || !user.email.trim()) {
      toast.error("Please fill all the required fields.");
      return;
    }
    setLoading(true);
    const payload = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      password: user.password || undefined,
      city: user.city,
      address: user.address,
    };
    try {
      const res = await fetch(`${config.awsApiUrl}/user/v1/updateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      localStorage.setItem("user", JSON.stringify({ ...user, password: "" }));
      toast.success("Profile updated!");
      router.refresh();
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex max-w-[1000px] mx-auto items-center justify-center p-4">
      <Card className="w-full border border-gray-300 shadow-lg p-6 bg-white flex flex-col gap-6">
        <CardHeader className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
          <div className="relative">
            <Image
              width={200}
              height={200}
              src={
                user.photo
                  ? `${config.awsApiUrl}/aws/v1/s3/uploads/${user.photo}`
                  : profileImage
              }
              alt="Profile"
              unoptimized
              crossOrigin="anonymous"
              className="w-40 h-40 rounded-full shadow-md object-cover"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={triggerFileSelect}
              className="absolute bottom-2 right-2 bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
              aria-label="Edit Profile Image"
            >
              <Pencil size={16} />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-800">
            {user.name || "User Name"}
          </CardTitle>
          <p className="text-gray-500 text-sm">{user.email || "N/A"}</p>
        </CardHeader>
        <CardContent className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Edit Profile
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={user.mobile}
                  onChange={handleChange}
                  placeholder="Mobile"
                  disabled
                />
              </div>
              {/* <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Password"
                  disabled={loading}
                />
              </div> */}
              <div className=" space-y-1">
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={user.city}
                  onChange={handleChange}
                  placeholder="City"
                  disabled={loading}
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={user.address}
                  onChange={handleChange}
                  placeholder="Address"
                  rows={4}
                  disabled={loading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1D3A76] hover:bg-blue-700 text-white py-3 rounded-md transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
