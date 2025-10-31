import MainLayout from "@/components/layout/MainLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Send,
  Users,
  Clock,
  PlusCircle,
  FilePenLine,
  Trash2,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

// === DỮ LIỆU HARD-CODE (MVP1) ===
const notificationData = [
  {
    id: "NOTI001",
    title: "Thông báo lịch nghỉ Lễ Quốc khánh",
    recipient: "Phụ huynh",
    sentTime: "2024-08-30 09:00",
    status: "Đã gửi",
  },
  {
    id: "NOTI002",
    title: "Nhắc nhở bảo dưỡng xe buýt tuyến 2",
    recipient: "Tài xế & Quản lý",
    sentTime: "2024-09-05 14:30",
    status: "Đã gửi",
  },
  {
    id: "NOTI003",
    title: "Cảnh báo chuyến xe sáng bị trễ 15 phút",
    recipient: "Phụ huynh Tuyến Sáng 1",
    sentTime: "Đang chờ gửi",
    status: "Thất bại",
  },
  {
    id: "NOTI004",
    title: "Hướng dẫn sử dụng ứng dụng di động",
    recipient: "Phụ huynh",
    sentTime: "2024-08-20 10:00",
    status: "Đã gửi",
  },
];

export default function NotificationsPage() {


  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã gửi":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã gửi</Badge>;
      case "Thất bại":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Thất bại</Badge>;
      case "Đang chờ gửi":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    totalNotifications: notificationData.length,
    sentNotifications: notificationData.filter((n) => n.status === "Đã gửi").length,
    failedNotifications: notificationData.filter((n) => n.status === "Thất bại").length,
  };

  return (
   
      <div className="space-y-6">
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số Thông báo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Thông báo</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotifications}</div>
              <p className="text-xs text-muted-foreground">thông báo đã được tạo</p>
            </CardContent>
          </Card>

          {/* Đã gửi thành công */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã gửi thành công</CardTitle>
              <Send className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sentNotifications}</div>
              <p className="text-xs text-muted-foreground">thông báo đã đến người nhận</p>
            </CardContent>
          </Card>

          {/* Thất bại */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Thất bại/Lỗi</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedNotifications}</div>
              <p className="text-xs text-muted-foreground">cần xem xét lại</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH THÔNG BÁO === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách Thông báo ({stats.totalNotifications})</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo thông báo mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Đối tượng nhận</TableHead>
                  <TableHead>Thời gian gửi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationData.map((noti) => (
                  <TableRow key={noti.id}>
                    {/* Tiêu đề */}
                    <TableCell className="font-medium max-w-xs truncate">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            {noti.title}
                        </div>
                    </TableCell>

                    {/* Đối tượng nhận */}
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Users className="h-3 w-3 mr-1" />
                        {noti.recipient}
                      </Badge>
                    </TableCell>

                    {/* Thời gian gửi */}
                    <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {noti.sentTime}
                        </div>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>{getStatusBadge(noti.status)}</TableCell>

                    {/* Hành động */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => {
                            // Thay thế alert bằng logic khác hoặc custom modal
                            console.log(`Xem/Sửa thông báo: ${noti.id}`);
                          }}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => {
                            // Thay thế alert bằng logic khác hoặc custom modal
                            console.log(`Xóa thông báo: ${noti.id}`);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  
  );
}
