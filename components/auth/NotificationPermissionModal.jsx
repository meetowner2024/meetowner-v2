"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
export default function NotificationPermissionModal({ onClose, onEnabled }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (Notification.permission === "default") {
      const hasSeen = localStorage.getItem("notification_prompt_seen");
      const lastDismissed = localStorage.getItem("notification_dismissed_at");
      if (!hasSeen || !lastDismissed) {
        setTimeout(() => setIsOpen(true), 1500);
        localStorage.setItem("notification_prompt_seen", "true");
      } else {
        const daysSince =
          (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
        if (daysSince > 3) {
          setTimeout(() => setIsOpen(true), 1500);
        }
      }
    }
  }, []);
  const handleEnable = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerPushSubscription();
      onEnabled?.();
      setIsOpen(false);
    } else if (permission === "denied") {
      localStorage.setItem("notification_dismissed_at", Date.now().toString());
      setIsOpen(false);
    }
  };
  const handleMaybeLater = () => {
    localStorage.setItem("notification_dismissed_at", Date.now().toString());
    setIsOpen(false);
    onClose?.();
  };
  async function registerPushSubscription() {
    try {
      await navigator.serviceWorker.register("/sw.js");
      const sw = await navigator.serviceWorker.ready;
      const existing = await sw.pushManager.getSubscription();
      if (existing) return;
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
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center px-4 pb-8 sm:p-0 pointer-events-none">
      <div className="relative pointer-events-auto w-full max-w-md animate-slide-up">
        {}
        <div className="absolute inset-0 -inset-4 bg-black/20 backdrop-blur-sm rounded-3xl" />
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {}
          <div className="h-2 bg-linear-to-r from-[#3A59D1] to-[#3D90D7]" />
          <div className="p-8 text-center space-y-6">
            {}
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-[#3A59D1]/10 to-[#3D90D7]/10 rounded-full flex items-center justify-center">
              <Bell className="w-10 h-10 text-[#3A59D1]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">
                Stay Updated Instantly!
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get notified about new properties, price updates, and seller
                messages the moment they happen.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleEnable}
                className="flex-1 h-12 bg-linear-to-r from-[#3A59D1] to-[#3D90D7] hover:from-[#3D90D7] hover:to-[#3A59D1] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Bell className="w-5 h-5 mr-2" />
                Enable Notifications
              </Button>
              <Button
                onClick={handleMaybeLater}
                variant="outline"
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
              >
                <BellOff className="w-5 h-5 mr-2" />
                Maybe Later
              </Button>
            </div>
            <button
              onClick={handleMaybeLater}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
