import React from 'react'

export const NotFound = () => {
  return (
    <div className="relative w-screen h-screen">
      <img
        src="404_NotFound.jpg"
        alt="not found"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-black z-10">
        <p className="text-3xl font-semibold drop-shadow-lg">
          Không có trang này!
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 mt-6 font-medium text-black bg-amber-50 rounded-2xl hover:bg-amber-200 shadow-lg transition"
        >
          Quay về trang chủ
        </a>
      </div>
    </div>
  )
}
