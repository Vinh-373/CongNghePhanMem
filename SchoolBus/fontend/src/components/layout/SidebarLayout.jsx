// // 1. Import đúng tên icon và các component cần thiết
// import { LayoutDashboard, Info, Bell, PanelLeftClose, Calendar, CalendarFold, LogOut } from 'lucide-react';
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarInset,
//   SidebarFooter,
//   SidebarTrigger,
//   useSidebar, // Import hook này
// } from '@/components/ui/sidebar';


// // ==========================================================
// // COMPONENT SIDEBAR
// // ==========================================================
// export default function SidebarLayout() {
//   // 2. Lấy biến `open` từ hook useSidebar
//   const { open } = useSidebar();

//   // 3. Sử dụng component icon đã import đúng
//   const items = [
//     { url: '/schoolbus/dashboard', name: 'Trang chủ', icon: LayoutDashboard },
//     { url: '/schoolbus/schedule', name: 'Lịch trình', icon: CalendarFold },
//     { url: '/schoolbus/information', name: 'Thông tin', icon: Info },
//     { url: '/schoolbus/notification', name: 'Thông báo', icon: Bell },
//     { url: '#', name: 'Đăng xuất', icon: LogOut },

//   ];

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader>
//         <div className="flex  items-center gap-2 rounded-full bg-yellow-400 p-3">
//           {/* Sửa lại size-17 thành một class hợp lệ, ví dụ size-10 */}
//           <div className="flex-shrink-0 size-17 rounded-full bg-white flex items-center justify-center overflow-hidden">
//             <img
//               src="/logo.png"
//               alt="School Bus Logo"
//               className="h-full w-full object-cover"
//             />
//           </div>
//           {open && (
//             <div className="flex-grow rounded-full bg-white px-4 py-2 text-center font-bold text-gray-800">
//               School Bus
//             </div>
//           )}
//         </div>

//       </SidebarHeader>

//       <SidebarContent className="mt-4 display-flex flex-col items-center ">
//         <SidebarMenu>
//           {items.map((item) => {
//             // 4. Gán component icon vào biến viết hoa
//             const IconComponent = item.icon;
//             return (
//               <SidebarMenuItem key={item.name}  className='px-7 my-2'>
//                 <SidebarMenuButton asChild className=' flex justify-center border rounded-lg hover:bg-yellow-100 '>
//                   <a href={item.url} >
//                     {/* 5. Render icon như một component JSX */}
//                     <IconComponent style={{ width: 24, height: 24 }} />
//                     <span className='font-medium text-xl '>{item.name}</span>
//                   </a>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             );
//           })}
//         </SidebarMenu>
//       </SidebarContent>
//     </Sidebar>
//   );
// }
// components/layout/SidebarLayout.tsx
import React, { useState } from "react"; // ✅ thêm useState ở đây
import {
  Menu,
  Bus,
  UserCheck,
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  Settings,
  Home,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function SidebarLayout({ menuItems, selectedMenu, setSelectedMenu }) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white p-2">
      {/* Logo */}
      <div className="flex h-22 items-center justify-between px-2 gap-3 bg-[#f5c247] rounded-full">
        <div className="h-20 w-20 flex-shrink-0">
          <img
            src="../../../public/logo.png"
            alt="School Bus"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
        <span className="font-bold text-black text-lg bg-white px-2 py-1 rounded-2xl mr-3">
          School Bus
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedMenu.href === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                setSelectedMenu(item); // cập nhật menu đang chọn
                setOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                ${isActive ? "bg-[#f5c247] text-black" : "text-muted-foreground hover:bg-[#f5c247]"}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 border-r bg-white z-20 overflow-y-auto">
        <SidebarContent />
      </aside>



      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
