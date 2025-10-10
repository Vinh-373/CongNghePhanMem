import React from 'react';
import { Home } from 'lucide-react'; // Icon cho "Trang chủ"
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import userImg from '../../assets/userimg.jpg'; // Ảnh người dùng mẫu

export default function HeaderLayout() {
    const { open } = useSidebar(); // Lấy trạng thái của sidebar

    const userName = 'Bùi Gia Quang Vinh';
    const userRole = 'Phụ huynh';

    return (
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-gray-200 px-4">
            {/* --- Phần bên trái: Icon và Tên trang hiện tại --- */}
            <div className="flex items-center gap-4">
                {/* Sidebar Trigger cho mobile */}
                {!open && (
                    <div className="block md:hidden">
                        <SidebarTrigger />
                    </div>
                )}

                {/* Icon trang hiện tại */}
                <div className="flex items-center justify-center size-10 rounded-full bg-white p-2">
                    <Home className="size-6 text-gray-700" />
                </div>

                {/* Tên trang hiện tại */}
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-800">Trang chủ</span>
                    <div className="h-0.5 w-12 bg-green-500 mt-0.5 rounded-full" />
                </div>
            </div>

            {/* --- Phần bên phải: Thông tin người dùng --- */}
            <div className="flex items-center gap-3 rounded-full bg-gray-300 p-1 pr-3 h-18 w-60">
                {/* Ảnh đại diện */}
                <div className="size-17 rounded-full overflow-hidden flex-shrink-0">
                    {/* SỬA LỖI Ở ĐÂY */}
                    <img src={userImg} alt="User Avatar" className="w-full h-full object-cover" />
                </div>

                {/* Tên và vai trò */}
                <div className="flex flex-col items-end h-13 justify-between">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-400 text-white">
                        {userRole}
                    </span>
                    <span className="text-sm font-medium text-gray-700 mt-0.5 bg-white rounded-2xl px-1 py-0.5">
                        {userName}
                    </span>
                </div>
            </div>
        </header>
    );
}