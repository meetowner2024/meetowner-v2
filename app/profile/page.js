import { ToastContainer } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ProfilePage from "../../components/utils/Profile";

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
