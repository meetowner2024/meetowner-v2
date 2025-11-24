import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const ProfilePage = dynamic(() => import("../../components/utils/Profile"), {
  loading: () => LoadingUI,
});
const Header = dynamic(() => import("../../components/Header"), {
  ssr: true,
  loading: () => LoadingUI,
});
const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: true,
  loading: () => LoadingUI,
});
const ProfileWrapper = () => {
  return (
    <>
      <Header />
      <ProfilePage />
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
      <Footer />
    </>
  );
};

export default ProfileWrapper;
