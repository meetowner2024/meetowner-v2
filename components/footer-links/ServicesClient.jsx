"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ServicesClient =({ services })=> {

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        className="text-left flex flex-col justify-center my-10 w-[70%]"
        dangerouslySetInnerHTML={{ __html: services.description }}
      />
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}

export default ServicesClient