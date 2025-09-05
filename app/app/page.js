"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const AppRedirect = () => {
  const router = useRouter();
  const [storeName, setStoreName] = useState("appropriate");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    if (isAndroid) {
      setStoreName("Google Play");
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.meetowner.app";
    } else if (isIOS) {
      setStoreName("App");
      window.location.href =
        "https://apps.apple.com/us/app/meetowner/id6743744178";
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h1 className="text-lg font-semibold">
        Redirecting you to the {storeName} Store...
      </h1>
    </div>
  );
};

export default AppRedirect;
