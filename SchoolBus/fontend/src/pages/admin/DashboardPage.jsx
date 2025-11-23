import MainLayout from "@/components/layout/MainLayout"; // Giữ lại import này nếu nó được sử dụng bên ngoài component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Users, Calendar, AlertCircle, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import GoogleMapDisplay from "@/components/Map/GoogleMapDisplay";
// === DỮ LIỆU HARD-CODE (MVP1) ===
const stats = {
  vehicles: { active: 28, total: 35 },
  students: { onBoard: 892, change: "+120" },
  trips: { today: 56, delayed: 3 },
  alerts: { count: 2, issues: ["Xe hỏng", "Trễ giờ"] }
};

const todayTrips = [
  { id: 1, plate: "51A-12345", driver: "Nguyễn Văn A", route: "Tuyến Đông", time: "06:30", status: "running", eta: "07:15" },
  { id: 2, plate: "51B-67890", driver: "Trần Thị B", route: "Tuyến Tây", time: "06:45", status: "scheduled", eta: "07:30" },
  { id: 3, plate: "51C-54321", driver: "Lê Văn C", route: "Tuyến Nam", time: "07:00", status: "delayed", eta: "07:50" },
  { id: 4, plate: "51D-98765", driver: "Phạm Thị D", route: "Tuyến Bắc", time: "07:15", status: "completed", eta: "08:00" },
];


export default function DashboardPage() {

  const getStatusBadge = (status) => {
    switch (status) {
      case "running": return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
      case "scheduled": return <Badge variant="secondary">Chưa chạy</Badge>;
      case "delayed": return <Badge className="bg-red-100 text-red-800">Trễ giờ</Badge>;
      case "completed": return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  return (

    <div className="space-y-6 p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Bảng Điều Khiển Hoạt Động</h1>

      {/* === 1. THẺ TỔNG QUAN === */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Xe hoạt động */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xe hoạt động</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicles.active} / {stats.vehicles.total}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.vehicles.active / stats.vehicles.total) * 100)}% xe đang hoạt động
            </p>
          </CardContent>
        </Card>

        {/* Học sinh đang đi */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Học sinh đang đi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students.onBoard}</div>
            <p className="text-xs text-muted-foreground">
              {stats.students.change} so với hôm qua
            </p>
          </CardContent>
        </Card>

        {/* Chuyến hôm nay */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chuyến hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trips.today}</div>
            <p className="text-xs text-muted-foreground">
              {stats.trips.delayed} chuyến bị trễ
            </p>
          </CardContent>
        </Card>

        {/* Cảnh báo */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.alerts.count}</div>
            <p className="text-xs text-muted-foreground">
              {stats.alerts.issues.join(" + ")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === 2. BẢN ĐỒ + BẢNG CHUYẾN === */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bản đồ */}
        <Card className="shadow-lg h-[400px] p-0 overflow-hidden">
          <GoogleMapDisplay
            school={{ lat: 10.788229, lng: 106.703970 }} // trường học cũ
            busStops={[
              { lat: 10.778000, lng: 106.690000, label: "Điểm dừng 43434" },
              { lat: 10.774500, lng: 106.693500 },
              { lat: 10.770000, lng: 106.695000 },
            ]}
            busPosition={{ lat: 10.770, lng: 106.695 }} // xe bus hiện tại (điểm đầu)
            studentPickup={{ lat: 10.770, lng: 106.695 }}
            zoom={15}
          />
        </Card>

        {/* Bảng chuyến hôm nay */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Chuyến hôm nay
              </span>
              <Button variant="outline" size="sm">Xem tất cả</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Tài xế</TableHead>
                  <TableHead>Tuyến</TableHead>
                  <TableHead>Giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.plate}</TableCell>
                    <TableCell>{trip.driver}</TableCell>
                    <TableCell>{trip.route}</TableCell>
                    <TableCell>{trip.time}</TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* === 3. THÔNG BÁO MỚI NHẤT (Placeholder) === */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Thông báo gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Xe 51A-12345 đang đến gần điểm ABC Park</span>
              <span className="text-xs text-muted-foreground ml-auto">07:05</span>
            </div>
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Chuyến #123 bị trễ 10 phút</span>
              <span className="text-xs text-muted-foreground ml-auto">07:02</span>
            </div>
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Tài xế báo hỏng điều hòa – Xe 51B-99999</span>
              <span className="text-xs text-muted-foreground ml-auto">06:55</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
