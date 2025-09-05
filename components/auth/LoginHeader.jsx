import React, { useState } from "react";
import logoImage from "../assets/Images/Untitled-22.png";
import favicon from "../assets/Images/Favicon@10x.png";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image"; 
const LoginHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="w-full bg-white shadow-sm px-4">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            width={600} 
            height={600}
            src={logoImage}
            alt="Meet Owner Logo"
            crossOrigin="anonymous"
            className="h-10 hidden md:block"
          />
          <Image
            width={600} 
            height={600}
            src={favicon}
            crossOrigin="anonymous"
            alt="Meet Owner"
            className="w-10 h-10 md:hidden"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button  aria-label=" Download App"  className="hidden md:flex border border-[#F0AA00] px-6 py-1 rounded-full text-gray-800 font-medium hover:bg-[#F0AA00] transition-all items-center">
            <Image
              
              width={600} 
              height={600}
              src={favicon}
              crossOrigin="anonymous"
              alt="Download"
              className="w-5 h-5 mr-2"
            />
            Download App
          </button>
          <button aria-label="Add Property" className="hidden md:flex border border-[#F0AA00] px-6 py-1 rounded-full text-black font-medium hover:bg-[#F0AA00] hover:text-black transition-all group">
            Add Property
            <span className="ml-1 text-[#F0AA00] group-hover:text-black">
              | Free
            </span>
          </button>

          <button 
            aria-label="Menu"
            className="md:hidden text-gray-800 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md absolute z-1000 top-14 right-0 w-52 py-3 px-6">
          <nav className="flex flex-col space-y-1">
            {["Buy", "Rent", "Sell", "Download App", "Add Property"].map(
              (label) => (
                <button
                aria-label={label}
                  key={label}
                  className="text-gray-800 font-medium text-left py-2 border-b border-gray-200"
                >
                  {label}
                </button>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
export default LoginHeader;
