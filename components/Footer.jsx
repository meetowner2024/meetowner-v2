"use client";
import React from "react";
import {
  FaGooglePlay,
  FaApple,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaArrowRight,
} from "react-icons/fa";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
const Footer = () => {
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.meetowner.app&pcampaignid=web_share";
  const appStoreUrl = "https://apps.apple.com/us/app/meetowner/id6743744178";
  const url = "https://meetowner.in/app";

  return (
    <footer
      className="relative py-10 overflow-x-hidden"
      style={{ backgroundColor: "#1D3A76" }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 opacity-10"></div>
      <div className=" mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between text-white gap-8">
          <div className="w-full md:w-[60%] flex flex-wrap justify-center gap-x-6 gap-y-6">
            <div className="text-left w-40">
              <div className="flex justify-center">
                <h3 className="text-lg font-bold mb-2">MEET OWNER</h3>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="rounded shadow-md inline-block">
                  <QRCodeSVG value={url} size={160} includeMargin />
                </div>
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full space-x-2 bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black"
                >
                  <FaGooglePlay className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-xs">Get it on</span>
                    <span className="text-xs">Google Play</span>
                  </div>
                </a>

                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full space-x-2 bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black"
                >
                  <FaApple className="h-6 w-6" />
                  <div className="flex flex-col">
                    <span className="text-xs">Available on the</span>
                    <span className="text-xs">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="text-left w-28">
              <h3 className="text-lg font-bold mb-4">About</h3>
              <ul className="space-y-2 md:text-sm text-xs">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:underline">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:underline">
                    Careers
                  </Link>
                </li>
                 <li>
                    <Link href="/blogs" className="hover:underline">
                      Blogs
                    </Link>
                  </li>
              </ul>
            </div>

            <div className="text-left w-40">
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 md:text-sm text-xs">
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:underline">
                    Privacy and Policy
                  </Link>
                </li>
                {/* <li>
                  <a href="#" className="hover:underline">
                    Refund/Cancellation Policy
                  </a>
                </li> */}
              </ul>
            </div>

            <div className="text-left w-40">
              <h3 className="text-lg font-bold mb-4">Timings</h3>
              <p className="md:text-sm text-xs inline-block">
                10:00 AM - 06:00 PM
              </p>
            </div>
          </div>

          <div className="w-full md:w-[40%] flex flex-col text-left">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Join our Newsletter</h3>
              <p className="mb-4 text-xs">
                Be the first to receive the most recent news on our deals.
              </p>
              <div className="flex items-center mb-6">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full p-2 rounded-l-lg text-black focus:outline-none bg-white"
                />
                <button
                  aria-label="Next"
                  className="bg-blue-900 h-10 rounded-r-lg text-white w-11 flex items-center justify-center"
                >
                  <FaArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-xs">
                <p className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                  <span className="break-words leading-normal">
                    401, 8-3-6-5/1/1/4, Astral Hasini Residency, J.P. Nagar,
                    Yella Reddy Guda, Hyderabad - 500073, Telangana
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <FaEnvelope className="mt-1 flex-shrink-0" />
                  <a
                    href="mailto:support@meetowner.in"
                    className="hover:underline break-words"
                  >
                    support@meetowner.in
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <FaPhone className="mt-1 flex-shrink-0" />
                  <a href="tel:+919701888071" className="hover:underline">
                    +91 9701888071
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8 flex-wrap">
          <a
            href="https://www.linkedin.com/company/meetownerofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-900 p-2  z-9999 rounded-full hover:bg-gray-200"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
          <a
            href="https://www.facebook.com/meetownerinofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-900 p-2 rounded-full  z-9999 hover:bg-gray-200"
          >
            <FaFacebook className="h-5 w-5" />
          </a>
          <a
            href="https://www.instagram.com/meetownerofficial/#"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-900 p-2 rounded-full  z-9999 hover:bg-gray-200"
          >
            <FaInstagram className="h-5 w-5 text-red-500" />
          </a>
          <a
            href="https://www.youtube.com/@meetownerofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-900 p-2 rounded-full  z-9999 hover:bg-gray-200"
          >
            <FaYoutube className="h-5 w-5 text-red-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
