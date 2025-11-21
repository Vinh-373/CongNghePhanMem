import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bus,
  Clock,
  MapPin,
  Phone,
  Bell,
  CheckCircle,
  XCircle,
  Home,
  Map,
  Calendar, // Icon mới
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import GoogleMapDisplay from "@/components/Map/GoogleMapDisplay";

// --- COMPONENT MỚI: Đồng hồ và Ngày tháng ---
const ClockDisplay = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Cập nhật mỗi giây

    // Xóa interval khi component unmount
    return () => clearInterval(timer);
  }, []);

  // Định dạng ngày tháng
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDateTime.toLocaleDateString('vi-VN', dateOptions);

  // Định dạng thời gian
  const formattedTime = currentDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col items-end text-right text-gray-700">
      <div className="flex items-center text-3xl font-bold text-blue-600 mb-1">
        <Clock className="h-6 w-6 mr-2 text-blue-500" />
        {formattedTime}
      </div>
      <div className="flex items-center text-sm font-medium">
        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
        {formattedDate}
      </div>
    </div>
  );
};
// ---------------------------------------------


export default function ParentDashboardPage() {
  const [selectedTrip, setSelectedTrip] = useState("go");

  // Định nghĩa trường học
  const school = { lat: 10.788233, lng: 106.703972 };

  // --- 1. Danh sách TẤT CẢ các điểm (bao gồm cả điểm đầu và điểm cuối) ---
  const fullRouteGo = [
    { lat: 10.802850, lng: 106.710282, name: "Điểm xuất phát" },
    { lat: 10.799792, lng: 106.711077, name: "Cổng chợ An Đông" },
    { lat: 10.793715, lng: 106.708231, name: "Khu dân cư Nam Long" },
    { lat: 10.790726, lng: 106.705374, name: "Điểm trung gian" },
    { lat: 10.788233, lng: 106.703972, name: "Trường Tiểu học Nguyễn Bỉnh Khiêm" },
  ];

  const fullRouteReturn = [
    { lat: 10.778000, lng: 106.705000, name: "Trường Tiểu học Hoa Sen" },
    { lat: 10.776000, lng: 106.702000, name: "Điểm trung gian" },
    { lat: 10.770000, lng: 106.695000, name: "Khu dân cư Nam Long" },
    { lat: 10.772500, lng: 106.692000, name: "Cổng chợ An Đông" },
    { lat: 10.778000, lng: 106.690000, name: "Điểm cuối" },
  ];

  // --- 2. Trích xuất Waypoints (chỉ các điểm nằm giữa điểm đầu và điểm cuối) ---
  const busStopsGo = fullRouteGo.slice(1, fullRouteGo.length - 1);
  const busStopsReturn = fullRouteReturn.slice(1, fullRouteReturn.length - 1);
  
  // Lấy Tọa độ Điểm đón/trả của học sinh (Khu dân cư Nam Long)
  const studentPickup = { lat: 10.802850, lng:  106.710282 };
  
  // Tọa độ điểm bắt đầu/kết thúc
  const originGo = fullRouteGo[0];
  const destinationReturn = fullRouteReturn[fullRouteReturn.length - 1];

  const tripData = {
    go: {
      student: { name: "Nguyễn Trần Thanh Tú", status: "Trên xe" },
      bus: "79A-12345",
      driver: {
        name: "Nguyễn Văn A",
        phone: "0909123456",
        exp: "5 năm",
        avatar: "https://i.pravatar.cc/100?img=21",
      },
      route: fullRouteGo, // Dùng fullRoute để hiển thị lịch trình
      pickupPoint: "Khu dân cư Nam Long – 07:15",
      schedule: [
        { time: "06:45", event: "Xe xuất phát", icon: <Bus className="h-4 w-4 text-blue-600" /> },
        { time: "07:15", event: "Bé đã lên xe", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
        { time: "07:30", event: "Đến trường", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
      ],
      notifications: [
        { id: 1, message: "Xe đang trên đường đến điểm đón", time: "07:10", type: "info" },
        { id: 2, message: "Đã đến trường an toàn", time: "07:32", type: "success" },
      ],
      busPosition: { lat: 10.802850, lng:  106.710282 }, 
      studentPickup: studentPickup,
      busStops: busStopsGo, 
      origin: originGo,
      destination: school,
    },
    return: {
      student: { name: "Nguyễn Trần Thanh Tú", status: "Chờ xe" },
      bus: "79B-67890",
      driver: {
        name: "Trần Văn B",
        phone: "0911122233",
        exp: "3 năm",
        avatar: "https://i.pravatar.cc/100?img=12",
      },
      route: fullRouteReturn, // Dùng fullRoute để hiển thị lịch trình
      pickupPoint: "Khu dân cư Nam Long – 16:35",
      schedule: [
        { time: "16:15", event: "Xe chuẩn bị tại trường", icon: <Bus className="h-4 w-4 text-orange-500" /> },
        { time: "16:25", event: "Học sinh ra khu vực tập trung", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
        { time: "16:35", event: "Dự kiến đến điểm trả", icon: <Bus className="h-4 w-4 text-blue-600" /> },
      ],
      notifications: [
        { id: 1, message: "Xe sẵn sàng tại cổng trường", time: "16:20", type: "info" },
        { id: 2, message: "Dự kiến khởi hành trong 10 phút", time: "16:25", type: "warning" },
      ],
      busPosition: { lat: 10.802850, lng:  106.710282 }, 
      studentPickup: studentPickup,
      busStops: busStopsReturn,
      origin: school,
      destination: destinationReturn,
    },
  };

  const trip = tripData[selectedTrip];

  const notifBadge = (type) => {
    if (type === "success") return <Badge className="bg-green-100 text-green-800">An toàn</Badge>;
    if (type === "warning") return <Badge className="bg-yellow-100 text-yellow-800">Cảnh báo</Badge>;
    return <Badge variant="secondary">Thông tin</Badge>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter space-y-6">
      
      {/* HEADER: Chứa nút chuyển đổi và Đồng hồ */}
      <div className="flex items-start justify-between">
        {/* Toggle buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setSelectedTrip("go")}
            className={`px-4 py-2 rounded-full font-medium transition flex items-center ${
              selectedTrip === "go"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Map className="inline h-4 w-4 mr-2"/> Chuyến đi
          </button>

          <button
            onClick={() => setSelectedTrip("return")}
            className={`px-4 py-2 rounded-full font-medium transition flex items-center ${
              selectedTrip === "return"
                ? "bg-orange-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Home className="inline h-4 w-4 mr-2"/> Chuyến về
          </button>
        </div>

        {/* CLOCK DISPLAY */}
        <ClockDisplay />
      </div>

      {/* Top 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Student card */}
        <Card className="shadow-md">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái học sinh</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">{trip.student.name}</div>
            <div
              className={`text-sm px-3 py-1 rounded-full ${
                trip.student.status === "Vắng"
                  ? "bg-red-100 text-red-600"
                  : trip.student.status === "Chờ xe"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {trip.student.status}
            </div>
          </CardContent>
        </Card>

        {/* Bus & route */}
        <Card className="shadow-md">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xe & Tuyến</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">{trip.bus}</div>
            <div className="text-sm text-gray-500 mt-1">
              {trip.route[0].name} → {trip.route[trip.route.length - 1].name}
            </div>
          </CardContent>
        </Card>

        {/* Driver */}
        <Card className="shadow-md">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tài xế</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={trip.driver.avatar} alt={trip.driver.name} />
              <AvatarFallback>{trip.driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{trip.driver.name}</div>
              <div className="text-sm text-gray-500">
                <Phone className="inline h-3 w-3 mr-1" /> {trip.driver.phone}
              </div>
              <div className="text-sm text-gray-500">Kinh nghiệm: {trip.driver.exp}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map + stops */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MAP COMPONENT */}
        <Card className="md:col-span-2 h-[420px] p-0 overflow-hidden shadow-2xl">
          <GoogleMapDisplay 
            busPosition={trip.busPosition} 
            studentPickup={trip.studentPickup}
            busStops={trip.busStops}
            school={school} // Trường học
            origin={trip.origin} // Điểm xuất phát (được thêm vào)
            destination={trip.destination} // Điểm kết thúc (được thêm vào)
            zoom={14}
            // Prop apiKey để đảm bảo GoogleMapDisplay nhận key
            apiKey="AIzaSyA_JStH-ku5M_jeUjakhpWBT1m7P6_s-w4" 
          />
        </Card>

        {/* Bus stops list */}
        <Card className="shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Danh sách điểm dừng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.route.map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  {r.name.includes("Trường") 
                    ? <MapPin className="h-4 w-4 text-yellow-600" />
                    : r.name === trip.pickupPoint.split(" – ")[0]
                    ? <Home className="h-4 w-4 text-green-600" />
                    : <MapPin className="h-4 w-4 text-blue-500" />
                  }
                  <div className="text-gray-800 text-sm">{r.name}</div>
                </div>
                <div className="text-gray-500 text-xs font-medium">{trip.route[i].time}</div>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t">
              <div className="text-xs text-gray-500 mb-1">Điểm đón/trả của học sinh</div>
              <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Home className="h-4 w-4 text-green-600" />
                {trip.pickupPoint}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule + Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" /> Lịch trình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Sự kiện</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trip.schedule.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{s.time}</TableCell>
                    <TableCell className="flex items-center gap-2">{s.icon}{s.event}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Bell className="h-5 w-5" /> Thông báo</div>
              <Button variant="outline" size="sm">Xem tất cả</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trip.notifications.map((n) => (
                <div key={n.id} className="flex items-center gap-3">
                  {n.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {n.type === "warning" && <XCircle className="h-4 w-4 text-yellow-600" />}
                  {n.type === "info" && <Bell className="h-4 w-4 text-blue-600" />}

                  <div className="flex-1">
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-muted-foreground">{n.time}</div>
                  </div>

                  <div>{notifBadge(n.type)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}