"use client";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, useCallback } from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import UserProfileCheckWrapper from "./utils/UserProfileCheckWrapper";
import useNetworkStatus from "./utils/useNetworkStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff, RefreshCw } from "lucide-react";
import { ToastContainer } from "react-toastify";
export default function ClientWrapper({ children, profileData }) {
  const [loginTrigger, setLoginTrigger] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineModal(true);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleStorageChange = useCallback((e) => {
    if (e.key === "user") {
      setLoginTrigger((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleStorageChange]);
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setLoginTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error accessing localStorage for user:", error);
    }
  }, []);
  useEffect(() => {
    if (isOnline && children?.props) {
      const propsToCache = {
        latestProperties: children.props.latestProperties,
        bestDealProperties: children.props.bestDealProperties,
        bestMeetownerProperties: children.props.bestMeetownerProperties,
        highDemandProperties: children.props.highDemandProperties,
        recommendedSellers: children.props.recommendedSellers,
        meetownerExclusive: children.props.meetownerExclusive,
        favourites: children.props.favourites,
        formatted: children.props.formatted,
      };
      try {
        localStorage.setItem("cachedProperties", JSON.stringify(propsToCache));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [isOnline, children]);
  return (
    <UserProfileCheckWrapper
      loginTrigger={loginTrigger}
      profileData={profileData}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Provider store={store}>{children}</Provider>

      {!isOnline && showOfflineModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-opacity-90 flex items-center justify-center z-[9999] animate-fade-in px-4">
          <div className="w-full max-w-md animate-slide-up">
            <Card className="bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200/50 rounded-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 animate-pulse-wifi">
                  <WifiOff className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  No Internet Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <AlertTitle className="text-red-700 font-semibold">
                    Connection Lost
                  </AlertTitle>
                  <AlertDescription className="text-red-600">
                    It looks like you're offline. Please check your network and
                    try again.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="w-full relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  >
                    <span className="inline-flex items-center justify-center w-full">
                      {isRetrying ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2" />
                          Retry Connection
                        </>
                      )}
                    </span>
                  </Button>
                  <Button
                    onClick={() => setShowOfflineModal(false)}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    Continue Offline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </UserProfileCheckWrapper>
  );
}
