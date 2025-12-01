// components/Login.jsx
"use client";

import axios from "axios";
import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAuthData, setLoggedIn } from "../store/slices/authSlice";
import config from "../utils/config";
import { toast } from "react-toastify";
import CountryCodeSelector from "../utils/CountryCodeSelector";
import CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { X } from "lucide-react";
import { setCookie } from "cookies-next";
import Image from "next/image";
import loginimage from "../../app/assets/finalone.png";
import meetlogo from "../../app/assets/Images/Logo.png";
import meetownericon from "../../app/assets/Images/Favicon@10x.png";

const JWT_SECRET = "khsfskhfks983493123!@#JSFKORuiweo232";
const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 30;

function decrypt(encryptedText) {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    if (!ivHex || !encryptedHex) return null;
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.enc.Hex.parse(encryptedHex);
    const key = CryptoJS.SHA256(JWT_SECRET);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

const Login = ({ onClose, modalRef }) => {
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [selectedCode, setSelectedCode] = useState("+91");
  const [country, setCountry] = useState("India");
  const [resendCooldown, setResendCooldown] = useState(0);
  const mobileInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  const validateMobile = (mobile, country) =>
    country === "India"
      ? /^[6-9]\d{9}$/.test(mobile)
      : /^\d+$/.test(mobile) && mobile.length > 0;

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      if (action === "sendOtp" && validateMobile(mobile, country)) {
        handleLogin();
      } else if (action === "verifyOtp" && enteredOtp.length === OTP_LENGTH) {
        verifyOTP();
      }
    }
  };
  async function registerPush() {
    if (!("serviceWorker" in navigator)) return;
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    await navigator.serviceWorker.register("/sw.js");
    const sw = await navigator.serviceWorker.ready;

    const existing = await sw.pushManager.getSubscription();
    if (!existing) {
      const convertedKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      );

      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      await fetch("/api/save-sub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          user_id: userData?.user_id || null,
        }),
      });
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    let initialHeight = window.innerHeight;
    const handleResize = () => {
      if (window.innerHeight < initialHeight * 0.8) {
        setKeyboardOpen(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setKeyboardOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!otpSent && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
    if (otpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpSent]);

  const checkUserExists = useCallback(async () => {
    try {
      const { data } = await axios.post(
        "https://api.meetowner.in/auth/loginnew",
        { mobile },
        { headers: { "Content-Type": "application/json" } }
      );
      return data;
    } catch {
      return null;
    }
  }, [mobile]);

  const sendUnifiedOtp = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(
        `${config.awsApiUrl}/auth/v1/sendBothOtps`,
        {
          mobile,
          countryCode: selectedCode.replace("+", ""),
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status === "success") {
        const decryptedOtp = decrypt(data.otp);
        if (decryptedOtp) {
          setOtp(decryptedOtp);
          setMessage(`OTP sent to ${selectedCode}${mobile}`);
          setOtpSent(true);
          setResendCooldown(RESEND_COOLDOWN);
        } else {
          setError("Failed to decrypt OTP. Try again.");
        }
      } else {
        setError("Failed to send OTP. Try again.");
      }
    } catch {
      setError("Error sending OTP. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [mobile, selectedCode]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown}s before resending.`);
      return;
    }
    await sendUnifiedOtp();
  }, [resendCooldown, sendUnifiedOtp]);

  const registerUser = useCallback(async () => {
    try {
      const { data } = await axios.post(
        "https://api.meetowner.in/auth/v1/registernew",
        {
          name: "",
          mobile,
          city: "",
          userType: "user",
          country: country || "India",
          country_code: selectedCode || "+91",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (data.status === "success") {
        const userData = await checkUserExists();
        setLoginData(userData);
        await sendUnifiedOtp();
        return true;
      }
      return false;
    } catch {
      setError("Registration failed. Try again.");
      return false;
    }
  }, [mobile, selectedCode, country, checkUserExists, sendUnifiedOtp]);

  const handleLogin = useCallback(async () => {
    if (!validateMobile(mobile, country)) {
      setError(
        country === "India"
          ? "Enter a valid 10-digit mobile number (6-9)."
          : "Enter a valid mobile number."
      );
      return;
    }
    setIsLoading(true);
    const userData = await checkUserExists();
    if (userData && userData.status === "success") {
      setLoginData(userData);
      await sendUnifiedOtp();
    } else {
      await registerUser();
    }
    setIsLoading(false);
  }, [mobile, country, checkUserExists, sendUnifiedOtp, registerUser]);

  const verifyOTP = useCallback(() => {
    const trimmedEnteredOtp = enteredOtp.trim();
    if (trimmedEnteredOtp.length !== OTP_LENGTH || trimmedEnteredOtp !== otp) {
      setError("Invalid OTP. Try again.");
      return;
    }
    setIsLoading(true);
    try {
      if (loginData && loginData.status === "success") {
        const { user_details, accessToken } = loginData;
        localStorage.setItem("user", JSON.stringify({ ...user_details }));
        localStorage.setItem("mobile", JSON.stringify({ mobile }));
        localStorage.setItem("token", JSON.stringify({ accessToken }));
        setCookie("token", accessToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          secure: process.env.NODE_ENV === "PRODUCTION",
        });
        setCookie("user", JSON.stringify({ user_details }), {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          secure: process.env.NODE_ENV === "PRODUCTION",
        });
        dispatch(
          setAuthData({
            userDetails: user_details,
            accessToken,
            loggedIn: true,
          })
        );
        dispatch(setLoggedIn(true));
        registerPush();
        toast.success("Login successful!");
        setMessage("Login successful!");
        setError("");
        onClose();
      } else {
        setError("User data not found. Try again.");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [enteredOtp, otp, loginData, dispatch, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[1000] flex p-4 h-fit sm:h-auto sm:items-center sm:justify-center`}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-modal-enter"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-[1001] w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-black hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
          aria-label="Close login modal"
        >
          <X
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-1/2 bg-linear-to-br from-[#3A59D1] to-[#3D90D7] p-8 flex flex-col justify-between overflow-hidden lg:block hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float-delay"></div>
            <div className="relative z-[1001] h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                  <Image
                    src={meetownericon}
                    width={700}
                    height={700}
                    alt="meetowner logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-white">MEETOWNER</span>
              </div>
              <div className="w-full flex-1 flex items-center justify-center">
                <Image
                  src={loginimage}
                  width={1000}
                  height={1000}
                  alt="login image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 p-6 lg:p-12 bg-white backdrop-blur-xs">
            <div className="h-auto lg:h-full flex flex-col justify-center max-w-md mx-auto">
              {!otpSent ? (
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <div className="w-50 h-16 flex items-center justify-center mx-auto mb-6">
                      <Image
                        src={meetlogo}
                        width={700}
                        height={700}
                        alt="meetowner logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-black">
                      Welcome Back
                    </h2>
                    <p className="text-black/70 text-lg font-semibold">
                      Enter your mobile number to get started
                    </p>
                  </div>
                  {message && (
                    <div className="bg-emerald-500/20 backdrop-blur-lg border border-emerald-400/30 text-emerald-100 px-6 py-4 rounded-2xl animate-slide-down">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        {message}
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-100 px-6 py-4 rounded-2xl animate-slide-down">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        {error}
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-black/90 text-sm font-medium">
                        Mobile Number
                      </Label>
                      <div className="flex items-center gap-2">
                        <CountryCodeSelector
                          selectedCode={selectedCode}
                          onSelect={setSelectedCode}
                          setCountry={setCountry}
                          className="h-14 bg-white/10 backdrop-blur-lg border border-white/20 text-black rounded-xl focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 w-24 z-[10002]"
                        />
                        <Input
                          ref={mobileInputRef}
                          type="tel"
                          placeholder="Enter your number"
                          value={mobile}
                          maxLength={15}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setMobile(value);
                            setError("");
                          }}
                          onKeyDown={(e) => handleKeyPress(e, "sendOtp")}
                          className="h-14 bg-white/10 backdrop-blur-lg border border-white/20 text-black placeholder:text-black/50 rounded-xl focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/25 transition-all duration-300 flex-1"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleLogin}
                      disabled={isLoading || !validateMobile(mobile, country)}
                      className="w-full h-14 bg-linear-to-r from-[#3A59D1] to-[#3D90D7] hover:bg-[#3D90D7] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-linear-to-r from-[#3A59D1]/50 to-[#3D90D7]/50 animate-pulse"></div>
                      )}
                      <div className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Send OTP</span>
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl lg:text-4xl font-bold text-black">
                      Verify OTP
                    </h2>
                    <p className="text-black/70 text-lg">
                      Enter the {OTP_LENGTH}-digit code sent to
                    </p>
                    <p className="text-blue-300 font-semibold">
                      {selectedCode}
                      {mobile}
                    </p>
                  </div>
                  {message && (
                    <div className="bg-emerald-500/20 backdrop-blur-lg border border-emerald-400/30 text-black px-6 py-4 rounded-2xl animate-slide-down">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        {message}
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-black px-6 py-4 rounded-2xl animate-slide-down">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        {error}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={OTP_LENGTH}
                      value={enteredOtp}
                      onChange={(value) => {
                        setEnteredOtp(value);
                        setError("");
                      }}
                      onKeyDown={(e) => handleKeyPress(e, "verifyOtp")}
                      disabled={isLoading}
                      ref={otpInputRef}
                    >
                      <InputOTPGroup className="gap-4">
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-14 h-14 text-xl font-semibold bg-white/10 backdrop-blur-lg border-2 border-gray-400 text-black rounded-xl focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/25 transition-all duration-300"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="space-y-4">
                    <Button
                      onClick={verifyOTP}
                      disabled={isLoading || enteredOtp.length !== OTP_LENGTH}
                      className="w-full h-12 bg-linear-to-r from-[#3A59D1] to-[#3D90D7] hover:bg-[#3D90D7] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-linear-to-r from-[#3A59D1]/50 to-[#3D90D7]/50 animate-pulse"></div>
                      )}
                      <div className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify Code</span>
                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </>
                        )}
                      </div>
                    </Button>
                    <Button
                      onClick={handleResendOtp}
                      disabled={isLoading || resendCooldown > 0}
                      className="w-full h-14 bg-white/10 backdrop-blur-lg border border-white/20 text-black font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {resendCooldown > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Resend in {resendCooldown}s</span>
                        </div>
                      ) : (
                        "Resend Code"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background: linear-gradient(45deg, #3a59d1, #3d90d7, #3a59d1);
          }
          50% {
            background: linear-gradient(45deg, #3d90d7, #3a59d1, #3d90d7);
          }
        }
        @keyframes modal-enter {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes float-delay {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-180deg);
          }
        }
        .animate-gradient-shift {
          animation: gradient-shift 6s ease-in-out infinite;
        }
        .animate-modal-enter {
          animation: modal-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;
