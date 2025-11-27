// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import MainLayout from "@/components/layout/MainLayout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Bus, Users, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
// import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay";

// export default function DashboardPage() {
//   // ==== STATE ====
//   const [dashboard, setDashboard] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ==== GỌI API ====
//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const res = await axios.get("http://localhost:5001/schoolbus/admin/dashboard-info");
//         console.log("📊 Dashboard data:", res.data.data);
//         setDashboard(res.data.data);
//       } catch (error) {
//         console.error("Lỗi API:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   // ==== XỬ LÝ STATUS CHUYẾN ====
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 1: return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
//       case 3: return <Badge variant="bg-red-100 text-red-800">Trễ</Badge>;
//       case 0: return <Badge className="bg-amber-300 text-amber-900">Chuẩn bị</Badge>;
//       case 2: return <Badge className="bg-green-400 text-green-900">Hoàn thành</Badge>;
//       default: return <Badge variant="outline">Không rõ</Badge>;
//     }
//   };

//   // ==== MÀU SẮC CHO TỪNG TUYẾN ====
//   const routeColors = [
//     { polyline: "#FF0000", dot: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
//     { polyline: "#0000FF", dot: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
//     { polyline: "#00AA00", dot: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" },
//     { polyline: "#FF00FF", dot: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png" },
//     { polyline: "#FFA500", dot: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png" },
//   ];

//   // ==== CHUẨN BỊ DỮ LIỆU CHO MAP - CHỈ LẤY TUYẾN CÓ trangthai === 1 ====
//   const mapRoutesData = useMemo(() => {
//     if (!dashboard?.schaeduleTodayData) return [];

//     // Lọc chỉ lấy các chuyến có trangthai === 1
//     const activeSchedules = dashboard.schaeduleTodayData.filter(
//       schedule => schedule.trangthai === 1
//     );

//     console.log("🚦 Active schedules (trangthai === 1):", activeSchedules);

//     return activeSchedules.map((schedule, index) => {
//       const diemDungDetails = schedule?.tuyenDuongInfo?.diemDungDetails || [];
      
//       // Chuyển đổi điểm dừng
//       const stops = diemDungDetails
//         .map((stop) => ({
//           lat: parseFloat(stop.vido),
//           lng: parseFloat(stop.kinhdo),
//           label: stop.tendiemdon || "",
//         }))
//         .filter(stop => !isNaN(stop.lat) && !isNaN(stop.lng));

//       console.log(`🗺️ Route ${index} - ${schedule.tuyenDuongInfo?.tentuyen}:`, stops);

//       // Lấy màu sắc
//       const colors = routeColors[index % routeColors.length];

//       return {
//         id: schedule.idtuyenduong,
//         name: schedule.tuyenDuongInfo?.tentuyen || `Tuyến ${index + 1}`,
//         color: colors.polyline,
//         dotColor: colors.dot,
//         stops: stops,
//       };
//     }).filter(route => route.stops.length > 0); // Chỉ giữ lại route có điểm dừng

//   }, [dashboard]);

//   // ==== CHUẨN BỊ DỮ LIỆU XE BUÝT - TÁCH RIÊNG ====
//   const busesData = useMemo(() => {
//     if (!dashboard?.schaeduleTodayData) return [];

//     // Lọc chỉ lấy các chuyến có trangthai === 1
//     const activeSchedules = dashboard.schaeduleTodayData.filter(
//       schedule => schedule.trangthai === 1
//     );

//     console.log("🚌 Processing buses data:", activeSchedules);

//     return activeSchedules.map((schedule) => {
//       // Ưu tiên lấy vị trí xe từ vitrixe (GPS thực tế)
//       const vitrixe = schedule?.xebuyt?.vitrixe;
      
//       if (!vitrixe || !vitrixe.kinhdo || !vitrixe.vido) {
//         console.warn(`⚠️ Xe ${schedule.xebuyt?.bienso} không có vị trí GPS`);
//         return null;
//       }

//       const busData = {
//         id: schedule.idxebuyt,
//         routeId: schedule.idtuyenduong,
//         position: {
//           lat: parseFloat(vitrixe.vido),
//           lng: parseFloat(vitrixe.kinhdo),
//         },
//         label: `${schedule.xebuyt?.bienso || 'Xe'} - ${schedule.tuyenDuongInfo?.tentuyen || ''}`,
//       };

//       console.log(`✅ Bus ${busData.id} - ${busData.label}:`, busData.position);
//       return busData;
//     }).filter(bus => bus !== null);

//   }, [dashboard]);

//   // ==== LỌC CHUYẾN CHO BẢNG - Hiển thị tất cả ====
//   const allTrips = useMemo(() => {
//     if (!dashboard?.schaeduleTodayData) return [];
//     return dashboard.schaeduleTodayData;
//   }, [dashboard]);

//   // ==== ĐẾM CHUYẾN ĐANG CHẠY ====
//   const activeTripsCount = useMemo(() => {
//     if (!dashboard?.schaeduleTodayData) return 0;
//     return dashboard.schaeduleTodayData.filter(trip => trip.trangthai === 1).length;
//   }, [dashboard]);

//   if (loading) return <p className="p-6">⏳ Đang tải dữ liệu...</p>;

//   return (
//     <div className="space-y-6 bg-gray-50 min-h-screen">
//       {/* ==== THẺ THỐNG KÊ ==== */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         {/* Xe hoạt động */}
//         <Card className="shadow-md">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Xe hoạt động</CardTitle>
//             <Bus className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {
//                 dashboard?.vehicleData?.filter((v) => v.trangthai === 2).length || 0
//               } / {dashboard?.vehicleData?.length || 0}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {
//                 Math.round(
//                   (dashboard?.vehicleData?.filter((v) => v.trangthai === 2).length /
//                     dashboard?.vehicleData?.length) * 100
//                 )
//               }% xe đang chạy
//             </p>
//           </CardContent>
//         </Card>

//         {/* Tổng học sinh */}
//         <Card className="shadow-md">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Tổng Học sinh</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dashboard?.studentCount || 0}</div>
//           </CardContent>
//         </Card>

//         {/* Tổng tài xế */}
//         <Card className="shadow-md">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Tổng Tài xế</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{dashboard?.driverCount || 0}</div>
//           </CardContent>
//         </Card>

//         {/* Chuyến đang chạy */}
//         <Card className="shadow-md">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Chuyến đang chạy</CardTitle>
//             <AlertCircle className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">{activeTripsCount}</div>
//             <p className="text-xs text-muted-foreground">Chuyến có trạng thái "Đang chạy"</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ==== BẢN ĐỒ + BẢNG TODAY TRIP ==== */}
//       <div className="grid gap-6 lg:grid-cols-2">
//         {/* Bản đồ - Hiển thị tất cả tuyến có trangthai === 1 */}
//         <Card className="shadow-lg h-[400px] p-0 overflow-hidden">
//           <GoogleMapDisplay
//             routes={mapRoutesData}
//             buses={busesData}
//             school={{ lat: 10.788229, lng: 106.703970 }}
//             zoom={12}
//             className="w-full h-full"
//           />
//         </Card>

//         {/* Bảng chuyến hôm nay - Hiển thị tất cả */}
//         <Card className="shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <span className="flex items-center gap-2">
//                 <Clock className="h-5 w-5" />
//                 Chuyến hôm nay ({allTrips.length})
//               </span>
//               <Button variant="outline" size="sm">Xem tất cả</Button>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Biển số</TableHead>
//                   <TableHead>Tài xế</TableHead>
//                   <TableHead>Tuyến</TableHead>
//                   <TableHead>Giờ</TableHead>
//                   <TableHead>Trạng thái</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {allTrips.length > 0 ? (
//                   allTrips.map((trip, i) => (
//                     <TableRow key={i}>
//                       <TableCell className="font-medium">{trip?.xebuyt?.bienso}</TableCell>
//                       <TableCell>{trip?.taixe?.userInfo?.hoten}</TableCell>
//                       <TableCell className="text-sm">{trip?.tuyenDuongInfo?.tentuyen}</TableCell>
//                       <TableCell>{trip?.giobatdau}</TableCell>
//                       <TableCell>{getStatusBadge(trip?.trangthai)}</TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={5} className="text-center text-muted-foreground">
//                       Không có chuyến nào hôm nay
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ==== THÔNG BÁO ==== */}
//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle>Thông báo gần đây</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3 text-sm">
//             <div className="flex items-center gap-3 text-green-600">
//               <CheckCircle className="h-4 w-4" />
//               <span>Xe 51A-12345 đang đến gần điểm ABC Park</span>
//               <span className="text-xs text-muted-foreground ml-auto">07:05</span>
//             </div>
//             <div className="flex items-center gap-3 text-red-600">
//               <XCircle className="h-4 w-4" />
//               <span>Chuyến #123 bị trễ 10 phút</span>
//               <span className="text-xs text-muted-foreground ml-auto">07:02</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Users, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import LeafletRoutingMap from "@/components/Map/GoogleMapDisplay"; // <-- Thay bằng Leaflet

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:5001/schoolbus/admin/dashboard-info");
        setDashboard(res.data.data);
      } catch (error) {
        console.error("Lỗi API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <Badge className="bg-green-100 text-green-800">Đang chạy</Badge>;
      case 3: return <Badge className="bg-red-100 text-red-800">Trễ</Badge>;
      case 0: return <Badge className="bg-amber-300 text-amber-900">Chuẩn bị</Badge>;
      case 2: return <Badge className="bg-green-400 text-green-900">Hoàn thành</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const routeColors = [
    { polyline: "#FF0000", dot: "red" },
    { polyline: "#0000FF", dot: "blue" },
    { polyline: "#00AA00", dot: "green" },
    { polyline: "#FF00FF", dot: "purple" },
    { polyline: "#FFA500", dot: "orange" },
  ];

  const mapRoutesData = useMemo(() => {
  if (!dashboard?.schaeduleTodayData) return [];

  const activeSchedules = dashboard.schaeduleTodayData.filter(
    schedule => schedule.trangthai === 1
  );

  return activeSchedules.map((schedule, index) => {
    const diemDungDetails = schedule?.tuyenDuongInfo?.diemDungDetails || [];
    
    // Chuyển đổi điểm dừng
    let stops = diemDungDetails
      .map((stop) => ({
        lat: parseFloat(stop.vido),
        lng: parseFloat(stop.kinhdo),
        label: stop.tendiemdon || "",
      }))
      .filter(stop => !isNaN(stop.lat) && !isNaN(stop.lng));

    // Xác định loại chuyến: đón hay trả
    const isPickUp = schedule?.tuyenDuongInfo?.loaituyen === "Đón"; // giả sử API có trường này
    const isDropOff = schedule?.tuyenDuongInfo?.loaituyen === "Trả"; 
    const school={ lat: 10.788229, lng: 106.703970 }
    // Thêm điểm trường
    if (school) {
      const schoolStop = { ...school, label: "Trường học" };

      if (isPickUp) {
        // Đón: trường là điểm cuối
        stops.push(schoolStop);
      } else if (isDropOff) {
        // Trả: trường là điểm đầu
        stops.unshift(schoolStop);
      }
    }

    const colors = routeColors[index % routeColors.length];

    return {
      id: schedule.idtuyenduong,
      name: schedule.tuyenDuongInfo?.tentuyen || `Tuyến ${index + 1}`,
      color: colors.polyline,
      dotColor: colors.dot,
      stops: stops,
    };
  }).filter(route => route.stops.length > 0);
}, [dashboard]);


  const busesData = useMemo(() => {
    if (!dashboard?.schaeduleTodayData) return [];

    const activeSchedules = dashboard.schaeduleTodayData.filter(
      schedule => schedule.trangthai === 1
    );

    return activeSchedules.map((schedule) => {
      const vitrixe = schedule?.xebuyt?.vitrixe;
      if (!vitrixe || !vitrixe.kinhdo || !vitrixe.vido) return null;

      return {
        id: schedule.idxebuyt,
        routeId: schedule.idtuyenduong,
        position: {
          lat: parseFloat(vitrixe.vido),
          lng: parseFloat(vitrixe.kinhdo),
        },
        label: `${schedule.xebuyt?.bienso || 'Xe'} - ${schedule.tuyenDuongInfo?.tentuyen || ''}`,
      };
    }).filter(bus => bus !== null);
  }, [dashboard]);

  const allTrips = useMemo(() => dashboard?.schaeduleTodayData || [], [dashboard]);

  const activeTripsCount = useMemo(() => {
    if (!dashboard?.schaeduleTodayData) return 0;
    return dashboard.schaeduleTodayData.filter(trip => trip.trangthai === 1).length;
  }, [dashboard]);

  if (loading) return <p className="p-6">⏳ Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xe hoạt động</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.vehicleData?.filter((v) => v.trangthai === 2).length || 0} / {dashboard?.vehicleData?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (dashboard?.vehicleData?.filter((v) => v.trangthai === 2).length /
                dashboard?.vehicleData?.length) * 100
              )}% xe đang chạy
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Học sinh</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.studentCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tài xế</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.driverCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chuyến đang chạy</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeTripsCount}</div>
            <p className="text-xs text-muted-foreground">Chuyến có trạng thái "Đang chạy"</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg h-[400px] p-0 overflow-hidden">
          <LeafletRoutingMap
            routes={mapRoutesData}
            buses={busesData}
            school={{ lat: 10.788229, lng: 106.703970 }}
            zoom={12}
            className="w-full h-full"
          />
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Chuyến hôm nay ({allTrips.length})
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
                {allTrips.length > 0 ? (
                  allTrips.map((trip, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{trip?.xebuyt?.bienso}</TableCell>
                      <TableCell>{trip?.taixe?.userInfo?.hoten}</TableCell>
                      <TableCell className="text-sm">{trip?.tuyenDuongInfo?.tentuyen}</TableCell>
                      <TableCell>{trip?.giobatdau}</TableCell>
                      <TableCell>{getStatusBadge(trip?.trangthai)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Không có chuyến nào hôm nay
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
