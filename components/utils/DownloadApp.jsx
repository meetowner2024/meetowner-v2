import React from "react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";

const DownloadApp = ({ onClose }) => {
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.meetowner.app&pcampaignid=web_share";
  const appStoreUrl = "https://apps.apple.com/us/app/meetowner/id6743744178";
  const url = "https://meetowner.in/app";
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-h-150 overflow-hidden relative">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-3 right-3 text-black hover:text-gray-600"
      >
        <IoClose size={24} />
      </button>

      <h2 className="text-lg font-semibold mb-4 text-center">Download App</h2>
      <div className="mb-4 text-center">
        <div className="inline-block bg-white rounded shadow-md">
          <QRCodeSVG value={url} size={220} includeMargin />
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <button
          aria-label="Google Play"
          onClick={() => window.open(playStoreUrl, "_blank")}
          className="flex items-center flex-1 space-x-2 px-4 py-2 rounded-lg bg-yellow-500 text-black"
        >
          <FaGooglePlay className="h-5 w-5" />
          <div className="flex flex-col text-left">
            <span className="text-xs">Get it on</span>
            <span className="text-xs font-semibold">Google Play</span>
          </div>
        </button>

        <button
          aria-label="App Store"
          onClick={() => window.open(appStoreUrl, "_blank")}
          className="flex items-center flex-1 space-x-2 px-4 py-2 rounded-lg bg-yellow-500 text-black"
        >
          <FaApple className="h-6 w-6" />
          <div className="flex flex-col text-left">
            <span className="text-xs">Available on the</span>
            <span className="text-xs font-semibold">App Store</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DownloadApp;
