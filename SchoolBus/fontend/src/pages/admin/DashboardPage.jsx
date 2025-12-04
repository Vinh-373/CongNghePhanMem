import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Users, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay";

const SOCKET_URL = "http://localhost:5001";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busesData, setBusesData] = useState([]);
  const [socket, setSocket] = useState(null);

  // ⭐ 1. LẤY DỮ LIỆU DASHBOARD LẦN ĐẦU
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${SOCKET_URL}/schoolbus/admin/dashboard-info`);
        setDashboard(res.data.data);
        toast.success("Đã tải dữ liệu dashboard");
      } catch (error) {
        console.error("❌ Lỗi API:", error);
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ⭐ 2. KHỞI TẠO SOCKET CONNECTION
  useEffect(() => {
    console.log("🔌 Đang kết nối Socket.IO Admin...");
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log("✅ Admin Socket đã kết nối với ID:", socketInstance.id);
      toast.success("Kết nối real-time thành công!");
    });

    socketInstance.on('disconnect', () => {
      console.log("❌ Admin Socket đã ngắt kết nối");
      toast.warning("Mất kết nối real-time");
    });

    socketInstance.on('connect_error', (error) => {
      console.error("❌ Lỗi kết nối Socket:", error);
      toast.error("Lỗi kết nối real-time");
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Ngắt kết nối Admin Socket...");
      socketInstance.disconnect();
    };
  }, []);

  // ⭐ 3. LẮNG NGHE SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    // ⭐ A. Nhận vị trí xe real-time từ Driver
    socket.on("vehiclePositionUpdated", (data) => {
      console.log("📍 Admin nhận vị trí xe:", data);
      
      setBusesData((prev) => {
        const index = prev.findIndex(bus => bus.id === data.idxebuyt);
        const newBus = {
          id: data.idxebuyt,
          position: {
            lat: parseFloat(data.vitrixe.vido),
            lng: parseFloat(data.vitrixe.kinhdo)
          },
          label: data.bienso
        };
        
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...newBus };
          return updated;
        } else {
          return [...prev, newBus];
        }
      });
    });

    // ⭐ B. Nhận trạng thái chuyến real-time
    socket.on("tripStatusChanged", (data) => {
      console.log("🚦 Admin nhận trạng thái chuyến:", data);
      
      setDashboard(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          schaeduleTodayData: prev.schaeduleTodayData.map(trip => 
            trip.idlich === data.idlich 
              ? { ...trip, trangthai: data.trangthai }
              : trip
          )
        };
      });
      
      // Hiển thị thông báo
      if (data.trangthai === 1) {
        toast.info(`🚌 Chuyến "${data.tentuyen}" đã bắt đầu`, {
          description: `Xe ${data.bienso} đang trên đường`
        });
      } else if (data.trangthai === 2) {
        toast.success(`✅ Chuyến "${data.tentuyen}" đã hoàn thành`, {
          description: `Xe ${data.bienso} đã về đích`
        });
      }
    });

    // Cleanup listeners
    return () => {
      socket.off("vehiclePositionUpdated");
      socket.off("tripStatusChanged");
    };
  }, [socket]);

  // ⭐ 4. XỬ LÝ TRẠNG THÁI BADGE
  const getStatusBadge = (status) => {
    switch (status) {
      case 1: 
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 animate-pulse">
            🚌 Đang chạy
          </Badge>
        );
      case 3: 
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            ⏰ Trễ
          </Badge>
        );
      case 0: 
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
            ⏳ Chuẩn bị
          </Badge>
        );
      case 2: 
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            ✅ Hoàn thành
          </Badge>
        );
      default: 
        return <Badge variant="outline">❓ Không rõ</Badge>;
    }
  };

  // ⭐ 5. TẠO DỮ LIỆU TUYẾN ĐƯỜNG CHO BẢN ĐỒ
  const mapRoutesData = useMemo(() => {
    if (!dashboard?.schaeduleTodayData) return [];

    const activeSchedules = dashboard.schaeduleTodayData.filter(s => s.trangthai === 1);
    const routeColors = [
      { polyline: "#FF0000", dot: "red" },
      { polyline: "#0000FF", dot: "blue" },
      { polyline: "#00AA00", dot: "green" },
      { polyline: "#FF00FF", dot: "purple" },
      { polyline: "#FFA500", dot: "orange" },
    ];

    return activeSchedules.map((schedule, index) => {
      const stops = (schedule.tuyenDuongInfo?.diemDungDetails || [])
        .map(stop => ({
          lat: parseFloat(stop.vido),
          lng: parseFloat(stop.kinhdo),
          label: stop.tendiemdon
        }))
        .filter(s => !isNaN(s.lat) && !isNaN(s.lng));

      const school = { lat: 10.788229, lng: 106.703970, label: "Trường học" };
      if (schedule.tuyenDuongInfo?.loaituyen === "Đón") stops.push(school);
      if (schedule.tuyenDuongInfo?.loaituyen === "Trả") stops.unshift(school);

      const colors = routeColors[index % routeColors.length];
      return {
        id: schedule.idtuyenduong,
        name: schedule.tuyenDuongInfo?.tentuyen || `Tuyến ${index + 1}`,
        color: colors.polyline,
        dotColor: colors.dot,
        stops
      };
    }).filter(r => r.stops.length > 0);
  }, [dashboard]);

  // ⭐ 6. LẤY VỊ TRÍ XE BAN ĐẦU (Từ Dashboard Data)
  useEffect(() => {
    if (!dashboard?.schaeduleTodayData) return;

    const activeBuses = dashboard.schaeduleTodayData
      .filter(s => s.trangthai === 1)
      .map(s => {
        const vitrixe = s.xebuyt?.vitrixe;
        if (!vitrixe) return null;
        return {
          id: s.idxebuyt,
          routeId: s.idtuyenduong,
          position: { lat: parseFloat(vitrixe.vido), lng: parseFloat(vitrixe.kinhdo) },
          label: `${s.xebuyt?.bienso} - ${s.tuyenDuongInfo?.tentuyen}`
        };
      }).filter(b => b !== null);

    setBusesData(activeBuses);
  }, [dashboard]);

  // ⭐ 7. TÍNH TOÁN THỐNG KÊ
  const allTrips = useMemo(() => dashboard?.schaeduleTodayData || [], [dashboard]);
  const activeTripsCount = useMemo(() => allTrips.filter(t => t.trangthai === 1).length, [allTrips]);
  const completedTripsCount = useMemo(() => allTrips.filter(t => t.trangthai === 2).length, [allTrips]);
  const preparingTripsCount = useMemo(() => allTrips.filter(t => t.trangthai === 0).length, [allTrips]);

  if (loading) return (
    <div className="p-10 min-h-screen flex items-center justify-center">
      <div className="text-xl text-blue-600 animate-pulse">⏳ Đang tải dữ liệu...</div>
    </div>
  );

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" richColors />

      {/* ⭐ DASHBOARD STATS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xe hoạt động</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.vehicleData?.filter(v => v.trangthai === 2).length || 0} / {dashboard?.vehicleData?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (dashboard?.vehicleData?.filter(v => v.trangthai === 2).length /
                 dashboard?.vehicleData?.length) * 100
              )}% xe đang chạy
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.studentCount || 0}</div>
            <p className="text-xs text-muted-foreground">Học sinh đang theo học</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tài xế</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.driverCount || 0}</div>
            <p className="text-xs text-muted-foreground">Tài xế đang làm việc</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chuyến đang chạy</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeTripsCount}</div>
            <p className="text-xs text-muted-foreground">
              Chuẩn bị: {preparingTripsCount} | Hoàn thành: {completedTripsCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ⭐ MAP + TRIP LIST */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg h-[500px] p-0 overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              Bản Đồ Theo Dõi Real-time
              {socket?.connected && (
                <Badge className="bg-green-500 text-white ml-auto animate-pulse">
                  🟢 Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <div className="h-[calc(100%-60px)]" style={{ zIndex: 1 }}>
            <LeafletRoutingMap
              routes={mapRoutesData}
              buses={busesData}
              school={{ lat: 10.788229, lng: 106.703970 }}
              zoom={12}
              className="w-full h-full"
              
            />
          </div>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Chuyến hôm nay ({allTrips.length})
              </span>
              <Button variant="outline" size="sm">Xem tất cả</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[440px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Biển số</TableHead>
                    <TableHead>Tài xế</TableHead>
                    <TableHead>Tuyến</TableHead>
                    <TableHead>Giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTrips.length > 0 ? (
                    allTrips.map((trip, i) => (
                      <TableRow 
                        key={i}
                        className={trip.trangthai === 1 ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium">{trip?.xebuyt?.bienso}</TableCell>
                        <TableCell>{trip?.taixe?.userInfo?.hoten}</TableCell>
                        <TableCell className="text-sm">{trip?.tuyenDuongInfo?.tentuyen}</TableCell>
                        <TableCell>{trip?.giobatdau}</TableCell>
                        <TableCell>{getStatusBadge(trip?.trangthai)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Không có chuyến nào hôm nay
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ⭐ NOTIFICATIONS */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Thông báo gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3 text-sm">
            {activeTripsCount > 0 ? (
              <div className="flex items-center gap-3 text-green-600 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">
                  Hiện có {activeTripsCount} chuyến đang hoạt động trên hệ thống
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString('vi-VN')}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Chưa có chuyến nào đang chạy</span>
              </div>
            )}
            
            {completedTripsCount > 0 && (
              <div className="flex items-center gap-3 text-blue-600 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">
                  Đã hoàn thành {completedTripsCount} chuyến trong ngày hôm nay
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}