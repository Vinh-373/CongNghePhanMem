import React from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  sideTitle,
  sideDesc,
  sideButtonText,
  sideButtonLink,
  reverse = false, // thêm prop để đảo layout
}) {
  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background.svg')" }}
    >
      {/* Overlay tối */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div
        className={`relative flex w-[900px] h-[550px] bg-white rounded-[40px] shadow-2xl overflow-hidden z-10 ${
          reverse ? "flex-row-reverse" : ""
        }`}
      >
        {/* --- Cột bên vàng --- */}
        <div
          className={`w-1/2 bg-[#e9cf3f] flex flex-col items-center justify-center text-white ${
            reverse
              ? "rounded-tl-[150px] rounded-bl-[150px]"
              : "rounded-tr-[150px] rounded-br-[150px]"
          }`}
        >
          <img
            src="/logo.png"
            alt="School Bus"
            className="w-24 h-24 mb-4 rounded-full border-4 border-white object-cover"
          />
          <h2 className="text-2xl font-bold">SCHOOL BUS</h2>
          <h3 className="text-3xl font-semibold mt-4">{sideTitle}</h3>
          <p className="text-center text-sm mt-3 px-8">{sideDesc}</p>
          <a
            href={sideButtonLink}
            className="mt-6 px-8 py-2 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-[#e9cf3f] transition"
          >
            {sideButtonText}
          </a>
        </div>

        {/* --- Cột form --- */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
