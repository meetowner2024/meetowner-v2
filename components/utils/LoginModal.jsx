import React from "react";
import { createPortal } from "react-dom";
import Login from "../auth/Login";

const LoginModal = ({
  showLoginModal,
  setShowLoginModal,
  onClose,
  modalRef,
}) => {
  if (!showLoginModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-opacity-30 backdrop-blur-xs">
      <div ref={modalRef} className="relative w-[90%] max-w-sm">
        <Login
          setShowLoginModal={setShowLoginModal}
          showLoginModal={showLoginModal}
          onClose={onClose}
          modalRef={modalRef}
        />
      </div>
    </div>,
    document.body
  );
};

export default LoginModal;
