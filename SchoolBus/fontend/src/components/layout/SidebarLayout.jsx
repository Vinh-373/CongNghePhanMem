// 1. Import đúng tên icon và các component cần thiết
import { LayoutDashboard, Info, Bell, PanelLeftClose, Calendar, CalendarFold, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
  useSidebar, // Import hook này
} from '@/components/ui/sidebar';


// ==========================================================
// COMPONENT SIDEBAR
// ==========================================================
export default function SidebarLayout() {
  // 2. Lấy biến `open` từ hook useSidebar
  const { open } = useSidebar();

  // 3. Sử dụng component icon đã import đúng
  const items = [
    { url: '#', name: 'Trang chủ', icon: LayoutDashboard },
    { url: '#', name: 'Lịch trình', icon: CalendarFold },
    { url: '#', name: 'Thông tin', icon: Info },
    { url: '#', name: 'Thông báo', icon: Bell },
    { url: '#', name: 'Đăng xuất', icon: LogOut },

  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex  items-center gap-2 rounded-full bg-yellow-400 p-3">
          {/* Sửa lại size-17 thành một class hợp lệ, ví dụ size-10 */}
          <div className="flex-shrink-0 size-17 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="School Bus Logo"
              className="h-full w-full object-cover"
            />
          </div>
          {open && (
            <div className="flex-grow rounded-full bg-white px-4 py-2 text-center font-bold text-gray-800">
              School Bus
            </div>
          )}
        </div>
        
      </SidebarHeader>

      <SidebarContent className="mt-4 display-flex flex-col items-center ">
        <SidebarMenu>
          {items.map((item) => {
            // 4. Gán component icon vào biến viết hoa
            const IconComponent = item.icon;
            return (
              <SidebarMenuItem key={item.name}  className='px-7 my-2'>
                <SidebarMenuButton asChild className=' flex justify-center border rounded-lg hover:bg-yellow-100 '>
                  <a href={item.url} >
                    {/* 5. Render icon như một component JSX */}
                    <IconComponent style={{ width: 24, height: 24 }} />
                    <span className='font-medium text-xl '>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}