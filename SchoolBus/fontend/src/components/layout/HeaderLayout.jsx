import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function HeaderLayout({ icon: Icon, pageTitle, notifications = 0, user }) {
  console.log("HeaderLayout user:", user?.avatarUrl);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const roleMap = {
    0: "Admin",
    2: "Parent",
    1: "Driver",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      window.location.href = "/schoolbus/login";
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
      {/* --- Tiêu đề trang --- */}
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-6 w-6 text-gray-700" />}
        <h1 className="text-xl font-semibold text-gray-900 border-b-2 border-orange-400 pb-1">
          {pageTitle}
        </h1>
      </div>

      {/* --- Bên phải: thông báo + user info --- */}
      <div className="ml-auto flex items-center gap-4">
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-6 w-6 text-gray-600" />
          </Button>
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {notifications > 99 ? "99+" : notifications}
            </Badge>
          )}
        </div>
        {/* Thông tin user */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-orange-400">
            <AvatarImage src={`http://localhost:5001${user?.avatarUrl}`} alt={user?.name} />
            <AvatarFallback>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "??"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-right">
            {user?.role !== null && (
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {roleMap[user.role] || "Người dùng"}
              </span>
            )}
            <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
          </div>
        </div>

        {/* Nút Logout */}
        <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Đăng xuất">
              <LogOut className="h-5 w-5 text-red-500 hover:text-red-700" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setOpenLogoutDialog(false)}>
                Hủy
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
