import { useState, useEffect, useRef, useMemo } from "react";
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
  Bell as BellIcon,
  CheckCircle,
  XCircle,
  Home,
  Map,
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

// -------------------------------------------------------------------------
// COMPONENT TẢI GOOGLE MAPS SỬ DỤNG JAVASCRIPT THUẦN
// -------------------------------------------------------------------------

/**
 * Hook để tải Google Maps Script
 * Tải script Google Maps trực tiếp vào DOM.
 */
const useGoogleMapsScript = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.onerror = () => setLoadError("Could not load Google Maps script. Check API Key.");
    script.onload = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError("Google Maps script loaded, but 'window.google.maps' is undefined.");
      }
    };
    document.head.appendChild(script);

    return () => {
      // Clean up script
      document.head.removeChild(script);
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

/**
 * Component hiển thị Bản đồ cơ bản.
 */
const MapDisplay = ({ busPosition }) => {
  // Thay thế YOUR_GOOGLE_MAPS_API_KEY bằng khóa API thực tế của bạn
  const apiKey = "AIzaSyAb7xf9sodT1YWTnzrvxz-nbXuWg7vxtOU"; 
  const { isLoaded, loadError } = useGoogleMapsScript(apiKey);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  // markerRefs.current và polylineRef.current không còn được sử dụng nữa

  // Vị trí mặc định (Trung tâm Quận 1, TP.HCM)
  const defaultCenter = useMemo(() => ({ lat: 10.776000, lng: 106.702000 }), []);

  // Hàm khởi tạo bản đồ cơ bản
  useEffect(() => {
    if (!isLoaded || loadError || !mapRef.current) return;

    if (!window.google || !window.google.maps) {
        console.error("Google Maps API is not available.");
        return;
    }

    // Chọn trung tâm bản đồ là vị trí xe buýt hoặc vị trí mặc định
    const mapCenter = busPosition || defaultCenter;

    // 1. Khởi tạo Bản đồ (chỉ lần đầu)
    if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: false,
        });
    }

    const map = mapInstanceRef.current;
    
    // Xóa các Marker và Polyline (không còn cần thiết vì chúng ta đã không vẽ chúng)
    // Dù sao, chúng ta vẫn cần đảm bảo bản đồ tập trung vào vị trí xe buýt nếu nó thay đổi
    
    // Cập nhật vị trí trung tâm bản đồ
    map.setCenter(busPosition);

  }, [isLoaded, loadError, busPosition, defaultCenter]); // Đã loại bỏ studentPickup, routeCoordinates, tripType khỏi dependencies

  if (loadError) return <div className="p-4 text-red-600">Lỗi: {loadError} (Vui lòng kiểm tra khóa API).</div>;
  if (!isLoaded) return <div className="p-4 text-blue-600 flex items-center justify-center h-full"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang tải bản đồ...</div>;


  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
    >
      {/* Bản đồ sẽ được render vào đây */}
    </div>
  );
};
// -------------------------------------------------------------------------

/**
 * Parent dashboard with toggle "Chuyến đi" / "Chuyến về"
 * - includes: 3 top cards, map + stops, schedule (timeline) and notifications
 */

export default function ParentDashboardPage() {
  const [selectedTrip, setSelectedTrip] = useState("go"); // "go" or "return"

  // Tọa độ GPS mẫu cho tuyến đường và vị trí xe (TP.HCM)
  const routeGoCoordinates = [
    { lat: 10.778000, lng: 106.690000 }, 
    { lat: 10.772500, lng: 106.692000 },
    { lat: 10.770000, lng: 106.695000 }, // Điểm đón học sinh (Nam Long)
    { lat: 10.776000, lng: 106.702000 }, 
    { lat: 10.778000, lng: 106.705000 }, // Trường
  ];

  const routeReturnCoordinates = [
    { lat: 10.778000, lng: 106.705000 }, // Trường
    { lat: 10.776000, lng: 106.702000 }, 
    { lat: 10.770000, lng: 106.695000 }, // Điểm trả học sinh (Nam Long)
    { lat: 10.772500, lng: 106.692000 },
    { lat: 10.778000, lng: 106.690000 },
  ];

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
      route: [
        { stop: "Trường Tiểu học Hoa Sen", time: "07:00" },
        { stop: "Cổng chợ An Đông", time: "07:15" },
        { stop: "Khu dân cư Nam Long", time: "07:30" },
      ],
      pickupPoint: "Khu dân cư Nam Long – 07:30", // Cập nhật để khớp với dữ liệu tọa độ mẫu
      schedule: [
        { time: "06:25", event: "Xe đang đến điểm đón", icon: <Bus className="h-4 w-4 text-blue-600" /> },
        { time: "06:33", event: "Bé đã lên xe", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
        { time: "07:10", event: "Đến trường", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
      ],
      notifications: [
        { id: 1, message: "Xe trễ 3 phút (kẹt xe)", time: "06:28", type: "warning" },
        { id: 2, message: "Đã đến trường an toàn", time: "07:12", type: "success" },
      ],
      // Dữ liệu bản đồ
      busPosition: { lat: 10.774500, lng: 106.693500 },
      studentPickup: { lat: 10.770000, lng: 106.695000 },
      routeCoordinates: routeGoCoordinates,
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
      route: [
        { stop: "Trường Tiểu học Hoa Sen", time: "16:15" },
        { stop: "Khu dân cư Nam Long", time: "16:30" },
        { stop: "Cổng chợ An Đông", time: "16:45" },
      ],
      pickupPoint: "Khu dân cư Nam Long – 16:30", // Cập nhật để khớp với dữ liệu tọa độ mẫu
      schedule: [
        { time: "16:15", event: "Xe chuẩn bị tại trường", icon: <Bus className="h-4 w-4 text-orange-500" /> },
        { time: "16:25", event: "Học sinh ra khu vực tập trung", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
        { time: "16:35", event: "Dự kiến khởi hành", icon: <Bus className="h-4 w-4 text-blue-600" /> },
      ],
      notifications: [
        { id: 1, message: "Xe sẵn sàng tại cổng trường", time: "16:20", type: "info" },
        { id: 2, message: "Dự kiến khởi hành trong 10 phút", time: "16:25", type: "warning" },
      ],
      // Dữ liệu bản đồ
      busPosition: { lat: 10.778050, lng: 106.705050 },
      studentPickup: { lat: 10.770000, lng: 106.695000 },
      routeCoordinates: routeReturnCoordinates,
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
      
      {/* Toggle buttons */}
      <div className="flex items-center justify-center gap-3">
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
              {trip.route[0].stop} → {trip.route[trip.route.length - 1].stop}
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

      {/* Map + stops (map wide, stops narrow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MAP COMPONENT */}
        <Card className="md:col-span-2 h-[420px] p-0 overflow-hidden shadow-2xl">
          <MapDisplay 
            busPosition={trip.busPosition} 
            studentPickup={trip.studentPickup} // Vẫn truyền vào nhưng không dùng trong MapDisplay
            routeCoordinates={trip.routeCoordinates} // Vẫn truyền vào nhưng không dùng trong MapDisplay
            tripType={selectedTrip} // Vẫn truyền vào nhưng không dùng trong MapDisplay
          />
        </Card>
        
        

        <Card className="shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Danh sách điểm dừng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.route.map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-1">
                <div className="flex items-center gap-2">
                  {r.stop.includes("Khu dân cư Nam Long") || r.stop.includes("Ngã tư Hàng Xanh")
                    ? <Home className="h-4 w-4 text-blue-600" />
                    : <MapPin className="h-4 w-4 text-gray-500" />
                  }
                  <div className="text-gray-800">{r.stop}</div>
                </div>
                <div className="text-gray-500 text-sm">{r.time}</div>
              </div>
            ))}

            <div className="mt-3">
              <div className="text-sm text-gray-500">Điểm đón/trả của học sinh</div>
              <div className="font-semibold text-gray-900 mt-1">{trip.pickupPoint}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule + Notifications on one row */}
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
              <div className="flex items-center gap-2"><BellIcon className="h-5 w-5" /> Thông báo</div>
              <Button variant="outline" size="sm">Xem tất cả</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trip.notifications.map((n) => (
                <div key={n.id} className="flex items-center gap-3">
                  {n.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {n.type === "warning" && <XCircle className="h-4 w-4 text-yellow-600" />}
                  {n.type === "info" && <BellIcon className="h-4 w-4 text-blue-600" />}

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