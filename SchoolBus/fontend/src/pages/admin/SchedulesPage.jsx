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
  CalendarCheck,
  Clock,
  Play,
  StopCircle,
  PlusCircle,
  FilePenLine,
  Trash2,
  BusFront,
  User,
  Route,
} from "lucide-react";

// === DỮ LIỆU HARD-CODE (MVP1) ===
const scheduleData = [
  {
    id: "TRIP001",
    route: "Tuyến Sáng 1",
    type: "Đón học sinh",
    vehicle: "51A-12345",
    driver: "Nguyễn Văn A",
    time: "06:30",
    status: "Đã hoàn thành",
  },
  {
    id: "TRIP002",
    route: "Tuyến Sáng 2",
    type: "Đón học sinh",
    vehicle: "51B-67890",
    driver: "Trần Thị B",
    time: "07:00",
    status: "Đang chạy",
  },
  {
    id: "TRIP003",
    route: "Tuyến Chiều 1",
    type: "Trả học sinh",
    vehicle: "51C-54321",
    driver: "Lê Văn C",
    time: "16:00",
    status: "Chờ khởi hành",
  },
  {
    id: "TRIP004",
    route: "Tuyến Chiều 2",
    type: "Trả học sinh",
    vehicle: "51D-98765",
    driver: "Phạm Thị D",
    time: "16:45",
    status: "Chờ khởi hành",
  },
];

export default function SchedulesPage() {
  

  // Helper để lấy badge màu theo trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã hoàn thành":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "Đang chạy":
        return <Badge className="bg-blue-100 text-blue-800 animate-pulse">Đang chạy</Badge>;
      case "Chờ khởi hành":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ khởi hành</Badge>;
      default:
        return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const stats = {
    totalTripsToday: scheduleData.length,
    completedTrips: scheduleData.filter((s) => s.status === "Đã hoàn thành").length,
    inProgressTrips: scheduleData.filter((s) => s.status === "Đang chạy").length,
  };

  return (
    
      <div className="space-y-6">
        {/* === 1. THẺ TỔNG QUAN === */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Tổng số Chuyến hôm nay */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Chuyến</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTripsToday}</div>
              <p className="text-xs text-muted-foreground">chuyến đã được lên lịch hôm nay</p>
            </CardContent>
          </Card>

          {/* Chuyến đã hoàn thành */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã Hoàn thành</CardTitle>
              <StopCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTrips}</div>
              <p className="text-xs text-muted-foreground">chuyến đã kết thúc thành công</p>
            </CardContent>
          </Card>

          {/* Chuyến đang chạy */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đang Chạy</CardTitle>
              <Play className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTrips}</div>
              <p className="text-xs text-muted-foreground">chuyến đang diễn ra</p>
            </CardContent>
          </Card>
        </div>

        {/* === 2. BẢNG DANH SÁCH LỊCH TRÌNH === */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lịch trình Chuyến đi Hôm nay ({stats.totalTripsToday})</CardTitle>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo lịch trình mới
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã chuyến</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Loại chuyến</TableHead>
                  <TableHead>Giờ khởi hành</TableHead>
                  <TableHead>Xe & Tài xế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((trip) => (
                  <TableRow key={trip.id}>
                    {/* Mã chuyến */}
                    <TableCell className="font-medium">{trip.id}</TableCell>

                    {/* Tuyến đường */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.route}</span>
                      </div>
                    </TableCell>
                    
                    {/* Loại chuyến */}
                    <TableCell>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {trip.type}
                        </Badge>
                    </TableCell>

                    {/* Giờ khởi hành */}
                    <TableCell className="font-bold">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-orange-500" />
                            {trip.time}
                        </div>
                    </TableCell>

                    {/* Xe & Tài xế */}
                    <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                            <BusFront className="h-4 w-4 text-blue-500" />
                            <span className="font-medium mr-2">{trip.vehicle}</span>
                            <User className="h-4 w-4 text-green-500" />
                            <span>{trip.driver}</span>
                        </div>
                    </TableCell>


                    {/* Trạng thái */}
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>

                    {/* Hành động */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-blue-100"
                          onClick={() => {
                            // Thay thế alert bằng logic khác hoặc custom modal
                            console.log(`Cập nhật chuyến: ${trip.id}`);
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
                            console.log(`Hủy chuyến: ${trip.id}`);
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
