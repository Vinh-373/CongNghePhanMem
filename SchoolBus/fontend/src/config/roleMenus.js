import {
  Home, Bus, UserCheck, MapPin, Users, Calendar, MessageCircle, Settings, UsersRound, UserPen,
   CalendarClock, Bell, User, MessageSquare,
} from "lucide-react";

// Mã vai trò dựa trên bảng 'nguoidung' trong schoolbus.sql: 0=Admin, 1=Tài xế, 2=Phụ huynh

/**
 * Menu dành cho Vai trò Admin (vaitro: 0)
 * Quản lý toàn bộ hệ thống và tài nguyên.
 */
export const ADMIN_MENU = [
  { icon: Home, label: "Trang chủ", href: "/admin/schoolbus/dashboard" },
  { icon: Bus, label: "Quản lý xe buýt", href: "/admin/schoolbus/vehicles" },
  { icon: UserCheck, label: "Quản lý tài xế", href: "/admin/schoolbus/drivers" },
  { icon: MapPin, label: "Tuyến đường & điểm dừng", href: "/admin/schoolbus/routes" },
  { icon: Users, label: "Quản lý học sinh", href: "/admin/schoolbus/students" },
  { icon: UsersRound, label: "Quản lý phụ huynh", href: "/admin/schoolbus/parents" },
  { icon: Calendar, label: "Lịch trình chuyến", href: "/admin/schoolbus/schedules" },
  { icon: MessageCircle, label: "Thông báo", href: "/admin/schoolbus/notification" },
  { icon: UserPen, label: "Thông tin tài khoản", href: "/admin/schoolbus/account" },
  { icon: Settings, label: "Cài đặt hệ thống", href: "/admin/schoolbus/settings" },
];

/**
 * Menu dành cho Vai trò Phụ huynh (vaitro: 2)
 * Tập trung vào theo dõi con, lịch trình, và thông báo.
 */
export const PARENT_MENU = [
  { icon: Home, label: "Trang chủ", href: "/parent/schoolbus/dashboard" },
  { icon: User, label: "Hồ sơ Học sinh", href: "/parent/schoolbus/children" },
  { icon: UserPen, label: "Thông tin tài khoản", href: "/parent/schoolbus/account" },
  { icon: Bell, label: "Thông báo", href: "/parent/schoolbus/notifications" },
];

/**
 * Menu dành cho Vai trò Tài xế (vaitro: 1)
 * Tập trung vào lịch trình, thao tác đón/trả và vị trí.
 * Chúng ta sẽ bổ sung chi tiết sau. Hiện tại để đơn giản.
 */
export const DRIVER_MENU = [
  { icon: Home, label: "Trang chủ", href: "/driver/schoolbus/dashboard" },
  { icon: Bus, label: "Chuyến đi hiện tại", href: "/driver/schoolbus/current-trip" },
  { icon: CalendarClock, label: "Lịch trình", href: "/driver/schoolbus/schedule" },
  { icon: User, label: "Thông tin tài khoản", href: "/driver/schoolbus/account" },
];

/**
 * Hàm trả về danh sách menu dựa trên vai trò người dùng.
 * @param {number} role - Mã vai trò (0, 1, 2)
 * @returns {Array<object>} Danh sách menu.
 */
export const getMenuByRole = (role) => {
    switch (role) {
        case 0: // Admin
            // Đã cập nhật href trong menu Admin để bớt prefix schoolbus
            return ADMIN_MENU
        case 1: // Tài xế
            return DRIVER_MENU;
        case 2: // Phụ huynh
            return PARENT_MENU;
        default:
            return []; // Không có menu nếu không xác định
    }
}
