"use client";
import { useState, useRef, useEffect } from "react";
import logoImage from "../app/assets/Images/Untitled-22.png";
import favicon from "../app/assets/Images/Favicon@10x.png";
import { HiMenu } from "react-icons/hi";
import Login from "./auth/Login";
import { useRouter } from "next/navigation";
import DownloadApp from "./utils/DownloadApp";
import Sidebar from "./utils/SideBar";
import { setAuthData, setLoggedIn } from "./store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoIosHeartEmpty } from "react-icons/io";
import { toast } from "react-toastify";
import theme from "./utils/theme.json";
import Image from "next/image";
import { deleteCookie } from "cookies-next";
import NotificationPermissionModal from "./auth/NotificationPermissionModal";
const Header = ({ favourites }) => {
  const Data = useSelector((state) => state.auth.loggedIn);
  const user = useSelector((state) => state.auth.userDetails);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!Data) {
      setShowNotifModal(false);
      return;
    }
    const lastShown = localStorage.getItem("notif_prompt_last_shown");
    const lastDismissed = localStorage.getItem("notif_prompt_dismissed");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const threeDaysAgo = now - 3 * oneDay;
    if (lastDismissed && Number(lastDismissed) > threeDaysAgo) {
      return;
    }
    if (lastShown && Number(lastShown) > now - oneDay) {
      return;
    }
    if ("Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => {
        setShowNotifModal(true);
        localStorage.setItem("notif_prompt_last_shown", now.toString());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [Data]);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      dispatch(
        setAuthData({
          userDetails: user,
          accessToken: token,
          loggedIn: true,
        })
      );
    }
  }, [Data]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const modalRef = useRef(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const downloadRef = useRef(null);
  const router = useRouter();
  const [showAppSuggestion, setShowAppSuggestion] = useState(true);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowLoginModal(false);
      }
    };
    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginModal]);
  const handleClose = () => {
    setShowLoginModal(false);
  };
  const handleDownloadClose = () => {
    setShowDownloadModal(false);
  };
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(
      setAuthData({
        userDetails: null,
        accessToken: null,
        loggedIn: false,
      })
    );
    dispatch(setLoggedIn(false));
    deleteCookie("token", { path: "/" });
    deleteCookie("user", { path: "/" });
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
    setShowNotifModal(false);
  };
  const handleFavRoute = () => {
    const data = localStorage.getItem("user");
    if (!data) {
      toast.success("Login to get personalised feed!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    router.push("/favourites");
  };
  const handleRoute = () => {
    router.push("/");
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowLoginModal(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setShowDownloadModal(false);
      }
    };
    if (showLoginModal || showDownloadModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLoginModal, showDownloadModal]);
  return (
    <>
      {showAppSuggestion && (
        <div className="   md:hidden w-full z-20">
          <div className="flex justify-between items-center mx-auto bg-linear-to-r from-indigo-400 to-blue-600  text-white p-2  shadow-lg animate-slideUp">
            <div className="flex items-center gap-3 sm:px-2">
              <button
                aria-label="Close"
                onClick={() => setShowAppSuggestion(false)}
                className="text-white hover:text-gray-100 font-bold text-xl"
              >
                ×
              </button>
              <p className="text-md sm:text-sm font-medium ">
                {" "}
                Meetowner better on the app!
              </p>
            </div>
            <a
              href="https://meetowner.in/app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-sm border border-white font-semibold px-2 py-1 rounded-full hover:bg-gray-100 transition duration-200"
            >
              Install
            </a>
          </div>
        </div>
      )}
      <header className="w-full bg-white shadow-sm px-2 relative  z-10">
        <div className="container mx-auto px-1 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              width={100}
              height={100}
              onClick={handleRoute}
              src={logoImage.src}
              alt="Meet Owner Logo"
              crossOrigin="anonymous"
              className="h-10 hidden md:block cursor-pointer"
            />
            <Image
              width={100}
              height={100}
              src={favicon.src}
              onClick={handleRoute}
              alt="Meet Owner"
              crossOrigin="anonymous"
              className="w-10 h-10 md:hidden cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              aria-label="Download App"
              onClick={() => setShowDownloadModal(true)}
              className="hidden md:flex border border-[#F0AA00] px-6 py-1 rounded-full text-gray-800 font-medium hover:bg-[#F0AA00] transition-all items-center"
            >
              <Image
                width={100}
                height={100}
                src={favicon.src}
                crossOrigin="anonymous"
                alt="Download"
                className="w-5 h-5 mr-2"
              />
              Download App
            </button>
            <button
              aria-label="Add Property"
              onClick={() =>
                window.open("https://sellers.meetowner.in/", "_blank")
              }
              className={`hidden md:flex ${theme.button.secondary.bg} border px-6 py-1 rounded-full ${theme.button.secondary.text} font-medium ${theme.button.secondary.hover} transition-all group`}
            >
              Add Property
              <span className="ml-1 text-[#F0AA00] group-hover:text-black">
                | Free
              </span>
            </button>
            {Data && (
              <div
                className="flex cursor-pointer font-medium border border-[#F0AA00] hover:bg-[#F0AA00] px-6 py-1 rounded-full"
                onClick={handleFavRoute}
              >
                <IoIosHeartEmpty className="p-1 w-6 h-6  rounded-2xl text-red-600 hover:text-red-500 " />
                <p>Favourites</p>
              </div>
            )}
            {!Data && (
              <button
                aria-label="Login"
                onClick={() => setShowLoginModal(true)}
                className={`hidden md:flex border items-center ${theme.button.secondary.bg} px-6 py-1 rounded-full ${theme.button.secondary.text} font-medium ${theme.button.secondary.hover}  transition-all group`}
              >
                Login
              </button>
            )}
            <button
              aria-label="Menu"
              className=" text-gray-800 focus:outline-none"
              onClick={() => setMenuOpen(true)}
            >
              <HiMenu size={26} />
            </button>
          </div>
        </div>
      </header>
      <Sidebar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isLoggedIn={Data}
        user={user}
        setShowLoginModal={setShowLoginModal}
        handleLogout={handleLogout}
        favourites={favourites}
      />
      {showLoginModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-30 backdrop-blur-xs">
          <div ref={modalRef} className="relative w-[90%] max-w-sm">
            <Login
              setShowLoginModal={setShowLoginModal}
              showLoginModal={showLoginModal}
              onClose={handleClose}
              modalRef={modalRef}
            />
          </div>
        </div>
      )}
      {showNotifModal && Data && (
        <NotificationPermissionModal
          onEnabled={() => {
            toast.success("Notifications enabled! You'll stay updated");
            setShowNotifModal(false);
          }}
          onClose={() => {
            localStorage.setItem(
              "notif_prompt_dismissed",
              Date.now().toString()
            );
            setShowNotifModal(false);
          }}
        />
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-opacity-30 backdrop-blur-xs">
          <div ref={downloadRef} className="relative w-[90%] max-w-sm">
            <DownloadApp
              setShowDownloadModal={setShowDownloadModal}
              showDownloadModal={showDownloadModal}
              onClose={handleDownloadClose}
              downloadRef={downloadRef}
            />
          </div>
        </div>
      )}
    </>
  );
};
export default Header;
